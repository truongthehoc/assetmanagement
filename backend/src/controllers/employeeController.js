const db = require('../config/db');

async function getEmployees(req, res) {
    try {
        const rows = await db.query(`
            SELECT nv.*, 
                   p.name as phong_name, p.code as phong_code, p.location_address,
                   k.id as khoa_id, k.name as khoa_name, k.code as khoa_code
            FROM nhan_vien nv
            LEFT JOIN phong p ON nv.phong_id = p.id
            LEFT JOIN khoa k ON p.khoa_id = k.id
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
        if (!employeeId || !fullName) {
            return res.status(400).json({ error: 'Mã nhân viên và Họ và tên là bắt buộc.' });
        }

        const pId = (phongId && parseInt(phongId, 10) > 0) ? parseInt(phongId, 10) : null;

        const insertRes = await db.query(
            `INSERT INTO nhan_vien (employee_id, full_name, email, phone, phong_id, position, status) 
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [employeeId.trim(), fullName.trim(), email || null, phone || null, pId, position || null, status || 'ACTIVE']
        );

        return res.json({
            status: 'success',
            message: `Đã thêm nhân viên '${fullName}' (${employeeId})`,
            id: insertRes.insertId
        });
    } catch (err) {
        if (err.code === 'ER_DUP_ENTRY' || (err.message && err.message.includes('Duplicate entry'))) {
            return res.status(400).json({ error: `Mã nhân viên '${req.body.employeeId || ''}' đã tồn tại trong hệ thống. Vui lòng nhập mã khác!` });
        }
        return res.status(500).json({ error: err.message });
    }
}

async function updateEmployee(req, res) {
    try {
        const { id } = req.params;
        const { employeeId, fullName, email, phone, phongId, position, status } = req.body;

        if (!employeeId || !fullName) {
            return res.status(400).json({ error: 'Mã nhân viên và Họ và tên là bắt buộc.' });
        }

        const pId = (phongId && parseInt(phongId, 10) > 0) ? parseInt(phongId, 10) : null;

        await db.query(
            `UPDATE nhan_vien 
             SET employee_id = ?, full_name = ?, email = ?, phone = ?, phong_id = ?, position = ?, status = ? 
             WHERE id = ?`,
            [employeeId.trim(), fullName.trim(), email || null, phone || null, pId, position || null, status || 'ACTIVE', id]
        );

        return res.json({ status: 'success', message: 'Đã cập nhật thông tin nhân viên.' });
    } catch (err) {
        if (err.code === 'ER_DUP_ENTRY' || (err.message && err.message.includes('Duplicate entry'))) {
            return res.status(400).json({ error: `Mã nhân viên '${req.body.employeeId || ''}' đã tồn tại trong hệ thống. Vui lòng nhập mã khác!` });
        }
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
        if (err.code === 'ER_ROW_IS_REFERENCED' || err.code === 'ER_ROW_IS_REFERENCED_2' || (err.message && err.message.includes('foreign key constraint'))) {
            return res.status(400).json({ error: 'Không thể xóa nhân viên này vì đang được gán phân bổ tài sản trong hệ thống.' });
        }
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
