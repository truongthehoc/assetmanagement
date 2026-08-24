const db = require('../config/db');

async function getEmployees(req, res) {
    try {
        const rows = await db.query(`
            SELECT nv.*, 
                   p.name as phong_name, p.code as phong_code, p.location_address,
                   k.id as khoa_id, k.name as khoa_name, k.code as khoa_code
            FROM nhan_vien nv
            JOIN phong p ON nv.phong_id = p.id
            JOIN khoa k ON p.khoa_id = k.id
            ORDER BY nv.employee_id ASC
        `);
        return res.json(rows);
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
}

async function createEmployee(req, res) {
    try {
        const { employeeId, fullName, email, phone, phongId, position, status } = req.body;
        if (!employeeId || !fullName || !phongId) {
            return res.status(400).json({ error: 'Mã nhân viên, Họ tên và Phòng ban trực thuộc là bắt buộc.' });
        }

        const insertRes = await db.query(
            `INSERT INTO nhan_vien (employee_id, full_name, email, phone, phong_id, position, status) 
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [employeeId, fullName, email || null, phone || null, parseInt(phongId, 10), position || null, status || 'ACTIVE']
        );

        return res.json({
            status: 'success',
            message: `Đã thêm nhân viên '${fullName}' (${employeeId})`,
            id: insertRes.insertId
        });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
}

async function updateEmployee(req, res) {
    try {
        const { id } = req.params;
        const { employeeId, fullName, email, phone, phongId, position, status } = req.body;

        await db.query(
            `UPDATE nhan_vien 
             SET employee_id = ?, full_name = ?, email = ?, phone = ?, phong_id = ?, position = ?, status = ? 
             WHERE id = ?`,
            [employeeId, fullName, email || null, phone || null, parseInt(phongId, 10), position || null, status || 'ACTIVE', id]
        );

        return res.json({ status: 'success', message: 'Đã cập nhật thông tin nhân viên.' });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
}

async function toggleStatus(req, res) {
    try {
        const { id } = req.params;
        const { status } = req.body;

        await db.query(`UPDATE nhan_vien SET status = ? WHERE id = ?`, [status, id]);
        return res.json({ status: 'success', message: `Đã chuyển trạng thái nhân viên thành '${status === 'ACTIVE' ? 'Hoạt động' : 'Ngưng'}'` });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
}

async function deleteEmployee(req, res) {
    try {
        const { id } = req.params;
        await db.query('DELETE FROM nhan_vien WHERE id = ?', [id]);
        return res.json({ status: 'success', message: 'Đã xóa nhân viên.' });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
}

module.exports = {
    getEmployees,
    createEmployee,
    updateEmployee,
    toggleStatus,
    deleteEmployee
};
