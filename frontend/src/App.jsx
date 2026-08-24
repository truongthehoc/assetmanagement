import React, { useState, useEffect } from 'react';
import { ShieldAlert } from 'lucide-react';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import DiscoveryQueue from './pages/DiscoveryQueue';
import AssetsList from './pages/AssetsList';
import AssetDetail from './pages/AssetDetail';
import DriftAlerts from './pages/DriftAlerts';
import LifecycleHistory from './pages/LifecycleHistory';
import MaintenanceAudit from './pages/MaintenanceAudit';
import KhoaPhong from './pages/KhoaPhong';
import NhanVien from './pages/NhanVien';
import ChucDanh from './pages/ChucDanh';
import LoaiTaiSan from './pages/LoaiTaiSan';
import TrangThaiTaiSan from './pages/TrangThaiTaiSan';
import NhaCungCap from './pages/NhaCungCap';
import KhoLuuTru from './pages/KhoLuuTru';
import SystemSettings from './pages/SystemSettings';
import UsersManagement from './pages/UsersManagement';
import UserProfile from './pages/UserProfile';
import Login from './pages/Login';
import Footer from './components/Footer';
import ErrorBoundary from './components/ErrorBoundary';

// Helper to read initial tab and asset ID from URL hash or localStorage
const getInitialState = () => {
  const hash = window.location.hash.replace('#', '');
  if (hash) {
    const [tab, queryString] = hash.split('?');
    const params = new URLSearchParams(queryString || '');
    const rawId = params.get('id');
    const assetId = rawId ? (isNaN(rawId) ? rawId : Number(rawId)) : null;
    if (tab) {
      return { tab, assetId };
    }
  }
  const savedTab = localStorage.getItem('activeTab') || 'dashboard';
  const savedAssetId = localStorage.getItem('selectedAssetId');
  return { 
    tab: savedTab, 
    assetId: savedAssetId ? (isNaN(savedAssetId) ? savedAssetId : Number(savedAssetId)) : null 
  };
};

export default function App() {
  const initialState = getInitialState();
  const [activeTab, setActiveTab] = useState(initialState.tab);
  const [selectedAssetId, setSelectedAssetId] = useState(initialState.assetId);
  
  // Default theme is LIGHT mode
  const [theme, setTheme] = useState('light');

  // Logged-in User Profile State
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('app_user_profile');
      return saved ? JSON.parse(saved) : { role: 'ADMIN' };
    } catch(e) {
      return { role: 'ADMIN' };
    }
  });

  // Permission Matrix State
  const [permissionMatrix, setPermissionMatrix] = useState(null);

  useEffect(() => {
    fetch('/api/permissions/matrix')
      .then(res => res.json())
      .then(data => {
        if (data && typeof data === 'object') setPermissionMatrix(data);
      })
      .catch(err => console.warn('Matrix fetch error:', err));
  }, []);

  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('app_authenticated') !== 'false';
  });

  const handleLoginSuccess = (userProfile) => {
    localStorage.setItem('app_authenticated', 'true');
    setCurrentUser(userProfile || { role: 'ADMIN' });
    setActiveTab('dashboard');
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.setItem('app_authenticated', 'false');
    setIsAuthenticated(false);
  };

  // Application Data States
  const [stats, setStats] = useState({
    totalAssets: 0,
    inUseAssets: 0,
    pendingDevices: 0,
    activeDrifts: 0,
    overdueMaintenance: 0,
    statusBreakdown: []
  });

  const [pending, setPending] = useState([]);
  const [assets, setAssets] = useState([]);
  const [drifts, setDrifts] = useState([]);
  const [logs, setLogs] = useState([]);
  const [maintenance, setMaintenance] = useState([]);
  const [metadata, setMetadata] = useState({ departments: [], locations: [], users: [], suppliers: [], assetTypes: [] });

  const [loading, setLoading] = useState(true);

  // Server Settings & Branding state
  const [serverSettings, setServerSettings] = useState(null);

  // Helper to update browser tab favicon dynamically
  const updateBrowserFavicon = (faviconUrl) => {
    if (!faviconUrl) return;
    try {
      let link = document.querySelector("link[rel*='icon']");
      if (!link) {
        link = document.createElement('link');
        link.rel = 'icon';
        document.getElementsByTagName('head')[0].appendChild(link);
      }
      link.href = faviconUrl;
    } catch (e) {
      console.error('Error updating favicon:', e);
    }
  };

  // Fetch data from backend API
  const fetchAllData = async () => {
    try {
      const [resStats, resPending, resAssets, resDrifts, resLogs, resMaint, resMeta, resSettings] = await Promise.all([
        fetch('/api/dashboard/stats').then(r => r.json()),
        fetch('/api/discovery').then(r => r.json()),
        fetch('/api/assets').then(r => r.json()),
        fetch('/api/drifts').then(r => r.json()),
        fetch('/api/lifecycle/logs').then(r => r.json()),
        fetch('/api/maintenance').then(r => r.json()),
        fetch('/api/assets/metadata').then(r => r.json()),
        fetch('/api/settings').then(r => r.json()).catch(() => null)
      ]);

      setStats(resStats);
      setPending(Array.isArray(resPending) ? resPending : []);
      setAssets(Array.isArray(resAssets) ? resAssets : []);
      setDrifts(Array.isArray(resDrifts) ? resDrifts : []);
      setLogs(Array.isArray(resLogs) ? resLogs : []);
      setMaintenance(Array.isArray(resMaint) ? resMaint : []);
      setMetadata(resMeta || { departments: [], locations: [], users: [], suppliers: [], assetTypes: [] });

      if (resSettings) {
        setServerSettings(resSettings);
        if (resSettings.orgInfo?.faviconUrl) {
          updateBrowserFavicon(resSettings.orgInfo.faviconUrl);
        }
      }
    } catch (err) {
      console.warn('API backend loading notice:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  // Sync activeTab and selectedAssetId to URL Hash & localStorage
  useEffect(() => {
    const targetHash = (activeTab === 'asset_detail' && selectedAssetId)
      ? `asset_detail?id=${selectedAssetId}`
      : activeTab;
    
    const currentHash = window.location.hash.replace('#', '');
    if (currentHash !== targetHash) {
      window.location.hash = targetHash;
    }
    
    localStorage.setItem('activeTab', activeTab);
    if (selectedAssetId) {
      localStorage.setItem('selectedAssetId', String(selectedAssetId));
    } else {
      localStorage.removeItem('selectedAssetId');
    }
  }, [activeTab, selectedAssetId]);

  // Listen to browser back/forward buttons & URL hash changes
  useEffect(() => {
    const handleHashChange = () => {
      const { tab, assetId } = getInitialState();
      if (tab) {
        setActiveTab(prev => (prev !== tab ? tab : prev));
      }
      setSelectedAssetId(prev => (String(prev) !== String(assetId) ? assetId : prev));
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const handleOpenAssetDetail = (id) => {
    setSelectedAssetId(id);
    setActiveTab('asset_detail');
  };

  const handleTriggerRealScan = async () => {
    try {
      await fetch('/api/agent/trigger-scan', { method: 'POST' });
      await fetchAllData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleApproveDevice = async (onboardPayload) => {
    try {
      const res = await fetch('/api/discovery/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(onboardPayload)
      });
      const data = await res.json();
      await fetchAllData();
      if (data.assetId) {
        handleOpenAssetDetail(data.assetId);
      } else {
        setActiveTab('assets');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleRejectDevice = async (pendingId) => {
    try {
      await fetch('/api/discovery/reject', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pendingId })
      });
      await fetchAllData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleResolveDrift = async (alertId, updateBaseline) => {
    try {
      await fetch(`/api/drifts/${alertId}/resolve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resolvedBy: 'IT Admin', updateBaseline })
      });
      await fetchAllData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleTransferAsset = async (transferPayload) => {
    try {
      await fetch('/api/lifecycle/transfer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(transferPayload)
      });
      await fetchAllData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleCompleteMaintenance = async (id, notes) => {
    try {
      await fetch(`/api/maintenance/${id}/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes })
      });
      await fetchAllData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleScanAudit = async (auditPayload) => {
    try {
      const res = await fetch('/api/audit/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(auditPayload)
      });
      return await res.json();
    } catch (err) {
      console.error(err);
      return { found: false, message: 'Lỗi kết nối máy chủ audit' };
    }
  };

  const isLight = theme === 'light';

  // Render Login Page if unauthenticated
  if (!isAuthenticated) {
    return (
      <Login 
        onLogin={handleLoginSuccess}
        systemInfo={serverSettings?.systemInfo}
        orgInfo={serverSettings?.orgInfo}
        theme={theme}
      />
    );
  }

  const userRole = currentUser?.role || 'ADMIN';

  const checkTabPermission = (tabId) => {
    if (!userRole || userRole === 'ADMIN') return true;
    if (!permissionMatrix || !permissionMatrix[userRole]) {
      if (userRole === 'STAFF' || userRole === 'VIEWER') {
        if (tabId === 'users_mgmt' || tabId === 'system_settings') return false;
      }
      return true;
    }
    const rolePerms = permissionMatrix[userRole];
    switch (tabId) {
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

  return (
    <div className={`min-h-screen flex font-['Mulish',sans-serif] transition-colors duration-200 ${
      isLight ? 'bg-slate-100 text-slate-800' : 'bg-slate-950 text-slate-100 dark'
    }`}>
      {/* Sidebar */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        pendingCount={pending.length} 
        alertCount={drifts.filter(d => d.is_resolved === 0).length} 
        theme={theme}
        orgInfo={serverSettings?.orgInfo}
        systemInfo={serverSettings?.systemInfo}
        userRole={userRole}
        permissionMatrix={permissionMatrix}
      />

      {/* Main Container (Fixed viewport height with persistent Header & Footer) */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        <Navbar 
          activeTab={activeTab} 
          setActiveTab={setActiveTab}
          pendingCount={pending.length} 
          alertCount={drifts.filter(d => d.is_resolved === 0).length} 
          theme={theme}
          setTheme={setTheme}
          onLogout={handleLogout}
          assets={assets}
          onSelectAsset={handleOpenAssetDetail}
        />

        <main className="p-8 flex-1 overflow-y-auto">
          {!checkTabPermission(activeTab) ? (
            <div className={`p-12 rounded-3xl border text-center space-y-4 max-w-xl mx-auto my-12 ${
              isLight ? 'bg-white border-slate-200 shadow-xl' : 'glass-card-dark border-slate-800'
            }`}>
              <div className="w-16 h-16 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center mx-auto">
                <ShieldAlert className="w-8 h-8" />
              </div>
              <h2 className="text-xl font-black text-rose-600 dark:text-rose-400">403 - Truy Cập Bị Từ Chối</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Tài khoản của bạn với vai trò <strong className="text-rose-600">{userRole}</strong> chưa được cấp quyền truy cập vào mục này trong Ma Trận Phân Quyền (RBAC). Vui lòng liên hệ Quản trị viên hệ thống.
              </p>
              <button
                onClick={() => setActiveTab('dashboard')}
                className="px-6 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow-lg shadow-cyan-600/20"
              >
                Quay Về Trang Tổng Quan
              </button>
            </div>
          ) : (
            <>
              {activeTab === 'dashboard' && (
                <Dashboard 
                  stats={stats} 
                  assets={assets}
                  drifts={drifts.filter(d => d.is_resolved === 0)} 
                  pending={pending} 
                  metadata={metadata}
                  setActiveTab={setActiveTab} 
                  theme={theme}
                />
              )}

              {activeTab === 'discovery' && (
                <DiscoveryQueue 
                  pending={pending} 
                  metadata={metadata} 
                  onApprove={handleApproveDevice} 
                  onReject={handleRejectDevice}
                  onTriggerScan={handleTriggerRealScan}
                  theme={theme}
                />
              )}

              {activeTab === 'assets' && (
                <AssetsList 
                  assets={assets} 
                  metadata={metadata} 
                  onRefresh={fetchAllData} 
                  theme={theme}
                  onSelectAsset={handleOpenAssetDetail}
                />
              )}

              {activeTab === 'asset_detail' && (
                <ErrorBoundary onReset={() => { setSelectedAssetId(null); setActiveTab('assets'); }}>
                  <AssetDetail 
                    assetId={selectedAssetId} 
                    onBack={() => {
                      setSelectedAssetId(null);
                      setActiveTab('assets');
                    }}
                    theme={theme}
                    onTransfer={handleTransferAsset}
                    onResolveDrift={handleResolveDrift}
                  />
                </ErrorBoundary>
              )}

              {activeTab === 'khoa_phong' && (
                <KhoaPhong 
                  theme={theme}
                />
              )}

              {activeTab === 'employees' && (
                <NhanVien 
                  theme={theme}
                />
              )}

              {activeTab === 'chuc_danh' && (
                <ChucDanh 
                  theme={theme}
                />
              )}

              {activeTab === 'loai_tai_san' && (
                <LoaiTaiSan 
                  theme={theme}
                />
              )}

              {activeTab === 'trang_thai' && (
                <TrangThaiTaiSan 
                  theme={theme}
                />
              )}

              {activeTab === 'nha_cung_cap' && (
                <NhaCungCap 
                  theme={theme}
                />
              )}

              {activeTab === 'kho_luu_tru' && (
                <KhoLuuTru 
                  theme={theme}
                  metadata={metadata}
                />
              )}

              {activeTab === 'users_mgmt' && (
                <UsersManagement theme={theme} metadata={metadata} />
              )}

              {activeTab === 'account_info' && (
                <UserProfile theme={theme} />
              )}

              {activeTab === 'system_settings' && (
                <SystemSettings 
                  theme={theme} 
                  onSettingsUpdated={(newSettings) => {
                    setServerSettings(newSettings);
                    if (newSettings.orgInfo?.faviconUrl) {
                      updateBrowserFavicon(newSettings.orgInfo.faviconUrl);
                    }
                  }} 
                />
              )}

              {activeTab === 'drift' && (
                <DriftAlerts 
                  drifts={drifts} 
                  onResolve={handleResolveDrift} 
                  theme={theme}
                />
              )}

              {activeTab === 'lifecycle' && (
                <LifecycleHistory 
                  logs={logs} 
                  assets={assets} 
                  metadata={metadata} 
                  onTransfer={handleTransferAsset} 
                  theme={theme}
                />
              )}

              {activeTab === 'maintenance' && (
                <MaintenanceAudit 
                  maintenance={maintenance} 
                  assets={assets} 
                  metadata={metadata} 
                  onCompleteMaintenance={handleCompleteMaintenance} 
                  onScanAudit={handleScanAudit} 
                  theme={theme}
                />
              )}
            </>
          )}
        </main>

        {/* Global Persistent Footer (Luôn hiển thị) */}
        <Footer theme={theme} systemInfo={serverSettings?.systemInfo} orgInfo={serverSettings?.orgInfo} />
      </div>
    </div>
  );
}
