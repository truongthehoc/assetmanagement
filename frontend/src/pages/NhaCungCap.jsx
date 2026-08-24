import React, { useState, useEffect } from 'react';
import { 
  Truck, 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  X, 
  Building2, 
  Phone, 
  Mail, 
  MapPin, 
  UserCheck, 
  FileText,
  Building
} from 'lucide-react';

export default function NhaCungCap({ theme }) {
  const [suppliers, setSuppliers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  // Drawer state
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState(null);

  // Delete modal state
  const [deleteModal, setDeleteModal] = useState(false);
  const [deletingSupplier, setDeletingSupplier] = useState(null);

  // Form states
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');

  const isLight = theme === 'light';

  const fetchData = async () => {
    try {
      const res = await fetch('/api/nha-cung-cap');
      const data = await res.json();
      setSuppliers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openAdd = () => {
    setEditingSupplier(null);
    setCode(`NCC-${Math.floor(1000 + Math.random() * 9000)}`);
    setName('');
    setContactPerson('');
    setPhone('');
    setEmail('');
    setAddress('');
    setNotes('');
    setDrawerOpen(true);
  };

  const openEdit = (s) => {
    setEditingSupplier(s);
    setCode(s.code || '');
    setName(s.name || '');
    setContactPerson(s.contact_person || '');
    setPhone(s.phone || '');
    setEmail(s.email || '');
    setAddress(s.address || '');
    setNotes(s.notes || '');
    setDrawerOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    const payload = {
      code,
      name,
      contact_person: contactPerson,
      phone,
      email,
      address,
      notes
    };

    try {
      if (editingSupplier) {
        await fetch(`/api/nha-cung-cap/${editingSupplier.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      } else {
        await fetch('/api/nha-cung-cap', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      }
      setDrawerOpen(false);
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const confirmDelete = (s) => {
    setDeletingSupplier(s);
    setDeleteModal(true);
  };

  const handleDelete = async () => {
    if (!deletingSupplier) return;
    try {
      await fetch(`/api/nha-cung-cap/${deletingSupplier.id}`, { method: 'DELETE' });
      setDeleteModal(false);
      setDeletingSupplier(null);
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const filtered = suppliers.filter(s =>
    !searchTerm ||
    (s.name && s.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (s.code && s.code.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (s.contact_person && s.contact_person.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (s.phone && s.phone.includes(searchTerm))
  );

  const cardClass = isLight ? 'glass-card-light' : 'glass-card-dark';

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className={`text-2xl font-extrabold flex items-center gap-2.5 ${isLight ? 'text-slate-900' : 'text-white'}`}>
            <Truck className="w-7 h-7 text-cyan-600" /> Danh Mục Nhà Cung Cấp & Đối Tác
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Quản lý thông tin các nhà cung cấp phần cứng, phần mềm, đơn vị bảo hành và hợp đồng mua sắm
          </p>
        </div>

        <button
          onClick={openAdd}
          className="px-4 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-cyan-600/20 flex items-center gap-2 transition"
        >
          <Plus className="w-4 h-4" /> Thêm Nhà Cung Cấp Mới
        </button>
      </div>



      {/* Main Table Container */}
      <div className={`${cardClass} p-6 rounded-2xl space-y-4`}>
        {/* Search Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-2">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Nhập thông tin tìm kiếm..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full border rounded-xl pl-9 pr-3 py-2 text-xs font-semibold focus:outline-none focus:border-cyan-500 ${
                isLight ? 'bg-slate-50 border-slate-200 text-slate-800' : 'bg-slate-950 border-slate-800 text-slate-200'
              }`}
            />
          </div>
          <p className="text-xs text-slate-400 font-medium">
            Hiển thị <strong>{filtered.length}</strong> / {suppliers.length} nhà cung cấp
          </p>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className={`border-b text-slate-400 font-bold uppercase tracking-wider ${isLight ? 'border-slate-200 bg-slate-50/50' : 'border-slate-800 bg-slate-950/40'}`}>
                <th className="p-3.5 rounded-l-xl">Mã NCC</th>
                <th className="p-3.5">Tên Nhà Cung Cấp</th>
                <th className="p-3.5">Người Liên Hệ</th>
                <th className="p-3.5">Số Điện Thoại</th>
                <th className="p-3.5">Email / Địa Chỉ</th>
                <th className="p-3.5">Ghi Chú</th>
                <th className="p-3.5 text-right rounded-r-xl">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
              {loading ? (
                <tr>
                  <td colSpan="7" className="p-8 text-center text-slate-400 italic">Đang tải danh sách nhà cung cấp...</td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan="7" className="p-8 text-center text-slate-400 italic">Không tìm thấy nhà cung cấp nào phù hợp.</td>
                </tr>
              ) : (
                filtered.map((s) => (
                  <tr key={s.id} className={`transition ${isLight ? 'hover:bg-cyan-50/40' : 'hover:bg-slate-800/40'}`}>
                    <td className="p-3.5 font-mono font-bold text-cyan-600 dark:text-cyan-400">
                      {s.code}
                    </td>
                    <td className={`p-3.5 font-bold ${isLight ? 'text-slate-900' : 'text-slate-100'}`}>
                      {s.name}
                    </td>
                    <td className="p-3.5 text-slate-600 dark:text-slate-300">
                      {s.contact_person ? (
                        <span className="flex items-center gap-1.5 font-semibold">
                          <UserCheck className="w-3.5 h-3.5 text-slate-400" /> {s.contact_person}
                        </span>
                      ) : (
                        <span className="text-slate-400 italic">Chưa cập nhật</span>
                      )}
                    </td>
                    <td className="p-3.5 font-mono font-bold text-emerald-600 dark:text-emerald-400">
                      {s.phone ? (
                        <span className="flex items-center gap-1.5">
                          <Phone className="w-3.5 h-3.5 text-emerald-500" /> {s.phone}
                        </span>
                      ) : (
                        <span className="text-slate-400 italic font-normal font-sans">N/A</span>
                      )}
                    </td>
                    <td className="p-3.5 text-slate-500 dark:text-slate-400 space-y-0.5 max-w-xs">
                      {s.email && (
                        <p className="flex items-center gap-1.5 font-medium text-cyan-600 dark:text-cyan-400 truncate">
                          <Mail className="w-3.5 h-3.5 shrink-0 text-slate-400" /> {s.email}
                        </p>
                      )}
                      {s.address && (
                        <p className="flex items-center gap-1.5 text-[11px] text-slate-400 truncate" title={s.address}>
                          <MapPin className="w-3.5 h-3.5 shrink-0 text-slate-400" /> {s.address}
                        </p>
                      )}
                      {!s.email && !s.address && <span className="text-slate-400 italic">Chưa nhập thông tin liên hệ</span>}
                    </td>
                    <td className="p-3.5 text-slate-400 max-w-xs truncate" title={s.notes}>
                      {s.notes || <span className="italic">Chưa có ghi chú</span>}
                    </td>
                    <td className="p-3.5 text-right space-x-1.5">
                      <button
                        onClick={() => openEdit(s)}
                        className={`p-1.5 rounded-lg border transition ${
                          isLight 
                            ? 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-700' 
                            : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-200'
                        }`}
                        title="Chỉnh sửa thông tin"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => confirmDelete(s)}
                        className="p-1.5 rounded-lg border bg-rose-50 border-rose-200 text-rose-600 hover:bg-rose-600 hover:text-white dark:bg-rose-950/40 dark:border-rose-800 dark:text-rose-400 dark:hover:bg-rose-600 dark:hover:text-white transition"
                        title="Xóa nhà cung cấp"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Slide-Over Drawer for Add / Edit */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity" onClick={() => setDrawerOpen(false)} />
          <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
            <div className={`w-screen max-w-md ${isLight ? 'bg-white text-slate-800' : 'bg-slate-900 text-slate-100'} shadow-2xl border-l ${isLight ? 'border-slate-200' : 'border-slate-800'} flex flex-col`}>
              
              <div className={`p-6 border-b flex items-center justify-between ${isLight ? 'border-slate-200 bg-slate-50' : 'border-slate-800 bg-slate-950/50'}`}>
                <h2 className="font-extrabold text-lg flex items-center gap-2">
                  <Truck className="w-5 h-5 text-cyan-600" />
                  {editingSupplier ? 'Chỉnh Sửa Nhà Cung Cấp' : 'Thêm Nhà Cung Cấp Mới'}
                </h2>
                <button onClick={() => setDrawerOpen(false)} className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="flex-1 p-6 space-y-4 text-xs overflow-y-auto">
                <div className="space-y-1">
                  <label className={`font-bold ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>Mã Nhà Cung Cấp</label>
                  <input
                    type="text"
                    required
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className={`w-full border rounded-xl px-3.5 py-2.5 font-mono font-bold ${
                      isLight ? 'bg-slate-50 border-slate-300 text-cyan-900' : 'bg-slate-950 border-slate-700 text-cyan-400'
                    }`}
                  />
                </div>

                <div className="space-y-1">
                  <label className={`font-bold ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                    Tên Nhà Cung Cấp / Đơn Vị <span className="text-rose-500 font-bold">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Nhập tên nhà cung cấp..."
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className={`w-full border rounded-xl px-3.5 py-2.5 font-bold ${
                      isLight ? 'bg-slate-50 border-slate-300 text-slate-800' : 'bg-slate-950 border-slate-700 text-slate-200'
                    }`}
                  />
                </div>

                <div className="space-y-1">
                  <label className={`font-bold ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>Người Liên Hệ / Đại Diện</label>
                  <input
                    type="text"
                    placeholder="Nhập người liên hệ..."
                    value={contactPerson}
                    onChange={(e) => setContactPerson(e.target.value)}
                    className={`w-full border rounded-xl px-3.5 py-2.5 ${
                      isLight ? 'bg-slate-50 border-slate-300 text-slate-800' : 'bg-slate-950 border-slate-700 text-slate-200'
                    }`}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className={`font-bold ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>Số Điện Thoại</label>
                    <input
                      type="text"
                      placeholder="Nhập số điện thoại..."
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className={`w-full border rounded-xl px-3.5 py-2.5 font-mono ${
                        isLight ? 'bg-slate-50 border-slate-300 text-slate-800' : 'bg-slate-950 border-slate-700 text-slate-200'
                      }`}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className={`font-bold ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>Email Liên Hệ</label>
                    <input
                      type="email"
                      placeholder="Nhập email liên hệ..."
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className={`w-full border rounded-xl px-3.5 py-2.5 ${
                        isLight ? 'bg-slate-50 border-slate-300 text-slate-800' : 'bg-slate-950 border-slate-700 text-slate-200'
                      }`}
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className={`font-bold ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>Địa Chỉ / Trung Tâm Bảo Hành</label>
                  <textarea
                    rows={2}
                    placeholder="Nhập địa chỉ..."
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className={`w-full border rounded-xl px-3.5 py-2.5 ${
                      isLight ? 'bg-slate-50 border-slate-300 text-slate-800' : 'bg-slate-950 border-slate-700 text-slate-200'
                    }`}
                  />
                </div>

                <div className="space-y-1">
                  <label className={`font-bold ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>Ghi Chú Đặc Biệt</label>
                  <textarea
                    rows={3}
                    placeholder="Nhập ghi chú..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className={`w-full border rounded-xl px-3.5 py-2.5 ${
                      isLight ? 'bg-slate-50 border-slate-300 text-slate-800' : 'bg-slate-950 border-slate-700 text-slate-200'
                    }`}
                  />
                </div>

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
                    {editingSupplier ? 'Cập Nhật' : 'Tạo Mới'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModal && deletingSupplier && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity" onClick={() => setDeleteModal(false)} />
          <div className={`relative w-full max-w-sm rounded-2xl p-6 shadow-2xl border ${isLight ? 'bg-white border-slate-200 text-slate-800' : 'bg-slate-900 border-slate-800 text-white'}`}>
            <h3 className="font-extrabold text-base text-rose-600 dark:text-rose-400">Xác Nhận Xóa Nhà Cung Cấp</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
              Bạn có chắc chắn muốn xóa nhà cung cấp <strong className="text-slate-900 dark:text-white font-bold">{deletingSupplier.name}</strong> ({deletingSupplier.code}) không? Thao tác này không thể hoàn tác.
            </p>
            <div className="pt-5 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeleteModal(false)}
                className={`px-4 py-2 rounded-xl text-xs font-bold ${isLight ? 'bg-slate-100 text-slate-700 hover:bg-slate-200' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleDelete}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-lg shadow-rose-600/20"
              >
                Xác Nhận Xóa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
