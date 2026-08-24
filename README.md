# 🛡️ IT AssetGuard Enterprise - Hệ Thống Quản Lý Tài Sản IT Tập Trung & Tự Động Định Danh Agent

Hệ thống **IT AssetGuard Enterprise** là giải pháp toàn diện cho việc quản lý, theo dõi vòng đời, lập phiếu bảo trì, thanh lý, và giám sát biến động cấu hình phần cứng/phần mềm máy trạm tự động thông qua Agent.

---

## 📐 Kiến Trúc & Công Nghệ Trọng Tâm

* **Frontend**: React (Vite 5), Vanilla CSS / TailwindCSS, Lucide Icons, Glassmorphism UI, Responsive Light/Dark Mode.
* **Backend**: Node.js (Express 4), MySQL Connection Pool, Auto Table Migrations, RESTful APIs.
* **Agent Service**: C# .NET Core Background Worker / PowerShell Agent Script (Tự động thu thập thông tin phần cứng RAM/Disk/CPU, phần mềm cài đặt & định danh địa chỉ IP/MAC).
* **Bảo mật & Phân quyền**: Ma trận phân quyền động RBAC (Role-Based Access Control) cho 4 vai trò tiêu chuẩn (`ADMIN`, `MANAGER`, `STAFF`, `VIEWER`).

---

## 📁 Cấu Trúc Thư Mục Dự Án

```text
AssetManagement/
├── backend/                   # Node.js Express API Server
│   ├── src/
│   │   ├── config/            # Kết nối Database MySQL & Settings
│   │   ├── controllers/       # Xử lý logic API (Assets, Users, Discovery, Drift...)
│   │   ├── middleware/        # Authentication & Authorization
│   │   ├── services/          # Real-time Network Scanner & Drift Engine
│   │   └── server.js          # Entrypoint server (Cổng 5000)
│   └── package.json
├── frontend/                  # React Vite Single Page Application
│   ├── src/
│   │   ├── components/        # Sidebar, Navbar, Footer, Modals...
│   │   ├── pages/             # Dashboard, AssetsList, UsersManagement, Settings...
│   │   ├── App.jsx            # Main App Router & RBAC Protection
│   │   └── index.css          # Design Tokens & Styling
│   └── package.json
├── agent/                     # Mã nguồn C# .NET Worker Agent
├── database/                  # File khởi tạo CSDL
│   ├── schema.sql             # Cấu trúc bảng MySQL
│   └── seed.sql               # Dữ liệu mẫu khởi tạo
├── IT_Asset_Agent_Package/    # Đóng gói Agent thu thập dữ liệu máy trạm
│   ├── install_as_startup_task.bat
│   └── IT_Asset_Agent.ps1
├── start_system.bat           # Script khởi động tự động Hệ thống (Backend + Frontend)
├── start_test.bat             # Script chạy môi trường kiểm thử
├── .gitignore
└── README.md
```

---

## 🚀 Hướng Dẫn Triển Khai (Deployment Guide)

### 1. Yêu Cầu Môi Trường
* **Node.js**: phiên bản `>= 18.x`
* **MySQL Database Server**: phiên bản `>= 8.0` hoặc MariaDB `>= 10.4`
* **Web Browser**: Google Chrome, Microsoft Edge, Firefox phiên bản mới nhất

---

### 2. Bước 1: Khởi Tạo CSDL MySQL
1. Đăng nhập vào MySQL Admin (MySQL Workbench / phpMyAdmin / CLI):
   ```sql
   CREATE DATABASE IF NOT EXISTS asset_management CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```
2. Import file cấu trúc bảng và dữ liệu khởi tạo:
   ```bash
   mysql -u root -p asset_management < database/schema.sql
   mysql -u root -p asset_management < database/seed.sql
   ```

---

### 3. Bước 2: Triển Khai Backend API Server (Node.js)
1. Mở file kết nối CSDL `backend/src/config/db.js` và cập nhật thông tin MySQL:
   ```javascript
   const pool = mysql.createPool({
     host: process.env.DB_HOST || 'localhost',
     user: process.env.DB_USER || 'root',
     password: process.env.DB_PASSWORD || 'your_mysql_password',
     database: process.env.DB_NAME || 'asset_management',
     port: process.env.DB_PORT || 3306
   });
   ```
2. Cài đặt các gói phụ thuộc và khởi chạy server:
   ```bash
   cd backend
   npm install
   npm start
   ```
   *(Backend Server sẽ chạy tại port **5000**: `http://localhost:5000`)*.

---

### 4. Bước 3: Triển Khai Frontend App (React UI)
1. Cài đặt packages & build bản sản xuất:
   ```bash
   cd frontend
   npm install
   npm run build
   ```
2. Hoặc khởi chạy máy chủ phát triển (Dev Server):
   ```bash
   npm run dev
   ```
   *(Giao diện ứng dụng sẽ sẵn sàng tại: `http://localhost:3000`)*.

---

### 5. Bước 4: Triển Khai Agent Thu Thập Tự Động Trên Máy Trạm
Để máy trạm tự động quét và gửi cấu hình về hệ thống:
1. Sao chép thư mục `IT_Asset_Agent_Package` tới máy trạm.
2. Chạy file `install_as_startup_task.bat` dưới quyền **Administrator** để thiết lập Task Scheduler chạy tự động khi khởi động Windows.
3. Thông số thiết bị phát hiện mới sẽ tự động đẩy về trang **"Thiết Bị Chờ Duyệt (Discovery Queue)"**.

---

## ⚡ Hướng Dẫn Khởi Động Nhanh Bằng 1-Click

Trên hệ điều hành Windows, bạn chỉ cần nhấp đúp vào file script đóng gói sẵn tại thư mục gốc:

* 🚀 **`start_system.bat`**: Tự động kích hoạt Backend API Server và mở ứng dụng Web Frontend.
* 🧪 **`start_test.bat`**: Chạy môi trường kiểm thử với dữ liệu giả lập.

---

## 🔑 Tài Khoản Đăng Nhập Mặc Định

| Tên Đăng Nhập (Username) | Mật Khẩu | Vai Trò (Role) | Quyền Hạn |
| :--- | :--- | :--- | :--- |
| **`admin_system`** | `123456` | **ADMIN** | Toàn quyền Quản trị & Ma trận phân quyền |
| **`manager_it`** | `123456` | **MANAGER** | Quản lý IT (Bàn giao, Phê duyệt, Bảo trì) |
| **`user_binh`** | `123456` | **STAFF** | Kỹ thuật viên / Nhân viên |

---

## 🛡️ Ma Trận Phân Quyền Vai Trò (RBAC Matrix)

Hệ thống hỗ trợ Ma trận phân quyền 2 chiều linh hoạt tại trang **Quản Trị Hệ Thống -> Người Dùng -> Ma Trận Phân Quyền**:
* 📦 **Quản Lý Tài Sản IT**: Xem, Thêm mới, Sửa PO, Bàn giao, Thu hồi, Bảo trì, Thanh lý, In mã QR.
* 📡 **Khám Phá Discovery**: Xem danh sách máy tự động phát hiện, Phê duyệt, Từ chối.
* ⚠️ **Giám Sát Biến Động**: Xem cảnh báo biến động RAM/Disk, Xử lý Baseline.
* 🏢 **Master Data**: Quản lý Khoa/Phòng, Nhân viên, Loại tài sản, Kho lưu trữ, Nhà cung cấp.
* ⚙️ **Quản Trị Hệ Thống**: Quản lý người dùng, Ma trận phân quyền, Cấu hình Favicon & Đơn vị.

---

## 📄 License & Bản Quyền

© 2026 **IT AssetGuard Enterprise**. Tất cả quyền được bảo lưu.  
Phát triển bởi **Google DeepMind Team & Advanced Agentic Engineering**.
