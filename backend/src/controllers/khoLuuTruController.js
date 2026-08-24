const db = require('../config/db');

// List all warehouses joined with department
async function getKhoLuuTru(req, res) {
    try {
        const { search } = req.query;
        let sql = `
            SELECT k.*, p.name as phong_name, p.code as phong_code
            FROM kho_luu_tru k
            LEFT JOIN phong p ON k.phong_id = p.id
            WHERE 1=1
        `;
        const params = [];

        if (search) {
            sql += ` AND (k.code LIKE ? OR k.name LIKE ? OR k.manager_name LIKE ? OR p.name LIKE ?)`;
            const term = `%${search}%`;
            params.push(term, term, term, term);
        }

        sql += ` ORDER BY k.updated_at DESC`;
        const rows = await db.query(sql, params);
        return res.json(rows);
    } catch (err) {
        console.error('Error fetching warehouses:', err);
        return res.status(500).json({ error: err.message });
    }
}

// Create new warehouse
async function createKhoLuuTru(req, res) {
    try {
        const { code, name, phongId, locationAddress, managerName, phone, notes } = req.body;

        if (!name) {
            return res.status(400).json({ error: 'Tên kho lưu trữ là bắt buộc' });
        }

        const finalCode = code || `KHO-${Date.now().toString().slice(-4)}`;

        const sql = `
            INSERT INTO kho_luu_tru (code, name, phong_id, location_address, manager_name, phone, notes)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `;
        const params = [
            finalCode,
            name,
            phongId ? parseInt(phongId, 10) : null,
            locationAddress || null,
            managerName || null,
            phone || null,
            notes || null
        ];

        const result = await db.query(sql, params);
        return res.json({ status: 'success', message: 'Tạo kho lưu trữ thành công', id: result.insertId || result[0]?.insertId });
    } catch (err) {
        console.error('Error creating warehouse:', err);
        return res.status(500).json({ error: err.message });
    }
}

// Update warehouse
async function updateKhoLuuTru(req, res) {
    try {
        const { id } = req.params;
        const { code, name, phongId, locationAddress, managerName, phone, notes } = req.body;

        if (!name) {
            return res.status(400).json({ error: 'Tên kho lưu trữ là bắt buộc' });
        }

        const sql = `
            UPDATE kho_luu_tru
            SET code = ?, name = ?, phong_id = ?, location_address = ?, manager_name = ?, phone = ?, notes = ?
            WHERE id = ?
        `;
        const params = [
            code,
            name,
            phongId ? parseInt(phongId, 10) : null,
            locationAddress || null,
            managerName || null,
            phone || null,
            notes || null,
            id
        ];

        await db.query(sql, params);
        return res.json({ status: 'success', message: 'Cập nhật kho lưu trữ thành công' });
    } catch (err) {
        console.error('Error updating warehouse:', err);
        return res.status(500).json({ error: err.message });
    }
}

// Delete warehouse
async function deleteKhoLuuTru(req, res) {
    try {
        const { id } = req.params;
        await db.query('DELETE FROM kho_luu_tru WHERE id = ?', [id]);
        return res.json({ status: 'success', message: 'Đã xóa kho lưu trữ' });
    } catch (err) {
        console.error('Error deleting warehouse:', err);
        return res.status(500).json({ error: err.message });
    }
}

module.exports = {
    getKhoLuuTru,
    createKhoLuuTru,
    updateKhoLuuTru,
    deleteKhoLuuTru
};
