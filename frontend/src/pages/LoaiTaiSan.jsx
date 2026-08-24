import React, { useState, useEffect } from 'react';
import { 
  Laptop, 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  X,
  Package,
  Layers
} from 'lucide-react';

export default function LoaiTaiSan({ theme }) {
  const [types, setTypes] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  // Right Slide-Over Sheet Drawer state
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingType, setEditingType] = useState(null);

  // Form states
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const isLight = theme === 'light';

  const fetchData = async () => {
    try {
      const res = await fetch('/api/loai-tai-san');
      const data = await res.json();
      setTypes(Array.isArray(data) ? data : []);
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
    setEditingType(null);
    setCode(`TS-${Math.floor(100 + Math.random() * 900)}`);
    setName('');
    setDescription('');
    setDrawerOpen(true);
  };

  const openEdit = (t) => {
    setEditingType(t);
    setCode(t.code);
    setName(t.name);
    setDescription(t.description || '');
    setDrawerOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = { code, name, description };

    if (editingType) {
      await fetch(`/api/loai-tai-san/${editingType.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
    } else {
      await fetch('/api/loai-tai-san', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
    }

    setDrawerOpen(false);
    await fetchData();
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa loại tài sản này?')) return;
    await fetch(`/api/loai-tai-san/${id}`, { method: 'DELETE' });
    await fetchData();
  };

  const filteredTypes = types.filter(t => 
    !searchTerm ||
    t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const cardClass = isLight ? 'glass-card-light' : 'glass-card-dark';

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className={`${cardClass} p-6 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4`}>
        <div>
          <h2 className={`text-xl font-bold flex items-center gap-2 ${isLight ? 'text-slate-900' : 'text-white'}`}>
            <Package className="w-6 h-6 text-cyan-600" /> Quản Lý Danh Mục Loại Tài Sản
          </h2>
          <p className={`text-sm mt-1 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
            Quy định phân loại chủng loại thiết bị máy móc (Laptop, Máy tính để bàn, Máy in, Scanner, Server, Thiết bị mạng...).
          </p>
        </div>

        <button
          onClick={openAdd}
          className="px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow-lg shadow-cyan-600/20 flex items-center gap-2 transition shrink-0"
        >
          <Plus className="w-4 h-4" /> Thêm Loại Tài Sản Mới
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className={`${cardClass} p-4 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4`}>
        <div className="relative w-full md:w-80">
          <Search className={`w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 ${isLight ? 'text-slate-400' : 'text-slate-400'}`} />
          <input
            type="text"
            placeholder="Nhập mã hoặc tên loại tài sản để tìm..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`w-full border rounded-xl pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-cyan-500 ${
              isLight ? 'bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-400' : 'bg-slate-900 border-slate-700 text-slate-200 placeholder-slate-500'
            }`}
          />
        </div>

        <span className={`text-xs font-bold ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
          Tổng số {filteredTypes.length} loại tài sản
        </span>
      </div>

      {/* Data Table */}
      <div className={`${cardClass} rounded-2xl overflow-hidden`}>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className={`text-xs font-bold uppercase border-b ${
              isLight ? 'bg-slate-100/80 text-slate-600 border-slate-200' : 'bg-slate-900/90 text-slate-400 border-slate-800'
            }`}>
              <tr>
                <th className="px-6 py-4">Mã Loại</th>
                <th className="px-6 py-4">Tên Loại Tài Sản</th>
                <th className="px-6 py-4">Mô Tả Chi Tiết</th>
                <th className="px-6 py-4 text-right">Thao Tác</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${isLight ? 'divide-slate-200 text-slate-700' : 'divide-slate-800/80 text-slate-300'}`}>
              {filteredTypes.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-slate-500">Chưa có loại tài sản nào.</td>
                </tr>
              ) : (
                filteredTypes.map((t) => (
                  <tr key={t.id} className={isLight ? 'hover:bg-slate-50 transition' : 'hover:bg-slate-900/50 transition'}>
                    <td className={`px-6 py-4 font-mono font-bold ${isLight ? 'text-cyan-700' : 'text-cyan-400'}`}>
                      {t.code}
                    </td>
                    <td className="px-6 py-4">
                      <p className={`font-bold text-base flex items-center gap-2 ${isLight ? 'text-slate-900' : 'text-white'}`}>
                        <Laptop className="w-4 h-4 text-cyan-600 shrink-0" />
                        <span>{t.name}</span>
                      </p>
                    </td>
                    <td className={`px-6 py-4 text-xs italic ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                      {t.description || 'Chưa có ghi chú mô tả'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEdit(t)}
                          className={`p-2 rounded-lg text-xs font-bold transition ${
                            isLight ? 'bg-slate-100 hover:bg-slate-200 text-cyan-700' : 'bg-slate-800 hover:bg-slate-700 text-cyan-400'
                          }`}
                          title="Sửa loại tài sản"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(t.id)}
                          className={`p-2 rounded-lg text-xs font-bold transition ${
                            isLight ? 'bg-rose-50 hover:bg-rose-100 text-rose-600' : 'bg-rose-500/10 hover:bg-rose-500/20 text-rose-400'
                          }`}
                          title="Xóa loại tài sản"
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

      {/* RIGHT SLIDE-OVER DRAWER FOR ADD/EDIT LOẠI TÀI SẢN */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity" onClick={() => setDrawerOpen(false)}></div>

          <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
            <div className={`w-screen max-w-lg ${isLight ? 'bg-white text-slate-800' : 'bg-slate-900 text-slate-100'} shadow-2xl border-l ${isLight ? 'border-slate-200' : 'border-slate-800'} flex flex-col`}>
              
              {/* Drawer Header */}
              <div className={`p-6 border-b flex items-center justify-between ${isLight ? 'border-slate-200 bg-slate-50' : 'border-slate-800 bg-slate-950/50'}`}>
                <h3 className={`font-bold text-lg flex items-center gap-2 ${isLight ? 'text-slate-900' : 'text-white'}`}>
                  <Package className="w-5 h-5 text-cyan-600" /> {editingType ? 'Chỉnh Sửa Loại Tài Sản' : 'Thêm Mới Loại Tài Sản'}
                </h3>
                <button onClick={() => setDrawerOpen(false)} className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Drawer Content Form */}
              <form onSubmit={handleSubmit} className="flex-1 p-6 space-y-4 text-xs overflow-y-auto">
                <div className="space-y-1">
                  <label className={`font-bold ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                    Mã Loại <span className="text-rose-500 font-extrabold ml-0.5">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Nhập mã loại tài sản..."
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className={`w-full border rounded-xl px-3.5 py-2.5 font-mono font-bold ${
                      isLight ? 'bg-slate-50 border-slate-300 text-cyan-700' : 'bg-slate-950 border-slate-700 text-cyan-400'
                    }`}
                  />
                </div>

                <div className="space-y-1">
                  <label className={`font-bold ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                    Tên Loại Tài Sản <span className="text-rose-500 font-extrabold ml-0.5">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Nhập tên loại tài sản..."
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className={`w-full border rounded-xl px-3.5 py-2.5 font-bold ${
                      isLight ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-slate-950 border-slate-700 text-white'
                    }`}
                  />
                </div>

                <div className="space-y-1">
                  <label className={`font-bold ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>Mô Tả Chi Tiết</label>
                  <textarea
                    rows={4}
                    placeholder="Nhập ghi chú mô tả loại tài sản..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className={`w-full border rounded-xl px-3.5 py-2.5 ${
                      isLight ? 'bg-slate-50 border-slate-300 text-slate-800' : 'bg-slate-950 border-slate-700 text-slate-200'
                    }`}
                  />
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
                    Lưu Loại Tài Sản
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
