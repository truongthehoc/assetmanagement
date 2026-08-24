const db = require('../config/db');

// List all Asset Types (Loại tài sản)
async function getLoaiTaiSan(req, res) {
    try {
        const rows = await db.query('SELECT * FROM loai_tai_san ORDER BY code ASC');
        return res.json(rows);
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
}

// Create new Asset Type
async function createLoaiTaiSan(req, res) {
    try {
        const { code, name, description } = req.body;
        if (!code || !name) {
            return res.status(400).json({ error: 'Mã và Tên loại tài sản là bắt buộc.' });
        }

        const result = await db.query(
            'INSERT INTO loai_tai_san (code, name, description) VALUES (?, ?, ?)',
            [code, name, description || '']
        );
        return res.status(201).json({ id: result.insertId, code, name, description });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
}

// Update Asset Type
async function updateLoaiTaiSan(req, res) {
    try {
        const { id } = req.params;
        const { code, name, description } = req.body;
        await db.query(
            'UPDATE loai_tai_san SET code = ?, name = ?, description = ? WHERE id = ?',
            [code, name, description || '', id]
        );
        return res.json({ status: 'success', message: 'Đã cập nhật loại tài sản.' });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
}

// Delete Asset Type
async function deleteLoaiTaiSan(req, res) {
    try {
        const { id } = req.params;
        await db.query('DELETE FROM loai_tai_san WHERE id = ?', [id]);
        return res.json({ status: 'success', message: 'Đã xóa loại tài sản.' });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
}

module.exports = {
    getLoaiTaiSan,
    createLoaiTaiSan,
    updateLoaiTaiSan,
    deleteLoaiTaiSan
};
