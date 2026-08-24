const db = require('../config/db');

/**
 * Compare current hardware/software report against asset baseline snapshot
 * and automatically raise drift alerts in DB if deviations are found.
 */
async function inspectAndLogDrift(assetId, baselineObj, currentReport) {
    if (!baselineObj) return;

    try {
        const baseline = typeof baselineObj === 'string' ? JSON.parse(baselineObj) : baselineObj;
        const currentHardware = currentReport.hardware || {};
        const currentSoftware = currentReport.software || [];

        // 1. RAM Drift Check
        const baselineRam = baseline.ramGb || baseline.ramTotalGb || 0;
        const currentRam = currentHardware.ram ? (currentHardware.ram.totalGb || currentHardware.ram.total_gb || 0) : 0;

        if (baselineRam > 0 && currentRam > 0 && baselineRam !== currentRam) {
            const isDecreased = currentRam < baselineRam;
            const title = isDecreased 
                ? `Biến động RAM: Tháo bớt thanh RAM (${baselineRam}GB -> ${currentRam}GB)` 
                : `Biến động RAM: Cắm thêm RAM mới (${baselineRam}GB -> ${currentRam}GB)`;

            const details = `Dung lượng RAM thực tế (${currentRam}GB) khác biệt so với Baseline đã phê duyệt (${baselineRam}GB).`;
            const severity = isDecreased ? 'HIGH' : 'MEDIUM';

            await createAlertIfNotExist(assetId, 'RAM_CHANGED', severity, title, details);
        }

        // 2. Disk Drift Check
        const baselineDisks = baseline.disks || [];
        const currentDisks = currentHardware.disks || [];

        if (baselineDisks.length > 0 && currentDisks.length < baselineDisks.length) {
            const title = `Biến động Ổ cứng: Phát hiện tháo bớt ổ cứng`;
            const details = `Số lượng ổ cứng hiện tại (${currentDisks.length}) ít hơn so với cấu hình Baseline (${baselineDisks.length}).`;
            await createAlertIfNotExist(assetId, 'DISK_REMOVED', 'CRITICAL', title, details);
        }

        // 3. Unauthorized Software Check
        const baselineSwNames = (baseline.software || []).map(s => (typeof s === 'string' ? s : s.name).toLowerCase());
        const whitelistNames = ['windows', 'microsoft', 'driver', 'intel', 'nvidia', 'realtek', 'google chrome', '7-zip', 'visual studio', 'adobe', 'office', 'zoom', 'docker'];

        for (const sw of currentSoftware) {
            const swName = (sw.name || '').trim();
            if (!swName) continue;
            const lowerName = swName.toLowerCase();

            // Check if software is not in baseline and not in whitelist
            const isKnown = baselineSwNames.some(b => lowerName.includes(b)) || 
                            whitelistNames.some(w => lowerName.includes(w));

            if (!isKnown) {
                // Rogue software detected
                const title = `Phát hiện phần mềm không thuộc danh mục: ${swName}`;
                const details = `Phần mềm '${swName}' (Phiên bản: ${sw.version || 'Unknown'}) cài đặt vào máy nhưng không nằm trong danh sách Baseline hoặc Whitelist cho phép.`;
                await createAlertIfNotExist(assetId, 'UNAUTHORIZED_SOFTWARE', 'MEDIUM', title, details);
            }
        }

    } catch (err) {
        console.error('Drift engine inspection error:', err);
    }
}

async function createAlertIfNotExist(assetId, alertType, severity, title, details) {
    // Check if unresolved alert of same type already exists for this asset
    const existing = await db.query(
        'SELECT id FROM drift_alerts WHERE asset_id = ? AND alert_type = ? AND is_resolved = 0',
        [assetId, alertType]
    );

    if (existing.length === 0) {
        await db.query(
            `INSERT INTO drift_alerts (asset_id, alert_type, severity, title, details, is_resolved) 
             VALUES (?, ?, ?, ?, ?, 0)`,
            [assetId, alertType, severity, title, details]
        );
        console.log(`[Drift Alert Triggered] Asset #${assetId} - ${title}`);
    }
}

module.exports = {
    inspectAndLogDrift
};
