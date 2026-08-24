import React, { useState, useRef } from 'react';
import { 
  Radio, 
  CheckCircle2, 
  Tag, 
  PackageCheck,
  RefreshCw,
  List,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  DollarSign,
  X,
  Wifi,
  Printer,
  Search,
  Network,
  Cpu,
  Server,
  ShieldAlert,
  Globe,
  Sliders,
  Play,
  Bot,
  Plus,
  Trash2,
  ChevronLeft,
  ChevronsLeft,
  ChevronsRight,
  Download,
  Upload,
  FileText,
  Calendar
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { apiUrl } from '../utils/api';

// Custom DatePicker Component displaying strictly dd/mm/yyyy format in the input field
function DatePickerVN({ value, onChange, isLight }) {
  const formatDateVN = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const displayVal = formatDateVN(value);
  const dateInputRef = useRef(null);

  return (
    <div className="relative flex items-center">
      <input
        type="text"
        readOnly
        placeholder="dd/mm/yyyy"
        value={displayVal}
        onClick={() => dateInputRef.current && dateInputRef.current.showPicker && dateInputRef.current.showPicker()}
        className={`w-full border rounded-xl pl-3.5 pr-10 py-2 text-xs font-bold cursor-pointer ${
          isLight ? 'bg-white border-slate-300 text-slate-800 hover:border-cyan-500' : 'bg-slate-900 border-slate-700 text-slate-200 hover:border-cyan-500'
        }`}
      />
      <input
        ref={dateInputRef}
        type="date"
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        className="absolute right-2 opacity-0 w-8 h-8 cursor-pointer"
      />
      <Calendar 
        onClick={() => dateInputRef.current && dateInputRef.current.showPicker && dateInputRef.current.showPicker()}
        className="w-4 h-4 absolute right-3 cursor-pointer text-cyan-600 hover:text-cyan-500 pointer-events-none" 
      />
    </div>
  );
}

export default function DiscoveryQueue({ pending, metadata, onApprove, onReject, onTriggerScan, theme }) {
  const [selectedDev, setSelectedDev] = useState(null);
  const [scanning, setScanning] = useState(false);
  const isLight = theme === 'light';

  // Network Subnet Scanner States
  const [netScanModal, setNetScanModal] = useState(false);
  const [subnets, setSubnets] = useState([]);
  const [startIp, setStartIp] = useState('10.30.22.1');
  const [endIp, setEndIp] = useState('10.30.22.254');
  const [selectedPorts, setSelectedPorts] = useState([9100, 515, 631, 80, 443, 22, 23, 554]);
  const [netScanning, setNetScanning] = useState(false);
  const [netScanResult, setNetScanResult] = useState(null);
  const [netScanError, setNetScanError] = useState(null);

  // Pagination, Search, Tabs & Clearing state
  const [activeTab, setActiveTab] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [deletingId, setDeletingId] = useState(null);
  const [clearingAll, setClearingAll] = useState(false);

  // Helper to check device type (Network IP scan vs Agent telemetry)
  const isNetworkDevice = (dev) => {
    const hw = typeof dev.hardware_json === 'string' ? JSON.parse(dev.hardware_json || '{}') : (dev.hardware_json || {});
    return (dev.agent_id && dev.agent_id.startsWith('NETSCAN-')) || Boolean(hw.deviceType);
  };

  const networkPendingCount = pending.filter(dev => isNetworkDevice(dev)).length;
  const agentPendingCount = pending.filter(dev => !isNetworkDevice(dev)).length;

  const filteredPending = pending.filter(dev => {
    // 1. Filter by Discovery Category Tab
    const isNet = isNetworkDevice(dev);
    if (activeTab === 'NETWORK' && !isNet) return false;
    if (activeTab === 'AGENT' && isNet) return false;

    // 2. Filter by Search term
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase().trim();
    const matchName = dev.hostname && dev.hostname.toLowerCase().includes(term);
    const matchIp = dev.ip_address && dev.ip_address.toLowerCase().includes(term);
    const matchOs = dev.os_name && dev.os_name.toLowerCase().includes(term);
    const matchMac = dev.mac_address && dev.mac_address.toLowerCase().includes(term);
    const matchSerial = dev.serial_number && dev.serial_number.toLowerCase().includes(term);
    return matchName || matchIp || matchOs || matchMac || matchSerial;
  });

  const totalPages = Math.ceil(filteredPending.length / itemsPerPage) || 1;
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = (safeCurrentPage - 1) * itemsPerPage;
  const paginatedPending = filteredPending.slice(startIndex, startIndex + itemsPerPage);

  const handleDeleteSingle = async (devId, e) => {
    if (e) e.stopPropagation();
    if (!window.confirm('Bạn có chắc chắn muốn xóa thiết bị này khỏi danh sách chờ quét?')) return;

    setDeletingId(devId);
    try {
      const res = await fetch(apiUrl(`/api/discovery/${devId}`), { method: 'DELETE' });
      if (res.ok) {
        if (onTriggerScan) await onTriggerScan();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setDeletingId(null);
    }
  };

  const handleClearAllPending = async () => {
    if (!window.confirm(`⚠️ Bạn có chắc chắn muốn XÓA TOÀN BỘ ${pending.length} thiết bị trong danh sách chờ để làm sạch và quét lại từ đầu không?`)) return;

    setClearingAll(true);
    try {
      const res = await fetch(apiUrl('/api/discovery/clear-all'), { method: 'DELETE' });
      if (res.ok) {
        setCurrentPage(1);
        if (onTriggerScan) await onTriggerScan();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setClearingAll(false);
    }
  };

  const openNetScanModal = async () => {
    setNetScanModal(true);
    setNetScanResult(null);
    setNetScanError(null);
    try {
      const res = await fetch(apiUrl('/api/discovery/subnets'));
      if (res.ok) {
        const data = await res.json();
        setSubnets(data);
        if (data.length > 0) {
          const preferred = data.find(s => s.ip && !s.name.toLowerCase().includes('tailscale') && !s.name.toLowerCase().includes('vethernet')) || data[0];
          setStartIp(preferred.startIp);
          setEndIp(preferred.endIp);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleExecuteNetScan = async () => {
    setNetScanning(true);
    setNetScanResult(null);
    setNetScanError(null);
    try {
      const res = await fetch(apiUrl('/api/discovery/scan-network'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          startIp,
          endIp,
          ports: selectedPorts,
          autoSave: true
        })
      });
      const data = await res.json();
      if (res.ok) {
        setNetScanResult(data);
        if (onTriggerScan) {
          await onTriggerScan();
        }
      } else {
        setNetScanError(data.error || 'Có lỗi xảy ra khi quét dải mạng.');
      }
    } catch (err) {
      console.error(err);
      setNetScanError('Không thể kết nối máy chủ.');
    } finally {
      setNetScanning(false);
    }
  };

  const togglePort = (portNum) => {
    if (selectedPorts.includes(portNum)) {
      setSelectedPorts(selectedPorts.filter(p => p !== portNum));
    } else {
      setSelectedPorts([...selectedPorts, portNum]);
    }
  };

  // Form State for Asset Onboarding
  const [customHostname, setCustomHostname] = useState('');
  const [assetTag, setAssetTag] = useState('');
  const [assetType, setAssetType] = useState('Desktop');
  const [departmentId, setDepartmentId] = useState('');
  const [locationId, setLocationId] = useState('');
  const [userId, setUserId] = useState('');

  // Optional Procurement & Financial fields
  const [showProcurement, setShowProcurement] = useState(false);
  const [purchaseDate, setPurchaseDate] = useState('');
  const [purchaseCost, setPurchaseCost] = useState('');
  const [depreciationMonths, setDepreciationMonths] = useState('36');
  const [vendorSupplier, setVendorSupplier] = useState('');
  const [warrantyExpirationDate, setWarrantyExpirationDate] = useState('');
  const [poFiles, setPoFiles] = useState([]);

  const openOnboardDrawer = (dev) => {
    setSelectedDev(dev);
    setCustomHostname(dev.hostname || '');
    const hw = typeof dev.hardware_json === 'string' ? JSON.parse(dev.hardware_json || '{}') : (dev.hardware_json || {});
    
    let defaultType = 'Desktop';
    let tagPrefix = 'AST-DESK';

    if (hw.deviceType) {
      defaultType = hw.deviceType;
      if (hw.deviceType.includes('Máy in')) tagPrefix = 'AST-PRINT';
      else if (hw.deviceType.includes('mạng')) tagPrefix = 'AST-NET';
      else if (hw.deviceType.includes('Camera')) tagPrefix = 'AST-CAM';
      else tagPrefix = 'AST-DEV';
    } else if (dev.hostname.includes('LAP')) {
      defaultType = 'Laptop';
      tagPrefix = 'AST-LAP';
    }

    const randNum = Math.floor(100 + Math.random() * 900);
    setAssetTag(`${tagPrefix}-${randNum}`);
    setAssetType(defaultType);

    // Make department, location, user optional by default (empty string)
    setDepartmentId('');
    setLocationId('');
    setUserId('');

    // Reset optional procurement fields
    setPurchaseDate(new Date().toISOString().split('T')[0]);
    setPurchaseCost('');
    setDepreciationMonths('36');
    setVendorSupplier(metadata.suppliers && metadata.suppliers.length > 0 ? metadata.suppliers[0].name : '');
    setWarrantyExpirationDate('');
    setPoFiles([]);
    setShowProcurement(false);
  };

  // Helper to format currency input with thousand separators (e.g. 105.000.000)
  const formatCurrencyInput = (val) => {
    if (!val) return '';
    const cleanNumber = val.toString().replace(/\D/g, '');
    return cleanNumber ? parseInt(cleanNumber, 10).toLocaleString('vi-VN') : '';
  };

  const handleCostChange = (e) => {
    const formatted = formatCurrencyInput(e.target.value);
    setPurchaseCost(formatted);
  };

  const handleApproveSubmit = (e) => {
    e.preventDefault();
    if (!selectedDev || !assetTag) return;

    const rawCost = purchaseCost ? parseFloat(purchaseCost.toString().replace(/\D/g, '')) : null;

    onApprove({
      pendingId: selectedDev.id,
      assetTag,
      hostname: customHostname || selectedDev.hostname,
      assetType,
      departmentId: departmentId ? parseInt(departmentId, 10) : null,
      locationId: locationId ? parseInt(locationId, 10) : null,
      userId: userId ? parseInt(userId, 10) : null,
      purchaseDate: purchaseDate || null,
      purchaseCost: rawCost,
      depreciationMonths: depreciationMonths ? parseInt(depreciationMonths, 10) : 36,
      vendorSupplier: vendorSupplier || null,
      warrantyExpirationDate: warrantyExpirationDate || null,
      poDocumentUrl: poFiles.length > 0 ? poFiles.map(f => f.name).join(', ') : null
    });

    setSelectedDev(null);
  };

  // Helper for Multiple PO Document File Upload
  const handlePoFileUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    const newFiles = files.map(file => ({
      name: file.name,
      size: (file.size / 1024).toFixed(1) + ' KB',
      url: file.name
    }));

    setPoFiles(prev => [...prev, ...newFiles]);
    e.target.value = '';
  };

  const handleRemovePoFile = (indexToRemove) => {
    setPoFiles(prev => prev.filter((_, idx) => idx !== indexToRemove));
  };

  // Helper to Print QR Code
  const handlePrintQrCode = () => {
    const svgContent = document.getElementById('qr-code-svg-onboard')?.outerHTML || '';
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>In Tem Tài Sản - ${assetTag}</title>
          <style>
            body { font-family: system-ui, -apple-system, sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; margin: 0; background: #fff; }
            .badge { border: 2px solid #0f172a; padding: 20px; border-radius: 16px; text-align: center; width: 220px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
            .tag { font-size: 18px; font-weight: 800; margin-top: 10px; font-family: monospace; letter-spacing: 0.5px; color: #0284c7; }
            .type { font-size: 12px; color: #475569; margin-top: 4px; font-weight: 600; }
            .system { font-size: 10px; color: #94a3b8; margin-top: 8px; text-transform: uppercase; letter-spacing: 1px; }
          </style>
        </head>
        <body>
          <div class="badge">
            ${svgContent}
            <div class="tag">${assetTag}</div>
            <div class="type">${assetType}</div>
            <div class="system">IT Asset Guard System</div>
          </div>
          <script>
            window.onload = function() { window.print(); window.close(); }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  // Helper to Download QR Code as PNG
  const handleDownloadQrCode = () => {
    const svgElement = document.getElementById('qr-code-svg-onboard');
    if (!svgElement) return;

    const svgData = new XMLSerializer().serializeToString(svgElement);
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const URL = window.URL || window.webkitURL || window;
    const blobURL = URL.createObjectURL(svgBlob);

    const image = new Image();
    image.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 400;
      canvas.height = 400;
      const context = canvas.getContext('2d');
      context.fillStyle = '#FFFFFF';
      context.fillRect(0, 0, 400, 400);

      // Draw QR Code centered
      context.drawImage(image, 50, 40, 300, 300);

      // Draw Asset Tag text below
      context.font = 'bold 22px monospace';
      context.fillStyle = '#0284c7';
      context.textAlign = 'center';
      context.fillText(assetTag || 'TEM-TAI-SAN', 200, 370);

      const png = canvas.toDataURL('image/png');
      const downloadLink = document.createElement('a');
      downloadLink.href = png;
      downloadLink.download = `QR_Code_${assetTag || 'AST'}.png`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    };
    image.src = blobURL;
  };

  const handleTriggerRealScan = async () => {
    setScanning(true);
    if (onTriggerScan) {
      await onTriggerScan();
    }
    setScanning(false);
  };

  const cardClass = isLight ? 'glass-card-light' : 'glass-card-dark';

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className={`${cardClass} p-6 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4`}>
        <div>
          <h2 className={`text-xl font-bold flex items-center gap-2 ${isLight ? 'text-slate-900' : 'text-white'}`}>
            <Radio className="w-6 h-6 text-amber-500 animate-pulse" /> 
            Thiết Bị Chờ Duyệt / Định Danh
          </h2>
          <p className={`text-sm mt-1 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
            Máy trạm tự động quét và gửi telemetry về Server. IT Admin thực hiện gán mã tài sản, bộ phận và người dùng để phê duyệt đưa vào CSDL chính thức.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <button
            onClick={handleTriggerRealScan}
            disabled={scanning}
            className="px-5 py-2.5 min-w-[170px] rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 transition"
          >
            <RefreshCw className={`w-4 h-4 ${scanning ? 'animate-spin' : ''}`} /> 
            {scanning ? 'Đang quét máy trạm...' : 'Quét Máy Trạm'}
          </button>
          <button
            onClick={openNetScanModal}
            className="px-5 py-2.5 min-w-[170px] rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow-lg shadow-cyan-600/20 flex items-center justify-center gap-2 transition"
          >
            <Wifi className="w-4 h-4" /> 
            Quét Thiết Bị Mạng
          </button>
          <div className={`px-4 py-2.5 rounded-xl border text-xs font-bold ${
            isLight ? 'bg-amber-50 border-amber-200 text-amber-700' : 'bg-amber-500/10 border-amber-500/30 text-amber-400'
          }`}>
            {pending.length} Chờ duyệt
          </div>
        </div>
      </div>

      {/* Pending Table / List View */}
      {pending.length === 0 ? (
        <div className={`${cardClass} p-12 rounded-2xl text-center space-y-4`}>
          <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
          <h3 className={`text-lg font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>Không Có Thiết Bị Chờ Duyệt</h3>
          <p className={`text-sm max-w-md mx-auto ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
            Hệ thống đã sẵn sàng. Bấm nút bên dưới để khởi chạy Agent quét thông số phần cứng thật của máy trạm bạn!
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={handleTriggerRealScan}
              disabled={scanning}
              className="px-6 py-3 min-w-[190px] rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 inline-flex items-center justify-center gap-2 transition"
            >
              <RefreshCw className={`w-4 h-4 ${scanning ? 'animate-spin' : ''}`} /> 
              {scanning ? 'Đang quét máy trạm...' : 'Quét Máy Trạm'}
            </button>
            <button
              onClick={openNetScanModal}
              className="px-6 py-3 min-w-[190px] rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow-lg shadow-cyan-600/20 inline-flex items-center justify-center gap-2 transition"
            >
              <Wifi className="w-4 h-4" /> 
              Quét Thiết Bị Mạng
            </button>
          </div>
        </div>
      ) : (
        <div className={`${cardClass} rounded-2xl overflow-hidden`}>
          <div className={`p-4 border-b flex flex-col md:flex-row md:items-center justify-between gap-3 ${isLight ? 'border-slate-200 bg-slate-50/50' : 'border-slate-800'}`}>
            <div className="flex items-center gap-3">
              <h3 className={`font-bold text-sm flex items-center gap-2 ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>
                <List className="w-4 h-4 text-cyan-600" /> Danh Sách Thiết Bị Chờ Duyệt (Discovery Queue)
              </h3>
              <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold border ${
                isLight ? 'bg-cyan-50 border-cyan-200 text-cyan-700' : 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400'
              }`}>
                {searchTerm ? `Tìm thấy: ${filteredPending.length}/${pending.length}` : `Tổng: ${pending.length} thiết bị`}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {/* Search Filter by Name, IP */}
              <div className="relative w-full md:w-72">
                <Search className={`w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 ${isLight ? 'text-slate-400' : 'text-slate-400'}`} />
                <input
                  type="text"
                  placeholder="Lọc theo Tên máy, Địa chỉ IP..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  className={`w-full border rounded-xl pl-9 pr-8 py-1.5 text-xs font-bold transition focus:outline-none focus:border-cyan-500 ${
                    isLight ? 'bg-white border-slate-200 text-slate-800 placeholder-slate-400' : 'bg-slate-900 border-slate-700 text-slate-200 placeholder-slate-500'
                  }`}
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <button
                onClick={handleClearAllPending}
                disabled={clearingAll || pending.length === 0}
                className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition flex items-center gap-1.5 shadow-sm ${
                  isLight 
                    ? 'bg-rose-50 border-rose-200 text-rose-700 hover:bg-rose-600 hover:text-white' 
                    : 'bg-rose-500/10 border-rose-500/30 text-rose-400 hover:bg-rose-500 hover:text-slate-950'
                }`}
                title="Xóa sạch danh sách thiết bị vừa quét để quét lại từ đầu"
              >
                <Trash2 className="w-3.5 h-3.5" />
                {clearingAll ? 'Đang xóa...' : 'Xóa Danh Sách Vừa Quét'}
              </button>
            </div>
          </div>
          <div className={`flex items-center gap-2 border-b px-4 overflow-x-auto ${isLight ? 'border-slate-200 bg-slate-50/50' : 'border-slate-800 bg-slate-950/40'}`}>
            {/* TAB 1: MATCHES CYAN NETWORK SCAN BUTTON */}
            <button
              onClick={() => {
                setActiveTab('NETWORK');
                setCurrentPage(1);
              }}
              className={`px-4 py-3 font-bold text-xs flex items-center gap-2 border-b-2 transition whitespace-nowrap ${
                activeTab === 'NETWORK'
                  ? 'border-cyan-600 text-cyan-600 dark:text-cyan-400'
                  : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              <Wifi className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
              Quét Thiết Bị Mạng (Máy in, Switch, Scanner...)
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                activeTab === 'NETWORK' 
                  ? 'bg-cyan-100 text-cyan-800 dark:bg-cyan-950/80 dark:text-cyan-300' 
                  : (isLight ? 'bg-slate-200/80 text-slate-700' : 'bg-slate-800 text-slate-400')
              }`}>
                {networkPendingCount}
              </span>
            </button>

            {/* TAB 2: MATCHES AMBER/ORANGE REAL AGENT TELEMETRY BUTTON */}
            <button
              onClick={() => {
                setActiveTab('AGENT');
                setCurrentPage(1);
              }}
              className={`px-4 py-3 font-bold text-xs flex items-center gap-2 border-b-2 transition whitespace-nowrap ${
                activeTab === 'AGENT'
                  ? 'border-amber-500 text-amber-600 dark:text-amber-400'
                  : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              <RefreshCw className="w-4 h-4 text-amber-500 dark:text-amber-400" />
              Máy Trạm (Agent Tự Động Gửi Telemetry)
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                activeTab === 'AGENT' 
                  ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300' 
                  : (isLight ? 'bg-slate-200/80 text-slate-700' : 'bg-slate-800 text-slate-400')
              }`}>
                {agentPendingCount}
              </span>
            </button>

            {/* TAB 3: ALL */}
            <button
              onClick={() => {
                setActiveTab('ALL');
                setCurrentPage(1);
              }}
              className={`px-4 py-3 font-bold text-xs flex items-center gap-2 border-b-2 transition whitespace-nowrap ${
                activeTab === 'ALL'
                  ? 'border-slate-700 text-slate-900 dark:border-slate-300 dark:text-white'
                  : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              <List className="w-4 h-4 text-slate-400" />
              Tất Cả ({pending.length})
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className={`text-xs font-bold uppercase border-b ${
                isLight ? 'bg-slate-100/80 text-slate-600 border-slate-200' : 'bg-slate-900/90 text-slate-400 border-slate-800'
              }`}>
                <tr>
                  <th className="px-6 py-4 whitespace-nowrap">Tên Máy / Domain</th>
                  <th className="px-6 py-4 whitespace-nowrap">Địa Chỉ IP</th>
                  <th className="px-6 py-4 whitespace-nowrap">Hệ Điều Hành</th>
                  <th className="px-6 py-4 whitespace-nowrap">Bo Mạch Chủ & CPU</th>
                  <th className="px-6 py-4 whitespace-nowrap">Dung Lượng RAM & Chi Tiết Khe</th>
                  <th className="px-6 py-4 whitespace-nowrap">Ổ Cứng</th>
                  <th className="px-6 py-4 whitespace-nowrap">Serial / MAC</th>
                  <th className="px-6 py-4 text-right whitespace-nowrap">Định Danh Tài Sản</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${isLight ? 'divide-slate-200 text-slate-700' : 'divide-slate-800/80 text-slate-300'}`}>
                {paginatedPending.map((dev) => {
                  const hw = typeof dev.hardware_json === 'string' ? JSON.parse(dev.hardware_json || '{}') : (dev.hardware_json || {});
                  const isNetworkDev = (dev.agent_id && dev.agent_id.startsWith('NETSCAN-')) || hw.deviceType;

                  return (
                    <tr key={dev.id} className={isLight ? 'hover:bg-slate-50 transition' : 'hover:bg-slate-900/50 transition'}>
                      {/* Hostname & Domain */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping shrink-0"></span>
                          <div>
                            <p className={`font-extrabold text-base ${isLight ? 'text-slate-900' : 'text-white'}`}>{dev.hostname}</p>
                            <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>{dev.domain_workgroup || 'WORKGROUP'}</p>
                          </div>
                        </div>
                      </td>

                      {/* Dedicated IP Column */}
                      <td className="px-6 py-4 font-mono font-bold whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs ${
                          isLight ? 'bg-cyan-50 border-cyan-200 text-cyan-800' : 'bg-cyan-950/60 border-cyan-800 text-cyan-300'
                        }`}>
                          <Wifi className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                          {dev.ip_address || 'Chưa kết nối IP'}
                        </span>
                      </td>

                      {/* OS Name */}
                      <td className={`px-6 py-4 text-xs font-semibold ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                        {dev.os_name}
                      </td>

                      {/* Mainboard & CPU */}
                      <td className="px-6 py-4">
                        {isNetworkDev ? (
                          <>
                            <p className={`font-bold text-xs ${isLight ? 'text-cyan-700' : 'text-cyan-400'}`}>{hw.vendorInfo || 'Thiết bị cắm mạng'}</p>
                            <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>Ports: {hw.openPorts ? hw.openPorts.join(', ') : 'TCP'}</p>
                          </>
                        ) : (
                          <>
                            <p className={`font-bold text-xs ${isLight ? 'text-cyan-700' : 'text-cyan-400'}`}>{hw.mainboard?.model || 'Bo mạch chủ chưa rõ'}</p>
                            <p className={`text-xs truncate max-w-xs ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>{hw.cpu?.name || 'CPU chưa rõ'}</p>
                          </>
                        )}
                      </td>

                      {/* RAM Slots */}
                      <td className="px-6 py-4">
                        {isNetworkDev ? (
                          <p className={`text-xs italic ${isLight ? 'text-slate-400' : 'text-slate-500'}`}>N/A (Cắm mạng IP)</p>
                        ) : (
                          <>
                            <p className={`font-extrabold text-xs ${isLight ? 'text-emerald-700' : 'text-emerald-400'}`}>{hw.ram?.totalGb ? `${hw.ram.totalGb} GB Total RAM` : 'N/A'}</p>
                            <p className={`text-[11px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                              {hw.ram?.slots ? `${hw.ram.slots.length} Khe RAM (${hw.ram.slots[0]?.manufacturer || ''} ${hw.ram.slots[0]?.bus || ''})` : 'N/A'}
                            </p>
                          </>
                        )}
                      </td>

                      {/* Disks */}
                      <td className="px-6 py-4 text-xs">
                        {isNetworkDev ? (
                          <span className={`italic ${isLight ? 'text-slate-400' : 'text-slate-500'}`}>Không áp dụng</span>
                        ) : hw.disks && hw.disks.length > 0 ? (
                          hw.disks.map((d, i) => (
                            <div key={i} className={isLight ? 'text-slate-700' : 'text-slate-200'}>
                              • <strong className={isLight ? 'text-slate-900' : 'text-slate-100'}>{d.model}</strong> ({d.sizeGb}GB)
                            </div>
                          ))
                        ) : (
                          <span className={isLight ? 'text-slate-500' : 'text-slate-400'}>Chưa có ổ cứng</span>
                        )}
                      </td>

                      {/* Serial & MAC */}
                      <td className="px-6 py-4 text-xs font-mono">
                        <p className={`font-bold ${isLight ? 'text-amber-700' : 'text-amber-400'}`}>Tag/Serial: {dev.serial_number || 'N/A'}</p>
                        <p className={isLight ? 'text-slate-500' : 'text-slate-400'}>MAC: {dev.mac_address}</p>
                      </td>

                      {/* Action Buttons: Delete & Onboard */}
                      <td className="px-6 py-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={(e) => handleDeleteSingle(dev.id, e)}
                            disabled={deletingId === dev.id}
                            className={`p-2.5 rounded-xl border transition shadow-sm ${
                              isLight 
                                ? 'bg-rose-50 border-rose-200 text-rose-600 hover:bg-rose-600 hover:text-white' 
                                : 'bg-rose-500/10 border-rose-500/30 text-rose-400 hover:bg-rose-500 hover:text-slate-950'
                            }`}
                            title="Xóa thiết bị này khỏi danh sách chờ"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => openOnboardDrawer(dev)}
                            className="px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow-md shadow-cyan-600/20 inline-flex items-center gap-1 transition"
                          >
                            <PackageCheck className="w-4 h-4" /> Định Danh <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {filteredPending.length > 0 && (
            <div className={`p-4 border-t flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-medium ${
              isLight ? 'border-slate-200 bg-slate-50/50 text-slate-600' : 'border-slate-800 bg-slate-950/40 text-slate-400'
            }`}>
              <div className="flex items-center gap-2">
                <span>Hiển thị</span>
                <select
                  value={itemsPerPage}
                  onChange={(e) => {
                    setItemsPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className={`px-2 py-1 border rounded-lg font-bold focus:outline-none focus:border-cyan-500 ${
                    isLight ? 'bg-white border-slate-300 text-slate-800' : 'bg-slate-900 border-slate-700 text-slate-200'
                  }`}
                >
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
                <span>dòng / trang</span>
                <span className="opacity-75 font-mono ml-2">
                  ({startIndex + 1} - {Math.min(startIndex + itemsPerPage, filteredPending.length)} trong {filteredPending.length})
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setCurrentPage(1)}
                  disabled={safeCurrentPage === 1}
                  className={`p-1.5 rounded-lg border transition disabled:opacity-30 disabled:cursor-not-allowed ${
                    isLight ? 'bg-white border-slate-200 hover:bg-slate-100' : 'bg-slate-800 border-slate-700 hover:bg-slate-700'
                  }`}
                  title="Trang Đầu"
                >
                  <ChevronsLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={safeCurrentPage === 1}
                  className={`p-1.5 rounded-lg border transition disabled:opacity-30 disabled:cursor-not-allowed ${
                    isLight ? 'bg-white border-slate-200 hover:bg-slate-100' : 'bg-slate-800 border-slate-700 hover:bg-slate-700'
                  }`}
                  title="Trang Trước"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                <div className="flex items-center gap-1 px-2">
                  <span className="font-bold text-cyan-600">{safeCurrentPage}</span>
                  <span>/</span>
                  <span>{totalPages}</span>
                </div>

                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={safeCurrentPage === totalPages}
                  className={`p-1.5 rounded-lg border transition disabled:opacity-30 disabled:cursor-not-allowed ${
                    isLight ? 'bg-white border-slate-200 hover:bg-slate-100' : 'bg-slate-800 border-slate-700 hover:bg-slate-700'
                  }`}
                  title="Trang Sau"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setCurrentPage(totalPages)}
                  disabled={safeCurrentPage === totalPages}
                  className={`p-1.5 rounded-lg border transition disabled:opacity-30 disabled:cursor-not-allowed ${
                    isLight ? 'bg-white border-slate-200 hover:bg-slate-100' : 'bg-slate-800 border-slate-700 hover:bg-slate-700'
                  }`}
                  title="Trang Cuối"
                >
                  <ChevronsRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* RIGHT SLIDE-OVER DRAWER FOR ASSET ONBOARDING */}
      {selectedDev && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity" onClick={() => setSelectedDev(null)}></div>

          <div className="fixed inset-y-0 right-0 max-w-full flex pl-6 sm:pl-10">
            <div className={`w-screen max-w-4xl ${isLight ? 'bg-white text-slate-800' : 'bg-slate-900 text-slate-100'} shadow-2xl border-l ${isLight ? 'border-slate-200' : 'border-slate-800'} flex flex-col h-full overflow-hidden`}>
              
              {/* Drawer Header (Fixed top) */}
              <div className={`p-5 px-6 border-b flex items-center justify-between shrink-0 ${isLight ? 'border-slate-200 bg-slate-50' : 'border-slate-800 bg-slate-950/50'}`}>
                <div>
                  <h3 className={`text-lg font-bold flex items-center gap-2 ${isLight ? 'text-slate-900' : 'text-white'}`}>
                    <Tag className="w-5 h-5 text-cyan-600" /> Định Danh Tài Sản
                  </h3>
                  <p className={`text-xs mt-0.5 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>Thiết bị: <strong className="text-cyan-600">{selectedDev.hostname}</strong> ({selectedDev.ip_address || 'No IP'})</p>
                </div>
                <button onClick={() => setSelectedDev(null)} className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Drawer Content Form Wrapper */}
              <form onSubmit={handleApproveSubmit} className="flex-1 flex flex-col min-h-0 overflow-hidden">
                
                {/* Scrollable Form Body */}
                <div className="flex-1 p-6 space-y-6 text-xs overflow-y-auto">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    
                    {/* Left Column (2/3 width): Asset Metadata Inputs */}
                    <div className="lg:col-span-2 space-y-6">
                      
                      {/* Main Form Fields */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Device Name / Hostname (Editable) */}
                        <div className="md:col-span-2 space-y-1">
                          <label className={`font-bold ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                            Tên Thiết Bị / Hostname <span className="text-rose-500 font-extrabold ml-0.5">*</span>
                            <span className="text-[11px] font-normal text-slate-400 ml-1.5">(Cho phép tùy chỉnh tên thiết bị mạng, máy in, switch...)</span>
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="Nhập tên thiết bị (ví dụ: Máy In Canon Tầng 2, Switch Core Cisco...)"
                            value={customHostname}
                            onChange={(e) => setCustomHostname(e.target.value)}
                            className={`w-full border rounded-xl px-3.5 py-2.5 text-sm font-bold focus:border-cyan-500 focus:outline-none ${
                              isLight ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-slate-950 border-slate-700 text-slate-100'
                            }`}
                          />
                        </div>

                        {/* Asset Tag */}
                        <div className="space-y-1">
                          <label className={`font-bold ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                            Mã Tài Sản <span className="text-rose-500 font-extrabold ml-0.5">*</span>
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="Nhập mã tài sản..."
                            value={assetTag}
                            onChange={(e) => setAssetTag(e.target.value)}
                            className={`w-full border rounded-xl px-3.5 py-2.5 text-sm font-mono font-bold focus:border-cyan-500 focus:outline-none ${
                              isLight ? 'bg-slate-50 border-slate-300 text-cyan-700' : 'bg-slate-950 border-slate-700 text-cyan-400'
                            }`}
                          />
                        </div>
                        <div className="space-y-1">
                          <label className={`font-bold ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                            Loại Tài Sản <span className="text-rose-500 font-extrabold ml-0.5">*</span>
                          </label>
                          <select
                            value={assetType}
                            onChange={(e) => setAssetType(e.target.value)}
                            className={`w-full border rounded-xl px-3.5 py-2.5 text-sm focus:border-cyan-500 focus:outline-none ${
                              isLight ? 'bg-slate-50 border-slate-300 text-slate-800' : 'bg-slate-950 border-slate-700 text-slate-200'
                            }`}
                          >
                            {metadata.assetTypes && metadata.assetTypes.length > 0 ? (
                              metadata.assetTypes.map(at => (
                                <option key={at.id || at.code} value={at.name}>{at.name}</option>
                              ))
                            ) : (
                              <>
                                <option value="Desktop">Máy Tính Để Bàn (Desktop PC)</option>
                                <option value="Laptop">Laptop / Máy Tính Xách Tay</option>
                                <option value="Workstation">Workstation (Trạm đồ họa)</option>
                                <option value="Server">Server (Máy chủ)</option>
                                <option value="Máy In / Scanner / Photo">Máy In / Scanner / Photo</option>
                                <option value="Switch Mạng / Router / Firewall">Switch Mạng / Router / Firewall</option>
                                <option value="IP Camera / IoT">IP Camera / IoT</option>
                                <option value="Màn Hình (Monitor / TV Display)">Màn Hình (Monitor / TV Display)</option>
                                <option value="Bộ Lưu Điện / UPS">Bộ Lưu Điện / UPS</option>
                                <option value="Thiết Bị CNTT Khác">Thiết Bị CNTT Khác</option>
                              </>
                            )}
                          </select>
                        </div>

                        {/* Department (Khoa / Đơn vị) (Optional) */}
                        <div className="space-y-1">
                          <label className={`font-bold ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                            Bộ Phận (Khoa / Đơn Vị) <span className="text-xs font-normal text-slate-400">(Không bắt buộc)</span>
                          </label>
                          <select
                            value={departmentId}
                            onChange={(e) => {
                              const newDeptId = e.target.value;
                              setDepartmentId(newDeptId);
                              if (newDeptId && locationId) {
                                const currentRoom = metadata.locations.find(l => String(l.id) === String(locationId));
                                if (currentRoom && currentRoom.khoa_id && String(currentRoom.khoa_id) !== String(newDeptId)) {
                                  setLocationId('');
                                }
                              }
                            }}
                            className={`w-full border rounded-xl px-3.5 py-2.5 text-sm focus:border-cyan-500 focus:outline-none ${
                              isLight ? 'bg-slate-50 border-slate-300 text-slate-800' : 'bg-slate-950 border-slate-700 text-slate-200'
                            }`}
                          >
                            <option value="">-- Chưa gán (Lưu kho / Dự phòng) --</option>
                            {metadata.departments.map(d => (
                              <option key={d.id} value={d.id}>{d.name}</option>
                            ))}
                          </select>
                        </div>

                        {/* Location (Phòng) (Optional) */}
                        <div className="space-y-1">
                          <label className={`font-bold ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                            Vị Trí Cài Đặt (Phòng) <span className="text-xs font-normal text-slate-400">(Không bắt buộc)</span>
                          </label>
                          <select
                            value={locationId}
                            onChange={(e) => {
                              const newLocId = e.target.value;
                              setLocationId(newLocId);
                              if (newLocId) {
                                const selectedRoom = metadata.locations.find(l => String(l.id) === String(newLocId));
                                if (selectedRoom && selectedRoom.khoa_id) {
                                  setDepartmentId(String(selectedRoom.khoa_id));
                                }
                              }
                            }}
                            className={`w-full border rounded-xl px-3.5 py-2.5 text-sm focus:border-cyan-500 focus:outline-none ${
                              isLight ? 'bg-slate-50 border-slate-300 text-slate-800' : 'bg-slate-950 border-slate-700 text-slate-200'
                            }`}
                          >
                            <option value="">-- Chưa gán phòng / vị trí --</option>
                            {metadata.locations
                              .filter(l => !departmentId || String(l.khoa_id) === String(departmentId))
                              .map(l => (
                                <option key={l.id} value={l.id}>{l.room || l.name}</option>
                              ))
                            }
                          </select>
                        </div>

                        {/* User (Optional) */}
                        <div className="md:col-span-2 space-y-1">
                          <label className={`font-bold ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                            Người Sử Dụng Trực Tiếp <span className="text-xs font-normal text-slate-400">(Không bắt buộc)</span>
                          </label>
                          <select
                            value={userId}
                            onChange={(e) => setUserId(e.target.value)}
                            className={`w-full border rounded-xl px-3.5 py-2.5 text-sm focus:border-cyan-500 focus:outline-none ${
                              isLight ? 'bg-slate-50 border-slate-300 text-slate-800' : 'bg-slate-950 border-slate-700 text-slate-200'
                            }`}
                          >
                            <option value="">-- Chưa gán người sử dụng --</option>
                            {metadata.users.map(u => (
                              <option key={u.id} value={u.id}>{u.full_name} ({u.employee_id}) - {u.email}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {/* Procurement & Financial Accordion */}
                      <div className={`border rounded-xl overflow-hidden transition-all ${
                        isLight ? 'border-slate-200 bg-slate-50/50' : 'border-slate-800 bg-slate-950/50'
                      }`}>
                        <button
                          type="button"
                          onClick={() => setShowProcurement(!showProcurement)}
                          className="w-full px-4 py-3 text-left font-bold text-xs flex items-center justify-between text-cyan-600 hover:bg-slate-100 dark:hover:bg-slate-800/60"
                        >
                          <span className="flex items-center gap-2">
                            <DollarSign className="w-4 h-4 text-emerald-600" />
                            Thông Tin Mua Sắm & Tài Chính
                          </span>
                          {showProcurement ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>

                        {showProcurement && (
                          <div className="p-4 border-t border-slate-200 dark:border-slate-800 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                            {/* Purchase Date */}
                            <div className="space-y-1">
                              <label className={`font-bold ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>Ngày Mua</label>
                              <DatePickerVN
                                value={purchaseDate}
                                onChange={setPurchaseDate}
                                isLight={isLight}
                              />
                            </div>

                            {/* Purchase Cost */}
                            <div className="space-y-1">
                              <label className={`font-bold ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>Giá Mua (VNĐ)</label>
                              <div className="relative">
                                <input
                                  type="text"
                                  placeholder="Nhập giá mua"
                                  value={purchaseCost}
                                  onChange={handleCostChange}
                                  className={`w-full border rounded-xl px-3 py-2 pr-12 font-mono font-bold ${
                                    isLight ? 'bg-white border-slate-300 text-emerald-700' : 'bg-slate-900 border-slate-700 text-emerald-400'
                                  }`}
                                />
                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 pointer-events-none">
                                  VNĐ
                                </span>
                              </div>
                            </div>

                            {/* Depreciation Months */}
                            <div className="space-y-1">
                              <label className={`font-bold ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>Khấu Hao (Số Tháng)</label>
                              <input
                                type="number"
                                placeholder="Nhập số tháng khấu hao..."
                                value={depreciationMonths}
                                onChange={(e) => setDepreciationMonths(e.target.value)}
                                className={`w-full border rounded-xl px-3 py-2 ${
                                  isLight ? 'bg-white border-slate-300 text-slate-800' : 'bg-slate-900 border-slate-700 text-slate-200'
                                }`}
                              />
                            </div>

                            {/* Vendor / Supplier */}
                            <div className="space-y-1">
                              <label className={`font-bold ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>Đơn Vị Cung Cấp (Nhà Cung Cấp)</label>
                              <select
                                value={vendorSupplier}
                                onChange={(e) => setVendorSupplier(e.target.value)}
                                className={`w-full border rounded-xl px-3 py-2 text-xs focus:border-cyan-500 focus:outline-none ${
                                  isLight ? 'bg-white border-slate-300 text-slate-800' : 'bg-slate-900 border-slate-700 text-slate-200'
                                }`}
                              >
                                <option value="">-- Chọn nhà cung cấp --</option>
                                {metadata.suppliers && metadata.suppliers.map(s => (
                                  <option key={s.id} value={s.name}>{s.name}</option>
                                ))}
                              </select>
                            </div>

                            {/* Warranty Expiration Date */}
                            <div className="space-y-1 md:col-span-2">
                              <label className={`font-bold ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>Ngày Hết Bảo Hành</label>
                              <DatePickerVN
                                value={warrantyExpirationDate}
                                onChange={setWarrantyExpirationDate}
                                isLight={isLight}
                              />
                            </div>

                            {/* PO / Delivery Document Attachment */}
                            <div className="space-y-2 md:col-span-2">
                              <label className={`font-bold ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                                Đính Kèm Số PO / Phiếu Giao Hàng (Cho phép đính kèm nhiều file)
                              </label>

                              {/* List of uploaded file badges */}
                              {poFiles.length > 0 && (
                                <div className="space-y-1.5 max-h-40 overflow-y-auto">
                                  {poFiles.map((file, idx) => (
                                    <div
                                      key={idx}
                                      className={`flex items-center justify-between p-2.5 rounded-xl border text-xs font-bold ${
                                        isLight ? 'bg-cyan-50 border-cyan-200 text-cyan-800' : 'bg-cyan-950/60 border-cyan-800 text-cyan-300'
                                      }`}
                                    >
                                      <span className="flex items-center gap-2 truncate">
                                        <FileText className="w-4 h-4 text-cyan-600 shrink-0" />
                                        <span className="truncate">{file.name}</span>
                                        <span className="text-[10px] opacity-60 font-normal">({file.size})</span>
                                      </span>
                                      <button
                                        type="button"
                                        onClick={() => handleRemovePoFile(idx)}
                                        className="p-1 rounded hover:bg-cyan-200 dark:hover:bg-cyan-900 text-rose-500 transition"
                                        title="Xóa file này"
                                      >
                                        <X className="w-4 h-4" />
                                      </button>
                                    </div>
                                  ))}
                                </div>
                              )}

                              {/* Upload Input Button */}
                              <div className="relative">
                                <input
                                  type="file"
                                  multiple
                                  id="po-file-upload-drawer"
                                  onChange={handlePoFileUpload}
                                  accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,.zip,.rar"
                                  className="hidden"
                                />
                                <label
                                  htmlFor="po-file-upload-drawer"
                                  className={`w-full flex items-center justify-center gap-2 border border-dashed rounded-xl px-4 py-2.5 text-xs font-bold cursor-pointer transition ${
                                    isLight ? 'bg-white border-slate-300 text-slate-600 hover:bg-slate-50' : 'bg-slate-900 border-slate-700 text-slate-300 hover:bg-slate-800'
                                  }`}
                                >
                                  <Upload className="w-4 h-4 text-cyan-600" />
                                  {poFiles.length > 0 ? '+ Đính kèm thêm file chứng từ khác (PDF, DOCX, PNG, ZIP...)' : 'Bấm để chọn File Chứng từ PO / Hóa đơn đính kèm (PDF, DOCX, PNG, ZIP...)'}
                                </label>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Right Column (1/3 width): QR Code Tem Card */}
                    <div className="lg:col-span-1 space-y-4">
                      <div className={`p-5 rounded-2xl border flex flex-col items-center text-center space-y-4 shadow-sm ${
                        isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/80 border-slate-800'
                      }`}>
                        <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-md">
                          <QRCodeSVG id="qr-code-svg-onboard" value={assetTag || 'AST-PREVIEW'} size={140} />
                        </div>

                        <div>
                          <p className="font-extrabold text-sm font-mono text-cyan-600 dark:text-cyan-400">{assetTag || 'AST-XXXX'}</p>
                          <span className={`text-xs font-semibold block mt-0.5 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                            {assetType}
                          </span>
                          <p className={`text-[11px] mt-1.5 leading-relaxed ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                            Tem QR Code được tự động khởi tạo để in dán trực tiếp lên thiết bị phục vụ kiểm kê tài sản định kỳ.
                          </p>
                        </div>

                        <div className="w-full space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                          <button
                            type="button"
                            onClick={handlePrintQrCode}
                            className="w-full px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center justify-center gap-2 transition shadow-sm"
                          >
                            <Printer className="w-4 h-4 text-cyan-400" />
                            In Tem QR Tem Dán
                          </button>
                          <button
                            type="button"
                            onClick={handleDownloadQrCode}
                            className="w-full px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition shadow-md shadow-cyan-600/20"
                          >
                            <Download className="w-4 h-4" />
                            Tải Ảnh Mã QR (PNG)
                          </button>
                        </div>
                      </div>
                    </div>

                  </div>
                </div>

                {/* Drawer Sticky Footer Buttons (ALWAYS FIXED AT BOTTOM) */}
                <div className={`p-4 px-6 border-t flex items-center justify-end gap-3 shrink-0 shadow-lg ${
                  isLight ? 'border-slate-200 bg-slate-50' : 'border-slate-800 bg-slate-950/90'
                }`}>
                  <button
                    type="button"
                    onClick={() => setSelectedDev(null)}
                    className={`px-5 py-2.5 rounded-xl font-bold text-xs transition ${
                      isLight ? 'bg-slate-200 text-slate-700 hover:bg-slate-300' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow-lg shadow-cyan-600/20 transition"
                  >
                    Xác Nhận Định Danh Tài Sản
                  </button>
                </div>

              </form>
            </div>
          </div>
        </div>
      )}
      {/* Network Subnet IP Scanner Modal */}
      {netScanModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity bg-slate-950/70 backdrop-blur-sm" onClick={() => !netScanning && setNetScanModal(false)}></div>

            <div className={`inline-block w-full max-w-3xl my-8 overflow-hidden text-left align-middle transition-all transform rounded-2xl shadow-2xl border ${
              isLight ? 'bg-white border-slate-200 text-slate-800' : 'bg-slate-900 border-slate-800 text-slate-100'
            }`}>
              {/* Modal Header */}
              <div className={`p-6 border-b flex items-center justify-between ${isLight ? 'border-slate-200 bg-slate-50/50' : 'border-slate-800 bg-slate-950/40'}`}>
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-cyan-600/10 border border-cyan-500/20 rounded-xl text-cyan-600">
                    <Wifi className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className={`text-lg font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>
                      📡 Quét Thiết Bị Mạng Nội Bộ (Agentless Network Scanner)
                    </h3>
                    <p className={`text-xs mt-0.5 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                      Tự động gửi gói tin TCP & HTTP Probe quét tất cả Máy in, Máy Scanner, Switch/Router, IP Camera... cắm trong dải mạng.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setNetScanModal(false)}
                  disabled={netScanning}
                  className={`p-2 rounded-xl border transition ${
                    isLight ? 'bg-slate-100 text-slate-600 hover:bg-slate-200' : 'bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
                {/* Detected Subnets Quick Presets */}
                {subnets.length > 0 && (
                  <div className="space-y-2">
                    <label className={`text-xs font-bold block ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                      Card Mạng Máy Chủ Phát Hiện Được:
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {subnets.map((sub, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => {
                            setStartIp(sub.startIp);
                            setEndIp(sub.endIp);
                          }}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition flex items-center gap-1.5 ${
                            (startIp === sub.startIp && endIp === sub.endIp)
                              ? 'bg-cyan-600 border-cyan-600 text-white shadow-md'
                              : (isLight ? 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200' : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700')
                          }`}
                        >
                          <Network className="w-3.5 h-3.5" />
                          <span>{sub.name}: {sub.subnet}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* IP Range Inputs */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={`text-xs font-bold block mb-1.5 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                      IP Bắt Đầu:
                    </label>
                    <input
                      type="text"
                      value={startIp}
                      onChange={(e) => setStartIp(e.target.value)}
                      placeholder="10.30.11.1"
                      className={`w-full border rounded-xl px-3.5 py-2 text-sm font-mono font-bold focus:outline-none focus:border-cyan-500 ${
                        isLight ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-slate-950 border-slate-700 text-slate-200'
                      }`}
                    />
                  </div>
                  <div>
                    <label className={`text-xs font-bold block mb-1.5 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                      IP Kết Thúc:
                    </label>
                    <input
                      type="text"
                      value={endIp}
                      onChange={(e) => setEndIp(e.target.value)}
                      placeholder="10.30.11.254"
                      className={`w-full border rounded-xl px-3.5 py-2 text-sm font-mono font-bold focus:outline-none focus:border-cyan-500 ${
                        isLight ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-slate-950 border-slate-700 text-slate-200'
                      }`}
                    />
                  </div>
                </div>

                {/* Target Port Profiles Checkboxes */}
                <div className="space-y-2">
                  <label className={`text-xs font-bold block ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                    Danh Mục Cổng / Dịch Vụ Cần Quét:
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {[
                      { label: 'Máy in / Scanner (9100, 515, 631)', port: 9100, icon: Printer },
                      { label: 'Web Console Admin (80, 443)', port: 80, icon: Globe },
                      { label: 'Switch / Router SSH (22, 23)', port: 22, icon: Server },
                      { label: 'IP Camera / RTSP (554)', port: 554, icon: ShieldAlert }
                    ].map((item, idx) => {
                      const IconComp = item.icon;
                      const active = selectedPorts.includes(item.port);
                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => togglePort(item.port)}
                          className={`p-2.5 rounded-xl border text-left text-xs font-bold transition flex items-center gap-2 ${
                            active
                              ? (isLight ? 'bg-cyan-50 border-cyan-300 text-cyan-800' : 'bg-cyan-950/60 border-cyan-800 text-cyan-300')
                              : (isLight ? 'bg-slate-50 border-slate-200 text-slate-500' : 'bg-slate-950 border-slate-800 text-slate-400')
                          }`}
                        >
                          <IconComp className={`w-4 h-4 shrink-0 ${active ? 'text-cyan-600' : 'text-slate-400'}`} />
                          <span className="truncate">{item.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Trigger Scan Button */}
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={handleExecuteNetScan}
                    disabled={netScanning}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-sm shadow-lg shadow-cyan-600/20 flex items-center justify-center gap-2 transition"
                  >
                    <RefreshCw className={`w-4 h-4 ${netScanning ? 'animate-spin' : ''}`} />
                    {netScanning ? 'Đang Quét Các Địa Chỉ IP Nội Bộ...' : '🚀 Bắt Đầu Quét Dải Mạng Nội Bộ'}
                  </button>
                </div>

                {/* Scan Errors */}
                {netScanError && (
                  <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-500 text-xs font-bold">
                    ⚠️ {netScanError}
                  </div>
                )}

                {/* Scan Results Table */}
                {netScanResult && (
                  <div className="space-y-3 pt-2 border-t border-slate-200 dark:border-slate-800">
                    <div className="flex items-center justify-between">
                      <h4 className={`text-sm font-bold flex items-center gap-2 ${isLight ? 'text-slate-900' : 'text-white'}`}>
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        Kết Quả Quét Mạng: Tìm thấy {netScanResult.discoveredCount} thiết bị / {netScanResult.scannedCount} IP đã kiểm tra
                      </h4>
                      <span className="text-[11px] text-emerald-600 font-bold bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1 rounded-lg border border-emerald-200 dark:border-emerald-800">
                        Đã tự động thêm vào Discovery Queue
                      </span>
                    </div>

                    {netScanResult.discoveredCount === 0 ? (
                      <p className="text-xs text-slate-400 italic p-4 text-center border rounded-xl border-dashed">
                        Không phát hiện cổng mở nào trên dải IP này. Vui lòng kiểm tra lại dải mạng IP hoặc thử lại.
                      </p>
                    ) : (
                      <div className="border rounded-xl overflow-hidden text-xs">
                        <table className="w-full text-left">
                          <thead className={`font-bold border-b ${isLight ? 'bg-slate-100 text-slate-700' : 'bg-slate-950 text-slate-300 border-slate-800'}`}>
                            <tr>
                              <th className="p-3">Địa Chỉ IP</th>
                              <th className="p-3">Tên / Tiêu Đề Thiết Bị</th>
                              <th className="p-3">Chủng Loại Dự Đoán</th>
                              <th className="p-3">Cổng Mở (Ports)</th>
                            </tr>
                          </thead>
                          <tbody className={`divide-y ${isLight ? 'divide-slate-200' : 'divide-slate-800'}`}>
                            {netScanResult.devices.map((dev, i) => (
                              <tr key={i} className={isLight ? 'hover:bg-slate-50' : 'hover:bg-slate-800/50'}>
                                <td className="p-3 font-mono font-bold text-cyan-600 dark:text-cyan-400">{dev.ip}</td>
                                <td className="p-3 font-bold">{dev.hostname}</td>
                                <td className="p-3">
                                  <span className={`px-2 py-0.5 rounded-md font-bold text-[10px] border ${
                                    dev.assetType.includes('Máy in')
                                      ? 'bg-cyan-50 border-cyan-200 text-cyan-700 dark:bg-cyan-950/60 dark:border-cyan-800 dark:text-cyan-300'
                                      : 'bg-purple-50 border-purple-200 text-purple-700 dark:bg-purple-950/60 dark:border-purple-800 dark:text-purple-300'
                                  }`}>
                                    {dev.assetType}
                                  </span>
                                </td>
                                <td className="p-3 font-mono text-slate-500">
                                  {dev.openPorts ? dev.openPorts.join(', ') : 'TCP'}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className={`p-4 border-t flex items-center justify-end ${isLight ? 'border-slate-200 bg-slate-50/50' : 'border-slate-800 bg-slate-950/40'}`}>
                <button
                  type="button"
                  onClick={() => setNetScanModal(false)}
                  className="px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow-md"
                >
                  Hoàn Tất / Quay Lại Hàng Chờ Duyệt
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
