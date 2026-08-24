import React, { useState, useEffect } from 'react';
import { 
  Briefcase, 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  X, 
  Users
} from 'lucide-react';
import { apiUrl } from '../utils/api';

export default function ChucDanh({ theme }) {
  const [chucDanhList, setChucDanhList] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  // Slide-over Right Drawer states
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const isLight = theme === 'light';

  const fetchData = async () => {
    try {
      const res = await fetch(apiUrl('/api/chuc-danh'));
      if (res.ok) {
        const data = await res.json();
        setChucDanhList(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openAddModal = () => {
    setEditingItem(null);
    setCode(`CD-${Math.floor(100 + Math.random() * 900)}`);
    setName('');
    setDescription('');
    setDrawerOpen(true);
  };

  const openEditModal = (item) => {
    setEditingItem(item);
    setCode(item.code);
    setName(item.name);
    setDescription(item.description || '');
    setDrawerOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = { code, name, description };

    if (editingItem) {
      await fetch(apiUrl(`/api/chuc-danh/${editingItem.id}`), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
    } else {
      await fetch(apiUrl('/api/chuc-danh'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
    }

    setDrawerOpen(false);
    await fetchData();
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa Chức danh / Chức vụ này?')) return;
    await fetch(apiUrl(`/api/chuc-danh/${id}`), { method: 'DELETE' });
    await fetchData();
  };

  const filteredList = chucDanhList.filter(item =>
    !searchTerm ||
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const cardClass = isLight ? 'glass-card-light' : 'glass-card-dark';

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className={`${cardClass} p-6 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4`}>
        <div>
          <h2 className={`text-xl font-bold flex items-center gap-2 ${isLight ? 'text-slate-900' : 'text-white'}`}>
            <Briefcase className="w-6 h-6 text-amber-600" /> Quản Lý Danh Mục Chức Danh / Chức Vụ
          </h2>
          <p className={`text-sm mt-1 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
            Khai báo danh mục chức vụ chuẩn của doanh nghiệp. Dữ liệu từ đây sẽ tự động kết nối sang Hồ sơ nhân viên.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs shadow-lg shadow-amber-600/20 flex items-center gap-2 transition shrink-0"
        >
          <Plus className="w-4 h-4" /> Thêm Chức Danh Mới
        </button>
      </div>

      {/* Action & Filter Bar */}
      <div className={`${cardClass} p-4 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4`}>
        <div className="relative w-full md:w-80">
          <Search className={`w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 ${isLight ? 'text-slate-400' : 'text-slate-400'}`} />
          <input
            type="text"
            placeholder="Nhập mã hoặc tên chức danh để tìm..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`w-full border rounded-xl pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-amber-500 ${
              isLight ? 'bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-400' : 'bg-slate-900 border-slate-700 text-slate-200 placeholder-slate-500'
            }`}
          />
        </div>

        <span className={`text-xs font-bold ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
          Tổng số {filteredList.length} chức danh
        </span>
      </div>

      {/* Job Titles Table */}
      <div className={`${cardClass} rounded-2xl overflow-hidden`}>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className={`text-xs font-bold uppercase border-b ${
              isLight ? 'bg-slate-100/80 text-slate-600 border-slate-200' : 'bg-slate-900/90 text-slate-400 border-slate-800'
            }`}>
              <tr>
                <th className="px-6 py-4">Mã Chức Danh</th>
                <th className="px-6 py-4">Tên Chức Danh / Chức Vụ</th>
                <th className="px-6 py-4">Mô Tả Trách Nhiệm</th>
                <th className="px-6 py-4">Số Nhân Viên Đang Đảm Nhậm</th>
                <th className="px-6 py-4 text-right">Thao Tác</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${isLight ? 'divide-slate-200 text-slate-700' : 'divide-slate-800/80 text-slate-300'}`}>
              {filteredList.map((item) => (
                <tr key={item.id} className={isLight ? 'hover:bg-slate-50 transition' : 'hover:bg-slate-900/50 transition'}>
                  <td className={`px-6 py-4 font-mono font-bold ${isLight ? 'text-amber-700' : 'text-amber-400'}`}>
                    {item.code}
                  </td>
                  <td className="px-6 py-4">
                    <p className={`font-bold text-base ${isLight ? 'text-slate-900' : 'text-white'}`}>{item.name}</p>
                  </td>
                  <td className={`px-6 py-4 text-xs italic ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                    {item.description || 'Chưa nhập mô tả'}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold border inline-flex items-center gap-1.5 ${
                      isLight ? 'bg-amber-50 border-amber-200 text-amber-800' : 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                    }`}>
                      <Users className="w-3.5 h-3.5 text-amber-600" />
                      {item.total_employees || 0} Nhân viên
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => openEditModal(item)}
                        className={`p-2 rounded-lg text-xs font-bold transition ${
                          isLight ? 'bg-slate-100 hover:bg-slate-200 text-amber-700' : 'bg-slate-800 hover:bg-slate-700 text-amber-400'
                        }`}
                        title="Sửa Chức Danh"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className={`p-2 rounded-lg text-xs font-bold transition ${
                          isLight ? 'bg-rose-50 hover:bg-rose-100 text-rose-600' : 'bg-rose-500/10 hover:bg-rose-500/20 text-rose-400'
                        }`}
                        title="Xóa Chức Danh"
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

      {/* RIGHT SLIDE-OVER DRAWER FOR CHỨC DANH */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity" onClick={() => setDrawerOpen(false)}></div>

          <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
            <div className={`w-screen max-w-md ${isLight ? 'bg-white text-slate-800' : 'bg-slate-900 text-slate-100'} shadow-2xl border-l ${isLight ? 'border-slate-200' : 'border-slate-800'} flex flex-col`}>
              
              {/* Drawer Header */}
              <div className={`p-6 border-b flex items-center justify-between ${isLight ? 'border-slate-200 bg-slate-50' : 'border-slate-800 bg-slate-950/50'}`}>
                <h3 className={`font-bold text-lg flex items-center gap-2 ${isLight ? 'text-slate-900' : 'text-white'}`}>
                  <Briefcase className="w-5 h-5 text-amber-600" /> {editingItem ? 'Chỉnh Sửa Chức Danh / Chức Vụ' : 'Thêm Mới Chức Danh / Chức Vụ'}
                </h3>
                <button onClick={() => setDrawerOpen(false)} className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Drawer Content Form */}
              <form onSubmit={handleSubmit} className="flex-1 p-6 space-y-4 text-xs overflow-y-auto">
                <div className="space-y-1">
                  <label className={`font-bold ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                    Mã Chức Danh <span className="text-rose-500 font-extrabold ml-0.5">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Nhập mã chức danh..."
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className={`w-full border rounded-xl px-3.5 py-2.5 font-mono font-bold ${
                      isLight ? 'bg-slate-50 border-slate-300 text-amber-700' : 'bg-slate-950 border-slate-700 text-amber-400'
                    }`}
                  />
                </div>

                <div className="space-y-1">
                  <label className={`font-bold ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                    Tên Chức Danh / Chức Vụ <span className="text-rose-500 font-extrabold ml-0.5">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Nhập tên chức danh hoặc chức vụ..."
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className={`w-full border rounded-xl px-3.5 py-2.5 font-bold ${
                      isLight ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-slate-950 border-slate-700 text-white'
                    }`}
                  />
                </div>

                <div className="space-y-1">
                  <label className={`font-bold ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>Mô Tả Trách Nhiệm Chức Danh</label>
                  <textarea
                    rows={4}
                    placeholder="Nhập thông tin cơ bản về nhiệm vụ trách nhiệm..."
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
                    className="px-6 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold shadow-lg shadow-amber-600/20"
                  >
                    Lưu Chức Danh
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
