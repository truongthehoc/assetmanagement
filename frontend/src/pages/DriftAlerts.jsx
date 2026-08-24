import React, { useState } from 'react';
import { 
  AlertTriangle, 
  CheckCircle2, 
  ShieldAlert, 
  Check, 
  RefreshCw
} from 'lucide-react';

export default function DriftAlerts({ drifts, onResolve, theme }) {
  const [filterResolved, setFilterResolved] = useState(false);
  const isLight = theme === 'light';

  const displayedDrifts = drifts.filter(d => filterResolved ? d.is_resolved === 1 : d.is_resolved === 0);
  const cardClass = isLight ? 'glass-card-light' : 'glass-card-dark';

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className={`${cardClass} p-6 rounded-2xl flex items-center justify-between`}>
        <div>
          <h2 className={`text-xl font-bold flex items-center gap-2 ${isLight ? 'text-slate-900' : 'text-white'}`}>
            <ShieldAlert className="w-6 h-6 text-rose-500" /> Quản Lý Biến Động Cấu Hình (Drift Detection Engine)
          </h2>
          <p className={`text-sm mt-1 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
            Tự động so sánh vi mô cấu hình telemetry Agent gửi lên với Baseline Snapshot gốc đã phê duyệt để phát hiện tháo RAM, ổ cứng hoặc cài đặt phần mềm ngoài danh mục.
          </p>
        </div>

        {/* Toggle Filter Resolved */}
        <div className={`flex items-center gap-2 p-1.5 rounded-xl border ${isLight ? 'bg-slate-100 border-slate-200' : 'bg-slate-900 border-slate-800'}`}>
          <button
            onClick={() => setFilterResolved(false)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              !filterResolved ? 'bg-rose-500 text-white shadow-md' : (isLight ? 'text-slate-600 hover:text-slate-900' : 'text-slate-400 hover:text-white')
            }`}
          >
            Chưa Xử Lý ({drifts.filter(d => d.is_resolved === 0).length})
          </button>
          <button
            onClick={() => setFilterResolved(true)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              filterResolved ? 'bg-emerald-600 text-white' : (isLight ? 'text-slate-600 hover:text-slate-900' : 'text-slate-400 hover:text-white')
            }`}
          >
            Đã Xử Lý ({drifts.filter(d => d.is_resolved === 1).length})
          </button>
        </div>
      </div>

      {/* Drift Alert Cards */}
      {displayedDrifts.length === 0 ? (
        <div className={`${cardClass} p-12 rounded-2xl text-center space-y-3`}>
          <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
          <h3 className={`text-lg font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>Không Có Cảnh Báo Biến Động Nào</h3>
          <p className={`text-sm ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
            {filterResolved ? 'Chưa có lịch sử cảnh báo nào đã được duyệt.' : 'Tất cả các tài sản đều duy trì đúng cấu hình Baseline ban đầu.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {displayedDrifts.map((alert) => (
            <div 
              key={alert.id} 
              className={`${cardClass} p-6 rounded-2xl transition ${
                alert.is_resolved 
                  ? 'opacity-75' 
                  : (isLight ? 'border-rose-300 bg-rose-50/20' : 'border-rose-500/30 bg-slate-900/90')
              }`}
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-mono font-bold ${
                      alert.severity === 'CRITICAL' ? 'bg-rose-500/20 text-rose-600 border border-rose-300' :
                      alert.severity === 'HIGH' ? 'bg-amber-500/20 text-amber-600 border border-amber-300' :
                      'bg-cyan-500/20 text-cyan-600 border border-cyan-300'
                    }`}>
                      {alert.alert_type}
                    </span>
                    <span className="font-mono font-extrabold text-cyan-700">{alert.asset_tag}</span>
                    <span className={`text-xs ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>• Máy trạm: <strong className={isLight ? 'text-slate-900' : 'text-white'}>{alert.hostname}</strong></span>
                    {alert.user_name && <span className={`text-xs ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>• Người dùng: <strong className={isLight ? 'text-slate-800' : 'text-slate-200'}>{alert.user_name}</strong></span>}
                  </div>

                  <h3 className={`text-base font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>{alert.title}</h3>
                  <p className={`text-xs p-3 rounded-xl border ${
                    isLight ? 'bg-slate-100/70 border-slate-200 text-slate-700' : 'bg-slate-950/60 border-slate-800 text-slate-300'
                  }`}>
                    {alert.details}
                  </p>
                </div>

                {/* Resolution Action */}
                {!alert.is_resolved ? (
                  <div className="flex flex-col sm:flex-row items-center gap-2 shrink-0">
                    <button
                      onClick={() => onResolve(alert.id, false)}
                      className={`w-full sm:w-auto px-4 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition ${
                        isLight ? 'bg-slate-200 hover:bg-slate-300 text-slate-800' : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                      }`}
                    >
                      <Check className="w-4 h-4 text-emerald-600" /> Xác Nhận Đã Xử Lý
                    </button>
                    <button
                      onClick={() => onResolve(alert.id, true)}
                      className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow-md flex items-center justify-center gap-2 transition"
                      title="Cập nhật cấu hình hiện tại làm Baseline chuẩn mới"
                    >
                      <RefreshCw className="w-4 h-4" /> Cập Nhật Baseline Mới
                    </button>
                  </div>
                ) : (
                  <div className="text-right text-xs text-slate-500 space-y-1">
                    <span className="inline-flex items-center gap-1 text-emerald-600 font-bold">
                      <CheckCircle2 className="w-4 h-4" /> Đã xử lý
                    </span>
                    <p>Bởi: {alert.resolved_by || 'IT Admin'}</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
