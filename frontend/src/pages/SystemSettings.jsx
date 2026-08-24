import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  Building2, 
  Phone, 
  MapPin, 
  FileText, 
  Upload, 
  Image as ImageIcon, 
  Globe, 
  Cpu, 
  Save, 
  Sliders, 
  Code2, 
  BadgeCheck,
  Check,
  Radio,
  AlertTriangle
} from 'lucide-react';

export default function SystemSettings({ theme, onSettingsUpdated }) {
  const isLight = theme === 'light';
  const cardClass = isLight ? 'glass-card-light' : 'glass-card-dark';

  // Active Tab state: 'ORG' | 'SYSTEM' | 'CONFIG'
  const [activeTab, setActiveTab] = useState('ORG');

  // 1. Thông Tin Đơn Vị State
  const [orgInfo, setOrgInfo] = useState({
    name: 'Công Ty Cổ Phần Bệnh Viện Thuận Mỹ TDM',
    phone: '02743835117',
    address: 'Số 152 Huỳnh Văn Cù, P. Hiệp Thành, TP. Thủ Dầu Một, Tỉnh Bình Dương',
    taxCode: '3701604767',
    logoUrl: '/docs/logo.png',
    faviconUrl: '/docs/favicon.ico'
  });

  // 2. Thông Tin Hệ Thống State
  const [systemInfo, setSystemInfo] = useState({
    softwareName: 'IT AssetGuard Enterprise System',
    developer: 'Google DeepMind Team & Advanced Agentic Engineering',
    version: 'v2.5.0-Enterprise (Build 2026.08)',
    licenseType: 'Bản Quyền Doanh Nghiệp (Enterprise License - Unlimited Nodes)',
    releaseDate: '24/08/2026'
  });

  // 3. Cấu Hình Tự Động Hóa & Telemetry State
  const [config, setConfig] = useState({
    telemetryInterval: '30', // phút
    enableDriftAlert: true,
    networkSubnet: '192.168.1.0/24',
    autoScanNewDevices: true
  });

  // Toast Notification
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Fetch saved settings from backend server on mount
  useEffect(() => {
    fetch('/api/settings')
      .then(res => res.json())
      .then(data => {
        if (data) {
          if (data.orgInfo) setOrgInfo(data.orgInfo);
          if (data.systemInfo) setSystemInfo(data.systemInfo);
          if (data.config) setConfig(data.config);
        }
      })
      .catch(e => {
        console.error('Error fetching settings from backend server:', e);
      });
  }, []);

  // Save handler to Server
  const handleSaveAll = async (e) => {
    if (e) e.preventDefault();
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orgInfo, systemInfo, config })
      });
      const data = await res.json();

      if (data.status === 'success' || res.ok) {
        localStorage.setItem('assetguard_org_info', JSON.stringify(orgInfo));
        localStorage.setItem('assetguard_sys_info', JSON.stringify(systemInfo));
        localStorage.setItem('assetguard_config_info', JSON.stringify(config));

        if (onSettingsUpdated) {
          onSettingsUpdated({ orgInfo, systemInfo, config });
        }

        setSavedSuccess(true);
        setTimeout(() => setSavedSuccess(false), 4000);
      }
    } catch (err) {
      console.error('Error saving settings to server:', err);
      alert('Có lỗi xảy ra khi lưu cấu hình lên Server.');
    }
  };

  // Upload Logo file to Server /docs/logo.png
  const handleLogoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const reader = new FileReader();
    reader.onloadend = async () => {
      try {
        const ext = file.name.split('.').pop() || 'png';
        const filename = `logo_${Date.now()}.${ext}`;
        const res = await fetch('/api/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ filename, fileData: reader.result })
        });
        const data = await res.json();
        if (data.url) {
          const updatedOrg = { ...orgInfo, logoUrl: data.url };
          setOrgInfo(updatedOrg);
        }
      } catch (err) {
        console.error('Error uploading logo file:', err);
      } finally {
        setUploading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  // Upload Favicon file to Server /docs/favicon.ico
  const handleFaviconUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const reader = new FileReader();
    reader.onloadend = async () => {
      try {
        const ext = file.name.split('.').pop() || 'png';
        const filename = `favicon_${Date.now()}.${ext}`;
        const res = await fetch('/api/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ filename, fileData: reader.result })
        });
        const data = await res.json();
        if (data.url) {
          const updatedOrg = { ...orgInfo, faviconUrl: data.url };
          setOrgInfo(updatedOrg);
        }
      } catch (err) {
        console.error('Error uploading favicon file:', err);
      } finally {
        setUploading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-6 w-full pb-8">
      
      {/* Toast Success Message */}
      {savedSuccess && (
        <div className="fixed top-6 right-6 z-50 bg-emerald-600 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-bounce">
          <Check className="w-5 h-5 bg-white text-emerald-600 rounded-full p-0.5" />
          <div>
            <h4 className="font-bold text-xs">Lưu Thành Công!</h4>
            <p className="text-[11px] opacity-90">Thông tin đơn vị & cấu hình hệ thống đã được cập nhật.</p>
          </div>
        </div>
      )}

      {/* 1. Header Banner */}
      <div className={`${cardClass} p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-l-4 border-l-cyan-600`}>
        <div>
          <h2 className={`text-xl font-bold flex items-center gap-2 ${isLight ? 'text-slate-900' : 'text-white'}`}>
            <Settings className="w-5 h-5 text-cyan-600" /> Cài Đặt Hệ Thống & Thông Tin Đơn Vị
          </h2>
          <p className={`text-xs mt-0.5 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
            Quản lý thông tin doanh nghiệp, cấu hình phần mềm và tham số tự động hóa Telemetry.
          </p>
        </div>

        <button
          onClick={handleSaveAll}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs shadow-md shadow-cyan-600/25 flex items-center gap-2 transition shrink-0"
        >
          <Save className="w-4 h-4" /> Lưu Cấu Hình Hệ Thống
        </button>
      </div>

      {/* 2. 3-Tab Segmented Navigation Bar */}
      <div className={`p-1.5 rounded-2xl border flex items-center gap-2 ${
        isLight ? 'bg-slate-100/90 border-slate-200' : 'bg-slate-900/90 border-slate-800'
      }`}>
        {/* TAB 1: THÔNG TIN ĐƠN VỊ */}
        <button
          type="button"
          onClick={() => setActiveTab('ORG')}
          className={`flex-1 py-3 px-4 rounded-xl font-bold text-xs transition flex items-center justify-center gap-2 ${
            activeTab === 'ORG'
              ? 'bg-cyan-600 text-white shadow-md'
              : isLight ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60' : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Building2 className="w-4 h-4" /> 1. Thông Tin Đơn Vị / Doanh Nghiệp
        </button>

        {/* TAB 2: THÔNG TIN HỆ THỐNG */}
        <button
          type="button"
          onClick={() => setActiveTab('SYSTEM')}
          className={`flex-1 py-3 px-4 rounded-xl font-bold text-xs transition flex items-center justify-center gap-2 ${
            activeTab === 'SYSTEM'
              ? 'bg-cyan-600 text-white shadow-md'
              : isLight ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60' : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Code2 className="w-4 h-4" /> 2. Thông Tin Hệ Thống & Phần Mềm
        </button>

        {/* TAB 3: CẤU HÌNH TELEMETRY & MẠNG */}
        <button
          type="button"
          onClick={() => setActiveTab('CONFIG')}
          className={`flex-1 py-3 px-4 rounded-xl font-bold text-xs transition flex items-center justify-center gap-2 ${
            activeTab === 'CONFIG'
              ? 'bg-cyan-600 text-white shadow-md'
              : isLight ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60' : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Sliders className="w-4 h-4" /> 3. Cấu Hình Telemetry & Quét Mạng
        </button>
      </div>

      {/* 3. TAB CONTENT PANEL */}
      <form onSubmit={handleSaveAll} className="space-y-6">
        
        {/* TAB 1: THÔNG TIN ĐƠN VỊ */}
        {activeTab === 'ORG' && (
          <div className={`${cardClass} p-6 rounded-2xl space-y-6 animate-fadeIn`}>
            <div className="flex items-center justify-between border-b pb-4 border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-600">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className={`font-bold text-base ${isLight ? 'text-slate-900' : 'text-white'}`}>
                    Thông Tin Đơn Vị / Doanh Nghiệp
                  </h3>
                  <p className="text-xs text-slate-500">Khai báo danh tính pháp lý và logo hiển thị trên các báo cáo, biên bản bàn giao</p>
                </div>
              </div>
              <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-cyan-50 dark:bg-cyan-950/60 text-cyan-600 border border-cyan-200 dark:border-cyan-800">
                Corporate Identity
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Left Inputs Column */}
              <div className="space-y-4 text-xs">
                {/* Tên Đơn Vị */}
                <div className="space-y-1">
                  <label className={`font-bold flex items-center gap-1.5 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                    <Building2 className="w-3.5 h-3.5 text-cyan-600" /> Tên Đơn Vị / Tổ Chức <span className="text-rose-500 font-bold">*</span>
                  </label>
                  <input
                    type="text"
                    value={orgInfo.name}
                    onChange={(e) => setOrgInfo({ ...orgInfo, name: e.target.value })}
                    placeholder="Nhập tên công ty, bệnh viện, trường học..."
                    className={`w-full border rounded-xl px-3.5 py-2.5 font-bold ${
                      isLight ? 'bg-slate-50 border-slate-300 text-slate-900 focus:bg-white' : 'bg-slate-950 border-slate-700 text-white'
                    } focus:outline-none focus:border-cyan-500`}
                  />
                </div>

                {/* Số Điện Thoại */}
                <div className="space-y-1">
                  <label className={`font-bold flex items-center gap-1.5 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                    <Phone className="w-3.5 h-3.5 text-cyan-600" /> Số Điện Thoại Liên Hệ <span className="text-rose-500 font-bold">*</span>
                  </label>
                  <input
                    type="text"
                    value={orgInfo.phone}
                    onChange={(e) => setOrgInfo({ ...orgInfo, phone: e.target.value })}
                    placeholder="Ví dụ: 024 3888 9999..."
                    className={`w-full border rounded-xl px-3.5 py-2.5 font-semibold ${
                      isLight ? 'bg-slate-50 border-slate-300 text-slate-900 focus:bg-white' : 'bg-slate-950 border-slate-700 text-white'
                    } focus:outline-none focus:border-cyan-500`}
                  />
                </div>

                {/* Địa Chỉ */}
                <div className="space-y-1">
                  <label className={`font-bold flex items-center gap-1.5 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                    <MapPin className="w-3.5 h-3.5 text-cyan-600" /> Địa Chỉ Trụ Sở Chính <span className="text-rose-500 font-bold">*</span>
                  </label>
                  <input
                    type="text"
                    value={orgInfo.address}
                    onChange={(e) => setOrgInfo({ ...orgInfo, address: e.target.value })}
                    placeholder="Nhập địa chỉ trụ sở văn phòng..."
                    className={`w-full border rounded-xl px-3.5 py-2.5 font-semibold ${
                      isLight ? 'bg-slate-50 border-slate-300 text-slate-900 focus:bg-white' : 'bg-slate-950 border-slate-700 text-white'
                    } focus:outline-none focus:border-cyan-500`}
                  />
                </div>

                {/* Mã Số Thuế */}
                <div className="space-y-1">
                  <label className={`font-bold flex items-center gap-1.5 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                    <FileText className="w-3.5 h-3.5 text-cyan-600" /> Mã Số Thuế (MST) <span className="text-rose-500 font-bold">*</span>
                  </label>
                  <input
                    type="text"
                    value={orgInfo.taxCode}
                    onChange={(e) => setOrgInfo({ ...orgInfo, taxCode: e.target.value })}
                    placeholder="Ví dụ: 0109887766..."
                    className={`w-full border rounded-xl px-3.5 py-2.5 font-mono font-bold ${
                      isLight ? 'bg-slate-50 border-slate-300 text-slate-900 focus:bg-white' : 'bg-slate-950 border-slate-700 text-white'
                    } focus:outline-none focus:border-cyan-500`}
                  />
                </div>
              </div>

              {/* Right Logos & Favicon Upload Column */}
              <div className="space-y-5 text-xs border-t md:border-t-0 md:border-l pt-4 md:pt-0 md:pl-6 border-slate-200 dark:border-slate-800">
                
                {/* Logo Preview & Upload */}
                <div className="space-y-2">
                  <label className={`font-bold flex items-center gap-1.5 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                    <ImageIcon className="w-3.5 h-3.5 text-cyan-600" /> Logo Đơn Vị (Hiển thị Header & In Bàn Giao)
                  </label>
                  <div className={`p-4 rounded-xl border flex items-center gap-4 ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950 border-slate-800'}`}>
                    <div className="w-16 h-16 rounded-xl border bg-white flex items-center justify-center p-2 shadow-inner shrink-0 overflow-hidden">
                      <img src={orgInfo.logoUrl} alt="Logo Đơn vị" className="max-h-full max-w-full object-contain" />
                    </div>
                    <div className="space-y-1.5 flex-1 min-w-0">
                      <input
                        type="text"
                        value={orgInfo.logoUrl}
                        onChange={(e) => setOrgInfo({ ...orgInfo, logoUrl: e.target.value })}
                        placeholder="Dán đường dẫn URL Logo..."
                        className={`w-full border rounded-lg px-2.5 py-1.5 text-[11px] ${
                          isLight ? 'bg-white border-slate-300' : 'bg-slate-900 border-slate-700 text-slate-200'
                        }`}
                      />
                      <div className="flex items-center gap-2">
                        <label className="px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-[11px] cursor-pointer flex items-center gap-1 shadow-sm transition">
                          <Upload className="w-3 h-3" /> Tải Logo Mới
                          <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                        </label>
                        <span className="text-[10px] text-slate-400">PNG, SVG, JPG (tối đa 2MB)</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Favicon Preview & Upload */}
                <div className="space-y-2">
                  <label className={`font-bold flex items-center gap-1.5 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                    <Globe className="w-3.5 h-3.5 text-cyan-600" /> Biểu Tượng Favicon (Trình Duyệt Web)
                  </label>
                  <div className={`p-4 rounded-xl border flex items-center gap-4 ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950 border-slate-800'}`}>
                    <div className="w-12 h-12 rounded-xl border bg-white flex items-center justify-center p-2 shadow-inner shrink-0 overflow-hidden">
                      <img src={orgInfo.faviconUrl} alt="Favicon Icon" className="w-8 h-8 object-contain" />
                    </div>
                    <div className="space-y-1.5 flex-1 min-w-0">
                      <input
                        type="text"
                        value={orgInfo.faviconUrl}
                        onChange={(e) => setOrgInfo({ ...orgInfo, faviconUrl: e.target.value })}
                        placeholder="Dán đường dẫn URL Favicon..."
                        className={`w-full border rounded-lg px-2.5 py-1.5 text-[11px] ${
                          isLight ? 'bg-white border-slate-300' : 'bg-slate-900 border-slate-700 text-slate-200'
                        }`}
                      />
                      <div className="flex items-center gap-2">
                        <label className="px-3 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-white font-bold text-[11px] cursor-pointer flex items-center gap-1 shadow-sm transition">
                          <Upload className="w-3 h-3" /> Tải Favicon (.ico / .png)
                          <input type="file" accept="image/*" onChange={handleFaviconUpload} className="hidden" />
                        </label>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>
        )}

        {/* TAB 2: THÔNG TIN HỆ THỐNG */}
        {activeTab === 'SYSTEM' && (
          <div className={`${cardClass} p-6 rounded-2xl space-y-6 animate-fadeIn`}>
            <div className="flex items-center justify-between border-b pb-4 border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-600">
                  <Code2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className={`font-bold text-base ${isLight ? 'text-slate-900' : 'text-white'}`}>
                    Thông Tin Hệ Thống & Phần Mềm
                  </h3>
                  <p className="text-xs text-slate-500">Thông tin định danh phiên bản, nhà phát triển và giấy phép vận hành phần mềm</p>
                </div>
              </div>
              <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
                <BadgeCheck className="w-3.5 h-3.5" /> License Active
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              
              {/* Tên phần mềm */}
              <div className={`p-4 rounded-xl border space-y-1.5 ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950 border-slate-800'}`}>
                <span className="text-[10px] font-bold uppercase text-slate-400 block">TÊN PHẦN MỀM</span>
                <input
                  type="text"
                  value={systemInfo.softwareName}
                  onChange={(e) => setSystemInfo({ ...systemInfo, softwareName: e.target.value })}
                  className={`w-full font-bold text-sm bg-transparent border-b pb-1 ${isLight ? 'border-slate-300 text-cyan-700' : 'border-slate-700 text-cyan-400'} focus:outline-none`}
                />
                <p className="text-[10px] text-slate-400 pt-1">Hệ thống quản lý vòng đời tài sản CNTT doanh nghiệp</p>
              </div>

              {/* Người phát triển */}
              <div className={`p-4 rounded-xl border space-y-1.5 ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950 border-slate-800'}`}>
                <span className="text-[10px] font-bold uppercase text-slate-400 block">NGƯỜI PHÁT TRIỂN</span>
                <input
                  type="text"
                  value={systemInfo.developer}
                  onChange={(e) => setSystemInfo({ ...systemInfo, developer: e.target.value })}
                  className={`w-full font-bold text-xs bg-transparent border-b pb-1 ${isLight ? 'border-slate-300 text-slate-900' : 'border-slate-700 text-white'} focus:outline-none`}
                />
                <p className="text-[10px] text-slate-400 pt-1">Đội ngũ phát triển giải pháp phần mềm chuyên nghiệp</p>
              </div>

              {/* Phiên bản */}
              <div className={`p-4 rounded-xl border space-y-1.5 ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950 border-slate-800'}`}>
                <span className="text-[10px] font-bold uppercase text-slate-400 block">PHIÊN BẢN PHÁT HÀNH</span>
                <input
                  type="text"
                  value={systemInfo.version}
                  onChange={(e) => setSystemInfo({ ...systemInfo, version: e.target.value })}
                  className={`w-full font-mono font-bold text-xs bg-transparent border-b pb-1 ${isLight ? 'border-slate-300 text-slate-900' : 'border-slate-700 text-white'} focus:outline-none`}
                />
                <p className="text-[10px] text-emerald-600 font-semibold pt-1">✓ Đã cập nhật bản vá bảo mật mới nhất ({systemInfo.releaseDate})</p>
              </div>

            </div>

            {/* Core Tech Badge Row */}
            <div className={`p-4 rounded-xl border flex flex-wrap items-center justify-between gap-4 text-xs ${
              isLight ? 'bg-slate-100/70 border-slate-200' : 'bg-slate-950/60 border-slate-800'
            }`}>
              <div className="flex items-center gap-2">
                <Cpu className="w-4 h-4 text-cyan-600" />
                <span className="font-bold">Nền Tảng Công Nghệ Core:</span>
                <span className="text-slate-500">React 18 • Node.js Express • MySQL • Agent Telemetry C# .NET</span>
              </div>
              <span className="font-mono font-semibold text-[11px] text-cyan-600">
                License ID: AG-ENT-2026-X89
              </span>
            </div>
          </div>
        )}

        {/* TAB 3: CẤU HÌNH TELEMETRY & MẠNG */}
        {activeTab === 'CONFIG' && (
          <div className={`${cardClass} p-6 rounded-2xl space-y-6 animate-fadeIn`}>
            <div className="flex items-center justify-between border-b pb-4 border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-600">
                  <Sliders className="w-5 h-5" />
                </div>
                <div>
                  <h3 className={`font-bold text-base ${isLight ? 'text-slate-900' : 'text-white'}`}>
                    Cấu Hình Tự Động Hóa Agent Telemetry & Quét Mạng
                  </h3>
                  <p className="text-xs text-slate-500">Cấu hình chu kỳ thu thập cấu hình máy trạm và tần suất cảnh báo biến động</p>
                </div>
              </div>
            </div>

            <div className="space-y-4 text-xs">
              
              {/* Setting Item 1: Telemetry Interval */}
              <div className={`p-4 rounded-xl border flex items-center justify-between gap-4 ${
                isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950 border-slate-800'
              }`}>
                <div className="space-y-0.5">
                  <h4 className={`font-bold text-sm flex items-center gap-2 ${isLight ? 'text-slate-900' : 'text-white'}`}>
                    <Radio className="w-4 h-4 text-cyan-600" /> Chu Kỳ Quét Agent Telemetry Máy Trạm
                  </h4>
                  <p className="text-slate-400 text-xs">Tự động gửi gói tin thu thập cấu hình CPU, RAM, Ổ cứng và phần mềm máy trạm</p>
                </div>
                <select
                  value={config.telemetryInterval}
                  onChange={(e) => setConfig({ ...config, telemetryInterval: e.target.value })}
                  className={`border rounded-xl px-3.5 py-2 font-bold text-xs focus:outline-none focus:border-cyan-500 ${
                    isLight ? 'bg-white border-slate-300 text-cyan-700' : 'bg-slate-900 border-slate-700 text-cyan-400'
                  }`}
                >
                  <option value="15">⏱️ Mỗi 15 Phút</option>
                  <option value="30">⏱️ Mỗi 30 Phút (Khuyến Nghị)</option>
                  <option value="60">⏱️ Mỗi 1 Giờ</option>
                  <option value="360">⏱️ Mỗi 6 Giờ</option>
                </select>
              </div>

              {/* Setting Item 2: Drift Alert Switch */}
              <div className={`p-4 rounded-xl border flex items-center justify-between gap-4 ${
                isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950 border-slate-800'
              }`}>
                <div className="space-y-0.5">
                  <h4 className={`font-bold text-sm flex items-center gap-2 ${isLight ? 'text-slate-900' : 'text-white'}`}>
                    <AlertTriangle className="w-4 h-4 text-amber-500" /> Phát Hiện & Cảnh Báo Biến Động Cấu Hình (Drift Detection)
                  </h4>
                  <p className="text-slate-400 text-xs">Tự động phát hiện bất thường khi tháo bớt RAM, thay CPU, tráo đổi ổ cứng hoặc gỡ phần mềm</p>
                </div>
                <button
                  type="button"
                  onClick={() => setConfig({ ...config, enableDriftAlert: !config.enableDriftAlert })}
                  className={`px-4 py-2 rounded-xl font-bold text-xs transition border flex items-center gap-2 ${
                    config.enableDriftAlert
                      ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30'
                      : 'bg-rose-500/10 text-rose-600 border-rose-500/30'
                  }`}
                >
                  {config.enableDriftAlert ? '✓ BẬT (Kích Hoạt)' : '✕ TẮT (Tạm Dừng)'}
                </button>
              </div>

              {/* Setting Item 3: Network Subnet */}
              <div className={`p-4 rounded-xl border flex items-center justify-between gap-4 ${
                isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950 border-slate-800'
              }`}>
                <div className="space-y-0.5">
                  <h4 className={`font-bold text-sm flex items-center gap-2 ${isLight ? 'text-slate-900' : 'text-white'}`}>
                    <Globe className="w-4 h-4 text-cyan-600" /> Dải IP Quét Mạng Tự Động (Network Scanner Subnet)
                  </h4>
                  <p className="text-slate-400 text-xs">Dải IP CIDR mặc định để Agentless Scanner tìm máy in, máy scan, switch nội bộ</p>
                </div>
                <input
                  type="text"
                  value={config.networkSubnet}
                  onChange={(e) => setConfig({ ...config, networkSubnet: e.target.value })}
                  className={`border rounded-xl px-3.5 py-1.5 font-mono font-bold text-xs focus:outline-none focus:border-cyan-500 ${
                    isLight ? 'bg-white border-slate-300 text-slate-900' : 'bg-slate-900 border-slate-700 text-white'
                  }`}
                />
              </div>

            </div>
          </div>
        )}

        {/* BOTTOM SAVE BUTTON BAR */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className="px-8 py-3 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs shadow-xl shadow-cyan-600/30 flex items-center gap-2 transition"
          >
            <Save className="w-4 h-4" /> Lưu Tất Cả Cấu Hình Hệ Thống
          </button>
        </div>

      </form>
    </div>
  );
}
