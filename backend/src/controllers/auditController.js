const db = require('../config/db');

// Verify scanned QR code against actual asset location and user
async function scanAudit(req, res) {
    try {
        const { qrCode, scannedLocationId, scannedUserId, auditId } = req.body;

        if (!qrCode) {
            return res.status(400).json({ error: 'Quét mã QR/Barcode không hợp lệ' });
        }

        const assets = await db.query(
            `SELECT a.*, 
                    d.name as department_name,
                    l.building as location_building, l.floor as location_floor, l.room as location_room,
                    u.full_name as user_name
             FROM assets a
             LEFT JOIN departments d ON a.department_id = d.id
             LEFT JOIN locations l ON a.location_id = l.id
             LEFT JOIN users u ON a.user_id = u.id
             WHERE a.qr_code = ? OR a.asset_tag = ?`,
            [qrCode, qrCode]
        );

        if (assets.length === 0) {
            return res.status(404).json({
                found: false,
                message: `Mã QR '${qrCode}' không tồn tại trong hệ thống tài sản!`
            });
        }

        const asset = assets[0];
        
        // Match checks
        const isLocationMatched = scannedLocationId ? (parseInt(scannedLocationId, 10) === asset.location_id) : true;
        const isUserMatched = scannedUserId ? (parseInt(scannedUserId, 10) === asset.user_id) : true;

        // Log scan item to audit campaign if auditId provided
        if (auditId) {
            await db.query(
                `INSERT INTO audit_items (audit_id, asset_id, scanned_location_id, scanned_user_id, is_location_matched, is_user_matched)
                 VALUES (?, ?, ?, ?, ?, ?)`,
                [auditId, asset.id, scannedLocationId || null, scannedUserId || null, isLocationMatched ? 1 : 0, isUserMatched ? 1 : 0]
            );

            // Increment count
            await db.query(
                `UPDATE inventory_audits SET total_scanned = total_scanned + 1 WHERE id = ?`,
                [auditId]
            );
        }

        return res.json({
            found: true,
            asset: asset,
            verification: {
                isLocationMatched,
                isUserMatched,
                expectedLocation: asset.location_room ? `${asset.location_building} - ${asset.location_floor} (${asset.location_room})` : 'Chưa gán',
                expectedUser: asset.user_name || 'Chưa gán'
            }
        });

    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
}

// Get Dashboard Statistics KPI
async function getDashboardStats(req, res) {
    try {
        const totalAssets = await db.query('SELECT COUNT(*) as cnt FROM assets');
        const inUseAssets = await db.query("SELECT COUNT(*) as cnt FROM assets WHERE status = 'IN_USE'");
        const pendingDevices = await db.query("SELECT COUNT(*) as cnt FROM devices_pending WHERE status = 'PENDING'");
        const activeDrifts = await db.query('SELECT COUNT(*) as cnt FROM drift_alerts WHERE is_resolved = 0');
        const overdueMaintenance = await db.query("SELECT COUNT(*) as cnt FROM maintenance_schedules WHERE status = 'OVERDUE'");

        const statusBreakdown = await db.query('SELECT status, COUNT(*) as count FROM assets GROUP BY status');

        return res.json({
            totalAssets: totalAssets[0].cnt,
            inUseAssets: inUseAssets[0].cnt,
            pendingDevices: pendingDevices[0].cnt,
            activeDrifts: activeDrifts[0].cnt,
            overdueMaintenance: overdueMaintenance[0].cnt,
            statusBreakdown: statusBreakdown
        });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
}

module.exports = {
    scanAudit,
    getDashboardStats
};
