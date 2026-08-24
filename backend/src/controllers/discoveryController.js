const db = require('../config/db');
const networkScanner = require('../services/networkScanner');

// Get list of pending devices in discovery queue
async function getPendingDevices(req, res) {
    try {
        const rows = await db.query("SELECT * FROM devices_pending WHERE status = 'PENDING' ORDER BY last_seen DESC");
        return res.json(rows);
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
}

// Get local server network subnets for IP Range Scanning
async function getSubnets(req, res) {
    try {
        const subnets = networkScanner.getLocalSubnets();
        return res.json(subnets);
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
}

// Perform active Agentless Subnet IP Range Scan (Printers, Scanners, Switches, Cameras)
async function scanNetworkSubnet(req, res) {
    try {
        const { startIp, endIp, ports, autoSave = true } = req.body;

        // Default range if not provided
        let targetStart = startIp;
        let targetEnd = endIp;

        if (!targetStart || !targetEnd) {
            const subnets = networkScanner.getLocalSubnets();
            targetStart = subnets[0].startIp;
            targetEnd = subnets[0].endIp;
        }

        const portsToScan = Array.isArray(ports) && ports.length > 0
            ? ports
            : [9100, 515, 631, 80, 443, 8080, 22, 23, 554];

        const scanResult = await networkScanner.scanSubnetRange(targetStart, targetEnd, portsToScan);
        const discovered = scanResult.discoveredDevices;

        // Save newly discovered agentless devices to devices_pending queue
        if (autoSave && discovered.length > 0) {
            for (const dev of discovered) {
                // Check if device already exists in pending by agent_id or ip_address
                const existing = await db.query(
                    "SELECT id FROM devices_pending WHERE agent_id = ? OR ip_address = ?",
                    [dev.agentId, dev.ip]
                );

                if (existing && existing.length > 0) {
                    await db.query(
                        `UPDATE devices_pending 
                         SET hostname = ?, os_name = ?, hardware_json = ?, software_json = ?, last_seen = NOW(), status = 'PENDING'
                         WHERE id = ?`,
                        [dev.hostname, dev.osName, dev.hardwareJson, dev.softwareJson, existing[0].id]
                    );
                } else {
                    await db.query(
                        `INSERT INTO devices_pending 
                            (agent_id, hostname, domain_workgroup, os_name, ip_address, mac_address, serial_number, hardware_json, software_json, status)
                         VALUES (?, ?, 'WORKGROUP', ?, ?, ?, ?, ?, ?, 'PENDING')`,
                        [
                            dev.agentId,
                            dev.hostname,
                            dev.osName,
                            dev.ip,
                            `00:NET:${dev.ip.replace(/\./g, ':').slice(-8)}`,
                            dev.serialNumber,
                            dev.hardwareJson,
                            dev.softwareJson
                        ]
                    );
                }
            }
        }

        return res.json({
            status: 'success',
            message: `Đã quét hoàn tất ${scanResult.scannedCount} địa chỉ IP. Phát hiện ${discovered.length} thiết bị cắm mạng.`,
            scannedCount: scanResult.scannedCount,
            discoveredCount: discovered.length,
            devices: discovered
        });

    } catch (err) {
        console.error('Error scanning network subnet:', err);
        return res.status(500).json({ error: err.message });
    }
}

// Onboard / Approve pending device to official Asset catalog
async function approveDevice(req, res) {
    try {
        const { 
            pendingId, 
            assetTag, 
            hostname,
            assetType, 
            departmentId, 
            locationId, 
            userId, 
            purchaseDate, 
            warrantyMonths,
            purchaseCost,
            depreciationMonths,
            vendorSupplier,
            warrantyExpirationDate,
            poDocumentUrl
        } = req.body;

        if (!pendingId || !assetTag) {
            return res.status(400).json({ error: 'Missing required pendingId or assetTag' });
        }

        const pendingList = await db.query('SELECT * FROM devices_pending WHERE id = ?', [pendingId]);
        if (pendingList.length === 0) {
            return res.status(404).json({ error: 'Pending device not found' });
        }

        const dev = pendingList[0];
        const hw = typeof dev.hardware_json === 'string' ? JSON.parse(dev.hardware_json || '{}') : (dev.hardware_json || {});
        const sw = typeof dev.software_json === 'string' ? JSON.parse(dev.software_json || '[]') : (dev.software_json || []);

        const ramGb = hw.ram ? (hw.ram.totalGb || 0) : 0;
        const diskGb = hw.disks ? hw.disks.reduce((acc, d) => acc + (d.sizeGb || 0), 0) : 0;
        const gpuName = hw.gpu ? hw.gpu.name : '';
        const mainboardModel = hw.mainboard ? `${hw.mainboard.manufacturer || ''} ${hw.mainboard.model || ''}`.trim() : '';
        const cpuModel = hw.cpu ? hw.cpu.name : '';

        // Baseline snapshot generated upon onboarding approval
        const baselineSnapshot = JSON.stringify({
            hardware: hw,
            software: sw,
            ramTotalGb: ramGb,
            diskTotalGb: diskGb,
            mainboard: mainboardModel,
            cpu: cpuModel
        });

        // Insert into official Assets table including Optional Procurement & Financial fields & IP Address
        const insertRes = await db.query(
            `INSERT INTO assets 
                (asset_tag, qr_code, agent_id, hostname, asset_type, status, department_id, location_id, user_id, 
                 serial_number, ip_address, mainboard_model, cpu_model, ram_total_gb, disk_total_gb, gpu_model, os_info, 
                 baseline_snapshot, current_snapshot, purchase_date, warranty_months,
                 purchase_cost, depreciation_months, vendor_supplier, warranty_expiration_date, po_document_url)
             VALUES (?, ?, ?, ?, ?, 'IN_USE', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                assetTag,
                assetTag, // QR code string matches Asset Tag
                dev.agent_id,
                hostname || dev.hostname,
                assetType || hw.deviceType || 'Desktop',
                departmentId || null,
                locationId || null,
                userId || null,
                dev.serial_number || '',
                dev.ip_address || '10.30.22.48',
                mainboardModel,
                cpuModel,
                ramGb,
                diskGb,
                gpuName,
                dev.os_name || 'Windows',
                baselineSnapshot,
                baselineSnapshot,
                purchaseDate || new Date().toISOString().split('T')[0],
                warrantyMonths || 24,
                purchaseCost ? parseFloat(purchaseCost) : null,
                depreciationMonths ? parseInt(depreciationMonths, 10) : 36,
                vendorSupplier || null,
                warrantyExpirationDate || null,
                poDocumentUrl || null
            ]
        );

        const newAssetId = insertRes.insertId;

        // Mark pending status as APPROVED
        await db.query("UPDATE devices_pending SET status = 'APPROVED' WHERE id = ?", [pendingId]);

        // Record Initial Onboarding Audit Lifecycle Log
        await db.query(
            `INSERT INTO asset_lifecycle_logs (asset_id, action, from_user_id, to_user_id, from_department_id, to_department_id, notes)
             VALUES (?, 'ONBOARDED', NULL, ?, NULL, ?, ?)`,
            [newAssetId, userId || null, departmentId || null, `Phê duyệt định danh tài sản '${assetTag}' từ Discovery Queue`]
        );

        return res.json({
            status: 'success',
            message: `Đã phê duyệt và khởi tạo tài sản '${assetTag}' (${dev.hostname}).`,
            assetId: newAssetId
        });

    } catch (err) {
        console.error('Error approving device:', err);
        return res.status(500).json({ error: err.message });
    }
}

// Reject pending device
async function rejectDevice(req, res) {
    try {
        const { pendingId } = req.body;
        await db.query("UPDATE devices_pending SET status = 'REJECTED' WHERE id = ?", [pendingId]);
        return res.json({ status: 'success', message: 'Đã từ chối thiết bị.' });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
}

// Delete single pending device permanently
async function deletePendingDevice(req, res) {
    try {
        const { id } = req.params;
        await db.query("DELETE FROM devices_pending WHERE id = ?", [id]);
        return res.json({ status: 'success', message: 'Đã xóa thiết bị khỏi danh sách chờ.' });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
}

// Clear ALL pending devices in discovery queue
async function clearAllPending(req, res) {
    try {
        await db.query("DELETE FROM devices_pending WHERE status = 'PENDING'");
        return res.json({ status: 'success', message: 'Đã xóa toàn bộ danh sách thiết bị chờ duyệt để sẵn sàng quét mới.' });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
}

module.exports = {
    getPendingDevices,
    getSubnets,
    scanNetworkSubnet,
    approveDevice,
    rejectDevice,
    deletePendingDevice,
    clearAllPending
};
