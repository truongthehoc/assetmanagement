import React, { useState, useEffect } from 'react';
import { 
  QrCode, 
  Clock, 
  Camera, 
  X
} from 'lucide-react';
import { Html5QrcodeScanner } from 'html5-qrcode';

export default function MaintenanceAudit({ maintenance, assets, metadata, onCompleteMaintenance, onScanAudit, theme }) {
  const [activeTab, setActiveTab] = useState('maintenance'); // 'maintenance' | 'audit_scan'
  const isLight = theme === 'light';

  // Audit Camera Scanner state
  const [manualQr, setManualQr] = useState('');
  const [scannedLocationId, setScannedLocationId] = useState('');
  const [scannedUserId, setScannedUserId] = useState('');
  const [scanResult, setScanResult] = useState(null);
  const [isScanning, setIsScanning] = useState(false);

  useEffect(() => {
    let scanner = null;
    if (activeTab === 'audit_scan' && isScanning) {
      scanner = new Html5QrcodeScanner("reader", { fps: 10, qrbox: 250 }, false);
      scanner.render((decodedText) => {
        setManualQr(decodedText);
        handleExecuteScan(decodedText);
        scanner.clear();
        setIsScanning(false);
      }, (error) => {
        // scan error
      });
    }

    return () => {
      if (scanner) {
        scanner.clear().catch(() => {});
      }
    };
  }, [activeTab, isScanning]);

  const handleExecuteScan = async (codeToScan) => {
    const qrStr = codeToScan || manualQr;
    if (!qrStr) return;

    const res = await onScanAudit({
      qrCode: qrStr,
      scannedLocationId: scannedLocationId ? parseInt(scannedLocationId, 10) : null,
      scannedUserId: scannedUserId ? parseInt(scannedUserId, 10) : null
    });

    setScanResult(res);
  };

  const cardClass = isLight ? 'glass-card-light' : 'glass-card-dark';

  return (
    <div className="space-y-6">
      {/* Top Selector Bar */}
      <div className={`${cardClass} p-4 rounded-2xl flex items-center justify-between`}>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveTab('maintenance')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeTab === 'maintenance'
                ? 'bg-cyan-600 text-white shadow-md'
                : (isLight ? 'bg-slate-100 text-slate-600 hover:bg-slate-200' : 'bg-slate-900 text-slate-400 border border-slate-800')
            }`}
          >
            <Clock className="w-4 h-4" /> Lịch Bảo Trì Định Kỳ (6 Tháng/Lần)
          </button>
          <button
            onClick={() => setActiveTab('audit_scan')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeTab === 'audit_scan'
                ? 'bg-cyan-600 text-white shadow-md'
                : (isLight ? 'bg-slate-100 text-slate-600 hover:bg-slate-200' : 'bg-slate-900 text-slate-400 border border-slate-800')
            }`}
          >
            <QrCode className="w-4 h-4" /> Kiểm Kê Mã QR / Barcode Live Scanner
          </button>
        </div>
      </div>

      {/* Tab 1: Maintenance Schedule */}
      {activeTab === 'maintenance' && (
        <div className="space-y-4">
          <div className={`${cardClass} rounded-2xl overflow-hidden`}>
            <div className={`p-6 border-b flex items-center justify-between ${isLight ? 'border-slate-200 bg-slate-50/50' : 'border-slate-800'}`}>
              <div>
                <h3 className={`font-bold text-lg ${isLight ? 'text-slate-900' : 'text-white'}`}>Lịch Bảo Trì & Vệ Sinh Máy Định Kỳ</h3>
                <p className={`text-xs mt-1 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>Danh sách máy trạm cần thực hiện bảo dưỡng, tra keo tản nhiệt và nâng cấp bảo mật.</p>
              </div>
            </div>

            <table className="w-full text-left text-sm">
              <thead className={`text-xs font-bold uppercase border-b ${
                isLight ? 'bg-slate-100/80 text-slate-600 border-slate-200' : 'bg-slate-900/90 text-slate-400 border-slate-800'
              }`}>
                <tr>
                  <th className="px-6 py-4">Mã Tài Sản / Tên Máy</th>
                  <th className="px-6 py-4">Nội Dung Bảo Trì</th>
                  <th className="px-6 py-4">Chu Kỳ</th>
                  <th className="px-6 py-4">Hạn Bảo Trì</th>
                  <th className="px-6 py-4">Trạng Thái</th>
                  <th className="px-6 py-4 text-right">Xác Nhận</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${isLight ? 'divide-slate-200 text-slate-700' : 'divide-slate-800/80 text-slate-300'}`}>
                {maintenance.map((task) => (
                  <tr key={task.id} className={isLight ? 'hover:bg-slate-50 transition' : 'hover:bg-slate-900/50 transition'}>
                    <td className={`px-6 py-4 font-mono font-bold ${isLight ? 'text-cyan-700' : 'text-cyan-400'}`}>
                      <div>
                        <span>{task.asset_tag}</span>
                        <p className={`text-xs font-sans ${isLight ? 'text-slate-900' : 'text-white'}`}>{task.hostname}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className={`font-bold ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>{task.task_name}</p>
                      <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>{task.notes || 'Vệ sinh định kỳ & kiểm tra quạt CPU'}</p>
                    </td>
                    <td className={`px-6 py-4 text-xs font-semibold ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>
                      {task.frequency_months} Tháng / Lần
                    </td>
                    <td className="px-6 py-4 text-xs font-mono font-bold text-amber-600">
                      {task.next_due}
                    </td>
                    <td className="px-6 py-4">
                      {task.status === 'OVERDUE' ? (
                        <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold border ${
                          isLight ? 'bg-rose-50 border-rose-200 text-rose-700' : 'bg-rose-500/20 border-rose-500/30 text-rose-400'
                        }`}>
                          Quá Hạn Bảo Trì
                        </span>
                      ) : (
                        <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold border ${
                          isLight ? 'bg-amber-50 border-amber-200 text-amber-700' : 'bg-amber-500/20 border-amber-500/30 text-amber-400'
                        }`}>
                          Sắp Đến Hạn
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {task.status !== 'COMPLETED' && (
                        <button
                          onClick={() => onCompleteMaintenance(task.id, 'Đã vệ sinh hút bụi CPU & cập nhật Windows security')}
                          className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md"
                        >
                          Hoàn Thành
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Inventory Audit Camera & QR Scanner */}
      {activeTab === 'audit_scan' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Scanner Input Panel */}
          <div className={`${cardClass} p-6 rounded-2xl space-y-6`}>
            <h3 className={`font-bold text-lg flex items-center gap-2 ${isLight ? 'text-slate-900' : 'text-white'}`}>
              <Camera className="w-5 h-5 text-cyan-600" /> Quét Mã QR / Barcode Tem Dán Máy
            </h3>

            {/* Camera Live Toggle */}
            <div className="space-y-3">
              <button
                onClick={() => setIsScanning(!isScanning)}
                className={`w-full py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition ${
                  isScanning ? 'bg-rose-600 text-white' : 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-md'
                }`}
              >
                <Camera className="w-4 h-4" /> {isScanning ? 'Tắt Camera Quét Mã' : 'Bật Camera Điện Thoại / Webcam Quét Mã'}
              </button>

              {isScanning && (
                <div id="reader" className={`w-full rounded-2xl overflow-hidden border ${isLight ? 'bg-slate-100 border-slate-300' : 'bg-slate-900 border-slate-800'}`}></div>
              )}
            </div>

            {/* Manual QR Input */}
            <div className={`space-y-4 pt-4 border-t ${isLight ? 'border-slate-200' : 'border-slate-800'}`}>
              <span className={`text-xs font-bold block ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>Hoặc Nhập Mã QR / Mã Tài Sản Thủ Công</span>

              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Ví dụ: AST-IT-001 hoặc AST-HR-002"
                  value={manualQr}
                  onChange={(e) => setManualQr(e.target.value)}
                  className={`flex-1 border rounded-xl px-4 py-2 text-sm font-mono font-bold focus:outline-none focus:border-cyan-500 ${
                    isLight ? 'bg-slate-50 border-slate-300 text-cyan-700' : 'bg-slate-900 border-slate-700 text-cyan-400'
                  }`}
                />
                <button
                  onClick={() => handleExecuteScan(manualQr)}
                  className={`px-5 py-2 rounded-xl text-xs font-bold ${
                    isLight ? 'bg-slate-200 hover:bg-slate-300 text-slate-800' : 'bg-slate-800 hover:bg-slate-700 text-cyan-400'
                  }`}
                >
                  Đối Chiếu
                </button>
              </div>

              {/* Location & User verification selects */}
              <div className="grid grid-cols-2 gap-3 text-xs pt-2">
                <div className="space-y-1">
                  <label className={`font-bold ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>Vị trí kiểm tra thực tế</label>
                  <select
                    value={scannedLocationId}
                    onChange={(e) => setScannedLocationId(e.target.value)}
                    className={`w-full border rounded-xl px-3 py-2 ${
                      isLight ? 'bg-slate-50 border-slate-300 text-slate-800' : 'bg-slate-900 border-slate-700 text-slate-200'
                    }`}
                  >
                    <option value="">-- Mặc định --</option>
                    {metadata.locations.map(l => (
                      <option key={l.id} value={l.id}>{l.building} - {l.room}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className={`font-bold ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>Người dùng thực tế tại chỗ</label>
                  <select
                    value={scannedUserId}
                    onChange={(e) => setScannedUserId(e.target.value)}
                    className={`w-full border rounded-xl px-3 py-2 ${
                      isLight ? 'bg-slate-50 border-slate-300 text-slate-800' : 'bg-slate-900 border-slate-700 text-slate-200'
                    }`}
                  >
                    <option value="">-- Mặc định --</option>
                    {metadata.users.map(u => (
                      <option key={u.id} value={u.id}>{u.full_name}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Audit Verification Result Panel */}
          <div className={`${cardClass} p-6 rounded-2xl space-y-6`}>
            <h3 className={`font-bold text-lg ${isLight ? 'text-slate-900' : 'text-white'}`}>Kết Quả Đối Chiếu Thực Tế vs CSDL</h3>

            {!scanResult ? (
              <div className="p-12 text-center text-slate-400 text-sm space-y-2">
                <QrCode className="w-12 h-12 mx-auto opacity-40" />
                <p>Vui lòng bật camera hoặc nhập mã QR tem tài sản để đối chiếu.</p>
              </div>
            ) : !scanResult.found ? (
              <div className={`p-6 rounded-2xl border space-y-2 ${
                isLight ? 'bg-rose-50 border-rose-200 text-rose-700' : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
              }`}>
                <X className="w-8 h-8 text-rose-500" />
                <h4 className="font-bold text-base">Không Tìm Thấy Tài Sản</h4>
                <p className="text-xs">{scanResult.message}</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className={`p-4 rounded-xl border space-y-2 ${
                  isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-900 border-slate-800'
                }`}>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 text-xs font-mono font-bold">
                    {scanResult.asset.asset_tag}
                  </span>
                  <h4 className={`text-lg font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>{scanResult.asset.hostname}</h4>
                  <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>{scanResult.asset.asset_type} • Serial: {scanResult.asset.serial_number || 'N/A'}</p>
                </div>

                {/* Match verification cards */}
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className={`p-4 rounded-xl border ${
                    scanResult.verification.isLocationMatched 
                      ? (isLight ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400') 
                      : (isLight ? 'bg-rose-50 border-rose-200 text-rose-800' : 'bg-rose-500/10 border-rose-500/30 text-rose-400')
                  }`}>
                    <span className="font-bold block">Vị Trí Cài Đặt</span>
                    <p className="text-sm font-extrabold mt-1">
                      {scanResult.verification.isLocationMatched ? '✓ Trùng Khớp' : '✕ Sai Vị Trí'}
                    </p>
                    <p className={`text-[11px] mt-1 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>Hệ thống: {scanResult.verification.expectedLocation}</p>
                  </div>

                  <div className={`p-4 rounded-xl border ${
                    scanResult.verification.isUserMatched 
                      ? (isLight ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400') 
                      : (isLight ? 'bg-amber-50 border-amber-200 text-amber-800' : 'bg-amber-500/10 border-amber-500/30 text-amber-400')
                  }`}>
                    <span className="font-bold block">Người Sử Dụng</span>
                    <p className="text-sm font-extrabold mt-1">
                      {scanResult.verification.isUserMatched ? '✓ Trùng Khớp' : '⚠ Khác Người Dùng'}
                    </p>
                    <p className={`text-[11px] mt-1 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>Hệ thống: {scanResult.verification.expectedUser}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
