import React, { useState, useEffect } from 'react';
import { 
  UserCheck, 
  Plus, 
  Search, 
  Building2, 
  MapPin, 
  Edit3, 
  Trash2, 
  X, 
  Mail, 
  Phone, 
  Briefcase
} from 'lucide-react';
import { apiUrl } from '../utils/api';
import { useToast } from '../context/ToastContext';

export default function NhanVien({ theme }) {
  const { showToast } = useToast();
  const [employees, setEmployees] = useState([]);
  const [khoaList, setKhoaList] = useState([]);
  const [phongList, setPhongList] = useState([]);
  const [chucDanhList, setChucDanhList] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPhongFilter, setSelectedPhongFilter] = useState('');
  const [loading, setLoading] = useState(true);

  // Slide-over Right Drawer state
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingEmp, setEditingEmp] = useState(null);

  // Form states
  const [employeeId, setEmployeeId] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [phongId, setPhongId] = useState('');
  const [selectedKhoaId, setSelectedKhoaId] = useState('');
  const [position, setPosition] = useState('');
  const [status, setStatus] = useState('ACTIVE');

  const isLight = theme === 'light';

  const fetchData = async () => {
    try {
      const [resEmp, resKhoa, resPhong, resCd] = await Promise.all([
        fetch(apiUrl('/api/employees')).then(r => r.json()),
        fetch(apiUrl('/api/khoa')).then(r => r.json()),
        fetch(apiUrl('/api/phong')).then(r => r.json()),
        fetch(apiUrl('/api/chuc-danh')).then(r => r.json())
      ]);
      setEmployees(Array.isArray(resEmp) ? resEmp : []);
      setKhoaList(Array.isArray(resKhoa) ? resKhoa : []);
      setPhongList(Array.isArray(resPhong) ? resPhong : []);
      setChucDanhList(Array.isArray(resCd) ? resCd : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // When user selects a Phòng, automatically set the corresponding Khoa
  const handlePhongChange = (newPhongId) => {
    setPhongId(newPhongId);
    if (newPhongId) {
      const foundPhong = phongList.find(p => parseInt(p.id, 10) === parseInt(newPhongId, 10));
      if (foundPhong && foundPhong.khoa_id) {
        setSelectedKhoaId(foundPhong.khoa_id);
      }
    } else {
      setSelectedKhoaId('');
    }
  };

  // Open Drawer Handlers
  const openAddEmp = () => {
    setEditingEmp(null);
    setEmployeeId(`NV-${Math.floor(1000 + Math.random() * 9000)}`);
    setFullName('');
    setEmail('');
    setPhone('');
    setPhongId(''); // Default Empty (Optional)
    setSelectedKhoaId(''); // Default Empty (Optional)
    setPosition(chucDanhList[0]?.name || 'Nhân viên');
    setStatus('ACTIVE');
    setDrawerOpen(true);
  };

  const openEditEmp = (emp) => {
    setEditingEmp(emp);
    setEmployeeId(emp.employee_id);
    setFullName(emp.full_name);
    setEmail(emp.email || '');
    setPhone(emp.phone || '');
    setPhongId(emp.phong_id || '');

    const currentPhong = phongList.find(p => parseInt(p.id, 10) === parseInt(emp.phong_id, 10));
    setSelectedKhoaId(currentPhong ? currentPhong.khoa_id : '');

    setPosition(emp.position || chucDanhList[0]?.name || '');
    setStatus(emp.status || 'ACTIVE');
    setDrawerOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      employeeId,
      fullName,
      email,
      phone,
      phongId: phongId ? parseInt(phongId, 10) : null,
      position,
      status
    };

    try {
      let res;
      if (editingEmp) {
        res = await fetch(apiUrl(`/api/employees/${editingEmp.id}`), {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      } else {
        res = await fetch(apiUrl('/api/employees'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      }
      
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        showToast(editingEmp ? 'Cập nhật thông tin nhân viên thành công!' : 'Thêm mới nhân viên thành công!', 'success');
        setDrawerOpen(false);
        await fetchData();
      } else {
        showToast(data.error || 'Có lỗi xảy ra khi lưu nhân viên!', 'error');
      }
    } catch (err) {
      showToast('Lỗi kết nối máy chủ: ' + err.message, 'error');
    }
  };

  // Toggle Employee Status Handler (Enable / Disable Touch Button)
  const handleToggleStatus = async (emp) => {
    const newStatus = emp.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    try {
      const res = await fetch(apiUrl(`/api/employees/${emp.id}/toggle-status`), {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        showToast(`Đã chuyển trạng thái nhân viên sang ${newStatus === 'ACTIVE' ? 'Hoạt động' : 'Tạm ngưng'}`, 'success');
        await fetchData();
      } else {
        showToast(data.error || 'Có lỗi khi cập nhật trạng thái nhân viên!', 'error');
      }
    } catch (err) {
      showToast('Lỗi kết nối máy chủ: ' + err.message, 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa nhân viên này?')) return;
    try {
      const res = await fetch(apiUrl(`/api/employees/${id}`), { method: 'DELETE' });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        showToast('Xóa hồ sơ nhân viên thành công!', 'success');
        await fetchData();
      } else {
        showToast(data.error || 'Có lỗi xảy ra khi xóa nhân viên!', 'error');
      }
    } catch (err) {
      showToast('Lỗi kết nối máy chủ: ' + err.message, 'error');
    }
  };

  const filteredEmployees = employees.filter(e => {
    const matchesSearch = !searchTerm ||
      e.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.employee_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (e.email && e.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (e.position && e.position.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesPhong = !selectedPhongFilter || parseInt(e.phong_id, 10) === parseInt(selectedPhongFilter, 10);

    return matchesSearch && matchesPhong;
  });

  const cardClass = isLight ? 'glass-card-light' : 'glass-card-dark';

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className={`${cardClass} p-6 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4`}>
        <div>
          <h2 className={`text-xl font-bold flex items-center gap-2 ${isLight ? 'text-slate-900' : 'text-white'}`}>
            <UserCheck className="w-6 h-6 text-cyan-600" /> Quản Lý Danh Mục Nhân Viên
          </h2>
          <p className={`text-sm mt-1 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
            Quản lý danh sách hồ sơ cán bộ nhân viên, mã nhân sự, chức danh, phòng ban & khoa trực thuộc.
          </p>
        </div>

        <button
          onClick={openAddEmp}
          className="px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow-lg shadow-cyan-600/20 flex items-center gap-2 transition shrink-0"
        >
          <Plus className="w-4 h-4" /> Thêm Nhân Viên Mới
        </button>
      </div>

      {/* Action & Filter Bar */}
      <div className={`${cardClass} p-4 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4`}>
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
          {/* Search */}
          <div className="relative w-full sm:w-72">
            <Search className={`w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 ${isLight ? 'text-slate-400' : 'text-slate-400'}`} />
            <input
              type="text"
              placeholder="Nhập mã, tên nhân viên hoặc email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full border rounded-xl pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-cyan-500 ${
                isLight ? 'bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-400' : 'bg-slate-900 border-slate-700 text-slate-200 placeholder-slate-500'
              }`}
            />
          </div>

          {/* Filter by Dynamic Phong Dropdown */}
          <select
            value={selectedPhongFilter}
            onChange={(e) => setSelectedPhongFilter(e.target.value)}
            className={`w-full sm:w-64 border rounded-xl px-3 py-2 text-xs font-semibold ${
              isLight ? 'bg-slate-50 border-slate-200 text-slate-800' : 'bg-slate-900 border-slate-700 text-slate-200'
            }`}
          >
            <option value="">-- Tất cả Phòng Ban / Khoa --</option>
            {phongList.map(p => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.khoa_name})
              </option>
            ))}
          </select>
        </div>

        <span className={`text-xs font-bold ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
          Tổng số {filteredEmployees.length} nhân viên
        </span>
      </div>

      {/* Employee Data Table */}
      <div className={`${cardClass} rounded-2xl overflow-hidden`}>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className={`text-xs font-bold uppercase border-b ${
              isLight ? 'bg-slate-100/80 text-slate-600 border-slate-200' : 'bg-slate-900/90 text-slate-400 border-slate-800'
            }`}>
              <tr>
                <th className="px-6 py-4">Mã Nhân Viên</th>
                <th className="px-6 py-4">Họ & Tên</th>
                <th className="px-6 py-4">Thông Tin Liên Hệ</th>
                <th className="px-6 py-4">Phòng Ban & Khoa Trực Thuộc</th>
                <th className="px-6 py-4">Chức Danh / Chức Vụ</th>
                <th className="px-6 py-4">Trạng Thái</th>
                <th className="px-6 py-4 text-right">Thao Tác</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${isLight ? 'divide-slate-200 text-slate-700' : 'divide-slate-800/80 text-slate-300'}`}>
              {filteredEmployees.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-slate-500">Chưa tìm thấy nhân viên nào.</td>
                </tr>
              ) : (
                filteredEmployees.map((emp) => (
                  <tr key={emp.id} className={isLight ? 'hover:bg-slate-50 transition' : 'hover:bg-slate-900/50 transition'}>
                    {/* Employee ID */}
                    <td className={`px-6 py-4 font-mono font-bold text-sm ${isLight ? 'text-cyan-700' : 'text-cyan-400'}`}>
                      {emp.employee_id}
                    </td>

                    {/* Full Name */}
                    <td className="px-6 py-4">
                      <p className={`font-bold text-base ${isLight ? 'text-slate-900' : 'text-white'}`}>{emp.full_name}</p>
                    </td>

                    {/* Contact */}
                    <td className="px-6 py-4 space-y-1 text-xs">
                      {emp.email && (
                        <p className={`flex items-center gap-1.5 ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>
                          <Mail className="w-3.5 h-3.5 text-cyan-600 shrink-0" />
                          <span>{emp.email}</span>
                        </p>
                      )}
                      {emp.phone && (
                        <p className={`flex items-center gap-1.5 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                          <Phone className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span>{emp.phone}</span>
                        </p>
                      )}
                    </td>

                    {/* DYNAMIC PHÒNG & KHOA BADGE */}
                    <td className="px-6 py-4 text-xs">
                      <div className="space-y-1">
                        <span className={`px-3 py-1 rounded-full font-bold border inline-flex items-center gap-1.5 ${
                          isLight ? 'bg-cyan-50 border-cyan-200 text-cyan-800' : 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400'
                        }`}>
                          <Building2 className="w-3.5 h-3.5 text-cyan-600" />
                          {emp.phong_name || 'Chưa gán'} {emp.khoa_name ? `(${emp.khoa_name})` : ''}
                        </span>
                        {emp.location_address && (
                          <p className={`text-[11px] flex items-center gap-1 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                            <MapPin className="w-3 h-3 text-emerald-600 shrink-0" />
                            <span>{emp.location_address}</span>
                          </p>
                        )}
                      </div>
                    </td>

                    {/* Position Loaded From Chức Danh */}
                    <td className="px-6 py-4 text-xs font-semibold">
                      <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                        <Briefcase className="w-4 h-4 text-cyan-600 shrink-0" />
                        <span className="font-bold">{emp.position || 'Nhân viên'}</span>
                      </div>
                    </td>

                    {/* Status Badge: Hoạt động / Ngưng */}
                    <td className="px-6 py-4">
                      {emp.status === 'ACTIVE' ? (
                        <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
                          isLight ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                        }`}>
                          Hoạt động
                        </span>
                      ) : (
                        <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
                          isLight ? 'bg-rose-50 border-rose-200 text-rose-700' : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                        }`}>
                          Ngưng
                        </span>
                      )}
                    </td>

                    {/* Action Buttons + Touch Switch Enable/Disable */}
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-3">
                        {/* TOUCH TOGGLE SWITCH BUTTON */}
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(emp)}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none shadow-inner ${
                            emp.status === 'ACTIVE' ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-700'
                          }`}
                          title={emp.status === 'ACTIVE' ? 'Bấm để Ngưng hoạt động nhân viên' : 'Bấm để Bật hoạt động nhân viên'}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-md transition-transform duration-200 ${
                              emp.status === 'ACTIVE' ? 'translate-x-6' : 'translate-x-1'
                            }`}
                          />
                        </button>

                        <button
                          onClick={() => openEditEmp(emp)}
                          className={`p-2 rounded-lg text-xs font-bold transition ${
                            isLight ? 'bg-slate-100 hover:bg-slate-200 text-cyan-700' : 'bg-slate-800 hover:bg-slate-700 text-cyan-400'
                          }`}
                          title="Sửa thông tin nhân viên"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(emp.id)}
                          className={`p-2 rounded-lg text-xs font-bold transition ${
                            isLight ? 'bg-rose-50 hover:bg-rose-100 text-rose-600' : 'bg-rose-500/10 hover:bg-rose-500/20 text-rose-400'
                          }`}
                          title="Xóa nhân viên"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* RIGHT SLIDE-OVER DRAWER FOR ADD/EDIT EMPLOYEE (WIDENED TO max-w-lg) */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity" onClick={() => setDrawerOpen(false)}></div>

          <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
            <div className={`w-screen max-w-lg ${isLight ? 'bg-white text-slate-800' : 'bg-slate-900 text-slate-100'} shadow-2xl border-l ${isLight ? 'border-slate-200' : 'border-slate-800'} flex flex-col`}>
              
              {/* Drawer Header */}
              <div className={`p-6 border-b flex items-center justify-between ${isLight ? 'border-slate-200 bg-slate-50' : 'border-slate-800 bg-slate-950/50'}`}>
                <h3 className={`font-bold text-lg flex items-center gap-2 ${isLight ? 'text-slate-900' : 'text-white'}`}>
                  <UserCheck className="w-5 h-5 text-cyan-600" /> {editingEmp ? 'Chỉnh Sửa Hồ Sơ Nhân Viên' : 'Thêm Mới Hồ Sơ Nhân Viên'}
                </h3>
                <button onClick={() => setDrawerOpen(false)} className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Drawer Content Form */}
              <form onSubmit={handleSubmit} className="flex-1 p-6 space-y-4 text-xs overflow-y-auto">
                {/* Employee ID */}
                <div className="space-y-1">
                  <label className={`font-bold ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                    Mã Nhân Viên <span className="text-rose-500 font-extrabold ml-0.5">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Nhập mã nhân viên..."
                    value={employeeId}
                    onChange={(e) => setEmployeeId(e.target.value)}
                    className={`w-full border rounded-xl px-3.5 py-2.5 font-mono font-bold ${
                      isLight ? 'bg-slate-50 border-slate-300 text-cyan-700' : 'bg-slate-950 border-slate-700 text-cyan-400'
                    }`}
                  />
                </div>

                {/* Full Name */}
                <div className="space-y-1">
                  <label className={`font-bold ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                    Họ Và Tên <span className="text-rose-500 font-extrabold ml-0.5">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Nhập họ và tên nhân viên..."
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className={`w-full border rounded-xl px-3.5 py-2.5 font-bold ${
                      isLight ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-slate-950 border-slate-700 text-white'
                    }`}
                  />
                </div>

                {/* 1. PHÒNG BAN DROPDOWN FIRST (OPTIONAL - NO RED ASTERISK) */}
                <div className="space-y-1">
                  <label className={`font-bold ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                    Phòng Ban
                  </label>
                  <select
                    value={phongId}
                    onChange={(e) => handlePhongChange(e.target.value)}
                    className={`w-full border rounded-xl px-3.5 py-2.5 font-bold ${
                      isLight ? 'bg-slate-50 border-slate-300 text-cyan-900' : 'bg-slate-950 border-slate-700 text-cyan-400'
                    }`}
                  >
                    <option value="">-- Chưa chọn Phòng Ban (Không bắt buộc) --</option>
                    {phongList.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.location_address})
                      </option>
                    ))}
                  </select>
                </div>

                {/* 2. KHOA / ĐƠN VỊ DROPDOWN SECOND (OPTIONAL - NO RED ASTERISK) */}
                <div className="space-y-1">
                  <label className={`font-bold ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                    Khoa / Đơn Vị Trực Thuộc
                  </label>
                  <select
                    value={selectedKhoaId}
                    onChange={(e) => setSelectedKhoaId(e.target.value)}
                    className={`w-full border rounded-xl px-3.5 py-2.5 font-bold ${
                      isLight ? 'bg-slate-50 border-slate-300 text-slate-800' : 'bg-slate-950 border-slate-700 text-slate-200'
                    }`}
                  >
                    <option value="">-- Chưa chọn Khoa (Không bắt buộc) --</option>
                    {khoaList.map(k => (
                      <option key={k.id} value={k.id}>
                        {k.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* DYNAMIC CHỨC DANH SELECT (LOAD STRICTLY ONLY POSITION NAME WITHOUT PARENTHETICAL CODE) */}
                <div className="space-y-1">
                  <label className={`font-bold ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                    Chức Danh / Chức Vụ <span className="text-rose-500 font-extrabold ml-0.5">*</span>
                  </label>
                  <select
                    required
                    value={position}
                    onChange={(e) => setPosition(e.target.value)}
                    className={`w-full border rounded-xl px-3.5 py-2.5 font-semibold ${
                      isLight ? 'bg-slate-50 border-slate-300 text-slate-800' : 'bg-slate-950 border-slate-700 text-slate-200'
                    }`}
                  >
                    {chucDanhList.map(cd => (
                      <option key={cd.id} value={cd.name}>
                        {cd.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Email */}
                <div className="space-y-1">
                  <label className={`font-bold ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>Email Công Việc</label>
                  <input
                    type="email"
                    placeholder="Nhập email công việc..."
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={`w-full border rounded-xl px-3.5 py-2.5 ${
                      isLight ? 'bg-slate-50 border-slate-300 text-slate-800' : 'bg-slate-950 border-slate-700 text-slate-200'
                    }`}
                  />
                </div>

                {/* Phone */}
                <div className="space-y-1">
                  <label className={`font-bold ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>Số Điện Thoại</label>
                  <input
                    type="text"
                    placeholder="Nhập số điện thoại liên hệ..."
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className={`w-full border rounded-xl px-3.5 py-2.5 ${
                      isLight ? 'bg-slate-50 border-slate-300 text-slate-800' : 'bg-slate-950 border-slate-700 text-slate-200'
                    }`}
                  />
                </div>

                {/* Status Options: Hoạt động / Ngưng */}
                <div className="space-y-1">
                  <label className={`font-bold ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>Trạng Thái Công Tác</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className={`w-full border rounded-xl px-3.5 py-2.5 font-bold ${
                      isLight ? 'bg-slate-50 border-slate-300 text-slate-800' : 'bg-slate-950 border-slate-700 text-slate-200'
                    }`}
                  >
                    <option value="ACTIVE">Hoạt động</option>
                    <option value="INACTIVE">Ngưng</option>
                  </select>
                </div>

                {/* Drawer Footer Buttons */}
                <div className={`pt-4 border-t flex justify-end gap-3 mt-auto ${isLight ? 'border-slate-200' : 'border-slate-800'}`}>
                  <button
                    type="button"
                    onClick={() => setDrawerOpen(false)}
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
                    Lưu Hồ Sơ Nhân Viên
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
