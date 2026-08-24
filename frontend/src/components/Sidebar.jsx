import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Radio, 
  Monitor, 
  AlertTriangle, 
  History, 
  QrCode, 
  ShieldCheck,
  Building2,
  Users,
  UserCheck,
  FolderTree,
  Briefcase,
  Package,
  Layers,
  Truck,
  Warehouse,
  User,
  Settings,
  ChevronDown,
  ChevronRight,
  Activity
} from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab, pendingCount, alertCount, theme, orgInfo, systemInfo, userRole = 'ADMIN', permissionMatrix = null }) {
  const isLight = theme === 'light';

  // Permission Check Helper
  const checkPerm = (itemKey) => {
    if (!userRole || userRole === 'ADMIN') return true;
    if (!permissionMatrix || !permissionMatrix[userRole]) {
      if (userRole === 'STAFF' || userRole === 'VIEWER') {
        if (itemKey === 'users_mgmt' || itemKey === 'system_settings') return false;
      }
      return true;
    }
    const rolePerms = permissionMatrix[userRole];
    switch (itemKey) {
      case 'discovery': return !!rolePerms.discovery_view;
      case 'drift': return !!rolePerms.drift_view;
      case 'maintenance': return !!rolePerms.asset_maintenance;
      case 'users_mgmt': return !!rolePerms.iam_users || !!rolePerms.iam_matrix;
      case 'system_settings': return !!rolePerms.system_settings;
      case 'khoa_phong':
      case 'employees':
      case 'chuc_danh':
      case 'loai_tai_san':
      case 'trang_thai':
      case 'kho_luu_tru':
      case 'nha_cung_cap':
        return !!rolePerms.master_view;
      default:
        return true;
    }
  };

  // Section 1: Quản Lý Vận Hành
  const mainMenuItems = [
    { id: 'assets', label: 'Danh Mục Tài Sản', icon: Monitor },
    { id: 'discovery', label: 'Thiết Bị Chờ Duyệt', icon: Radio, badge: pendingCount },
    { id: 'maintenance', label: 'Bảo Trì & Kiểm Kê', icon: QrCode },
    { id: 'drift', label: 'Biến Động Cấu Hình', icon: AlertTriangle, badge: alertCount, badgeColor: 'bg-rose-500' },
  ].filter(item => checkPerm(item.id));

  // Section 2: Danh Mục Hệ Thống
  const masterDataItems = [
    { id: 'khoa_phong', label: 'Khoa / Phòng', icon: Building2 },
    { id: 'employees', label: 'Nhân Viên', icon: UserCheck },
    { id: 'chuc_danh', label: 'Chức Danh / Chức Vụ', icon: Briefcase },
    { id: 'loai_tai_san', label: 'Loại Tài Sản', icon: Package },
    { id: 'trang_thai', label: 'Trạng Thái Tài Sản', icon: Layers },
    { id: 'kho_luu_tru', label: 'Kho Lưu Trữ', icon: Warehouse },
    { id: 'nha_cung_cap', label: 'Nhà Cung Cấp', icon: Truck },
  ].filter(item => checkPerm(item.id));

  // Section 3: Quản Trị Hệ Thống
  const adminItems = [
    { id: 'account_info', label: 'Thông Tin Tài Khoản', icon: User },
    { id: 'users_mgmt', label: 'Người Dùng', icon: Users },
    { id: 'system_settings', label: 'Cài Đặt Hệ Thống', icon: Settings },
  ].filter(item => checkPerm(item.id));

  // State to track expanded status of groups
  const [openGroups, setOpenGroups] = useState(() => {
    return {
      operation: mainMenuItems.some(i => i.id === activeTab),
      masterData: masterDataItems.some(i => i.id === activeTab),
      admin: adminItems.some(i => i.id === activeTab)
    };
  });

  // Auto-expand/collapse group when activeTab changes
  useEffect(() => {
    setOpenGroups({
      operation: mainMenuItems.some(i => i.id === activeTab),
      masterData: masterDataItems.some(i => i.id === activeTab),
      admin: adminItems.some(i => i.id === activeTab)
    });
  }, [activeTab]);

  const toggleGroup = (groupKey) => {
    setOpenGroups(prev => ({
      ...prev,
      [groupKey]: !prev[groupKey]
    }));
  };

  const renderNavGroup = (groupKey, title, items, GroupIcon) => {
    const isOpen = !!openGroups[groupKey];
    const hasActiveItem = items.some(item => item.id === activeTab);

    // Sum badges in group for display when group is collapsed
    const totalBadge = items.reduce((acc, item) => acc + (item.badge || 0), 0);

    return (
      <div className="space-y-1">
        {/* Header Toggle Button */}
        <button
          type="button"
          onClick={() => toggleGroup(groupKey)}
          className={`w-full flex items-center justify-between px-3 py-2 rounded-xl transition-all duration-200 text-left select-none ${
            hasActiveItem && !isOpen
              ? isLight ? 'bg-cyan-50/70 text-cyan-800' : 'bg-cyan-950/40 text-cyan-300'
              : isLight ? 'hover:bg-slate-100/80 text-slate-700' : 'hover:bg-slate-800/60 text-slate-300'
          }`}
        >
          <div className="flex items-center gap-2">
            {GroupIcon && <GroupIcon className={`w-4 h-4 ${hasActiveItem ? 'text-cyan-600' : isLight ? 'text-slate-400' : 'text-slate-500'}`} />}
            <span className={`text-[11px] font-extrabold uppercase tracking-wider ${
              hasActiveItem ? 'text-cyan-600 font-bold' : isLight ? 'text-slate-500' : 'text-slate-400'
            }`}>
              {title}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {!isOpen && totalBadge > 0 && (
              <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-cyan-500 text-white animate-pulse">
                {totalBadge}
              </span>
            )}
            {isOpen ? (
              <ChevronDown className="w-4 h-4 text-slate-400 transition-transform duration-200" />
            ) : (
              <ChevronRight className="w-4 h-4 text-slate-400 transition-transform duration-200" />
            )}
          </div>
        </button>

        {/* Collapsible Content */}
        <div className={`grid transition-all duration-200 ease-in-out ${
          isOpen ? 'grid-rows-[1fr] opacity-100 mt-1' : 'grid-rows-[0fr] opacity-0'
        }`}>
          <div className="overflow-hidden space-y-1">
            {items.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2 rounded-xl font-medium text-sm transition-all duration-200 ${
                    isActive
                      ? isLight 
                        ? 'bg-cyan-50 text-cyan-700 font-bold border border-cyan-200 shadow-sm' 
                        : 'bg-gradient-to-r from-cyan-500/20 to-blue-500/10 text-cyan-400 border border-cyan-500/30 shadow-md shadow-cyan-500/5'
                      : isLight 
                        ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-100' 
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? (isLight ? 'text-cyan-600' : 'text-cyan-400') : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge > 0 && (
                    <span className={`px-2 py-0.5 text-xs font-bold rounded-full text-white ${item.badgeColor || 'bg-cyan-500'}`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  return (
    <aside className={`w-64 border-r flex flex-col justify-between h-screen sticky top-0 z-30 transition-colors duration-200 overflow-y-auto ${
      isLight ? 'bg-white border-slate-200 text-slate-800' : 'bg-slate-900/90 border-slate-800/80 text-white'
    }`}>
      <div>
        {/* Brand Header */}
        <div className={`p-5 border-b flex items-center gap-3 ${isLight ? 'border-slate-200' : 'border-slate-800/80'}`}>
          <div className="w-9 h-9 flex items-center justify-center shrink-0">
            {orgInfo?.faviconUrl || orgInfo?.logoUrl ? (
              <img src={orgInfo.faviconUrl || orgInfo.logoUrl} alt="Favicon" className="w-full h-full object-contain" />
            ) : (
              <ShieldCheck className="w-8 h-8 text-cyan-600" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <h1 className={`font-bold text-sm leading-tight truncate ${isLight ? 'text-slate-900' : 'text-white'}`} title={systemInfo?.softwareName || 'IT AssetGuard'}>
              {systemInfo?.softwareName || 'IT AssetGuard'}
            </h1>
            <p className="text-[11px] text-cyan-600 font-semibold truncate">Enterprise Management</p>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="p-4 space-y-3">
          {/* Top Standalone Page: Tổng Quan */}
          <button
            type="button"
            onClick={() => setActiveTab('dashboard')}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-bold text-sm transition-all duration-200 ${
              activeTab === 'dashboard'
                ? isLight 
                  ? 'bg-cyan-50 text-cyan-700 border border-cyan-200 shadow-sm' 
                  : 'bg-gradient-to-r from-cyan-500/20 to-blue-500/10 text-cyan-400 border border-cyan-500/30 shadow-md shadow-cyan-500/5'
                : isLight 
                  ? 'text-slate-700 hover:text-slate-900 hover:bg-slate-100' 
                  : 'text-slate-300 hover:text-slate-100 hover:bg-slate-800/50'
            }`}
          >
            <div className="flex items-center gap-3">
              <LayoutDashboard className={`w-4.5 h-4.5 ${activeTab === 'dashboard' ? (isLight ? 'text-cyan-600' : 'text-cyan-400') : 'text-slate-400'}`} />
              <span>Tổng Quan</span>
            </div>
          </button>

          {/* Quản Lý Vận Hành */}
          <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
            {renderNavGroup('operation', 'Quản Lý Vận Hành', mainMenuItems, Activity)}
          </div>

          {/* Danh Mục Hệ Thống */}
          <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
            {renderNavGroup('masterData', 'Danh Mục Hệ Thống', masterDataItems, FolderTree)}
          </div>

          {/* Quản Trị Hệ Thống */}
          <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
            {renderNavGroup('admin', 'Quản Trị Hệ Thống', adminItems, Settings)}
          </div>
        </nav>
      </div>
    </aside>
  );
}
