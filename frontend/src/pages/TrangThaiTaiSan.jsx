import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Search, 
  CheckCircle2,
  Clock,
  Wrench,
  Trash2,
  Package,
  Layers,
  Info
} from 'lucide-react';

export default function TrangThaiTaiSan({ theme }) {
  const [statuses, setStatuses] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  const isLight = theme === 'light';

  const fetchData = async () => {
    try {
      const res = await fetch('/api/trang-thai-tai-san');
      const data = await res.json();
      setStatuses(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const getStatusBadge = (code, name) => {
    switch (code) {
      case 'NEW':
        return <span className={`px-3 py-1 rounded-full text-xs font-bold border whitespace-nowrap inline-block ${isLight ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-blue-500/10 border-blue-500/30 text-blue-400'}`}>{name}</span>;
      case 'READY':
        return <span className={`px-3 py-1 rounded-full text-xs font-bold border whitespace-nowrap inline-block ${isLight ? 'bg-cyan-50 border-cyan-200 text-cyan-700' : 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400'}`}>{name}</span>;
      case 'IN_USE':
        return <span className={`px-3 py-1 rounded-full text-xs font-bold border whitespace-nowrap inline-block ${isLight ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'}`}>{name}</span>;
      case 'MAINTENANCE':
        return <span className={`px-3 py-1 rounded-full text-xs font-bold border whitespace-nowrap inline-block ${isLight ? 'bg-purple-50 border-purple-200 text-purple-700' : 'bg-purple-500/10 border-purple-500/30 text-purple-400'}`}>{name}</span>;
      case 'DISPOSING':
        return <span className={`px-3 py-1 rounded-full text-xs font-bold border whitespace-nowrap inline-block ${isLight ? 'bg-orange-50 border-orange-200 text-orange-700' : 'bg-orange-500/10 border-orange-500/30 text-orange-400'}`}>{name}</span>;
      case 'DISPOSED':
        return <span className={`px-3 py-1 rounded-full text-xs font-bold border whitespace-nowrap inline-block ${isLight ? 'bg-slate-100 border-slate-300 text-slate-600' : 'bg-slate-800 border-slate-700 text-slate-400'}`}>{name}</span>;
      default:
        return <span className="px-3 py-1 rounded-full text-xs font-bold border whitespace-nowrap inline-block">{name}</span>;
    }
  };

  const filtered = statuses.filter(s => 
    !searchTerm ||
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const cardClass = isLight ? 'glass-card-light' : 'glass-card-dark';

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className={`${cardClass} p-6 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4`}>
        <div>
          <h2 className={`text-xl font-bold flex items-center gap-2 ${isLight ? 'text-slate-900' : 'text-white'}`}>
            <Layers className="w-6 h-6 text-cyan-600" /> Quản Lý Quy Chuẩn Trạng Thái Tài Sản
          </h2>
          <p className={`text-sm mt-1 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
            Hệ thống 6 trạng thái chuẩn mực định danh vòng đời của tài sản trong doanh nghiệp.
          </p>
        </div>
      </div>

      {/* Grid of Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map(s => (
          <div key={s.id} className={`${cardClass} p-6 rounded-2xl border space-y-4 transition hover:shadow-xl`}>
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-bold text-cyan-600 bg-cyan-50 border border-cyan-200 px-2.5 py-1 rounded-lg">
                {s.code}
              </span>
              {getStatusBadge(s.code, s.name)}
            </div>

            <div>
              <h3 className={`font-extrabold text-lg ${isLight ? 'text-slate-900' : 'text-white'}`}>{s.name}</h3>
              <p className={`text-xs mt-2 leading-relaxed min-h-[40px] ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                {s.description}
              </p>
            </div>

            <div className={`pt-3 border-t flex items-center justify-between text-xs font-bold ${isLight ? 'border-slate-200 text-slate-500' : 'border-slate-800 text-slate-400'}`}>
              <span>Số tài sản hiện tại:</span>
              <span className="text-cyan-600 font-mono text-sm">{s.total_assets || 0} tài sản</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
