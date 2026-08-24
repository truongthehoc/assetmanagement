import React, { useState, useEffect, useRef } from 'react';
import { 
  Building2, 
  Plus, 
  Search, 
  MapPin, 
  Edit3, 
  Trash2, 
  X,
  UserCheck,
  ChevronDown
} from 'lucide-react';

// Custom Searchable Employee Combobox Select Component with Clear Button & Empty Option
function SearchableEmployeeSelect({ employees, value, onChange, placeholder, isLight }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const containerRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const selectedEmp = employees.find(e => e.full_name === value || e.id === value || `${e.full_name} (${e.employee_id})` === value);
  const displayText = selectedEmp 
    ? `${selectedEmp.full_name} (${selectedEmp.employee_id})` 
    : (value ? value : (placeholder || '-- Chưa phân công / Xóa trống --'));

  const filtered = employees.filter(e =>
    !search ||
    e.full_name.toLowerCase().includes(search.toLowerCase()) ||
    e.employee_id.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="relative" ref={containerRef}>
      {/* Clickable Display Input */}
      <div
        onClick={() => setOpen(!open)}
        className={`w-full border rounded-xl px-3.5 py-2.5 font-bold cursor-pointer flex items-center justify-between transition ${
          isLight 
            ? (value ? 'bg-cyan-50/60 border-cyan-300 text-cyan-900' : 'bg-slate-50 border-slate-300 text-slate-500') 
            : (value ? 'bg-slate-950 border-slate-700 text-cyan-400' : 'bg-slate-950 border-slate-700 text-slate-400')
        }`}
      >
        <span className="truncate">{displayText}</span>

        <div className="flex items-center gap-1 shrink-0 ml-2">
          {/* Clear Button (Xóa trống) */}
          {value && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onChange('');
              }}
              className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/20 transition"
              title="Xóa trống người phụ trách"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
          <ChevronDown className="w-4 h-4 text-cyan-600" />
        </div>
      </div>

      {/* Search Popover Dropdown */}
      {open && (
        <div className={`absolute left-0 right-0 top-full mt-1.5 z-50 rounded-xl border shadow-2xl p-2.5 space-y-2 ${
          isLight ? 'bg-white border-slate-200 text-slate-800' : 'bg-slate-900 border-slate-700 text-slate-100'
        }`}>
          {/* Search Box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              autoFocus
              placeholder="Nhập tên hoặc mã nhân viên để tìm..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={`w-full border rounded-lg pl-9 pr-3 py-2 text-xs font-semibold focus:outline-none focus:border-cyan-500 ${
                isLight ? 'bg-slate-50 border-slate-200 text-slate-800' : 'bg-slate-950 border-slate-800 text-slate-200'
              }`}
            />
          </div>

          {/* Options List */}
          <div className="max-h-48 overflow-y-auto space-y-1 text-xs">
            {/* Option 0: Clear / Unassigned Option (Xóa Trống) */}
            <div
              onClick={() => {
                onChange('');
                setOpen(false);
                setSearch('');
              }}
              className={`p-2.5 rounded-lg cursor-pointer transition font-bold flex items-center justify-between border-b ${
                !value 
                  ? (isLight ? 'bg-slate-100 text-slate-900' : 'bg-slate-800 text-white')
                  : (isLight ? 'text-slate-500 hover:bg-slate-50' : 'text-slate-400 hover:bg-slate-800/60')
              }`}
            >
              <span className="italic">-- Chưa phân công / Xóa trống người phụ trách --</span>
              {!value && <span className="text-[11px] font-semibold text-emerald-600">✓ Đang chọn</span>}
            </div>

            {filtered.length === 0 ? (
              <div className="p-3 text-center text-slate-400 italic">Không tìm thấy nhân viên phù hợp</div>
            ) : (
              filtered.map((emp) => (
                <div
                  key={emp.id}
                  onClick={() => {
                    onChange(emp.full_name);
                    setOpen(false);
                    setSearch('');
                  }}
                  className={`p-2.5 rounded-lg cursor-pointer transition font-bold flex items-center justify-between ${
                    (value === emp.full_name || value === `${emp.full_name} (${emp.employee_id})`)
                      ? 'bg-cyan-600 text-white shadow-md'
                      : (isLight ? 'hover:bg-slate-100 text-slate-800' : 'hover:bg-slate-800 text-slate-200')
                  }`}
                >
                  <span>{emp.full_name} ({emp.employee_id})</span>
                  {emp.position && <span className="text-[11px] opacity-75 font-semibold ml-2">{emp.position}</span>}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function KhoaPhong({ theme }) {
  const [activeSubTab, setActiveSubTab] = useState('khoa'); // 'khoa' | 'phong'
  const [khoaList, setKhoaList] = useState([]);
  const [phongList, setPhongList] = useState([]);
  const [employeeList, setEmployeeList] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  // Slide-over Right Drawer states for Khoa
  const [khoaDrawer, setKhoaDrawer] = useState(false);
  const [editingKhoa, setEditingKhoa] = useState(null);
  const [khoaCode, setKhoaCode] = useState('');
  const [khoaName, setKhoaName] = useState('');
  const [khoaManager, setKhoaManager] = useState('');
  const [khoaDesc, setKhoaDesc] = useState('');

  // Slide-over Right Drawer states for Phong
  const [phongDrawer, setPhongDrawer] = useState(false);
  const [editingPhong, setEditingPhong] = useState(null);
  const [phongCode, setPhongCode] = useState('');
  const [phongName, setPhongName] = useState('');
  const [phongKhoaId, setPhongKhoaId] = useState('');
  const [phongLocation, setPhongLocation] = useState('');
  const [phongManager, setPhongManager] = useState('');

  const isLight = theme === 'light';

  const fetchData = async () => {
    try {
      const [resKhoa, resPhong, resEmp] = await Promise.all([
        fetch('/api/khoa').then(r => r.json()),
        fetch('/api/phong').then(r => r.json()),
        fetch('/api/employees').then(r => r.json())
      ]);
      setKhoaList(Array.isArray(resKhoa) ? resKhoa : []);
      setPhongList(Array.isArray(resPhong) ? resPhong : []);
      setEmployeeList(Array.isArray(resEmp) ? resEmp : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // --- KHOA DRAWER HANDLERS ---
  const openAddKhoa = () => {
    setEditingKhoa(null);
    setKhoaCode(`K-${Math.floor(100 + Math.random() * 900)}`);
    setKhoaName('');
    setKhoaManager(''); // Default Empty (Optional field)
    setKhoaDesc('');
    setKhoaDrawer(true);
  };

  const openEditKhoa = (k) => {
    setEditingKhoa(k);
    setKhoaCode(k.code);
    setKhoaName(k.name);
    setKhoaManager(k.manager_name || '');
    setKhoaDesc(k.description || '');
    setKhoaDrawer(true);
  };

  const handleKhoaSubmit = async (e) => {
    e.preventDefault();
    const payload = { code: khoaCode, name: khoaName, managerName: khoaManager || null, description: khoaDesc };

    if (editingKhoa) {
      await fetch(`/api/khoa/${editingKhoa.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
    } else {
      await fetch('/api/khoa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
    }
    setKhoaDrawer(false);
    await fetchData();
  };

  const handleDeleteKhoa = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa Khoa này? Tất cả các Phòng thuộc Khoa cũng sẽ bị xóa.')) return;
    await fetch(`/api/khoa/${id}`, { method: 'DELETE' });
    await fetchData();
  };

  // --- PHÒNG DRAWER HANDLERS ---
  const openAddPhong = () => {
    setEditingPhong(null);
    setPhongCode(`P-${Math.floor(100 + Math.random() * 900)}`);
    setPhongName('');
    setPhongKhoaId(khoaList[0]?.id || '');
    setPhongLocation('Tòa Nhà A - Tầng 2 - Phòng A201');
    setPhongManager(''); // Default Empty (Optional field - Xóa trống được)
    setPhongDrawer(true);
  };

  const openEditPhong = (p) => {
    setEditingPhong(p);
    setPhongCode(p.code);
    setPhongName(p.name);
    setPhongKhoaId(p.khoa_id);
    setPhongLocation(p.location_address);
    setPhongManager(p.manager_name || '');
    setPhongDrawer(true);
  };

  const handlePhongSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      code: phongCode,
      name: phongName,
      khoaId: phongKhoaId,
      locationAddress: phongLocation,
      managerName: phongManager || null
    };

    if (editingPhong) {
      await fetch(`/api/phong/${editingPhong.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
    } else {
      await fetch('/api/phong', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
    }
    setPhongDrawer(false);
    await fetchData();
  };

  const handleDeletePhong = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa Phòng này?')) return;
    await fetch(`/api/phong/${id}`, { method: 'DELETE' });
    await fetchData();
  };

  const filteredKhoa = khoaList.filter(k => 
    !searchTerm || 
    k.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    k.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredPhong = phongList.filter(p => 
    !searchTerm || 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.location_address.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const cardClass = isLight ? 'glass-card-light' : 'glass-card-dark';

  return (
    <div className="space-y-6">
      {/* Top Banner & Tab Controls */}
      <div className={`${cardClass} p-6 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4`}>
        <div>
          <h2 className={`text-xl font-bold flex items-center gap-2 ${isLight ? 'text-slate-900' : 'text-white'}`}>
            <Building2 className="w-6 h-6 text-cyan-600" /> Quản Lý Danh Mục Khoa / Phòng
          </h2>
          <p className={`text-sm mt-1 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
            Cấu trúc sơ đồ tổ chức doanh nghiệp/bệnh viện. Trưởng khoa & người phụ trách chọn trực tiếp từ danh mục Nhân viên (có thể để trống).
          </p>
        </div>

        {/* Tab Switcher Buttons: Khoa | Phòng */}
        <div className={`flex items-center gap-2 p-1.5 rounded-xl border ${isLight ? 'bg-slate-100 border-slate-200' : 'bg-slate-900 border-slate-800'}`}>
          <button
            onClick={() => setActiveSubTab('khoa')}
            className={`px-5 py-2 rounded-lg text-xs font-bold transition flex items-center gap-2 ${
              activeSubTab === 'khoa' 
                ? 'bg-cyan-600 text-white shadow-md' 
                : (isLight ? 'text-slate-600 hover:text-slate-900' : 'text-slate-400 hover:text-white')
            }`}
          >
            <Building2 className="w-4 h-4" /> KHOA ({khoaList.length})
          </button>
          <button
            onClick={() => setActiveSubTab('phong')}
            className={`px-5 py-2 rounded-lg text-xs font-bold transition flex items-center gap-2 ${
              activeSubTab === 'phong' 
                ? 'bg-cyan-600 text-white shadow-md' 
                : (isLight ? 'text-slate-600 hover:text-slate-900' : 'text-slate-400 hover:text-white')
            }`}
          >
            <MapPin className="w-4 h-4" /> PHÒNG ({phongList.length})
          </button>
        </div>
      </div>

      {/* Action Bar: Search & Add Buttons */}
      <div className={`${cardClass} p-4 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4`}>
        <div className="relative w-full md:w-80">
          <Search className={`w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 ${isLight ? 'text-slate-400' : 'text-slate-400'}`} />
          <input
            type="text"
            placeholder={activeSubTab === 'khoa' ? 'Nhập mã hoặc tên khoa để tìm...' : 'Nhập tên phòng hoặc vị trí...'}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`w-full border rounded-xl pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-cyan-500 ${
              isLight ? 'bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-400' : 'bg-slate-900 border-slate-700 text-slate-200 placeholder-slate-500'
            }`}
          />
        </div>

        <div>
          {activeSubTab === 'khoa' ? (
            <button
              onClick={openAddKhoa}
              className="px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow-lg shadow-cyan-600/20 flex items-center gap-2"
            >
              <Plus className="w-4 h-4" /> Thêm Khoa Mới
            </button>
          ) : (
            <button
              onClick={openAddPhong}
              className="px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow-lg shadow-cyan-600/20 flex items-center gap-2"
            >
              <Plus className="w-4 h-4" /> Thêm Phòng Mới
            </button>
          )}
        </div>
      </div>

      {/* TAB 1: KHOA LIST TABLE */}
      {activeSubTab === 'khoa' && (
        <div className={`${cardClass} rounded-2xl overflow-hidden`}>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className={`text-xs font-bold uppercase border-b ${
                isLight ? 'bg-slate-100/80 text-slate-600 border-slate-200' : 'bg-slate-900/90 text-slate-400 border-slate-800'
              }`}>
                <tr>
                  <th className="px-6 py-4">Mã Khoa</th>
                  <th className="px-6 py-4">Tên Khoa / Đơn Vị</th>
                  <th className="px-6 py-4">Trưởng Khoa / Phụ Trách</th>
                  <th className="px-6 py-4">Mô Tả Chức Năng</th>
                  <th className="px-6 py-4">Số Phòng Trực Thuộc</th>
                  <th className="px-6 py-4 text-right">Thao Tác</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${isLight ? 'divide-slate-200 text-slate-700' : 'divide-slate-800/80 text-slate-300'}`}>
                {filteredKhoa.map((k) => (
                  <tr key={k.id} className={isLight ? 'hover:bg-slate-50 transition' : 'hover:bg-slate-900/50 transition'}>
                    <td className={`px-6 py-4 font-mono font-bold ${isLight ? 'text-cyan-700' : 'text-cyan-400'}`}>
                      {k.code}
                    </td>
                    <td className="px-6 py-4">
                      <p className={`font-bold text-base ${isLight ? 'text-slate-900' : 'text-white'}`}>{k.name}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className={`font-bold text-xs flex items-center gap-1.5 ${isLight ? 'text-cyan-800' : 'text-cyan-400'}`}>
                        <UserCheck className="w-3.5 h-3.5 text-cyan-600 shrink-0" />
                        <span>{k.manager_name || 'Chưa phân công'}</span>
                      </p>
                    </td>
                    <td className={`px-6 py-4 text-xs italic ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                      {k.description || 'Chưa nhập mô tả'}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
                        isLight ? 'bg-cyan-50 border-cyan-200 text-cyan-700' : 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400'
                      }`}>
                        {k.total_phong || 0} Phòng
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEditKhoa(k)}
                          className={`p-2 rounded-lg text-xs font-bold transition ${
                            isLight ? 'bg-slate-100 hover:bg-slate-200 text-cyan-700' : 'bg-slate-800 hover:bg-slate-700 text-cyan-400'
                          }`}
                          title="Sửa Khoa"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteKhoa(k.id)}
                          className={`p-2 rounded-lg text-xs font-bold transition ${
                            isLight ? 'bg-rose-50 hover:bg-rose-100 text-rose-600' : 'bg-rose-500/10 hover:bg-rose-500/20 text-rose-400'
                          }`}
                          title="Xóa Khoa"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: PHÒNG LIST TABLE */}
      {activeSubTab === 'phong' && (
        <div className={`${cardClass} rounded-2xl overflow-hidden`}>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className={`text-xs font-bold uppercase border-b ${
                isLight ? 'bg-slate-100/80 text-slate-600 border-slate-200' : 'bg-slate-900/90 text-slate-400 border-slate-800'
              }`}>
                <tr>
                  <th className="px-6 py-4">Mã Phòng</th>
                  <th className="px-6 py-4">Tên Phòng</th>
                  <th className="px-6 py-4">Khoa Trực Thuộc</th>
                  <th className="px-6 py-4">Vị Trí Lắp Đặt</th>
                  <th className="px-6 py-4">Người Phụ Trách</th>
                  <th className="px-6 py-4 text-right">Thao Tác</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${isLight ? 'divide-slate-200 text-slate-700' : 'divide-slate-800/80 text-slate-300'}`}>
                {filteredPhong.map((p) => (
                  <tr key={p.id} className={isLight ? 'hover:bg-slate-50 transition' : 'hover:bg-slate-900/50 transition'}>
                    <td className={`px-6 py-4 font-mono font-bold ${isLight ? 'text-cyan-700' : 'text-cyan-400'}`}>
                      {p.code}
                    </td>
                    <td className="px-6 py-4">
                      <p className={`font-bold text-base ${isLight ? 'text-slate-900' : 'text-white'}`}>{p.name}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
                        isLight ? 'bg-amber-50 border-amber-200 text-amber-800' : 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                      }`}>
                        {p.khoa_name}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-semibold text-xs">
                      <div className="flex items-center gap-1.5 text-emerald-600">
                        <MapPin className="w-4 h-4 shrink-0" />
                        <span>{p.location_address}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs font-bold">
                      <div className="flex items-center gap-1 text-cyan-800 dark:text-cyan-400">
                        <UserCheck className="w-3.5 h-3.5 text-cyan-600 shrink-0" />
                        <span>{p.manager_name || 'Chưa phân công'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEditPhong(p)}
                          className={`p-2 rounded-lg text-xs font-bold transition ${
                            isLight ? 'bg-slate-100 hover:bg-slate-200 text-cyan-700' : 'bg-slate-800 hover:bg-slate-700 text-cyan-400'
                          }`}
                          title="Sửa Phòng"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeletePhong(p.id)}
                          className={`p-2 rounded-lg text-xs font-bold transition ${
                            isLight ? 'bg-rose-50 hover:bg-rose-100 text-rose-600' : 'bg-rose-500/10 hover:bg-rose-500/20 text-rose-400'
                          }`}
                          title="Xóa Phòng"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* RIGHT SLIDE-OVER DRAWER FOR KHOA (EXPANDED TO max-w-lg) */}
      {khoaDrawer && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity" onClick={() => setKhoaDrawer(false)}></div>

          <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
            <div className={`w-screen max-w-lg ${isLight ? 'bg-white text-slate-800' : 'bg-slate-900 text-slate-100'} shadow-2xl border-l ${isLight ? 'border-slate-200' : 'border-slate-800'} flex flex-col`}>
              
              {/* Drawer Header */}
              <div className={`p-6 border-b flex items-center justify-between ${isLight ? 'border-slate-200 bg-slate-50' : 'border-slate-800 bg-slate-950/50'}`}>
                <h3 className={`font-bold text-lg flex items-center gap-2 ${isLight ? 'text-slate-900' : 'text-white'}`}>
                  <Building2 className="w-5 h-5 text-cyan-600" /> {editingKhoa ? 'Chỉnh Sửa Khoa' : 'Thêm Mới Khoa / Đơn Vị'}
                </h3>
                <button onClick={() => setKhoaDrawer(false)} className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Drawer Content */}
              <form onSubmit={handleKhoaSubmit} className="flex-1 p-6 space-y-4 text-xs overflow-y-auto">
                <div className="space-y-1">
                  <label className={`font-bold ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                    Mã Khoa <span className="text-rose-500 font-extrabold ml-0.5">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Nhập mã khoa..."
                    value={khoaCode}
                    onChange={(e) => setKhoaCode(e.target.value)}
                    className={`w-full border rounded-xl px-3.5 py-2.5 font-mono font-bold ${
                      isLight ? 'bg-slate-50 border-slate-300 text-cyan-700' : 'bg-slate-950 border-slate-700 text-cyan-400'
                    }`}
                  />
                </div>

                <div className="space-y-1">
                  <label className={`font-bold ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                    Tên Khoa / Đơn Vị <span className="text-rose-500 font-extrabold ml-0.5">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Nhập tên khoa hoặc đơn vị..."
                    value={khoaName}
                    onChange={(e) => setKhoaName(e.target.value)}
                    className={`w-full border rounded-xl px-3.5 py-2.5 ${
                      isLight ? 'bg-slate-50 border-slate-300 text-slate-800' : 'bg-slate-950 border-slate-700 text-slate-200'
                    }`}
                  />
                </div>

                {/* SEARCHABLE EMPLOYEE SELECT FOR TRƯỞNG KHOA / PHỤ TRÁCH */}
                <div className="space-y-1">
                  <label className={`font-bold ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>Trưởng Khoa / Phụ Trách</label>
                  <SearchableEmployeeSelect
                    employees={employeeList}
                    value={khoaManager}
                    onChange={(val) => setKhoaManager(val)}
                    placeholder="-- Chọn Trưởng khoa (Không bắt buộc) --"
                    isLight={isLight}
                  />
                </div>

                <div className="space-y-1">
                  <label className={`font-bold ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>Mô Tả Chức Năng</label>
                  <textarea
                    rows={4}
                    placeholder="Nhập thông tin cơ bản về chức năng khoa..."
                    value={khoaDesc}
                    onChange={(e) => setKhoaDesc(e.target.value)}
                    className={`w-full border rounded-xl px-3.5 py-2.5 ${
                      isLight ? 'bg-slate-50 border-slate-300 text-slate-800' : 'bg-slate-950 border-slate-700 text-slate-200'
                    }`}
                  />
                </div>

                {/* Drawer Footer Buttons */}
                <div className={`pt-4 border-t flex justify-end gap-3 mt-auto ${isLight ? 'border-slate-200' : 'border-slate-800'}`}>
                  <button
                    type="button"
                    onClick={() => setKhoaDrawer(false)}
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
                    Lưu Khoa
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* RIGHT SLIDE-OVER DRAWER FOR PHÒNG (EXPANDED TO max-w-lg) */}
      {phongDrawer && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity" onClick={() => setPhongDrawer(false)}></div>

          <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
            <div className={`w-screen max-w-lg ${isLight ? 'bg-white text-slate-800' : 'bg-slate-900 text-slate-100'} shadow-2xl border-l ${isLight ? 'border-slate-200' : 'border-slate-800'} flex flex-col`}>
              
              {/* Drawer Header */}
              <div className={`p-6 border-b flex items-center justify-between ${isLight ? 'border-slate-200 bg-slate-50' : 'border-slate-800 bg-slate-950/50'}`}>
                <h3 className={`font-bold text-lg flex items-center gap-2 ${isLight ? 'text-slate-900' : 'text-white'}`}>
                  <MapPin className="w-5 h-5 text-cyan-600" /> {editingPhong ? 'Chỉnh Sửa Phòng' : 'Thêm Mới Phòng Trực Thuộc Khoa'}
                </h3>
                <button onClick={() => setPhongDrawer(false)} className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Drawer Content */}
              <form onSubmit={handlePhongSubmit} className="flex-1 p-6 space-y-4 text-xs overflow-y-auto">
                <div className="space-y-1">
                  <label className={`font-bold ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                    Mã Phòng <span className="text-rose-500 font-extrabold ml-0.5">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Nhập mã phòng..."
                    value={phongCode}
                    onChange={(e) => setPhongCode(e.target.value)}
                    className={`w-full border rounded-xl px-3.5 py-2.5 font-mono font-bold ${
                      isLight ? 'bg-slate-50 border-slate-300 text-cyan-700' : 'bg-slate-950 border-slate-700 text-cyan-400'
                    }`}
                  />
                </div>

                <div className="space-y-1">
                  <label className={`font-bold ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                    Tên Phòng <span className="text-rose-500 font-extrabold ml-0.5">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Nhập tên phòng..."
                    value={phongName}
                    onChange={(e) => setPhongName(e.target.value)}
                    className={`w-full border rounded-xl px-3.5 py-2.5 ${
                      isLight ? 'bg-slate-50 border-slate-300 text-slate-800' : 'bg-slate-950 border-slate-700 text-slate-200'
                    }`}
                  />
                </div>

                {/* Khoa Select */}
                <div className="space-y-1">
                  <label className={`font-bold ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                    Khoa Trực Thuộc <span className="text-rose-500 font-extrabold ml-0.5">*</span>
                  </label>
                  <select
                    required
                    value={phongKhoaId}
                    onChange={(e) => setPhongKhoaId(e.target.value)}
                    className={`w-full border rounded-xl px-3.5 py-2.5 ${
                      isLight ? 'bg-slate-50 border-slate-300 text-slate-800' : 'bg-slate-950 border-slate-700 text-slate-200'
                    }`}
                  >
                    {khoaList.map(k => (
                      <option key={k.id} value={k.id}>{k.name}</option>
                    ))}
                  </select>
                </div>

                {/* Location Address Required Field */}
                <div className="space-y-1">
                  <label className={`font-bold ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                    Vị Trí <span className="text-rose-500 font-extrabold ml-0.5">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Nhập vị trí chi tiết tòa nhà, tầng, số phòng..."
                    value={phongLocation}
                    onChange={(e) => setPhongLocation(e.target.value)}
                    className={`w-full border rounded-xl px-3.5 py-2.5 font-bold ${
                      isLight ? 'bg-slate-50 border-slate-300 text-emerald-700' : 'bg-slate-950 border-slate-700 text-emerald-400'
                    }`}
                  />
                </div>

                {/* SEARCHABLE EMPLOYEE SELECT FOR NGƯỜI PHỤ TRÁCH PHÒNG (OPTIONAL - CAN BE CLEARED) */}
                <div className="space-y-1">
                  <label className={`font-bold ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>Người Phụ Trách Phòng</label>
                  <SearchableEmployeeSelect
                    employees={employeeList}
                    value={phongManager}
                    onChange={(val) => setPhongManager(val)}
                    placeholder="-- Chọn Người phụ trách (Có thể xóa trống) --"
                    isLight={isLight}
                  />
                </div>

                {/* Drawer Footer Buttons */}
                <div className={`pt-4 border-t flex justify-end gap-3 mt-auto ${isLight ? 'border-slate-200' : 'border-slate-800'}`}>
                  <button
                    type="button"
                    onClick={() => setPhongDrawer(false)}
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
                    Lưu Phòng
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
