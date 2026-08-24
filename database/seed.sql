-- Seed Data for IT Asset Management System
USE asset_management;

-- Insert Departments
INSERT INTO departments (code, name, manager_name) VALUES
('IT', 'Phòng Công nghệ thông tin', 'Nguyễn Văn Anh'),
('HR', 'Phòng Nhân sự', 'Trần Thị Bình'),
('FIN', 'Phòng Tài chính Kế toán', 'Lê Hoàng Cường'),
('MKT', 'Phòng Marketing', 'Phạm Minh Dũng');

-- Insert Locations
INSERT INTO locations (building, floor, room, description) VALUES
('Tòa nhà A', 'Tầng 2', 'Phòng 201', 'Khu vực Công nghệ thông tin'),
('Tòa nhà A', 'Tầng 3', 'Phòng 305', 'Khu vực Nhân sự & Kế toán'),
('Tòa nhà B', 'Tầng 1', 'Phòng 102', 'Khu vực Marketing & Truyền thông'),
('Tòa nhà A', 'Tầng B1', 'Kho IT', 'Kho lưu trữ & Dự phòng thiết bị');

-- Insert Staff Users
INSERT INTO users (employee_id, full_name, email, phone, department_id) VALUES
('EMP001', 'Nguyễn Văn Anh', 'anh.nguyen@company.com', '0901234567', 1),
('EMP002', 'Trần Thị Bình', 'binh.tran@company.com', '0902345678', 2),
('EMP003', 'Lê Hoàng Cường', 'cuong.le@company.com', '0903456789', 3),
('EMP004', 'Phạm Minh Dũng', 'dung.pham@company.com', '0904567890', 4),
('EMP005', 'Vũ Thị Em', 'em.vu@company.com', '0905678901', 1);

-- Insert Sample Pending Devices (agent reported machines awaiting onboarding)
INSERT INTO devices_pending (agent_id, hostname, domain_workgroup, os_name, ip_address, mac_address, serial_number, hardware_json, software_json, status) VALUES
('AGENT-WIN11-DEV01', 'DESKTOP-DEV01', 'WORKGROUP', 'Windows 11 Pro 64-bit', '192.168.1.105', '00:1A:2B:3C:4D:5E', 'SN-DELL-998877', 
'{"mainboard":{"model":"B560M AORUS PRO","manufacturer":"Gigabyte","serial":"SN-MB-99812"},"cpu":{"name":"11th Gen Intel(R) Core(TM) i7-11700 @ 2.50GHz","cores":8},"ram":{"totalGb":32,"slots":[{"slot":"DIMM 1","sizeGb":16,"manufacturer":"Kingston","serial":"KNG-1122","bus":"3200MHz"},{"slot":"DIMM 2","sizeGb":16,"manufacturer":"Kingston","serial":"KNG-1123","bus":"3200MHz"}]},"disks":[{"model":"Samsung SSD 980 PRO 1TB","serial":"SAMS-NVME-001","sizeGb":1024},{"model":"ST2000DM008 2TB HDD","serial":"ST-HDD-9921","sizeGb":2048}],"gpu":{"name":"NVIDIA GeForce RTX 3060","vramGb":12},"nic":{"name":"Intel Ethernet Controller I225-V","mac":"00:1A:2B:3C:4D:5E","ip":"192.168.1.105"}}',
'[{"name":"Visual Studio Code","version":"1.85.0","publisher":"Microsoft Corporation","licenseKey":"FREE"},{"name":"Docker Desktop","version":"4.26.1","publisher":"Docker Inc","licenseKey":"FREE"}]', 'PENDING'),

('AGENT-WORKSTATION-02', 'WS-DESIGN-02', 'CORP.LOCAL', 'Windows 10 Pro 64-bit', '192.168.1.112', 'A4:BB:6D:1E:2F:90', 'SN-HP-Z4G4-4433', 
'{"mainboard":{"model":"HP Z4 G4 Workstation","manufacturer":"HP","serial":"HP-MB-33411"},"cpu":{"name":"Intel Xeon W-2245 @ 3.90GHz","cores":8},"ram":{"totalGb":64,"slots":[{"slot":"DIMM 1","sizeGb":32,"manufacturer":"Micron","serial":"MIC-661","bus":"2933MHz"},{"slot":"DIMM 2","sizeGb":32,"manufacturer":"Micron","serial":"MIC-662","bus":"2933MHz"}]},"disks":[{"model":"Micron 3400 NVMe 2TB","serial":"MIC-SSD-9912","sizeGb":2048}],"gpu":{"name":"NVIDIA RTX A4000","vramGb":16},"nic":{"name":"Intel I219-LM","mac":"A4:BB:6D:1E:2F:90","ip":"192.168.1.112"}}',
'[{"name":"Adobe Photoshop 2024","version":"25.1","publisher":"Adobe Inc","licenseKey":"SUBS-ADOBE-99182"},{"name":"Autodesk AutoCAD 2024","version":"24.3","publisher":"Autodesk","licenseKey":"AUT-KEY-88271"}]', 'PENDING');

-- Insert Initial Approved Assets
INSERT INTO assets (asset_tag, qr_code, agent_id, hostname, asset_type, status, department_id, location_id, user_id, serial_number, mainboard_model, cpu_model, ram_total_gb, disk_total_gb, gpu_model, os_info, baseline_snapshot, current_snapshot, purchase_date, warranty_months) VALUES
('AST-IT-001', 'AST-IT-001', 'AGENT-WIN11-IT01', 'PC-IT-ADMIN01', 'Desktop', 'IN_USE', 1, 1, 1, 'SN-DELL-771122', 'Dell OptiPlex 7090', '11th Gen Intel i7-11700', 16, 512, 'Intel UHD Graphics 750', 'Windows 11 Pro 64-bit',
'{"ramGb":16,"diskGb":512,"disks":[{"model":"NVMe SSD 512GB","serial":"SN-DISK-1122"}],"software":["Microsoft Office 2021","7-Zip"]}',
'{"ramGb":16,"diskGb":512,"disks":[{"model":"NVMe SSD 512GB","serial":"SN-DISK-1122"}],"software":["Microsoft Office 2021","7-Zip"]}',
'2024-01-15', 36),

('AST-HR-002', 'AST-HR-002', 'AGENT-WIN10-HR01', 'LAPTOP-HR-MANAGER', 'Laptop', 'IN_USE', 2, 2, 2, 'SN-LENOVO-X1C9', 'ThinkPad X1 Carbon Gen 9', '11th Gen Intel i5-1135G7', 16, 512, 'Intel Iris Xe Graphics', 'Windows 10 Pro 64-bit',
'{"ramGb":16,"diskGb":512,"disks":[{"model":"NVMe SSD 512GB","serial":"SN-LEN-9912"}],"software":["Microsoft Office 2021","Zoom"]}',
'{"ramGb":8,"diskGb":512,"disks":[{"model":"NVMe SSD 512GB","serial":"SN-LEN-9912"}],"software":["Microsoft Office 2021","Zoom","Torrent Client"]}',
'2023-11-20', 24),

('AST-STK-003', 'AST-STK-003', NULL, 'SPARE-DESKTOP-01', 'Desktop', 'IN_STOCK', 1, 4, NULL, 'SN-HP-800G6-01', 'HP EliteDesk 800 G6', 'Intel Core i5-10500', 8, 256, 'Intel UHD Graphics 630', 'Windows 10 Pro 64-bit',
'{"ramGb":8,"diskGb":256,"disks":[{"model":"SSD 256GB","serial":"SN-HP-SSD-01"}],"software":[]}',
'{"ramGb":8,"diskGb":256,"disks":[{"model":"SSD 256GB","serial":"SN-HP-SSD-01"}],"software":[]}',
'2024-03-01', 24);

-- Insert Sample Drift Alert (AST-HR-002 RAM reduced from 16GB to 8GB & Torrent Client installed)
INSERT INTO drift_alerts (asset_id, alert_type, severity, title, details, is_resolved) VALUES
(2, 'RAM_CHANGED', 'HIGH', 'Phát hiện thay đổi dung lượng RAM', 'Dung lượng RAM bị giảm từ 16GB (Baseline) xuống còn 8GB (Hiện tại). Nghi vấn bị tháo bớt thanh RAM.', FALSE),
(2, 'UNAUTHORIZED_SOFTWARE', 'MEDIUM', 'Phát hiện phần mềm ngoài danh mục cho phép', 'Phần mềm Torrent Client (v2.2.1) được cài đặt trên máy. Không nằm trong Whitelist phần mềm công ty.', FALSE);

-- Insert Sample Maintenance Schedules
INSERT INTO maintenance_schedules (asset_id, task_name, frequency_months, last_performed, next_due, status, notes) VALUES
(1, 'Bảo trì & Vệ sinh máy định kỳ 6 tháng', 6, '2024-02-01', '2024-08-01', 'OVERDUE', 'Cần hút bụi quạt CPU và tra keo tản nhiệt'),
(2, 'Kiểm tra phần cứng & Cập nhật Windows Security', 6, '2024-03-15', '2024-09-15', 'PENDING', 'Kiểm tra lại dung lượng RAM hụt');

-- Insert Sample Lifecycle Log
INSERT INTO lifecycle_logs (asset_id, action, from_user_id, to_user_id, from_status, to_status, notes, performed_by) VALUES
(1, 'ONBOARDED', NULL, 1, 'IN_STOCK', 'IN_USE', 'Bàn giao máy trạm mới cho Trưởng phòng IT', 'IT Admin'),
(2, 'ONBOARDED', NULL, 2, 'IN_STOCK', 'IN_USE', 'Bàn giao Laptop ThinkPad cho Trưởng phòng HR', 'IT Admin');
