const db = require('../config/db');

// Get maintenance schedule list
async function getSchedules(req, res) {
    try {
        const sql = `
            SELECT m.*, a.asset_tag, a.hostname, a.asset_type, 
                   d.name as department_name, u.full_name as user_name
            FROM maintenance_schedules m
            JOIN assets a ON m.asset_id = a.id
            LEFT JOIN departments d ON a.department_id = d.id
            LEFT JOIN users u ON a.user_id = u.id
            ORDER BY m.next_due ASC
        `;
        const rows = await db.query(sql);
        return res.json(rows);
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
}

// Create periodic maintenance task (e.g. 6-month cleaning)
async function createSchedule(req, res) {
    try {
        const { assetId, taskName, frequencyMonths, nextDue, notes } = req.body;

        if (!assetId || !taskName || !nextDue) {
            return res.status(400).json({ error: 'Missing required assetId, taskName or nextDue date' });
        }

        await db.query(
            `INSERT INTO maintenance_schedules 
                (asset_id, task_name, frequency_months, next_due, status, notes)
             VALUES (?, ?, ?, ?, 'PENDING', ?)`,
            [assetId, taskName, frequencyMonths || 6, nextDue, notes || '']
        );

        return res.json({ status: 'success', message: 'Lịch bảo trì đã được khởi tạo thành công.' });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
}

// Complete maintenance task and auto-schedule next round
async function completeSchedule(req, res) {
    try {
        const { id } = req.params;
        const { notes } = req.body;

        const taskRows = await db.query('SELECT * FROM maintenance_schedules WHERE id = ?', [id]);
        if (taskRows.length === 0) {
            return res.status(404).json({ error: 'Maintenance task not found' });
        }

        const task = taskRows[0];
        const today = new Date().toISOString().split('T')[0];

        // Calculate next due date (e.g. + 6 months)
        const nextDate = new Date();
        nextDate.setMonth(nextDate.getMonth() + (task.frequency_months || 6));
        const nextDueStr = nextDate.toISOString().split('T')[0];

        // Mark completed
        await db.query(
            `UPDATE maintenance_schedules SET 
                status = 'COMPLETED',
                last_performed = ?,
                notes = ?
             WHERE id = ?`,
            [today, notes || task.notes, id]
        );

        // Auto schedule next cycle
        await db.query(
            `INSERT INTO maintenance_schedules 
                (asset_id, task_name, frequency_months, last_performed, next_due, status, notes)
             VALUES (?, ?, ?, ?, ?, 'PENDING', 'Chu kỳ bảo trì tiếp theo')`,
            [task.asset_id, task.task_name, task.frequency_months, today, nextDueStr]
        );

        return res.json({ status: 'success', message: 'Đã xác nhận hoàn thành bảo trì và đặt lịch cho chu kỳ tiếp theo.' });

    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
}

module.exports = {
    getSchedules,
    createSchedule,
    completeSchedule
};
