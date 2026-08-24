const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const db = require('./config/db');

const path = require('path');
const fs = require('fs');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Static docs serving & upload endpoint
const docsDir = path.join(__dirname, '../docs');
if (!fs.existsSync(docsDir)) {
    fs.mkdirSync(docsDir, { recursive: true });
}
app.use('/docs', express.static(docsDir));

app.post('/api/upload', (req, res) => {
    try {
        const { filename, fileData } = req.body;
        if (!filename || !fileData) {
            return res.status(400).json({ error: 'Filename and fileData are required' });
        }
        const base64Data = fileData.replace(/^data:.*?;base64,/, '');
        const filePath = path.join(docsDir, filename);
        fs.writeFileSync(filePath, Buffer.from(base64Data, 'base64'));
        return res.json({ status: 'success', filename, url: `/docs/${filename}` });
    } catch (err) {
        console.error('File upload error:', err);
        return res.status(500).json({ error: err.message });
    }
});

// Middleware & Controllers
const { verifyAgentSignature } = require('./middleware/auth');
const agentController = require('./controllers/agentController');
const discoveryController = require('./controllers/discoveryController');
const assetController = require('./controllers/assetController');
const driftController = require('./controllers/driftController');
const lifecycleController = require('./controllers/lifecycleController');
const maintenanceController = require('./controllers/maintenanceController');
const auditController = require('./controllers/auditController');
const khoaPhongController = require('./controllers/khoaPhongController');
const employeeController = require('./controllers/employeeController');
const chucDanhController = require('./controllers/chucDanhController');
const loaiTaiSanController = require('./controllers/loaiTaiSanController');
const trangThaiController = require('./controllers/trangThaiController');
const nhaCungCapController = require('./controllers/nhaCungCapController');
const khoLuuTruController = require('./controllers/khoLuuTruController');
const settingsController = require('./controllers/settingsController');
const userController = require('./controllers/userController');

// System Settings & Branding Routes
app.get('/api/settings', settingsController.getSettings);
app.post('/api/settings', settingsController.saveSettings);

// System Users Management Routes (IAM) & Profile
app.get('/api/users', userController.getUsers);
app.post('/api/users/login', userController.loginUser);
app.get('/api/users/profile', userController.getProfile);
app.put('/api/users/profile', userController.updateProfile);
app.post('/api/users', userController.createUser);
app.put('/api/users/:id', userController.updateUser);
app.delete('/api/users/:id', userController.deleteUser);
app.patch('/api/users/:id/toggle-status', userController.toggleStatus);
app.get('/api/permissions/matrix', userController.getPermissionMatrix);
app.post('/api/permissions/matrix', userController.savePermissionMatrix);

// 0. Dashboard Stats Route
app.get('/api/dashboard/stats', auditController.getDashboardStats);

// 1. Agent Routes
app.post('/api/agent/report', verifyAgentSignature, agentController.reportData);
app.post('/api/agent/trigger-scan', agentController.triggerRealHostScan);

// 2. Discovery & Onboarding Routes
app.get('/api/discovery', discoveryController.getPendingDevices);
app.get('/api/discovery/subnets', discoveryController.getSubnets);
app.post('/api/discovery/scan-network', discoveryController.scanNetworkSubnet);
app.post('/api/discovery/approve', discoveryController.approveDevice);
app.post('/api/discovery/reject', discoveryController.rejectDevice);
app.delete('/api/discovery/clear-all', discoveryController.clearAllPending);
app.delete('/api/discovery/:id', discoveryController.deletePendingDevice);

// 3. Asset Management Routes
app.get('/api/assets', assetController.getAssets);
app.post('/api/assets', assetController.createManualAsset);
app.get('/api/assets/metadata', assetController.getMetadata);
app.get('/api/assets/:id', assetController.getAssetById);
app.put('/api/assets/:id/procurement', assetController.updateProcurement);

// 4. Master Data: Khoa & Phòng Routes
app.get('/api/khoa', khoaPhongController.getKhoaList);
app.post('/api/khoa', khoaPhongController.createKhoa);
app.put('/api/khoa/:id', khoaPhongController.updateKhoa);
app.delete('/api/khoa/:id', khoaPhongController.deleteKhoa);

app.get('/api/phong', khoaPhongController.getPhongList);
app.post('/api/phong', khoaPhongController.createPhong);
app.put('/api/phong/:id', khoaPhongController.updatePhong);
app.delete('/api/phong/:id', khoaPhongController.deletePhong);

// 5. Master Data: Employee / Nhân Viên Routes
app.get('/api/employees', employeeController.getEmployees);
app.post('/api/employees', employeeController.createEmployee);
app.put('/api/employees/:id', employeeController.updateEmployee);
app.patch('/api/employees/:id/toggle-status', employeeController.toggleStatus);
app.delete('/api/employees/:id', employeeController.deleteEmployee);

// 6. Master Data: Job Titles / Chức Danh Routes
app.get('/api/chuc-danh', chucDanhController.getChucDanhList);
app.post('/api/chuc-danh', chucDanhController.createChucDanh);
app.put('/api/chuc-danh/:id', chucDanhController.updateChucDanh);
app.delete('/api/chuc-danh/:id', chucDanhController.deleteChucDanh);

// 7. Master Data: Asset Types / Loại Tài Sản Routes
app.get('/api/loai-tai-san', loaiTaiSanController.getLoaiTaiSan);
app.post('/api/loai-tai-san', loaiTaiSanController.createLoaiTaiSan);
app.put('/api/loai-tai-san/:id', loaiTaiSanController.updateLoaiTaiSan);
app.delete('/api/loai-tai-san/:id', loaiTaiSanController.deleteLoaiTaiSan);

// 8. Master Data: Asset Statuses / Trạng Thái Tài Sản Routes
app.get('/api/trang-thai-tai-san', trangThaiController.getTrangThaiList);
app.post('/api/trang-thai-tai-san', trangThaiController.createTrangThai);
app.put('/api/trang-thai-tai-san/:id', trangThaiController.updateTrangThai);
app.delete('/api/trang-thai-tai-san/:id', trangThaiController.deleteTrangThai);

// 9. Master Data: Suppliers / Nhà Cung Cấp Routes
app.get('/api/nha-cung-cap', nhaCungCapController.getNhaCungCap);
app.post('/api/nha-cung-cap', nhaCungCapController.createNhaCungCap);
app.put('/api/nha-cung-cap/:id', nhaCungCapController.updateNhaCungCap);
app.delete('/api/nha-cung-cap/:id', nhaCungCapController.deleteNhaCungCap);

// 10. Master Data: Warehouses / Kho Lưu Trữ Routes
app.get('/api/kho-luu-tru', khoLuuTruController.getKhoLuuTru);
app.post('/api/kho-luu-tru', khoLuuTruController.createKhoLuuTru);
app.put('/api/kho-luu-tru/:id', khoLuuTruController.updateKhoLuuTru);
app.delete('/api/kho-luu-tru/:id', khoLuuTruController.deleteKhoLuuTru);

// 9. Drift Detection & Compliance Routes
app.get('/api/drifts', driftController.getAlerts);
app.post('/api/drifts/:id/resolve', driftController.resolveAlert);

// 10. Lifecycle Log Routes
app.post('/api/lifecycle/transfer', lifecycleController.transferAsset);
app.get('/api/lifecycle/logs', lifecycleController.getLogs);

// 11. Maintenance Ticket Routes
app.get('/api/maintenance', maintenanceController.getSchedules);

// Health Check
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', message: 'IT Asset Management Backend API is running smoothly' });
});

// Initialize DB Connection and Start Server
db.initDB()
    .then(() => {
        app.listen(PORT, () => {
            console.log(`=======================================================`);
            console.log(` IT Asset Management Backend API Server running on port ${PORT}`);
            console.log(` API Health Check: http://localhost:${PORT}/api/health`);
            console.log(`=======================================================`);
        });
    })
    .catch((err) => {
        console.error('Failed to initialize database:', err);
        process.exit(1);
    });
