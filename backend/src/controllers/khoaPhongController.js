const db = require('../config/db');

// --- KHOA CRUD ---
async function getKhoaList(req, res) {
    try {
        const rows = await db.query(`
            SELECT k.*, COUNT(p.id) as total_phong
            FROM khoa k
            LEFT JOIN phong p ON k.id = p.khoa_id
            GROUP BY k.id
            ORDER BY k.name ASC
        `);
        return res.json(rows);
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
}

async function createKhoa(req, res) {
    try {
        const { code, name, managerName, description } = req.body;
        if (!code || !name) {
            return res.status(400).json({ error: 'Mã Khoa và Tên Khoa là bắt buộc.' });
        }

        const insertRes = await db.query(
            `INSERT INTO khoa (code, name, manager_name, description) VALUES (?, ?, ?, ?)`,
            [code, name, managerName || null, description || null]
        );

        return res.json({
            status: 'success',
            message: `Đã thêm mới Khoa '${name}' (${code})`,
            id: insertRes.insertId
        });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
}

async function updateKhoa(req, res) {
    try {
        const { id } = req.params;
        const { code, name, managerName, description } = req.body;

        await db.query(
            `UPDATE khoa SET code = ?, name = ?, manager_name = ?, description = ? WHERE id = ?`,
            [code, name, managerName || null, description || null, id]
        );

        return res.json({ status: 'success', message: 'Đã cập nhật thông tin Khoa.' });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
}

async function deleteKhoa(req, res) {
    try {
        const { id } = req.params;
        await db.query('DELETE FROM khoa WHERE id = ?', [id]);
        return res.json({ status: 'success', message: 'Đã xóa Khoa.' });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
}


// --- PHÒNG CRUD ---
async function getPhongList(req, res) {
    try {
        const rows = await db.query(`
            SELECT p.*, k.name as khoa_name, k.code as khoa_code
            FROM phong p
            JOIN khoa k ON p.khoa_id = k.id
            ORDER BY k.name ASC, p.name ASC
        `);
        return res.json(rows);
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
}

async function createPhong(req, res) {
    try {
        const { code, name, khoaId, locationAddress, managerName } = req.body;
        if (!code || !name || !khoaId || !locationAddress) {
            return res.status(400).json({ error: 'Mã Phòng, Tên Phòng, Khoa trực thuộc và Vị Trí là bắt buộc.' });
        }

        const insertRes = await db.query(
            `INSERT INTO phong (code, name, khoa_id, location_address, manager_name) VALUES (?, ?, ?, ?, ?)`,
            [code, name, parseInt(khoaId, 10), locationAddress, managerName || null]
        );

        return res.json({
            status: 'success',
            message: `Đã thêm mới Phòng '${name}' (${code})`,
            id: insertRes.insertId
        });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
}

async function updatePhong(req, res) {
    try {
        const { id } = req.params;
        const { code, name, khoaId, locationAddress, managerName } = req.body;

        await db.query(
            `UPDATE phong SET code = ?, name = ?, khoa_id = ?, location_address = ?, manager_name = ? WHERE id = ?`,
            [code, name, parseInt(khoaId, 10), locationAddress, managerName || null, id]
        );

        return res.json({ status: 'success', message: 'Đã cập nhật thông tin Phòng.' });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
}

async function deletePhong(req, res) {
    try {
        const { id } = req.params;
        await db.query('DELETE FROM phong WHERE id = ?', [id]);
        return res.json({ status: 'success', message: 'Đã xóa Phòng.' });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
}

module.exports = {
    getKhoaList,
    createKhoa,
    updateKhoa,
    deleteKhoa,
    getPhongList,
    createPhong,
    updatePhong,
    deletePhong
};
