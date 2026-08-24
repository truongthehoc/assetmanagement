const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

let pool = null;
let isMysqlMode = false;

// Clean Data Store with ZERO mock assets (only master metadata dictionary for departments, locations & users)
const memoryStore = {
    departments: [
        { id: 1, code: 'IT', name: 'Phòng Công nghệ thông tin', manager_name: 'Nguyễn Văn Anh' },
        { id: 2, code: 'HR', name: 'Phòng Nhân sự', manager_name: 'Trần Thị Bình' },
        { id: 3, code: 'FIN', name: 'Phòng Tài chính Kế toán', manager_name: 'Lê Hoàng Cường' },
        { id: 4, code: 'MKT', name: 'Phòng Marketing', manager_name: 'Phạm Minh Dũng' }
    ],
    locations: [
        { id: 1, building: 'Tòa nhà A', floor: 'Tầng 2', room: 'Phòng 201', description: 'Khu vực Công nghệ thông tin' },
        { id: 2, building: 'Tòa nhà A', floor: 'Tầng 3', room: 'Phòng 305', description: 'Khu vực Nhân sự & Kế toán' },
        { id: 3, building: 'Tòa nhà B', floor: 'Tầng 1', room: 'Phòng 102', description: 'Khu vực Marketing & Truyền thông' },
        { id: 4, building: 'Tòa nhà A', floor: 'Tầng B1', room: 'Kho IT', description: 'Kho lưu trữ & Dự phòng thiết bị' }
    ],
    users: [
        { id: 1, employee_id: 'EMP001', full_name: 'Nguyễn Văn Anh', email: 'anh.nguyen@company.com', phone: '0901234567', department_id: 1 },
        { id: 2, employee_id: 'EMP002', full_name: 'Trần Thị Bình', email: 'binh.tran@company.com', phone: '0902345678', department_id: 2 },
        { id: 3, employee_id: 'EMP003', full_name: 'Lê Hoàng Cường', email: 'cuong.le@company.com', phone: '0903456789', department_id: 3 },
        { id: 4, employee_id: 'EMP004', full_name: 'Phạm Minh Dũng', email: 'dung.pham@company.com', phone: '0904567890', department_id: 4 }
    ],
    devices_pending: [],
    assets: [],
    drift_alerts: [],
    lifecycle_logs: [],
    maintenance_schedules: [],
    inventory_audits: [],
    audit_items: [],
    nha_cung_cap: [
        { id: 1, code: 'NCC-LENOVO', name: 'Trung tâm BH Lenovo Việt Nam', contact_person: 'Nguyễn Văn Minh', phone: '1800-1098', email: 'support@lenovo.vn', address: 'Tòa nhà Hapro, 11B Cát Linh, Đống Đa, Hà Nội', notes: 'Nhà cung cấp máy tính xách tay & bảo hành chính hãng' },
        { id: 2, code: 'NCC-FPT', name: 'Công ty TNHH Hệ Thống Thông Tin FPT (FPT IS)', contact_person: 'Trần Thị Thu', phone: '024-7300-7300', email: 'contact@fpt.com.vn', address: 'Tòa nhà FPT, Phố Duy Tân, Cầu Giấy, Hà Nội', notes: 'Đối tác cung cấp hạ tầng máy chủ & thiết bị mạng' },
        { id: 3, code: 'NCC-PHONGVU', name: 'Công ty CP Thương Mại Dịch Vụ Phong Vũ', contact_person: 'Lê Hoàng Nam', phone: '1800-6867', email: 'cskh@phongvu.vn', address: '264 Nguyễn Trãi, Thanh Xuân, Hà Nội', notes: 'Đơn vị bán lẻ & ủy quyền thiết bị tin học' }
    ],
    kho_luu_tru: [
        { id: 1, code: 'KHO-IT', name: 'Kho IT Central (Thiết Bị Mới & Dự Phòng)', phong_id: 1, location_address: 'Tòa nhà A - Tầng B1', manager_name: 'Nguyễn Văn Anh', phone: '0901234567', notes: 'Kho chứa thiết bị nhập mới lần đầu dành cho khối CNTT' },
        { id: 2, code: 'KHO-TB', name: 'Kho Lưu Trữ Vật Tư & Linh Kiện', phong_id: 2, location_address: 'Tòa nhà B - Tầng 1', manager_name: 'Trần Thị Bình', phone: '0902345678', notes: 'Kho bảo lưu thiết bị thay thế và vật tư' }
    ],
    loai_tai_san: [
        { id: 1, code: 'MAY_IN', name: 'Máy In / Scanner / Photo' },
        { id: 2, code: 'THIET_BI_MANG', name: 'Switch Mạng / Router / Firewall' },
        { id: 3, code: 'MAN_HINH', name: 'Màn Hình (Monitor / TV Display)' },
        { id: 4, code: 'LAPTOP', name: 'Laptop / Máy Tính Xách Tay' },
        { id: 5, code: 'DESKTOP', name: 'Máy Tính Để Bàn (Desktop PC)' },
        { id: 6, code: 'SERVER', name: 'Server / Máy Chủ Độc Lập' },
        { id: 7, code: 'KHAC', name: 'Thiết Bị IT Khác (UPS, Projector, NAS...)' }
    ]
};

async function initDB() {
    try {
        const targetDbName = process.env.DB_NAME || 'asset_management';
        const dbConfig = {
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: targetDbName,
            port: parseInt(process.env.DB_PORT || '3306'),
            multipleStatements: true
        };

        const connection = await mysql.createConnection({
            host: dbConfig.host,
            user: dbConfig.user,
            password: dbConfig.password,
            port: dbConfig.port
        });

        await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbConfig.database}\`;`);
        await connection.end();

        pool = mysql.createPool({
            ...dbConfig,
            waitForConnections: true,
            connectionLimit: 10,
            queueLimit: 0
        });

        // Test if assets table exists
        const [tables] = await pool.query("SHOW TABLES LIKE 'assets'");
        if (tables.length === 0) {
            console.log('Initializing clean MySQL schema...');
            const schemaPath = path.join(__dirname, '../../../database/schema.sql');
            if (fs.existsSync(schemaPath)) {
                const schemaSql = fs.readFileSync(schemaPath, 'utf8');
                await pool.query(schemaSql);
            }
        }

        await pool.query('SELECT 1');
        
        // Ensure new columns exist on MySQL assets table
        const migrations = [
            "ALTER TABLE assets MODIFY COLUMN asset_type VARCHAR(255) NULL DEFAULT 'Thiết bị IT'",
            "ALTER TABLE assets ADD COLUMN purchase_cost DECIMAL(15,2) NULL",
            "ALTER TABLE assets ADD COLUMN depreciation_months INT DEFAULT 36",
            "ALTER TABLE assets ADD COLUMN vendor_supplier VARCHAR(255) NULL",
            "ALTER TABLE assets ADD COLUMN warranty_expiration_date DATE NULL",
            "ALTER TABLE assets ADD COLUMN po_document_url TEXT NULL",
            "ALTER TABLE assets ADD COLUMN previous_status VARCHAR(50) NULL",
            "ALTER TABLE assets ADD COLUMN notes TEXT NULL"
        ];
        for (const m of migrations) {
            await pool.query(m).catch(() => {});
        }
        // Ensure nha_cung_cap table exists in MySQL
        await pool.query(`
            CREATE TABLE IF NOT EXISTS nha_cung_cap (
                id INT AUTO_INCREMENT PRIMARY KEY,
                code VARCHAR(50) UNIQUE NOT NULL,
                name VARCHAR(255) NOT NULL,
                contact_person VARCHAR(100),
                phone VARCHAR(50),
                email VARCHAR(100),
                address VARCHAR(255),
                notes TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            ) ENGINE=InnoDB;
        `).catch(() => {});

        // Ensure kho_luu_tru table exists in MySQL
        await pool.query(`
            CREATE TABLE IF NOT EXISTS kho_luu_tru (
                id INT AUTO_INCREMENT PRIMARY KEY,
                code VARCHAR(50) UNIQUE NOT NULL,
                name VARCHAR(255) NOT NULL,
                phong_id INT,
                location_address VARCHAR(255),
                manager_name VARCHAR(100),
                phone VARCHAR(50),
                notes TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            ) ENGINE=InnoDB;
        `).catch(() => {});

        isMysqlMode = true;
        console.log(`=======================================================`);
        console.log(` ✅ KET NOI THANH CONG MYSQL DATABASE: [${dbConfig.database}]`);
        console.log(`=======================================================`);
    } catch (err) {
        console.error(`=======================================================`);
        console.error(` ❌ LOI KET NOI MYSQL DATABASE:`, err.message);
        console.error(`    Dang chuyen sang che do Memory Store tam thoi...`);
        console.error(`=======================================================`);
        isMysqlMode = false;
    }
}

async function query(sql, params = []) {
    if (isMysqlMode) {
        const [rows] = await pool.query(sql, params);
        return rows;
    } else {
        return handleMemoryQuery(sql, params);
    }
}

function handleMemoryQuery(sql, params) {
    const s = sql.trim();
    const upper = s.toUpperCase();

    if (upper.includes('FROM DEPARTMENTS') || upper.includes('FROM PHONG')) {
        return memoryStore.departments.map(d => ({ ...d, location_address: d.name, khoa_id: 1 }));
    }
    if (upper.includes('FROM LOCATIONS') || upper.includes('FROM KHOA')) {
        return memoryStore.locations.map(l => ({ ...l, name: l.room, building: l.building, room: l.room, location_address: l.room }));
    }
    if (upper.includes('FROM USERS') || upper.includes('FROM NHAN_VIEN')) {
        return memoryStore.users.map(u => ({ ...u, phong_id: u.department_id || 1, phong_name: 'Công nghệ thông tin', khoa_name: 'Khối Kỹ Thuật' }));
    }

    if (upper.includes('FROM DEVICES_PENDING')) {
        if (upper.includes('WHERE AGENT_ID =')) return memoryStore.devices_pending.filter(d => d.agent_id === params[0]);
        if (upper.includes('WHERE ID =')) return memoryStore.devices_pending.filter(d => d.id === parseInt(params[0], 10));
        if (upper.includes("WHERE STATUS = 'PENDING'")) return memoryStore.devices_pending.filter(d => d.status === 'PENDING');
        return memoryStore.devices_pending;
    }

    if (upper.startsWith('INSERT INTO DEVICES_PENDING')) {
        const newObj = {
            id: memoryStore.devices_pending.length + 1,
            agent_id: params[0], hostname: params[1], domain_workgroup: params[2], os_name: params[3],
            ip_address: params[4], mac_address: params[5], serial_number: params[6], hardware_json: params[7],
            software_json: params[8], first_seen: new Date().toISOString(), last_seen: new Date().toISOString(), status: 'PENDING'
        };
        memoryStore.devices_pending.push(newObj);
        return { insertId: newObj.id, affectedRows: 1 };
    }

    if (upper.startsWith('DELETE FROM DEVICES_PENDING')) {
        if (upper.includes("WHERE STATUS = 'PENDING'")) {
            memoryStore.devices_pending = memoryStore.devices_pending.filter(d => d.status !== 'PENDING');
        } else if (params.length > 0) {
            memoryStore.devices_pending = memoryStore.devices_pending.filter(d => d.id !== parseInt(params[0], 10));
        } else {
            memoryStore.devices_pending = [];
        }
        return { affectedRows: 1 };
    }

    if (upper.startsWith('UPDATE DEVICES_PENDING')) {
        if (upper.includes("WHERE STATUS = 'PENDING'")) {
            memoryStore.devices_pending.forEach(d => {
                if (d.status === 'PENDING') d.status = params[0];
            });
        } else if (upper.includes('SET STATUS =')) {
            const item = memoryStore.devices_pending.find(d => d.id === parseInt(params[1], 10));
            if (item) item.status = params[0];
        } else {
            const item = memoryStore.devices_pending.find(d => d.agent_id === params[8]);
            if (item) {
                item.hostname = params[0]; item.domain_workgroup = params[1]; item.os_name = params[2];
                item.ip_address = params[3]; item.mac_address = params[4]; item.serial_number = params[5];
                item.hardware_json = params[6]; item.software_json = params[7]; item.last_seen = new Date().toISOString();
            }
        }
        return { affectedRows: 1 };
    }

    if (upper.includes('FROM ASSETS')) {
        if (upper.includes('WHERE A.ID =') || upper.includes('WHERE ID =')) {
            const raw = memoryStore.assets.find(a => a.id === parseInt(params[0], 10));
            return raw ? [enrichAsset(raw)] : [];
        }
        if (upper.includes('WHERE AGENT_ID =')) {
            return memoryStore.assets.filter(a => a.agent_id === params[0] || (params[1] && a.mac_address === params[1]) || (params[2] && a.serial_number === params[2])).map(enrichAsset);
        }
        if (upper.includes('COUNT(*)')) {
            if (upper.includes("STATUS = 'IN_USE'")) return [{ cnt: memoryStore.assets.filter(a => a.status === 'IN_USE').length }];
            return [{ cnt: memoryStore.assets.length }];
        }
        if (upper.includes('GROUP BY STATUS')) {
            const map = {};
            memoryStore.assets.forEach(a => { map[a.status] = (map[a.status] || 0) + 1; });
            return Object.keys(map).map(k => ({ status: k, count: map[k] }));
        }

        let list = memoryStore.assets.map(enrichAsset);
        if (params.length > 0 && upper.includes('A.STATUS =')) {
            list = list.filter(a => a.status === params[0]);
        }
        return list;
    }

    if (upper.startsWith('INSERT INTO ASSETS')) {
        let newAsset = {};
        if (params.length > 15) {
            newAsset = {
                id: memoryStore.assets.length + 1, asset_tag: params[0], hostname: params[1], asset_type: params[2],
                serial_number: params[3], ip_address: params[4], os_info: params[5], ram_total_gb: params[6],
                disk_total_gb: params[7], cpu_model: params[8], department_id: params[9], user_id: params[10],
                location_id: params[11], status: params[12] || 'READY', purchase_date: params[13], purchase_cost: params[14],
                depreciation_months: params[15], vendor_supplier: params[16], warranty_expiration_date: params[17],
                po_document_url: params[18], notes: params[19], qr_code: params[20] || params[0],
                created_at: new Date().toISOString(), updated_at: new Date().toISOString()
            };
        } else {
            newAsset = {
                id: memoryStore.assets.length + 1, asset_tag: params[0], qr_code: params[1], agent_id: params[2],
                hostname: params[3], asset_type: params[4], status: 'IN_USE', department_id: params[5], location_id: params[6],
                user_id: params[7], serial_number: params[8], mainboard_model: params[9], cpu_model: params[10],
                ram_total_gb: params[11], disk_total_gb: params[12], gpu_model: params[13], os_info: params[14],
                baseline_snapshot: params[15], current_snapshot: params[16], purchase_date: params[17], warranty_months: params[18],
                created_at: new Date().toISOString(), updated_at: new Date().toISOString()
            };
        }
        memoryStore.assets.push(newAsset);
        return { insertId: newAsset.id, affectedRows: 1 };
    }

    if (upper.startsWith('UPDATE ASSETS')) {
        const id = parseInt(params[params.length - 1], 10);
        const item = memoryStore.assets.find(a => a.id === id);
        if (item) {
            if (upper.includes('PURCHASE_DATE =')) {
                item.purchase_date = params[0];
                item.purchase_cost = params[1];
                item.depreciation_months = params[2];
                item.vendor_supplier = params[3];
                item.warranty_expiration_date = params[4];
                item.po_document_url = params[5];
                if (params[6] !== undefined) item.notes = params[6];
            } else if (upper.includes('STATUS =')) {
                item.status = params[0];
                if (params[1]) item.user_id = params[1];
            } else if (upper.includes('CURRENT_SNAPSHOT =')) {
                item.hostname = params[0]; item.os_info = params[1]; item.current_snapshot = params[2];
            }
            item.updated_at = new Date().toISOString();
        }
        return { affectedRows: 1 };
    }

    if (upper.includes('FROM DRIFT_ALERTS')) {
        if (upper.includes('COUNT(*)')) return [{ cnt: memoryStore.drift_alerts.filter(d => d.is_resolved === 0).length }];
        if (upper.includes('WHERE ASSET_ID =')) return memoryStore.drift_alerts.filter(d => d.asset_id === parseInt(params[0], 10));
        return memoryStore.drift_alerts.map(d => {
            const asset = memoryStore.assets.find(a => a.id === d.asset_id) || {};
            const user = memoryStore.users.find(u => u.id === asset.user_id) || {};
            return { ...d, asset_tag: asset.asset_tag, hostname: asset.hostname, asset_type: asset.asset_type, user_name: user.full_name };
        });
    }

    if (upper.startsWith('INSERT INTO DRIFT_ALERTS')) {
        const newAlert = {
            id: memoryStore.drift_alerts.length + 1, asset_id: params[0], alert_type: params[1], severity: params[2],
            title: params[3], details: params[4], is_resolved: 0, resolved_by: null, resolved_at: null, created_at: new Date().toISOString()
        };
        memoryStore.drift_alerts.push(newAlert);
        return { insertId: newAlert.id, affectedRows: 1 };
    }

    if (upper.startsWith('UPDATE DRIFT_ALERTS')) {
        const item = memoryStore.drift_alerts.find(d => d.id === parseInt(params[1], 10));
        if (item) { item.is_resolved = 1; item.resolved_by = params[0]; item.resolved_at = new Date().toISOString(); }
        return { affectedRows: 1 };
    }

    if (upper.includes('FROM LIFECYCLE_LOGS')) {
        let list = memoryStore.lifecycle_logs.map(l => {
            const asset = memoryStore.assets.find(a => a.id === l.asset_id) || {};
            const u1 = memoryStore.users.find(u => u.id === l.from_user_id) || {};
            const u2 = memoryStore.users.find(u => u.id === l.to_user_id) || {};
            return { ...l, asset_tag: asset.asset_tag, hostname: asset.hostname, from_user_name: u1.full_name || null, to_user_name: u2.full_name || null };
        });
        if (params[0]) list = list.filter(l => l.asset_id === parseInt(params[0], 10));
        return list;
    }

    if (upper.startsWith('INSERT INTO LIFECYCLE_LOGS')) {
        const newLog = {
            id: memoryStore.lifecycle_logs.length + 1, asset_id: params[0], action: params[1], from_user_id: params[2],
            to_user_id: params[3], from_status: params[4], to_status: params[5], notes: params[6], performed_by: params[7],
            document_signature: params[8] || '', created_at: new Date().toISOString()
        };
        memoryStore.lifecycle_logs.push(newLog);
        return { insertId: newLog.id, affectedRows: 1 };
    }

    if (upper.includes('FROM MAINTENANCE_SCHEDULES')) {
        if (upper.includes('COUNT(*)')) return [{ cnt: memoryStore.maintenance_schedules.filter(m => m.status === 'OVERDUE').length }];
        return memoryStore.maintenance_schedules.map(m => {
            const asset = memoryStore.assets.find(a => a.id === m.asset_id) || {};
            const dept = memoryStore.departments.find(d => d.id === asset.department_id) || {};
            const user = memoryStore.users.find(u => u.id === asset.user_id) || {};
            return { ...m, asset_tag: asset.asset_tag, hostname: asset.hostname, asset_type: asset.asset_type, department_name: dept.name, user_name: user.full_name };
        });
    }

    if (upper.startsWith('INSERT INTO MAINTENANCE_SCHEDULES')) {
        const newMaint = {
            id: memoryStore.maintenance_schedules.length + 1, asset_id: params[0], task_name: params[1],
            frequency_months: params[2], last_performed: params[3] || null, next_due: params[4], status: params[5] || 'PENDING',
            notes: params[6] || '', created_at: new Date().toISOString()
        };
        memoryStore.maintenance_schedules.push(newMaint);
        return { insertId: newMaint.id, affectedRows: 1 };
    }

    if (upper.startsWith('UPDATE MAINTENANCE_SCHEDULES')) {
        const item = memoryStore.maintenance_schedules.find(m => m.id === parseInt(params[2], 10));
        if (item) { item.status = 'COMPLETED'; item.last_performed = params[0]; item.notes = params[1]; }
        return { affectedRows: 1 };
    }

    if (upper.includes('FROM NHA_CUNG_CAP')) {
        if (upper.includes('WHERE ID =')) return memoryStore.nha_cung_cap.filter(n => n.id === parseInt(params[0], 10));
        return memoryStore.nha_cung_cap;
    }

    if (upper.startsWith('INSERT INTO NHA_CUNG_CAP')) {
        const newObj = {
            id: memoryStore.nha_cung_cap.length + 1,
            code: params[0], name: params[1], contact_person: params[2] || '',
            phone: params[3] || '', email: params[4] || '', address: params[5] || '',
            notes: params[6] || '', created_at: new Date().toISOString()
        };
        memoryStore.nha_cung_cap.push(newObj);
        return { insertId: newObj.id, affectedRows: 1 };
    }

    if (upper.startsWith('UPDATE NHA_CUNG_CAP')) {
        const id = parseInt(params[params.length - 1], 10);
        const item = memoryStore.nha_cung_cap.find(n => n.id === id);
        if (item) {
            item.code = params[0]; item.name = params[1]; item.contact_person = params[2];
            item.phone = params[3]; item.email = params[4]; item.address = params[5];
            item.notes = params[6];
        }
        return { affectedRows: 1 };
    }

    if (upper.startsWith('DELETE FROM NHA_CUNG_CAP')) {
        const id = parseInt(params[0], 10);
        memoryStore.nha_cung_cap = memoryStore.nha_cung_cap.filter(n => n.id !== id);
        return { affectedRows: 1 };
    }

    if (upper.includes('FROM KHO_LUU_TRU')) {
        if (upper.includes('WHERE ID =')) return memoryStore.kho_luu_tru.filter(k => k.id === parseInt(params[0], 10));
        return memoryStore.kho_luu_tru.map(k => {
            const dept = memoryStore.departments.find(d => d.id === k.phong_id) || {};
            return { ...k, phong_name: dept.name, phong_code: dept.code };
        });
    }

    if (upper.startsWith('INSERT INTO KHO_LUU_TRU')) {
        const newObj = {
            id: memoryStore.kho_luu_tru.length + 1,
            code: params[0], name: params[1], phong_id: params[2],
            location_address: params[3] || '', manager_name: params[4] || '',
            phone: params[5] || '', notes: params[6] || '', created_at: new Date().toISOString()
        };
        memoryStore.kho_luu_tru.push(newObj);
        return { insertId: newObj.id, affectedRows: 1 };
    }

    if (upper.startsWith('UPDATE KHO_LUU_TRU')) {
        const id = parseInt(params[params.length - 1], 10);
        const item = memoryStore.kho_luu_tru.find(k => k.id === id);
        if (item) {
            item.code = params[0]; item.name = params[1]; item.phong_id = params[2];
            item.location_address = params[3]; item.manager_name = params[4];
            item.phone = params[5]; item.notes = params[6];
        }
        return { affectedRows: 1 };
    }

    if (upper.startsWith('DELETE FROM KHO_LUU_TRU')) {
        const id = parseInt(params[0], 10);
        memoryStore.kho_luu_tru = memoryStore.kho_luu_tru.filter(k => k.id !== id);
        return { affectedRows: 1 };
    }

    if (upper.includes('FROM LOAI_TAI_SAN')) {
        if (upper.includes('WHERE ID =')) return memoryStore.loai_tai_san.filter(l => l.id === parseInt(params[0], 10));
        return memoryStore.loai_tai_san;
    }

    if (upper.startsWith('INSERT INTO LOAI_TAI_SAN')) {
        const newObj = { id: memoryStore.loai_tai_san.length + 1, code: params[0], name: params[1], description: params[2] || '' };
        memoryStore.loai_tai_san.push(newObj);
        return { insertId: newObj.id, affectedRows: 1 };
    }

    if (upper.startsWith('UPDATE LOAI_TAI_SAN')) {
        const id = parseInt(params[params.length - 1], 10);
        const item = memoryStore.loai_tai_san.find(l => l.id === id);
        if (item) { item.code = params[0]; item.name = params[1]; item.description = params[2]; }
        return { affectedRows: 1 };
    }

    if (upper.startsWith('DELETE FROM LOAI_TAI_SAN')) {
        const id = parseInt(params[0], 10);
        memoryStore.loai_tai_san = memoryStore.loai_tai_san.filter(l => l.id !== id);
        return { affectedRows: 1 };
    }

    return [];
}

function enrichAsset(raw) {
    const dept = memoryStore.departments.find(d => d.id === raw.department_id) || {};
    const loc = memoryStore.locations.find(l => l.id === raw.location_id) || {};
    const user = memoryStore.users.find(u => u.id === raw.user_id) || {};
    return {
        ...raw,
        department_name: dept.name,
        department_code: dept.code,
        location_building: loc.building,
        location_floor: loc.floor,
        location_room: loc.room,
        user_name: user.full_name,
        user_email: user.email,
        user_employee_id: user.employee_id
    };
}

module.exports = {
    initDB,
    query
};
