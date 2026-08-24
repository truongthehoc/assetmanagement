const db = require('../config/db');

// Get list of asset statuses with counts
async function getTrangThaiList(req, res) {
    try {
        const rows = await db.query(`
            SELECT t.*, COUNT(a.id) as total_assets
            FROM trang_thai_tai_san t
            LEFT JOIN assets a ON a.status COLLATE utf8mb4_unicode_ci = t.code COLLATE utf8mb4_unicode_ci
            GROUP BY t.id
            ORDER BY t.id ASC
        `);
        return res.json(rows);
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
}

// Create custom status if needed
async function createTrangThai(req, res) {
    try {
        const { code, name, description, colorBadge } = req.body;
        if (!code || !name) {
            return res.status(400).json({ error: 'Mã và Tên trạng thái là bắt buộc.' });
        }

        const result = await db.query(
            'INSERT INTO trang_thai_tai_san (code, name, description, color_badge) VALUES (?, ?, ?, ?)',
            [code, name, description || '', colorBadge || 'blue']
        );
        return res.status(201).json({ id: result.insertId, code, name, description, colorBadge });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
}

// Update status details
async function updateTrangThai(req, res) {
    try {
        const { id } = req.params;
        const { code, name, description, colorBadge } = req.body;
        await db.query(
            'UPDATE trang_thai_tai_san SET code = ?, name = ?, description = ?, color_badge = ? WHERE id = ?',
            [code, name, description || '', colorBadge || 'blue', id]
        );
        return res.json({ status: 'success', message: 'Đã cập nhật trạng thái tài sản.' });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
}

// Delete status
async function deleteTrangThai(req, res) {
    try {
        const { id } = req.params;
        await db.query('DELETE FROM trang_thai_tai_san WHERE id = ?', [id]);
        return res.json({ status: 'success', message: 'Đã xóa trạng thái tài sản.' });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
}

module.exports = {
    getTrangThaiList,
    createTrangThai,
    updateTrangThai,
    deleteTrangThai
};
