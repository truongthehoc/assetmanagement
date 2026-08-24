const db = require('../config/db');

// Get list of configuration drift alerts
async function getAlerts(req, res) {
    try {
        const { isResolved } = req.query;
        let sql = `
            SELECT d.*, a.asset_tag, a.hostname, a.asset_type, u.full_name as user_name
            FROM drift_alerts d
            JOIN assets a ON d.asset_id = a.id
            LEFT JOIN users u ON a.user_id = u.id
            WHERE 1=1
        `;
        const params = [];

        if (isResolved !== undefined) {
            sql += ` AND d.is_resolved = ?`;
            params.push(isResolved === 'true' || isResolved === '1' ? 1 : 0);
        }

        sql += ` ORDER BY d.created_at DESC`;
        const rows = await db.query(sql, params);
        return res.json(rows);

    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
}

// Resolve a drift alert
async function resolveAlert(req, res) {
    try {
        const { id } = req.params;
        const { resolvedBy, updateBaseline } = req.body;

        const alertRows = await db.query('SELECT * FROM drift_alerts WHERE id = ?', [id]);
        if (alertRows.length === 0) {
            return res.status(404).json({ error: 'Drift alert not found' });
        }

        const alert = alertRows[0];

        // Mark resolved
        await db.query(
            `UPDATE drift_alerts SET 
                is_resolved = 1, 
                resolved_by = ?, 
                resolved_at = CURRENT_TIMESTAMP 
             WHERE id = ?`,
            [resolvedBy || 'IT Admin', id]
        );

        // Optional: Update baseline snapshot to accept new hardware/software state as normal
        if (updateBaseline) {
            const assetRows = await db.query('SELECT current_snapshot FROM assets WHERE id = ?', [alert.asset_id]);
            if (assetRows.length > 0 && assetRows[0].current_snapshot) {
                await db.query(
                    'UPDATE assets SET baseline_snapshot = current_snapshot WHERE id = ?',
                    [alert.asset_id]
                );
            }
        }

        return res.json({ status: 'success', message: 'Cảnh báo đã được đánh dấu xử lý.' });

    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
}

module.exports = {
    getAlerts,
    resolveAlert
};
