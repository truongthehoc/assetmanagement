-- Database Schema for IT Asset Management System (MySQL)
CREATE DATABASE IF NOT EXISTS asset_management DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE asset_management;

-- 1. Discovery / Pending Devices from Agent
CREATE TABLE IF NOT EXISTS devices_pending (
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
) ENGINE=InnoDB;

-- 4. Official Assets
CREATE TABLE IF NOT EXISTS assets (
    id INT AUTO_INCREMENT PRIMARY KEY,
    asset_tag VARCHAR(100) UNIQUE NOT NULL,
    qr_code VARCHAR(255) UNIQUE NOT NULL,
    agent_id VARCHAR(100) UNIQUE,
    hostname VARCHAR(255) NOT NULL,
    asset_type ENUM('Desktop', 'Laptop', 'Server', 'Workstation', 'Other') DEFAULT 'Desktop',
    status ENUM('IN_STOCK', 'IN_USE', 'BACKUP', 'REPAIR', 'DISPOSED') DEFAULT 'IN_USE',
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
    baseline_snapshot LONGTEXT, -- Stores json baseline configuration
    current_snapshot LONGTEXT,  -- Stores json latest reported configuration
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
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL,
    FOREIGN KEY (location_id) REFERENCES locations(id) ON DELETE SET NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- 5. Hardware Components Detail
CREATE TABLE IF NOT EXISTS asset_ram_slots (
    id INT AUTO_INCREMENT PRIMARY KEY,
    asset_id INT NOT NULL,
    slot_name VARCHAR(50),
    capacity_gb INT,
    manufacturer VARCHAR(100),
    serial_number VARCHAR(100),
    bus_speed VARCHAR(50),
    FOREIGN KEY (asset_id) REFERENCES assets(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS asset_disks (
    id INT AUTO_INCREMENT PRIMARY KEY,
    asset_id INT NOT NULL,
    model VARCHAR(255),
    serial_number VARCHAR(100),
    size_gb INT,
    interface_type VARCHAR(50),
    FOREIGN KEY (asset_id) REFERENCES assets(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 6. Software Installed & License List
CREATE TABLE IF NOT EXISTS asset_software (
    id INT AUTO_INCREMENT PRIMARY KEY,
    asset_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    version VARCHAR(100),
    publisher VARCHAR(255),
    install_date VARCHAR(50),
    license_key VARCHAR(255),
    is_whitelisted BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (asset_id) REFERENCES assets(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 7. Configuration Drift Alerts
CREATE TABLE IF NOT EXISTS drift_alerts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    asset_id INT NOT NULL,
    alert_type ENUM('RAM_CHANGED', 'DISK_REMOVED', 'GPU_CHANGED', 'ROGUE_HARDWARE', 'UNAUTHORIZED_SOFTWARE', 'SOFTWARE_REMOVED') NOT NULL,
    severity ENUM('LOW', 'MEDIUM', 'HIGH', 'CRITICAL') DEFAULT 'MEDIUM',
    title VARCHAR(255) NOT NULL,
    details TEXT,
    is_resolved BOOLEAN DEFAULT FALSE,
    resolved_by VARCHAR(100),
    resolved_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (asset_id) REFERENCES assets(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 8. Lifecycle & Handover History Logs
CREATE TABLE IF NOT EXISTS lifecycle_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    asset_id INT NOT NULL,
    action ENUM('ONBOARDED', 'STATUS_CHANGE', 'HANDOVER', 'REVOKE', 'REPAIR_START', 'REPAIR_END', 'DISPOSED') NOT NULL,
    from_user_id INT,
    to_user_id INT,
    from_status VARCHAR(50),
    to_status VARCHAR(50),
    notes TEXT,
    performed_by VARCHAR(100) DEFAULT 'Admin',
    document_signature TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (asset_id) REFERENCES assets(id) ON DELETE CASCADE,
    FOREIGN KEY (from_user_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (to_user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- 9. Maintenance Schedules
CREATE TABLE IF NOT EXISTS maintenance_schedules (
    id INT AUTO_INCREMENT PRIMARY KEY,
    asset_id INT NOT NULL,
    task_name VARCHAR(255) NOT NULL,
    frequency_months INT DEFAULT 6,
    last_performed DATE,
    next_due DATE NOT NULL,
    status ENUM('PENDING', 'COMPLETED', 'OVERDUE') DEFAULT 'PENDING',
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (asset_id) REFERENCES assets(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 10. Inventory Audits
CREATE TABLE IF NOT EXISTS inventory_audits (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    audit_date DATE NOT NULL,
    auditor_name VARCHAR(100),
    status ENUM('IN_PROGRESS', 'COMPLETED') DEFAULT 'IN_PROGRESS',
    total_scanned INT DEFAULT 0,
    mismatch_count INT DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS audit_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    audit_id INT NOT NULL,
    asset_id INT NOT NULL,
    scanned_location_id INT,
    scanned_user_id INT,
    status ENUM('MATCHED', 'MISPLACED', 'MISSING') DEFAULT 'MATCHED',
    notes TEXT,
    scanned_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (audit_id) REFERENCES inventory_audits(id) ON DELETE CASCADE,
    FOREIGN KEY (asset_id) REFERENCES assets(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 11. Suppliers (Nhà Cung Cấp)
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

-- 12. Khoa (Faculty / Division)
CREATE TABLE IF NOT EXISTS khoa (
    id INT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    manager_name VARCHAR(100),
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 13. Phong (Department / Room under Khoa)
CREATE TABLE IF NOT EXISTS phong (
    id INT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    khoa_id INT NOT NULL,
    location_address VARCHAR(255),
    manager_name VARCHAR(100),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (khoa_id) REFERENCES khoa(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 14. Nhan Vien (Employees)
CREATE TABLE IF NOT EXISTS nhan_vien (
    id INT AUTO_INCREMENT PRIMARY KEY,
    employee_id VARCHAR(50) UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(50),
    phong_id INT,
    position VARCHAR(100),
    status VARCHAR(20) DEFAULT 'ACTIVE',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (phong_id) REFERENCES phong(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- 15. Chuc Danh (Job Titles / Positions)
CREATE TABLE IF NOT EXISTS chuc_danh (
    id INT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 16. Trang Thai Tai San (Asset Status Master)
CREATE TABLE IF NOT EXISTS trang_thai_tai_san (
    id INT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    color_badge VARCHAR(50) DEFAULT 'blue',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 16b. Loai Tai San (Asset Types Master)
CREATE TABLE IF NOT EXISTS loai_tai_san (
    id INT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 17. Kho Luu Tru (Warehouses / Storage)
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
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (phong_id) REFERENCES phong(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- 18. System Users (IAM)
CREATE TABLE IF NOT EXISTS system_users (
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
) ENGINE=InnoDB;

-- 19. System Settings (Key-Value)
CREATE TABLE IF NOT EXISTS system_settings (
    setting_key VARCHAR(50) PRIMARY KEY,
    setting_value LONGTEXT NOT NULL,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 20. Permission Matrix (RBAC)
CREATE TABLE IF NOT EXISTS permission_matrix (
    role_name VARCHAR(50) PRIMARY KEY,
    permissions_json JSON NOT NULL,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- Seed default Trang Thai Tai San
INSERT IGNORE INTO trang_thai_tai_san (code, name, description, color_badge) VALUES
('IN_STOCK', 'Trong Kho (Chờ Cấp Phát)', 'Thiết bị mới nhập kho, chưa được gán cho người sử dụng', 'blue'),
('IN_USE', 'Đang Sử Dụng', 'Thiết bị đã được cấp phát và đang được sử dụng bởi nhân viên', 'green'),
('BACKUP', 'Dự Phòng', 'Thiết bị dự phòng, sẵn sàng thay thế khi cần', 'cyan'),
('REPAIR', 'Đang Bảo Trì / Sửa Chữa', 'Thiết bị đang trong quá trình bảo trì hoặc sửa chữa', 'orange'),
('DISPOSED', 'Đã Thanh Lý / Hủy', 'Thiết bị đã được thanh lý hoặc loại bỏ khỏi hệ thống', 'red');

-- Seed default admin user (password: Admin@123)
INSERT IGNORE INTO system_users (id, username, password_hash, full_name, email, phone, employee_id, role, department_name, job_title, status, auth_method, last_login)
VALUES (1, 'admin_system', '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LPVyEtZRfbm', 'Admin System', 'admin@company.com', '0901234567', 'SYS001', 'ADMIN', 'Công Nghệ Thông Tin (IT Central)', 'Quản Trị Viên Hệ Thống', 'ACTIVE', 'LOCAL', 'Chưa đăng nhập');

