import React, { useState, useEffect, useMemo } from 'react';
import { 
  Users, 
  UserPlus, 
  Search, 
  ShieldCheck, 
  ShieldAlert, 
  Key, 
  Lock, 
  Unlock, 
  Edit3, 
  Trash2, 
  Building2, 
  Mail, 
  Phone, 
  User, 
  CheckCircle2, 
  X, 
  Check, 
  Laptop, 
  Briefcase, 
  Shield, 
  UserCheck, 
  Eye, 
  RotateCcw,
  Sparkles,
  HelpCircle,
  AlertTriangle,
  FolderTree,
  Monitor,
  Radio,
  QrCode,
  Settings,
  ChevronDown,
  Package,
  Layers,
  Grid
} from 'lucide-react';
import { apiUrl } from '../utils/api';

export default function UsersManagement({ metadata = { departments: [], users: [] }, theme }) {
  const isLight = theme === 'light';
  const cardClass = isLight ? 'glass-card-light' : 'glass-card-dark';

  // SubTab Navigation: 'USERS' or 'MATRIX'
  const [activeSubTab, setActiveSubTab] = useState('USERS');

  // Employee list loaded from API or metadata
  const [employeeList, setEmployeeList] = useState([
    { id: 1, employee_id: 'EMP001', full_name: 'Nguyễn Văn Anh', email: 'anh.nguyen@company.com', phone: '0901234567', department_name: 'Công Nghệ Thông Tin (IT Central)' },
    { id: 2, employee_id: 'EMP002', full_name: 'Trần Thị Bình', email: 'binh.tran@company.com', phone: '0902345678', department_name: 'Nhân Sự & Hành Chính' },
    { id: 3, employee_id: 'EMP003', full_name: 'Lê Hoàng Cường', email: 'cuong.le@company.com', phone: '0903456789', department_name: 'Kế Toán & Tài Chính' },
    { id: 4, employee_id: 'EMP004', full_name: 'Phạm Minh Dũng', email: 'dung.pham@company.com', phone: '0904567890', department_name: 'Khoa Khám Bệnh' }
  ]);

  // Fetch employees from API on mount
  useEffect(() => {
    fetch(apiUrl('/api/employees'))
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setEmployeeList(data);
        }
      })
      .catch(err => console.warn('Employee API fetch notice:', err));
  }, []);

  // Seed initial system users
  const [usersList, setUsersList] = useState([
    {
      id: 1,
      username: 'admin_system',
      fullName: 'Admin System',
      email: 'admin@company.com',
      phone: '0901234567',
      employeeId: 'SYS001',
      role: 'ADMIN',
      departmentName: 'Công Nghệ Thông Tin (IT Central)',
      jobTitle: 'Quản Trị Viên Hệ Thống',
      status: 'ACTIVE',
      lastLogin: 'Vừa xong',
      authMethod: 'LOCAL'
    },
    {
      id: 2,
      username: 'manager_it',
      fullName: 'Nguyễn Văn Anh',
      email: 'anh.nguyen@company.com',
      phone: '0902345678',
      employeeId: 'EMP001',
      role: 'MANAGER',
      departmentName: 'Công Nghệ Thông Tin (IT Central)',
      jobTitle: 'Trưởng Phòng IT',
      status: 'ACTIVE',
      lastLogin: 'Hôm nay, 08:30',
      authMethod: 'SSO / LDAP'
    },
    {
      id: 3,
      username: 'user_binh',
      fullName: 'Trần Thị Bình',
      email: 'binh.tran@company.com',
      phone: '0903456789',
      employeeId: 'EMP002',
      role: 'STAFF',
      departmentName: 'Nhân Sự & Hành Chính',
      jobTitle: 'Chuyên Viên HR',
      status: 'ACTIVE',
      lastLogin: 'Hôm qua, 16:45',
      authMethod: 'SSO / LDAP'
    },
    {
      id: 4,
      username: 'user_cuong',
      fullName: 'Lê Hoàng Cường',
      email: 'cuong.le@company.com',
      phone: '0904567890',
      employeeId: 'EMP003',
      role: 'VIEWER',
      departmentName: 'Kế Toán & Tài Chính',
      jobTitle: 'Kế Toán Trưởng',
      status: 'INACTIVE',
      lastLogin: '3 ngày trước',
      authMethod: 'LOCAL'
    }
  ]);

  // Fetch users from API on mount
  useEffect(() => {
    fetch(apiUrl('/api/users'))
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setUsersList(data);
        }
      })
      .catch(err => console.warn('User API fetch notice:', err));
  }, []);

  // PERMISSION MATRIX STATE & LOGIC
  const defaultMatrix = useMemo(() => ({
    ADMIN: {
      asset_view: true, asset_create: true, asset_edit: true, asset_allocate: true, asset_revoke: true, asset_maintenance: true, asset_dispose: true, asset_print_qr: true,
      discovery_view: true, discovery_approve: true, discovery_reject: true,
      drift_view: true, drift_resolve: true,
      master_view: true, master_edit: true,
      iam_users: true, iam_matrix: true, system_settings: true
    },
    MANAGER: {
      asset_view: true, asset_create: true, asset_edit: true, asset_allocate: true, asset_revoke: true, asset_maintenance: true, asset_dispose: false, asset_print_qr: true,
      discovery_view: true, discovery_approve: true, discovery_reject: true,
      drift_view: true, drift_resolve: true,
      master_view: true, master_edit: true,
      iam_users: false, iam_matrix: false, system_settings: false
    },
    STAFF: {
      asset_view: true, asset_create: true, asset_edit: true, asset_allocate: true, asset_revoke: true, asset_maintenance: true, asset_dispose: false, asset_print_qr: true,
      discovery_view: true, discovery_approve: false, discovery_reject: false,
      drift_view: true, drift_resolve: false,
      master_view: true, master_edit: false,
      iam_users: false, iam_matrix: false, system_settings: false
    },
    VIEWER: {
      asset_view: true, asset_create: false, asset_edit: false, asset_allocate: false, asset_revoke: false, asset_maintenance: false, asset_dispose: false, asset_print_qr: false,
      discovery_view: true, discovery_approve: false, discovery_reject: false,
      drift_view: true, drift_resolve: false,
      master_view: true, master_edit: false,
      iam_users: false, iam_matrix: false, system_settings: false
    }
  }), []);

  const [matrixData, setMatrixData] = useState(defaultMatrix);
  const [savingMatrix, setSavingMatrix] = useState(false);
  const [matrixSaveSuccess, setMatrixSaveSuccess] = useState(false);

  useEffect(() => {
    fetch(apiUrl('/api/permissions/matrix'))
      .then(res => res.json())
      .then(data => {
        if (data && typeof data === 'object' && Object.keys(data).length > 0) {
          setMatrixData(prev => ({ ...prev, ...data }));
        }
      })
      .catch(err => console.warn('Matrix fetch error:', err));
  }, []);

  const handleTogglePermission = (role, key) => {
    if (role === 'ADMIN' && (key === 'iam_matrix' || key === 'iam_users')) {
      alert('Không thể khóa quyền Quản trị tài khoản & Ma trận đối với vai trò ADMIN!');
      return;
    }
    setMatrixData(prev => ({
      ...prev,
      [role]: {
        ...prev[role],
        [key]: !prev[role]?.[key]
      }
    }));
  };

  const handleSaveMatrix = async () => {
    setSavingMatrix(true);
    try {
      const res = await fetch(apiUrl('/api/permissions/matrix'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(matrixData)
      });
      if (res.ok) {
        setMatrixSaveSuccess(true);
        setTimeout(() => setMatrixSaveSuccess(false), 3000);
      } else {
        alert('Có lỗi xảy ra khi lưu ma trận phân quyền.');
      }
    } catch (err) {
      console.error(err);
      alert('Lỗi kết nối máy chủ: ' + err.message);
    } finally {
      setSavingMatrix(false);
    }
  };

  const handleResetMatrix = () => {
    if (window.confirm('Bạn có chắc chắn muốn khôi phục ma trận phân quyền về mặc định ban đầu?')) {
      setMatrixData(defaultMatrix);
    }
  };

  const PERMISSION_MODULES = [
    {
      category: '📦 Quản Lý Tài Sản IT (Asset Management)',
      icon: Package,
      items: [
        { key: 'asset_view', label: 'Xem danh sách & chi tiết tài sản', desc: 'Truy cập danh sách máy trạm, thiết bị mạng, máy in' },
        { key: 'asset_create', label: 'Khởi tạo tài sản mới thủ công', desc: 'Thêm thiết bị mới không qua Agent scan' },
        { key: 'asset_edit', label: 'Chỉnh sửa cấu hình & thông tin PO', desc: 'Cập nhật ngày mua, giá, khấu hao, ghi chú' },
        { key: 'asset_allocate', label: 'Cấp phát / Bàn giao tài sản', desc: 'Gán tài sản cho nhân viên hoặc phòng ban' },
        { key: 'asset_revoke', label: 'Thu hồi tài sản về Kho IT Central', desc: 'Thu hồi tài sản đang sử dụng về kho' },
        { key: 'asset_maintenance', label: 'Lập phiếu & Hoàn tất bảo trì', desc: 'Chuyển tài sản sang bảo trì và nghiệm thu' },
        { key: 'asset_dispose', label: 'Làm thủ tục xuất hủy / thanh lý', desc: 'Quy trình thanh lý tài sản hết hạn' },
        { key: 'asset_print_qr', label: 'Xem & In tem mã QR / Barcode', desc: 'Tạo mã QR in tem dán lên thiết bị' },
      ]
    },
    {
      category: '📡 Khám Phá & Định Danh (Discovery Queue)',
      icon: Radio,
      items: [
        { key: 'discovery_view', label: 'Xem danh sách máy tự động phát hiện', desc: 'Nhận thiết bị mới từ Agent discovery' },
        { key: 'discovery_approve', label: 'Phê duyệt thiết bị mới vào danh mục', desc: 'Gán mã tài sản và phê duyệt sử dụng' },
        { key: 'discovery_reject', label: 'Từ chối / Loại bỏ thiết bị phát hiện', desc: 'Xóa thiết bị khỏi hàng chờ duyệt' },
      ]
    },
    {
      category: '⚠️ Giám Sát Biến Động Cấu Hình (Drift Alerts)',
      icon: AlertTriangle,
      items: [
        { key: 'drift_view', label: 'Xem cảnh báo biến động RAM/Disk/Hardware', desc: 'Nhận thông báo khi thiết bị thay đổi phần cứng' },
        { key: 'drift_resolve', label: 'Xử lý & Cập nhật Baseline phần cứng', desc: 'Xác nhận biến động và ghi đè cấu hình chuẩn' },
      ]
    },
    {
      category: '🏢 Danh Mục Master Data (Khoa, Phòng, NV, Loại TS, Kho)',
      icon: Layers,
      items: [
        { key: 'master_view', label: 'Xem danh mục Khoa, Phòng, Nhân viên', desc: 'Truy xuất sơ đồ tổ chức & danh mục thiết bị' },
        { key: 'master_edit', label: 'Thêm / Sửa / Xóa dữ liệu danh mục', desc: 'Quản lý phòng ban, nhân sự, kho lưu trữ' },
      ]
    },
    {
      category: '⚙️ Quản Trị Hệ Thống (IAM Users & System Settings)',
      icon: Settings,
      items: [
        { key: 'iam_users', label: 'Quản lý tài khoản hệ thống (Tạo/Sửa/Khóa)', desc: 'Cấp tài khoản và reset mật khẩu' },
        { key: 'iam_matrix', label: 'Cấu hình Ma Trận Phân Quyền (RBAC)', desc: 'Bật/tắt phân quyền cho từng vai trò' },
        { key: 'system_settings', label: 'Cấu hình thông tin Công ty / Favicon', desc: 'Thay đổi tên đơn vị, địa chỉ, logo, favicon' },
      ]
    }
  ];

  // Search & Filters state
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Drawer & Modal state
  const [userDrawerOpen, setUserDrawerOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  // Reset password modal state
  const [resetPassModal, setResetPassModal] = useState(null);
  const [newGeneratedPass, setNewGeneratedPass] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    selectedEmpId: '',
    fullName: '',
    email: '',
    phone: '',
    employeeId: '',
    role: 'STAFF',
    departmentName: '',
    status: 'ACTIVE'
  });

  // Calculate Statistics
  const stats = useMemo(() => {
    const total = usersList.length;
    const adminCount = usersList.filter(u => u.role === 'ADMIN').length;
    const managerCount = usersList.filter(u => u.role === 'MANAGER').length;
    const staffCount = usersList.filter(u => u.role === 'STAFF').length;
    const viewerCount = usersList.filter(u => u.role === 'VIEWER').length;
    const activeCount = usersList.filter(u => u.status === 'ACTIVE').length;
    return { total, adminCount, managerCount, staffCount, viewerCount, activeCount };
  }, [usersList]);

  // Filtered Users
  const filteredUsers = useMemo(() => {
    return usersList.filter(user => {
      const matchesSearch = !searchTerm ||
        user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (user.employeeId && user.employeeId.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (user.departmentName && user.departmentName.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesRole = roleFilter === 'ALL' || user.role === roleFilter;
      const matchesStatus = statusFilter === 'ALL' || user.status === statusFilter;

      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [usersList, searchTerm, roleFilter, statusFilter]);

  // Combobox Search State for Employee Selection
  const [empSearchInput, setEmpSearchInput] = useState('');
  const [empDropdownOpen, setEmpDropdownOpen] = useState(false);

  // Filtered employee options for combobox
  const filteredEmployeeOptions = useMemo(() => {
    if (!empSearchInput) return employeeList;
    const query = empSearchInput.toLowerCase();
    return employeeList.filter(emp => {
      const name = (emp.full_name || emp.fullName || '').toLowerCase();
      const id = (emp.employee_id || emp.id || '').toLowerCase();
      const email = (emp.email || '').toLowerCase();
      const dept = (emp.department_name || emp.departmentName || '').toLowerCase();
      return name.includes(query) || id.includes(query) || email.includes(query) || dept.includes(query);
    });
  }, [employeeList, empSearchInput]);

  const handleSelectEmployee = (empId) => {
    const selectedEmp = employeeList.find(e => String(e.id) === String(empId) || String(e.employee_id) === String(empId));
    if (selectedEmp) {
      const empName = selectedEmp.full_name || selectedEmp.fullName || '';
      setEmpSearchInput(empName);
      setFormData(prev => ({
        ...prev,
        selectedEmpId: empId,
        employeeId: selectedEmp.employee_id || selectedEmp.id,
        fullName: empName,
        email: selectedEmp.email || prev.email,
        phone: selectedEmp.phone || prev.phone,
        departmentName: selectedEmp.department_name || selectedEmp.departmentName || 'Công Nghệ Thông Tin'
      }));
    }
    setEmpDropdownOpen(false);
  };

  const handleOpenCreateDrawer = () => {
    setEditingUser(null);
    setFormData({
      username: '',
      password: '',
      selectedEmpId: '',
      fullName: '',
      email: '',
      phone: '',
      employeeId: '',
      role: 'STAFF',
      departmentName: '',
      status: 'ACTIVE'
    });
    setEmpSearchInput('');
    setUserDrawerOpen(true);
  };

  const handleOpenEditDrawer = (user) => {
    setEditingUser(user);
    setFormData({
      username: user.username || '',
      password: '',
      selectedEmpId: user.employeeId || '',
      fullName: user.fullName || '',
      email: user.email || '',
      phone: user.phone || '',
      employeeId: user.employeeId || '',
      role: user.role || 'STAFF',
      departmentName: user.departmentName || '',
      status: user.status || 'ACTIVE'
    });
    setEmpSearchInput(user.fullName || '');
    setUserDrawerOpen(true);
  };

  const handleSaveUserSubmit = async (e) => {
    e.preventDefault();
    if (!formData.username.trim()) {
      alert('Vui lòng nhập tên tài khoản (Username)!');
      return;
    }
    if (!formData.fullName.trim()) {
      alert('Vui lòng nhập Họ & Tên người dùng!');
      return;
    }

    try {
      if (editingUser) {
        const res = await fetch(apiUrl(`/api/users/${editingUser.id}`), {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
        const data = await res.json();
        if (res.ok) {
          setUsersList(prev => prev.map(u => u.id === editingUser.id ? { ...u, ...formData } : u));
        } else {
          alert(data.error || 'Có lỗi khi cập nhật tài khoản');
        }
      } else {
        const res = await fetch(apiUrl('/api/users'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
        const data = await res.json();
        if (res.ok) {
          setUsersList(prev => [data.user || { id: Date.now(), ...formData, lastLogin: 'Vừa tạo' }, ...prev]);
        } else {
          alert(data.error || 'Có lỗi khi tạo tài khoản người dùng');
        }
      }
    } catch (err) {
      console.error('Save user API error:', err);
      if (editingUser) {
        setUsersList(prev => prev.map(u => u.id === editingUser.id ? { ...u, ...formData } : u));
      } else {
        setUsersList(prev => [{ id: Date.now(), ...formData, lastLogin: 'Chưa đăng nhập' }, ...prev]);
      }
    }

    setUserDrawerOpen(false);
  };

  const handleToggleUserStatus = async (userId) => {
    setUsersList(prev => prev.map(u => {
      if (u.id === userId) {
        const nextStatus = u.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
        return { ...u, status: nextStatus };
      }
      return u;
    }));

    try {
      await fetch(apiUrl(`/api/users/${userId}/toggle-status`), { method: 'PATCH' });
    } catch (e) {
      console.warn('Toggle status API error:', e);
    }
  };

  const [confirmDeleteModal, setConfirmDeleteModal] = useState(null);

  const handleConfirmDelete = async () => {
    if (confirmDeleteModal) {
      const targetId = confirmDeleteModal.id;
      setUsersList(prev => prev.filter(u => u.id !== targetId));
      setConfirmDeleteModal(null);

      try {
        await fetch(apiUrl(`/api/users/${targetId}`), { method: 'DELETE' });
      } catch (e) {
        console.warn('Delete user API error:', e);
      }
    }
  };

  const handleTriggerResetPassword = (user) => {
    const randomPass = 'Pass@' + Math.floor(100000 + Math.random() * 900000);
    setNewGeneratedPass(randomPass);
    setResetPassModal(user);
  };

  const getRoleBadge = (role) => {
    switch (role) {
      case 'ADMIN':
        return {
          label: 'Quản trị viên',
          color: isLight ? 'bg-rose-50 text-rose-700 border-rose-200' : 'bg-rose-500/10 text-rose-400 border-rose-500/30',
          icon: ShieldAlert
        };
      case 'MANAGER':
        return {
          label: 'Quản lý IT',
          color: isLight ? 'bg-cyan-50 text-cyan-700 border-cyan-200' : 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
          icon: ShieldCheck
        };
      case 'STAFF':
        return {
          label: 'Nhân viên',
          color: isLight ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
          icon: UserCheck
        };
      default:
        return {
          label: 'Chỉ xem',
          color: isLight ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-amber-500/10 text-amber-400 border-amber-500/30',
          icon: Eye
        };
    }
  };

  return (
    <div className="space-y-6 w-full pb-12">
      
      {/* TOP NAVIGATION SUB-TAB SWITCHER */}
      <div className="flex items-center justify-between border-b pb-4 border-slate-200 dark:border-slate-800">
        <div>
          <h2 className={`text-xl font-black tracking-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>
            Quản Lý Tài Khoản System & Ma Trận Phân Quyền (IAM)
          </h2>
          <p className="text-xs text-slate-500 font-medium">Phân quyền truy cập theo vai trò (RBAC) & quản trị người dùng hệ thống</p>
        </div>

        <div className={`p-1.5 rounded-2xl border flex items-center gap-1.5 ${
          isLight ? 'bg-slate-100 border-slate-200' : 'bg-slate-900 border-slate-800'
        }`}>
          <button
            onClick={() => setActiveSubTab('USERS')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeSubTab === 'USERS'
                ? 'bg-cyan-600 text-white shadow-md shadow-cyan-600/20'
                : (isLight ? 'text-slate-600 hover:text-slate-900' : 'text-slate-400 hover:text-white')
            }`}
          >
            <Users className="w-4 h-4" /> Danh Sách Tài Khoản ({usersList.length})
          </button>
          <button
            onClick={() => setActiveSubTab('MATRIX')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeSubTab === 'MATRIX'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-600/20'
                : (isLight ? 'text-slate-600 hover:text-slate-900' : 'text-slate-400 hover:text-white')
            }`}
          >
            <Grid className="w-4 h-4" /> Ma Trận Phân Quyền (RBAC)
          </button>
        </div>
      </div>

      {activeSubTab === 'USERS' ? (
        /* ==================== SUB-TAB 1: DANH SÁCH TÀI KHOẢN ==================== */
        <>
          {/* 1. Executive Stats Row */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            
            {/* Card 1: Total Users */}
            <div className={`relative overflow-hidden p-4 rounded-2xl border transition transform hover:-translate-y-0.5 hover:shadow-lg ${
              isLight ? 'bg-gradient-to-br from-cyan-500/10 via-blue-500/5 to-white border-cyan-200/80' : 'bg-gradient-to-br from-cyan-950/40 via-blue-950/20 to-slate-900 border-cyan-800/40'
            }`}>
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-500 to-blue-500"></div>
              <Users className="w-20 h-20 absolute -right-3 -bottom-3 text-cyan-500/10 pointer-events-none" />
              
              <div className="flex items-center justify-between relative z-10">
                <span className={`text-xs font-bold ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>Tổng Tài Khoản</span>
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-500 text-white flex items-center justify-center shadow-md shadow-cyan-500/25">
                  <Users className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl font-extrabold mt-2 text-cyan-600 dark:text-cyan-400 relative z-10">{stats.total}</p>
              <p className="text-[11px] text-cyan-600 dark:text-cyan-400 font-semibold mt-1 flex items-center gap-1 relative z-10">
                <CheckCircle2 className="w-3 h-3" /> Đã đăng ký
              </p>
            </div>

            {/* Card 2: Admins */}
            <div className={`relative overflow-hidden p-4 rounded-2xl border transition transform hover:-translate-y-0.5 hover:shadow-lg ${
              isLight ? 'bg-gradient-to-br from-rose-500/10 via-pink-500/5 to-white border-rose-200/80' : 'bg-gradient-to-br from-rose-950/40 via-pink-950/20 to-slate-900 border-rose-800/40'
            }`}>
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-rose-500 to-pink-500"></div>
              <ShieldAlert className="w-20 h-20 absolute -right-3 -bottom-3 text-rose-500/10 pointer-events-none" />

              <div className="flex items-center justify-between relative z-10">
                <span className={`text-xs font-bold ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>Quản trị viên</span>
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-rose-600 to-pink-500 text-white flex items-center justify-center shadow-md shadow-rose-500/25">
                  <ShieldAlert className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl font-extrabold mt-2 text-rose-600 dark:text-rose-400 relative z-10">{stats.adminCount}</p>
              <p className="text-[11px] text-rose-600 dark:text-rose-400 font-semibold mt-1 flex items-center gap-1 relative z-10">
                <Shield className="w-3 h-3" /> Toàn quyền System
              </p>
            </div>

            {/* Card 3: Managers */}
            <div className={`relative overflow-hidden p-4 rounded-2xl border transition transform hover:-translate-y-0.5 hover:shadow-lg ${
              isLight ? 'bg-gradient-to-br from-indigo-500/10 via-cyan-500/5 to-white border-indigo-200/80' : 'bg-gradient-to-br from-indigo-950/40 via-cyan-950/20 to-slate-900 border-indigo-800/40'
            }`}>
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 to-cyan-500"></div>
              <ShieldCheck className="w-20 h-20 absolute -right-3 -bottom-3 text-indigo-500/10 pointer-events-none" />

              <div className="flex items-center justify-between relative z-10">
                <span className={`text-xs font-bold ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>Quản lý IT</span>
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-cyan-500 text-white flex items-center justify-center shadow-md shadow-indigo-500/25">
                  <ShieldCheck className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl font-extrabold mt-2 text-indigo-600 dark:text-indigo-400 relative z-10">{stats.managerCount}</p>
              <p className="text-[11px] text-indigo-600 dark:text-indigo-400 font-semibold mt-1 flex items-center gap-1 relative z-10">
                <UserCheck className="w-3 h-3" /> Duyệt & Bàn giao
              </p>
            </div>

            {/* Card 4: Staff */}
            <div className={`relative overflow-hidden p-4 rounded-2xl border transition transform hover:-translate-y-0.5 hover:shadow-lg ${
              isLight ? 'bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-white border-emerald-200/80' : 'bg-gradient-to-br from-emerald-950/40 via-teal-950/20 to-slate-900 border-emerald-800/40'
            }`}>
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-500"></div>
              <User className="w-20 h-20 absolute -right-3 -bottom-3 text-emerald-500/10 pointer-events-none" />

              <div className="flex items-center justify-between relative z-10">
                <span className={`text-xs font-bold ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>Nhân viên</span>
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center shadow-md shadow-emerald-500/25">
                  <User className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl font-extrabold mt-2 text-emerald-600 dark:text-emerald-400 relative z-10">{stats.staffCount}</p>
              <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold mt-1 flex items-center gap-1 relative z-10">
                <Laptop className="w-3 h-3" /> Sử dụng máy trạm
              </p>
            </div>

            {/* Card 5: Active Accounts */}
            <div className={`relative overflow-hidden p-4 rounded-2xl border transition transform hover:-translate-y-0.5 hover:shadow-lg ${
              isLight ? 'bg-gradient-to-br from-teal-500/10 via-emerald-500/5 to-white border-teal-200/80' : 'bg-gradient-to-br from-teal-950/40 via-emerald-950/20 to-slate-900 border-teal-800/40'
            }`}>
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-teal-500 to-emerald-500"></div>
              <CheckCircle2 className="w-20 h-20 absolute -right-3 -bottom-3 text-teal-500/10 pointer-events-none" />

              <div className="flex items-center justify-between relative z-10">
                <span className={`text-xs font-bold ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>Đang Hoạt Động</span>
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-teal-600 to-emerald-500 text-white flex items-center justify-center shadow-md shadow-teal-500/25">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl font-extrabold mt-2 text-teal-600 dark:text-teal-400 relative z-10">{stats.activeCount}</p>
              <p className="text-[11px] text-teal-600 dark:text-teal-400 font-semibold mt-1 flex items-center gap-1 relative z-10">
                <Check className="w-3 h-3" /> Cho phép đăng nhập
              </p>
            </div>

          </div>

          {/* 2. Search & Filter & Actions Bar */}
          <div className={`${cardClass} p-4 rounded-2xl space-y-4`}>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              
              {/* Left: Universal Search Input & Dropdown Filters */}
              <div className="flex flex-wrap items-center gap-3 flex-1">
                <div className="relative w-full md:w-72">
                  <Search className={`w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 ${isLight ? 'text-slate-400' : 'text-slate-400'}`} />
                  <input
                    type="text"
                    placeholder="Nhập từ khóa tìm kiếm người dùng..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={`w-full border rounded-xl pl-10 pr-9 py-2 text-xs focus:outline-none focus:border-cyan-500 ${
                      isLight ? 'bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-400' : 'bg-slate-900 border-slate-700 text-slate-200 placeholder-slate-500'
                    }`}
                  />
                  {searchTerm && (
                    <button onClick={() => setSearchTerm('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Filter by Role */}
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className={`border rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-cyan-500 ${
                    isLight ? 'bg-slate-50 border-slate-200 text-slate-800' : 'bg-slate-900 border-slate-700 text-slate-200'
                  }`}
                >
                  <option value="ALL">🔑 Tất cả vai trò</option>
                  <option value="ADMIN">Quản trị viên</option>
                  <option value="MANAGER">Quản lý IT</option>
                  <option value="STAFF">Nhân viên</option>
                  <option value="VIEWER">Chỉ xem</option>
                </select>

                {/* Filter by Status */}
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className={`border rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-cyan-500 ${
                    isLight ? 'bg-slate-50 border-slate-200 text-slate-800' : 'bg-slate-900 border-slate-700 text-slate-200'
                  }`}
                >
                  <option value="ALL">🟢 Tất cả trạng thái</option>
                  <option value="ACTIVE">Đang Hoạt Động</option>
                  <option value="INACTIVE">Đã Khóa / Tắt</option>
                </select>
              </div>

              {/* Right: Action Add User Button */}
              <button
                onClick={handleOpenCreateDrawer}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs shadow-md shadow-cyan-600/20 flex items-center gap-2 transition shrink-0"
              >
                <UserPlus className="w-4 h-4" /> Thêm Người Dùng Mới
              </button>

            </div>
          </div>

          {/* 4. Main Users Data Table */}
          <div className={`${cardClass} rounded-2xl overflow-hidden`}>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className={`border-b text-[11px] font-extrabold uppercase tracking-wider ${
                    isLight ? 'bg-slate-100/70 border-slate-200 text-slate-500' : 'bg-slate-950/60 border-slate-800 text-slate-400'
                  }`}>
                    <th className="p-4">Người Dùng & Đơn Vị</th>
                    <th className="p-4">Tài Khoản & Email</th>
                    <th className="p-4">Vai Trò</th>
                    <th className="p-4">Xác Thực (Auth)</th>
                    <th className="p-4">Trạng Thái</th>
                    <th className="p-4">Đăng Nhập Cuối</th>
                    <th className="p-4 text-right">Thao Tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-12 text-center text-slate-500">
                        Không tìm thấy tài khoản người dùng nào phù hợp.
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((user) => {
                      const roleBadge = getRoleBadge(user.role);
                      const RoleIcon = roleBadge.icon;
                      return (
                        <tr 
                          key={user.id} 
                          className={`transition ${
                            isLight ? 'hover:bg-slate-50/80' : 'hover:bg-slate-900/60'
                          }`}
                        >
                          {/* Name & Avatar & Department */}
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-cyan-600 to-blue-600 font-bold text-white flex items-center justify-center text-xs shadow-md shrink-0">
                                {user.fullName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                              </div>
                              <div>
                                <h4 className={`font-bold text-sm ${isLight ? 'text-slate-900' : 'text-white'}`}>
                                  {user.fullName}
                                </h4>
                                <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                                  <Building2 className="w-3 h-3 text-cyan-600" /> {user.departmentName || 'Chưa xếp phòng'}
                                </p>
                              </div>
                            </div>
                          </td>

                          {/* Username & Email */}
                          <td className="p-4">
                            <p className="font-mono font-bold text-cyan-600">{user.username}</p>
                            <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                              <Mail className="w-3 h-3 text-slate-400" /> {user.email || 'N/A'}
                            </p>
                          </td>

                          {/* Role Badge */}
                          <td className="p-4">
                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold border ${roleBadge.color}`}>
                              <RoleIcon className="w-3.5 h-3.5" />
                              {roleBadge.label}
                            </span>
                          </td>

                          {/* Auth Method */}
                          <td className="p-4">
                            <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border ${
                              user.authMethod?.includes('SSO') 
                                ? (isLight ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-indigo-950/60 border-indigo-800 text-indigo-300')
                                : (isLight ? 'bg-slate-100 border-slate-200 text-slate-600' : 'bg-slate-800 border-slate-700 text-slate-400')
                            }`}>
                              {user.authMethod || 'LOCAL'}
                            </span>
                          </td>

                          {/* Account Status */}
                          <td className="p-4">
                            {user.status === 'ACTIVE' ? (
                              <span className="inline-flex items-center gap-1.5 text-emerald-600 font-bold text-xs">
                                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> Hoạt Động
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 text-rose-500 font-bold text-xs">
                                <span className="w-2 h-2 rounded-full bg-rose-500"></span> Đã Khóa
                              </span>
                            )}
                          </td>

                          {/* Last Login */}
                          <td className="p-4 text-slate-400 font-mono text-[11px]">
                            {user.lastLogin || 'Chưa đăng nhập'}
                          </td>

                          {/* Actions */}
                          <td className="p-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {/* Edit User Button */}
                              <button
                                onClick={() => handleOpenEditDrawer(user)}
                                className={`p-1.5 rounded-lg transition border ${
                                  isLight ? 'bg-slate-100 text-slate-600 hover:bg-cyan-600 hover:text-white border-slate-200' : 'bg-slate-800 text-slate-400 hover:bg-cyan-500 hover:text-slate-950 border-slate-700'
                                }`}
                                title="Chỉnh sửa tài khoản"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>

                              {/* Toggle Active/Lock Status Button */}
                              <button
                                onClick={() => handleToggleUserStatus(user.id)}
                                className={`p-1.5 rounded-lg transition border ${
                                  user.status === 'ACTIVE'
                                    ? (isLight ? 'bg-amber-50 text-amber-700 hover:bg-amber-600 hover:text-white border-amber-200' : 'bg-amber-950/60 text-amber-400 hover:bg-amber-500 hover:text-slate-950 border-amber-800')
                                    : (isLight ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white border-emerald-200' : 'bg-emerald-950/60 text-emerald-400 hover:bg-emerald-500 hover:text-slate-950 border-emerald-800')
                                }`}
                                title={user.status === 'ACTIVE' ? 'Khóa tài khoản này' : 'Mở khóa tài khoản này'}
                              >
                                {user.status === 'ACTIVE' ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                              </button>

                              {/* Reset Password Button */}
                              <button
                                onClick={() => handleTriggerResetPassword(user)}
                                className={`p-1.5 rounded-lg transition border ${
                                  isLight ? 'bg-indigo-50 text-indigo-700 hover:bg-indigo-600 hover:text-white border-indigo-200' : 'bg-indigo-950/60 text-indigo-400 hover:bg-indigo-500 hover:text-slate-950 border-indigo-800'
                                }`}
                                title="Cấp lại mật khẩu mới"
                              >
                                <Key className="w-3.5 h-3.5" />
                              </button>

                              {/* Delete User Button */}
                              <button
                                onClick={() => setConfirmDeleteModal(user)}
                                className={`p-1.5 rounded-lg transition border ${
                                  isLight ? 'bg-rose-50 text-rose-700 hover:bg-rose-600 hover:text-white border-rose-200' : 'bg-rose-950/60 text-rose-400 hover:bg-rose-500 hover:text-slate-950 border-rose-800'
                                }`}
                                title="Xóa tài khoản"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        /* ==================== SUB-TAB 2: MA TRẬN PHÂN QUYỀN (RBAC MATRIX) ==================== */
        <div className="space-y-6">

          {/* Action Header Banner */}
          <div className={`${cardClass} p-5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 border-l-4 border-l-purple-600`}>
            <div>
              <h3 className={`font-bold text-base flex items-center gap-2 ${isLight ? 'text-slate-900' : 'text-white'}`}>
                <Grid className="w-5 h-5 text-purple-600" /> Ma Trận Phân Quyền Chi Tiết Theo Mô-đun (RBAC Matrix)
              </h3>
              <p className="text-xs text-slate-500 mt-1">Tích chọn để cấp hoặc thu hồi quyền hạn trực tiếp đối với từng vai trò người dùng trong hệ thống</p>
            </div>

            <div className="flex items-center gap-3">
              {matrixSaveSuccess && (
                <span className="text-xs font-bold text-emerald-600 flex items-center gap-1.5 animate-bounce">
                  <CheckCircle2 className="w-4 h-4" /> Đã lưu ma trận thành công!
                </span>
              )}
              <button
                type="button"
                onClick={handleResetMatrix}
                className={`px-4 py-2.5 rounded-xl font-bold text-xs border flex items-center gap-2 transition ${
                  isLight ? 'bg-slate-100 text-slate-700 hover:bg-slate-200 border-slate-300' : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border-slate-700'
                }`}
              >
                <RotateCcw className="w-4 h-4" /> Mặc Định
              </button>
              <button
                type="button"
                onClick={handleSaveMatrix}
                disabled={savingMatrix}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-purple-600/20 flex items-center gap-2 transition"
              >
                <Save className="w-4 h-4" /> {savingMatrix ? 'Đang lưu...' : 'Lưu Ma Trận Phân Quyền'}
              </button>
            </div>
          </div>

          {/* Role Summary Overview Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className={`p-4 rounded-2xl border space-y-1.5 ${isLight ? 'bg-rose-50/60 border-rose-200 text-rose-950' : 'bg-slate-900 border-rose-800/60 text-rose-300'}`}>
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-xs uppercase flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4 text-rose-600" /> Quản Trị Viên (ADMIN)
                </span>
                <span className="text-xs font-bold bg-rose-600 text-white px-2 py-0.5 rounded-full">{stats.adminCount} tài khoản</span>
              </div>
              <p className="text-[11px] opacity-80">Toàn quyền cấu hình hệ thống, quản trị người dùng, sao lưu & phân quyền.</p>
            </div>

            <div className={`p-4 rounded-2xl border space-y-1.5 ${isLight ? 'bg-cyan-50/60 border-cyan-200 text-cyan-950' : 'bg-slate-900 border-cyan-800/60 text-cyan-300'}`}>
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-xs uppercase flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-cyan-600" /> Quản Lý IT (MANAGER)
                </span>
                <span className="text-xs font-bold bg-cyan-600 text-white px-2 py-0.5 rounded-full">{stats.managerCount} tài khoản</span>
              </div>
              <p className="text-[11px] opacity-80">Phê duyệt cấp phát, thu hồi tài sản, quản lý lịch bảo trì & duyệt thiết bị Discovery.</p>
            </div>

            <div className={`p-4 rounded-2xl border space-y-1.5 ${isLight ? 'bg-emerald-50/60 border-emerald-200 text-emerald-950' : 'bg-slate-900 border-emerald-800/60 text-emerald-300'}`}>
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-xs uppercase flex items-center gap-1.5">
                  <UserCheck className="w-4 h-4 text-emerald-600" /> Nhân Viên (STAFF)
                </span>
                <span className="text-xs font-bold bg-emerald-600 text-white px-2 py-0.5 rounded-full">{stats.staffCount} tài khoản</span>
              </div>
              <p className="text-[11px] opacity-80">Khởi tạo tài sản mới, lập phiếu sửa chữa hỏng hóc, in tem mã QR và tra cứu.</p>
            </div>

            <div className={`p-4 rounded-2xl border space-y-1.5 ${isLight ? 'bg-amber-50/60 border-amber-200 text-amber-950' : 'bg-slate-900 border-amber-800/60 text-amber-300'}`}>
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-xs uppercase flex items-center gap-1.5">
                  <Eye className="w-4 h-4 text-amber-600" /> Chỉ Xem (VIEWER)
                </span>
                <span className="text-xs font-bold bg-amber-600 text-white px-2 py-0.5 rounded-full">{stats.viewerCount} tài khoản</span>
              </div>
              <p className="text-[11px] opacity-80">Chỉ có quyền tra cứu, xem thông tin tài sản và danh mục (Phù hợp Kiểm toán/Tài chính).</p>
            </div>
          </div>

          {/* Interactive Permission Matrix Table */}
          <div className={`${cardClass} rounded-2xl overflow-hidden`}>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className={`border-b text-[11px] font-extrabold uppercase tracking-wider ${
                    isLight ? 'bg-slate-100 text-slate-700 border-slate-200' : 'bg-slate-950 border-slate-800 text-slate-300'
                  }`}>
                    <th className="p-4 w-2/5">Mô-đun & Quyền Hạn Chi Tiết</th>
                    <th className="p-4 text-center w-1/8 text-rose-600 dark:text-rose-400">ADMIN (Quản trị)</th>
                    <th className="p-4 text-center w-1/8 text-cyan-600 dark:text-cyan-400">MANAGER (Quản lý)</th>
                    <th className="p-4 text-center w-1/8 text-emerald-600 dark:text-emerald-400">STAFF (Nhân viên)</th>
                    <th className="p-4 text-center w-1/8 text-amber-600 dark:text-amber-400">VIEWER (Chỉ xem)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800/80">
                  {PERMISSION_MODULES.map((mod, modIdx) => {
                    const CategoryIcon = mod.icon;
                    return (
                      <React.Fragment key={modIdx}>
                        {/* Module Category Header Row */}
                        <tr className={`${isLight ? 'bg-slate-100/80 text-slate-800' : 'bg-slate-900/90 text-slate-200'} font-bold`}>
                          <td colSpan={5} className="p-3 px-4 text-xs tracking-wide font-extrabold uppercase border-y border-slate-200 dark:border-slate-800 flex items-center gap-2">
                            <CategoryIcon className="w-4 h-4 text-cyan-600" /> {mod.category}
                          </td>
                        </tr>

                        {/* Module Item Rows */}
                        {mod.items.map((item) => (
                          <tr key={item.key} className={`transition ${isLight ? 'hover:bg-cyan-50/40' : 'hover:bg-slate-900/50'}`}>
                            <td className="p-4">
                              <p className={`font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>{item.label}</p>
                              <p className="text-[11px] text-slate-400 mt-0.5">{item.desc}</p>
                            </td>

                            {/* Checkbox columns for 4 Roles */}
                            {['ADMIN', 'MANAGER', 'STAFF', 'VIEWER'].map((role) => {
                              const isChecked = !!matrixData[role]?.[item.key];
                              const isLockedAdmin = role === 'ADMIN' && (item.key === 'iam_matrix' || item.key === 'iam_users');

                              return (
                                <td key={role} className="p-4 text-center align-middle">
                                  <label className="inline-flex items-center justify-center cursor-pointer p-1">
                                    <input
                                      type="checkbox"
                                      disabled={isLockedAdmin}
                                      checked={isChecked}
                                      onChange={() => handleTogglePermission(role, item.key)}
                                      className="sr-only peer"
                                    />
                                    <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${
                                      isChecked
                                        ? 'bg-cyan-600 border-cyan-600 text-white shadow-sm'
                                        : (isLight ? 'bg-slate-100 border-slate-300 text-slate-300' : 'bg-slate-950 border-slate-700 text-slate-700')
                                    } ${isLockedAdmin ? 'opacity-75 cursor-not-allowed' : ''}`}>
                                      {isChecked ? <Check className="w-4 h-4 stroke-[3]" /> : <X className="w-3 h-3 opacity-40" />}
                                    </div>
                                  </label>
                                </td>
                              );
                            })}
                          </tr>
                        ))}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Reset Password Confirmation */}
      {resetPassModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className={`${isLight ? 'bg-white text-slate-800' : 'glass-card-dark text-slate-100'} w-full max-w-md p-6 rounded-2xl border ${isLight ? 'border-slate-200' : 'border-slate-800'} space-y-4 shadow-2xl`}>
            <div className="flex items-center gap-3 border-b pb-3 border-indigo-200">
              <Key className="w-6 h-6 text-indigo-600 shrink-0" />
              <div>
                <h3 className={`font-bold text-base ${isLight ? 'text-slate-900' : 'text-white'}`}>Cấp Lại Mật Khẩu Tự Động</h3>
                <p className="text-xs text-slate-500">Tài khoản: <strong className="font-mono text-indigo-600 font-bold">{resetPassModal.username}</strong> ({resetPassModal.fullName})</p>
              </div>
            </div>

            <div className={`p-4 rounded-xl border space-y-2 ${isLight ? 'bg-indigo-50/70 border-indigo-200 text-indigo-950' : 'bg-slate-900 border-indigo-800/60 text-indigo-300'}`}>
              <p className="text-xs font-semibold">Mật khẩu mới khởi tạo tự động:</p>
              <div className="p-3 bg-white dark:bg-slate-950 rounded-xl border border-indigo-300 flex items-center justify-between font-mono text-base font-extrabold text-indigo-600">
                <span>{newGeneratedPass}</span>
                <button
                  type="button"
                  onClick={() => navigator.clipboard.writeText(newGeneratedPass)}
                  className="text-xs font-bold text-slate-500 hover:text-indigo-600 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded"
                >
                  Sao chép
                </button>
              </div>
              <p className="text-[11px] text-slate-500">Vui lòng cung cấp mật khẩu tạm thời này cho người dùng để đăng nhập lại.</p>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setResetPassModal(null)}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/20"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Delete Confirmation */}
      {confirmDeleteModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className={`${isLight ? 'bg-white text-slate-800' : 'glass-card-dark text-slate-100'} w-full max-w-md p-6 rounded-2xl border ${isLight ? 'border-slate-200' : 'border-slate-800'} space-y-4 shadow-2xl`}>
            <div className="flex items-center gap-3 border-b pb-3 border-rose-200">
              <Trash2 className="w-6 h-6 text-rose-600 shrink-0" />
              <div>
                <h3 className={`font-bold text-base ${isLight ? 'text-slate-900' : 'text-white'}`}>Xác Nhận Xóa Tài Khoản</h3>
                <p className="text-xs text-slate-500">Tài khoản: <strong className="font-mono text-rose-600 font-bold">{confirmDeleteModal.username}</strong></p>
              </div>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300">
              Bạn có chắc chắn muốn xóa vĩnh viễn tài khoản <strong>"{confirmDeleteModal.fullName}"</strong> khỏi hệ thống? Hành động này không thể hoàn tác.
            </p>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setConfirmDeleteModal(null)}
                className={`px-4 py-2 rounded-xl text-xs font-bold ${
                  isLight ? 'bg-slate-100 text-slate-700 hover:bg-slate-200' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-lg shadow-rose-600/20"
              >
                Xác Nhận Xóa
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DRAWER: Add/Edit System User */}
      {userDrawerOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity" onClick={() => setUserDrawerOpen(false)}></div>

          <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
            <div className={`w-screen max-w-md ${isLight ? 'bg-white text-slate-800' : 'bg-slate-900 text-slate-100'} shadow-2xl border-l ${isLight ? 'border-slate-200' : 'border-slate-800'} flex flex-col`}>
              
              {/* Drawer Header */}
              <div className={`p-6 border-b flex items-center justify-between ${isLight ? 'border-cyan-200 bg-cyan-50/50' : 'border-slate-800 bg-slate-950/50'}`}>
                <div>
                  <h3 className={`font-bold text-lg flex items-center gap-2 ${isLight ? 'text-cyan-950' : 'text-cyan-400'}`}>
                    <UserPlus className="w-5 h-5 text-cyan-600" /> {editingUser ? 'Chỉnh Sửa Tài Khoản System' : 'Tạo Tài Khoản Người Dùng Mới'}
                  </h3>
                  <p className={`text-xs mt-1 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                    {editingUser ? `Đang chỉnh sửa: ${editingUser.username}` : 'Cấp tài khoản đăng nhập hệ thống cho cán bộ'}
                  </p>
                </div>
                <button onClick={() => setUserDrawerOpen(false)} className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Drawer Content */}
              <form onSubmit={handleSaveUserSubmit} className="flex-1 p-6 space-y-4 text-xs overflow-y-auto">
                
                {/* 1. TÊN ĐĂNG NHẬP (USERNAME) */}
                <div className="space-y-1">
                  <label className={`font-bold ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                    Tên Đăng Nhập (Username) <span className="text-rose-500 font-extrabold ml-0.5">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Nhập tên đăng nhập..."
                    value={formData.username}
                    onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                    className={`w-full border rounded-xl px-3.5 py-2.5 font-mono font-bold ${
                      isLight ? 'bg-slate-50 border-slate-300 text-slate-800' : 'bg-slate-950 border-slate-700 text-slate-200'
                    }`}
                  />
                </div>

                {/* 2. MẬT KHẨU (PASSWORD) */}
                {!editingUser && (
                  <div className="space-y-1">
                    <label className={`font-bold ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                      Mật Khẩu Đăng Nhập Ban Đầu <span className="text-rose-500 font-extrabold ml-0.5">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        placeholder="Nhập mật khẩu..."
                        value={formData.password}
                        onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                        className={`w-full border rounded-xl pl-3.5 pr-10 py-2.5 font-mono ${
                          isLight ? 'bg-slate-50 border-slate-300 text-slate-800' : 'bg-slate-950 border-slate-700 text-slate-200'
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                )}

                {/* 3. HỌ & TÊN CÁN BỘ / NHÂN VIÊN (MERGED SINGLE SEARCHABLE DROPDOWN FIELD) */}
                <div className="space-y-1 relative">
                  <label className={`font-bold ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                    Họ & Tên Cán Bộ / Nhân Viên <span className="text-rose-500 font-extrabold ml-0.5">*</span>
                  </label>

                  <div className="relative">
                    <input
                      type="text"
                      required
                      placeholder="Nhập tên hoặc chọn từ danh mục nhân viên..."
                      value={formData.fullName}
                      onChange={(e) => {
                        const val = e.target.value;
                        setFormData(prev => ({ ...prev, fullName: val }));
                        setEmpSearchInput(val);
                        setEmpDropdownOpen(true);
                      }}
                      onFocus={() => setEmpDropdownOpen(true)}
                      className={`w-full border rounded-xl px-3.5 py-2.5 font-bold ${
                        isLight ? 'bg-slate-50 border-slate-300 text-slate-800' : 'bg-slate-950 border-slate-700 text-slate-200'
                      }`}
                    />
                  </div>

                  {empDropdownOpen && (
                    <div className={`absolute z-30 w-full mt-1 max-h-48 overflow-y-auto rounded-xl border shadow-xl ${
                      isLight ? 'bg-white border-slate-200 text-slate-800' : 'bg-slate-900 border-slate-700 text-slate-200'
                    }`}>
                      {filteredEmployeeOptions.length === 0 ? (
                        <div className="p-3 text-slate-400 italic text-center">Tự do nhập tên mới</div>
                      ) : (
                        filteredEmployeeOptions.map((emp) => (
                          <div
                            key={emp.id}
                            onClick={() => handleSelectEmployee(emp.id)}
                            className={`p-2.5 cursor-pointer border-b last:border-0 flex items-center justify-between hover:bg-cyan-50 dark:hover:bg-slate-800 transition ${
                              String(formData.selectedEmpId) === String(emp.id) || formData.fullName === (emp.full_name || emp.fullName) ? 'bg-cyan-50/70 text-cyan-700 dark:bg-slate-800' : ''
                            }`}
                          >
                            <div>
                              <p className="font-bold">{emp.full_name || emp.fullName}</p>
                              <p className="text-[10px] text-slate-400">{emp.employee_id || emp.id} - {emp.department_name || emp.departmentName || 'Không có phòng'}</p>
                            </div>
                            {(String(formData.selectedEmpId) === String(emp.id) || formData.fullName === (emp.full_name || emp.fullName)) && (
                              <Check className="w-4 h-4 text-cyan-600 shrink-0" />
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>

                {/* 5. EMAIL & SỐ ĐIỆN THOẠI */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className={`font-bold ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>Email</label>
                    <input
                      type="email"
                      placeholder="Nhập địa chỉ email..."
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      className={`w-full border rounded-xl px-3.5 py-2.5 ${
                        isLight ? 'bg-slate-50 border-slate-300 text-slate-800' : 'bg-slate-950 border-slate-700 text-slate-200'
                      }`}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className={`font-bold ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>Số Điện Thoại</label>
                    <input
                      type="text"
                      placeholder="Nhập số điện thoại..."
                      value={formData.phone}
                      onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                      className={`w-full border rounded-xl px-3.5 py-2.5 ${
                        isLight ? 'bg-slate-50 border-slate-300 text-slate-800' : 'bg-slate-950 border-slate-700 text-slate-200'
                      }`}
                    />
                  </div>
                </div>

                {/* 6. VAI TRÒ & QUYỀN HẠN */}
                <div className="space-y-1">
                  <label className={`font-bold ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                    Vai Trò & Quyền Hạn (Role) <span className="text-rose-500 font-extrabold ml-0.5">*</span>
                  </label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value }))}
                    className={`w-full border rounded-xl px-3.5 py-2.5 font-bold ${
                      isLight ? 'bg-slate-50 border-slate-300 text-slate-800' : 'bg-slate-950 border-slate-700 text-slate-200'
                    }`}
                  >
                    <option value="ADMIN">Quản trị viên (ADMIN - Toàn quyền System)</option>
                    <option value="MANAGER">Quản lý IT (MANAGER - Duyệt & Bàn giao tài sản)</option>
                    <option value="STAFF">Nhân viên (STAFF - Kỹ thuật viên / Chuyên viên)</option>
                    <option value="VIEWER">Chỉ xem (VIEWER - Người dùng chỉ xem)</option>
                  </select>
                </div>

                {/* 7. TRẠNG THÁI TÀI KHOẢN */}
                <div className="space-y-1">
                  <label className={`font-bold ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>Trạng Thái Tài Khoản</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                    className={`w-full border rounded-xl px-3.5 py-2.5 font-bold ${
                      isLight ? 'bg-slate-50 border-slate-300 text-slate-800' : 'bg-slate-950 border-slate-700 text-slate-200'
                    }`}
                  >
                    <option value="ACTIVE">Hoạt Động (Cho phép đăng nhập)</option>
                    <option value="INACTIVE">Khóa / Tắt (Tạm dừng quyền đăng nhập)</option>
                  </select>
                </div>

                {/* Drawer Footer Buttons */}
                <div className={`pt-4 border-t flex justify-end gap-3 mt-auto ${isLight ? 'border-slate-200' : 'border-slate-800'}`}>
                  <button
                    type="button"
                    onClick={() => setUserDrawerOpen(false)}
                    className={`px-5 py-2.5 rounded-xl font-bold ${
                      isLight ? 'bg-slate-100 text-slate-700 hover:bg-slate-200' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold shadow-lg shadow-cyan-600/20"
                  >
                    {editingUser ? 'Lưu Thay Đổi' : 'Tạo Tài Khoản Mới'}
                  </button>
                </div>

              </form>

            </div>
          </div>
        </div>
      )}

    </div>
  );
}
