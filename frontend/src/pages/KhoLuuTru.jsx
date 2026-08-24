import React, { useState, useEffect } from 'react';
import { 
  Warehouse, 
  Search, 
  Plus, 
  Edit2, 
  Trash2, 
  X, 
  Building2, 
  MapPin, 
  UserCheck, 
  Phone, 
  FileText,
  Save,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

export default function KhoLuuTru({ theme, metadata }) {
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Drawer & Form states
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [phongId, setPhongId] = useState('');
  const [locationAddress, setLocationAddress] = useState('');
  const [managerName, setManagerName] = useState('');
  const [phone, setPhone] = useState('');
  const [notes, setNotes] = useState('');

  const isLight = theme === 'light';
  const cardClass = isLight 
    ? 'bg-white border-slate-200 text-slate-800 shadow-sm' 
    : 'bg-slate-900/80 border-slate-800/80 text-white shadow-xl backdrop-blur-md';

  useEffect(() => {
    fetchWarehouses();
  }, []);

  const fetchWarehouses = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/kho-luu-tru');
      const data = await res.json();
      if (Array.isArray(data)) {
        setWarehouses(data);
      }
    } catch (err) {
      console.error('Lỗi tải danh sách kho lưu trữ:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setEditingId(null);
    setCode(`KHO-${Date.now().toString().slice(-4)}`);
    setName('');
    setPhongId(metadata?.departments?.[0]?.id || '');
    setLocationAddress('');
    setManagerName('');
    setPhone('');
    setNotes('');
    setDrawerOpen(true);
  };

  const handleOpenEdit = (item) => {
    setEditingId(item.id);
    setCode(item.code || '');
    setName(item.name || '');
    setPhongId(item.phong_id || '');
    setLocationAddress(item.location_address || '');
    setManagerName(item.manager_name || '');
    setPhone(item.phone || '');
    setNotes(item.notes || '');
    setDrawerOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('Vui lòng nhập Tên kho lưu trữ!');
      return;
    }

    const payload = {
      code,
      name,
      phongId: phongId ? parseInt(phongId, 10) : null,
      locationAddress,
      managerName,
      phone,
      notes
    };

    try {
      const url = editingId ? `/api/kho-luu-tru/${editingId}` : '/api/kho-luu-tru';
      const method = editingId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setDrawerOpen(false);
        fetchWarehouses();
      } else {
        const errData = await res.json();
        alert(errData.error || 'Có lỗi xảy ra khi lưu thông tin kho lưu trữ');
      }
    } catch (err) {
      console.error(err);
      alert('Không thể kết nối đến máy chủ.');
    }
  };

  const handleDelete = async (id, warehouseName) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa kho lưu trữ "${warehouseName}"?`)) return;

    try {
      const res = await fetch(`/api/kho-luu-tru/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchWarehouses();
      } else {
        alert('Không thể xóa kho lưu trữ này.');
      }
    } catch (err) {
      console.error(err);
      alert('Có lỗi xảy ra khi xóa.');
    }
  };

  const filtered = warehouses.filter(w => 
    w.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    w.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    w.phong_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    w.manager_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      
      {/* Search & Header Action Bar (No Summary Cards) */}
      <div className={`${cardClass} p-4 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4`}>
        <div className="relative w-full md:w-96">
          <Search className={`w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 ${isLight ? 'text-slate-400' : 'text-slate-400'}`} />
          <input
            type="text"
            placeholder="Tìm theo Mã kho, Tên kho, Phòng ban, Người quản lý..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`w-full border rounded-xl pl-10 pr-4 py-2.5 text-xs font-semibold focus:outline-none focus:border-cyan-500 ${
              isLight ? 'bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-400' : 'bg-slate-950 border-slate-700 text-slate-200 placeholder-slate-500'
            }`}
          />
        </div>

        <button
          onClick={handleOpenAdd}
          className="w-full md:w-auto px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow-lg shadow-cyan-600/20 flex items-center justify-center gap-2 transition"
        >
          <Plus className="w-4 h-4" /> Thêm Kho Lưu Trữ Mới
        </button>
      </div>

      {/* Main Table Content */}
      <div className={`${cardClass} rounded-2xl overflow-hidden`}>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className={`uppercase text-[10px] font-extrabold tracking-wider border-b ${
              isLight ? 'bg-slate-50 border-slate-200 text-slate-500' : 'bg-slate-950/60 border-slate-800 text-slate-400'
            }`}>
              <tr>
                <th className="p-4 pl-6">Mã Kho</th>
                <th className="p-4">Tên Kho Lưu Trữ</th>
                <th className="p-4">Bộ Phận / Phòng Ban Gán</th>
                <th className="p-4">Địa Điểm / Vị Trí</th>
                <th className="p-4">Người Quản Lý Kho</th>
                <th className="p-4">Ghi Chú</th>
                <th className="p-4 pr-6 text-right">Thao Tác</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${isLight ? 'divide-slate-200' : 'divide-slate-800/60'}`}>
              {loading ? (
                <tr>
                  <td colSpan="7" className="p-8 text-center text-slate-400">Đang tải danh sách kho lưu trữ...</td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan="7" className="p-8 text-center text-slate-400 italic">
                    {searchTerm ? 'Không tìm thấy kho lưu trữ phù hợp với từ khóa' : 'Chưa có kho lưu trữ nào được khởi tạo'}
                  </td>
                </tr>
              ) : (
                filtered.map((item) => (
                  <tr key={item.id} className={`transition ${isLight ? 'hover:bg-slate-50/80' : 'hover:bg-slate-800/40'}`}>
                    
                    {/* Mã Kho */}
                    <td className="p-4 pl-6 font-mono font-bold">
                      <span className={`px-2.5 py-1 rounded-lg border text-[11px] ${
                        isLight ? 'bg-cyan-50 border-cyan-200 text-cyan-800' : 'bg-cyan-950/50 border-cyan-800 text-cyan-300'
                      }`}>
                        {item.code}
                      </span>
                    </td>

                    {/* Tên Kho */}
                    <td className="p-4 font-bold text-sm">
                      <div className="flex items-center gap-2">
                        <Warehouse className="w-4 h-4 text-cyan-600 shrink-0" />
                        <span>{item.name}</span>
                      </div>
                    </td>

                    {/* Bộ Phận Gán */}
                    <td className="p-4 font-semibold">
                      {item.phong_name ? (
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-bold ${
                          isLight ? 'bg-slate-100 border-slate-300 text-slate-800' : 'bg-slate-800 border-slate-700 text-slate-200'
                        }`}>
                          <Building2 className="w-3.5 h-3.5 text-cyan-600" />
                          {item.phong_name}
                        </span>
                      ) : (
                        <span className="text-slate-400 italic">-- Chưa gán phòng --</span>
                      )}
                    </td>

                    {/* Vị trí */}
                    <td className="p-4 font-medium">
                      {item.location_address ? (
                        <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                          <MapPin className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                          {item.location_address}
                        </span>
                      ) : (
                        <span className="text-slate-400 italic">-- Chưa cập nhật --</span>
                      )}
                    </td>

                    {/* Quản Lý Kho */}
                    <td className="p-4">
                      {item.manager_name ? (
                        <div>
                          <p className="font-bold flex items-center gap-1">
                            <UserCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            {item.manager_name}
                          </p>
                          {item.phone && (
                            <p className="text-[11px] text-slate-400 font-mono flex items-center gap-1 mt-0.5">
                              <Phone className="w-3 h-3 text-slate-400" /> {item.phone}
                            </p>
                          )}
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">-- Chưa gán --</span>
                      )}
                    </td>

                    {/* Ghi chú */}
                    <td className="p-4 max-w-xs truncate text-slate-500 dark:text-slate-400">
                      {item.notes || '--'}
                    </td>

                    {/* Thao tác */}
                    <td className="p-4 pr-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenEdit(item)}
                          className="p-1.5 rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-cyan-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-cyan-600 transition"
                          title="Sửa thông tin kho"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id, item.name)}
                          className="p-1.5 rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-slate-600 dark:text-slate-300 hover:text-rose-600 transition"
                          title="Xóa kho"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
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

      {/* SLIDE-OVER DRAWER FORM (ADD / EDIT) */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity" onClick={() => setDrawerOpen(false)}></div>

          <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
            <div className={`w-screen max-w-xl ${isLight ? 'bg-white text-slate-800' : 'bg-slate-900 text-slate-100'} shadow-2xl border-l ${isLight ? 'border-slate-200' : 'border-slate-800'} flex flex-col`}>
              
              {/* Header */}
              <div className={`p-6 border-b flex items-center justify-between ${isLight ? 'border-slate-200 bg-slate-50' : 'border-slate-800 bg-slate-950/50'}`}>
                <div>
                  <h3 className={`font-bold text-lg flex items-center gap-2 ${isLight ? 'text-slate-900' : 'text-white'}`}>
                    <Warehouse className="w-5 h-5 text-cyan-600" />
                    {editingId ? 'Cập Nhật Kho Lưu Trữ' : 'Thêm Mới Kho Lưu Trữ Tài Sản'}
                  </h3>
                  <p className={`text-xs mt-1 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                    Khai báo kho chứa tài sản tập trung trước khi cấp phát bàn giao cho các bộ phận
                  </p>
                </div>
                <button onClick={() => setDrawerOpen(false)} className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Form Body */}
              <form onSubmit={handleSubmit} className="flex-1 flex flex-col min-h-0 overflow-hidden">
                <div className="flex-1 p-6 space-y-4 text-xs overflow-y-auto">
                  
                  {/* Mã kho & Tên kho */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className={`font-bold ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                        Mã Kho Lưu Trữ <span className="text-rose-500 font-extrabold ml-0.5">*</span>
                      </label>
                      <input
                        type="text"
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        className={`w-full border rounded-xl px-3.5 py-2.5 font-mono font-bold ${
                          isLight ? 'bg-slate-50 border-slate-300 text-cyan-800' : 'bg-slate-950 border-slate-700 text-cyan-300'
                        }`}
                        placeholder="Nhập mã kho..."
                        required
                      />
                    </div>

                    <div className="space-y-1">
                      <label className={`font-bold ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                        Tên Kho Lưu Trữ <span className="text-rose-500 font-extrabold ml-0.5">*</span>
                      </label>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Nhập tên kho lưu trữ..."
                        className={`w-full border rounded-xl px-3.5 py-2.5 font-bold ${
                          isLight ? 'bg-slate-50 border-slate-300 text-slate-800' : 'bg-slate-950 border-slate-700 text-slate-200'
                        }`}
                        required
                      />
                    </div>
                  </div>

                  {/* Phòng Ban / Khoa Phòng Gán (KEY REQUIREMENT) */}
                  <div className="space-y-1">
                    <label className={`font-bold flex items-center justify-between ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                      <span>Bộ Phận / Phòng Ban Quản Lý Kho</span>
                      <span className="text-[10px] text-cyan-600 font-bold">Gán trực thuộc</span>
                    </label>
                    <select
                      value={phongId}
                      onChange={(e) => setPhongId(e.target.value)}
                      className={`w-full border rounded-xl px-3.5 py-2.5 font-bold ${
                        isLight ? 'bg-slate-50 border-slate-300 text-slate-800' : 'bg-slate-950 border-slate-700 text-slate-200'
                      }`}
                    >
                      <option value="">-- Chưa gán phòng ban --</option>
                      {(metadata?.departments || []).map((dept) => (
                        <option key={dept.id} value={dept.id}>
                          {dept.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Địa điểm / Vị trí kho */}
                  <div className="space-y-1">
                    <label className={`font-bold ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                      Địa Điểm / Vị Trí Đặt Kho
                    </label>
                    <input
                      type="text"
                      value={locationAddress}
                      onChange={(e) => setLocationAddress(e.target.value)}
                      placeholder="Nhập địa điểm / vị trí đặt kho..."
                      className={`w-full border rounded-xl px-3.5 py-2.5 ${
                        isLight ? 'bg-slate-50 border-slate-300 text-slate-800' : 'bg-slate-950 border-slate-700 text-slate-200'
                      }`}
                    />
                  </div>

                  {/* Người quản lý & Số điện thoại */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className={`font-bold ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>Người Quản Lý Kho</label>
                      <input
                        type="text"
                        value={managerName}
                        onChange={(e) => setManagerName(e.target.value)}
                        placeholder="Nhập tên người quản lý kho..."
                        className={`w-full border rounded-xl px-3.5 py-2.5 font-bold ${
                          isLight ? 'bg-slate-50 border-slate-300 text-slate-800' : 'bg-slate-950 border-slate-700 text-slate-200'
                        }`}
                      />
                    </div>

                    <div className="space-y-1">
                      <label className={`font-bold ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>Số Điện Thoại Liên Hệ</label>
                      <input
                        type="text"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="Nhập số điện thoại..."
                        className={`w-full border rounded-xl px-3.5 py-2.5 font-mono ${
                          isLight ? 'bg-slate-50 border-slate-300 text-slate-800' : 'bg-slate-950 border-slate-700 text-slate-200'
                        }`}
                      />
                    </div>
                  </div>

                  {/* Ghi chú */}
                  <div className="space-y-1">
                    <label className={`font-bold ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>Ghi Chú Kho Lưu Trữ</label>
                    <textarea
                      rows={3}
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Nhập ghi chú đặc điểm kho, loại tài sản ưu tiên lưu trữ..."
                      className={`w-full border rounded-xl px-3.5 py-2.5 ${
                        isLight ? 'bg-slate-50 border-slate-300 text-slate-800' : 'bg-slate-950 border-slate-700 text-slate-200'
                      }`}
                    />
                  </div>

                </div>

                {/* Sticky Footer */}
                <div className={`p-4 px-6 border-t flex justify-end gap-3 shrink-0 ${isLight ? 'border-slate-200 bg-slate-50/90' : 'border-slate-800 bg-slate-950/90'}`}>
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
                    className="px-6 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold shadow-lg shadow-cyan-600/20 flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" /> {editingId ? 'Lưu Cập Nhật' : 'Tạo Kho Lưu Trữ'}
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
