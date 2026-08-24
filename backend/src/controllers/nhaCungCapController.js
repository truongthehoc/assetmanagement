const db = require('../config/db');

// List all Suppliers (Nhà Cung Cấp)
async function getNhaCungCap(req, res) {
    try {
        const rows = await db.query('SELECT * FROM nha_cung_cap ORDER BY name ASC');
        return res.json(rows);
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
}

// Create new Supplier
async function createNhaCungCap(req, res) {
    try {
        const { code, name, contact_person, phone, email, address, notes } = req.body;
        if (!name) {
            return res.status(400).json({ error: 'Tên nhà cung cấp là bắt buộc.' });
        }

        const autoCode = code || `NCC-${Date.now().toString().slice(-4)}`;

        const result = await db.query(
            `INSERT INTO nha_cung_cap (code, name, contact_person, phone, email, address, notes) 
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [autoCode, name, contact_person || '', phone || '', email || '', address || '', notes || '']
        );

        return res.status(201).json({
            id: result.insertId,
            code: autoCode,
            name,
            contact_person,
            phone,
            email,
            address,
            notes
        });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
}

// Update Supplier
async function updateNhaCungCap(req, res) {
    try {
        const { id } = req.params;
        const { code, name, contact_person, phone, email, address, notes } = req.body;

        await db.query(
            `UPDATE nha_cung_cap 
             SET code = ?, name = ?, contact_person = ?, phone = ?, email = ?, address = ?, notes = ? 
             WHERE id = ?`,
            [code, name, contact_person || '', phone || '', email || '', address || '', notes || '', id]
        );

        return res.json({ status: 'success', message: 'Đã cập nhật thông tin nhà cung cấp.' });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
}

// Delete Supplier
async function deleteNhaCungCap(req, res) {
    try {
        const { id } = req.params;
        await db.query('DELETE FROM nha_cung_cap WHERE id = ?', [id]);
        return res.json({ status: 'success', message: 'Đã xóa nhà cung cấp.' });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
}

module.exports = {
    getNhaCungCap,
    createNhaCungCap,
    updateNhaCungCap,
    deleteNhaCungCap
};
