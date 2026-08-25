import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Search, Bell, Sun, Moon, User, ShieldCheck, LogOut, ChevronDown, Monitor, X, ArrowRight, Building2, Tag } from 'lucide-react';

export default function Navbar({ 
  activeTab, 
  setActiveTab, 
  pendingCount, 
  alertCount, 
  theme, 
  setTheme, 
  onLogout,
  assets = [],
  onSelectAsset
}) {
  const titleMap = {
    dashboard: 'Tổng Quan Hệ Thống Quản Lý Tài Sản',
    discovery: 'Thiết Bị Chờ Phê Duyệt / Định Danh (Discovery Queue)',
    assets: 'Danh Mục & Thông Số Cấu Hình Tài Sản',
    asset_detail: 'Trang Thông Tin Tài Sản Chi Tiết',
    drift: 'Cảnh Báo Biến Động Cấu Hình (Drift Detection)',
    maintenance: 'Lịch Bảo Trì & Kiểm Kê Mã QR Barcode',
    khoa_phong: 'Danh Mục Khoa / Phòng & Trường Vị Trí Lắp Đặt',
    employees: 'Danh Mục Nhân Viên & Mã Nhân Sự',
    chuc_danh: 'Danh Mục Chức Danh / Chức Vụ Doanh Nghiệp',
    loai_tai_san: 'Danh Mục Loại Tài Sản & Chủng Loại Thiết Bị',
    trang_thai: 'Danh Mục Quy Chuẩn Trạng Thái Tài Sản',
    nha_cung_cap: 'Danh Mục Nhà Cung Cấp & Đối Tác',
    kho_luu_tru: 'Danh Mục Kho Lưu Trữ Tài Sản & Quản Lý Kho',
    users_mgmt: 'Danh Mục Người Dùng & Phân Quyền Hệ Thống',
    account_info: 'Hồ Sơ & Thông Tin Tài Khoản Cá Nhân',
    system_settings: 'Cài Đặt Hệ Thống & Cấu Hình Tập Trung'
  };

  const isLight = theme === 'light';
  const userMenuRef = useRef(null);
  const searchRef = useRef(null);

  // Dropdown Open States
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);

  // Read User Profile from LocalStorage / State
  const [profile, setProfile] = useState({
    fullName: 'Admin System',
    jobTitle: 'Quản Trị Viên Hệ Thống',
    username: 'admin_system',
    email: 'admin@company.com',
    role: 'ADMIN',
    avatarUrl: ''
  });

  useEffect(() => {
    const saved = localStorage.getItem('app_user_profile');
    if (saved) {
      try {
        setProfile(JSON.parse(saved));
      } catch (e) {}
    }
  }, [activeTab]);

  // Click outside to close profile menu & search menu
  useEffect(() => {
    function handleClickOutside(event) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setUserMenuOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setSearchOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter Assets Live
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase().trim();
    return assets.filter(item => {
      const tag = (item.asset_tag || item.assetTag || '').toLowerCase();
      const host = (item.hostname || item.asset_name || item.assetName || '').toLowerCase();
      const sn = (item.serial_number || item.serialNumber || '').toLowerCase();
      const model = (item.model || '').toLowerCase();
      const user = (item.assigned_to_name || item.assignedToName || '').toLowerCase();
      const dept = (item.department_name || item.departmentName || '').toLowerCase();
      const type = (item.asset_type || item.assetType || '').toLowerCase();
      return tag.includes(q) || host.includes(q) || sn.includes(q) || model.includes(q) || user.includes(q) || dept.includes(q) || type.includes(q);
    }).slice(0, 6);
  }, [assets, searchQuery]);

  const handleSelectSearchItem = (assetId) => {
    if (onSelectAsset) {
      onSelectAsset(assetId);
    } else {
      setActiveTab('assets');
    }
    setSearchQuery('');
    setSearchOpen(false);
  };

  const handleSearchKeyDown = (e) => {
    if (e.key === 'Enter') {
      if (searchResults.length > 0) {
        handleSelectSearchItem(searchResults[0].id);
      } else {
        setActiveTab('assets');
        setSearchOpen(false);
      }
    }
  };

  return (
    <header className={`h-16 border-b sticky top-0 z-20 px-8 flex items-center justify-between transition-colors duration-200 ${
      isLight ? 'bg-white/80 backdrop-blur-md border-slate-200 text-slate-800' : 'bg-slate-950/70 backdrop-blur-md border-slate-800 text-white'
    }`}>
      <div>
        <h2 className="text-lg font-bold flex items-center gap-2">
          {titleMap[activeTab] || 'Quản Lý Tài Sản'}
        </h2>
      </div>

      <div className="flex items-center gap-4">
        {/* Global Live Search Input with Dropdown */}
        <div className="relative hidden md:block" ref={searchRef}>
          <div className="relative">
            <Search className={`w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 ${isLight ? 'text-slate-400' : 'text-slate-400'}`} />
            <input
              type="text"
              placeholder="Tìm mã tài sản, máy trạm, serial..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setSearchOpen(true);
              }}
              onFocus={() => setSearchOpen(true)}
              onKeyDown={handleSearchKeyDown}
              className={`border rounded-xl pl-10 pr-9 py-1.5 text-xs transition-all focus:outline-none focus:border-cyan-500 w-64 md:w-72 ${
                isLight 
                  ? 'bg-slate-100/80 border-slate-200 text-slate-800 placeholder-slate-400' 
                  : 'bg-slate-900 border-slate-800 text-slate-200 placeholder-slate-500'
              }`}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setSearchOpen(false);
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Live Search Results Popup */}
          {searchOpen && searchQuery.trim().length > 0 && (
            <div className={`absolute left-0 right-0 mt-2 w-80 md:w-96 rounded-2xl border shadow-2xl overflow-hidden z-50 transition-all ${
              isLight ? 'bg-white border-slate-200 text-slate-800' : 'bg-slate-900 border-slate-800 text-slate-100'
            }`}>
              <div className={`p-2.5 border-b text-[11px] font-extrabold uppercase tracking-wider flex items-center justify-between ${
                isLight ? 'bg-slate-100/80 text-slate-500' : 'bg-slate-950/80 text-slate-400'
              }`}>
                <span>Kết Quả Tìm Kiếm ({searchResults.length})</span>
                <span className="text-[10px] text-cyan-600 font-semibold">Nhấn Enter để mở</span>
              </div>

              <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60">
                {searchResults.length === 0 ? (
                  <div className="p-4 text-center text-xs text-slate-400">
                    Không tìm thấy tài sản nào phù hợp với từ khóa <strong className="text-cyan-600">"{searchQuery}"</strong>
                  </div>
                ) : (
                  searchResults.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => handleSelectSearchItem(item.id)}
                      className={`p-3 cursor-pointer transition flex items-center justify-between ${
                        isLight ? 'hover:bg-cyan-50/80' : 'hover:bg-slate-800/80'
                      }`}
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded-lg text-[10px] font-extrabold font-mono bg-cyan-500/10 text-cyan-600 border border-cyan-500/20">
                            {item.asset_tag || item.assetTag || 'TAG-N/A'}
                          </span>
                          <span className="font-bold text-xs truncate max-w-[170px]">
                            {item.hostname || item.asset_name || item.assetName || item.model || 'Thiết bị IT'}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 flex items-center gap-2">
                          <span>SN: {item.serial_number || item.serialNumber || 'N/A'}</span>
                          {item.department_name && (
                            <span className="flex items-center gap-1 text-slate-500">
                              • <Building2 className="w-3 h-3 text-cyan-600" /> {item.department_name}
                            </span>
                          )}
                        </p>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className="text-[10px] font-bold text-cyan-600 bg-cyan-50 dark:bg-slate-800 px-2 py-1 rounded-lg">
                          Xem chi tiết
                        </span>
                        <ArrowRight className="w-3.5 h-3.5 text-cyan-600" />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Light / Dark Mode Toggle Touch Button (Icon only) */}
        <button
          onClick={() => setTheme(isLight ? 'dark' : 'light')}
          className={`w-9 h-9 rounded-full border flex items-center justify-center transition duration-200 shadow-sm ${
            isLight 
              ? 'bg-slate-100/90 border-slate-200 text-amber-500 hover:bg-slate-200' 
              : 'bg-slate-900 border-slate-800 text-cyan-400 hover:bg-slate-800'
          }`}
          title="Bấm để chuyển đổi giao diện Sáng / Tối"
        >
          {isLight ? (
            <Sun className="w-4.5 h-4.5 text-amber-500 fill-amber-400" />
          ) : (
            <Moon className="w-4.5 h-4.5 text-cyan-400 fill-cyan-400" />
          )}
        </button>

        {/* User Profile Dropdown Menu */}
        <div className="relative" ref={userMenuRef}>
          <button
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            className={`flex items-center gap-2.5 p-1 pr-2 rounded-2xl transition duration-200 ${
              isLight 
                ? 'hover:bg-slate-100/80 text-slate-800' 
                : 'hover:bg-slate-800/60 text-white'
            }`}
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-600 font-bold text-white flex items-center justify-center text-xs shadow-sm">
              {profile.fullName ? profile.fullName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'US'}
            </div>
            <div className="text-left hidden sm:block">
              <p className="text-xs font-bold leading-tight">{profile.fullName}</p>
              <p className="text-[10px] text-cyan-600 font-extrabold uppercase">{profile.role || 'ADMIN'}</p>
            </div>
            <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${userMenuOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* User Profile Dropdown Box */}
          {userMenuOpen && (
            <div className={`absolute right-0 mt-2 w-56 rounded-2xl border shadow-2xl p-2 z-50 space-y-1 transition-all ${
              isLight ? 'bg-white border-slate-200 text-slate-800' : 'bg-slate-900 border-slate-800 text-slate-100'
            }`}>
              <div className="p-3 border-b border-slate-200 dark:border-slate-800 space-y-0.5">
                <p className="font-bold text-xs">{profile.fullName}</p>
                <p className="text-[11px] text-cyan-600 font-semibold">{profile.jobTitle || 'Cán bộ hệ thống'}</p>
                <p className="text-[10px] text-slate-400 font-mono truncate">{profile.email}</p>
              </div>

              <button
                onClick={() => {
                  setActiveTab('account_info');
                  setUserMenuOpen(false);
                }}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition ${
                  isLight ? 'hover:bg-slate-100 text-slate-700' : 'hover:bg-slate-800 text-slate-200'
                }`}
              >
                <User className="w-4 h-4 text-cyan-600" />
                Thông Tin Tài Khoản
              </button>

              <button
                onClick={() => {
                  setActiveTab('users_mgmt');
                  setUserMenuOpen(false);
                }}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition ${
                  isLight ? 'hover:bg-slate-100 text-slate-700' : 'hover:bg-slate-800 text-slate-200'
                }`}
              >
                <ShieldCheck className="w-4 h-4 text-indigo-600" />
                Phân Quyền Hệ Thống
              </button>

              <div className="pt-1 border-t border-slate-200 dark:border-slate-800">
                <button
                  onClick={() => {
                    setUserMenuOpen(false);
                    if (onLogout) onLogout();
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-500/10 transition"
                >
                  <LogOut className="w-4 h-4" />
                  Đăng Xuất Hệ Thống
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
    </header>
  );
}
