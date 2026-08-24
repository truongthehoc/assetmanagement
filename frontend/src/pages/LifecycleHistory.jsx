import React, { useState, useMemo } from 'react';
import { 
  History, 
  ArrowRightLeft, 
  FileCheck2, 
  User, 
  Building, 
  MapPin, 
  Search, 
  Calendar, 
  X,
  Printer,
  QrCode,
  Filter,
  CheckCircle2,
  PackageCheck,
  Wrench,
  RotateCcw,
  Sparkles,
  ShieldCheck,
  ChevronRight,
  Eye,
  Laptop,
  UserCheck,
  FileText
} from 'lucide-react';
import HandoverVoucherModal from '../components/HandoverVoucherModal';

export default function LifecycleHistory({ logs = [], assets = [], metadata = { departments: [], locations: [], users: [] }, onTransfer, theme }) {
  // Drawer state
  const [transferDrawer, setTransferDrawer] = useState(false);
  const [assetId, setAssetId] = useState(assets[0]?.id || '');
  const [toUserId, setToUserId] = useState(metadata.users?.[0]?.id || '');
  const [toDeptId, setToDeptId] = useState(metadata.departments?.[0]?.id || '');
  const [toLocId, setToLocId] = useState(metadata.locations?.[0]?.id || '');
  const [action, setAction] = useState('TRANSFER');
  const [notes, setNotes] = useState('');

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState('ALL'); // ALL, INITIAL_ASSIGN, TRANSFER, RETURN_TO_STOCK, REPAIR
  const [selectedAssetId, setSelectedAssetId] = useState('ALL');
  const [activeViewTab, setActiveViewTab] = useState('LOGS'); // LOGS or BY_ASSET

  // Printable Handover Slip Modal state
  const [selectedSlipLog, setSelectedSlipLog] = useState(null);

  const isLight = theme === 'light';
  const cardClass = isLight ? 'glass-card-light' : 'glass-card-dark';

  // Submit transfer/handover form
  const handleTransferSubmit = (e) => {
    e.preventDefault();
    if (!assetId) return;

    const selectedAsset = assets.find(a => a.id === parseInt(assetId, 10)) || {};
    const selectedUser = metadata.users?.find(u => u.id === parseInt(toUserId, 10)) || {};
    const selectedDept = metadata.departments?.find(d => d.id === parseInt(toDeptId, 10)) || {};
    const selectedLoc = metadata.locations?.find(l => l.id === parseInt(toLocId, 10)) || {};

    onTransfer({
      assetId: parseInt(assetId, 10),
      toUserId: toUserId ? parseInt(toUserId, 10) : null,
      toDepartmentId: toDeptId ? parseInt(toDeptId, 10) : null,
      toLocationId: toLocId ? parseInt(toLocId, 10) : null,
      action,
      notes
    });

    // Auto open printable voucher slip modal
    setSelectedSlipLog({
      id: Math.floor(1000 + Math.random() * 9000),
      action,
      asset_tag: selectedAsset.asset_tag,
      hostname: selectedAsset.hostname,
      serial_number: selectedAsset.serial_number,
      model: selectedAsset.model,
      to_user_name: action === 'RETURN_TO_STOCK' || action === 'REVOKE' ? 'Kho IT Central' : (selectedUser.full_name || 'Cán Bộ Nhận'),
      from_user_name: selectedAsset.user_name || 'Kho IT Central',
      department_name: selectedDept.name || selectedAsset.department_name,
      location_name: selectedLoc.building ? `${selectedLoc.building} - ${selectedLoc.room}` : '',
      performed_by: 'IT Administrator',
      notes,
      created_at: new Date().toISOString()
    });

    setNotes('');
    setTransferDrawer(false);
  };

  // Calculate Statistics
  const stats = useMemo(() => {
    const total = logs.length;
    const initialAssign = logs.filter(l => l.action === 'INITIAL_ASSIGN').length;
    const transfer = logs.filter(l => l.action === 'TRANSFER' || l.action === 'HANDOVER').length;
    const returnStock = logs.filter(l => l.action === 'RETURN_TO_STOCK' || l.action === 'REVOKE').length;
    const repair = logs.filter(l => l.action === 'REPAIR' || l.action === 'MAINTENANCE').length;
    return { total, initialAssign, transfer, returnStock, repair };
  }, [logs]);

  // Filtered Logs
  const filteredLogs = useMemo(() => {
    return logs.filter(log => {
      // Search term
      const matchesSearch = !searchTerm ||
        (log.asset_tag && log.asset_tag.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (log.hostname && log.hostname.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (log.to_user_name && log.to_user_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (log.from_user_name && log.from_user_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (log.department_name && log.department_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (log.notes && log.notes.toLowerCase().includes(searchTerm.toLowerCase()));

      // Action Filter
      let matchesAction = true;
      if (actionFilter === 'INITIAL_ASSIGN') matchesAction = log.action === 'INITIAL_ASSIGN';
      else if (actionFilter === 'TRANSFER') matchesAction = log.action === 'TRANSFER' || log.action === 'HANDOVER';
      else if (actionFilter === 'RETURN_TO_STOCK') matchesAction = log.action === 'RETURN_TO_STOCK' || log.action === 'REVOKE';
      else if (actionFilter === 'REPAIR') matchesAction = log.action === 'REPAIR' || log.action === 'MAINTENANCE';

      // Asset Filter
      let matchesAsset = true;
      if (selectedAssetId !== 'ALL') {
        matchesAsset = String(log.asset_id) === String(selectedAssetId);
      }

      return matchesSearch && matchesAction && matchesAsset;
    });
  }, [logs, searchTerm, actionFilter, selectedAssetId]);

  // Group logs by Asset for "BY_ASSET" view
  const logsByAssetMap = useMemo(() => {
    const map = {};
    logs.forEach(log => {
      if (!map[log.asset_id]) {
        map[log.asset_id] = {
          asset_id: log.asset_id,
          asset_tag: log.asset_tag,
          hostname: log.hostname,
          history: []
        };
      }
      map[log.asset_id].history.push(log);
    });
    return Object.values(map);
  }, [logs]);

  // Helper function for action badge styling & text
  const getActionBadge = (actionType) => {
    switch (actionType) {
      case 'INITIAL_ASSIGN':
        return {
          label: 'CẤP MỚI LẦN ĐẦU',
          color: isLight ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',
          icon: PackageCheck
        };
      case 'TRANSFER':
      case 'HANDOVER':
        return {
          label: 'ĐIỀU CHUYỂN BÀN GIAO',
          color: isLight ? 'bg-cyan-50 border-cyan-200 text-cyan-700' : 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400',
          icon: ArrowRightLeft
        };
      case 'RETURN_TO_STOCK':
      case 'REVOKE':
        return {
          label: 'THU HỒI VỀ KHO',
          color: isLight ? 'bg-amber-50 border-amber-200 text-amber-700' : 'bg-amber-500/10 border-amber-500/30 text-amber-400',
          icon: RotateCcw
        };
      case 'REPAIR':
      case 'MAINTENANCE':
        return {
          label: 'BẢO HÀNH / SỬA CHỮA',
          color: isLight ? 'bg-rose-50 border-rose-200 text-rose-700' : 'bg-rose-500/10 border-rose-500/30 text-rose-400',
          icon: Wrench
        };
      default:
        return {
          label: actionType || 'BÀN GIAO',
          color: isLight ? 'bg-slate-100 border-slate-200 text-slate-700' : 'bg-slate-800 border-slate-700 text-slate-300',
          icon: FileCheck2
        };
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Header Banner */}
      <div className={`${cardClass} p-6 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-l-4 border-l-cyan-600`}>
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-cyan-500/10 text-cyan-600 border border-cyan-500/20">
              Asset Lifecycle Audit
            </span>
          </div>
          <h2 className={`text-2xl font-bold flex items-center gap-2 mt-1 ${isLight ? 'text-slate-900' : 'text-white'}`}>
            <History className="w-6 h-6 text-cyan-600" /> Truy Vấn & Vòng Đời Tài Sản
          </h2>
          <p className={`text-sm mt-1 max-w-2xl ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
            Theo dõi vết lịch sử luân chuyển, bàn giao cán bộ, thu hồi kho IT và xuất biên bản nghiệm thu chuẩn hóa doanh nghiệp.
          </p>
        </div>

        <button
          onClick={() => setTransferDrawer(true)}
          className="px-5 py-3 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs shadow-lg shadow-cyan-600/25 flex items-center gap-2 transition transform hover:-translate-y-0.5 shrink-0"
        >
          <ArrowRightLeft className="w-4 h-4" /> Tạo Lệnh Bàn Giao / Điều Chuyển
        </button>
      </div>

      {/* 2. Executive KPI Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {/* Card 1: Tất Cả */}
        <div 
          onClick={() => setActionFilter('ALL')}
          className={`${cardClass} p-4 rounded-2xl cursor-pointer transition-all duration-200 border-t-2 ${
            actionFilter === 'ALL' ? 'border-t-cyan-500 ring-2 ring-cyan-500/30' : 'border-t-transparent hover:border-t-slate-400'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className={`text-xs font-bold ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>Tổng Số Nhật Ký</span>
            <div className="w-8 h-8 rounded-xl bg-cyan-500/10 text-cyan-600 flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <p className={`text-2xl font-extrabold mt-2 ${isLight ? 'text-slate-900' : 'text-white'}`}>{stats.total}</p>
          <p className="text-[11px] text-cyan-600 font-semibold mt-1 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> Tất cả các vết
          </p>
        </div>

        {/* Card 2: Cấp Mới */}
        <div 
          onClick={() => setActionFilter('INITIAL_ASSIGN')}
          className={`${cardClass} p-4 rounded-2xl cursor-pointer transition-all duration-200 border-t-2 ${
            actionFilter === 'INITIAL_ASSIGN' ? 'border-t-emerald-500 ring-2 ring-emerald-500/30' : 'border-t-transparent hover:border-t-slate-400'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className={`text-xs font-bold ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>Cấp Mới Lần Đầu</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
              <PackageCheck className="w-4 h-4" />
            </div>
          </div>
          <p className={`text-2xl font-extrabold mt-2 ${isLight ? 'text-slate-900' : 'text-white'}`}>{stats.initialAssign}</p>
          <p className="text-[11px] text-emerald-600 font-semibold mt-1 flex items-center gap-1">
            <Sparkles className="w-3 h-3" /> Cấp phát ban đầu
          </p>
        </div>

        {/* Card 3: Điều Chuyển */}
        <div 
          onClick={() => setActionFilter('TRANSFER')}
          className={`${cardClass} p-4 rounded-2xl cursor-pointer transition-all duration-200 border-t-2 ${
            actionFilter === 'TRANSFER' ? 'border-t-cyan-500 ring-2 ring-cyan-500/30' : 'border-t-transparent hover:border-t-slate-400'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className={`text-xs font-bold ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>Điều Chuyển Bàn Giao</span>
            <div className="w-8 h-8 rounded-xl bg-cyan-500/10 text-cyan-600 flex items-center justify-center">
              <ArrowRightLeft className="w-4 h-4" />
            </div>
          </div>
          <p className={`text-2xl font-extrabold mt-2 ${isLight ? 'text-slate-900' : 'text-white'}`}>{stats.transfer}</p>
          <p className="text-[11px] text-cyan-600 font-semibold mt-1 flex items-center gap-1">
            <UserCheck className="w-3 h-3" /> Đổi người dùng
          </p>
        </div>

        {/* Card 4: Thu Hồi */}
        <div 
          onClick={() => setActionFilter('RETURN_TO_STOCK')}
          className={`${cardClass} p-4 rounded-2xl cursor-pointer transition-all duration-200 border-t-2 ${
            actionFilter === 'RETURN_TO_STOCK' ? 'border-t-amber-500 ring-2 ring-amber-500/30' : 'border-t-transparent hover:border-t-slate-400'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className={`text-xs font-bold ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>Thu Hồi Về Kho</span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
              <RotateCcw className="w-4 h-4" />
            </div>
          </div>
          <p className={`text-2xl font-extrabold mt-2 ${isLight ? 'text-slate-900' : 'text-white'}`}>{stats.returnStock}</p>
          <p className="text-[11px] text-amber-600 font-semibold mt-1 flex items-center gap-1">
            <ShieldCheck className="w-3 h-3" /> Trả về lưu kho IT
          </p>
        </div>

        {/* Card 5: Sửa Chữa */}
        <div 
          onClick={() => setActionFilter('REPAIR')}
          className={`${cardClass} p-4 rounded-2xl cursor-pointer transition-all duration-200 border-t-2 ${
            actionFilter === 'REPAIR' ? 'border-t-rose-500 ring-2 ring-rose-500/30' : 'border-t-transparent hover:border-t-slate-400'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className={`text-xs font-bold ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>Bảo Hành / Sửa Chữa</span>
            <div className="w-8 h-8 rounded-xl bg-rose-500/10 text-rose-600 flex items-center justify-center">
              <Wrench className="w-4 h-4" />
            </div>
          </div>
          <p className={`text-2xl font-extrabold mt-2 ${isLight ? 'text-slate-900' : 'text-white'}`}>{stats.repair}</p>
          <p className="text-[11px] text-rose-600 font-semibold mt-1 flex items-center gap-1">
            <Wrench className="w-3 h-3" /> Xử lý sự cố
          </p>
        </div>
      </div>

      {/* 3. Navigation View Switcher & Search Bar */}
      <div className={`${cardClass} p-4 rounded-2xl space-y-4`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          {/* View Tab Buttons */}
          <div className={`p-1 rounded-xl flex items-center gap-1 ${isLight ? 'bg-slate-100' : 'bg-slate-900'}`}>
            <button
              onClick={() => setActiveViewTab('LOGS')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-2 ${
                activeViewTab === 'LOGS'
                  ? 'bg-cyan-600 text-white shadow-md'
                  : isLight ? 'text-slate-600 hover:text-slate-900' : 'text-slate-400 hover:text-white'
              }`}
            >
              <History className="w-4 h-4" /> Nhật Ký Theo Dòng Thời Gian ({filteredLogs.length})
            </button>
            <button
              onClick={() => setActiveViewTab('BY_ASSET')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-2 ${
                activeViewTab === 'BY_ASSET'
                  ? 'bg-cyan-600 text-white shadow-md'
                  : isLight ? 'text-slate-600 hover:text-slate-900' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Laptop className="w-4 h-4" /> Tra Cứu Theo Từng Thiết Bị ({logsByAssetMap.length})
            </button>
          </div>

          {/* Search Box & Quick Asset Select */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Asset Select Dropdown */}
            <select
              value={selectedAssetId}
              onChange={(e) => setSelectedAssetId(e.target.value)}
              className={`border rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-cyan-500 ${
                isLight ? 'bg-slate-50 border-slate-200 text-slate-800' : 'bg-slate-900 border-slate-700 text-slate-200'
              }`}
            >
              <option value="ALL">🔍 Lọc theo tất cả thiết bị</option>
              {assets.map(a => (
                <option key={a.id} value={a.id}>
                  {a.asset_tag} - {a.hostname}
                </option>
              ))}
            </select>

            {/* Search Input */}
            <div className="relative w-full md:w-72">
              <Search className={`w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 ${isLight ? 'text-slate-400' : 'text-slate-400'}`} />
              <input
                type="text"
                placeholder="Tìm mã tài sản, tên người nhận, ghi chú..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full border rounded-xl pl-10 pr-9 py-2 text-xs focus:outline-none focus:border-cyan-500 ${
                  isLight ? 'bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-400' : 'bg-slate-900 border-slate-700 text-slate-200 placeholder-slate-500'
                }`}
              />
              {searchTerm && (
                <button 
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Action Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
          <span className={`text-[11px] font-bold uppercase tracking-wider mr-2 flex items-center gap-1 ${isLight ? 'text-slate-400' : 'text-slate-500'}`}>
            <Filter className="w-3.5 h-3.5" /> Bộ Lọc:
          </span>
          
          {[
            { id: 'ALL', label: 'Tất cả tác vụ' },
            { id: 'INITIAL_ASSIGN', label: 'Cấp mới lần đầu' },
            { id: 'TRANSFER', label: 'Điều chuyển bàn giao' },
            { id: 'RETURN_TO_STOCK', label: 'Thu hồi về kho' },
            { id: 'REPAIR', label: 'Bảo hành / Sửa chữa' },
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setActionFilter(f.id)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                actionFilter === f.id
                  ? 'bg-cyan-50 text-cyan-700 dark:bg-cyan-950/60 dark:text-cyan-400 border border-cyan-300 dark:border-cyan-700 font-bold'
                  : isLight ? 'bg-slate-100 text-slate-600 hover:bg-slate-200' : 'bg-slate-800/80 text-slate-400 hover:bg-slate-800'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* 4. Main Content Area */}
      {activeViewTab === 'LOGS' ? (
        /* TAB 1: LOG TIMELINE LIST */
        <div className={`${cardClass} rounded-2xl p-6 space-y-4`}>
          {filteredLogs.length === 0 ? (
            <div className="p-16 text-center space-y-3">
              <History className="w-12 h-12 text-slate-400 mx-auto animate-pulse" />
              <h3 className={`text-base font-bold ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                Không Tìm Thấy Nhật Ký Điều Chuyển Nào
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Không có dữ liệu nhật ký phù hợp với từ khóa hoặc bộ lọc đã chọn. Vui lòng thử lại với điều kiện tìm kiếm khác.
              </p>
            </div>
          ) : (
            filteredLogs.map((log) => {
              const badgeInfo = getActionBadge(log.action);
              const BadgeIcon = badgeInfo.icon;
              return (
                <div 
                  key={log.id} 
                  className={`p-5 rounded-2xl border flex flex-col lg:flex-row lg:items-center justify-between gap-5 transition-all duration-200 ${
                    isLight 
                      ? 'bg-white border-slate-200/90 hover:border-cyan-300 hover:shadow-md' 
                      : 'bg-slate-900/70 border-slate-800 hover:border-cyan-500/40 hover:bg-slate-900'
                  }`}
                >
                  {/* Left Column: Asset & Action Info */}
                  <div className="flex items-start gap-4 flex-1">
                    {/* Badge Icon Container */}
                    <div className="p-3 rounded-2xl bg-cyan-500/10 text-cyan-600 shrink-0 mt-0.5 border border-cyan-500/20">
                      <BadgeIcon className="w-6 h-6" />
                    </div>

                    <div className="space-y-2 flex-1 min-w-0">
                      {/* Asset Tag & Action Badges */}
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="px-3 py-1 rounded-lg text-xs font-mono font-extrabold bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-sm">
                          {log.asset_tag || 'AST-1001'}
                        </span>
                        <span className={`px-3 py-0.5 rounded-full text-[11px] font-bold border flex items-center gap-1.5 ${badgeInfo.color}`}>
                          <BadgeIcon className="w-3.5 h-3.5" />
                          {badgeInfo.label}
                        </span>
                      </div>

                      {/* Device Hostname */}
                      <h4 className={`font-bold text-base ${isLight ? 'text-slate-900' : 'text-white'}`}>
                        {log.hostname || 'Máy Trạm IT'}
                      </h4>

                      {/* Transfer Flow Visual Bar */}
                      <div className={`p-3 rounded-xl border flex flex-wrap items-center gap-3 text-xs ${
                        isLight ? 'bg-slate-50 border-slate-200 text-slate-700' : 'bg-slate-950/60 border-slate-800 text-slate-300'
                      }`}>
                        {/* Origin */}
                        <div className="flex items-center gap-1.5 font-medium">
                          <span className="text-[10px] font-bold uppercase text-slate-400">Từ:</span>
                          <span className="font-bold text-slate-600 dark:text-slate-300">
                            {log.from_user_name || 'Kho IT Central'}
                          </span>
                        </div>

                        <ArrowRight className="w-4 h-4 text-cyan-600 shrink-0" />

                        {/* Destination */}
                        <div className="flex items-center gap-1.5 font-medium">
                          <span className="text-[10px] font-bold uppercase text-slate-400">Đến:</span>
                          <span className="font-bold text-cyan-600 dark:text-cyan-400 flex items-center gap-1">
                            <User className="w-3.5 h-3.5" /> {log.to_user_name || 'Kho IT'}
                          </span>
                        </div>

                        {/* Department */}
                        {log.department_name && (
                          <div className="flex items-center gap-1.5 border-l pl-3 border-slate-300 dark:border-slate-700 text-slate-500">
                            <Building className="w-3.5 h-3.5 text-cyan-600" />
                            <span>{log.department_name}</span>
                          </div>
                        )}
                      </div>

                      {/* Log Notes */}
                      {log.notes && (
                        <p className={`text-xs italic pl-2 border-l-2 border-cyan-500/50 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                          "{log.notes}"
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Right Column: Date Timestamp & Print Slip Action */}
                  <div className="flex flex-row lg:flex-col items-center lg:items-end justify-between gap-3 shrink-0 pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-200 dark:border-slate-800">
                    <div className="text-xs text-right">
                      <span className={`font-semibold flex items-center justify-end gap-1.5 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                        <Calendar className="w-3.5 h-3.5 text-cyan-600" /> 
                        {new Date(log.created_at || Date.now()).toLocaleDateString('vi-VN')} {new Date(log.created_at || Date.now()).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      {log.performed_by && (
                        <span className="text-[11px] text-slate-400 block mt-0.5">
                          Thực hiện: <strong>{log.performed_by}</strong>
                        </span>
                      )}
                    </div>

                    <button
                      onClick={() => setSelectedSlipLog(log)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition flex items-center gap-1.5 shadow-sm ${
                        isLight 
                          ? 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-cyan-600 hover:text-white hover:border-cyan-600' 
                          : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-cyan-600 hover:text-white hover:border-cyan-600'
                      }`}
                    >
                      <Printer className="w-3.5 h-3.5" /> Xem / In Biên Bản
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      ) : (
        /* TAB 2: GROUPED BY ASSET VIEW */
        <div className="space-y-4">
          {logsByAssetMap.length === 0 ? (
            <div className={`${cardClass} p-12 rounded-2xl text-center text-slate-500`}>
              Không có dữ liệu tài sản.
            </div>
          ) : (
            logsByAssetMap.map((group) => (
              <div key={group.asset_id} className={`${cardClass} p-6 rounded-2xl space-y-4`}>
                <div className="flex items-center justify-between border-b pb-3 border-slate-200 dark:border-slate-800">
                  <div className="flex items-center gap-3">
                    <span className="px-3 py-1 rounded-lg text-xs font-mono font-extrabold bg-cyan-600 text-white">
                      {group.asset_tag}
                    </span>
                    <h3 className={`font-bold text-base ${isLight ? 'text-slate-900' : 'text-white'}`}>
                      {group.hostname}
                    </h3>
                  </div>
                  <span className="text-xs font-bold text-cyan-600 bg-cyan-50 dark:bg-cyan-950/60 px-3 py-1 rounded-full border border-cyan-200 dark:border-cyan-800">
                    {group.history.length} Lần Điều Chuyển
                  </span>
                </div>

                <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-cyan-500/30">
                  {group.history.map((hLog) => (
                    <div key={hLog.id} className="relative flex items-center justify-between gap-4">
                      {/* Node Bullet */}
                      <div className="absolute -left-6 w-3 h-3 rounded-full bg-cyan-500 border-2 border-white dark:border-slate-900"></div>

                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className={`text-xs font-bold px-2 py-0.5 rounded ${getActionBadge(hLog.action).color}`}>
                            {getActionBadge(hLog.action).label}
                          </span>
                          <span className="text-xs text-slate-400">
                            {new Date(hLog.created_at).toLocaleDateString('vi-VN')} {new Date(hLog.created_at).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className={`text-xs font-medium ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                          Bàn giao cho: <strong>{hLog.to_user_name || 'Kho IT'}</strong> {hLog.department_name && `(${hLog.department_name})`}
                        </p>
                        {hLog.notes && <p className="text-[11px] text-slate-400 italic">"{hLog.notes}"</p>}
                      </div>

                      <button
                        onClick={() => setSelectedSlipLog(hLog)}
                        className="px-2.5 py-1 text-[11px] font-bold text-cyan-600 hover:underline flex items-center gap-1"
                      >
                        <Printer className="w-3 h-3" /> In Biên Bản
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* 5. PRINTABLE HANDOVER & REVOCATION VOUCHER SLIP MODAL */}
      {selectedSlipLog && (
        <HandoverVoucherModal
          voucherData={selectedSlipLog}
          onClose={() => setSelectedSlipLog(null)}
          theme={theme}
        />
      )}

      {/* 6. RIGHT SLIDE-OVER DRAWER FOR HANDOVER & ASSET TRANSFER */}
      {transferDrawer && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity" onClick={() => setTransferDrawer(false)}></div>

          <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
            <div className={`w-screen max-w-md ${isLight ? 'bg-white text-slate-800' : 'bg-slate-900 text-slate-100'} shadow-2xl border-l ${isLight ? 'border-slate-200' : 'border-slate-800'} flex flex-col`}>
              
              {/* Drawer Header */}
              <div className={`p-6 border-b flex items-center justify-between ${isLight ? 'border-slate-200 bg-slate-50' : 'border-slate-800 bg-slate-950/50'}`}>
                <h3 className={`font-bold text-lg flex items-center gap-2 ${isLight ? 'text-slate-900' : 'text-white'}`}>
                  <ArrowRightLeft className="w-5 h-5 text-cyan-600" /> Lập Biên Bản Bàn Giao / Điều Chuyển
                </h3>
                <button onClick={() => setTransferDrawer(false)} className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Drawer Content Form */}
              <form onSubmit={handleTransferSubmit} className="flex-1 p-6 space-y-4 text-xs overflow-y-auto">
                <div className="space-y-1">
                  <label className={`font-bold flex items-center gap-1.5 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                    <Laptop className="w-3.5 h-3.5 text-cyan-600" /> Chọn Tài Sản Cần Điều Chuyển <span className="text-rose-500 font-extrabold">*</span>
                  </label>
                  <select
                    value={assetId}
                    onChange={(e) => setAssetId(e.target.value)}
                    className={`w-full border rounded-xl px-3.5 py-2.5 text-xs font-bold ${
                      isLight ? 'bg-slate-50 border-slate-300 text-slate-800' : 'bg-slate-950 border-slate-700 text-slate-200'
                    }`}
                  >
                    {assets.map(a => (
                      <option key={a.id} value={a.id}>
                        {a.asset_tag} - {a.hostname} ({a.user_name || 'Kho IT Central'})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className={`font-bold flex items-center gap-1.5 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                    <ArrowRightLeft className="w-3.5 h-3.5 text-cyan-600" /> Hình Thức Tác Vụ <span className="text-rose-500 font-extrabold">*</span>
                  </label>
                  <select
                    value={action}
                    onChange={(e) => setAction(e.target.value)}
                    className={`w-full border rounded-xl px-3.5 py-2.5 text-xs font-semibold ${
                      isLight ? 'bg-slate-50 border-slate-300 text-slate-800' : 'bg-slate-950 border-slate-700 text-slate-200'
                    }`}
                  >
                    <option value="TRANSFER">🔄 Bàn Giao / Điều Chuyển Cho Nhân Viên Mới</option>
                    <option value="RETURN_TO_STOCK">📥 Thu Hồi Trả Về Kho IT Central</option>
                    <option value="REPAIR">🔧 Gửi Đi Bảo Hành / Sửa Chữa Thiết Bị</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className={`font-bold flex items-center gap-1.5 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                    <User className="w-3.5 h-3.5 text-cyan-600" /> Người Tiếp Nhận Mới <span className="text-rose-500 font-extrabold">*</span>
                  </label>
                  <select
                    value={toUserId}
                    onChange={(e) => setToUserId(e.target.value)}
                    className={`w-full border rounded-xl px-3.5 py-2.5 text-xs ${
                      isLight ? 'bg-slate-50 border-slate-300 text-slate-800' : 'bg-slate-950 border-slate-700 text-slate-200'
                    }`}
                  >
                    {metadata.users?.map(u => (
                      <option key={u.id} value={u.id}>{u.full_name} ({u.employee_id || 'NV'}) - {u.email}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className={`font-bold flex items-center gap-1.5 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                    <Building className="w-3.5 h-3.5 text-cyan-600" /> Phòng Ban Tiếp Nhận <span className="text-rose-500 font-extrabold">*</span>
                  </label>
                  <select
                    value={toDeptId}
                    onChange={(e) => setToDeptId(e.target.value)}
                    className={`w-full border rounded-xl px-3.5 py-2.5 text-xs ${
                      isLight ? 'bg-slate-50 border-slate-300 text-slate-800' : 'bg-slate-950 border-slate-700 text-slate-200'
                    }`}
                  >
                    {metadata.departments?.map(d => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className={`font-bold flex items-center gap-1.5 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                    <MapPin className="w-3.5 h-3.5 text-cyan-600" /> Vị Trí Lắp Đặt / Sử Dụng <span className="text-rose-500 font-extrabold">*</span>
                  </label>
                  <select
                    value={toLocId}
                    onChange={(e) => setToLocId(e.target.value)}
                    className={`w-full border rounded-xl px-3.5 py-2.5 text-xs ${
                      isLight ? 'bg-slate-50 border-slate-300 text-slate-800' : 'bg-slate-950 border-slate-700 text-slate-200'
                    }`}
                  >
                    {metadata.locations?.map(l => (
                      <option key={l.id} value={l.id}>{l.building} - {l.floor} ({l.room})</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className={`font-bold flex items-center gap-1.5 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                    <FileText className="w-3.5 h-3.5 text-cyan-600" /> Ghi Chú Lịch Sử / Lý Do Điều Chuyển
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Nhập ghi chú lý do điều chuyển, tình trạng phần cứng khi bàn giao..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className={`w-full border rounded-xl px-3.5 py-2.5 text-xs ${
                      isLight ? 'bg-slate-50 border-slate-300 text-slate-800' : 'bg-slate-950 border-slate-700 text-slate-200'
                    }`}
                  />
                </div>

                {/* Drawer Footer Buttons */}
                <div className={`pt-4 border-t flex justify-end gap-3 mt-auto ${isLight ? 'border-slate-200' : 'border-slate-800'}`}>
                  <button
                    type="button"
                    onClick={() => setTransferDrawer(false)}
                    className={`px-5 py-2.5 rounded-xl font-bold ${
                      isLight ? 'bg-slate-100 text-slate-700 hover:bg-slate-200' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold shadow-lg shadow-cyan-600/20"
                  >
                    Lưu Biên Bản Bàn Giao
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
