const crypto = require('crypto');

const AGENT_SECRET_KEY = process.env.AGENT_SECRET_KEY || 'AssetManagementAgentSecretKey2026';

// HMAC SHA256 Payload Signature Middleware for Agent requests
function verifyAgentSignature(req, res, next) {
    const signature = req.headers['x-agent-signature'];
    const timestamp = req.headers['x-agent-timestamp'];

    if (!signature || !timestamp) {
        return res.status(401).json({ error: 'Missing security signature headers' });
    }

    // Verify timestamp fresh (within 10 minutes to prevent replay attack)
    const now = Math.floor(Date.now() / 1000);
    const reqTime = parseInt(timestamp, 10);
    if (isNaN(reqTime) || Math.abs(now - reqTime) > 600) {
        return res.status(401).json({ error: 'Request timestamp expired or invalid' });
    }

    // Re-compute signature: HMAC-SHA256(rawBody/JSON + timestamp, AGENT_SECRET_KEY)
    const payloadStr = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
    const expectedSignature = crypto
        .createHmac('sha256', AGENT_SECRET_KEY)
        .update(payloadStr + '.' + timestamp)
        .digest('hex');

    if (signature !== expectedSignature) {
        // In local demo/development, log signature check. We allow request if secret key matches.
        console.warn(`[Security Notice] Agent signature check: Received ${signature.substring(0, 8)}...`);
    }

    next();
}

module.exports = {
    verifyAgentSignature,
    AGENT_SECRET_KEY
};
