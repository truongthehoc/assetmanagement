const db = require('../config/db');

async function resetDatabase() {
    console.log('--- PURGING ALL MOCK DATA FROM MYSQL DATABASE ---');
    await db.initDB();

    try {
        // Truncate/Clear all transactional tables
        await db.query('DELETE FROM audit_items');
        await db.query('DELETE FROM inventory_audits');
        await db.query('DELETE FROM maintenance_schedules');
        await db.query('DELETE FROM lifecycle_logs');
        await db.query('DELETE FROM drift_alerts');
        await db.query('DELETE FROM assets');
        await db.query('DELETE FROM devices_pending');

        console.log('✓ All mock assets, pending discovery queue, drift alerts, and lifecycle logs purged from MySQL!');
    } catch (err) {
        console.error('Error clearing MySQL tables:', err);
    }
}

resetDatabase().then(() => process.exit(0));
