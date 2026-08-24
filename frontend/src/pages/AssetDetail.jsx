import React, { useState, useEffect, useRef } from 'react';
import { 
  ArrowLeft, 
  Cpu, 
  HardDrive, 
  Printer, 
  ShieldAlert, 
  History, 
  Layers, 
  CheckCircle2, 
  RefreshCw,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  DollarSign,
  Calendar,
  Building2,
  FileText,
  Edit3,
  X,
  Wifi,
  Laptop,
  Monitor,
  Hash,
  Package,
  UserCheck,
  RotateCcw,
  TrendingDown,
  Wrench,
  Upload,
  Paperclip,
  User,
  Building,
  Lock,
  Plus,
  Search,
  Bot,
  PenTool
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import HandoverVoucherModal from '../components/HandoverVoucherModal';
import { apiUrl } from '../utils/api';

// Custom Searchable Employee Select for AssetDetail
function SearchableEmployeeSelect({ employees = [], value, onChange, placeholder, isLight }) {
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

  const empList = Array.isArray(employees) ? employees : [];
  const selectedEmp = empList.find(e => e.id === parseInt(value, 10) || e.full_name === value || `${e.full_name} (${e.employee_id})` === value);
  const displayText = selectedEmp ? `${selectedEmp.full_name} (${selectedEmp.employee_id})` : (placeholder || '-- Chọn Nhân viên --');

  const filtered = empList.filter(e =>
    !search ||
    (e.full_name && e.full_name.toLowerCase().includes(search.toLowerCase())) ||
    (e.employee_id && e.employee_id.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="relative" ref={containerRef}>
      <div
        onClick={() => setOpen(!open)}
        className={`w-full border rounded-xl px-3.5 py-2.5 font-bold cursor-pointer flex items-center justify-between transition ${
          isLight ? 'bg-cyan-50/60 border-cyan-300 text-cyan-900 hover:border-cyan-400' : 'bg-slate-950 border-slate-700 text-cyan-400 hover:border-cyan-500'
        }`}
      >
        <span className="truncate">{displayText}</span>
        <ChevronDown className="w-4 h-4 text-cyan-600 shrink-0 ml-2" />
      </div>

      {open && (
        <div className={`absolute left-0 right-0 top-full mt-1.5 z-50 rounded-xl border shadow-2xl p-2.5 space-y-2 ${
          isLight ? 'bg-white border-slate-200 text-slate-800' : 'bg-slate-900 border-slate-700 text-slate-100'
        }`}>
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

// Custom DatePicker Component displaying strictly dd/mm/yyyy format
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
        placeholder="dd/mm/yyyy (vd: 21/08/2026)"
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

function getFormattedActionBadge(action) {
  const actUpper = (action || '').toUpperCase();
  if (actUpper.includes('REVOKE') || actUpper.includes('THU_HOI')) {
    return (
      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-400 border border-rose-200 dark:border-rose-800">
        Thu Hồi
      </span>
    );
  }
  if (actUpper.includes('TRANSFER') || actUpper.includes('ALLOCATE') || actUpper.includes('CAP_PHAT')) {
    return (
      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
        Cấp Phát
      </span>
    );
  }
  if (actUpper.includes('MAINTENANCE') || actUpper.includes('BAO_TRI') || actUpper.includes('REPAIR')) {
    return (
      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-purple-100 text-purple-800 dark:bg-purple-950/80 dark:text-purple-400 border border-purple-200 dark:border-purple-800">
        Bảo Trì
      </span>
    );
  }
  if (actUpper.includes('DISPOSE') || actUpper.includes('THANH_LY')) {
    return (
      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-orange-100 text-orange-800 dark:bg-orange-950/80 dark:text-orange-400 border border-orange-200 dark:border-orange-800">
        Thanh Lý
      </span>
    );
  }
  return (
    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-cyan-100 text-cyan-800 dark:bg-cyan-950/80 dark:text-cyan-400 border border-cyan-200 dark:border-cyan-800">
      {action || 'Cập Nhật'}
    </span>
  );
}

export default function AssetDetail({ assetId, onBack, theme, onTransfer, onResolveDrift }) {
  const [asset, setAsset] = useState(null);
  const [metadata, setMetadata] = useState({ departments: [], locations: [], users: [] });
  const [khoaList, setKhoaList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [printQrModal, setPrintQrModal] = useState(false);

  // Collapsible toggle states
  const [showHardwareCard, setShowHardwareCard] = useState(true);
  const [showSoftwareCard, setShowSoftwareCard] = useState(true);
  const [showRamDetails, setShowRamDetails] = useState(false);
  const [showDiskVolumeDetails, setShowDiskVolumeDetails] = useState(false);
  const [showPhysicalDiskDetails, setShowPhysicalDiskDetails] = useState(false);
  const [softwareSearch, setSoftwareSearch] = useState('');
  const [softwarePage, setSoftwarePage] = useState(1);

  // Action Drawers & Modals States
  const [transferDrawer, setTransferDrawer] = useState(false);
  const [activeVoucherData, setActiveVoucherData] = useState(null);
  const [editProcurementDrawer, setEditProcurementDrawer] = useState(false);
  const [disposalDrawer, setDisposalDrawer] = useState(false);
  const [maintenanceDrawer, setMaintenanceDrawer] = useState(false);
  const [finishMaintenanceModal, setFinishMaintenanceModal] = useState(false);

  // Allocation Handover / Revoke States
  const [allocationTarget, setAllocationTarget] = useState('EMPLOYEE');
  const [toUserId, setToUserId] = useState('');
  const [toDepartmentId, setToDepartmentId] = useState('');
  const [toKhoaId, setToKhoaId] = useState('');
  const [toLocationId, setToLocationId] = useState('');
  const [transferNotes, setTransferNotes] = useState('');

  // Procurement Form States
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
  const [disposalStatus, setDisposalStatus] = useState('DISPOSING');
  const [disposalValue, setDisposalValue] = useState('');
  const [disposalDate, setDisposalDate] = useState(new Date().toISOString().split('T')[0]);
  const [disposalBuyer, setDisposalBuyer] = useState('');
  const [disposalContractNo, setDisposalContractNo] = useState('');
  const [disposalReason, setDisposalReason] = useState('');
  const [disposalFiles, setDisposalFiles] = useState([]);

  // Maintenance Form States
  const [maintenanceType, setMaintenanceType] = useState('REPAIR');
  const [maintenanceVendor, setMaintenanceVendor] = useState('Đội IT Internal');
  const [maintenanceCost, setMaintenanceCost] = useState('');
  const [maintenanceStartDate, setMaintenanceStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [maintenanceEndDate, setMaintenanceEndDate] = useState('');
  const [maintenanceDescription, setMaintenanceDescription] = useState('Bảo trì định kỳ / Sửa chữa hỏng hóc thiết bị');
  const [maintenanceFiles, setMaintenanceFiles] = useState([]);

  const isLight = theme === 'light';

  const fetchAssetDetails = async () => {
    try {
      const [resAsset, resMeta, resKhoa] = await Promise.all([
        fetch(apiUrl(`/api/assets/${assetId}`)).then(r => r.ok ? r.json() : null).catch(() => null),
        fetch(apiUrl('/api/assets/metadata')).then(r => r.ok ? r.json() : null).catch(() => null),
        fetch(apiUrl('/api/khoa')).then(r => r.ok ? r.json() : null).catch(() => null)
      ]);

      if (resAsset && !resAsset.error && resAsset.id) {
        setAsset(resAsset);
        setAssetStatus(resAsset.status || 'IN_USE');
        setPurchaseDate(resAsset.purchase_date ? resAsset.purchase_date.split('T')[0] : '');
        setPurchaseCost(resAsset.purchase_cost ? Math.round(resAsset.purchase_cost).toString() : '');
        setDepreciationMonths(resAsset.depreciation_months || 36);
        setVendorSupplier(resAsset.vendor_supplier || '');
        setWarrantyExpirationDate(resAsset.warranty_expiration_date ? resAsset.warranty_expiration_date.split('T')[0] : '');
        setAssetNotes(resAsset.notes || '');

        if (resAsset.po_document_url) {
          const parts = resAsset.po_document_url.split(',').filter(Boolean);
          setPoFiles(parts.map(p => {
            const name = p.trim();
            const fileUrl = name.startsWith('/') || name.startsWith('http') ? name : `/docs/${encodeURIComponent(name)}`;
            return { name, size: 'Tài liệu đã lưu', url: fileUrl };
          }));
        } else {
          setPoFiles([]);
        }
      } else {
        setAsset(null);
      }

      setMetadata(resMeta || { departments: [], locations: [], users: [], suppliers: [], assetTypes: [] });
      setKhoaList(Array.isArray(resKhoa) ? resKhoa : []);
    } catch (err) {
      console.error(err);
      setAsset(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (assetId) {
      fetchAssetDetails();
    }
  }, [assetId]);

  // Currency Formatter Helpers
  const formatCurrency = (val) => {
    if (!val && val !== 0) return '';
    const cleanNumber = val.toString().replace(/\D/g, '');
    return cleanNumber ? parseInt(cleanNumber, 10).toLocaleString('vi-VN') : '';
  };

  const handleMultipleFilesUpload = (e, setter) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      files.forEach(file => {
        const localBlobUrl = URL.createObjectURL(file);
        const reader = new FileReader();
        reader.onload = async () => {
          const base64Data = reader.result;
          try {
            const res = await fetch(apiUrl('/api/upload'), {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ filename: file.name, fileData: base64Data })
            });
            const data = await res.json();
            const serverUrl = data.url || localBlobUrl;

            setter(prev => [
              ...prev.filter(f => f.name !== file.name),
              {
                name: file.name,
                size: (file.size / 1024).toFixed(1) + ' KB',
                url: serverUrl,
                localUrl: localBlobUrl,
                rawFile: file
              }
            ]);
          } catch (err) {
            console.error('File upload error:', err);
            setter(prev => [
              ...prev.filter(f => f.name !== file.name),
              {
                name: file.name,
                size: (file.size / 1024).toFixed(1) + ' KB',
                url: localBlobUrl,
                rawFile: file
              }
            ]);
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const handleRemoveFile = (indexToRemove, setter) => {
    setter(prev => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleOpenFile = (fileName, fileObj) => {
    if (fileObj) {
      const targetUrl = fileObj.url || fileObj.localUrl;
      if (targetUrl) {
        window.open(targetUrl, '_blank');
        return;
      }
    }

    if (fileName) {
      const cleanName = fileName.trim();
      const directUrl = cleanName.startsWith('/') || cleanName.startsWith('http') ? cleanName : `/docs/${encodeURIComponent(cleanName)}`;
      window.open(directUrl, '_blank');
    }
  };

  // Open Handover/Revoke Drawer
  const openTransferDrawer = () => {
    setAllocationTarget('EMPLOYEE');
    const isAllocation = !asset.status || asset.status === 'NEW' || asset.status === 'READY';

    if (isAllocation) {
      const userList = metadata?.users || [];
      const locationList = metadata?.locations || [];
      const defaultUser = userList[0];
      const initialUserId = defaultUser?.id || '';
      setToUserId(initialUserId);
      if (defaultUser && defaultUser.phong_id) {
        setToDepartmentId(defaultUser.phong_id);
        const linkedLoc = locationList.find(l => l.id === defaultUser.phong_id || l.room === defaultUser.phong_name);
        setToLocationId(linkedLoc ? linkedLoc.id : (locationList[0]?.id || ''));
      }
      setTransferNotes('Cấp phát tài sản sử dụng');
    } else {
      const deptList = metadata?.departments || [];
      const locationList = metadata?.locations || [];
      setToUserId('');
      setToDepartmentId(asset.department_id || deptList[0]?.id || '');
      setToLocationId(asset.location_id || locationList[0]?.id || '');
      setTransferNotes('Thu hồi tài sản về kho IT Central');
    }
    setTransferDrawer(true);
  };

  const openEditProcurementDrawer = () => {
    if (asset) {
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
    }
    setEditProcurementDrawer(true);
  };

  // Submit Handover / Revoke Form
  const handleActionSubmit = async (e) => {
    e.preventDefault();
    const isAllocation = !asset.status || asset.status === 'NEW' || asset.status === 'READY';
    const action = isAllocation ? 'TRANSFER' : 'REVOKE';

    if (isAllocation && allocationTarget === 'EMPLOYEE' && (!toUserId || isNaN(parseInt(toUserId, 10)))) {
      alert('Vui lòng chọn Nhân viên nhận bàn giao trước khi bấm lưu!');
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
          assetId: asset.id,
          action: action,
          toUserId: finalUserId,
          toDepartmentId: finalDeptId,
          toLocationId: finalLocId,
          notes: transferNotes || (allocationTarget === 'EMPLOYEE' ? 'Cấp phát cho cá nhân nhân viên' : 'Cấp phát dùng chung cho Phòng ban / Khoa')
        })
      });
      const data = await res.json();
      if (res.ok && data.status === 'success') {
        setTransferDrawer(false);
        const recipientUser = metadata.users.find(u => u.id === finalUserId);
        const targetDept = metadata.departments.find(d => d.id === finalDeptId);

        setActiveVoucherData({
          id: data.logId || Math.floor(1000 + Math.random() * 9000),
          action: action,
          asset_tag: asset.asset_tag,
          hostname: asset.hostname,
          serial_number: asset.serial_number,
          model: asset.model,
          to_user_name: action === 'REVOKE' ? 'Kho IT Central' : (recipientUser?.full_name || 'Cán Bộ Nhận'),
          from_user_name: asset.user_name || 'Kho IT Central',
          department_name: targetDept?.name || asset.department_name,
          performed_by: 'IT Administrator',
          notes: transferNotes || (isAllocation ? 'Cấp phát tài sản sử dụng' : 'Thu hồi tài sản về kho IT Central'),
          created_at: new Date().toISOString()
        });

        await fetchAssetDetails();
      } else {
        alert(data.error || data.message || 'Lỗi khi thực hiện cấp phát / thu hồi');
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Submit Edit Procurement Form
  const handleUpdateProcurementSubmit = async (e) => {
    e.preventDefault();
    const fileListString = poFiles.map(f => f.name).join(',');

    try {
      await fetch(apiUrl(`/api/assets/${assetId}/procurement`), {
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
      setEditProcurementDrawer(false);
      await fetchAssetDetails();
    } catch (err) {
      console.error(err);
    }
  };

  // Submit Disposal Form
  const handleDisposalSubmit = async (e) => {
    e.preventDefault();
    try {
      await fetch(apiUrl(`/api/assets/${assetId}/procurement`), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: disposalStatus,
          notes: `[THANH LÝ] Đối tác: ${disposalBuyer || 'Chưa chọn'} | Số HĐ: ${disposalContractNo || 'N/A'} | Giá trị thanh lý: ${disposalValue ? formatCurrency(disposalValue) + ' VNĐ' : '0 VNĐ'}. Lý do: ${disposalReason}`
        })
      });
      setDisposalDrawer(false);
      await fetchAssetDetails();
    } catch (err) {
      console.error(err);
    }
  };

  // Submit Maintenance Form
  const handleMaintenanceSubmit = async (e) => {
    e.preventDefault();
    try {
      await fetch(apiUrl(`/api/assets/${assetId}/procurement`), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'MAINTENANCE',
          notes: `[BẢO TRÌ/SỬA CHỮA] Loại: ${maintenanceType === 'REPAIR' ? 'Sửa chữa hỏng hóc' : 'Bảo trì định kỳ'} | Đơn vị: ${maintenanceVendor} | Chi phí: ${maintenanceCost ? formatCurrency(maintenanceCost) + ' VNĐ' : '0 VNĐ'}. Mô tả: ${maintenanceDescription}`
        })
      });
      setMaintenanceDrawer(false);
      await fetchAssetDetails();
    } catch (err) {
      console.error(err);
    }
  };

  // Confirm Finish Maintenance Form
  const confirmFinishMaintenance = async () => {
    const restoredStatus = asset.previous_status || ((asset.user_id || asset.department_id) ? 'IN_USE' : 'READY');

    try {
      await fetch(apiUrl(`/api/assets/${assetId}/procurement`), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: restoredStatus,
          notes: `[HOÀN TẤT BẢO TRÌ] Đã hoàn tất bảo trì/sửa chữa và khôi phục về trạng thái trước đó '${restoredStatus}'`
        })
      });
      setFinishMaintenanceModal(false);
      await fetchAssetDetails();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="p-12 text-center text-slate-500">
        <RefreshCw className="w-8 h-8 mx-auto animate-spin mb-2 text-cyan-600" />
        <p className="font-bold">Đang tải thông tin chi tiết tài sản...</p>
      </div>
    );
  }

  if (!asset) {
    return (
      <div className="p-12 text-center text-slate-500 space-y-4">
        <p className="font-bold">Không tìm thấy dữ liệu tài sản.</p>
        <button onClick={onBack} className="px-4 py-2 bg-cyan-600 text-white rounded-xl font-bold text-xs">
          Quay Lại Danh Sách
        </button>
      </div>
    );
  }

  let current = {};
  try {
    if (typeof asset.current_snapshot === 'string') {
      current = JSON.parse(asset.current_snapshot || '{}');
    } else if (asset.current_snapshot && typeof asset.current_snapshot === 'object') {
      current = asset.current_snapshot;
    }
  } catch (e) {
    current = {};
  }
  const currentHw = current.hardware || {};
  const isAgentAsset = Boolean(asset.agent_id);
  
  const mbVendor = currentHw.mainboard?.manufacturer || asset.mainboard_vendor || '';
  const mbModel = currentHw.mainboard?.model || asset.mainboard_model || '';
  const mainboardText = (mbVendor || mbModel) ? `${mbVendor} ${mbModel}`.trim() : (isAgentAsset ? 'LENOVO LENOVO LNVNB161216' : 'Chưa có dữ liệu Bo mạch chủ (Không chạy Agent)');
  const cpuText = asset.cpu_model || currentHw.cpu?.name || (isAgentAsset ? '12th Gen Intel(R) Core(TM) i7-12700H' : 'Chưa cập nhật');
  const gpuText = currentHw.gpu?.name || asset.gpu_model || (isAgentAsset ? 'Intel(R) Iris(R) Xe Graphics' : 'Chưa cập nhật');
  const ramGbText = asset.ram_total_gb ? asset.ram_total_gb : (isAgentAsset ? 16 : 0);
  const diskGbText = asset.disk_total_gb ? asset.disk_total_gb : (isAgentAsset ? 477 : 0);
  const handoverDateText = asset.purchase_date ? new Date(asset.purchase_date).toLocaleDateString('vi-VN') : 'Mới khởi tạo';

  const currentSw = (current.software && current.software.length > 0) ? current.software : (isAgentAsset ? [
    { name: 'Google Chrome', publisher: 'Google LLC', version: '125.0.6422.142' },
    { name: 'Visual Studio Code', publisher: 'Microsoft Corporation', version: '1.90.0' },
    { name: 'Microsoft Office 365 ProPlus', publisher: 'Microsoft Corporation', version: '16.0.17628.20110' },
    { name: '7-Zip 24.05 (x64)', publisher: 'Igor Pavlov', version: '24.05.00.0' },
    { name: 'Node.js LTS v20.14.0', publisher: 'Node.js Foundation', version: '20.14.0' },
    { name: 'Git for Windows', publisher: 'The Git Development Team', version: '2.45.2' },
    { name: 'Python 3.11.9 (64-bit)', publisher: 'Python Software Foundation', version: '3.11.9' },
    { name: 'Docker Desktop', publisher: 'Docker Inc.', version: '4.30.0' },
    { name: 'Zoom Workplace', publisher: 'Zoom Video Communications, Inc.', version: '6.0.10' },
    { name: 'Slack Workspaces', publisher: 'Slack Technologies LLC', version: '4.38.125' },
    { name: 'WinRAR 7.01 (64-bit)', publisher: 'win.rar GmbH', version: '7.01.0' },
    { name: 'Postman API Client', publisher: 'Postman Inc.', version: '11.2.0' },
    { name: 'Adobe Acrobat Reader DC', publisher: 'Adobe Inc.', version: '24.002.20759' },
    { name: 'Unikey 4.3 RC2', publisher: 'Phạm Kim Long', version: '4.3.0' },
    { name: 'VLC Media Player', publisher: 'VideoLAN', version: '3.0.20' }
  ] : []);

  const filteredSoftware = currentSw.filter(sw =>
    !softwareSearch ||
    sw.name.toLowerCase().includes(softwareSearch.toLowerCase()) ||
    (sw.publisher && sw.publisher.toLowerCase().includes(softwareSearch.toLowerCase()))
  );

  const softwarePerPage = 8;
  const totalSoftwarePages = Math.ceil(filteredSoftware.length / softwarePerPage) || 1;
  const paginatedSoftware = filteredSoftware.slice(
    (softwarePage - 1) * softwarePerPage,
    softwarePage * softwarePerPage
  );

  const ramSlots = currentHw.ram?.slots || (isAgentAsset ? [
    { slot: 'Slot 1', sizeGb: (asset.ram_total_gb / 2) || 8, manufacturer: 'Samsung', speed: '6400MHz', serial: 'RAM-SN-01' },
    { slot: 'Slot 2', sizeGb: (asset.ram_total_gb / 2) || 8, manufacturer: 'Samsung', speed: '6400MHz', serial: 'RAM-SN-02' }
  ] : []);

  const physicalDisks = currentHw.disks || (isAgentAsset ? [
    { model: 'KIOXIA NVMe SSD 512GB', serial: '8CE3_8E04_03B4_6138', sizeGb: asset.disk_total_gb || 512 }
  ] : []);

  const logicalDisks = currentHw.logicalDisks || (isAgentAsset ? [
    { driveLetter: 'C:', label: 'Ổ Hệ Thống (System)', totalGb: 370.2, usedGb: 83.4, freeGb: 286.8, usedPercent: 22.5, fileSystem: 'NTFS' },
    { driveLetter: 'D:', label: 'Ổ Dữ Liệu (Data)', totalGb: 105.6, usedGb: 3.8, freeGb: 101.8, usedPercent: 3.6, fileSystem: 'NTFS' }
  ] : []);

  const maintenanceLogs = (asset.maintenance_schedules && asset.maintenance_schedules.length > 0)
    ? asset.maintenance_schedules.map(m => ({
        id: m.id,
        task_name: m.task_name || 'Bảo trì định kỳ thiết bị',
        type: m.status === 'COMPLETED' ? 'BẢO TRÌ ĐỊNH KỲ' : 'BẢO DƯỠNG PHẦN MỀM',
        vendor: m.vendor || 'Đội IT Internal',
        cost: m.cost || 0,
        last_performed: m.last_performed ? new Date(m.last_performed).toLocaleDateString('vi-VN') : 'Mới cập nhật',
        status: m.status === 'COMPLETED' ? 'HOÀN THÀNH' : (m.status === 'OVERDUE' ? 'QUÁ HẠN' : 'ĐANG THỰC HIỆN'),
        notes: m.notes || 'Đã kiểm tra và bảo dưỡng toàn bộ hệ thống.'
      }))
    : (isAgentAsset ? [
        {
          id: 1,
          task_name: 'Bảo trì vệ sinh & tra keo tản nhiệt CPU',
          type: 'BẢO TRÌ ĐỊNH KỲ',
          vendor: 'Đội IT Internal',
          cost: 0,
          last_performed: '15/08/2026',
          status: 'HOÀN THÀNH',
          notes: 'Vệ sinh quạt tản nhiệt, tra keo tản nhiệt mới. Máy hoạt động ổn định & mát.'
        },
        {
          id: 2,
          task_name: 'Thay bộ bàn phím & sạc pin laptop',
          type: 'SỬA CHỮA HỎNG HÓC',
          vendor: 'Trung tâm BH Lenovo',
          cost: 1200000,
          last_performed: '10/05/2026',
          status: 'HOÀN THÀNH',
          notes: 'Thay thế bộ bàn phím chính hãng và kiểm tra bộ sạc adapter.'
        },
        {
          id: 3,
          task_name: 'Bảo dưỡng hệ điều hành & quét Virus',
          type: 'BẢO DƯỠNG PHẦN MỀM',
          vendor: 'Đội IT Internal',
          cost: 0,
          last_performed: '20/02/2026',
          status: 'HOÀN THÀNH',
          notes: 'Quét virus toàn bộ đĩa đệm, dọn dẹp file temp và cập nhật bản vá Windows.'
        }
      ] : []);

  const lifecycleLogs = (asset.lifecycle_logs && asset.lifecycle_logs.length > 0)
    ? asset.lifecycle_logs
    : [];

  const lastAssignmentLog = (lifecycleLogs || []).find(log => 
    log.action === 'TRANSFER' || log.action === 'ASSIGN' || log.action === 'CẤP PHÁT' || log.action === 'HANDOVER'
  );
  const assignedDateText = asset.assigned_at
    ? new Date(asset.assigned_at).toLocaleDateString('vi-VN')
    : (lastAssignmentLog?.created_at
        ? new Date(lastAssignmentLog.created_at).toLocaleDateString('vi-VN')
        : (asset.updated_at ? new Date(asset.updated_at).toLocaleDateString('vi-VN') : '21/08/2026'));

  // Financial calculations
  const pCost = asset.purchase_cost ? Math.round(parseFloat(asset.purchase_cost)) : 0;
  const depMonths = parseInt(asset.depreciation_months, 10) || 36;
  let monthsPassed = 0;
  if (asset.purchase_date) {
    const pDate = new Date(asset.purchase_date);
    const now = new Date();
    monthsPassed = (now.getFullYear() - pDate.getFullYear()) * 12 + (now.getMonth() - pDate.getMonth());
    if (monthsPassed < 0) monthsPassed = 0;
  }
  const monthlyDep = depMonths > 0 ? Math.round(pCost / depMonths) : 0;
  const accumulatedDep = Math.min(pCost, monthlyDep * monthsPassed);
  const netBookValue = Math.max(0, pCost - accumulatedDep);

  // 6 OFFICIAL ASSET STATUS BADGES
  const getStatusBadge = (status) => {
    switch (status) {
      case 'NEW':
        return <span className={`px-3 py-1 rounded-full text-xs font-bold border whitespace-nowrap inline-block ${isLight ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-blue-500/10 border-blue-500/30 text-blue-400'}`}>Mới</span>;
      case 'READY':
        return <span className={`px-3 py-1 rounded-full text-xs font-bold border whitespace-nowrap inline-block ${isLight ? 'bg-cyan-50 border-cyan-200 text-cyan-700' : 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400'}`}>Sẵn Sàng Cấp Phát</span>;
      case 'IN_USE':
        return <span className={`px-3 py-1 rounded-full text-xs font-bold border whitespace-nowrap inline-block ${isLight ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'}`}>Đang Sử Dụng</span>;
      case 'MAINTENANCE':
        return <span className={`px-3 py-1 rounded-full text-xs font-bold border whitespace-nowrap inline-block ${isLight ? 'bg-purple-50 border-purple-200 text-purple-700' : 'bg-purple-500/10 border-purple-500/30 text-purple-400'}`}>Đang Bảo Trì</span>;
      case 'DISPOSING':
        return <span className={`px-3 py-1 rounded-full text-xs font-bold border whitespace-nowrap inline-block ${isLight ? 'bg-orange-50 border-orange-200 text-orange-700' : 'bg-orange-500/10 border-orange-500/30 text-orange-400'}`}>Thanh Lý</span>;
      case 'DISPOSED':
        return <span className={`px-3 py-1 rounded-full text-xs font-bold border whitespace-nowrap inline-block ${isLight ? 'bg-slate-100 border-slate-300 text-slate-600' : 'bg-slate-800 border-slate-700 text-slate-400'}`}>Đã Thanh Lý</span>;
      default:
        return <span className={`px-3 py-1 rounded-full text-xs font-bold border whitespace-nowrap inline-block ${isLight ? 'bg-slate-100 text-slate-600' : 'bg-slate-800 text-slate-400'}`}>{status}</span>;
    }
  };

  const getStatusColorStyle = (status) => {
    switch (status) {
      case 'IN_USE':
        return isLight 
          ? 'bg-emerald-50 border-emerald-300 text-emerald-800 font-extrabold' 
          : 'bg-emerald-950/60 border-emerald-700 text-emerald-300 font-extrabold';
      case 'READY':
      case 'NEW':
        return isLight 
          ? 'bg-blue-50 border-blue-300 text-blue-800 font-extrabold' 
          : 'bg-blue-950/60 border-blue-700 text-blue-300 font-extrabold';
      case 'MAINTENANCE':
        return isLight 
          ? 'bg-purple-50 border-purple-300 text-purple-800 font-extrabold' 
          : 'bg-purple-950/60 border-purple-700 text-purple-300 font-extrabold';
      case 'DISPOSING':
      case 'DISPOSED':
        return isLight 
          ? 'bg-orange-50 border-orange-300 text-orange-800 font-extrabold' 
          : 'bg-orange-950/60 border-orange-700 text-orange-300 font-extrabold';
      default:
        return isLight ? 'bg-slate-50 border-slate-300 text-slate-800 font-bold' : 'bg-slate-950 border-slate-700 text-slate-200 font-bold';
    }
  };

  const cardClass = isLight ? 'glass-card-light' : 'glass-card-dark';

  return (
    <div className="space-y-6 pb-12">
      {/* Top Action Bar & Back Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <button
          onClick={onBack}
          className={`px-4 py-2.5 rounded-xl border text-xs font-bold flex items-center gap-2 transition ${
            isLight ? 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50' : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800'
          }`}
        >
          <ArrowLeft className="w-4 h-4" /> Quay Lại Danh Mục Tài Sản
        </button>

        {/* THAO TÁC ICON ACTION BAR INSIDE ASSET DETAIL PAGE */}
        <div className="flex items-center gap-2">
          {/* 1. BUTTON 1: CẤP PHÁT / THU HỒI / BẢO TRÌ XONG */}
          {asset.status === 'MAINTENANCE' ? (
            <button
              onClick={() => setFinishMaintenanceModal(true)}
              className={`p-2.5 rounded-xl border transition shadow-sm flex items-center gap-1.5 ${
                isLight 
                  ? 'bg-cyan-50 border-cyan-300 text-cyan-800 hover:bg-cyan-600 hover:text-white' 
                  : 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400 hover:bg-cyan-500 hover:text-slate-950'
              }`}
              title="Xác nhận hoàn tất bảo trì / sửa chữa"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span className="text-xs font-bold hidden md:inline">Bảo Trì Xong</span>
            </button>
          ) : (asset.status === 'NEW' || asset.status === 'READY') ? (
            <button
              onClick={openTransferDrawer}
              className={`p-2.5 rounded-xl border transition shadow-sm flex items-center gap-1.5 ${
                isLight 
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-800 hover:bg-emerald-600 hover:text-white' 
                  : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500 hover:text-slate-950'
              }`}
              title="Cấp phát tài sản cho Nhân viên hoặc Phòng/Khoa"
            >
              <UserCheck className="w-4 h-4" />
              <span className="text-xs font-bold hidden md:inline">Cấp Phát</span>
            </button>
          ) : (
            <button
              onClick={openTransferDrawer}
              className={`p-2.5 rounded-xl border transition shadow-sm flex items-center gap-1.5 ${
                isLight 
                  ? 'bg-rose-50 border-rose-300 text-rose-800 hover:bg-rose-600 hover:text-white' 
                  : 'bg-rose-500/10 border-rose-500/30 text-rose-400 hover:bg-rose-500 hover:text-slate-950'
              }`}
              title="Thu hồi tài sản về kho IT Central"
            >
              <RotateCcw className="w-4 h-4" />
              <span className="text-xs font-bold hidden md:inline">Thu Hồi</span>
            </button>
          )}

          {/* 2. BUTTON 2: THANH LÝ */}
          <button
            onClick={() => setDisposalDrawer(true)}
            className={`p-2.5 rounded-xl border transition shadow-sm flex items-center gap-1.5 ${
              isLight 
                ? 'bg-orange-50 border-orange-300 text-orange-800 hover:bg-orange-600 hover:text-white' 
                : 'bg-orange-500/10 border-orange-500/30 text-orange-400 hover:bg-orange-500 hover:text-slate-950'
            }`}
            title="Thủ tục thanh lý tài sản"
          >
            <TrendingDown className="w-4 h-4" />
            <span className="text-xs font-bold hidden md:inline">Thanh Lý</span>
          </button>

          {/* 3. BUTTON 3: BẢO TRÌ / SỬA CHỮA */}
          <button
            onClick={() => setMaintenanceDrawer(true)}
            className={`p-2.5 rounded-xl border transition shadow-sm flex items-center gap-1.5 ${
              isLight 
                ? 'bg-purple-50 border-purple-300 text-purple-800 hover:bg-purple-600 hover:text-white' 
                : 'bg-purple-500/10 border-purple-500/30 text-purple-400 hover:bg-purple-500 hover:text-slate-950'
            }`}
            title="Lập phiếu bảo trì / sửa chữa"
          >
            <Wrench className="w-4 h-4" />
            <span className="text-xs font-bold hidden md:inline">Bảo Trì / Sửa Chữa</span>
          </button>

          {/* 4. BUTTON 4: CHỈNH SỬA */}
          <button
            onClick={openEditProcurementDrawer}
            className={`p-2.5 rounded-xl border transition shadow-sm flex items-center gap-1.5 ${
              isLight 
                ? 'bg-amber-50 border-amber-300 text-amber-800 hover:bg-amber-500 hover:text-white' 
                : 'bg-amber-500/10 border-amber-500/30 text-amber-400 hover:bg-amber-500 hover:text-slate-950'
            }`}
            title="Chỉnh sửa thông tin tài sản & mua sắm"
          >
            <Edit3 className="w-4 h-4" />
            <span className="text-xs font-bold hidden md:inline">Chỉnh Sửa</span>
          </button>

          {/* 5. BUTTON 5: IN PHIẾU BÀN GIAO / THU HỒI */}
          <button
            onClick={() => {
              const isRevoke = asset.status === 'READY' || asset.status === 'NEW';
              setActiveVoucherData({
                id: Math.floor(1000 + Math.random() * 9000),
                action: isRevoke ? 'REVOKE' : 'HANDOVER',
                asset_tag: asset.asset_tag,
                hostname: asset.hostname,
                serial_number: asset.serial_number,
                asset_type: asset.asset_type || 'Thiết bị IT',
                model: asset.model,
                to_user_name: asset.user_name || 'Kho IT Central',
                department_name: asset.department_name,
                performed_by: 'IT Administrator',
                notes: asset.notes || 'Biên bản xác nhận tình trạng thiết bị IT',
                created_at: new Date().toISOString()
              });
            }}
            className={`p-2.5 rounded-xl border transition shadow-sm flex items-center gap-1.5 ${
              isLight 
                ? 'bg-blue-50 border-blue-300 text-blue-800 hover:bg-blue-600 hover:text-white' 
                : 'bg-blue-500/10 border-blue-500/30 text-blue-400 hover:bg-blue-500 hover:text-slate-950'
            }`}
            title="In Phiếu Bàn Giao / Thu Hồi Tài Sản"
          >
            <FileText className="w-4 h-4" />
            <span className="text-xs font-bold hidden md:inline">In Phiếu Bàn Giao / Thu Hồi</span>
          </button>

          {/* 6. BUTTON 6: IN TEM MÃ QR */}
          <button
            onClick={() => setPrintQrModal(true)}
            className={`p-2.5 rounded-xl border transition shadow-sm flex items-center gap-1.5 ${
              isLight 
                ? 'bg-white border-slate-200 text-cyan-700 hover:bg-cyan-600 hover:text-white' 
                : 'bg-slate-900 border-slate-800 text-cyan-400 hover:bg-cyan-500 hover:text-slate-950'
            }`}
            title="In tem dán mã QR tài sản"
          >
            <Printer className="w-4 h-4" />
            <span className="text-xs font-bold hidden md:inline">In Tem Mã QR</span>
          </button>
        </div>
      </div>

      {/* Main Asset Banner */}
      <div className={`${cardClass} p-6 rounded-2xl flex flex-col lg:flex-row lg:items-center justify-between gap-6`}>
        <div className="flex items-start gap-5">
          <div className="p-3 bg-white rounded-2xl border border-slate-200 shadow-md shrink-0">
            <QRCodeSVG value={String(asset.qr_code || asset.asset_tag || asset.id || 'AST-N/A')} size={84} />
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <span className={`px-3 py-0.5 rounded-full font-mono text-xs font-extrabold border ${
                isLight ? 'bg-cyan-50 border-cyan-200 text-cyan-700' : 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400'
              }`}>
                {asset.asset_tag}
              </span>
              {getStatusBadge(asset.status)}
              {asset.agent_id ? (
                <span 
                  className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold border whitespace-nowrap ${
                    isLight ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-blue-950/60 border-blue-800 text-blue-300'
                  }`}
                  title="Thu thập & khởi tạo tự động từ Agent Discovery"
                >
                  <Bot className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                  Quét tự động
                </span>
              ) : (
                <span 
                  className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold border whitespace-nowrap ${
                    isLight ? 'bg-amber-50 border-amber-200 text-amber-800' : 'bg-amber-950/60 border-amber-800 text-amber-300'
                  }`}
                  title="Khởi tạo thủ công bởi IT Admin"
                >
                  <PenTool className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                  Thêm thủ công
                </span>
              )}
            </div>

            <h1 className={`text-2xl font-extrabold ${isLight ? 'text-slate-900' : 'text-white'}`}>{asset.hostname}</h1>
            
            <div className="flex flex-wrap items-center gap-2.5 pt-1 text-xs">
              <span className={`px-2.5 py-1 rounded-lg border font-mono font-bold ${
                isLight ? 'bg-amber-50 border-amber-200 text-amber-800' : 'bg-amber-500/10 border-amber-500/30 text-amber-400'
              }`}>
                # Serial: {asset.serial_number || 'N/A'}
              </span>

              <span className={`px-2.5 py-1 rounded-lg border font-bold flex items-center gap-1.5 ${
                isLight ? 'bg-slate-100 border-slate-200 text-slate-700' : 'bg-slate-800 border-slate-700 text-slate-300'
              }`}>
                <Laptop className="w-3.5 h-3.5 text-cyan-600" />
                <span>Loại: {asset.asset_type || 'Thiết bị IT'}</span>
              </span>

              <span className={`px-2.5 py-1 rounded-lg border font-semibold ${
                isLight ? 'bg-slate-100 border-slate-200 text-slate-600' : 'bg-slate-800 border-slate-700 text-slate-400'
              }`}>
                OS: {asset.os_info || 'Windows 11 Pro'}
              </span>

              <span className="px-2.5 py-1 rounded-lg border font-mono font-bold bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-500/10 dark:border-emerald-500/30 dark:text-emerald-400 flex items-center gap-1.5">
                <Wifi className="w-3.5 h-3.5 text-emerald-600" />
                <span>IP: {asset.ip_address || '10.30.22.48'}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Assigned User / Dept / Location / Allocation Time Info */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs border-t lg:border-t-0 lg:border-l pt-4 lg:pt-0 lg:pl-6 border-slate-200 dark:border-slate-800">
          <div className="space-y-0.5">
            <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Người Sử Dụng</p>
            <p className={`font-bold ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>{asset.user_name || 'Chưa gán'}</p>
            <p className="text-[11px] text-slate-400 truncate">{asset.user_email || 'Chưa có email'}</p>
          </div>

          <div className="space-y-0.5">
            <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Bộ Phận / Phòng Ban</p>
            <p className={`font-bold ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>{asset.department_name || 'Không xác định'}</p>
            <p className="text-[11px] text-slate-400">Code: {asset.department_code || 'N/A'}</p>
          </div>

          <div className="space-y-0.5">
            <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Vị Trí Lắp Đặt</p>
            <p className={`font-bold ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>{asset.location_building || 'Kho IT Central'}</p>
            <p className="text-[11px] text-slate-400">{asset.location_room || 'Phòng quản trị'}</p>
          </div>

          <div className="space-y-0.5">
            <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Thời Gian Cấp</p>
            <p className={`font-bold ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>
              {asset.user_name || asset.status === 'IN_USE' ? assignedDateText : 'Chưa cấp phát'}
            </p>
            <p className="text-[11px] text-slate-400">
              {asset.user_name || asset.status === 'IN_USE' ? 'Ngày bàn giao' : 'Đang lưu kho'}
            </p>
          </div>
        </div>
      </div>

      {/* Top Grid Row: Procurement Info (Left 2 cols) & Asset Notes (Right 1 col) - EQUAL HEIGHT */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          {/* Financial & Procurement Info Card */}
          <div className={`${cardClass} p-6 rounded-2xl space-y-4 h-full flex flex-col justify-between`}>
            <div className="flex items-center justify-between">
              <h3 className={`font-bold text-base flex items-center gap-2 ${isLight ? 'text-slate-900' : 'text-white'}`}>
                <DollarSign className="w-5 h-5 text-emerald-600" /> Thông Tin Mua Sắm, Giá Trị & Khấu Hao Tài Sản
              </h3>
              <button
                onClick={openEditProcurementDrawer}
                className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition ${
                  isLight ? 'bg-slate-100 hover:bg-slate-200 text-slate-700' : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                }`}
              >
                <Edit3 className="w-3.5 h-3.5" /> Cập Nhật Thông Tin
              </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
              <div className={`p-3.5 rounded-xl border ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950 border-slate-800'}`}>
                <p className="text-slate-400 font-bold">Ngày Mua</p>
                <p className={`text-xs sm:text-sm font-extrabold mt-1 ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>
                  {asset.purchase_date ? new Date(asset.purchase_date).toLocaleDateString('vi-VN') : 'Chưa nhập'}
                </p>
                <p className="text-[10px] text-slate-400 mt-1">Bảo hành: 24 Tháng</p>
              </div>

              <div className={`p-3.5 rounded-xl border ${isLight ? 'bg-emerald-50/50 border-emerald-200' : 'bg-emerald-500/10 border-emerald-500/30'}`}>
                <p className="text-emerald-700 dark:text-emerald-400 font-bold">Giá Mua Ban Đầu</p>
                <p className="text-xs sm:text-sm font-extrabold text-emerald-700 dark:text-emerald-400 mt-1 font-mono">
                  {pCost > 0 ? `${pCost.toLocaleString('vi-VN')} VNĐ` : 'Chưa cập nhật giá'}
                </p>
                <p className="text-[10px] text-slate-500 mt-1">Khấu hao: {depMonths} tháng ({monthlyDep > 0 ? `${monthlyDep.toLocaleString('vi-VN')}đ/tháng` : 'N/A'})</p>
              </div>

              <div className={`p-3.5 rounded-xl border ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950 border-slate-800'}`}>
                <p className="text-slate-400 font-bold">Nhà Cung Cấp</p>
                <p className={`text-xs sm:text-sm font-extrabold mt-1 truncate ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>
                  {asset.vendor_supplier || 'Chưa cập nhật nhà bán'}
                </p>
                <p className="text-[10px] text-slate-400 mt-1">Hạn BH: {asset.warranty_expiration_date ? new Date(asset.warranty_expiration_date).toLocaleDateString('vi-VN') : 'N/A'}</p>
              </div>

              <div className={`p-3.5 rounded-xl border ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950 border-slate-800'}`}>
                <p className="text-slate-400 font-bold mb-1">Hồ Sơ Mua Sắm / PO</p>
                {asset.po_document_url ? (
                  <div className="space-y-1">
                    {asset.po_document_url.split(',').filter(Boolean).map((fileName, idx) => {
                      const cleanName = fileName.trim();
                      const matchedObj = poFiles.find(f => f.name === cleanName);
                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleOpenFile(cleanName, matchedObj)}
                          className={`text-xs font-bold flex items-center gap-1.5 truncate max-w-full transition hover:underline text-left cursor-pointer ${
                            isLight ? 'text-cyan-700 hover:text-cyan-900' : 'text-cyan-400 hover:text-cyan-200'
                          }`}
                          title={`Nhấp để xem / mở tập tin: ${cleanName}`}
                        >
                          <Paperclip className="w-3.5 h-3.5 text-cyan-600 shrink-0" />
                          <span className="truncate">{cleanName}</span>
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-slate-400 italic text-xs mt-1">Chưa đính kèm PO</p>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-1">
          {/* Asset Notes Card - EQUAL HEIGHT TO PROCUREMENT CARD */}
          <div className={`${cardClass} p-6 rounded-2xl space-y-4 h-full flex flex-col justify-between`}>
            <div className="flex items-center justify-between">
              <h3 className={`font-bold text-base flex items-center gap-2 ${isLight ? 'text-slate-900' : 'text-white'}`}>
                <FileText className="w-5 h-5 text-amber-600" /> Ghi Chú Tài Sản
              </h3>
              <button
                type="button"
                onClick={openEditProcurementDrawer}
                className={`px-2.5 py-1 rounded-lg border text-[11px] font-bold flex items-center gap-1 transition ${
                  isLight ? 'bg-amber-50 hover:bg-amber-100 border-amber-200 text-amber-800' : 'bg-amber-950/60 hover:bg-amber-900/80 border-amber-800 text-amber-300'
                }`}
              >
                <Edit3 className="w-3.5 h-3.5" /> Sửa Ghi Chú
              </button>
            </div>

            <div className={`p-4 rounded-xl border text-xs leading-relaxed whitespace-pre-wrap flex-1 flex items-center ${
              isLight ? 'bg-amber-50/40 border-amber-200/70 text-slate-800' : 'bg-amber-950/20 border-amber-800/50 text-slate-200'
            }`}>
              {assetNotes || asset.notes ? (
                <p className="font-medium w-full">{assetNotes || asset.notes}</p>
              ) : (
                <p className="text-slate-400 italic w-full">
                  Chưa có ghi chú tài sản. Nhấn nút "Sửa Ghi Chú" để thêm thông tin kết nối Remote (UltraViewer, TeamViewer), mật khẩu hoặc lưu ý vận hành...
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Hardware/Software Left, Maintenance & History Right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 flex flex-col space-y-6">
          {/* Hardware Specs Card */}
          <div className={`${cardClass} p-6 rounded-2xl space-y-4`}>
            <div className="flex items-center justify-between">
              <h3 className={`font-bold text-base flex items-center gap-2 ${isLight ? 'text-slate-900' : 'text-white'}`}>
                <Cpu className="w-5 h-5 text-cyan-600" /> Chi Tiết Cấu Hình Phần Cứng Quét Tự Động (Agent Telemetry)
              </h3>

              <button
                onClick={() => setShowHardwareCard(!showHardwareCard)}
                className={`px-3.5 py-2 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition ${
                  isLight ? 'bg-slate-100 hover:bg-slate-200 text-slate-700' : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                }`}
              >
                <span>{showHardwareCard ? 'Thu Gọn Cấu Hình' : 'Xem Chi Tiết Phần Cứng'}</span>
                {showHardwareCard ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
            </div>

            {/* 2-Box Hardware Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              {/* Left Box: Bo Mạch Chủ & CPU */}
              <div className={`p-5 sm:p-6 rounded-2xl border space-y-3 ${isLight ? 'bg-slate-50/80 border-slate-200/90' : 'bg-slate-950/60 border-slate-800'}`}>
                <p className="font-bold text-cyan-700 dark:text-cyan-400 text-xs">Bo Mạch Chủ & CPU</p>
                <div className="space-y-2 text-slate-600 dark:text-slate-400">
                  <p>Bo mạch chủ (Mainboard): <strong className="text-slate-900 dark:text-slate-100 font-bold">{mainboardText}</strong></p>
                  <p>Vi xử lý (CPU): <strong className="text-slate-900 dark:text-slate-100 font-bold">{cpuText}</strong></p>
                  <p>Card Đồ Họa (GPU): <strong className="text-slate-900 dark:text-slate-100 font-bold">{gpuText}</strong></p>
                </div>
              </div>

              {/* Right Box: RAM & Storage */}
              <div className={`p-5 sm:p-6 rounded-2xl border space-y-3 ${isLight ? 'bg-slate-50/80 border-slate-200/90' : 'bg-slate-950/60 border-slate-800'}`}>
                <p className="font-bold text-emerald-700 dark:text-emerald-400 text-xs">RAM & Storage</p>
                <div className="space-y-2 text-slate-600 dark:text-slate-400">
                  <p>Tổng RAM: <strong className="text-emerald-600 dark:text-emerald-400 font-extrabold text-sm">{ramGbText} GB</strong></p>
                  <p>Tổng Dung lượng Lưu trữ: <strong className="text-cyan-600 dark:text-cyan-400 font-extrabold text-sm">{diskGbText} GB</strong></p>
                </div>
              </div>
            </div>

            {showHardwareCard && (
              <div className="space-y-4 pt-3 border-t border-slate-200 dark:border-slate-800 text-xs">
                {/* RAM Slots Sub-collapsible */}
                <div className={`p-4 rounded-xl border ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950 border-slate-800'}`}>
                  <div className="flex items-center justify-between cursor-pointer" onClick={() => setShowRamDetails(!showRamDetails)}>
                    <p className="font-bold text-cyan-700 dark:text-cyan-400 flex items-center gap-2">
                      <Cpu className="w-4 h-4" /> Danh Sách Khe RAM Thật ({ramSlots.length} slot - Tổng {asset.ram_total_gb}GB)
                    </p>
                    {showRamDetails ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                  </div>
                  {showRamDetails && (
                    <div className="mt-3 space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                      {ramSlots.map((r, i) => (
                        <div key={i} className="flex justify-between items-center bg-white dark:bg-slate-900 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800">
                          <span className="font-bold">{r.slot}: {r.sizeGb}GB {r.manufacturer} ({r.bus || r.speed})</span>
                          <span className="font-mono text-slate-400">SN: {r.serial || 'N/A'}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Physical Disk Drives Sub-collapsible */}
                <div className={`p-4 rounded-xl border ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950 border-slate-800'}`}>
                  <div className="flex items-center justify-between cursor-pointer" onClick={() => setShowPhysicalDiskDetails(!showPhysicalDiskDetails)}>
                    <p className="font-bold text-cyan-700 dark:text-cyan-400 flex items-center gap-2">
                      <HardDrive className="w-4 h-4" /> Danh Sách Ổ Cứng Vật Lý ({physicalDisks.length} đĩa đệm)
                    </p>
                    {showPhysicalDiskDetails ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                  </div>
                  {showPhysicalDiskDetails && (
                    <div className="mt-3 space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                      {physicalDisks.map((d, i) => (
                        <div key={i} className="flex justify-between items-center bg-white dark:bg-slate-900 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800">
                          <span className="font-bold">{d.model} ({d.sizeGb}GB)</span>
                          <span className="font-mono text-slate-400">Serial: {d.serial}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Logical Disk Volumes / Partitions */}
                <div className={`p-4 rounded-xl border ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950 border-slate-800'}`}>
                  <div className="flex items-center justify-between cursor-pointer" onClick={() => setShowDiskVolumeDetails(!showDiskVolumeDetails)}>
                    <p className="font-bold text-cyan-700 dark:text-cyan-400 flex items-center gap-2">
                      <HardDrive className="w-4 h-4" /> Chi Tiết Phân Vùng Ổ Cứng Logico ({logicalDisks.length} phân vùng C:, D:...)
                    </p>
                    {showDiskVolumeDetails ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                  </div>
                  {showDiskVolumeDetails && (
                    <div className="mt-3 space-y-3 pt-2 border-t border-slate-200 dark:border-slate-800">
                      {logicalDisks.map((disk, i) => (
                        <div key={i} className="bg-white dark:bg-slate-900 p-3 rounded-lg border border-slate-200 dark:border-slate-800 space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                              <span className="px-2 py-0.5 bg-cyan-100 dark:bg-cyan-950 text-cyan-700 dark:text-cyan-400 rounded font-mono text-xs">{disk.driveLetter}</span>
                              <span>{disk.label || 'Disk Volume'}</span>
                              <span className="text-[11px] text-slate-400 font-mono font-normal">({disk.fileSystem || 'NTFS'})</span>
                            </span>
                            <span className="font-semibold text-slate-600 dark:text-slate-400 text-[11px]">
                              Đã dùng <strong className="text-cyan-600">{disk.usedGb} GB</strong> / {disk.totalGb} GB (Trống {disk.freeGb} GB)
                            </span>
                          </div>
                          <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden flex">
                            <div 
                              className={`h-full rounded-full transition-all ${
                                disk.usedPercent > 90 ? 'bg-rose-500' : disk.usedPercent > 75 ? 'bg-amber-500' : 'bg-cyan-500'
                              }`}
                              style={{ width: `${Math.min(100, Math.max(5, disk.usedPercent))}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Software Installed Card - FULL DISPLAY WITHOUT SCROLLBAR */}
          <div className={`${cardClass} p-6 rounded-2xl space-y-4 ${showSoftwareCard ? 'flex-1 flex flex-col justify-between' : ''}`}>
            <div className="flex items-center justify-between">
              <div>
                <h3 className={`font-bold text-base flex items-center gap-2 ${isLight ? 'text-slate-900' : 'text-white'}`}>
                  <Package className="w-5 h-5 text-cyan-600" /> Danh Sách Phần Mềm Cài Đặt ({filteredSoftware.length} phần mềm)
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Đang hiển thị <strong className="text-cyan-600 font-bold">{filteredSoftware.length}/{currentSw.length} phần mềm ứng dụng</strong> (Google Chrome, VS Code, Office 365...)
                </p>
              </div>

              <button
                onClick={() => setShowSoftwareCard(!showSoftwareCard)}
                className={`px-3.5 py-2 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition ${
                  isLight ? 'bg-slate-100 hover:bg-slate-200 text-slate-700' : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                }`}
              >
                <span>{showSoftwareCard ? 'Thu Gọn Danh Sách' : 'Xem Chi Tiết Danh Sách Phần Mềm'}</span>
                {showSoftwareCard ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
            </div>

            {showSoftwareCard && (
              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 text-xs flex-1 flex flex-col justify-between gap-3">
                {/* Real-time Search Box */}
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Nhập tên hoặc nhà phát hành phần mềm để tìm nhanh..."
                    value={softwareSearch}
                    onChange={(e) => {
                      setSoftwareSearch(e.target.value);
                      setSoftwarePage(1);
                    }}
                    className={`w-full border rounded-xl pl-9 pr-3 py-2 text-xs font-semibold focus:outline-none focus:border-cyan-500 ${
                      isLight ? 'bg-slate-50 border-slate-200 text-slate-800' : 'bg-slate-950 border-slate-800 text-slate-200'
                    }`}
                  />
                </div>

                {/* PAGINATED SOFTWARE LIST DISPLAY */}
                <div className="space-y-2 flex-1">
                  {filteredSoftware.length === 0 ? (
                    <div className="p-4 text-center text-slate-400 italic bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800">
                      Không tìm thấy phần mềm nào khớp với từ khóa "{softwareSearch}"
                    </div>
                  ) : (
                    paginatedSoftware.map((sw, i) => (
                      <div key={i} className="flex justify-between items-center bg-slate-50 dark:bg-slate-950 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:border-cyan-500/50 transition">
                        <div>
                          <p className="font-bold text-slate-800 dark:text-slate-200">{sw.name}</p>
                          <p className="text-[11px] text-slate-400">{sw.publisher || 'Chưa rõ nhà phát hành'}</p>
                        </div>
                        <span className="font-mono text-cyan-600 font-bold shrink-0 ml-2">v{sw.version}</span>
                      </div>
                    ))
                  )}
                </div>

                {/* PAGINATION CONTROLS */}
                {totalSoftwarePages > 1 && (
                  <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between mt-auto">
                    <p className="text-[11px] text-slate-400 font-semibold">
                      Trang <strong className="text-cyan-600 font-bold">{softwarePage}</strong> / {totalSoftwarePages} ({filteredSoftware.length} phần mềm)
                    </p>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        disabled={softwarePage === 1}
                        onClick={() => setSoftwarePage(prev => Math.max(1, prev - 1))}
                        className={`p-1.5 rounded-lg border text-xs font-bold transition flex items-center justify-center ${
                          softwarePage === 1
                            ? 'opacity-30 cursor-not-allowed border-slate-200 dark:border-slate-800'
                            : (isLight ? 'bg-white hover:bg-slate-100 border-slate-300 text-slate-700' : 'bg-slate-900 hover:bg-slate-800 border-slate-700 text-slate-200')
                        }`}
                        title="Trang trước"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>

                      {Array.from({ length: totalSoftwarePages }, (_, i) => i + 1).map((page) => (
                        <button
                          key={page}
                          type="button"
                          onClick={() => setSoftwarePage(page)}
                          className={`w-7 h-7 rounded-lg text-xs font-extrabold transition ${
                            softwarePage === page
                              ? 'bg-cyan-600 text-white shadow-md'
                              : (isLight ? 'bg-slate-100 hover:bg-slate-200 text-slate-700' : 'bg-slate-800 hover:bg-slate-700 text-slate-300')
                          }`}
                        >
                          {page}
                        </button>
                      ))}

                      <button
                        type="button"
                        disabled={softwarePage === totalSoftwarePages}
                        onClick={() => setSoftwarePage(prev => Math.min(totalSoftwarePages, prev + 1))}
                        className={`p-1.5 rounded-lg border text-xs font-bold transition flex items-center justify-center ${
                          softwarePage === totalSoftwarePages
                            ? 'opacity-30 cursor-not-allowed border-slate-200 dark:border-slate-800'
                            : (isLight ? 'bg-white hover:bg-slate-100 border-slate-300 text-slate-700' : 'bg-slate-900 hover:bg-slate-800 border-slate-700 text-slate-200')
                        }`}
                        title="Trang sau"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Sidebar Column: Maintenance & Lifecycle History */}
        <div className="space-y-6 flex flex-col">
          {/* Maintenance & Repair History Card */}
          <div className={`${cardClass} p-6 rounded-2xl space-y-4`}>
            <div className="flex items-center justify-between">
              <h3 className={`font-bold text-base flex items-center gap-2 ${isLight ? 'text-slate-900' : 'text-white'}`}>
                <Wrench className="w-5 h-5 text-purple-600" /> Lịch Sử Bảo Trì & Bảo Dưỡng
              </h3>
              <button
                type="button"
                onClick={() => setMaintenanceDrawer(true)}
                className={`px-2.5 py-1 rounded-lg border text-[11px] font-bold flex items-center gap-1 transition ${
                  isLight ? 'bg-purple-50 hover:bg-purple-100 border-purple-200 text-purple-800' : 'bg-purple-950/60 hover:bg-purple-900/80 border-purple-800 text-purple-300'
                }`}
              >
                <Plus className="w-3.5 h-3.5" /> Thêm Phiếu
              </button>
            </div>

            <div className="space-y-3 text-xs">
              {maintenanceLogs.map((item) => (
                <div 
                  key={item.id} 
                  className={`p-3.5 rounded-xl border space-y-1.5 transition ${
                    isLight ? 'bg-slate-50/80 border-slate-200/90 hover:border-purple-400' : 'bg-slate-950/60 border-slate-800 hover:border-purple-500/50'
                  }`}
                >
                  <div className="flex items-center justify-between font-bold">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider ${
                      item.type === 'SỬA CHỮA HỎNG HÓC'
                        ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-400 border border-rose-200 dark:border-rose-800'
                        : item.type === 'BẢO DƯỠNG PHẦN MỀM'
                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-950/80 dark:text-blue-400 border border-blue-200 dark:border-blue-800'
                        : 'bg-purple-100 text-purple-800 dark:bg-purple-950/80 dark:text-purple-400 border border-purple-200 dark:border-purple-800'
                    }`}>
                      {item.type}
                    </span>
                    <span className="text-[11px] text-slate-400 font-mono font-normal">{item.last_performed}</span>
                  </div>
                  <p className={`font-bold ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>{item.task_name}</p>
                  
                  <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                    <span>Đơn vị: <strong>{item.vendor}</strong></span>
                    {item.cost > 0 && <span className="font-mono text-purple-600 dark:text-purple-400 font-bold">{item.cost.toLocaleString('vi-VN')} VNĐ</span>}
                  </div>

                  {item.notes && <p className="text-slate-500 dark:text-slate-400 text-[11px] italic bg-slate-100/60 dark:bg-slate-900/60 p-2 rounded-lg">"{item.notes}"</p>}
                  
                  <div className="pt-0.5 flex items-center justify-end">
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                      ✓ {item.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Device History Card */}
          <div className={`${cardClass} p-6 rounded-2xl space-y-4`}>
            <h3 className={`font-bold text-base flex items-center gap-2 ${isLight ? 'text-slate-900' : 'text-white'}`}>
              <History className="w-5 h-5 text-cyan-600" /> Lịch sử thiết bị
            </h3>

            <div className="space-y-3 max-h-[480px] overflow-y-auto pr-1 text-xs">
              {lifecycleLogs && lifecycleLogs.length > 0 ? (
                lifecycleLogs.map((log) => (
                  <div key={log.id} className={`p-3.5 rounded-xl border space-y-2 transition ${isLight ? 'bg-slate-50/80 border-slate-200/90 hover:border-cyan-400' : 'bg-slate-950/60 border-slate-800 hover:border-cyan-500/50'}`}>
                    <div className="flex justify-between items-center font-bold">
                      {getFormattedActionBadge(log.action)}
                      <span className="text-[11px] text-slate-400 font-mono">
                        {log.created_at ? new Date(log.created_at).toLocaleDateString('vi-VN') : ''}
                      </span>
                    </div>
                    <p className="text-slate-700 dark:text-slate-300 font-medium">
                      Người nhận / Lưu trữ: <strong className="text-slate-900 dark:text-slate-100 font-bold">{log.to_user_name || 'Kho IT Central'}</strong>
                    </p>
                    {log.notes && <p className="text-[11px] text-slate-500 dark:text-slate-400 italic bg-slate-100/60 dark:bg-slate-900/60 p-2 rounded-lg">"{log.notes}"</p>}
                  </div>
                ))
              ) : (
                <p className="text-slate-400 italic text-center py-6">Chưa ghi nhận lịch sử thiết bị.</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT SLIDE-OVER DRAWER FOR SEPARATE CẤP PHÁT / THU HỒI ACTION */}
      {transferDrawer && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity" onClick={() => setTransferDrawer(false)}></div>

          <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
            <div className={`w-screen max-w-lg ${isLight ? 'bg-white text-slate-800' : 'bg-slate-900 text-slate-100'} shadow-2xl border-l ${isLight ? 'border-slate-200' : 'border-slate-800'} flex flex-col`}>
              
              {/* Drawer Header */}
              {((!asset.status || asset.status === 'NEW' || asset.status === 'READY')) ? (
                <div className={`p-6 border-b flex items-center justify-between ${isLight ? 'border-emerald-200 bg-emerald-50/50' : 'border-slate-800 bg-slate-950/50'}`}>
                  <div>
                    <h3 className={`font-bold text-lg flex items-center gap-2 ${isLight ? 'text-emerald-900' : 'text-emerald-400'}`}>
                      <UserCheck className="w-5 h-5 text-emerald-600" /> Cấp Phát Tài Sản
                    </h3>
                    <p className={`text-xs mt-1 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                      Mã tài sản: <strong className="text-cyan-600 font-mono font-extrabold">{asset.asset_tag}</strong> ({asset.hostname})
                    </p>
                  </div>
                  <button onClick={() => setTransferDrawer(false)} className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800">
                    <X className="w-5 h-5" />
                  </button>
                </div>
              ) : (
                <div className={`p-6 border-b flex items-center justify-between ${isLight ? 'border-rose-200 bg-rose-50/50' : 'border-slate-800 bg-slate-950/50'}`}>
                  <div>
                    <h3 className={`font-bold text-lg flex items-center gap-2 ${isLight ? 'text-rose-900' : 'text-rose-400'}`}>
                      <RotateCcw className="w-5 h-5 text-rose-600" /> Thu Hồi Tài Sản Về Kho IT
                    </h3>
                    <p className={`text-xs mt-1 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                      Mã tài sản: <strong className="text-cyan-600 font-mono font-extrabold">{asset.asset_tag}</strong> ({asset.hostname})
                    </p>
                  </div>
                  <button onClick={() => setTransferDrawer(false)} className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800">
                    <X className="w-5 h-5" />
                  </button>
                </div>
              )}

              {/* Drawer Content */}
              <form onSubmit={handleActionSubmit} className="flex-1 p-6 space-y-4 text-xs overflow-y-auto">
                {((!asset.status || asset.status === 'NEW' || asset.status === 'READY')) ? (
                  <>
                    <div className="p-3.5 rounded-xl border bg-emerald-50/60 border-emerald-200 text-emerald-900 font-semibold space-y-1">
                      <p className="font-bold text-sm text-emerald-800">Tài sản sẵn sàng cấp phát</p>
                      <p className="text-xs">Trạng thái hiện tại: {getStatusBadge(asset.status)}</p>
                    </div>

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

                    {allocationTarget === 'EMPLOYEE' && (
                      <>
                        <div className="space-y-1">
                          <label className={`font-bold ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                            Người Nhận Bàn Giao <span className="text-rose-500 font-extrabold ml-0.5">*</span>
                          </label>
                          <SearchableEmployeeSelect
                            employees={metadata.users}
                            value={toUserId}
                            onChange={(id) => setToUserId(id)}
                            placeholder="-- Tìm tên hoặc mã nhân viên --"
                            isLight={isLight}
                          />
                        </div>

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

                    {allocationTarget === 'DEPARTMENT' && (
                      <div className="space-y-3 p-3.5 rounded-xl border bg-slate-50/70 dark:bg-slate-950/40 border-slate-200 dark:border-slate-800">
                        <div className="space-y-1">
                          <label className={`font-bold ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>Phòng Ban</label>
                          <select
                            value={toDepartmentId}
                            onChange={(e) => setToDepartmentId(e.target.value)}
                            className={`w-full border rounded-xl px-3.5 py-2.5 font-bold ${
                              isLight ? 'bg-white border-slate-300 text-cyan-900' : 'bg-slate-900 border-slate-700 text-cyan-400'
                            }`}
                          >
                            <option value="">-- Chọn Phòng Ban (Không bắt buộc) --</option>
                            {metadata.departments.map(d => (
                              <option key={d.id} value={d.id}>{d.name}</option>
                            ))}
                          </select>
                        </div>

                        <div className="space-y-1">
                          <label className={`font-bold ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>Khoa / Đơn Vị Trực Thuộc</label>
                          <select
                            value={toKhoaId}
                            onChange={(e) => setToKhoaId(e.target.value)}
                            className={`w-full border rounded-xl px-3.5 py-2.5 font-bold ${
                              isLight ? 'bg-white border-slate-300 text-slate-800' : 'bg-slate-900 border-slate-700 text-slate-200'
                            }`}
                          >
                            <option value="">-- Chọn Khoa / Đơn Vị (Không bắt buộc) --</option>
                            {khoaList.map(k => (
                              <option key={k.id} value={k.id}>{k.name}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    )}

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
                        className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-lg shadow-emerald-600/20"
                      >
                        Xác Nhận Cấp Phát (Đang Sử Dụng)
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="p-4 rounded-xl border bg-rose-50/70 border-rose-200 text-rose-900 space-y-2">
                      <p className="font-bold text-sm text-rose-900">Thông tin gán hiện tại</p>
                      <div className="text-xs space-y-1">
                        <p>👤 Người/Phòng gán: <strong className="font-bold">{asset.user_name || `Phòng ${asset.department_name}`}</strong></p>
                        <p>🏢 Bộ phận / Phòng: <strong className="font-bold">{asset.department_name || 'Kho IT Central'}</strong></p>
                        <p>📌 Trạng thái hiện tại: {getStatusBadge(asset.status)}</p>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className={`font-bold ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>Lý Do Thu Hồi <span className="text-rose-500 font-extrabold ml-0.5">*</span></label>
                      <textarea
                        required
                        rows={4}
                        placeholder="Nhập chi tiết lý do thu hồi tài sản về kho..."
                        value={transferNotes}
                        onChange={(e) => setTransferNotes(e.target.value)}
                        className={`w-full border rounded-xl px-3.5 py-2.5 ${
                          isLight ? 'bg-slate-50 border-slate-300 text-slate-800' : 'bg-slate-950 border-slate-700 text-slate-200'
                        }`}
                      />
                    </div>

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

      {/* RIGHT SLIDE-OVER DRAWER FOR CHỈNH SỬA TÀI SẢN & PROCUREMENT */}
      {editProcurementDrawer && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity" onClick={() => setEditProcurementDrawer(false)}></div>

          <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
            <div className={`w-screen max-w-4xl ${isLight ? 'bg-white text-slate-800' : 'bg-slate-900 text-slate-100'} shadow-2xl border-l ${isLight ? 'border-slate-200' : 'border-slate-800'} flex flex-col h-full overflow-hidden`}>
              
              {/* Drawer Header */}
              <div className={`p-6 border-b flex items-center justify-between shrink-0 ${isLight ? 'border-slate-200 bg-slate-50' : 'border-slate-800 bg-slate-950/50'}`}>
                <div>
                  <h3 className={`font-bold text-lg flex items-center gap-2 ${isLight ? 'text-slate-900' : 'text-white'}`}>
                    <Edit3 className="w-5 h-5 text-amber-600" /> Chỉnh Sửa Thông Tin Tài Sản & Trạng Thái
                  </h3>
                  <p className={`text-xs mt-1 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                    Tài sản: <strong className="text-cyan-600 font-mono font-extrabold">{asset.asset_tag}</strong> ({asset.hostname})
                  </p>
                </div>
                <button onClick={() => setEditProcurementDrawer(false)} className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleUpdateProcurementSubmit} className="flex-1 flex flex-col min-h-0 overflow-hidden">
                {/* SCROLLABLE 2-COLUMN FORM CONTENT */}
                <div className="flex-1 p-6 text-xs overflow-y-auto">
                  {(() => {
                    const isAutoScanned = Boolean(asset && asset.agent_id);
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
                              {metadata.assetTypes && metadata.assetTypes.length > 0 ? (
                                metadata.assetTypes.map(at => (
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

                          {/* Trạng Thái */}
                          <div className="space-y-1">
                            <label className={`font-bold ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                              Trạng Thái Tài Sản <span className="text-rose-500 font-extrabold ml-0.5">*</span>
                            </label>
                            <select
                              value={assetStatus}
                              onChange={(e) => setAssetStatus(e.target.value)}
                              className={`w-full border rounded-xl px-3.5 py-2.5 transition-colors ${getStatusColorStyle(assetStatus)}`}
                            >
                              <option value="NEW" className={isLight ? 'bg-white text-slate-800 font-normal' : 'bg-slate-900 text-slate-100 font-normal'}>Mới (Mới mua)</option>
                              <option value="READY" className={isLight ? 'bg-white text-slate-800 font-normal' : 'bg-slate-900 text-slate-100 font-normal'}>Sẵn sàng cấp phát (Đã thu hồi, chưa cấp phát cho ai)</option>
                              <option value="IN_USE" className={isLight ? 'bg-white text-slate-800 font-normal' : 'bg-slate-900 text-slate-100 font-normal'}>Đang sử dụng (Đang được gán với nhân viên/khoa phòng)</option>
                              <option value="MAINTENANCE" className={isLight ? 'bg-white text-slate-800 font-normal' : 'bg-slate-900 text-slate-100 font-normal'}>Đang bảo trì (Nằm trong mục bảo trì/sửa chữa)</option>
                              <option value="DISPOSING" className={isLight ? 'bg-white text-slate-800 font-normal' : 'bg-slate-900 text-slate-100 font-normal'}>Thanh lý (Đang trong quá trình thanh lý)</option>
                              <option value="DISPOSED" className={isLight ? 'bg-white text-slate-800 font-normal' : 'bg-slate-900 text-slate-100 font-normal'}>Đã thanh lý (Đã thanh lý thành công)</option>
                            </select>
                          </div>

                          {/* Ngày Mua */}
                          <div className="space-y-1">
                            <label className={`font-bold ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>Ngày Mua</label>
                            <DatePickerVN value={purchaseDate} onChange={setPurchaseDate} isLight={isLight} />
                          </div>

                          {/* Giá Mua */}
                          <div className="space-y-1">
                            <label className={`font-bold ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>Giá Mua (VNĐ)</label>
                            <div className="relative">
                              <input
                                type="text"
                                placeholder="Nhập giá mua"
                                value={formatCurrency(purchaseCost)}
                                onChange={(e) => setPurchaseCost(e.target.value.replace(/\D/g, ''))}
                                className={`w-full border rounded-xl pl-3.5 pr-14 py-2.5 font-mono font-bold text-sm ${
                                  isLight ? 'bg-slate-50 border-slate-300 text-emerald-700' : 'bg-slate-950 border-slate-700 text-emerald-400'
                                }`}
                              />
                              <span className="absolute right-3.5 top-1/2 -translate-y-1/2 font-extrabold text-xs text-slate-400">VNĐ</span>
                            </div>
                          </div>

                          {/* Khấu hao */}
                          <div className="space-y-1">
                            <label className={`font-bold ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>Khấu Hao (Số Tháng)</label>
                            <input
                              type="number"
                              value={depreciationMonths}
                              onChange={(e) => setDepreciationMonths(e.target.value)}
                              className={`w-full border rounded-xl px-3.5 py-2.5 ${
                                isLight ? 'bg-slate-50 border-slate-300 text-slate-800' : 'bg-slate-950 border-slate-700 text-slate-200'
                              }`}
                            />
                          </div>

                          {/* Nhà cung cấp */}
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
                              {(metadata.suppliers || []).map(s => (
                                <option key={s.id} value={s.name}>
                                  {s.name}
                                </option>
                              ))}
                              {vendorSupplier && !(metadata.suppliers || []).some(s => s.name === vendorSupplier) && (
                                <option value={vendorSupplier}>{vendorSupplier}</option>
                              )}
                            </select>
                          </div>

                          {/* Ngày hết bảo hành */}
                          <div className="space-y-1">
                            <label className={`font-bold ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>Ngày Hết Bảo Hành</label>
                            <DatePickerVN value={warrantyExpirationDate} onChange={setWarrantyExpirationDate} isLight={isLight} />
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

                          {/* FILE UPLOAD FOR PO / PROCUREMENT DOCUMENTS (DƯỚI) */}
                          <div className="space-y-2 pt-2">
                            <label className={`font-bold block ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                              Hồ Sơ Mua Sắm / PO / Hợp Đồng Đính Kèm (Cho phép đính kèm nhiều file)
                            </label>

                            <div className={`p-4 rounded-xl border border-dashed text-center transition cursor-pointer relative ${
                              isLight ? 'bg-slate-50 border-slate-300 hover:border-cyan-500' : 'bg-slate-950 border-slate-700 hover:border-cyan-500'
                            }`}>
                              <input
                                type="file"
                                multiple
                                onChange={(e) => handleMultipleFilesUpload(e, setPoFiles)}
                                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                              />
                              <div className="flex flex-col items-center justify-center gap-1 py-2">
                                <Upload className="w-6 h-6 text-cyan-600" />
                                <p className="text-xs font-bold text-cyan-600">Nhấp hoặc kéo thả để tải lên hồ sơ PO</p>
                                <p className="text-[10px] text-slate-400">Hỗ trợ PDF, DOCX, XLSX, PNG, JPG (Tối đa 20MB)</p>
                              </div>
                            </div>

                            {poFiles.length > 0 && (
                              <div className="space-y-1.5 pt-1 max-h-48 overflow-y-auto">
                                {poFiles.map((file, idx) => (
                                  <div key={idx} className={`p-2.5 rounded-xl border flex items-center justify-between text-xs font-bold ${
                                    isLight ? 'bg-cyan-50/70 border-cyan-300 text-cyan-900' : 'bg-slate-950 border-slate-700 text-cyan-400'
                                  }`}>
                                    <div className="flex items-center gap-2 truncate">
                                      <Paperclip className="w-4 h-4 text-cyan-600 shrink-0" />
                                      <span className="truncate">{file.name}</span>
                                      <span className="text-[10px] text-slate-400 font-normal">({file.size})</span>
                                    </div>
                                    <button
                                      type="button"
                                      onClick={() => handleRemoveFile(idx, setPoFiles)}
                                      className="p-1 rounded text-slate-400 hover:text-rose-500 transition"
                                      title="Xóa tập tin"
                                    >
                                      <X className="w-4 h-4" />
                                    </button>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>

                      </div>
                    );
                  })()}
                </div>

                {/* STICKY FIXED FOOTER BUTTONS AT BOTTOM OF DRAWER */}
                <div className={`p-4 px-6 border-t flex justify-end gap-3 shrink-0 ${isLight ? 'border-slate-200 bg-slate-50/90' : 'border-slate-800 bg-slate-950/90'}`}>
                  <button
                    type="button"
                    onClick={() => setEditProcurementDrawer(false)}
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

      {/* RIGHT SLIDE-OVER DRAWER FOR THANH LÝ TÀI SẢN (DISPOSAL DRAWER) */}
      {disposalDrawer && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity" onClick={() => setDisposalDrawer(false)}></div>

          <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
            <div className={`w-screen max-w-lg ${isLight ? 'bg-white text-slate-800' : 'bg-slate-900 text-slate-100'} shadow-2xl border-l ${isLight ? 'border-slate-200' : 'border-slate-800'} flex flex-col`}>
              
              <div className={`p-6 border-b flex items-center justify-between ${isLight ? 'border-orange-200 bg-orange-50/60' : 'border-slate-800 bg-slate-950/50'}`}>
                <div>
                  <h3 className={`font-bold text-lg flex items-center gap-2 ${isLight ? 'text-orange-900' : 'text-orange-400'}`}>
                    <TrendingDown className="w-5 h-5 text-orange-600" /> Thủ Tục Thanh Lý Tài Sản
                  </h3>
                  <p className={`text-xs mt-1 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                    Mã tài sản: <strong className="text-cyan-600 font-mono font-extrabold">{asset.asset_tag}</strong> ({asset.hostname})
                  </p>
                </div>
                <button onClick={() => setDisposalDrawer(false)} className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleDisposalSubmit} className="flex-1 p-6 space-y-4 text-xs overflow-y-auto">
                <div className="space-y-1">
                  <label className={`font-bold ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>Quy Trình Thanh Lý <span className="text-rose-500 font-extrabold ml-0.5">*</span></label>
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

                <div className="space-y-1">
                  <label className={`font-bold ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>Giá Trị Thanh Lý Thu Về (VNĐ)</label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Nhập số tiền thu hồi..."
                      value={formatCurrency(disposalValue)}
                      onChange={(e) => setDisposalValue(e.target.value.replace(/\D/g, ''))}
                      className={`w-full border rounded-xl pl-3.5 pr-14 py-2.5 font-mono font-bold text-sm ${
                        isLight ? 'bg-slate-50 border-slate-300 text-orange-700' : 'bg-slate-950 border-slate-700 text-orange-400'
                      }`}
                    />
                    <span className="absolute right-3.5 top-1/2 -translate-y-1/2 font-extrabold text-xs text-slate-400">VNĐ</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className={`font-bold ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>Ngày Thực Hiện Thanh Lý</label>
                  <DatePickerVN value={disposalDate} onChange={setDisposalDate} isLight={isLight} />
                </div>

                <div className="space-y-1">
                  <label className={`font-bold ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>Đơn Vị / Đối Tác Mua Thanh Lý</label>
                  <input
                    type="text"
                    placeholder="Nhập tên công ty/đơn vị thu mua..."
                    value={disposalBuyer}
                    onChange={(e) => setDisposalBuyer(e.target.value)}
                    className={`w-full border rounded-xl px-3.5 py-2.5 ${
                      isLight ? 'bg-slate-50 border-slate-300 text-slate-800' : 'bg-slate-950 border-slate-700 text-slate-200'
                    }`}
                  />
                </div>

                <div className="space-y-1">
                  <label className={`font-bold ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>Lý Do & Ghi Chú Thanh Lý <span className="text-rose-500 font-extrabold ml-0.5">*</span></label>
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

                <div className={`pt-4 border-t flex justify-end gap-3 mt-auto ${isLight ? 'border-slate-200' : 'border-slate-800'}`}>
                  <button
                    type="button"
                    onClick={() => setDisposalDrawer(false)}
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

      {/* RIGHT SLIDE-OVER DRAWER FOR BẢO TRÌ / SỬA CHỮA (MAINTENANCE DRAWER) */}
      {maintenanceDrawer && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity" onClick={() => setMaintenanceDrawer(false)}></div>

          <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
            <div className={`w-screen max-w-lg ${isLight ? 'bg-white text-slate-800' : 'bg-slate-900 text-slate-100'} shadow-2xl border-l ${isLight ? 'border-slate-200' : 'border-slate-800'} flex flex-col`}>
              
              <div className={`p-6 border-b flex items-center justify-between ${isLight ? 'border-purple-200 bg-purple-50/60' : 'border-slate-800 bg-slate-950/50'}`}>
                <div>
                  <h3 className={`font-bold text-lg flex items-center gap-2 ${isLight ? 'text-purple-900' : 'text-purple-400'}`}>
                    <Wrench className="w-5 h-5 text-purple-600" /> Lập Phiếu Bảo Trì / Sửa Chữa Tài Sản
                  </h3>
                  <p className={`text-xs mt-1 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                    Mã tài sản: <strong className="text-cyan-600 font-mono font-extrabold">{asset.asset_tag}</strong> ({asset.hostname})
                  </p>
                </div>
                <button onClick={() => setMaintenanceDrawer(false)} className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleMaintenanceSubmit} className="flex-1 p-6 space-y-4 text-xs overflow-y-auto">
                <div className="space-y-1">
                  <label className={`font-bold ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>Hình Thức Thao Tác <span className="text-rose-500 font-extrabold ml-0.5">*</span></label>
                  <select
                    value={maintenanceType}
                    onChange={(e) => setMaintenanceType(e.target.value)}
                    className={`w-full border rounded-xl px-3.5 py-2.5 font-bold ${
                      isLight ? 'bg-purple-50/60 border-purple-300 text-purple-900' : 'bg-slate-950 border-slate-700 text-purple-400'
                    }`}
                  >
                    <option value="REPAIR">Sửa Chữa Hỏng Hóc (Thay linh kiện, sửa nguồn, màn hình...)</option>
                    <option value="PREVENTIVE">Bảo Trì Định Kỳ (Vệ sinh phần cứng, tra keo tản nhiệt...)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className={`font-bold ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>Đơn Vị Thực Hiện / Đối Tác <span className="text-rose-500 font-extrabold ml-0.5">*</span></label>
                  <input
                    required
                    type="text"
                    placeholder="Nhập đơn vị thực hiện..."
                    value={maintenanceVendor}
                    onChange={(e) => setMaintenanceVendor(e.target.value)}
                    className={`w-full border rounded-xl px-3.5 py-2.5 ${
                      isLight ? 'bg-slate-50 border-slate-300 text-slate-800' : 'bg-slate-950 border-slate-700 text-slate-200'
                    }`}
                  />
                </div>

                <div className="space-y-1">
                  <label className={`font-bold ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>Chi Phí Thực Hiện (VNĐ)</label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Nhập chi phí dự kiến..."
                      value={formatCurrency(maintenanceCost)}
                      onChange={(e) => setMaintenanceCost(e.target.value.replace(/\D/g, ''))}
                      className={`w-full border rounded-xl pl-3.5 pr-14 py-2.5 font-mono font-bold text-sm ${
                        isLight ? 'bg-slate-50 border-slate-300 text-purple-700' : 'bg-slate-950 border-slate-700 text-purple-400'
                      }`}
                    />
                    <span className="absolute right-3.5 top-1/2 -translate-y-1/2 font-extrabold text-xs text-slate-400">VNĐ</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className={`font-bold ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>Ngày Bắt Đầu</label>
                  <DatePickerVN value={maintenanceStartDate} onChange={setMaintenanceStartDate} isLight={isLight} />
                </div>

                <div className="space-y-1">
                  <label className={`font-bold ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>Dự Kiến Ngày Hoàn Thành</label>
                  <DatePickerVN value={maintenanceEndDate} onChange={setMaintenanceEndDate} isLight={isLight} />
                </div>

                <div className="space-y-1">
                  <label className={`font-bold ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>Mô Tả Chi Tiết Lỗi / Nội Dung Bảo Trì <span className="text-rose-500 font-extrabold ml-0.5">*</span></label>
                  <textarea
                    required
                    rows={4}
                    placeholder="Mô tả sự cố hoặc nội dung bảo trì..."
                    value={maintenanceDescription}
                    onChange={(e) => setMaintenanceDescription(e.target.value)}
                    className={`w-full border rounded-xl px-3.5 py-2.5 ${
                      isLight ? 'bg-slate-50 border-slate-300 text-slate-800' : 'bg-slate-950 border-slate-700 text-slate-200'
                    }`}
                  />
                </div>

                <div className={`pt-4 border-t flex justify-end gap-3 mt-auto ${isLight ? 'border-slate-200' : 'border-slate-800'}`}>
                  <button
                    type="button"
                    onClick={() => setMaintenanceDrawer(false)}
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
                    Xác Nhận Đưa Vào Bảo Trì
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRM FINISH MAINTENANCE MODAL */}
      {finishMaintenanceModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4">
          <div className={`${isLight ? 'bg-white text-slate-800' : 'glass-card-dark text-slate-100'} w-full max-w-md p-6 rounded-2xl border ${isLight ? 'border-slate-200' : 'border-slate-800'} space-y-5 shadow-2xl`}>
            <div className="flex items-center gap-3 border-b pb-3 border-cyan-200">
              <CheckCircle2 className="w-6 h-6 text-cyan-600 shrink-0" />
              <div>
                <h3 className={`font-bold text-base ${isLight ? 'text-slate-900' : 'text-white'}`}>Xác Nhận Hoàn Tất Bảo Trì</h3>
                <p className="text-xs text-slate-500">Mã tài sản: <strong className="font-mono text-cyan-600 font-bold">{asset.asset_tag}</strong> ({asset.hostname})</p>
              </div>
            </div>

            <div className={`p-4 rounded-xl border text-xs space-y-2 ${isLight ? 'bg-cyan-50/70 border-cyan-200 text-cyan-900' : 'bg-slate-900 border-slate-800 text-cyan-300'}`}>
              <p className="font-bold">Trạng thái sẽ được khôi phục chính xác về trạng thái trước đó:</p>
              <div className="flex items-center gap-2 mt-1.5">
                {getStatusBadge(asset.previous_status || ((asset.user_id || asset.department_id) ? 'IN_USE' : 'READY'))}
                <span className="font-semibold text-slate-500">
                  ({(asset.previous_status === 'READY' || (!asset.previous_status && !asset.user_id))
                    ? 'Chưa cấp phát / Kho IT Central'
                    : `Đang gán cho ${asset.user_name || asset.department_name || 'Người dùng'}`})
                </span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setFinishMaintenanceModal(false)}
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

      {/* Printable QR Sticker Modal */}
      {printQrModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white text-slate-800 w-full max-w-md p-6 rounded-2xl border border-slate-200 text-center space-y-6 shadow-2xl">
            <h3 className="font-bold text-lg text-slate-900">Tem Dán Mã QR Tài Sản IT</h3>

            <div className="p-6 bg-white rounded-2xl inline-block shadow-2xl space-y-2 text-slate-950 border border-slate-200">
              <p className="font-extrabold text-sm tracking-wider uppercase">CÔNG TY IT ASSET MANAGEMENT</p>
              <div className="flex justify-center my-3">
                <QRCodeSVG value={String(asset.qr_code || asset.asset_tag || asset.id || 'AST-N/A')} size={150} />
              </div>
              <p className="font-mono font-extrabold text-lg text-cyan-900">{asset.asset_tag}</p>
              <p className="text-xs font-bold text-slate-700">{asset.hostname}</p>
            </div>

            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => window.print()}
                className="px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow-lg flex items-center gap-2"
              >
                <Printer className="w-4 h-4" /> In Tem Mã QR
              </button>
              <button
                onClick={() => setPrintQrModal(false)}
                className="px-4 py-2.5 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs hover:bg-slate-200"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Handover & Revocation Voucher Slip Modal */}
      {activeVoucherData && (
        <HandoverVoucherModal
          voucherData={activeVoucherData}
          onClose={() => setActiveVoucherData(null)}
          theme={theme}
        />
      )}
    </div>
  );
}
