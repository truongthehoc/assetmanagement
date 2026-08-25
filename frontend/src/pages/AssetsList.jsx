import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Search, 
  QrCode, 
  Printer, 
  ChevronRight,
  Wifi,
  History,
  Edit3,
  X,
  UserCheck,
  RotateCcw,
  Building2,
  MapPin,
  DollarSign,
  ChevronDown,
  User,
  Building,
  Lock,
  Upload,
  FileText,
  Paperclip,
  Plus,
  Calendar,
  Trash2,
  TrendingDown,
  Wrench,
  ShieldAlert,
  ArrowRightLeft,
  CheckCircle2,
  AlertTriangle,
  Package,
  Bot,
  PenTool,
  Monitor,
  Laptop,
  Layers,
  Server,
  Warehouse,
  Truck,
  Sparkles
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import HandoverVoucherModal from '../components/HandoverVoucherModal';
import { apiUrl } from '../utils/api';
import { useToast } from '../context/ToastContext';

// Custom Searchable Employee Combobox Select Component with Click-Outside Close Hook
function SearchableEmployeeSelect({ employees, value, onChange, placeholder, isLight }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const containerRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const selectedEmp = employees.find(e => e.id === parseInt(value, 10) || e.full_name === value || `${e.full_name} (${e.employee_id})` === value);
  const displayText = selectedEmp ? `${selectedEmp.full_name} (${selectedEmp.employee_id})` : (placeholder || '-- Chọn Nhân viên --');

  const filtered = employees.filter(e =>
    !search ||
    e.full_name.toLowerCase().includes(search.toLowerCase()) ||
    e.employee_id.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="relative" ref={containerRef}>
      {/* Clickable Display Input */}
      <div
        onClick={() => setOpen(!open)}
        className={`w-full border rounded-xl px-3.5 py-2.5 font-bold cursor-pointer flex items-center justify-between transition ${
          isLight ? 'bg-cyan-50/60 border-cyan-300 text-cyan-900 hover:border-cyan-400' : 'bg-slate-950 border-slate-700 text-cyan-400 hover:border-cyan-500'
        }`}
      >
        <span className="truncate">{displayText}</span>
        <ChevronDown className="w-4 h-4 text-cyan-600 shrink-0 ml-2" />
      </div>

      {/* Search Popover Dropdown */}
      {open && (
        <div className={`absolute left-0 right-0 top-full mt-1.5 z-50 rounded-xl border shadow-2xl p-2.5 space-y-2 ${
          isLight ? 'bg-white border-slate-200 text-slate-800' : 'bg-slate-900 border-slate-700 text-slate-100'
        }`}>
          {/* Search Box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              autoFocus
              placeholder="Nhập tên hoặc mã nhân viên để tìm..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={`w-full border rounded-lg pl-9 pr-3 py-2 text-xs font-semibold focus:outline-none focus:border-cyan-500 ${
                isLight ? 'bg-slate-50 border-slate-200 text-slate-800' : 'bg-slate-950 border-slate-800 text-slate-200'
              }`}
            />
          </div>

          {/* Options List */}
          <div className="max-h-48 overflow-y-auto space-y-1 text-xs">
            {filtered.length === 0 ? (
              <div className="p-3 text-center text-slate-400 italic">Không tìm thấy nhân viên phù hợp</div>
            ) : (
              filtered.map((emp) => (
                <div
                  key={emp.id}
                  onClick={() => {
                    onChange(emp.id);
                    setOpen(false);
                    setSearch('');
                  }}
                  className={`p-2.5 rounded-lg cursor-pointer transition font-bold flex items-center justify-between ${
                    (parseInt(value, 10) === emp.id)
                      ? 'bg-cyan-600 text-white shadow-md'
                      : (isLight ? 'hover:bg-slate-100 text-slate-800' : 'hover:bg-slate-800 text-slate-200')
                  }`}
                >
                  <span>{emp.full_name} ({emp.employee_id})</span>
                  {emp.position && <span className="text-[11px] opacity-75 font-semibold ml-2">{emp.position}</span>}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

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
        className={`w-full border rounded-xl pl-3.5 pr-10 py-2.5 font-bold cursor-pointer ${
          isLight ? 'bg-slate-50 border-slate-300 text-slate-800 hover:border-cyan-500' : 'bg-slate-950 border-slate-700 text-slate-200 hover:border-cyan-500'
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
        className="w-4 h-4 absolute right-3 cursor-pointer text-cyan-600 hover:text-cyan-500" 
      />
    </div>
  );
}

export default function AssetsList({ assets = [], metadata, onRefresh, theme, onSelectAsset }) {
  const { showToast } = useToast();
  const [filterStatus, setFilterStatus] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Dynamic Stats Computations for Asset Status & Asset Types
  const statsByStatus = useMemo(() => {
    const list = Array.isArray(assets) ? assets : [];
    const total = list.length;
    const ready = list.filter(a => a.status === 'READY' || a.status === 'NEW').length;
    const inUse = list.filter(a => a.status === 'IN_USE').length;
    const maintenance = list.filter(a => a.status === 'MAINTENANCE').length;
    const disposal = list.filter(a => a.status === 'DISPOSING' || a.status === 'DISPOSED').length;
    return { total, ready, inUse, maintenance, disposal };
  }, [assets]);

  const statsByType = useMemo(() => {
    const list = Array.isArray(assets) ? assets : [];
    let desktop = 0;
    let laptop = 0;
    let printer = 0;
    let network = 0;
    let monitor = 0;
    let other = 0;

    list.forEach(a => {
      const type = (a.asset_type || '').toLowerCase();
      if (type.includes('desktop') || type.includes('để bàn') || type.includes('máy tính pc')) {
        desktop++;
      } else if (type.includes('laptop') || type.includes('xách tay') || type.includes('notebook')) {
        laptop++;
      } else if (type.includes('in') || type.includes('print') || type.includes('scan') || type.includes('photo')) {
        printer++;
      } else if (type.includes('mạng') || type.includes('router') || type.includes('switch') || type.includes('server') || type.includes('wifi')) {
        network++;
      } else if (type.includes('màn hình') || type.includes('monitor') || type.includes('display')) {
        monitor++;
      } else {
        other++;
      }
    });

    return { desktop, laptop, printer, network, monitor, other };
  }, [assets]);
  const [printQrModal, setPrintQrModal] = useState(null);
  const [khoaList, setKhoaList] = useState([]);
  
  // Right Slide-Over Drawers State
  const [transferDrawerAsset, setTransferDrawerAsset] = useState(null);
  const [editDrawerAsset, setEditDrawerAsset] = useState(null);
  const [disposalDrawerAsset, setDisposalDrawerAsset] = useState(null);
  const [maintenanceDrawerAsset, setMaintenanceDrawerAsset] = useState(null);
  const [finishMaintenanceModalAsset, setFinishMaintenanceModalAsset] = useState(null);

  // Allocation Target Type: 'EMPLOYEE' (Nhân viên) or 'DEPARTMENT' (Phòng ban / Khoa)
  const [allocationTarget, setAllocationTarget] = useState('EMPLOYEE');

  // Handover / Revoke Form States
  const [toUserId, setToUserId] = useState('');
  const [toDepartmentId, setToDepartmentId] = useState('');
  const [toKhoaId, setToKhoaId] = useState('');
  const [toLocationId, setToLocationId] = useState('');
  const [transferNotes, setTransferNotes] = useState('');

  // Edit Procurement Form States
  const [editAssetTag, setEditAssetTag] = useState('');
  const [editHostname, setEditHostname] = useState('');
  const [editAssetType, setEditAssetType] = useState('Desktop');
  const [assetStatus, setAssetStatus] = useState('IN_USE');
  const [purchaseDate, setPurchaseDate] = useState('');
  const [purchaseCost, setPurchaseCost] = useState('');
  const [depreciationMonths, setDepreciationMonths] = useState('36');
  const [vendorSupplier, setVendorSupplier] = useState('');
  const [warrantyExpirationDate, setWarrantyExpirationDate] = useState('');
  const [assetNotes, setAssetNotes] = useState('');
  const [poFiles, setPoFiles] = useState([]);

  // Disposal Form States
  const [disposalStatus, setDisposalStatus] = useState('DISPOSING'); // DISPOSING or DISPOSED
  const [disposalValue, setDisposalValue] = useState('');
  const [disposalDate, setDisposalDate] = useState(new Date().toISOString().split('T')[0]);
  const [disposalBuyer, setDisposalBuyer] = useState('');
  const [disposalContractNo, setDisposalContractNo] = useState('');
  const [disposalReason, setDisposalReason] = useState('');
  const [disposalFiles, setDisposalFiles] = useState([]);

  // Maintenance / Repair Form States
  const [maintenanceType, setMaintenanceType] = useState('REPAIR'); // REPAIR or PREVENTIVE
  const [maintenanceVendor, setMaintenanceVendor] = useState('');
  const [maintenanceCost, setMaintenanceCost] = useState('');
  const [maintenanceStartDate, setMaintenanceStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [maintenanceEndDate, setMaintenanceEndDate] = useState('');
  const [maintenanceDescription, setMaintenanceDescription] = useState('');
  const [maintenanceFiles, setMaintenanceFiles] = useState([]);

  // Create Manual Asset Drawer States
  const [createManualDrawer, setCreateManualDrawer] = useState(false);
  const [mAssetTag, setMAssetTag] = useState('');
  const [mHostname, setMHostname] = useState('');
  const [mAssetType, setMAssetType] = useState('Máy In / Scanner');
  const [mSerialNumber, setMSerialNumber] = useState('');
  const [mIpAddress, setMIpAddress] = useState('');
  const [mOsInfo, setMOsInfo] = useState('');
  const [mRamTotalGb, setMRamTotalGb] = useState('');
  const [mDiskTotalGb, setMDiskTotalGb] = useState('');
  const [mCpuModel, setMCpuModel] = useState('');
  const [mDepartmentId, setMDepartmentId] = useState('');
  const [mUserId, setMUserId] = useState('');
  const [mLocationId, setMLocationId] = useState('');
  const [mStatus, setMStatus] = useState('READY');
  const [mPurchaseDate, setMPurchaseDate] = useState('');
  const [mPurchaseCost, setMPurchaseCost] = useState('');
  const [mDepreciationMonths, setMDepreciationMonths] = useState('36');
  const [mVendorSupplier, setMVendorSupplier] = useState('');
  const [mWarrantyExpirationDate, setMWarrantyExpirationDate] = useState('');
  const [mPoFiles, setMPoFiles] = useState([]);
  const [mNotes, setMNotes] = useState('');
  const [mWarehouseId, setMWarehouseId] = useState('');

  const [localMeta, setLocalMeta] = useState({
    departments: metadata?.departments || [],
    locations: metadata?.locations || [],
    users: metadata?.users || [],
    suppliers: metadata?.suppliers || [],
    warehouses: []
  });

  useEffect(() => {
    if (metadata && (metadata.departments?.length || metadata.users?.length)) {
      setLocalMeta(prev => ({
        ...prev,
        departments: metadata.departments || [],
        locations: metadata.locations || [],
        users: metadata.users || [],
        suppliers: metadata.suppliers || []
      }));
    }
  }, [metadata]);

  const fetchFreshMetadata = async () => {
    try {
      const [resMeta, resWh, resTypes] = await Promise.all([
        fetch(apiUrl('/api/assets/metadata')).then(r => r.json()),
        fetch(apiUrl('/api/kho-luu-tru')).then(r => r.json()),
        fetch(apiUrl('/api/loai-tai-san')).then(r => r.json())
      ]);
      const fresh = {
        departments: resMeta.departments || [],
        locations: resMeta.locations || [],
        users: resMeta.users || [],
        suppliers: resMeta.suppliers || [],
        warehouses: Array.isArray(resWh) ? resWh : [],
        assetTypes: Array.isArray(resTypes) ? resTypes : []
      };
      setLocalMeta(fresh);
      return fresh;
    } catch (err) {
      console.error(err);
      return null;
    }
  };

  const openCreateManualAssetDrawer = async () => {
    const fresh = await fetchFreshMetadata();
    const types = fresh?.assetTypes?.length ? fresh.assetTypes : (localMeta.assetTypes || []);
    const defaultType = types.length > 0 ? types[0].name : 'Máy In / Scanner / Photo';

    const count = assets.length + 1;
    setMAssetTag(`1000${36038 + count}`);
    setMHostname('');
    setMAssetType(defaultType);
    setMSerialNumber('');
    setMIpAddress('');
    setMOsInfo('');
    setMRamTotalGb('');
    setMDiskTotalGb('');
    setMCpuModel('');
    setMDepartmentId('');
    setMUserId('');
    setMLocationId('');
    setMWarehouseId('');
    setMStatus('READY');
    setMPurchaseDate('');
    setMPurchaseCost('');
    setMDepreciationMonths('36');
    setMVendorSupplier('');
    setMWarrantyExpirationDate('');
    setMPoFiles([]);
    setMNotes('');
    setCreateManualDrawer(true);
  };

  const handleCreateManualAssetSubmit = async (e) => {
    e.preventDefault();
    if (!mHostname.trim()) {
      showToast('Vui lòng nhập Tên máy / Thiết bị!', 'warning');
      return;
    }

    const poUrls = mPoFiles.map(f => f.name).join(', ');
    const selectedWh = (localMeta.warehouses || []).find(w => w.id === parseInt(mWarehouseId, 10));
    const warehouseName = selectedWh ? selectedWh.name : '';
    const finalAssetType = mAssetType || (localMeta.assetTypes?.[0]?.name) || 'Máy In / Scanner / Photo';

    try {
      const res = await fetch(apiUrl('/api/assets'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assetTag: mAssetTag,
          hostname: mHostname,
          assetType: finalAssetType,
          serialNumber: mSerialNumber,
          ipAddress: mIpAddress,
          osInfo: mOsInfo,
          ramTotalGb: mRamTotalGb,
          diskTotalGb: mDiskTotalGb,
          cpuModel: mCpuModel,
          departmentId: null,
          userId: null,
          locationId: null,
          warehouseId: mWarehouseId ? parseInt(mWarehouseId, 10) : null,
          warehouseName: warehouseName,
          status: mStatus,
          purchaseDate: mPurchaseDate,
          purchaseCost: mPurchaseCost,
          depreciationMonths: mDepreciationMonths,
          vendorSupplier: mVendorSupplier,
          warrantyExpirationDate: mWarrantyExpirationDate,
          poDocumentUrl: poUrls,
          notes: mNotes
        })
      });
      const data = await res.json();
      if (res.ok) {
        showToast('Khai báo tài sản thủ công mới thành công!', 'success');
        setCreateManualDrawer(false);
        if (onRefresh) await onRefresh();
      } else {
        showToast(data.error || 'Có lỗi xảy ra khi tạo tài sản thủ công', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Không thể kết nối đến máy chủ.', 'error');
    }
  };

  const isLight = theme === 'light';

  useEffect(() => {
    fetch(apiUrl('/api/khoa'))
      .then(r => r.json())
      .then(data => setKhoaList(Array.isArray(data) ? data : []))
      .catch(err => console.error(err));
  }, []);

  const filteredAssets = assets.filter(a => {
    const matchStatus = !filterStatus || a.status === filterStatus;
    const matchSearch = !searchTerm || 
      a.asset_tag.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.hostname.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (a.ip_address && a.ip_address.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (a.user_name && a.user_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (a.department_name && a.department_name.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchStatus && matchSearch;
  });

  // Currency Formatter Helpers
  const formatCurrency = (val) => {
    if (!val && val !== 0) return '';
    const cleanNumber = val.toString().replace(/\D/g, '');
    return cleanNumber ? parseInt(cleanNumber, 10).toLocaleString('vi-VN') : '';
  };

  const handlePurchaseCostInputChange = (e) => {
    const rawVal = e.target.value.replace(/\D/g, '');
    setPurchaseCost(rawVal);
  };

  const handleDisposalValueInputChange = (e) => {
    const rawVal = e.target.value.replace(/\D/g, '');
    setDisposalValue(rawVal);
  };

  const handleMaintenanceCostInputChange = (e) => {
    const rawVal = e.target.value.replace(/\D/g, '');
    setMaintenanceCost(rawVal);
  };

  // Multiple Files Upload Handler
  const handleMultipleFilesUpload = (e, setter) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      const newFiles = files.map(file => ({
        name: file.name,
        size: (file.size / 1024).toFixed(1) + ' KB',
        url: URL.createObjectURL(file)
      }));
      setter(prev => [...prev, ...newFiles]);
    }
  };

  const handleRemoveFile = (indexToRemove, setter) => {
    setter(prev => prev.filter((_, idx) => idx !== indexToRemove));
  };

  // Automatically update Department, Khoa and Location based on selected receiving employee
  const handleEmployeeSelectionChange = (newUserId) => {
    setToUserId(newUserId);
    const selectedEmp = metadata.users.find(u => u.id === parseInt(newUserId, 10));
    if (selectedEmp && selectedEmp.phong_id) {
      setToDepartmentId(selectedEmp.phong_id);
      
      const foundDept = metadata.departments.find(d => d.id === selectedEmp.phong_id);
      if (foundDept && foundDept.khoa_id) {
        setToKhoaId(foundDept.khoa_id);
      }

      const linkedLoc = metadata.locations.find(l => l.id === selectedEmp.phong_id || l.room === selectedEmp.phong_name);
      if (linkedLoc) {
        setToLocationId(linkedLoc.id);
      } else if (metadata.locations.length > 0) {
        setToLocationId(metadata.locations[0].id);
      }
    }
  };

  // Automatically update Khoa and Location based on selected Department
  const handleDepartmentSelectionChange = (newDeptId) => {
    setToDepartmentId(newDeptId);
    if (newDeptId) {
      const selectedDept = metadata.departments.find(d => d.id === parseInt(newDeptId, 10));
      if (selectedDept && selectedDept.khoa_id) {
        setToKhoaId(selectedDept.khoa_id);
      }
      const linkedLoc = metadata.locations.find(l => l.id === parseInt(newDeptId, 10) || l.room === selectedDept?.name);
      if (linkedLoc) {
        setToLocationId(linkedLoc.id);
      }
    }
  };

  const handleKhoaSelectionChange = (newKhoaId) => {
    setToKhoaId(newKhoaId);
  };

  // Open Action Drawer (Cấp Phát / Thu Hồi)
  const openActionDrawer = (asset, e) => {
    e.stopPropagation();
    setTransferDrawerAsset(asset);
    
    const isAllocation = !asset.status || asset.status === 'NEW' || asset.status === 'READY';
    setAllocationTarget('EMPLOYEE');

    if (isAllocation) {
      const defaultUser = metadata.users[0];
      const initialUserId = defaultUser?.id || '';
      setToUserId(initialUserId);
      if (defaultUser && defaultUser.phong_id) {
        setToDepartmentId(defaultUser.phong_id);
        const linkedLoc = metadata.locations.find(l => l.id === defaultUser.phong_id || l.room === defaultUser.phong_name);
        setToLocationId(linkedLoc ? linkedLoc.id : (metadata.locations[0]?.id || ''));
      } else {
        setToDepartmentId(metadata.departments[0]?.id || '');
        setToLocationId(metadata.locations[0]?.id || '');
      }
      setTransferNotes('Cấp phát tài sản sử dụng');
    } else {
      setToUserId('');
      setToDepartmentId(asset.department_id || metadata.departments[0]?.id || '');
      setToLocationId(metadata.locations[0]?.id || '');
      setTransferNotes('Thu hồi tài sản về kho IT Central');
    }
  };

  // Open Edit Procurement Drawer
  const openEditDrawer = (asset, e) => {
    e.stopPropagation();
    setEditDrawerAsset(asset);
    setEditAssetTag(asset.asset_tag || '');
    setEditHostname(asset.hostname || asset.asset_name || '');
    setEditAssetType(asset.asset_type || 'Desktop');
    setAssetStatus(asset.status || 'IN_USE');
    setPurchaseDate(asset.purchase_date ? asset.purchase_date.split('T')[0] : '');
    setPurchaseCost(asset.purchase_cost ? Math.round(asset.purchase_cost).toString() : '');
    setDepreciationMonths(asset.depreciation_months || 36);
    setVendorSupplier(asset.vendor_supplier || '');
    setWarrantyExpirationDate(asset.warranty_expiration_date ? asset.warranty_expiration_date.split('T')[0] : '');
    setAssetNotes(asset.notes || '');
    
    if (asset.po_document_url) {
      const parts = asset.po_document_url.split(',').filter(Boolean);
      setPoFiles(parts.map(p => ({ name: p.trim(), size: 'File đã lưu', url: p.trim() })));
    } else {
      setPoFiles([]);
    }
  };

  // Open Disposal Drawer (Thanh Lý)
  const openDisposalDrawer = (asset, e) => {
    e.stopPropagation();
    setDisposalDrawerAsset(asset);
    setDisposalStatus('DISPOSING');
    setDisposalValue('');
    setDisposalDate(new Date().toISOString().split('T')[0]);
    setDisposalBuyer('');
    setDisposalContractNo('');
    setDisposalReason('Tài sản hết hạn sử dụng / Hỏng hóc không thể phục hồi');
    setDisposalFiles([]);
  };

  // Open Maintenance Drawer (Bảo Trì / Sửa Chữa)
  const openMaintenanceDrawer = (asset, e) => {
    e.stopPropagation();
    setMaintenanceDrawerAsset(asset);
    setMaintenanceType('REPAIR');
    setMaintenanceVendor('Đội IT Internal');
    setMaintenanceCost('');
    setMaintenanceStartDate(new Date().toISOString().split('T')[0]);
    setMaintenanceEndDate('');
    setMaintenanceDescription('Bảo trì định kỳ / Sửa chữa hỏng hóc thiết bị');
    setMaintenanceFiles([]);
  };

  // Finish Maintenance & Restore Exact Previous Status
  const handleFinishMaintenance = async (asset, e) => {
    e.stopPropagation();
    setFinishMaintenanceModalAsset(asset);
  };

  const confirmFinishMaintenance = async () => {
    if (!finishMaintenanceModalAsset) return;
    
    // Restore logic: Restore EXACT previous_status before maintenance (e.g., READY, NEW, IN_USE)
    const restoredStatus = finishMaintenanceModalAsset.previous_status || 
                           ((finishMaintenanceModalAsset.user_id || finishMaintenanceModalAsset.department_id) ? 'IN_USE' : 'READY');

    try {
      await fetch(apiUrl(`/api/assets/${finishMaintenanceModalAsset.id}/procurement`), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: restoredStatus,
          notes: `[HOÀN TẤT BẢO TRÌ] Đã hoàn tất bảo trì/sửa chữa và khôi phục về trạng thái trước đó '${restoredStatus}'`
        })
      });
      setFinishMaintenanceModalAsset(null);
      if (onRefresh) await onRefresh();
    } catch (err) {
      console.error(err);
    }
  };

  // Submit Action (Cấp Phát or Thu Hồi)
  const handleActionSubmit = async (e) => {
    e.preventDefault();
    if (!transferDrawerAsset) return;

    const isAllocation = !transferDrawerAsset.status || transferDrawerAsset.status === 'NEW' || transferDrawerAsset.status === 'READY';
    const action = isAllocation ? 'TRANSFER' : 'REVOKE';

    // Validation for allocation target
    if (isAllocation && allocationTarget === 'EMPLOYEE' && (!toUserId || isNaN(parseInt(toUserId, 10)))) {
      showToast('Vui lòng chọn Nhân viên nhận bàn giao trước khi bấm lưu!', 'warning');
      return;
    }

    const parsedUserId = parseInt(toUserId, 10);
    const finalUserId = (isAllocation && allocationTarget === 'EMPLOYEE' && !isNaN(parsedUserId)) ? parsedUserId : null;
    
    const parsedDeptId = parseInt(toDepartmentId, 10);
    const finalDeptId = !isNaN(parsedDeptId) ? parsedDeptId : (metadata.departments[0]?.id || null);

    const parsedLocId = parseInt(toLocationId, 10);
    const finalLocId = !isNaN(parsedLocId) ? parsedLocId : (metadata.locations[0]?.id || null);

    try {
      const res = await fetch(apiUrl('/api/lifecycle/transfer'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assetId: transferDrawerAsset.id,
          action: action,
          toUserId: finalUserId,
          toDepartmentId: finalDeptId,
          toLocationId: finalLocId,
          notes: transferNotes || (allocationTarget === 'EMPLOYEE' ? 'Cấp phát cho cá nhân nhân viên' : 'Cấp phát dùng chung cho Phòng ban / Khoa')
        })
      });
      
      const data = await res.json();
      if (res.ok && data.status === 'success') {
        showToast(isAllocation ? 'Cấp phát tài sản thành công!' : 'Thu hồi tài sản thành công!', 'success');
        setTransferDrawerAsset(null);
        if (onRefresh) await onRefresh();
      } else {
        showToast(data.error || data.message || 'Lỗi khi thực hiện cấp phát / thu hồi', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Lỗi kết nối máy chủ: ' + err.message, 'error');
    }
  };

  // Submit Edit Procurement & Status
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editDrawerAsset) return;

    const fileListString = poFiles.map(f => f.name).join(',');

    try {
      const res = await fetch(apiUrl(`/api/assets/${editDrawerAsset.id}/procurement`), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assetTag: editAssetTag,
          hostname: editHostname,
          assetType: editAssetType,
          status: assetStatus,
          purchaseDate: purchaseDate || null,
          purchaseCost: purchaseCost ? parseFloat(purchaseCost) : null,
          depreciationMonths: depreciationMonths ? parseInt(depreciationMonths, 10) : 36,
          vendorSupplier: vendorSupplier || null,
          warrantyExpirationDate: warrantyExpirationDate || null,
          poDocumentUrl: fileListString || null,
          notes: assetNotes || null
        })
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        showToast('Cập nhật thông tin tài sản thành công!', 'success');
        setEditDrawerAsset(null);
        if (onRefresh) await onRefresh();
      } else {
        showToast(data.error || 'Có lỗi khi cập nhật tài sản!', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Lỗi kết nối máy chủ: ' + err.message, 'error');
    }
  };

  // Submit Disposal Form
  const handleDisposalSubmit = async (e) => {
    e.preventDefault();
    if (!disposalDrawerAsset) return;

    try {
      const res = await fetch(apiUrl(`/api/assets/${disposalDrawerAsset.id}/procurement`), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: disposalStatus,
          actionType: 'DISPOSAL',
          notes: `[THANH LÝ] Đối tác: ${disposalBuyer || 'Chưa chọn'} | Số HĐ: ${disposalContractNo || 'N/A'} | Giá trị thanh lý: ${disposalValue ? formatCurrency(disposalValue) + ' VNĐ' : '0 VNĐ'}. Lý do: ${disposalReason}`
        })
      });
      const data = await res.json();
      if (res.ok) {
        showToast('Làm thủ tục thanh lý tài sản thành công!', 'success');
        setDisposalDrawerAsset(null);
        if (onRefresh) await onRefresh();
      } else {
        showToast(data.error || 'Có lỗi xảy ra khi làm thủ tục thanh lý', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Lỗi kết nối máy chủ: ' + err.message, 'error');
    }
  };

  // Submit Maintenance Form
  const handleMaintenanceSubmit = async (e) => {
    e.preventDefault();
    if (!maintenanceDrawerAsset) return;

    try {
      const res = await fetch(apiUrl(`/api/assets/${maintenanceDrawerAsset.id}/procurement`), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'MAINTENANCE',
          actionType: 'MAINTENANCE',
          notes: `[BẢO TRÌ/SỬA CHỮA] Loại: ${maintenanceType === 'REPAIR' ? 'Sửa chữa hỏng hóc' : 'Bảo trì định kỳ'} | Đơn vị: ${maintenanceVendor} | Chi phí: ${maintenanceCost ? formatCurrency(maintenanceCost) + ' VNĐ' : '0 VNĐ'}. Mô tả: ${maintenanceDescription}`
        })
      });
      const data = await res.json();
      if (res.ok) {
        showToast('Chuyển tài sản sang trạng thái bảo trì thành công!', 'success');
        setMaintenanceDrawerAsset(null);
        if (onRefresh) await onRefresh();
      } else {
        showToast(data.error || 'Có lỗi xảy ra khi chuyển sang bảo trì', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Lỗi kết nối máy chủ: ' + err.message, 'error');
    }
  };

  const selectedEmployeeObj = metadata.users.find(u => u.id === parseInt(toUserId, 10));

  // 6 OFFICIAL ASSET STATUS BADGES
  const getStatusBadge = (status) => {
    switch (status) {
      case 'NEW':
        return <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold border whitespace-nowrap inline-block ${isLight ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-blue-500/10 border-blue-500/30 text-blue-400'}`}>Mới</span>;
      case 'READY':
        return <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold border whitespace-nowrap inline-block ${isLight ? 'bg-cyan-50 border-cyan-200 text-cyan-700' : 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400'}`}>Sẵn Sàng Cấp Phát</span>;
      case 'IN_USE':
        return <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold border whitespace-nowrap inline-block ${isLight ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'}`}>Đang Sử Dụng</span>;
      case 'MAINTENANCE':
        return <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold border whitespace-nowrap inline-block ${isLight ? 'bg-purple-50 border-purple-200 text-purple-700' : 'bg-purple-500/10 border-purple-500/30 text-purple-400'}`}>Đang Bảo Trì</span>;
      case 'DISPOSING':
        return <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold border whitespace-nowrap inline-block ${isLight ? 'bg-orange-50 border-orange-200 text-orange-700' : 'bg-orange-500/10 border-orange-500/30 text-orange-400'}`}>Thanh Lý</span>;
      case 'DISPOSED':
        return <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold border whitespace-nowrap inline-block ${isLight ? 'bg-slate-100 border-slate-300 text-slate-600' : 'bg-slate-800 border-slate-700 text-slate-400'}`}>Đã Thanh Lý</span>;
      default:
        return <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold border whitespace-nowrap inline-block ${isLight ? 'bg-slate-100 text-slate-600' : 'bg-slate-800 text-slate-400'}`}>{status}</span>;
    }
  };

  const getDisplayAssetType = (asset) => {
    return asset.asset_type || 'Thiết bị IT';
  };

  const cardClass = isLight ? 'glass-card-light' : 'glass-card-dark';

  return (
    <div className="space-y-6">
      
      {/* 1. EXECUTIVE ASSET STATS CARDS (Status & Asset Type Breakdown) */}
      <div className="space-y-4">
        
        {/* Row 1: Thống Kê Theo Trạng Thái Tài Sản (Asset Status) */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className={`text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
              <Package className="w-4 h-4 text-cyan-600" /> Thống Kê Theo Trạng Thái Tài Sản
            </h3>
            <span className="text-[11px] font-semibold text-cyan-600">Tổng cộng: {statsByStatus.total} tài sản</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {/* Total */}
            <div 
              onClick={() => setFilterStatus('')}
              className={`cursor-pointer relative overflow-hidden p-3.5 rounded-2xl border transition transform hover:-translate-y-0.5 hover:shadow-lg ${
                filterStatus === 'ALL_EXPLICIT' 
                  ? 'ring-2 ring-cyan-500 bg-cyan-50 dark:bg-cyan-950/60 border-cyan-300' 
                  : isLight ? 'bg-gradient-to-br from-cyan-500/10 via-blue-500/5 to-white border-cyan-200/80' : 'bg-gradient-to-br from-cyan-950/40 via-blue-950/20 to-slate-900 border-cyan-800/40'
              }`}
            >
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-500 to-blue-500"></div>
              <Package className="w-16 h-16 absolute -right-2 -bottom-2 text-cyan-500/10 pointer-events-none" />
              <div className="flex items-center justify-between relative z-10">
                <span className={`text-[11px] font-bold ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>Tất Cả Tài Sản</span>
                <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-cyan-600 to-blue-500 text-white flex items-center justify-center shadow-md shadow-cyan-500/25">
                  <Package className="w-3.5 h-3.5" />
                </div>
              </div>
              <p className="text-xl font-extrabold mt-1.5 text-cyan-600 dark:text-cyan-400 relative z-10">{statsByStatus.total}</p>
              <span className="text-[10px] text-cyan-600 dark:text-cyan-400 font-medium">Toàn bộ kho quản lý</span>
            </div>

            {/* Ready / New */}
            <div 
              onClick={() => setFilterStatus('READY')}
              className={`cursor-pointer relative overflow-hidden p-3.5 rounded-2xl border transition transform hover:-translate-y-0.5 hover:shadow-lg ${
                filterStatus === 'READY' 
                  ? 'ring-2 ring-cyan-500 bg-cyan-50 dark:bg-cyan-950/60 border-cyan-300' 
                  : isLight ? 'bg-gradient-to-br from-teal-500/10 via-emerald-500/5 to-white border-teal-200/80' : 'bg-gradient-to-br from-teal-950/40 via-emerald-950/20 to-slate-900 border-teal-800/40'
              }`}
            >
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-teal-500 to-emerald-500"></div>
              <CheckCircle2 className="w-16 h-16 absolute -right-2 -bottom-2 text-teal-500/10 pointer-events-none" />
              <div className="flex items-center justify-between relative z-10">
                <span className={`text-[11px] font-bold ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>Sẵn Sàng Cấp Phát</span>
                <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-teal-600 to-emerald-500 text-white flex items-center justify-center shadow-md shadow-teal-500/25">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </div>
              </div>
              <p className="text-xl font-extrabold mt-1.5 text-teal-600 dark:text-teal-400 relative z-10">{statsByStatus.ready}</p>
              <span className="text-[10px] text-teal-600 dark:text-teal-400 font-medium">Sẵn sàng bàn giao</span>
            </div>

            {/* In Use */}
            <div 
              onClick={() => setFilterStatus('IN_USE')}
              className={`cursor-pointer relative overflow-hidden p-3.5 rounded-2xl border transition transform hover:-translate-y-0.5 hover:shadow-lg ${
                filterStatus === 'IN_USE' 
                  ? 'ring-2 ring-emerald-500 bg-emerald-50 dark:bg-emerald-950/60 border-emerald-300' 
                  : isLight ? 'bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-white border-emerald-200/80' : 'bg-gradient-to-br from-emerald-950/40 via-teal-950/20 to-slate-900 border-emerald-800/40'
              }`}
            >
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-500"></div>
              <UserCheck className="w-16 h-16 absolute -right-2 -bottom-2 text-emerald-500/10 pointer-events-none" />
              <div className="flex items-center justify-between relative z-10">
                <span className={`text-[11px] font-bold ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>Đang Sử Dụng</span>
                <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center shadow-md shadow-emerald-500/25">
                  <UserCheck className="w-3.5 h-3.5" />
                </div>
              </div>
              <p className="text-xl font-extrabold mt-1.5 text-emerald-600 dark:text-emerald-400 relative z-10">{statsByStatus.inUse}</p>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">Đã cấp phát cán bộ</span>
            </div>

            {/* Maintenance */}
            <div 
              onClick={() => setFilterStatus('MAINTENANCE')}
              className={`cursor-pointer relative overflow-hidden p-3.5 rounded-2xl border transition transform hover:-translate-y-0.5 hover:shadow-lg ${
                filterStatus === 'MAINTENANCE' 
                  ? 'ring-2 ring-purple-500 bg-purple-50 dark:bg-purple-950/60 border-purple-300' 
                  : isLight ? 'bg-gradient-to-br from-purple-500/10 via-indigo-500/5 to-white border-purple-200/80' : 'bg-gradient-to-br from-purple-950/40 via-indigo-950/20 to-slate-900 border-purple-800/40'
              }`}
            >
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 to-indigo-500"></div>
              <Wrench className="w-16 h-16 absolute -right-2 -bottom-2 text-purple-500/10 pointer-events-none" />
              <div className="flex items-center justify-between relative z-10">
                <span className={`text-[11px] font-bold ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>Đang Bảo Trì</span>
                <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-purple-600 to-indigo-500 text-white flex items-center justify-center shadow-md shadow-purple-500/25">
                  <Wrench className="w-3.5 h-3.5" />
                </div>
              </div>
              <p className="text-xl font-extrabold mt-1.5 text-purple-600 dark:text-purple-400 relative z-10">{statsByStatus.maintenance}</p>
              <span className="text-[10px] text-purple-600 dark:text-purple-400 font-medium">Đang bảo dưỡng/sửa</span>
            </div>

            {/* Disposal */}
            <div 
              onClick={() => setFilterStatus('DISPOSING')}
              className={`cursor-pointer relative overflow-hidden p-3.5 rounded-2xl border transition transform hover:-translate-y-0.5 hover:shadow-lg ${
                filterStatus === 'DISPOSING' || filterStatus === 'DISPOSED'
                  ? 'ring-2 ring-orange-500 bg-orange-50 dark:bg-orange-950/60 border-orange-300' 
                  : isLight ? 'bg-gradient-to-br from-orange-500/10 via-amber-500/5 to-white border-orange-200/80' : 'bg-gradient-to-br from-orange-950/40 via-amber-950/20 to-slate-900 border-orange-800/40'
              }`}
            >
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-500 to-amber-500"></div>
              <TrendingDown className="w-16 h-16 absolute -right-2 -bottom-2 text-orange-500/10 pointer-events-none" />
              <div className="flex items-center justify-between relative z-10">
                <span className={`text-[11px] font-bold ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>Chờ / Đã Thanh Lý</span>
                <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-orange-600 to-amber-500 text-white flex items-center justify-center shadow-md shadow-orange-500/25">
                  <TrendingDown className="w-3.5 h-3.5" />
                </div>
              </div>
              <p className="text-xl font-extrabold mt-1.5 text-orange-600 dark:text-orange-400 relative z-10">{statsByStatus.disposal}</p>
              <span className="text-[10px] text-orange-600 dark:text-orange-400 font-medium">Xuất hủy/thanh lý</span>
            </div>
          </div>
        </div>

        {/* Row 2: Thống Kê Theo Loại Tài Sản (Asset Type Breakdown) */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className={`text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
              <Layers className="w-4 h-4 text-cyan-600" /> Thống Kê Theo Loại Thiết Bị & Danh Mục
            </h3>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {/* Desktop */}
            <div className={`relative overflow-hidden p-3 rounded-xl border flex items-center justify-between ${
              isLight ? 'bg-slate-50/80 border-slate-200 text-slate-800' : 'bg-slate-900/80 border-slate-800 text-slate-200'
            }`}>
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-cyan-500/10 text-cyan-600 flex items-center justify-center font-bold">
                  <Monitor className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[11px] font-bold">Máy Tính Để Bàn</p>
                  <p className="text-[10px] text-slate-400">Desktop PC</p>
                </div>
              </div>
              <span className="text-base font-extrabold text-cyan-600 dark:text-cyan-400">{statsByType.desktop}</span>
            </div>

            {/* Laptop */}
            <div className={`relative overflow-hidden p-3 rounded-xl border flex items-center justify-between ${
              isLight ? 'bg-slate-50/80 border-slate-200 text-slate-800' : 'bg-slate-900/80 border-slate-800 text-slate-200'
            }`}>
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-600 flex items-center justify-center font-bold">
                  <Laptop className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[11px] font-bold">Máy Tính Xách Tay</p>
                  <p className="text-[10px] text-slate-400">Laptop / Notebook</p>
                </div>
              </div>
              <span className="text-base font-extrabold text-blue-600 dark:text-blue-400">{statsByType.laptop}</span>
            </div>

            {/* Printers / Scanners */}
            <div className={`relative overflow-hidden p-3 rounded-xl border flex items-center justify-between ${
              isLight ? 'bg-slate-50/80 border-slate-200 text-slate-800' : 'bg-slate-900/80 border-slate-800 text-slate-200'
            }`}>
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold">
                  <Printer className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[11px] font-bold">Máy In & Scanner</p>
                  <p className="text-[10px] text-slate-400">Printer / Photo</p>
                </div>
              </div>
              <span className="text-base font-extrabold text-emerald-600 dark:text-emerald-400">{statsByType.printer}</span>
            </div>

            {/* Network & Servers */}
            <div className={`relative overflow-hidden p-3 rounded-xl border flex items-center justify-between ${
              isLight ? 'bg-slate-50/80 border-slate-200 text-slate-800' : 'bg-slate-900/80 border-slate-800 text-slate-200'
            }`}>
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-600 flex items-center justify-center font-bold">
                  <Wifi className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[11px] font-bold">Thiết Bị Mạng & Server</p>
                  <p className="text-[10px] text-slate-400">Router, Switch, Server</p>
                </div>
              </div>
              <span className="text-base font-extrabold text-indigo-600 dark:text-indigo-400">{statsByType.network}</span>
            </div>

            {/* Monitors & Displays */}
            <div className={`relative overflow-hidden p-3 rounded-xl border flex items-center justify-between ${
              isLight ? 'bg-slate-50/80 border-slate-200 text-slate-800' : 'bg-slate-900/80 border-slate-800 text-slate-200'
            }`}>
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-600 flex items-center justify-center font-bold">
                  <Monitor className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[11px] font-bold">Màn Hình & Khác</p>
                  <p className="text-[10px] text-slate-400">Monitors & Other</p>
                </div>
              </div>
              <span className="text-base font-extrabold text-purple-600 dark:text-purple-400">{statsByType.monitor + statsByType.other}</span>
            </div>
          </div>
        </div>

      </div>

      {/* Top Filter Bar */}
      <div className={`${cardClass} p-4 rounded-2xl`}>
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Search */}
          <div className="relative w-full md:w-80">
            <Search className={`w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 ${isLight ? 'text-slate-400' : 'text-slate-400'}`} />
            <input
              type="text"
              placeholder="Tìm theo Mã tài sản, IP, Máy trạm, Người dùng..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full border rounded-xl pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-cyan-500 ${
                isLight ? 'bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-400' : 'bg-slate-900 border-slate-700 text-slate-200 placeholder-slate-500'
              }`}
            />
          </div>

          {/* Right Action: Create Manual Asset Button */}
          <button
            onClick={openCreateManualAssetDrawer}
            className="w-full md:w-auto px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow-md shadow-cyan-600/20 flex items-center justify-center gap-2 transition shrink-0"
          >
            <Plus className="w-4 h-4" /> Thêm Tài Sản Thủ Công
          </button>
        </div>
      </div>

      {/* Assets Table */}
      <div className={`${cardClass} rounded-2xl overflow-hidden`}>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className={`text-xs font-bold uppercase border-b ${
              isLight ? 'bg-slate-100/80 text-slate-600 border-slate-200' : 'bg-slate-900/90 text-slate-400 border-slate-800'
            }`}>
              <tr>
                <th className="px-6 py-4 whitespace-nowrap">Mã Tài Sản / QR</th>
                <th className="px-6 py-4 whitespace-nowrap">Tên Máy & Địa Chỉ IP</th>
                <th className="px-6 py-4 whitespace-nowrap">Loại Tài Sản</th>
                <th className="px-6 py-4 whitespace-nowrap">Cấu Hình (RAM/Disk/CPU)</th>
                <th className="px-6 py-4 whitespace-nowrap">Bộ Phận & Người Dùng</th>
                <th className="px-6 py-4 whitespace-nowrap">Vị Trí</th>
                <th className="px-6 py-4 whitespace-nowrap">Trạng Thái</th>
                <th className="px-6 py-4 text-right whitespace-nowrap">Thao Tác</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${isLight ? 'divide-slate-200 text-slate-700' : 'divide-slate-800/80 text-slate-300'}`}>
              {filteredAssets.map((asset) => {
                const isAllocation = !asset.status || asset.status === 'NEW' || asset.status === 'READY';
                const isMaintenance = asset.status === 'MAINTENANCE';

                return (
                  <tr 
                    key={asset.id} 
                    onClick={() => onSelectAsset(asset.id)}
                    className={`cursor-pointer transition ${isLight ? 'hover:bg-cyan-50/60' : 'hover:bg-slate-900/70'}`}
                    title="Click dòng này để xem trang thông tin chi tiết tài sản"
                  >
                    {/* Asset Tag & QR */}
                    <td className={`px-6 py-4 font-mono font-bold ${isLight ? 'text-cyan-700' : 'text-cyan-400'}`}>
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            setPrintQrModal(asset);
                          }}
                          className={`p-1 rounded transition ${
                            isLight ? 'bg-slate-100 text-slate-600 hover:bg-cyan-600 hover:text-white' : 'bg-slate-800 text-slate-400 hover:bg-cyan-500 hover:text-slate-950'
                          }`}
                          title="Xem / In Tem Mã QR"
                        >
                          <QrCode className="w-4 h-4" />
                        </button>
                        <span>{asset.asset_tag}</span>
                      </div>
                      <div className="mt-1 flex items-center">
                        {asset.agent_id ? (
                          <span 
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold border whitespace-nowrap ${
                              isLight ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-blue-950/60 border-blue-800 text-blue-300'
                            }`}
                            title="Thu thập & khởi tạo tự động từ Agent Discovery"
                          >
                            <Bot className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                            Quét tự động
                          </span>
                        ) : (
                          <span 
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold border whitespace-nowrap ${
                              isLight ? 'bg-amber-50 border-amber-200 text-amber-800' : 'bg-amber-950/60 border-amber-800 text-amber-300'
                            }`}
                            title="Khởi tạo thủ công bởi IT Admin"
                          >
                            <PenTool className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                            Thêm thủ công
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Hostname & IP */}
                    <td className="px-6 py-4">
                      <p className={`font-bold font-mono ${isLight ? 'text-slate-900' : 'text-white'}`}>{asset.hostname}</p>
                      <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-1">
                        {asset.ip_address ? (
                          <>
                            <Wifi className="w-3 h-3 text-emerald-600" />
                            <span className="font-mono font-bold text-emerald-600">{asset.ip_address}</span>
                          </>
                        ) : (
                          <span className="text-slate-400 italic">Chưa kết nối IP</span>
                        )}
                      </p>
                    </td>

                    {/* Column 3: LOẠI TÀI SẢN */}
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold border ${
                        isLight ? 'bg-cyan-50 border-cyan-200 text-cyan-800' : 'bg-cyan-950/60 border-cyan-800 text-cyan-300'
                      }`}>
                        <Package className="w-3.5 h-3.5 text-cyan-600 shrink-0" />
                        {getDisplayAssetType(asset)}
                      </span>
                    </td>

                    {/* Hardware Specs */}
                    <td className="px-6 py-4">
                      {asset.ram_total_gb || asset.disk_total_gb ? (
                        <>
                          <p className={`font-bold ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>
                            {asset.ram_total_gb ? `${asset.ram_total_gb}GB RAM` : ''} 
                            {asset.ram_total_gb && asset.disk_total_gb ? ' | ' : ''}
                            {asset.disk_total_gb ? `${asset.disk_total_gb}GB Storage` : ''}
                          </p>
                          <p className={`text-xs truncate max-w-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>{asset.cpu_model || ''}</p>
                        </>
                      ) : (
                        <p className="text-xs text-slate-400 italic font-medium">Không áp dụng RAM/Ổ cứng</p>
                      )}
                    </td>

                    {/* Department & User Display (Dùng cho Cá Nhân hoặc Dùng Cho Phòng Ban) */}
                    <td className="px-6 py-4">
                      {asset.user_name ? (
                        <div>
                          <p className={`font-bold flex items-center gap-1 ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>
                            <User className="w-3.5 h-3.5 text-cyan-600" /> {asset.user_name}
                          </p>
                          <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>{asset.department_name || 'Không xác định'}</p>
                        </div>
                      ) : (
                        <div>
                          <p className={`font-bold flex items-center gap-1 text-cyan-700 dark:text-cyan-400`}>
                            <Building className="w-3.5 h-3.5 text-cyan-600" /> {asset.department_name ? `Phòng / Khoa: ${asset.department_name}` : 'Chưa gán'}
                          </p>
                          <p className={`text-[11px] italic ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                            {asset.department_name ? 'Dùng chung phòng ban' : 'Không xác định'}
                          </p>
                        </div>
                      )}
                    </td>

                    {/* Location Column Header: VỊ TRÍ */}
                    <td className={`px-6 py-4 text-xs ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>
                      {asset.phong_name || asset.room_name ? (
                        <div>
                          <p className="font-bold">{asset.phong_name || asset.room_name}</p>
                          <p className="text-[11px] opacity-75">{asset.location_address || asset.location_building || asset.khoa_name || 'Vị trí phòng'}</p>
                        </div>
                      ) : asset.khoa_name || asset.department_name ? (
                        <div>
                          <p className="font-bold text-cyan-700 dark:text-cyan-400">{asset.khoa_name || asset.department_name}</p>
                          <p className="text-[11px] opacity-75">(Theo Khoa / Đơn vị)</p>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">Chưa gán vị trí (Lưu kho)</span>
                      )}
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(asset.status)}
                    </td>

                    {/* DYNAMIC ICON ACTION BUTTONS */}
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                        {/* DYNAMIC FIRST ICON BUTTON BASED ON STATUS */}
                        {isMaintenance ? (
                          /* ICON BUTTON 1: BẢO TRÌ XONG (CYAN / TEAL) */
                          <button
                            onClick={(e) => handleFinishMaintenance(asset, e)}
                            className={`p-2 rounded-xl border transition shadow-sm ${
                              isLight 
                                ? 'bg-cyan-50 border-cyan-200 text-cyan-700 hover:bg-cyan-600 hover:text-white hover:border-cyan-600' 
                                : 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400 hover:bg-cyan-500 hover:text-slate-950'
                            }`}
                            title="Xác nhận hoàn tất bảo trì / sửa chữa"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                          </button>
                        ) : isAllocation ? (
                          /* ICON BUTTON 1: CẤP PHÁT (EMERALD GREEN) */
                          <button
                            onClick={(e) => openActionDrawer(asset, e)}
                            className={`p-2 rounded-xl border transition shadow-sm ${
                              isLight 
                                ? 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-600 hover:text-white hover:border-emerald-600' 
                                : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500 hover:text-slate-950'
                            }`}
                            title="Cấp phát tài sản cho Nhân viên hoặc Phòng/Khoa"
                          >
                            <UserCheck className="w-4 h-4" />
                          </button>
                        ) : (
                          /* ICON BUTTON 1: THU HỒI (ROSE RED) */
                          <button
                            onClick={(e) => openActionDrawer(asset, e)}
                            className={`p-2 rounded-xl border transition shadow-sm ${
                              isLight 
                                ? 'bg-rose-50 border-rose-200 text-rose-700 hover:bg-rose-600 hover:text-white hover:border-rose-600' 
                                : 'bg-rose-500/10 border-rose-500/30 text-rose-400 hover:bg-rose-500 hover:text-slate-950'
                            }`}
                            title="Thu hồi tài sản về kho IT Central"
                          >
                            <RotateCcw className="w-4 h-4" />
                          </button>
                        )}



                        {/* ICON BUTTON 3: THANH LÝ (ORANGE) */}
                        <button
                          onClick={(e) => openDisposalDrawer(asset, e)}
                          className={`p-2 rounded-xl border transition shadow-sm ${
                            isLight 
                              ? 'bg-orange-50 border-orange-200 text-orange-700 hover:bg-orange-600 hover:text-white hover:border-orange-600' 
                              : 'bg-orange-500/10 border-orange-500/30 text-orange-400 hover:bg-orange-500 hover:text-slate-950'
                          }`}
                          title="Thủ tục thanh lý tài sản"
                        >
                          <TrendingDown className="w-4 h-4" />
                        </button>

                        {/* ICON BUTTON 4: BẢO TRÌ / SỬA CHỮA (PURPLE) */}
                        <button
                          onClick={(e) => openMaintenanceDrawer(asset, e)}
                          className={`p-2 rounded-xl border transition shadow-sm ${
                            isLight 
                              ? 'bg-purple-50 border-purple-200 text-purple-700 hover:bg-purple-600 hover:text-white hover:border-purple-600' 
                              : 'bg-purple-500/10 border-purple-500/30 text-purple-400 hover:bg-purple-500 hover:text-slate-950'
                          }`}
                          title="Lập phiếu bảo trì / sửa chữa tài sản"
                        >
                          <Wrench className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* CONFIRM FINISH MAINTENANCE MODAL */}
      {finishMaintenanceModalAsset && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4">
          <div className={`${isLight ? 'bg-white text-slate-800' : 'glass-card-dark text-slate-100'} w-full max-w-md p-6 rounded-2xl border ${isLight ? 'border-slate-200' : 'border-slate-800'} space-y-5 shadow-2xl`}>
            <div className="flex items-center gap-3 border-b pb-3 border-cyan-200">
              <CheckCircle2 className="w-6 h-6 text-cyan-600 shrink-0" />
              <div>
                <h3 className={`font-bold text-base ${isLight ? 'text-slate-900' : 'text-white'}`}>Xác Nhận Hoàn Tất Bảo Trì</h3>
                <p className="text-xs text-slate-500">Mã tài sản: <strong className="font-mono text-cyan-600 font-bold">{finishMaintenanceModalAsset.asset_tag}</strong> ({finishMaintenanceModalAsset.hostname})</p>
              </div>
            </div>

            <div className={`p-4 rounded-xl border text-xs space-y-2 ${isLight ? 'bg-cyan-50/70 border-cyan-200 text-cyan-900' : 'bg-slate-900 border-slate-800 text-cyan-300'}`}>
              <p className="font-bold">Trạng thái sẽ được khôi phục chính xác về trạng thái trước đó:</p>
              <div className="flex items-center gap-2 mt-1.5">
                {getStatusBadge(finishMaintenanceModalAsset.previous_status || ((finishMaintenanceModalAsset.user_id || finishMaintenanceModalAsset.department_id) ? 'IN_USE' : 'READY'))}
                <span className="font-semibold text-slate-500">
                  ({(finishMaintenanceModalAsset.previous_status === 'READY' || (!finishMaintenanceModalAsset.previous_status && !finishMaintenanceModalAsset.user_id))
                    ? 'Chưa cấp phát / Kho IT Central'
                    : `Đang gán cho ${finishMaintenanceModalAsset.user_name || finishMaintenanceModalAsset.department_name || 'Người dùng'}`})
                </span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setFinishMaintenanceModalAsset(null)}
                className={`px-4 py-2 rounded-xl text-xs font-bold ${
                  isLight ? 'bg-slate-100 text-slate-700 hover:bg-slate-200' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={confirmFinishMaintenance}
                className="px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold shadow-lg shadow-cyan-600/20"
              >
                Xác Nhận Bảo Trì Xong
              </button>
            </div>
          </div>
        </div>
      )}

      {/* RIGHT SLIDE-OVER DRAWER FOR SEPARATE CẤP PHÁT / THU HỒI ACTION */}
      {transferDrawerAsset && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity" onClick={() => setTransferDrawerAsset(null)}></div>

          <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
            <div className={`w-screen max-w-lg ${isLight ? 'bg-white text-slate-800' : 'bg-slate-900 text-slate-100'} shadow-2xl border-l ${isLight ? 'border-slate-200' : 'border-slate-800'} flex flex-col`}>
              
              {/* Drawer Header */}
              {((!transferDrawerAsset.status || transferDrawerAsset.status === 'NEW' || transferDrawerAsset.status === 'READY')) ? (
                /* ALLOCATION DRAWER HEADER */
                <div className={`p-6 border-b flex items-center justify-between ${isLight ? 'border-emerald-200 bg-emerald-50/50' : 'border-slate-800 bg-slate-950/50'}`}>
                  <div>
                    <h3 className={`font-bold text-lg flex items-center gap-2 ${isLight ? 'text-emerald-900' : 'text-emerald-400'}`}>
                      <UserCheck className="w-5 h-5 text-emerald-600" /> Cấp Phát Tài Sản
                    </h3>
                    <p className={`text-xs mt-1 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                      Mã tài sản: <strong className="text-cyan-600 font-mono font-extrabold">{transferDrawerAsset.asset_tag}</strong> ({transferDrawerAsset.hostname})
                    </p>
                  </div>
                  <button onClick={() => setTransferDrawerAsset(null)} className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800">
                    <X className="w-5 h-5" />
                  </button>
                </div>
              ) : (
                /* REVOCATION DRAWER HEADER */
                <div className={`p-6 border-b flex items-center justify-between ${isLight ? 'border-rose-200 bg-rose-50/50' : 'border-slate-800 bg-slate-950/50'}`}>
                  <div>
                    <h3 className={`font-bold text-lg flex items-center gap-2 ${isLight ? 'text-rose-900' : 'text-rose-400'}`}>
                      <RotateCcw className="w-5 h-5 text-rose-600" /> Thu Hồi Tài Sản Về Kho IT
                    </h3>
                    <p className={`text-xs mt-1 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                      Mã tài sản: <strong className="text-cyan-600 font-mono font-extrabold">{transferDrawerAsset.asset_tag}</strong> ({transferDrawerAsset.hostname})
                    </p>
                  </div>
                  <button onClick={() => setTransferDrawerAsset(null)} className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800">
                    <X className="w-5 h-5" />
                  </button>
                </div>
              )}

              {/* Drawer Content */}
              <form onSubmit={handleActionSubmit} className="flex-1 p-6 space-y-4 text-xs overflow-y-auto">
                {((!transferDrawerAsset.status || transferDrawerAsset.status === 'NEW' || transferDrawerAsset.status === 'READY')) ? (
                  /* --- ALLOCATION FORM FIELDS --- */
                  <>
                    <div className="p-3.5 rounded-xl border bg-emerald-50/60 border-emerald-200 text-emerald-900 font-semibold space-y-1">
                      <p className="font-bold text-sm text-emerald-800">Tài sản sẵn sàng cấp phát</p>
                      <p className="text-xs">Trạng thái hiện tại: {getStatusBadge(transferDrawerAsset.status)}</p>
                    </div>

                    {/* SELECT ALLOCATION TARGET TYPE: NHÂN VIÊN OR PHÒNG BAN / KHOA */}
                    <div className="space-y-1.5">
                      <label className={`font-bold block ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                        Hình Thức Cấp Phát <span className="text-rose-500 font-extrabold ml-0.5">*</span>
                      </label>
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          type="button"
                          onClick={() => setAllocationTarget('EMPLOYEE')}
                          className={`p-3 rounded-xl border font-bold text-xs flex items-center justify-center gap-2 transition ${
                            allocationTarget === 'EMPLOYEE'
                              ? 'bg-cyan-600 text-white border-cyan-600 shadow-md'
                              : (isLight ? 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100' : 'bg-slate-950 border-slate-800 text-slate-300')
                          }`}
                        >
                          <User className="w-4 h-4" /> Cấp Cho Nhân Viên
                        </button>
                        <button
                          type="button"
                          onClick={() => setAllocationTarget('DEPARTMENT')}
                          className={`p-3 rounded-xl border font-bold text-xs flex items-center justify-center gap-2 transition ${
                            allocationTarget === 'DEPARTMENT'
                              ? 'bg-cyan-600 text-white border-cyan-600 shadow-md'
                              : (isLight ? 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100' : 'bg-slate-950 border-slate-800 text-slate-300')
                          }`}
                        >
                          <Building className="w-4 h-4" /> Cấp Cho Phòng / Khoa
                        </button>
                      </div>
                    </div>

                    {/* OPTION 1: ALLOCATE TO INDIVIDUAL EMPLOYEE */}
                    {allocationTarget === 'EMPLOYEE' && (
                      <>
                        <div className="space-y-1">
                          <label className={`font-bold ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                            Người Nhận Bàn Giao <span className="text-rose-500 font-extrabold ml-0.5">*</span>
                          </label>
                          <SearchableEmployeeSelect
                            employees={metadata.users}
                            value={toUserId}
                            onChange={(id) => handleEmployeeSelectionChange(id)}
                            placeholder="-- Tìm tên hoặc mã nhân viên --"
                            isLight={isLight}
                          />
                        </div>

                        {/* BỘ PHẬN TRỰC THUỘC (LOCKED READ-ONLY AUTO LINKED FROM EMPLOYEE) */}
                        <div className="space-y-1">
                          <div className="flex items-center justify-between">
                            <label className={`font-bold ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                              Bộ Phận Trực Thuộc (Phòng / Khoa)
                            </label>
                            <span className="text-[10px] text-slate-500 font-bold bg-slate-100 border border-slate-200 px-2 py-0.5 rounded flex items-center gap-1">
                              <Lock className="w-3 h-3 text-slate-500" /> Tự động khóa theo Nhân viên
                            </span>
                          </div>
                          <select
                            disabled
                            value={toDepartmentId}
                            className={`w-full border rounded-xl px-3.5 py-2.5 font-bold cursor-not-allowed opacity-80 ${
                              isLight ? 'bg-slate-100 border-slate-300 text-slate-700' : 'bg-slate-900 border-slate-800 text-slate-400'
                            }`}
                          >
                            {metadata.departments.map(d => (
                              <option key={d.id} value={d.id}>
                                {d.name}
                              </option>
                            ))}
                          </select>
                        </div>
                      </>
                    )}

                    {/* OPTION 2: ALLOCATE DIRECTLY TO DEPARTMENT / KHOA (2 OPTIONAL FIELDS: PHÒNG OR KHOA) */}
                    {allocationTarget === 'DEPARTMENT' && (
                      <div className="space-y-3 p-3.5 rounded-xl border bg-slate-50/70 dark:bg-slate-950/40 border-slate-200 dark:border-slate-800">
                        {/* 1. FIELD 1: PHÒNG BAN (OPTIONAL - NO RED ASTERISK) */}
                        <div className="space-y-1">
                          <label className={`font-bold ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                            Phòng Ban
                          </label>
                          <select
                            value={toDepartmentId}
                            onChange={(e) => handleDepartmentSelectionChange(e.target.value)}
                            className={`w-full border rounded-xl px-3.5 py-2.5 font-bold ${
                              isLight ? 'bg-white border-slate-300 text-cyan-900' : 'bg-slate-900 border-slate-700 text-cyan-400'
                            }`}
                          >
                            <option value="">-- Chọn Phòng Ban (Không bắt buộc) --</option>
                            {metadata.departments.map(d => (
                              <option key={d.id} value={d.id}>
                                {d.name}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* 2. FIELD 2: KHOA / ĐƠN VỊ TRỰC THUỘC (OPTIONAL - NO RED ASTERISK) */}
                        <div className="space-y-1">
                          <label className={`font-bold ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                            Khoa / Đơn Vị Trực Thuộc
                          </label>
                          <select
                            value={toKhoaId}
                            onChange={(e) => handleKhoaSelectionChange(e.target.value)}
                            className={`w-full border rounded-xl px-3.5 py-2.5 font-bold ${
                              isLight ? 'bg-white border-slate-300 text-slate-800' : 'bg-slate-900 border-slate-700 text-slate-200'
                            }`}
                          >
                            <option value="">-- Chọn Khoa / Đơn Vị (Không bắt buộc) --</option>
                            {khoaList.map(k => (
                              <option key={k.id} value={k.id}>
                                {k.name}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    )}

                    {/* VỊ TRÍ CÀI ĐẶT BAN ĐẦU (LOCKED READ-ONLY AUTO LINKED FROM PHÒNG/KHOA) */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <label className={`font-bold ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                          Vị Trí Cài Đặt Ban Đầu
                        </label>
                        <span className="text-[10px] text-slate-500 font-bold bg-slate-100 border border-slate-200 px-2 py-0.5 rounded flex items-center gap-1">
                          <Lock className="w-3 h-3 text-slate-500" /> Tự động khóa theo Phòng/Khoa
                        </span>
                      </div>
                      <select
                        disabled
                        value={toLocationId}
                        className={`w-full border rounded-xl px-3.5 py-2.5 font-bold cursor-not-allowed opacity-80 ${
                          isLight ? 'bg-slate-100 border-slate-300 text-slate-700' : 'bg-slate-900 border-slate-800 text-slate-400'
                        }`}
                      >
                        {metadata.locations.map(l => (
                          <option key={l.id} value={l.id}>{l.building} - {l.room} ({l.location_address})</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className={`font-bold ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>Ghi Chú Cấp Phát</label>
                      <textarea
                        rows={3}
                        placeholder="Nhập ghi chú mục đích cấp phát tài sản..."
                        value={transferNotes}
                        onChange={(e) => setTransferNotes(e.target.value)}
                        className={`w-full border rounded-xl px-3.5 py-2.5 ${
                          isLight ? 'bg-slate-50 border-slate-300 text-slate-800' : 'bg-slate-950 border-slate-700 text-slate-200'
                        }`}
                      />
                    </div>

                    {/* Drawer Footer Buttons for Allocation */}
                    <div className={`pt-4 border-t flex justify-end gap-3 mt-auto ${isLight ? 'border-slate-200' : 'border-slate-800'}`}>
                      <button
                        type="button"
                        onClick={() => setTransferDrawerAsset(null)}
                        className={`px-5 py-2.5 rounded-xl font-bold ${
                          isLight ? 'bg-slate-100 text-slate-700 hover:bg-slate-200' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                        }`}
                      >
                        Hủy
                      </button>
                      <button
                        type="submit"
                        className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-lg shadow-emerald-600/20"
                      >
                        Xác Nhận Cấp Phát (Đang Sử Dụng)
                      </button>
                    </div>
                  </>
                ) : (
                  /* --- REVOCATION FORM FIELDS --- */
                  <>
                    <div className="p-4 rounded-xl border bg-rose-50/70 border-rose-200 text-rose-900 space-y-2">
                      <p className="font-bold text-sm text-rose-900">Thông tin gán hiện tại</p>
                      <div className="text-xs space-y-1">
                        <p>👤 Người/Phòng gán: <strong className="font-bold">{transferDrawerAsset.user_name || `Phòng ${transferDrawerAsset.department_name}`}</strong></p>
                        <p>🏢 Bộ phận / Phòng: <strong className="font-bold">{transferDrawerAsset.department_name || 'Kho IT Central'}</strong></p>
                        <p>📌 Trạng thái hiện tại: {getStatusBadge(transferDrawerAsset.status)}</p>
                      </div>
                    </div>

                    <div className="p-3.5 rounded-xl border bg-amber-50 border-amber-200 text-amber-800 text-xs font-semibold">
                      Sau khi xác nhận thu hồi, tài sản sẽ tự động chuyển sang trạng thái <strong>"Sẵn Sàng Cấp Phát"</strong> và hủy gán sử dụng.
                    </div>

                    {/* VỊ TRÍ KHO THU HỒI VỀ */}
                    <div className="space-y-1">
                      <label className={`font-bold ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                        Vị Trí Lưu Kho IT <span className="text-rose-500 font-extrabold ml-0.5">*</span>
                      </label>
                      <select
                        required
                        value={toLocationId}
                        onChange={(e) => setToLocationId(e.target.value)}
                        className={`w-full border rounded-xl px-3.5 py-2.5 font-bold ${
                          isLight ? 'bg-slate-50 border-slate-300 text-slate-800' : 'bg-slate-950 border-slate-700 text-slate-200'
                        }`}
                      >
                        {metadata.locations.map(l => (
                          <option key={l.id} value={l.id}>{l.building} - {l.room} ({l.location_address})</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className={`font-bold ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                        Lý Do Thu Hồi <span className="text-rose-500 font-extrabold ml-0.5">*</span>
                      </label>
                      <textarea
                        required
                        rows={4}
                        placeholder="Nhập chi tiết lý do thu hồi tài sản (vd: Nhân viên nghỉ việc, luân chuyển công tác, hỏng hóc...)..."
                        value={transferNotes}
                        onChange={(e) => setTransferNotes(e.target.value)}
                        className={`w-full border rounded-xl px-3.5 py-2.5 ${
                          isLight ? 'bg-slate-50 border-slate-300 text-slate-800' : 'bg-slate-950 border-slate-700 text-slate-200'
                        }`}
                      />
                    </div>

                    {/* Drawer Footer Buttons for Revocation */}
                    <div className={`pt-4 border-t flex justify-end gap-3 mt-auto ${isLight ? 'border-slate-200' : 'border-slate-800'}`}>
                      <button
                        type="button"
                        onClick={() => setTransferDrawerAsset(null)}
                        className={`px-5 py-2.5 rounded-xl font-bold ${
                          isLight ? 'bg-slate-100 text-slate-700 hover:bg-slate-200' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                        }`}
                      >
                        Hủy
                      </button>
                      <button
                        type="submit"
                        className="px-6 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold shadow-lg shadow-rose-600/20"
                      >
                        Xác Nhận Thu Hồi Về Kho IT
                      </button>
                    </div>
                  </>
                )}
              </form>
            </div>
          </div>
        </div>
      )}

      {/* RIGHT SLIDE-OVER DRAWER FOR BẢO TRÌ / SỬA CHỮA (MAINTENANCE DRAWER) */}
      {maintenanceDrawerAsset && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity" onClick={() => setMaintenanceDrawerAsset(null)}></div>

          <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
            <div className={`w-screen max-w-lg ${isLight ? 'bg-white text-slate-800' : 'bg-slate-900 text-slate-100'} shadow-2xl border-l ${isLight ? 'border-slate-200' : 'border-slate-800'} flex flex-col`}>
              
              {/* Drawer Header */}
              <div className={`p-6 border-b flex items-center justify-between ${isLight ? 'border-purple-200 bg-purple-50/60' : 'border-slate-800 bg-slate-950/50'}`}>
                <div>
                  <h3 className={`font-bold text-lg flex items-center gap-2 ${isLight ? 'text-purple-900' : 'text-purple-400'}`}>
                    <Wrench className="w-5 h-5 text-purple-600" /> Lập Phiếu Bảo Trì / Sửa Chữa Tài Sản
                  </h3>
                  <p className={`text-xs mt-1 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                    Mã tài sản: <strong className="text-cyan-600 font-mono font-extrabold">{maintenanceDrawerAsset.asset_tag}</strong> ({maintenanceDrawerAsset.hostname})
                  </p>
                </div>
                <button onClick={() => setMaintenanceDrawerAsset(null)} className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Drawer Content */}
              <form onSubmit={handleMaintenanceSubmit} className="flex-1 p-6 space-y-4 text-xs overflow-y-auto">
                {/* 1. LOẠI BẢO TRÌ / SỬA CHỮA */}
                <div className="space-y-1">
                  <label className={`font-bold ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                    Hình Thức Thao Tác <span className="text-rose-500 font-extrabold ml-0.5">*</span>
                  </label>
                  <select
                    value={maintenanceType}
                    onChange={(e) => setMaintenanceType(e.target.value)}
                    className={`w-full border rounded-xl px-3.5 py-2.5 font-bold ${
                      isLight ? 'bg-purple-50/60 border-purple-300 text-purple-900' : 'bg-slate-950 border-slate-700 text-purple-400'
                    }`}
                  >
                    <option value="REPAIR">Sửa Chữa Hỏng Hóc (Thay linh kiện, sửa nguồn, màn hình...)</option>
                    <option value="PREVENTIVE">Bảo Trì Định Kỳ (Vệ sinh phần cứng, tra keo tản nhiệt, quét virus...)</option>
                  </select>
                </div>

                {/* 2. ĐƠN VỊ THỰC HIỆN BẢO TRÌ / SỬA CHỮA */}
                <div className="space-y-1">
                  <label className={`font-bold ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                    Đơn Vị Thực Hiện / Đối Tác Bảo Hành <span className="text-rose-500 font-extrabold ml-0.5">*</span>
                  </label>
                  <input
                    required
                    type="text"
                    placeholder="Nhập tên bộ phận hoặc đối tác (vd: Đội IT Nội bộ / Trung tâm bảo hành FPT)..."
                    value={maintenanceVendor}
                    onChange={(e) => setMaintenanceVendor(e.target.value)}
                    className={`w-full border rounded-xl px-3.5 py-2.5 ${
                      isLight ? 'bg-slate-50 border-slate-300 text-slate-800' : 'bg-slate-950 border-slate-700 text-slate-200'
                    }`}
                  />
                </div>

                {/* 3. CHI PHÍ BẢO TRÌ / SỬA CHỮA (VNĐ) */}
                <div className="space-y-1">
                  <label className={`font-bold ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                    Chi Phí Thực Hiện (VNĐ)
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Nhập chi phí dự kiến (vd: 1.500.000)..."
                      value={formatCurrency(maintenanceCost)}
                      onChange={handleMaintenanceCostInputChange}
                      className={`w-full border rounded-xl pl-3.5 pr-14 py-2.5 font-mono font-bold text-sm ${
                        isLight ? 'bg-slate-50 border-slate-300 text-purple-700' : 'bg-slate-950 border-slate-700 text-purple-400'
                      }`}
                    />
                    <span className="absolute right-3.5 top-1/2 -translate-y-1/2 font-extrabold text-xs text-slate-400">
                      VNĐ
                    </span>
                  </div>
                  {maintenanceCost && (
                    <p className="text-[11px] font-bold text-purple-600 mt-1">
                      💰 Chi phí: {formatCurrency(maintenanceCost)} VNĐ
                    </p>
                  )}
                </div>

                {/* 4. NGÀY BẮT ĐẦU */}
                <div className="space-y-1">
                  <label className={`font-bold ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                    Ngày Bắt Đầu Bảo Trì / Sửa Chữa
                  </label>
                  <DatePickerVN
                    value={maintenanceStartDate}
                    onChange={(newDateStr) => setMaintenanceStartDate(newDateStr)}
                    isLight={isLight}
                  />
                </div>

                {/* 5. DỰ KIẾN NGÀY HOÀN THÀNH */}
                <div className="space-y-1">
                  <label className={`font-bold ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                    Dự Kiến Ngày Hoàn Thành Bàn Giao
                  </label>
                  <DatePickerVN
                    value={maintenanceEndDate}
                    onChange={(newDateStr) => setMaintenanceEndDate(newDateStr)}
                    isLight={isLight}
                  />
                </div>

                {/* 6. MULTIPLE FILES UPLOAD FOR MAINTENANCE DOCUMENTS */}
                <div className="space-y-2">
                  <label className={`font-bold block ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                    Đính Kèm Phiếu Yêu Cầu / Báo Giá / Biên Bản (Tải nhiều File)
                  </label>
                  
                  {maintenanceFiles.length > 0 && (
                    <div className="space-y-1.5 max-h-36 overflow-y-auto">
                      {maintenanceFiles.map((file, idx) => (
                        <div key={idx} className={`p-2.5 rounded-xl border flex items-center justify-between font-bold text-xs ${
                          isLight ? 'bg-purple-50/70 border-purple-300 text-purple-900' : 'bg-slate-950 border-slate-700 text-purple-400'
                        }`}>
                          <div className="flex items-center gap-2 truncate">
                            <FileText className="w-4 h-4 text-purple-600 shrink-0" />
                            <span className="truncate">{file.name}</span>
                            <span className="text-[10px] text-slate-400 font-semibold">({file.size})</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveFile(idx, setMaintenanceFiles)}
                            className="p-1 rounded text-slate-400 hover:text-rose-500 transition ml-2"
                            title="Xóa file này"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  <label className={`w-full border-2 border-dashed rounded-xl p-3.5 flex flex-col items-center justify-center cursor-pointer transition ${
                    isLight ? 'bg-slate-50 border-slate-300 hover:bg-slate-100 text-slate-600' : 'bg-slate-950 border-slate-800 hover:bg-slate-900 text-slate-300'
                  }`}>
                    <div className="flex items-center gap-1.5 text-purple-600 font-bold text-xs">
                      <Plus className="w-4 h-4" />
                      <span>{maintenanceFiles.length > 0 ? 'Thêm file chứng từ khác' : 'Bấm để đính kèm phiếu yêu cầu / báo giá'}</span>
                    </div>
                    <span className="text-[11px] text-slate-400 mt-0.5">Chấp nhận file PDF, PNG, JPG, DOCX</span>
                    <input
                      type="file"
                      multiple
                      accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
                      onChange={(e) => handleMultipleFilesUpload(e, setMaintenanceFiles)}
                      className="hidden"
                    />
                  </label>
                </div>

                {/* 7. NỘI DUNG VÀ MÔ TẢ YÊU CẦU */}
                <div className="space-y-1">
                  <label className={`font-bold ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                    Mô Tả Chi Tiết Lỗi / Nội Dung Bảo Trì <span className="text-rose-500 font-extrabold ml-0.5">*</span>
                  </label>
                  <textarea
                    required
                    rows={4}
                    placeholder="Mô tả hiện trạng sự cố (vd: Máy bật không lên nguồn, kêu tít tít, quạt tản nhiệt bị kẹt...) hoặc nội dung bảo trì..."
                    value={maintenanceDescription}
                    onChange={(e) => setMaintenanceDescription(e.target.value)}
                    className={`w-full border rounded-xl px-3.5 py-2.5 ${
                      isLight ? 'bg-slate-50 border-slate-300 text-slate-800' : 'bg-slate-950 border-slate-700 text-slate-200'
                    }`}
                  />
                </div>

                {/* Drawer Footer Buttons */}
                <div className={`pt-4 border-t flex justify-end gap-3 mt-auto ${isLight ? 'border-slate-200' : 'border-slate-800'}`}>
                  <button
                    type="button"
                    onClick={() => setMaintenanceDrawerAsset(null)}
                    className={`px-5 py-2.5 rounded-xl font-bold ${
                      isLight ? 'bg-slate-100 text-slate-700 hover:bg-slate-200' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold shadow-lg shadow-purple-600/20"
                  >
                    Xác Nhận Đưa Vào Bảo Trì (Đang Bảo Trì)
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* RIGHT SLIDE-OVER DRAWER FOR THANH LÝ TÀI SẢN (DISPOSAL DRAWER) */}
      {disposalDrawerAsset && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity" onClick={() => setDisposalDrawerAsset(null)}></div>

          <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
            <div className={`w-screen max-w-lg ${isLight ? 'bg-white text-slate-800' : 'bg-slate-900 text-slate-100'} shadow-2xl border-l ${isLight ? 'border-slate-200' : 'border-slate-800'} flex flex-col`}>
              
              {/* Drawer Header */}
              <div className={`p-6 border-b flex items-center justify-between ${isLight ? 'border-orange-200 bg-orange-50/60' : 'border-slate-800 bg-slate-950/50'}`}>
                <div>
                  <h3 className={`font-bold text-lg flex items-center gap-2 ${isLight ? 'text-orange-900' : 'text-orange-400'}`}>
                    <TrendingDown className="w-5 h-5 text-orange-600" /> Thủ Tục Thanh Lý Tài Sản
                  </h3>
                  <p className={`text-xs mt-1 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                    Mã tài sản: <strong className="text-cyan-600 font-mono font-extrabold">{disposalDrawerAsset.asset_tag}</strong> ({disposalDrawerAsset.hostname})
                  </p>
                </div>
                <button onClick={() => setDisposalDrawerAsset(null)} className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Drawer Content */}
              <form onSubmit={handleDisposalSubmit} className="flex-1 p-6 space-y-4 text-xs overflow-y-auto">
                {/* 1. TRẠNG THÁI THANH LÝ */}
                <div className="space-y-1">
                  <label className={`font-bold ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                    Quy Trình Thanh Lý <span className="text-rose-500 font-extrabold ml-0.5">*</span>
                  </label>
                  <select
                    value={disposalStatus}
                    onChange={(e) => setDisposalStatus(e.target.value)}
                    className={`w-full border rounded-xl px-3.5 py-2.5 font-bold ${
                      isLight ? 'bg-orange-50/60 border-orange-300 text-orange-900' : 'bg-slate-950 border-slate-700 text-orange-400'
                    }`}
                  >
                    <option value="DISPOSING">Thanh Lý (Đang trong quá trình chờ phê duyệt/thanh lý)</option>
                    <option value="DISPOSED">Đã Thanh Lý (Hoàn tất bán/thanh lý thành công)</option>
                  </select>
                </div>

                {/* 2. GIÁ TRỊ THANH LÝ (VNĐ) */}
                <div className="space-y-1">
                  <label className={`font-bold ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                    Giá Trị Thanh Lý Thu Về (VNĐ)
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Nhập số tiền thu hồi từ thanh lý (vd: 5.000.000)..."
                      value={formatCurrency(disposalValue)}
                      onChange={handleDisposalValueInputChange}
                      className={`w-full border rounded-xl pl-3.5 pr-14 py-2.5 font-mono font-bold text-sm ${
                        isLight ? 'bg-slate-50 border-slate-300 text-orange-700' : 'bg-slate-950 border-slate-700 text-orange-400'
                      }`}
                    />
                    <span className="absolute right-3.5 top-1/2 -translate-y-1/2 font-extrabold text-xs text-slate-400">
                      VNĐ
                    </span>
                  </div>
                  {disposalValue && (
                    <p className="text-[11px] font-bold text-orange-600 mt-1">
                      💰 Số tiền thanh lý: {formatCurrency(disposalValue)} VNĐ
                    </p>
                  )}
                </div>

                {/* 3. NGÀY THANH LÝ */}
                <div className="space-y-1">
                  <label className={`font-bold ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                    Ngày Thực Hiện Thanh Lý
                  </label>
                  <DatePickerVN
                    value={disposalDate}
                    onChange={(newDateStr) => setDisposalDate(newDateStr)}
                    isLight={isLight}
                  />
                </div>

                {/* 4. ĐƠN VỊ MUA THANH LÝ */}
                <div className="space-y-1">
                  <label className={`font-bold ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                    Đơn Vị / Đối Tác Mua Thanh Lý
                  </label>
                  <input
                    type="text"
                    placeholder="Nhập tên đối tác/công ty thu mua..."
                    value={disposalBuyer}
                    onChange={(e) => setDisposalBuyer(e.target.value)}
                    className={`w-full border rounded-xl px-3.5 py-2.5 ${
                      isLight ? 'bg-slate-50 border-slate-300 text-slate-800' : 'bg-slate-950 border-slate-700 text-slate-200'
                    }`}
                  />
                </div>

                {/* 5. SỐ HỢP ĐỒNG / BIÊN BẢN THANH LÝ */}
                <div className="space-y-1">
                  <label className={`font-bold ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                    Số Hợp Đồng / Biên Bản Thanh Lý
                  </label>
                  <input
                    type="text"
                    placeholder="Nhập số biên bản / hợp đồng thanh lý (vd: BBTL-2026/08-01)..."
                    value={disposalContractNo}
                    onChange={(e) => setDisposalContractNo(e.target.value)}
                    className={`w-full border rounded-xl px-3.5 py-2.5 font-mono ${
                      isLight ? 'bg-slate-50 border-slate-300 text-slate-800' : 'bg-slate-950 border-slate-700 text-slate-200'
                    }`}
                  />
                </div>

                {/* 6. MULTIPLE FILES UPLOAD FOR DISPOSAL DOCUMENTS */}
                <div className="space-y-2">
                  <label className={`font-bold block ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                    Đính Kèm Biên Bản / Chứng Từ Thanh Lý (Tải nhiều File)
                  </label>
                  
                  {disposalFiles.length > 0 && (
                    <div className="space-y-1.5 max-h-36 overflow-y-auto">
                      {disposalFiles.map((file, idx) => (
                        <div key={idx} className={`p-2.5 rounded-xl border flex items-center justify-between font-bold text-xs ${
                          isLight ? 'bg-orange-50/70 border-orange-300 text-orange-900' : 'bg-slate-950 border-slate-700 text-orange-400'
                        }`}>
                          <div className="flex items-center gap-2 truncate">
                            <FileText className="w-4 h-4 text-orange-600 shrink-0" />
                            <span className="truncate">{file.name}</span>
                            <span className="text-[10px] text-slate-400 font-semibold">({file.size})</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveFile(idx, setDisposalFiles)}
                            className="p-1 rounded text-slate-400 hover:text-rose-500 transition ml-2"
                            title="Xóa file này"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  <label className={`w-full border-2 border-dashed rounded-xl p-3.5 flex flex-col items-center justify-center cursor-pointer transition ${
                    isLight ? 'bg-slate-50 border-slate-300 hover:bg-slate-100 text-slate-600' : 'bg-slate-950 border-slate-800 hover:bg-slate-900 text-slate-300'
                  }`}>
                    <div className="flex items-center gap-1.5 text-orange-600 font-bold text-xs">
                      <Plus className="w-4 h-4" />
                      <span>{disposalFiles.length > 0 ? 'Thêm chứng từ thanh lý khác' : 'Bấm để đính kèm file biên bản thanh lý'}</span>
                    </div>
                    <span className="text-[11px] text-slate-400 mt-0.5">Chấp nhận file PDF, PNG, JPG, DOCX</span>
                    <input
                      type="file"
                      multiple
                      accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
                      onChange={(e) => handleMultipleFilesUpload(e, setDisposalFiles)}
                      className="hidden"
                    />
                  </label>
                </div>

                {/* 7. LÝ DO & GHI CHÚ THANH LÝ */}
                <div className="space-y-1">
                  <label className={`font-bold ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                    Lý Do & Ghi Chú Thanh Lý <span className="text-rose-500 font-extrabold ml-0.5">*</span>
                  </label>
                  <textarea
                    required
                    rows={3}
                    placeholder="Nhập chi tiết lý do quyết định thanh lý tài sản..."
                    value={disposalReason}
                    onChange={(e) => setDisposalReason(e.target.value)}
                    className={`w-full border rounded-xl px-3.5 py-2.5 ${
                      isLight ? 'bg-slate-50 border-slate-300 text-slate-800' : 'bg-slate-950 border-slate-700 text-slate-200'
                    }`}
                  />
                </div>

                {/* Drawer Footer Buttons */}
                <div className={`pt-4 border-t flex justify-end gap-3 mt-auto ${isLight ? 'border-slate-200' : 'border-slate-800'}`}>
                  <button
                    type="button"
                    onClick={() => setDisposalDrawerAsset(null)}
                    className={`px-5 py-2.5 rounded-xl font-bold ${
                      isLight ? 'bg-slate-100 text-slate-700 hover:bg-slate-200' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold shadow-lg shadow-orange-600/20"
                  >
                    Xác Nhận Thanh Lý
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
      {/* RIGHT SLIDE-OVER DRAWER FOR CHỈNH SỬA TÀI SẢN & STATUS */}
      {editDrawerAsset && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity" onClick={() => setEditDrawerAsset(null)}></div>

          <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
            <div className={`w-screen max-w-4xl ${isLight ? 'bg-white text-slate-800' : 'bg-slate-900 text-slate-100'} shadow-2xl border-l ${isLight ? 'border-slate-200' : 'border-slate-800'} flex flex-col h-full overflow-hidden`}>
              
              {/* Drawer Header */}
              <div className={`p-6 border-b flex items-center justify-between shrink-0 ${isLight ? 'border-slate-200 bg-slate-50' : 'border-slate-800 bg-slate-950/50'}`}>
                <div>
                  <h3 className={`font-bold text-lg flex items-center gap-2 ${isLight ? 'text-slate-900' : 'text-white'}`}>
                    <Edit3 className="w-5 h-5 text-amber-600" /> Chỉnh Sửa Thông Tin Tài Sản & Trạng Thái
                  </h3>
                  <p className={`text-xs mt-1 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                    Tài sản: <strong className="text-cyan-600 font-mono font-extrabold">{editDrawerAsset.asset_tag}</strong> ({editDrawerAsset.hostname})
                  </p>
                </div>
                <button onClick={() => setEditDrawerAsset(null)} className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Drawer Content Form */}
              <form onSubmit={handleEditSubmit} className="flex-1 flex flex-col min-h-0 overflow-hidden">
                <div className="flex-1 p-6 text-xs overflow-y-auto">
                  {(() => {
                    const isAutoScanned = Boolean(editDrawerAsset && editDrawerAsset.agent_id);
                    return (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                        {/* LEFT COLUMN: Thông Tin Định Danh & Giá Trị Mua Sắm */}
                        <div className="space-y-4">
                          <div className="border-b pb-2">
                            <h4 className="font-bold text-sm text-cyan-600 flex items-center gap-1.5 uppercase tracking-wider">
                              <Package className="w-4 h-4 text-cyan-600" /> Thông Tin Tài Sản
                            </h4>
                          </div>

                          {/* Mã Tài Sản */}
                          <div className="space-y-1">
                            <label className={`font-bold flex items-center justify-between ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                              <span>Mã Tài Sản <span className="text-rose-500 font-extrabold">*</span></span>
                              {isAutoScanned && (
                                <span className="text-[10px] text-blue-600 dark:text-blue-400 font-extrabold flex items-center gap-1">
                                  🔒 Quét tự động (Không thể sửa)
                                </span>
                              )}
                            </label>
                            <input
                              type="text"
                              disabled={isAutoScanned}
                              value={editAssetTag}
                              onChange={(e) => setEditAssetTag(e.target.value)}
                              className={`w-full border rounded-xl px-3.5 py-2.5 font-mono font-bold ${
                                isAutoScanned
                                  ? (isLight ? 'bg-slate-100 border-slate-200 text-slate-500 cursor-not-allowed' : 'bg-slate-950/80 border-slate-800 text-slate-400 cursor-not-allowed')
                                  : (isLight ? 'bg-slate-50 border-slate-300 text-cyan-700' : 'bg-slate-950 border-slate-700 text-cyan-400')
                              }`}
                            />
                          </div>

                          {/* Tên Thiết Bị / Hostname */}
                          <div className="space-y-1">
                            <label className={`font-bold flex items-center justify-between ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                              <span>Tên Thiết Bị / Hostname <span className="text-rose-500 font-extrabold">*</span></span>
                              {isAutoScanned && (
                                <span className="text-[10px] text-blue-600 dark:text-blue-400 font-extrabold flex items-center gap-1">
                                  🔒 Quét tự động (Không thể sửa)
                                </span>
                              )}
                            </label>
                            <input
                              type="text"
                              disabled={isAutoScanned}
                              value={editHostname}
                              onChange={(e) => setEditHostname(e.target.value)}
                              className={`w-full border rounded-xl px-3.5 py-2.5 font-bold ${
                                isAutoScanned
                                  ? (isLight ? 'bg-slate-100 border-slate-200 text-slate-500 cursor-not-allowed' : 'bg-slate-950/80 border-slate-800 text-slate-400 cursor-not-allowed')
                                  : (isLight ? 'bg-slate-50 border-slate-300 text-slate-800' : 'bg-slate-950 border-slate-700 text-slate-200')
                              }`}
                            />
                          </div>

                          {/* Loại Tài Sản */}
                          <div className="space-y-1">
                            <label className={`font-bold flex items-center justify-between ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                              <span>Loại Tài Sản <span className="text-rose-500 font-extrabold">*</span></span>
                              {isAutoScanned && (
                                <span className="text-[10px] text-blue-600 dark:text-blue-400 font-extrabold flex items-center gap-1">
                                  🔒 Quét tự động (Không thể sửa)
                                </span>
                              )}
                            </label>
                            <select
                              disabled={isAutoScanned}
                              value={editAssetType}
                              onChange={(e) => setEditAssetType(e.target.value)}
                              className={`w-full border rounded-xl px-3.5 py-2.5 font-bold ${
                                isAutoScanned
                                  ? (isLight ? 'bg-slate-100 border-slate-200 text-slate-500 cursor-not-allowed' : 'bg-slate-950/80 border-slate-800 text-slate-400 cursor-not-allowed')
                                  : (isLight ? 'bg-slate-50 border-slate-300 text-slate-800' : 'bg-slate-950 border-slate-700 text-slate-200')
                              }`}
                            >
                              {(localMeta.assetTypes && localMeta.assetTypes.length > 0) ? (
                                localMeta.assetTypes.map(at => (
                                  <option key={at.id || at.code} value={at.name}>{at.name}</option>
                                ))
                              ) : (
                                <>
                                  <option value="Desktop">Desktop</option>
                                  <option value="Laptop">Laptop</option>
                                  <option value="Workstation">Workstation</option>
                                  <option value="Server">Server</option>
                                  <option value="Máy In / Scanner / Photo">Máy In / Scanner / Photo</option>
                                  <option value="Switch Mạng / Router / Firewall">Switch Mạng / Router / Firewall</option>
                                  <option value="Thiết Bị CNTT Khác">Thiết Bị CNTT Khác</option>
                                </>
                              )}
                            </select>
                          </div>

                          <div className="border-b pt-2 pb-2">
                            <h4 className="font-bold text-sm text-cyan-600 flex items-center gap-1.5 uppercase tracking-wider">
                              <DollarSign className="w-4 h-4 text-emerald-600" /> Giá Trị & Mua Sắm
                            </h4>
                          </div>

                          {/* TRẠNG THÁI TÀI SẢN */}
                          <div className="space-y-1">
                            <label className={`font-bold ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                              Trạng Thái Tài Sản <span className="text-rose-500 font-extrabold ml-0.5">*</span>
                            </label>
                            <select
                              value={assetStatus}
                              onChange={(e) => setAssetStatus(e.target.value)}
                              className={`w-full border rounded-xl px-3.5 py-2.5 font-bold ${
                                isLight ? 'bg-slate-50 border-slate-300 text-slate-800' : 'bg-slate-950 border-slate-700 text-slate-200'
                              }`}
                            >
                              <option value="NEW">Mới (Mới mua)</option>
                              <option value="READY">Sẵn sàng cấp phát (Đã thu hồi, chưa cấp phát cho ai)</option>
                              <option value="IN_USE">Đang sử dụng (Đang được gán với nhân viên/khoa phòng)</option>
                              <option value="MAINTENANCE">Đang bảo trì (Nằm trong mục bảo trì/sửa chữa)</option>
                              <option value="DISPOSING">Thanh lý (Đang trong quá trình thanh lý)</option>
                              <option value="DISPOSED">Đã thanh lý (Đã thanh lý thành công)</option>
                            </select>
                          </div>

                          {/* NGÀY MUA */}
                          <div className="space-y-1">
                            <label className={`font-bold ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>Ngày Mua</label>
                            <DatePickerVN
                              value={purchaseDate}
                              onChange={(newDateStr) => setPurchaseDate(newDateStr)}
                              isLight={isLight}
                            />
                          </div>

                          {/* GIÁ MUA */}
                          <div className="space-y-1">
                            <label className={`font-bold ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>Giá Mua (VNĐ)</label>
                            <div className="relative">
                              <input
                                type="text"
                                placeholder="Nhập giá mua"
                                value={formatCurrency(purchaseCost)}
                                onChange={handlePurchaseCostInputChange}
                                className={`w-full border rounded-xl pl-3.5 pr-14 py-2.5 font-mono font-bold text-sm ${
                                  isLight ? 'bg-slate-50 border-slate-300 text-emerald-700' : 'bg-slate-950 border-slate-700 text-emerald-400'
                                }`}
                              />
                              <span className="absolute right-3.5 top-1/2 -translate-y-1/2 font-extrabold text-xs text-slate-400">
                                VNĐ
                              </span>
                            </div>
                            {purchaseCost && (
                              <p className="text-[11px] font-bold text-emerald-600 mt-1">
                                💰 Số tiền: {formatCurrency(purchaseCost)} VNĐ
                              </p>
                            )}
                          </div>

                          {/* KHẤU HAO */}
                          <div className="space-y-1">
                            <label className={`font-bold ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>Khấu Hao (Số Tháng)</label>
                            <input
                              type="number"
                              placeholder="Nhập số tháng khấu hao..."
                              value={depreciationMonths}
                              onChange={(e) => setDepreciationMonths(e.target.value)}
                              className={`w-full border rounded-xl px-3.5 py-2.5 ${
                                isLight ? 'bg-slate-50 border-slate-300 text-slate-800' : 'bg-slate-950 border-slate-700 text-slate-200'
                              }`}
                            />
                          </div>

                          {/* NHÀ CUNG CẤP */}
                          <div className="space-y-1">
                            <label className={`font-bold ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>Nhà Cung Cấp</label>
                            <select
                              value={vendorSupplier}
                              onChange={(e) => setVendorSupplier(e.target.value)}
                              className={`w-full border rounded-xl px-3.5 py-2.5 font-bold ${
                                isLight ? 'bg-slate-50 border-slate-300 text-slate-800' : 'bg-slate-950 border-slate-700 text-slate-200'
                              }`}
                            >
                              <option value="">-- Chọn Nhà Cung Cấp --</option>
                              {(localMeta.suppliers || []).map(s => (
                                <option key={s.id} value={s.name}>{s.name}</option>
                              ))}
                              {vendorSupplier && !(localMeta.suppliers || []).some(s => s.name === vendorSupplier) && (
                                <option value={vendorSupplier}>{vendorSupplier}</option>
                              )}
                            </select>
                          </div>

                          {/* NGÀY HẾT BẢO HÀNH */}
                          <div className="space-y-1">
                            <label className={`font-bold ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>Ngày Hết Bảo Hành</label>
                            <DatePickerVN
                              value={warrantyExpirationDate}
                              onChange={(newDateStr) => setWarrantyExpirationDate(newDateStr)}
                              isLight={isLight}
                            />
                          </div>
                        </div>

                        {/* RIGHT COLUMN: Ghi Chú Vận Hành (TRÊN) & Hồ Sơ Chứng Từ Đính Kèm (DƯỚI) */}
                        <div className="space-y-4">
                          <div className="border-b pb-2">
                            <h4 className="font-bold text-sm text-cyan-600 flex items-center gap-1.5 uppercase tracking-wider">
                              <FileText className="w-4 h-4 text-amber-600" /> Ghi Chú Kỹ Thuật & Hồ Sơ
                            </h4>
                          </div>

                          {/* GHI CHÚ TÀI SẢN (TRÊN) */}
                          <div className="space-y-1.5">
                            <label className={`font-bold flex items-center gap-1.5 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                              <FileText className="w-4 h-4 text-amber-600" /> Ghi Chú Tài Sản (UltraViewer / Pass / Remote...)
                            </label>
                            <textarea
                              rows={5}
                              placeholder="Nhập thông tin kết nối remote (UltraViewer ID/Mật khẩu), tài khoản hoặc ghi chú kỹ thuật đặc biệt..."
                              value={assetNotes}
                              onChange={(e) => setAssetNotes(e.target.value)}
                              className={`w-full border rounded-xl px-3.5 py-2.5 font-mono text-xs ${
                                isLight ? 'bg-amber-50/40 border-amber-200 text-slate-800' : 'bg-slate-950 border-amber-800/60 text-slate-200'
                              }`}
                            />
                          </div>

                          {/* HỒ SƠ PO & CHỨNG TỪ (DƯỚI) */}
                          <div className="space-y-2 pt-2">
                            <label className={`font-bold block ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                              Hồ Sơ Mua Sắm / PO / Hợp Đồng Đính Kèm (Cho phép đính kèm nhiều file)
                            </label>
                            
                            {poFiles.length > 0 && (
                              <div className="space-y-1.5 max-h-48 overflow-y-auto">
                                {poFiles.map((file, idx) => (
                                  <div key={idx} className={`p-2.5 rounded-xl border flex items-center justify-between font-bold text-xs ${
                                    isLight ? 'bg-cyan-50/70 border-cyan-300 text-cyan-900' : 'bg-slate-950 border-slate-700 text-cyan-400'
                                  }`}>
                                    <div className="flex items-center gap-2 truncate">
                                      <FileText className="w-4 h-4 text-cyan-600 shrink-0" />
                                      <span className="truncate">{file.name}</span>
                                      <span className="text-[10px] text-slate-400 font-semibold">({file.size})</span>
                                    </div>
                                    <button
                                      type="button"
                                      onClick={() => handleRemoveFile(idx, setPoFiles)}
                                      className="p-1 rounded text-slate-400 hover:text-rose-500 transition ml-2"
                                      title="Xóa file này"
                                    >
                                      <X className="w-4 h-4" />
                                    </button>
                                  </div>
                                ))}
                              </div>
                            )}

                            <label className={`w-full border-2 border-dashed rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer transition ${
                              isLight ? 'bg-slate-50 border-slate-300 hover:bg-slate-100 text-slate-600' : 'bg-slate-950 border-slate-800 hover:bg-slate-900 text-slate-300'
                            }`}>
                              <div className="flex items-center gap-1.5 text-cyan-600 font-bold text-xs">
                                <Upload className="w-5 h-5" />
                                <span>{poFiles.length > 0 ? '+ Đính kèm thêm file chứng từ khác' : 'Nhấp hoặc kéo thả file chứng từ PO / Hóa đơn'}</span>
                              </div>
                              <span className="text-[10px] text-slate-400 mt-1">Chấp nhận file PDF, PNG, JPG, DOCX, XLSX (Tối đa 20MB)</span>
                              <input
                                type="file"
                                multiple
                                accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,.xlsx"
                                onChange={(e) => handleMultipleFilesUpload(e, setPoFiles)}
                                className="hidden"
                              />
                            </label>
                          </div>
                        </div>

                      </div>
                    );
                  })()}
                </div>

                {/* Drawer Footer Buttons */}
                <div className={`pt-4 border-t flex justify-end gap-3 mt-auto ${isLight ? 'border-slate-200' : 'border-slate-800'}`}>
                  <button
                    type="button"
                    onClick={() => setEditDrawerAsset(null)}
                    className={`px-5 py-2.5 rounded-xl font-bold ${
                      isLight ? 'bg-slate-100 text-slate-700 hover:bg-slate-200' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold shadow-lg shadow-amber-600/20"
                  >
                    Lưu Thông Tin
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* RIGHT SLIDE-OVER DRAWER FOR THÊM TÀI SẢN THỦ CÔNG */}
      {createManualDrawer && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity" onClick={() => setCreateManualDrawer(false)}></div>

          <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
            <div className={`w-screen max-w-3xl ${isLight ? 'bg-white text-slate-800' : 'bg-slate-900 text-slate-100'} shadow-2xl border-l ${isLight ? 'border-slate-200' : 'border-slate-800'} flex flex-col`}>
              
              <div className={`p-6 border-b flex items-center justify-between ${isLight ? 'border-slate-200 bg-slate-50' : 'border-slate-800 bg-slate-950/50'}`}>
                <div>
                  <h3 className={`font-bold text-lg flex items-center gap-2 ${isLight ? 'text-slate-900' : 'text-white'}`}>
                    <Plus className="w-5 h-5 text-cyan-600" /> Thêm Mới Tài Sản Thủ Công
                  </h3>
                  <p className={`text-xs mt-1 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                    Dành cho các thiết bị không chạy Agent quét tự động (Máy in, Switch mạng, Monitor, Laptop cá nhân...)
                  </p>
                </div>
                <button onClick={() => setCreateManualDrawer(false)} className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateManualAssetSubmit} className="flex-1 flex flex-col min-h-0 overflow-hidden">
                <div className="flex-1 p-6 space-y-4 text-xs overflow-y-auto">
                  
                  {/* Mã tài sản & Trạng thái */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className={`font-bold ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                        Mã Tài Sản / QR Code <span className="text-rose-500 font-extrabold ml-0.5">*</span>
                      </label>
                      <input
                        type="text"
                        value={mAssetTag}
                        onChange={(e) => setMAssetTag(e.target.value)}
                        className={`w-full border rounded-xl px-3.5 py-2.5 font-mono font-bold ${
                          isLight ? 'bg-slate-50 border-slate-300 text-cyan-800' : 'bg-slate-950 border-slate-700 text-cyan-300'
                        }`}
                        placeholder="Mã tự động 1000360xx..."
                        required
                      />
                    </div>

                    <div className="space-y-1">
                      <label className={`font-bold ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                        Trạng Thái Khởi Tạo <span className="text-rose-500 font-extrabold ml-0.5">*</span>
                      </label>
                      <select
                        value={mStatus}
                        onChange={(e) => setMStatus(e.target.value)}
                        className={`w-full border rounded-xl px-3.5 py-2.5 font-bold ${
                          mStatus === 'READY' ? 'bg-cyan-50 border-cyan-300 text-cyan-800' :
                          mStatus === 'NEW' ? 'bg-blue-50 border-blue-300 text-blue-800' :
                          mStatus === 'IN_USE' ? 'bg-emerald-50 border-emerald-300 text-emerald-800' :
                          'bg-purple-50 border-purple-300 text-purple-800'
                        }`}
                      >
                        <option value="READY">Sẵn sàng cấp phát (Lưu kho)</option>
                        <option value="NEW">Mới (Mới mua về)</option>
                        <option value="IN_USE">Đang sử dụng (Gán cho bộ phận)</option>
                        <option value="MAINTENANCE">Đang bảo trì / Sửa chữa</option>
                      </select>
                    </div>
                  </div>

                  {/* Tên máy & Loại tài sản */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className={`font-bold ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                        Tên Thiết Bị / Hostname <span className="text-rose-500 font-extrabold ml-0.5">*</span>
                      </label>
                      <input
                        type="text"
                        value={mHostname}
                        onChange={(e) => setMHostname(e.target.value)}
                        placeholder="Nhập tên thiết bị / máy trạm..."
                        className={`w-full border rounded-xl px-3.5 py-2.5 font-bold ${
                          isLight ? 'bg-slate-50 border-slate-300 text-slate-800' : 'bg-slate-950 border-slate-700 text-slate-200'
                        }`}
                        required
                      />
                    </div>

                    <div className="space-y-1">
                      <label className={`font-bold ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>Loại Tài Sản</label>
                      <select
                        value={mAssetType}
                        onChange={(e) => setMAssetType(e.target.value)}
                        className={`w-full border rounded-xl px-3.5 py-2.5 font-bold ${
                          isLight ? 'bg-slate-50 border-slate-300 text-slate-800' : 'bg-slate-950 border-slate-700 text-slate-200'
                        }`}
                      >
                        {(localMeta.assetTypes && localMeta.assetTypes.length > 0) ? (
                          localMeta.assetTypes.map(t => (
                            <option key={t.id} value={t.name}>{t.name}</option>
                          ))
                        ) : (
                          <>
                            <option value="Máy In / Scanner / Photo">Máy In / Scanner / Photo</option>
                            <option value="Switch Mạng / Router / Firewall">Switch Mạng / Router / Firewall</option>
                            <option value="Màn Hình (Monitor / TV Display)">Màn Hình (Monitor / TV Display)</option>
                            <option value="Laptop / Máy Tính Xách Tay">Laptop / Máy Tính Xách Tay</option>
                            <option value="Máy Tính Để Bàn (Desktop PC)">Máy Tính Để Bàn (Desktop PC)</option>
                            <option value="Server / Máy Chủ Độc Lập">Server / Máy Chủ Độc Lập</option>
                            <option value="Thiết Bị IT Khác (UPS, Projector, NAS...)">Thiết Bị IT Khác (UPS, Projector, NAS...)</option>
                          </>
                        )}
                      </select>
                    </div>
                  </div>

                  {/* Serial & IP */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className={`font-bold ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>Số Serial Number</label>
                      <input
                        type="text"
                        value={mSerialNumber}
                        onChange={(e) => setMSerialNumber(e.target.value)}
                        placeholder="Nhập số Serial..."
                        className={`w-full border rounded-xl px-3.5 py-2.5 font-mono ${
                          isLight ? 'bg-slate-50 border-slate-300 text-slate-800' : 'bg-slate-950 border-slate-700 text-slate-200'
                        }`}
                      />
                    </div>

                    <div className="space-y-1">
                      <label className={`font-bold ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>Địa Chỉ IP Mạng</label>
                      <input
                        type="text"
                        value={mIpAddress}
                        onChange={(e) => setMIpAddress(e.target.value)}
                        placeholder="Nhập địa chỉ IP..."
                        className={`w-full border rounded-xl px-3.5 py-2.5 font-mono ${
                          isLight ? 'bg-slate-50 border-slate-300 text-slate-800' : 'bg-slate-950 border-slate-700 text-slate-200'
                        }`}
                      />
                    </div>
                  </div>

                  {/* Kho Lưu Trữ Nhập Ban Đầu & Hệ Điều Hành / Firmware */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className={`font-bold ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                        Kho Lưu Trữ Ban Đầu <span className="text-cyan-600 font-bold ml-1">(Chứa tài sản mới nhập)</span>
                      </label>
                      <select
                        value={mWarehouseId}
                        onChange={(e) => setMWarehouseId(e.target.value)}
                        className={`w-full border rounded-xl px-3.5 py-2.5 font-bold ${
                          isLight ? 'bg-cyan-50/70 border-cyan-300 text-cyan-900' : 'bg-slate-950 border-slate-700 text-cyan-300'
                        }`}
                      >
                        <option value="">-- Chọn Kho Lưu Trữ (Lưu kho ban đầu) --</option>
                        {(localMeta.warehouses || []).map(w => (
                          <option key={w.id} value={w.id}>{w.name}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className={`font-bold ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>Hệ Điều Hành / Firmware</label>
                      <input
                        type="text"
                        value={mOsInfo}
                        onChange={(e) => setMOsInfo(e.target.value)}
                        placeholder="Nhập hệ điều hành / firmware..."
                        className={`w-full border rounded-xl px-3.5 py-2.5 ${
                          isLight ? 'bg-slate-50 border-slate-300 text-slate-800' : 'bg-slate-950 border-slate-700 text-slate-200'
                        }`}
                      />
                    </div>
                  </div>

                  {/* Cấu hình phần cứng phụ (RAM / Disk / CPU) */}
                  <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 space-y-2">
                    <p className="font-bold text-slate-600 dark:text-slate-400">Thông Số Phần Cứng (Tùy chọn)</p>
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label className="text-[10px] text-slate-400 font-bold block">RAM (GB)</label>
                        <input
                          type="number"
                          value={mRamTotalGb}
                          onChange={(e) => setMRamTotalGb(e.target.value)}
                          placeholder="Dung lượng RAM..."
                          className={`w-full border rounded-lg px-2.5 py-1.5 text-xs ${
                            isLight ? 'bg-white border-slate-300' : 'bg-slate-900 border-slate-700'
                          }`}
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-400 font-bold block">Đĩa Cứng (GB)</label>
                        <input
                          type="number"
                          value={mDiskTotalGb}
                          onChange={(e) => setMDiskTotalGb(e.target.value)}
                          placeholder="Dung lượng đĩa..."
                          className={`w-full border rounded-lg px-2.5 py-1.5 text-xs ${
                            isLight ? 'bg-white border-slate-300' : 'bg-slate-900 border-slate-700'
                          }`}
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-400 font-bold block">CPU Model</label>
                        <input
                          type="text"
                          value={mCpuModel}
                          onChange={(e) => setMCpuModel(e.target.value)}
                          placeholder="Tên vi xử lý CPU..."
                          className={`w-full border rounded-lg px-2.5 py-1.5 text-xs ${
                            isLight ? 'bg-white border-slate-300' : 'bg-slate-900 border-slate-700'
                          }`}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Thông tin mua sắm */}
                  <div className="pt-2 pb-1">
                    <div className="relative flex py-1 items-center">
                      <div className="flex-grow border-t border-slate-200 dark:border-slate-800"></div>
                      <span className="flex-shrink mx-3 text-slate-400 text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5">
                        <DollarSign className="w-3.5 h-3.5 text-emerald-600" /> Thông Tin Mua Sắm & Giá Trị
                      </span>
                      <div className="flex-grow border-t border-slate-200 dark:border-slate-800"></div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className={`font-bold ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>Ngày Mua</label>
                      <DatePickerVN value={mPurchaseDate} onChange={setMPurchaseDate} isLight={isLight} />
                    </div>

                    <div className="space-y-1">
                      <label className={`font-bold ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>Giá Mua (VNĐ)</label>
                      <div className="relative">
                        <input
                          type="text"
                          placeholder="Nhập giá trị mua..."
                          value={formatCurrency(mPurchaseCost)}
                          onChange={(e) => setMPurchaseCost(e.target.value.replace(/\D/g, ''))}
                          className={`w-full border rounded-xl pl-3.5 pr-12 py-2.5 font-mono font-bold ${
                            isLight ? 'bg-slate-50 border-slate-300 text-emerald-700' : 'bg-slate-950 border-slate-700 text-emerald-400'
                          }`}
                        />
                        <span className="absolute right-3.5 top-1/2 -translate-y-1/2 font-extrabold text-[10px] text-slate-400">VNĐ</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className={`font-bold ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>Nhà Cung Cấp</label>
                      <select
                        value={mVendorSupplier}
                        onChange={(e) => setMVendorSupplier(e.target.value)}
                        className={`w-full border rounded-xl px-3.5 py-2.5 font-bold ${
                          isLight ? 'bg-slate-50 border-slate-300 text-slate-800' : 'bg-slate-950 border-slate-700 text-slate-200'
                        }`}
                      >
                        <option value="">-- Chọn Nhà Cung Cấp --</option>
                        {(localMeta.suppliers || []).map(s => (
                          <option key={s.id} value={s.name}>{s.name}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className={`font-bold ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>Ngày Hết Bảo Hành</label>
                      <DatePickerVN value={mWarrantyExpirationDate} onChange={setMWarrantyExpirationDate} isLight={isLight} />
                    </div>
                  </div>

                  {/* Hồ sơ đính kèm PO */}
                  <div className="space-y-1.5">
                    <label className={`font-bold ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>Hồ Sơ PO / Hợp Đồng Đính Kèm</label>
                    <div className={`p-3 rounded-xl border border-dashed text-center transition cursor-pointer relative ${
                      isLight ? 'bg-slate-50 border-slate-300 hover:border-cyan-500' : 'bg-slate-950 border-slate-700 hover:border-cyan-500'
                    }`}>
                      <input
                        type="file"
                        multiple
                        onChange={(e) => handleMultipleFilesUpload(e, setMPoFiles)}
                        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                      />
                      <div className="flex flex-col items-center justify-center gap-1 py-1">
                        <Upload className="w-5 h-5 text-cyan-600" />
                        <p className="text-xs font-bold text-cyan-600">Nhấp để tải lên hồ sơ đính kèm</p>
                      </div>
                    </div>

                    {mPoFiles.length > 0 && (
                      <div className="space-y-1 pt-1">
                        {mPoFiles.map((file, idx) => (
                          <div key={idx} className={`p-2 rounded-lg border flex items-center justify-between text-xs ${
                            isLight ? 'bg-slate-100 border-slate-200' : 'bg-slate-800 border-slate-700'
                          }`}>
                            <div className="flex items-center gap-2 truncate">
                              <Paperclip className="w-3.5 h-3.5 text-cyan-600 shrink-0" />
                              <span className="font-semibold truncate">{file.name}</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleRemoveFile(idx, setMPoFiles)}
                              className="p-1 text-slate-400 hover:text-rose-500"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Ghi chú */}
                  <div className="space-y-1">
                    <label className={`font-bold ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>Ghi Chú Vận Hành</label>
                    <textarea
                      rows={2}
                      placeholder="Nhập ghi chú kỹ thuật, IP tĩnh, vị trí cáp kết nối..."
                      value={mNotes}
                      onChange={(e) => setMNotes(e.target.value)}
                      className={`w-full border rounded-xl px-3.5 py-2.5 ${
                        isLight ? 'bg-slate-50 border-slate-300 text-slate-800' : 'bg-slate-950 border-slate-700 text-slate-200'
                      }`}
                    />
                  </div>

                </div>

                {/* STICKY FOOTER BUTTONS */}
                <div className={`p-4 px-6 border-t flex justify-end gap-3 shrink-0 ${isLight ? 'border-slate-200 bg-slate-50/90' : 'border-slate-800 bg-slate-950/90'}`}>
                  <button
                    type="button"
                    onClick={() => setCreateManualDrawer(false)}
                    className={`px-5 py-2.5 rounded-xl font-bold ${
                      isLight ? 'bg-slate-100 text-slate-700 hover:bg-slate-200' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold shadow-lg shadow-cyan-600/20 flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" /> Thêm Tài Sản
                  </button>
                </div>
              </form>

            </div>
          </div>
        </div>
      )}

      {/* Printable QR Sticker Modal */}
      {printQrModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4">
          <div className={`${isLight ? 'bg-white text-slate-800' : 'glass-card-dark text-slate-100'} w-full max-w-md p-6 rounded-2xl border ${isLight ? 'border-slate-200' : 'border-slate-800'} text-center space-y-6`}>
            <h3 className={`font-bold text-lg ${isLight ? 'text-slate-900' : 'text-white'}`}>Tem Dán Mã QR Tài Sản IT</h3>

            <div className="p-6 bg-white rounded-2xl inline-block shadow-2xl space-y-2 text-slate-950 border border-slate-200">
              <p className="font-extrabold text-sm tracking-wider uppercase">CÔNG TY IT ASSET MANAGEMENT</p>
              <div className="flex justify-center my-3">
                <QRCodeSVG value={printQrModal.qr_code} size={150} />
              </div>
              <p className="font-mono font-extrabold text-lg text-cyan-900">{printQrModal.asset_tag}</p>
              <p className="text-xs font-bold text-slate-700">{printQrModal.hostname}</p>
            </div>

            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => window.print()}
                className="px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow-lg shadow-cyan-600/20 flex items-center gap-2"
              >
                <Printer className="w-4 h-4" /> In Tem Mã QR (Sticker)
              </button>
              <button
                onClick={() => setPrintQrModal(null)}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold ${
                  isLight ? 'bg-slate-100 text-slate-700 hover:bg-slate-200' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
