const db = require('../config/db');

// Get lifecycle logs for all assets or specific asset
async function getLogs(req, res) {
    try {
        const { assetId } = req.query;
        let sql = `
            SELECT l.*, a.asset_tag, a.hostname,
                   nv1.full_name as from_user_name,
                   nv2.full_name as to_user_name
            FROM lifecycle_logs l
            JOIN assets a ON l.asset_id = a.id
            LEFT JOIN nhan_vien nv1 ON l.from_user_id = nv1.id
            LEFT JOIN nhan_vien nv2 ON l.to_user_id = nv2.id
            WHERE 1=1
        `;
        const params = [];
        if (assetId) {
            sql += ` AND l.asset_id = ?`;
            params.push(assetId);
        }
        sql += ` ORDER BY l.created_at DESC`;

        const rows = await db.query(sql, params);
        return res.json(rows);
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
}

// Transfer asset / Update lifecycle status (NEW, READY, IN_USE, MAINTENANCE, DISPOSING, DISPOSED)
async function transferAsset(req, res) {
    try {
        const { assetId, action, toUserId, toDepartmentId, toLocationId, newStatus, notes, performedBy, signature } = req.body;

        if (!assetId) {
            return res.status(400).json({ error: 'Missing required assetId' });
        }

        const assets = await db.query('SELECT * FROM assets WHERE id = ?', [assetId]);
        if (assets.length === 0) {
            return res.status(404).json({ error: 'Asset not found' });
        }

        const asset = assets[0];
        const fromUserId = asset.user_id;
        const fromStatus = asset.status;

        // Auto map action to status if newStatus not specified
        let targetStatus = newStatus;
        if (!targetStatus) {
            if (action === 'REVOKE') targetStatus = 'READY';
            else if (action === 'MAINTENANCE') targetStatus = 'MAINTENANCE';
            else if (action === 'DISPOSING') targetStatus = 'DISPOSING';
            else if (action === 'DISPOSED') targetStatus = 'DISPOSED';
            else targetStatus = 'IN_USE'; // Default TRANSFER
        }

        // Update asset: Save previous_status before changing status
        await db.query(
            `UPDATE assets SET 
                previous_status = ?,
                status = ?,
                user_id = ?,
                department_id = COALESCE(?, department_id),
                location_id = COALESCE(?, location_id),
                updated_at = CURRENT_TIMESTAMP
             WHERE id = ?`,
            [fromStatus, targetStatus, (action === 'REVOKE' ? null : (toUserId || null)), toDepartmentId || null, toLocationId || null, assetId]
        );

        // Record Lifecycle log
        await db.query(
            `INSERT INTO lifecycle_logs 
                (asset_id, action, from_user_id, to_user_id, from_status, to_status, notes, performed_by, document_signature)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                assetId,
                action || 'HANDOVER',
                fromUserId,
                toUserId || null,
                fromStatus,
                targetStatus,
                notes || 'Bàn giao luân chuyển tài sản',
                performedBy || 'IT Admin',
                signature || ''
            ]
        );

        return res.json({
            status: 'success',
            message: `Tài sản ${asset.asset_tag} đã chuyển trạng thái thành '${targetStatus}' thành công.`
        });

    } catch (err) {
        console.error('Error in transferAsset:', err);
        return res.status(500).json({ error: err.message });
    }
}

module.exports = {
    getLogs,
    transferAsset
};
