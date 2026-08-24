const db = require('../config/db');

// List official assets with filtering
async function getAssets(req, res) {
    try {
        const { status, type, departmentId, search } = req.query;
        let sql = `
            SELECT a.*, 
                   k.name as department_name, k.code as department_code, k.name as khoa_name,
                   p.name as room_name, p.code as room_code, p.location_address, p.name as phong_name,
                   IFNULL(k.name, k2.name) as location_building,
                   nv.full_name as user_name, nv.employee_id as user_employee_id
            FROM assets a
            LEFT JOIN khoa k ON a.department_id = k.id
            LEFT JOIN phong p ON a.location_id = p.id
            LEFT JOIN khoa k2 ON p.khoa_id = k2.id
            LEFT JOIN nhan_vien nv ON a.user_id = nv.id
            WHERE 1=1
        `;
        const params = [];

        if (status) {
            sql += ` AND a.status = ?`;
            params.push(status);
        }
        if (type) {
            sql += ` AND a.asset_type = ?`;
            params.push(type);
        }
        if (departmentId) {
            sql += ` AND a.department_id = ?`;
            params.push(departmentId);
        }
        if (search) {
            sql += ` AND (a.asset_tag LIKE ? OR a.hostname LIKE ? OR a.serial_number LIKE ? OR nv.full_name LIKE ?)`;
            const term = `%${search}%`;
            params.push(term, term, term, term);
        }

        sql += ` ORDER BY a.updated_at DESC`;
        const rows = await db.query(sql, params);
        return res.json(rows);

    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
}

// Get single asset details with baseline and current snapshots
async function getAssetById(req, res) {
    try {
        const { id } = req.params;
        const sql = `
            SELECT a.*, 
                   k.name as department_name, k.code as department_code, k.name as khoa_name,
                   p.name as room_name, p.code as room_code, p.location_address, p.name as phong_name,
                   IFNULL(k.name, k2.name) as location_building,
                   nv.full_name as user_name, nv.email as user_email, nv.employee_id as user_employee_id
            FROM assets a
            LEFT JOIN khoa k ON a.department_id = k.id
            LEFT JOIN phong p ON a.location_id = p.id
            LEFT JOIN khoa k2 ON p.khoa_id = k2.id
            LEFT JOIN nhan_vien nv ON a.user_id = nv.id
            WHERE a.id = ?
        `;
        const rows = await db.query(sql, [id]);
        if (rows.length === 0) {
            return res.status(404).json({ error: 'Asset not found' });
        }

        const asset = rows[0];
        
        // Fetch drift alerts
        const alerts = await db.query('SELECT * FROM drift_alerts WHERE asset_id = ? ORDER BY created_at DESC', [id]);
        
        // Fetch lifecycle logs with nhan_vien names
        const logs = await db.query(`
            SELECT l.*, nv1.full_name as from_user_name, nv2.full_name as to_user_name
            FROM lifecycle_logs l
            LEFT JOIN nhan_vien nv1 ON l.from_user_id = nv1.id
            LEFT JOIN nhan_vien nv2 ON l.to_user_id = nv2.id
            WHERE l.asset_id = ? ORDER BY l.created_at DESC
        `, [id]);

        return res.json({
            ...asset,
            drift_alerts: alerts,
            lifecycle_logs: logs
        });

    } catch (err) {
        console.error('Error fetching asset details:', err);
        return res.status(500).json({ error: err.message });
    }
}

// Update asset status, procurement, financial & PO attachment info
async function updateProcurement(req, res) {
    try {
        const { id } = req.params;
        const { 
            assetTag,
            hostname,
            assetType,
            status, 
            purchaseDate, 
            purchaseCost, 
            depreciationMonths, 
            vendorSupplier, 
            warrantyExpirationDate, 
            poDocumentUrl,
            departmentId,
            locationId,
            userId,
            notes,
            actionType 
        } = req.body;

        const currentAssetRows = await db.query('SELECT * FROM assets WHERE id = ?', [id]);
        if (currentAssetRows.length === 0) {
            return res.status(404).json({ error: 'Asset not found' });
        }
        const currentAsset = currentAssetRows[0];
        const oldStatus = currentAsset.status;

        let sql = `UPDATE assets SET updated_at = CURRENT_TIMESTAMP`;
        const params = [];

        if (assetTag !== undefined) {
            sql += `, asset_tag = ?`;
            params.push(assetTag);
        }
        if (hostname !== undefined) {
            sql += `, hostname = ?`;
            params.push(hostname);
        }
        if (assetType !== undefined) {
            sql += `, asset_type = ?`;
            params.push(assetType);
        }
        if (status) {
            sql += `, status = ?`;
            params.push(status);
        }
        if (departmentId !== undefined) {
            sql += `, department_id = ?`;
            params.push(departmentId ? parseInt(departmentId, 10) : null);
        }
        if (locationId !== undefined) {
            sql += `, location_id = ?`;
            params.push(locationId ? parseInt(locationId, 10) : null);
        }
        if (userId !== undefined) {
            sql += `, user_id = ?`;
            params.push(userId ? parseInt(userId, 10) : null);
        }
        if (purchaseDate !== undefined) {
            sql += `, purchase_date = ?`;
            params.push(purchaseDate || null);
        }
        if (purchaseCost !== undefined) {
            sql += `, purchase_cost = ?`;
            params.push(purchaseCost ? parseFloat(purchaseCost) : 0);
        }
        if (depreciationMonths !== undefined) {
            sql += `, depreciation_months = ?`;
            params.push(depreciationMonths ? parseInt(depreciationMonths, 10) : 36);
        }
        if (vendorSupplier !== undefined) {
            sql += `, vendor_supplier = ?`;
            params.push(vendorSupplier || null);
        }
        if (warrantyExpirationDate !== undefined) {
            sql += `, warranty_expiration_date = ?`;
            params.push(warrantyExpirationDate || null);
        }
        if (poDocumentUrl !== undefined) {
            sql += `, po_document_url = ?`;
            params.push(poDocumentUrl || null);
        }
        if (notes !== undefined) {
            sql += `, notes = ?`;
            params.push(notes || null);
        }

        if (status && status !== oldStatus) {
            sql += `, previous_status = ?`;
            params.push(oldStatus);

            await db.query(
                `INSERT INTO lifecycle_logs 
                    (asset_id, action, from_user_id, to_user_id, from_status, to_status, notes, performed_by)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    id,
                    actionType || 'STATUS_CHANGE',
                    currentAsset.user_id,
                    userId || currentAsset.user_id,
                    oldStatus,
                    status,
                    notes || `Thay đổi trạng thái từ '${oldStatus}' sang '${status}'`,
                    'IT Admin'
                ]
            );
        }

        sql += ` WHERE id = ?`;
        params.push(id);

        await db.query(sql, params);

        return res.json({ status: 'success', message: 'Đã cập nhật thông tin mua sắm & trạng thái tài sản.' });
    } catch (err) {
        console.error('Error updating procurement info:', err);
        return res.status(500).json({ error: err.message });
    }
}

// Get metadata options dynamically from REAL nhan_vien, phong & khoa tables
async function getMetadata(req, res) {
    try {
        const khoaList = await db.query('SELECT id, name, code FROM khoa ORDER BY name ASC');
        const phongList = await db.query(`
            SELECT p.id, p.code, p.name as room, p.location_address, p.khoa_id, k.name as building 
            FROM phong p 
            JOIN khoa k ON p.khoa_id = k.id 
            ORDER BY k.name ASC, p.name ASC
        `);
        const users = await db.query(`
            SELECT nv.id, nv.employee_id, nv.full_name, nv.email, nv.phone, nv.position, nv.status, nv.phong_id, p.name as phong_name, k.name as khoa_name
            FROM nhan_vien nv
            LEFT JOIN phong p ON nv.phong_id = p.id
            LEFT JOIN khoa k ON p.khoa_id = k.id
            WHERE nv.status = 'ACTIVE'
            ORDER BY nv.full_name ASC
        `);
        const suppliers = await db.query('SELECT id, code, name FROM nha_cung_cap ORDER BY name ASC');
        const assetTypes = await db.query('SELECT id, code, name FROM loai_tai_san ORDER BY name ASC');

        return res.json({
            departments: khoaList,
            locations: phongList,
            users: users,
            suppliers: suppliers,
            assetTypes: assetTypes
        });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
}

// Create a new manual asset for devices without agent telemetry (Printer, Switch, Monitor, etc.)
async function createManualAsset(req, res) {
    try {
        const {
            assetTag,
            hostname,
            assetType,
            serialNumber,
            ipAddress,
            osInfo,
            ramTotalGb,
            diskTotalGb,
            cpuModel,
            departmentId,
            userId,
            locationId,
            warehouseId,
            warehouseName,
            status,
            purchaseDate,
            purchaseCost,
            depreciationMonths,
            vendorSupplier,
            warrantyExpirationDate,
            poDocumentUrl,
            notes
        } = req.body;

        if (!hostname) {
            return res.status(400).json({ error: 'Tên máy / thiết bị là bắt buộc' });
        }

        let finalNotes = notes || null;
        if (warehouseName) {
            finalNotes = `[Kho lưu trữ: ${warehouseName}] ${notes || ''}`.trim();
        }

        let finalAssetTag = assetTag;
        if (!finalAssetTag) {
            const countRows = await db.query('SELECT COUNT(*) as cnt FROM assets');
            const cnt = (countRows[0]?.cnt || 0) + 1;
            finalAssetTag = `1000${36038 + cnt}`;
        }

        const initialStatus = status || 'READY';

        const sql = `
            INSERT INTO assets 
                (asset_tag, hostname, asset_type, serial_number, ip_address, os_info,
                 ram_total_gb, disk_total_gb, cpu_model, department_id, user_id, location_id,
                 status, purchase_date, purchase_cost, depreciation_months, vendor_supplier,
                 warranty_expiration_date, po_document_url, notes, qr_code)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        const params = [
            finalAssetTag,
            hostname,
            assetType || 'Máy In / Scanner / Photo',
            serialNumber || null,
            ipAddress || null,
            osInfo || null,
            ramTotalGb ? parseFloat(ramTotalGb) : null,
            diskTotalGb ? parseFloat(diskTotalGb) : null,
            cpuModel || null,
            departmentId || null,
            userId || null,
            locationId || null,
            initialStatus,
            purchaseDate || null,
            purchaseCost ? parseFloat(purchaseCost) : 0,
            depreciationMonths ? parseInt(depreciationMonths, 10) : 36,
            vendorSupplier || null,
            warrantyExpirationDate || null,
            poDocumentUrl || null,
            finalNotes,
            finalAssetTag
        ];

        const result = await db.query(sql, params);
        const newAssetId = result.insertId || result[0]?.insertId;

        // Add lifecycle log entry
        await db.query(
            `INSERT INTO lifecycle_logs 
                (asset_id, action, from_user_id, to_user_id, from_status, to_status, notes, performed_by)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                newAssetId,
                'MANUAL_CREATE',
                null,
                userId || null,
                'NEW',
                initialStatus,
                notes || 'Khởi tạo tài sản thủ công từ giao diện IT AssetGuard',
                'IT Admin'
            ]
        );

        return res.json({
            status: 'success',
            message: 'Đã tạo tài sản thủ công thành công!',
            assetId: newAssetId,
            assetTag: finalAssetTag
        });
    } catch (err) {
        console.error('Error creating manual asset:', err);
        return res.status(500).json({ error: err.message });
    }
}

module.exports = {
    getAssets,
    getAssetById,
    createManualAsset,
    updateProcurement,
    getMetadata
};
