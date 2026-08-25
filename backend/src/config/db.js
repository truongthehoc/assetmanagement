const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

let pool = null;
let isMysqlMode = false;

// Master Data Store
const memoryStore = {
    khoa: [
        { id: 1, code: 'K-KHTH', name: 'Phòng Kế Hoạch Tổng Hợp', manager_name: 'BS. CKII Nguyễn Văn A', description: 'Điều phối hoạt động chuyên môn & chỉ đạo tuyến' },
        { id: 2, code: 'K-CNTT', name: 'Phòng Công Nghệ Thông Tin', manager_name: 'Kỹ Sư Nguyễn Văn Anh', description: 'Quản trị hạ tầng máy chủ, mạng & phần mềm bệnh viện' },
        { id: 3, code: 'K-NS', name: 'Phòng Tổ Chức Cán Bộ & Nhân Sự', manager_name: 'Trần Thị Bình', description: 'Quản lý hồ sơ nhân sự, tiền lương & đào tạo' },
        { id: 4, code: 'K-TCKT', name: 'Phòng Tài Chính Kế Toán', manager_name: 'Lê Hoàng Cường', description: 'Quản lý viện phí, thu ngân & tài chính bệnh viện' }
    ],
    phong: [
        { id: 1, code: 'P-IT', name: 'Phòng Máy Chủ & Kỹ Thuật IT', khoa_id: 2, location_address: 'Tòa Nhà A - Tầng 2 (Phòng 201)', manager_name: 'Nguyễn Văn Anh' },
        { id: 2, code: 'P-NS', name: 'Phòng Tiếp Nhận & Hồ Sơ Nhân Sự', khoa_id: 3, location_address: 'Tòa Nhà A - Tầng 3 (Phòng 305)', manager_name: 'Trần Thị Bình' },
        { id: 3, code: 'P-KT', name: 'Phòng Kế Toán Thu Ngân', khoa_id: 4, location_address: 'Tòa Nhà B - Tầng 1 (Phòng 102)', manager_name: 'Lê Hoàng Cường' },
        { id: 4, code: 'P-KHTH', name: 'Phòng Kế Hoạch Nghiệp Vụ', khoa_id: 1, location_address: 'Tòa Nhà A - Tầng 1 (Phòng 101)', manager_name: 'Phạm Minh Dũng' }
    ],
    nhan_vien: [
        { id: 1, employee_id: 'EMP001', full_name: 'Nguyễn Văn Anh', email: 'anh.nguyen@company.com', phone: '0901234567', phong_id: 1, position: 'Trưởng Phòng IT', status: 'ACTIVE' },
        { id: 2, employee_id: 'EMP002', full_name: 'Trần Thị Bình', email: 'binh.tran@company.com', phone: '0902345678', phong_id: 2, position: 'Chuyên Viên HR', status: 'ACTIVE' },
        { id: 3, employee_id: 'EMP003', full_name: 'Lê Hoàng Cường', email: 'cuong.le@company.com', phone: '0903456789', phong_id: 3, position: 'Kế Toán Trưởng', status: 'ACTIVE' },
        { id: 4, employee_id: 'EMP004', full_name: 'Phạm Minh Dũng', email: 'dung.pham@company.com', phone: '0904567890', phong_id: 4, position: 'Cán Bộ Kế Hoạch', status: 'ACTIVE' }
    ],
    chuc_danh: [
        { id: 1, code: 'IT_ADMIN', name: 'Quản Trị Viên Hệ Thống IT', description: 'Phụ trách toàn bộ hệ thống CNTT và an ninh mạng' },
        { id: 2, code: 'IT_STAFF', name: 'Kỹ Thuật Viên Tin Học', description: 'Hỗ trợ kỹ thuật phần cứng, mạng và máy trạm' },
        { id: 3, code: 'HR_MANAGER', name: 'Trưởng Phòng Nhân Sự', description: 'Phụ trách tổ chức cán bộ' },
        { id: 4, code: 'ACC_CHIEF', name: 'Kế Toán Trưởng', description: 'Quản lý tài chính kế toán' },
        { id: 5, code: 'STAFF', name: 'Cán Bộ / Nhân Viên', description: 'Nhân viên các phòng ban chuyên môn' }
    ],
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
        { id: 1, code: 'MAY_IN', name: 'Máy In / Scanner / Photo', description: 'Thiết bị in ấn, photocopy, scan tài liệu' },
        { id: 2, code: 'THIET_BI_MANG', name: 'Switch Mạng / Router / Firewall', description: 'Hạ tầng mạng, thiết bị định tuyến, bảo mật' },
        { id: 3, code: 'MAN_HINH', name: 'Màn Hình (Monitor / TV Display)', description: 'Màn hình máy tính, màn hình hiển thị LCD/LED' },
        { id: 4, code: 'LAPTOP', name: 'Laptop / Máy Tính Xách Tay', description: 'Máy tính xách tay cá nhân phục vụ công tác' },
        { id: 5, code: 'DESKTOP', name: 'Máy Tính Để Bàn (Desktop PC)', description: 'Máy trạm, PC để bàn văn phòng' },
        { id: 6, code: 'SERVER', name: 'Server / Máy Chủ Độc Lập', description: 'Máy chủ vật lý, lưu trữ dữ liệu' },
        { id: 7, code: 'KHAC', name: 'Thiết Bị IT Khác (UPS, Projector, NAS...)', description: 'Bộ lưu điện UPS, máy chiếu, thiết bị ngoại vi' }
    ],
    trang_thai_tai_san: [
        { id: 1, code: 'IN_STOCK', name: 'Trong Kho (Chờ Cấp Phát)', description: 'Thiết bị mới nhập kho, chưa được gán cho người sử dụng', color_badge: 'blue' },
        { id: 2, code: 'IN_USE', name: 'Đang Sử Dụng', description: 'Thiết bị đã được cấp phát và đang được sử dụng bởi nhân viên', color_badge: 'green' },
        { id: 3, code: 'BACKUP', name: 'Dự Phòng', description: 'Thiết bị dự phòng, sẵn sàng thay thế khi cần', color_badge: 'cyan' },
        { id: 4, code: 'REPAIR', name: 'Đang Bảo Trì / Sửa Chữa', description: 'Thiết bị đang trong quá trình bảo trì hoặc sửa chữa', color_badge: 'orange' },
        { id: 5, code: 'DISPOSED', name: 'Đã Thanh Lý / Hủy', description: 'Thiết bị đã được thanh lý hoặc loại bỏ khỏi hệ thống', color_badge: 'red' }
    ]
};

async function initDB() {
    const targetDbName = process.env.DB_NAME || 'asset_management';
    const dbConfig = {
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD !== undefined ? process.env.DB_PASSWORD : 'bvdktnBD@152',
        database: targetDbName,
        port: parseInt(process.env.DB_PORT || '3306'),
        multipleStatements: true
    };

    try {
        const connection = await mysql.createConnection({
            host: dbConfig.host,
            user: dbConfig.user,
            password: dbConfig.password,
            port: dbConfig.port
        });

        await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbConfig.database}\` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`);
        await connection.end();

        pool = mysql.createPool({
            ...dbConfig,
            waitForConnections: true,
            connectionLimit: 10,
            queueLimit: 0
        });

        console.log('🔄 Dang kiem tra va khoi tao schema bang MySQL...');

        // Create every table individually with CREATE TABLE IF NOT EXISTS
        const tableDDLs = [
            `CREATE TABLE IF NOT EXISTS departments (
                id INT AUTO_INCREMENT PRIMARY KEY,
                code VARCHAR(50) UNIQUE NOT NULL,
                name VARCHAR(255) NOT NULL,
                manager_name VARCHAR(100),
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            ) ENGINE=InnoDB;`,

            `CREATE TABLE IF NOT EXISTS locations (
                id INT AUTO_INCREMENT PRIMARY KEY,
                building VARCHAR(100) NOT NULL,
                floor VARCHAR(50) NOT NULL,
                room VARCHAR(100) NOT NULL,
                description VARCHAR(255),
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            ) ENGINE=InnoDB;`,

            `CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                employee_id VARCHAR(50) UNIQUE NOT NULL,
                full_name VARCHAR(255) NOT NULL,
                email VARCHAR(255) UNIQUE,
                phone VARCHAR(50),
                department_id INT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            ) ENGINE=InnoDB;`,

            `CREATE TABLE IF NOT EXISTS devices_pending (
                id INT AUTO_INCREMENT PRIMARY KEY,
                agent_id VARCHAR(100) UNIQUE NOT NULL,
                hostname VARCHAR(255) NOT NULL,
                domain_workgroup VARCHAR(100),
                os_name VARCHAR(255),
                ip_address VARCHAR(100),
                mac_address VARCHAR(100),
                serial_number VARCHAR(100),
                hardware_json LONGTEXT,
                software_json LONGTEXT,
                first_seen DATETIME DEFAULT CURRENT_TIMESTAMP,
                last_seen DATETIME DEFAULT CURRENT_TIMESTAMP,
                status ENUM('PENDING', 'APPROVED', 'REJECTED') DEFAULT 'PENDING'
            ) ENGINE=InnoDB;`,

            `CREATE TABLE IF NOT EXISTS assets (
                id INT AUTO_INCREMENT PRIMARY KEY,
                asset_tag VARCHAR(100) UNIQUE NOT NULL,
                qr_code VARCHAR(255) UNIQUE NOT NULL,
                agent_id VARCHAR(100) UNIQUE,
                hostname VARCHAR(255) NOT NULL,
                asset_type VARCHAR(255) DEFAULT 'Desktop',
                status VARCHAR(50) DEFAULT 'IN_USE',
                department_id INT,
                location_id INT,
                user_id INT,
                serial_number VARCHAR(100),
                ip_address VARCHAR(100),
                mainboard_model VARCHAR(255),
                cpu_model VARCHAR(255),
                ram_total_gb INT,
                disk_total_gb INT,
                gpu_model VARCHAR(255),
                os_info VARCHAR(255),
                baseline_snapshot LONGTEXT,
                current_snapshot LONGTEXT,
                purchase_date DATE,
                purchase_cost DECIMAL(15,2) NULL,
                depreciation_months INT DEFAULT 36,
                vendor_supplier VARCHAR(255) NULL,
                warranty_expiration_date DATE NULL,
                po_document_url TEXT NULL,
                previous_status VARCHAR(50) NULL,
                notes TEXT NULL,
                warranty_months INT DEFAULT 24,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            ) ENGINE=InnoDB;`,

            `CREATE TABLE IF NOT EXISTS asset_ram_slots (
                id INT AUTO_INCREMENT PRIMARY KEY,
                asset_id INT NOT NULL,
                slot_name VARCHAR(50),
                capacity_gb INT,
                manufacturer VARCHAR(100),
                serial_number VARCHAR(100),
                bus_speed VARCHAR(50)
            ) ENGINE=InnoDB;`,

            `CREATE TABLE IF NOT EXISTS asset_disks (
                id INT AUTO_INCREMENT PRIMARY KEY,
                asset_id INT NOT NULL,
                model VARCHAR(255),
                serial_number VARCHAR(100),
                size_gb INT,
                interface_type VARCHAR(50)
            ) ENGINE=InnoDB;`,

            `CREATE TABLE IF NOT EXISTS asset_software (
                id INT AUTO_INCREMENT PRIMARY KEY,
                asset_id INT NOT NULL,
                name VARCHAR(255) NOT NULL,
                version VARCHAR(100),
                publisher VARCHAR(255),
                install_date VARCHAR(50),
                license_key VARCHAR(255),
                is_whitelisted BOOLEAN DEFAULT TRUE
            ) ENGINE=InnoDB;`,

            `CREATE TABLE IF NOT EXISTS drift_alerts (
                id INT AUTO_INCREMENT PRIMARY KEY,
                asset_id INT NOT NULL,
                alert_type VARCHAR(100) NOT NULL,
                severity VARCHAR(50) DEFAULT 'MEDIUM',
                title VARCHAR(255) NOT NULL,
                details TEXT,
                is_resolved BOOLEAN DEFAULT FALSE,
                resolved_by VARCHAR(100),
                resolved_at DATETIME,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            ) ENGINE=InnoDB;`,

            `CREATE TABLE IF NOT EXISTS lifecycle_logs (
                id INT AUTO_INCREMENT PRIMARY KEY,
                asset_id INT NOT NULL,
                action VARCHAR(100) NOT NULL,
                from_user_id INT,
                to_user_id INT,
                from_status VARCHAR(50),
                to_status VARCHAR(50),
                notes TEXT,
                performed_by VARCHAR(100) DEFAULT 'Admin',
                document_signature TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            ) ENGINE=InnoDB;`,

            `CREATE TABLE IF NOT EXISTS maintenance_schedules (
                id INT AUTO_INCREMENT PRIMARY KEY,
                asset_id INT NOT NULL,
                task_name VARCHAR(255) NOT NULL,
                frequency_months INT DEFAULT 6,
                last_performed DATE,
                next_due DATE NOT NULL,
                status VARCHAR(50) DEFAULT 'PENDING',
                notes TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            ) ENGINE=InnoDB;`,

            `CREATE TABLE IF NOT EXISTS inventory_audits (
                id INT AUTO_INCREMENT PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                audit_date DATE NOT NULL,
                auditor_name VARCHAR(100),
                status VARCHAR(50) DEFAULT 'IN_PROGRESS',
                total_scanned INT DEFAULT 0,
                mismatch_count INT DEFAULT 0,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            ) ENGINE=InnoDB;`,

            `CREATE TABLE IF NOT EXISTS audit_items (
                id INT AUTO_INCREMENT PRIMARY KEY,
                audit_id INT NOT NULL,
                asset_id INT NOT NULL,
                scanned_location_id INT,
                scanned_user_id INT,
                status VARCHAR(50) DEFAULT 'MATCHED',
                notes TEXT,
                scanned_at DATETIME DEFAULT CURRENT_TIMESTAMP
            ) ENGINE=InnoDB;`,

            `CREATE TABLE IF NOT EXISTS nha_cung_cap (
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
            ) ENGINE=InnoDB;`,

            `CREATE TABLE IF NOT EXISTS khoa (
                id INT AUTO_INCREMENT PRIMARY KEY,
                code VARCHAR(50) UNIQUE NOT NULL,
                name VARCHAR(255) NOT NULL,
                manager_name VARCHAR(100),
                description TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            ) ENGINE=InnoDB;`,

            `CREATE TABLE IF NOT EXISTS phong (
                id INT AUTO_INCREMENT PRIMARY KEY,
                code VARCHAR(50) UNIQUE NOT NULL,
                name VARCHAR(255) NOT NULL,
                khoa_id INT NOT NULL,
                location_address VARCHAR(255),
                manager_name VARCHAR(100),
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            ) ENGINE=InnoDB;`,

            `CREATE TABLE IF NOT EXISTS nhan_vien (
                id INT AUTO_INCREMENT PRIMARY KEY,
                employee_id VARCHAR(50) UNIQUE NOT NULL,
                full_name VARCHAR(255) NOT NULL,
                email VARCHAR(255),
                phone VARCHAR(50),
                phong_id INT,
                position VARCHAR(100),
                status VARCHAR(20) DEFAULT 'ACTIVE',
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            ) ENGINE=InnoDB;`,

            `CREATE TABLE IF NOT EXISTS chuc_danh (
                id INT AUTO_INCREMENT PRIMARY KEY,
                code VARCHAR(50) UNIQUE NOT NULL,
                name VARCHAR(255) NOT NULL,
                description TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            ) ENGINE=InnoDB;`,

            `CREATE TABLE IF NOT EXISTS loai_tai_san (
                id INT AUTO_INCREMENT PRIMARY KEY,
                code VARCHAR(50) UNIQUE NOT NULL,
                name VARCHAR(255) NOT NULL,
                description TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            ) ENGINE=InnoDB;`,

            `CREATE TABLE IF NOT EXISTS trang_thai_tai_san (
                id INT AUTO_INCREMENT PRIMARY KEY,
                code VARCHAR(50) UNIQUE NOT NULL,
                name VARCHAR(255) NOT NULL,
                description TEXT,
                color_badge VARCHAR(50) DEFAULT 'blue',
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            ) ENGINE=InnoDB;`,

            `CREATE TABLE IF NOT EXISTS kho_luu_tru (
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
            ) ENGINE=InnoDB;`,

            `CREATE TABLE IF NOT EXISTS system_users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                username VARCHAR(100) UNIQUE NOT NULL,
                password_hash VARCHAR(255) NOT NULL DEFAULT '',
                full_name VARCHAR(255) NOT NULL,
                email VARCHAR(255),
                phone VARCHAR(50),
                employee_id VARCHAR(50),
                role VARCHAR(50) DEFAULT 'STAFF',
                department_name VARCHAR(255),
                job_title VARCHAR(255) DEFAULT '',
                avatar_url VARCHAR(500) DEFAULT '',
                status VARCHAR(20) DEFAULT 'ACTIVE',
                auth_method VARCHAR(50) DEFAULT 'LOCAL',
                last_login VARCHAR(100) DEFAULT 'Chưa đăng nhập',
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            ) ENGINE=InnoDB;`,

            `CREATE TABLE IF NOT EXISTS system_settings (
                setting_key VARCHAR(50) PRIMARY KEY,
                setting_value LONGTEXT NOT NULL,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            ) ENGINE=InnoDB;`,

            `CREATE TABLE IF NOT EXISTS permission_matrix (
                role_name VARCHAR(50) PRIMARY KEY,
                permissions_json JSON NOT NULL,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            ) ENGINE=InnoDB;`
        ];

        for (const ddl of tableDDLs) {
            await pool.query(ddl).catch(err => {
                console.warn('Table create notice:', err.message);
            });
        }

        // Run migrations for existing columns
        const migrations = [
            "ALTER TABLE assets MODIFY COLUMN asset_type VARCHAR(255) NULL DEFAULT 'Thiết bị IT'",
            "ALTER TABLE assets MODIFY COLUMN status VARCHAR(50) NULL DEFAULT 'IN_USE'",
            "ALTER TABLE assets ADD COLUMN purchase_cost DECIMAL(15,2) NULL",
            "ALTER TABLE assets ADD COLUMN depreciation_months INT DEFAULT 36",
            "ALTER TABLE assets ADD COLUMN vendor_supplier VARCHAR(255) NULL",
            "ALTER TABLE assets ADD COLUMN warranty_expiration_date DATE NULL",
            "ALTER TABLE assets ADD COLUMN po_document_url TEXT NULL",
            "ALTER TABLE assets ADD COLUMN previous_status VARCHAR(50) NULL",
            "ALTER TABLE assets ADD COLUMN notes TEXT NULL",
            "ALTER TABLE assets ADD COLUMN ip_address VARCHAR(100) NULL",
            "ALTER TABLE system_users ADD COLUMN password_hash VARCHAR(255) NOT NULL DEFAULT ''"
        ];
        for (const m of migrations) {
            await pool.query(m).catch(() => {});
        }

        // Set default password for users who have no password yet (bcrypt hash of 'Admin@123')
        // $2b$10$YZkR3...  = bcrypt('Admin@123', 10)
        const DEFAULT_ADMIN_HASH = '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LPVyEtZRfbm';
        await pool.query(
            `UPDATE system_users SET password_hash = ? WHERE password_hash = '' OR password_hash IS NULL`,
            [DEFAULT_ADMIN_HASH]
        ).catch(() => {});

        // Seed default records if empty
        // 1. Seed loai_tai_san
        const [loaiRows] = await pool.query('SELECT COUNT(*) as cnt FROM loai_tai_san');
        if (loaiRows[0]?.cnt === 0) {
            for (const item of memoryStore.loai_tai_san) {
                await pool.query('INSERT IGNORE INTO loai_tai_san (id, code, name, description) VALUES (?, ?, ?, ?)', [item.id, item.code, item.name, item.description]).catch(() => {});
            }
        }

        // 2. Seed trang_thai_tai_san
        const [trangThaiRows] = await pool.query('SELECT COUNT(*) as cnt FROM trang_thai_tai_san');
        if (trangThaiRows[0]?.cnt === 0) {
            for (const item of memoryStore.trang_thai_tai_san) {
                await pool.query('INSERT IGNORE INTO trang_thai_tai_san (id, code, name, description, color_badge) VALUES (?, ?, ?, ?, ?)', [item.id, item.code, item.name, item.description, item.color_badge]).catch(() => {});
            }
        }

        // 3. Seed khoa
        const [khoaRows] = await pool.query('SELECT COUNT(*) as cnt FROM khoa');
        if (khoaRows[0]?.cnt === 0) {
            for (const item of memoryStore.khoa) {
                await pool.query('INSERT IGNORE INTO khoa (id, code, name, manager_name, description) VALUES (?, ?, ?, ?, ?)', [item.id, item.code, item.name, item.manager_name, item.description]).catch(() => {});
            }
        }

        // 4. Seed phong
        const [phongRows] = await pool.query('SELECT COUNT(*) as cnt FROM phong');
        if (phongRows[0]?.cnt === 0) {
            for (const item of memoryStore.phong) {
                await pool.query('INSERT IGNORE INTO phong (id, code, name, khoa_id, location_address, manager_name) VALUES (?, ?, ?, ?, ?, ?)', [item.id, item.code, item.name, item.khoa_id, item.location_address, item.manager_name]).catch(() => {});
            }
        }

        // 5. Seed nhan_vien
        const [nhanVienRows] = await pool.query('SELECT COUNT(*) as cnt FROM nhan_vien');
        if (nhanVienRows[0]?.cnt === 0) {
            for (const item of memoryStore.nhan_vien) {
                await pool.query('INSERT IGNORE INTO nhan_vien (id, employee_id, full_name, email, phone, phong_id, position, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', [item.id, item.employee_id, item.full_name, item.email, item.phone, item.phong_id, item.position, item.status]).catch(() => {});
            }
        }

        // 6. Seed chuc_danh
        const [chucDanhRows] = await pool.query('SELECT COUNT(*) as cnt FROM chuc_danh');
        if (chucDanhRows[0]?.cnt === 0) {
            for (const item of memoryStore.chuc_danh) {
                await pool.query('INSERT IGNORE INTO chuc_danh (id, code, name, description) VALUES (?, ?, ?, ?)', [item.id, item.code, item.name, item.description]).catch(() => {});
            }
        }

        // 7. Seed nha_cung_cap
        const [nccRows] = await pool.query('SELECT COUNT(*) as cnt FROM nha_cung_cap');
        if (nccRows[0]?.cnt === 0) {
            for (const item of memoryStore.nha_cung_cap) {
                await pool.query('INSERT IGNORE INTO nha_cung_cap (id, code, name, contact_person, phone, email, address, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', [item.id, item.code, item.name, item.contact_person, item.phone, item.email, item.address, item.notes]).catch(() => {});
            }
        }

        // 8. Seed kho_luu_tru
        const [khoLuuTruRows] = await pool.query('SELECT COUNT(*) as cnt FROM kho_luu_tru');
        if (khoLuuTruRows[0]?.cnt === 0) {
            for (const item of memoryStore.kho_luu_tru) {
                await pool.query('INSERT IGNORE INTO kho_luu_tru (id, code, name, phong_id, location_address, manager_name, phone, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', [item.id, item.code, item.name, item.phong_id, item.location_address, item.manager_name, item.phone, item.notes]).catch(() => {});
            }
        }

        // 9. Seed default admin user (password: Admin@123)
        // Hash generated via bcrypt.hashSync('Admin@123', 10)
        const ADMIN_HASH = '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LPVyEtZRfbm';
        await pool.query(`
            INSERT IGNORE INTO system_users (id, username, password_hash, full_name, email, phone, employee_id, role, department_name, job_title, status, auth_method, last_login)
            VALUES (1, 'admin_system', ?, 'Admin System', 'admin@company.com', '0901234567', 'SYS001', 'ADMIN', 'Công Nghệ Thông Tin (IT Central)', 'Quản Trị Viên Hệ Thống', 'ACTIVE', 'LOCAL', 'Chưa đăng nhập')
        `, [ADMIN_HASH]).catch(() => {});

        isMysqlMode = true;
        console.log(`=======================================================`);
        console.log(` ✅ KET NOI THANH CONG MYSQL DATABASE: [${dbConfig.database}]`);
        console.log(`    Tat ca cac bang Master Data da duoc dong bo san sang!`);
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
    if (isMysqlMode && pool) {
        const [rows] = await pool.query(sql, params);
        return rows;
    } else {
        return handleMemoryQuery(sql, params);
    }
}

function handleMemoryQuery(sql, params) {
    const s = sql.trim();
    const upper = s.toUpperCase();

    if (upper.includes('FROM KHOA')) {
        return memoryStore.khoa;
    }

    if (upper.includes('FROM PHONG')) {
        return memoryStore.phong.map(p => {
            const k = memoryStore.khoa.find(item => item.id === p.khoa_id) || {};
            return { ...p, khoa_name: k.name, khoa_code: k.code, building: k.name, room: p.name };
        });
    }

    if (upper.includes('FROM NHAN_VIEN')) {
        return memoryStore.nhan_vien.map(nv => {
            const p = memoryStore.phong.find(item => item.id === nv.phong_id) || {};
            const k = memoryStore.khoa.find(item => item.id === p.khoa_id) || {};
            return { ...nv, phong_name: p.name, phong_code: p.code, location_address: p.location_address, khoa_id: k.id, khoa_name: k.name, khoa_code: k.code };
        });
    }

    if (upper.includes('FROM CHUC_DANH')) {
        return memoryStore.chuc_danh.map(cd => ({
            ...cd,
            total_employees: memoryStore.nhan_vien.filter(nv => nv.position === cd.name || nv.position === cd.code).length
        }));
    }

    if (upper.includes('FROM TRANG_THAI_TAI_SAN')) {
        return memoryStore.trang_thai_tai_san.map(t => ({
            ...t,
            total_assets: memoryStore.assets.filter(a => a.status === t.code).length
        }));
    }

    if (upper.includes('FROM DEPARTMENTS')) {
        return memoryStore.departments.map(d => ({ ...d, location_address: d.name, khoa_id: 1 }));
    }
    if (upper.includes('FROM LOCATIONS')) {
        return memoryStore.locations.map(l => ({ ...l, name: l.room, building: l.building, room: l.room, location_address: l.room }));
    }
    if (upper.includes('FROM USERS')) {
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
