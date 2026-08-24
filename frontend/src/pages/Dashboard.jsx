import React from 'react';
import { 
  Monitor, 
  UserCheck, 
  Radio, 
  AlertTriangle, 
  Clock, 
  Wrench,
  TrendingDown,
  CheckCircle2,
  ArrowRight,
  Layers,
  Laptop,
  Printer,
  Wifi,
  Building,
  Package,
  ChevronRight,
  PieChart as PieChartIcon
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

// Helper to map raw status codes to human-readable Vietnamese status labels
const formatStatusLabel = (rawStatus) => {
  if (!rawStatus) return 'Chưa phân loại';
  const s = String(rawStatus).toUpperCase().trim();
  
  if (s === 'NEW' || s.includes('MỚI')) {
    return 'Mới';
  }
  if (s === 'READY' || s === 'IN_STOCK' || s.includes('READY') || s.includes('SẴN SÀNG') || s.includes('KHO')) {
    return 'Sẵn Sàng Cấp Phát';
  }
  if (s === 'IN_USE' || s === 'USED' || s.includes('IN_USE') || s.includes('ĐANG SỬ DỤNG')) {
    return 'Đang Sử Dụng';
  }
  if (s === 'MAINTENANCE' || s === 'REPAIR' || s.includes('REPAIR') || s.includes('SỬA CHỮA') || s.includes('BẢO TRÌ')) {
    return 'Đang Bảo Trì';
  }
  if (s === 'DISPOSING' || s.includes('DISPOSING') || s.includes('THANH LÝ')) {
    return 'Thanh Lý';
  }
  if (s === 'DISPOSED' || s === 'SCRAPPED' || s.includes('DISPOSED') || s.includes('ĐÃ THANH LÝ')) {
    return 'Đã Thanh Lý';
  }

  return rawStatus;
};

// Exact status color mapping consistent with AssetsList badges
const STATUS_COLOR_MAP = {
  'Mới': '#3b82f6',                // Blue
  'Sẵn Sàng Cấp Phát': '#06b6d4',   // Cyan
  'Đang Sử Dụng': '#10b981',       // Emerald
  'Đang Bảo Trì': '#8b5cf6',        // Purple
  'Thanh Lý': '#f97316',            // Orange
  'Đã Thanh Lý': '#64748b',         // Slate
  'Chưa phân loại': '#94a3b8'
};

export default function Dashboard({ stats, assets = [], drifts = [], pending = [], metadata = {}, setActiveTab, theme }) {
  const isLight = theme === 'light';

  // 1. Compute accurate pie chart status breakdown from real assets array
  const pieData = React.useMemo(() => {
    if (assets && assets.length > 0) {
      const counts = {};
      assets.forEach(a => {
        const label = formatStatusLabel(a.status);
        counts[label] = (counts[label] || 0) + 1;
      });
      return Object.keys(counts).map(label => ({
        name: label,
        value: counts[label],
        color: STATUS_COLOR_MAP[label] || '#06b6d4'
      }));
    }

    // Fallback if assets array is empty
    return (stats.statusBreakdown || []).map(item => {
      const label = formatStatusLabel(item.status);
      return {
        name: label,
        value: item.count,
        color: STATUS_COLOR_MAP[label] || '#06b6d4'
      };
    });
  }, [assets, stats.statusBreakdown]);

  // 2. Compute 6 KPI Stats Card Counts
  const totalAssetsCount = assets.length || stats.totalAssets || 0;
  const pendingCount = pending.length || stats.pendingDevices || 0;
  const inUseCount = assets.filter(a => a.status === 'IN_USE').length;
  const maintenanceCount = assets.filter(a => a.status === 'MAINTENANCE').length;
  const disposalCount = assets.filter(a => a.status === 'DISPOSING' || a.status === 'DISPOSED').length;
  const driftCount = drifts.filter(d => d.is_resolved === 0).length;

  const kpiCards = [
    {
      title: 'Tổng Tài Sản',
      value: totalAssetsCount,
      icon: Monitor,
      accentGradient: 'from-cyan-500 via-blue-500 to-indigo-500',
      badgeBg: isLight ? 'bg-cyan-500/10 text-cyan-700 border-cyan-500/30' : 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
      cardBg: isLight ? 'bg-gradient-to-br from-cyan-500/10 via-blue-500/5 to-white border-cyan-200' : 'bg-gradient-to-br from-cyan-950/40 via-slate-900 to-slate-950 border-cyan-800/40',
      watermarkColor: 'text-cyan-500/10 dark:text-cyan-400/10',
      valueColor: isLight ? 'text-cyan-900' : 'text-cyan-300',
      action: () => setActiveTab('assets')
    },
    {
      title: 'Chờ Định Danh',
      value: pendingCount,
      icon: Radio,
      accentGradient: 'from-amber-500 via-orange-500 to-amber-600',
      badgeBg: isLight ? 'bg-amber-500/10 text-amber-700 border-amber-500/30' : 'bg-amber-500/20 text-amber-400 border-amber-500/30',
      cardBg: isLight ? 'bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-white border-amber-200' : 'bg-gradient-to-br from-amber-950/40 via-slate-900 to-slate-950 border-amber-800/40',
      watermarkColor: 'text-amber-500/10 dark:text-amber-400/10',
      valueColor: isLight ? 'text-amber-900' : 'text-amber-300',
      action: () => setActiveTab('discovery')
    },
    {
      title: 'Đang Sử Dụng',
      value: inUseCount,
      icon: UserCheck,
      accentGradient: 'from-emerald-500 via-teal-500 to-cyan-500',
      badgeBg: isLight ? 'bg-emerald-500/10 text-emerald-700 border-emerald-500/30' : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
      cardBg: isLight ? 'bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-white border-emerald-200' : 'bg-gradient-to-br from-emerald-950/40 via-slate-900 to-slate-950 border-emerald-800/40',
      watermarkColor: 'text-emerald-500/10 dark:text-emerald-400/10',
      valueColor: isLight ? 'text-emerald-900' : 'text-emerald-300',
      action: () => setActiveTab('assets')
    },
    {
      title: 'Đang Bảo Trì',
      value: maintenanceCount,
      icon: Wrench,
      accentGradient: 'from-purple-500 via-indigo-500 to-violet-500',
      badgeBg: isLight ? 'bg-purple-500/10 text-purple-700 border-purple-500/30' : 'bg-purple-500/20 text-purple-400 border-purple-500/30',
      cardBg: isLight ? 'bg-gradient-to-br from-purple-500/10 via-indigo-500/5 to-white border-purple-200' : 'bg-gradient-to-br from-purple-950/40 via-slate-900 to-slate-950 border-purple-800/40',
      watermarkColor: 'text-purple-500/10 dark:text-purple-400/10',
      valueColor: isLight ? 'text-purple-900' : 'text-purple-300',
      action: () => setActiveTab('assets')
    },
    {
      title: 'Thanh Lý',
      value: disposalCount,
      icon: TrendingDown,
      accentGradient: 'from-orange-500 via-amber-500 to-yellow-500',
      badgeBg: isLight ? 'bg-orange-500/10 text-orange-700 border-orange-500/30' : 'bg-orange-500/20 text-orange-400 border-orange-500/30',
      cardBg: isLight ? 'bg-gradient-to-br from-orange-500/10 via-amber-500/5 to-white border-orange-200' : 'bg-gradient-to-br from-orange-950/40 via-slate-900 to-slate-950 border-orange-800/40',
      watermarkColor: 'text-orange-500/10 dark:text-orange-400/10',
      valueColor: isLight ? 'text-orange-900' : 'text-orange-300',
      action: () => setActiveTab('assets')
    },
    {
      title: 'Cảnh Báo Biến Động',
      value: driftCount,
      icon: AlertTriangle,
      accentGradient: 'from-rose-500 via-red-500 to-pink-500',
      badgeBg: isLight ? 'bg-rose-500/10 text-rose-700 border-rose-500/30' : 'bg-rose-500/20 text-rose-400 border-rose-500/30',
      cardBg: isLight ? 'bg-gradient-to-br from-rose-500/10 via-red-500/5 to-white border-rose-200' : 'bg-gradient-to-br from-rose-950/40 via-slate-900 to-slate-950 border-rose-800/40',
      watermarkColor: 'text-rose-500/10 dark:text-rose-400/10',
      valueColor: isLight ? 'text-rose-900' : 'text-rose-300',
      action: () => setActiveTab('drift')
    }
  ];

  // 3. Asset Breakdown By Type
  const statsByType = React.useMemo(() => {
    let desktop = 0, laptop = 0, printer = 0, network = 0, monitor = 0;
    assets.forEach(a => {
      const type = (a.asset_type || '').toLowerCase();
      if (type.includes('desktop') || type.includes('bàn') || type.includes('pc')) desktop++;
      else if (type.includes('laptop') || type.includes('tay') || type.includes('notebook')) laptop++;
      else if (type.includes('in') || type.includes('printer') || type.includes('scanner') || type.includes('photo')) printer++;
      else if (type.includes('network') || type.includes('mạng') || type.includes('switch') || type.includes('router') || type.includes('server')) network++;
      else monitor++;
    });
    return { desktop, laptop, printer, network, monitor };
  }, [assets]);

  const assetTypeCategories = [
    { title: 'Máy Tính Để Bàn', desc: 'Desktop PC / Workstation', count: statsByType.desktop, icon: Monitor, color: 'text-cyan-600', bg: 'bg-cyan-500/10', bar: 'bg-cyan-500' },
    { title: 'Máy Tính Xách Tay', desc: 'Laptop / Notebook', count: statsByType.laptop, icon: Laptop, color: 'text-blue-600', bg: 'bg-blue-500/10', bar: 'bg-blue-500' },
    { title: 'Máy In & Scanner', desc: 'Printer / Photo / Scanner', count: statsByType.printer, icon: Printer, color: 'text-emerald-600', bg: 'bg-emerald-500/10', bar: 'bg-emerald-500' },
    { title: 'Thiết Bị Mạng & Server', desc: 'Router, Switch, Firewall, Server', count: statsByType.network, icon: Wifi, color: 'text-indigo-600', bg: 'bg-indigo-500/10', bar: 'bg-indigo-500' },
    { title: 'Màn Hình & Khác', desc: 'Monitors & Peripheral Assets', count: statsByType.monitor, icon: Package, color: 'text-purple-600', bg: 'bg-purple-500/10', bar: 'bg-purple-500' },
  ];

  // 4. Asset Breakdown By Department / Khoa / Phòng
  const departmentBreakdown = React.useMemo(() => {
    const deptMap = {};
    assets.forEach(a => {
      const deptName = a.department_name || a.phong_name || a.khoa_name || 'Kho IT Central (Chưa cấp phát)';
      if (!deptMap[deptName]) {
        deptMap[deptName] = {
          name: deptName,
          total: 0,
          inUse: 0,
          ready: 0,
          maintenance: 0,
          disposing: 0
        };
      }
      deptMap[deptName].total += 1;
      if (a.status === 'IN_USE') deptMap[deptName].inUse += 1;
      else if (a.status === 'MAINTENANCE') deptMap[deptName].maintenance += 1;
      else if (a.status === 'DISPOSING' || a.status === 'DISPOSED') deptMap[deptName].disposing += 1;
      else deptMap[deptName].ready += 1;
    });

    return Object.values(deptMap).sort((a, b) => b.total - a.total);
  }, [assets]);

  const cardClass = isLight ? 'glass-card-light' : 'glass-card-dark';

  return (
    <div className="space-y-6">
      {/* Action Toolbar Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className={`text-xl font-black tracking-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>
            Tổng Quan Hệ Thống Quản Lý Tài Sản IT
          </h2>
          <p className="text-xs text-slate-500 font-medium">Báo cáo real-time & thống kê phân bổ thiết bị công nghệ thông tin</p>
        </div>
        <button 
          onClick={() => setActiveTab('discovery')}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-extrabold text-xs shadow-lg shadow-cyan-600/20 flex items-center gap-2 transition transform hover:-translate-y-0.5 active:scale-95"
        >
          <Radio className="w-4 h-4" />
          Duyệt Thiết Bị Mới ({pendingCount}) <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* 6 Executive KPI Stats Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
        {kpiCards.map((card, i) => {
          const Icon = card.icon;
          return (
            <div 
              key={i} 
              onClick={card.action}
              className={`rounded-2xl border shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-1 overflow-hidden relative group select-none ${
                card.action ? 'cursor-pointer' : 'cursor-default'
              } ${card.cardBg}`}
            >
              {/* Top Accent Line */}
              <div className={`h-1.5 w-full bg-gradient-to-r ${card.accentGradient}`}></div>

              {/* Watermark Icon */}
              <Icon className={`absolute -right-3 -bottom-3 w-20 h-20 ${card.watermarkColor} transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6 pointer-events-none`} />

              {/* Card Body */}
              <div className="p-4 relative z-10 space-y-2">
                <div className="flex items-center justify-between gap-1">
                  <span className={`text-[11px] font-extrabold uppercase tracking-wider truncate ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                    {card.title}
                  </span>
                  <div className={`w-7 h-7 rounded-lg border flex items-center justify-center shrink-0 shadow-sm transition-transform duration-300 group-hover:scale-110 ${card.badgeBg}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                </div>

                <div className="flex items-baseline justify-between pt-1">
                  <span className={`text-2xl font-black tracking-tight ${card.valueColor}`}>
                    {card.value}
                  </span>
                  {card.action && (
                    <span className="text-[10px] font-bold text-cyan-600 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5">
                      Chi tiết &rarr;
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Content Grid: Cảnh báo biến động & Phân phối trạng thái biểu đồ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Cảnh Báo Biến Động Cấu Hình Mới Nhất */}
        <div className={`lg:col-span-2 ${cardClass} p-6 rounded-2xl space-y-4`}>
          <div className="flex items-center justify-between">
            <h3 className={`font-bold text-base flex items-center gap-2 ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>
              <AlertTriangle className="w-5 h-5 text-rose-500" /> Cảnh Báo Biến Động Cấu Hình Mới Nhất
            </h3>
            <button 
              onClick={() => setActiveTab('drift')}
              className="text-xs font-semibold text-cyan-600 hover:underline"
            >
              Xem tất cả ({drifts.length})
            </button>
          </div>

          <div className="space-y-3">
            {drifts.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-sm">
                <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-500/50 mb-2" />
                Không có cảnh báo biến động cấu hình nào chưa xử lý.
              </div>
            ) : (
              drifts.slice(0, 4).map((d) => (
                <div key={d.id} className={`p-4 rounded-xl border flex items-start justify-between gap-4 ${
                  isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-900/80 border-slate-800'
                }`}>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        d.severity === 'CRITICAL' ? 'bg-rose-500/20 text-rose-500 border border-rose-500/30' :
                        d.severity === 'HIGH' ? 'bg-amber-500/20 text-amber-600 border border-amber-500/30' :
                        'bg-blue-500/20 text-blue-600 border border-blue-500/30'
                      }`}>
                        {d.alert_type}
                      </span>
                      <span className={`text-xs font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>{d.asset_tag} ({d.hostname})</span>
                    </div>
                    <p className={`text-xs font-semibold ${isLight ? 'text-slate-800' : 'text-slate-300'}`}>{d.title}</p>
                    <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>{d.details}</p>
                  </div>
                  <button 
                    onClick={() => setActiveTab('drift')}
                    className={`px-3 py-1 rounded-lg text-xs font-medium shrink-0 ${
                      isLight ? 'bg-slate-200 hover:bg-slate-300 text-slate-700' : 'bg-slate-800 hover:bg-slate-700 text-cyan-400'
                    }`}
                  >
                    Xử lý
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Column: Biểu đồ Phân Phối Trạng Thái Tài Sản */}
        <div className="space-y-6">
          <div className={`${cardClass} p-6 rounded-2xl space-y-4`}>
            <h3 className={`font-bold text-base flex items-center gap-2 ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>
              <PieChartIcon className="w-5 h-5 text-cyan-600" /> Phân Phối Trạng Thái Tài Sản
            </h3>

            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={75}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value, name) => [`${value} tài sản`, name]} 
                    contentStyle={{ borderRadius: '12px', fontSize: '12px', fontWeight: 'bold' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Vietnamized Legend & Status Badges */}
            <div className={`grid grid-cols-2 gap-2 pt-3 border-t ${isLight ? 'border-slate-200' : 'border-slate-800'}`}>
              {pieData.map((item, idx) => (
                <div key={idx} className="flex items-center gap-2 text-xs">
                  <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: item.color }}></div>
                  <span className={`truncate font-semibold ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>{item.name}:</span>
                  <span className={`font-extrabold ${isLight ? 'text-slate-900' : 'text-white'}`}>{item.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Pending Telemetry Live Queue Overview */}
          <div className={`${cardClass} p-5 rounded-2xl space-y-3`}>
            <div className="flex items-center justify-between">
              <h4 className={`font-bold text-sm flex items-center gap-2 ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>
                <Radio className="w-4 h-4 text-amber-500" /> Telemetry Live Queue
              </h4>
              <span className="text-xs font-bold text-amber-600">{pendingCount} máy mới</span>
            </div>
            {pending.length > 0 ? (
              <div className={`p-3 rounded-xl border text-xs space-y-1 ${isLight ? 'bg-amber-50/50 border-amber-200' : 'bg-slate-900/80 border-slate-800'}`}>
                <p className="font-bold text-cyan-600">{pending[0].hostname}</p>
                <p className={isLight ? 'text-slate-600' : 'text-slate-400'}>OS: {pending[0].os_name}</p>
                <p className={isLight ? 'text-slate-600' : 'text-slate-400'}>MAC: {pending[0].mac_address}</p>
              </div>
            ) : (
              <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-500'}`}>Tất cả thiết bị Agent đã được định danh.</p>
            )}
          </div>
        </div>

      </div>

      {/* 3. THỐNG KÊ THEO LOẠI THIẾT BỊ & DANH MỤC */}
      <div className={`${cardClass} p-6 rounded-2xl space-y-4`}>
        <div className="flex items-center justify-between">
          <h3 className={`font-bold text-base flex items-center gap-2 ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>
            <Layers className="w-5 h-5 text-cyan-600" /> Thống Kê Theo Loại Thiết Bị & Danh Mục
          </h3>
          <span className="text-xs text-slate-500 font-bold">Tổng cộng: {totalAssetsCount} thiết bị</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {assetTypeCategories.map((cat, idx) => {
            const Icon = cat.icon;
            const percentage = totalAssetsCount > 0 ? Math.round((cat.count / totalAssetsCount) * 100) : 0;
            return (
              <div 
                key={idx} 
                className={`p-4 rounded-xl border flex flex-col justify-between space-y-3 transition transform hover:-translate-y-0.5 ${
                  isLight ? 'bg-slate-50/80 border-slate-200' : 'bg-slate-900/70 border-slate-800'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className={`w-9 h-9 rounded-xl ${cat.bg} ${cat.color} flex items-center justify-center font-bold`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className={`text-xl font-black ${cat.color}`}>{cat.count}</span>
                </div>

                <div>
                  <p className={`text-xs font-bold truncate ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>{cat.title}</p>
                  <p className="text-[10px] text-slate-400 truncate">{cat.desc}</p>
                </div>

                {/* Progress bar */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] font-bold text-slate-400">
                    <span>Tỷ lệ</span>
                    <span>{percentage}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div className={`h-full ${cat.bar} rounded-full`} style={{ width: `${percentage}%` }}></div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. DANH SÁCH TÀI SẢN THEO KHOA / PHÒNG BAN */}
      <div className={`${cardClass} p-6 rounded-2xl space-y-4`}>
        <div className="flex items-center justify-between">
          <div>
            <h3 className={`font-bold text-base flex items-center gap-2 ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>
              <Building className="w-5 h-5 text-emerald-600" /> Thống Kê & Phân Bổ Tài Sản Theo Khoa / Phòng Ban
            </h3>
            <p className="text-xs text-slate-500 font-medium">Danh sách thống kê số lượng tài sản IT phân bổ theo từng đơn vị sử dụng</p>
          </div>
          <button 
            onClick={() => setActiveTab('assets')}
            className="text-xs font-bold text-cyan-600 hover:underline flex items-center gap-1"
          >
            Quản lý tất cả tài sản <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className={`font-bold uppercase border-b ${
              isLight ? 'bg-slate-100/80 text-slate-600 border-slate-200' : 'bg-slate-900 text-slate-400 border-slate-800'
            }`}>
              <tr>
                <th className="px-4 py-3">Khoa / Phòng Ban</th>
                <th className="px-4 py-3 text-center">Tổng Tài Sản</th>
                <th className="px-4 py-3 text-center">Đang Sử Dụng</th>
                <th className="px-4 py-3 text-center">Sẵn Sàng / Lưu Kho</th>
                <th className="px-4 py-3 text-center">Đang Bảo Trì</th>
                <th className="px-4 py-3">Tỷ Lệ Phân Bổ</th>
                <th className="px-4 py-3 text-right">Thao Tác</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${isLight ? 'divide-slate-200 text-slate-700' : 'divide-slate-800 text-slate-300'}`}>
              {departmentBreakdown.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-6 text-center text-slate-400">
                    Chưa có dữ liệu phân bổ theo khoa/phòng.
                  </td>
                </tr>
              ) : (
                departmentBreakdown.map((dept, idx) => {
                  const sharePct = totalAssetsCount > 0 ? Math.round((dept.total / totalAssetsCount) * 100) : 0;
                  return (
                    <tr 
                      key={idx} 
                      onClick={() => setActiveTab('assets')}
                      className={`cursor-pointer transition ${isLight ? 'hover:bg-slate-50' : 'hover:bg-slate-900/50'}`}
                    >
                      <td className="px-4 py-3 font-bold flex items-center gap-2">
                        <Building className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span className={isLight ? 'text-slate-900' : 'text-white'}>{dept.name}</span>
                      </td>
                      <td className="px-4 py-3 text-center font-extrabold text-cyan-600">{dept.total}</td>
                      <td className="px-4 py-3 text-center font-bold text-emerald-600">{dept.inUse}</td>
                      <td className="px-4 py-3 text-center font-bold text-blue-600">{dept.ready}</td>
                      <td className="px-4 py-3 text-center font-bold text-purple-600">{dept.maintenance}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-24 h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                            <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${sharePct}%` }}></div>
                          </div>
                          <span className="font-bold text-[11px] text-slate-500">{sharePct}%</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className="text-cyan-600 font-bold hover:underline inline-flex items-center gap-0.5">
                          Xem chi tiết &rarr;
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
