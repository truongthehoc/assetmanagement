const db = require('../config/db');

async function getChucDanhList(req, res) {
    try {
        const rows = await db.query(`
            SELECT cd.*, COUNT(nv.id) as total_employees
            FROM chuc_danh cd
            LEFT JOIN nhan_vien nv ON nv.position = cd.name OR nv.position = cd.code
            GROUP BY cd.id
            ORDER BY cd.name ASC
        `);
        return res.json(rows);
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
}

async function createChucDanh(req, res) {
    try {
        const { code, name, description } = req.body;
        if (!code || !name) {
            return res.status(400).json({ error: 'Mã Chức Danh và Tên Chức Danh / Chức Vụ là bắt buộc.' });
        }

        const insertRes = await db.query(
            `INSERT INTO chuc_danh (code, name, description) VALUES (?, ?, ?)`,
            [code, name, description || null]
        );

        return res.json({
            status: 'success',
            message: `Đã thêm mới Chức Danh '${name}' (${code})`,
            id: insertRes.insertId
        });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
}

async function updateChucDanh(req, res) {
    try {
        const { id } = req.params;
        const { code, name, description } = req.body;

        await db.query(
            `UPDATE chuc_danh SET code = ?, name = ?, description = ? WHERE id = ?`,
            [code, name, description || null, id]
        );

        return res.json({ status: 'success', message: 'Đã cập nhật thông tin Chức Danh / Chức Vụ.' });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
}

async function deleteChucDanh(req, res) {
    try {
        const { id } = req.params;
        await db.query('DELETE FROM chuc_danh WHERE id = ?', [id]);
        return res.json({ status: 'success', message: 'Đã xóa Chức Danh / Chức Vụ.' });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
}

module.exports = {
    getChucDanhList,
    createChucDanh,
    updateChucDanh,
    deleteChucDanh
};
