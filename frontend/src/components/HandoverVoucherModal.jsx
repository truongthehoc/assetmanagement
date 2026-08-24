import React, { useState, useEffect } from 'react';
import { FileText, Printer, X, QrCode, CheckCircle2, ShieldCheck, ArrowRightLeft, Building2 } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

export default function HandoverVoucherModal({ voucherData, onClose, orgInfo, systemInfo, theme }) {
  if (!voucherData) return null;

  const [orgData, setOrgData] = useState(orgInfo || null);

  useEffect(() => {
    if (!orgData || (!orgData.name && !orgData.companyName)) {
      fetch('/api/settings')
        .then(r => r.json())
        .then(data => {
          if (data && data.orgInfo) {
            setOrgData(data.orgInfo);
          }
        })
        .catch(console.error);
    }
  }, []);

  const isLight = theme === 'light';
  const isRevoke = voucherData.action === 'REVOKE' || voucherData.action === 'RETURN_TO_STOCK';

  const title = isRevoke ? 'BIÊN BẢN THU HỒI THIẾT BỊ CNTT' : 'BIÊN BẢN BÀN GIAO & CẤP PHÁT THIẾT BỊ CNTT';
  const subtitle = isRevoke ? 'Phiếu Xác Nhận Thu Hồi Thiết Bị Về Kho IT Central' : 'Phiếu Bàn Giao Thiết Bị Công Nghệ Cho Cán Bộ / Nhân Viên';
  const formCode = isRevoke ? '02/TH-CNTT' : '01/BG-CNTT';
  const dateObj = voucherData.created_at ? new Date(voucherData.created_at) : new Date();
  const yearStr = dateObj.getFullYear();
  const numId = String(voucherData.id || Math.floor(1000 + Math.random() * 9000)).padStart(4, '0');
  const docSuffix = isRevoke ? 'BBTH-CNTT' : 'BBBG-CNTT';
  const formattedVoucherNo = `${numId}/${yearStr}/${docSuffix}`;
  const voucherCode = voucherData.voucherCode || formattedVoucherNo;

  const formattedDate = dateObj.toLocaleDateString('vi-VN');
  const formattedTime = dateObj.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });

  const currentOrg = orgData || orgInfo || {};
  const companyName = currentOrg.name || currentOrg.companyName || 'Công Ty Cổ Phần Bệnh Viện Thuận Mỹ TDM';
  const companyAddress = currentOrg.address || 'Số 152 Huỳnh Văn Cù, P. Thủ Dầu Một, TP. Hồ Chí Minh';
  const logoUrl = currentOrg.logoUrl || null;

  const recipientDeptName = voucherData.department_name || 
                        voucherData.to_department_name || 
                        voucherData.phong_name || 
                        voucherData.departmentName || 
                        voucherData.department_code || 
                        'Bộ Phận Chuyên Môn';

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-3 sm:p-6">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      ></div>

      {/* Modal Container */}
      <div className={`relative w-full max-w-3xl max-h-[88vh] flex flex-col ${
        isLight ? 'bg-white text-slate-900' : 'bg-slate-900 text-white'
      } rounded-3xl shadow-2xl overflow-hidden border ${
        isLight ? 'border-slate-200' : 'border-slate-800'
      } z-10 animate-fadeIn`}>
        
        {/* Top Control Bar (Fixed Header) */}
        <div className={`p-4 border-b shrink-0 flex items-center justify-between z-20 ${
          isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/80 border-slate-800'
        }`}>
          <div className="flex items-center gap-2">
            {isRevoke ? (
              <ArrowRightLeft className="w-5 h-5 text-amber-600" />
            ) : (
              <FileText className="w-5 h-5 text-cyan-600" />
            )}
            <div>
              <h3 className="font-extrabold text-sm">
                {isRevoke ? 'Phiếu Thu Hồi Tài Sản IT' : 'Phiếu Cấp Phát Tài Sản IT'}
              </h3>
              <p className="text-[11px] text-slate-400 font-mono">{formattedVoucherNo}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs shadow-md shadow-cyan-600/20 flex items-center gap-1.5 transition transform active:scale-95"
            >
              <Printer className="w-4 h-4" /> In Phiếu Ngay
            </button>
            <button 
              onClick={onClose} 
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Document Sheet Content (Scrollable Container) */}
        <div className="p-6 sm:p-8 space-y-6 text-slate-900 bg-white flex-1 flex flex-col justify-between overflow-y-auto" id="handover-slip-print">
          
          {/* Main Top Body Content Container */}
          <div className="space-y-5">
            {/* Header & Crest (Left: Logo, Company Name, Address, Voucher No / Right: Mẫu số, Quốc Hiệu Tiêu Ngữ) */}
            <div className="pb-2 space-y-2 text-slate-900">
              {/* Top Row 1: Logo (Centered in Left Column) vs Mẫu số on Right */}
              <div className="grid grid-cols-2 gap-4 items-center pb-1">
                <div className="flex justify-center items-center text-center w-full">
                  {logoUrl ? (
                    <img src={logoUrl} alt="Logo" className="h-10 max-w-[180px] object-contain mx-auto" />
                  ) : null}
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-slate-500 font-mono font-bold">
                    Mẫu số: {formCode}
                  </p>
                </div>
              </div>

              {/* Row 2: 2-Column Aligned Grid (Tên Công Ty aligns horizontally with Quốc Hiệu Tiêu Ngữ) */}
              <div className="grid grid-cols-2 gap-4 items-start pt-1">
                {/* Left Column: Tên công ty + Địa chỉ + Số */}
                <div className="text-center space-y-0.5">
                  <p className="font-extrabold uppercase text-slate-900 text-[11px] leading-snug tracking-wide text-center">
                    {companyName}
                  </p>
                  <p className="text-[10px] text-slate-600 font-medium leading-tight text-center">
                    {companyAddress}
                  </p>
                  <p className="text-[10px] text-slate-800 font-mono font-bold pt-1 text-center">
                    Số: {formattedVoucherNo}
                  </p>
                </div>

                {/* Right Column: Quốc Hiệu Tiêu Ngữ (Top line aligned with Tên Công Ty) */}
                <div className="text-center space-y-0.5">
                  <h4 className="font-extrabold text-[11px] uppercase tracking-wider text-slate-900 leading-snug text-center">
                    CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM
                  </h4>
                  <p className="text-[11px] font-bold text-slate-800 text-center">
                    Độc lập - Tự do - Hạnh phúc
                  </p>
                  <div className="w-28 h-0.5 bg-slate-900 mx-auto mt-1"></div>
                </div>
              </div>

              {/* Document Main Title */}
              <div className="text-center space-y-1 pt-4">
                <h2 className="text-xl font-black uppercase text-slate-900 tracking-wide">{title}</h2>
                <p className="text-xs text-slate-500 italic">{subtitle}</p>
                <p className="text-[11px] text-slate-600 font-semibold mt-1">
                  Thời gian lập phiếu: <strong>{formattedTime} - Ngày {formattedDate}</strong>
                </p>
              </div>
            </div>

            {/* Opening Statement Sentence (Loads Recipient Department Name) */}
            <p className="text-xs text-slate-800 leading-relaxed font-medium pt-1">
              Hôm nay, vào lúc <strong>{formattedTime}</strong>, ngày <strong>{new Date(voucherData.created_at || Date.now()).getDate()}</strong> tháng <strong>{new Date(voucherData.created_at || Date.now()).getMonth() + 1}</strong> năm <strong>{new Date(voucherData.created_at || Date.now()).getFullYear()}</strong>, tại <strong>{recipientDeptName}</strong>, chúng tôi gồm:
            </p>

            {/* Handover Parties Details (Bên A & Bên B) */}
            <div className="grid grid-cols-2 gap-4 text-xs">
              {/* Bên A */}
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
                <span className="font-extrabold uppercase text-[10px] text-cyan-700 block border-b pb-1">
                  {isRevoke ? 'BÊN THU HỒI' : 'BÊN GIAO'}
                </span>
                <p><strong>Người thực hiện:</strong> {voucherData.performed_by || voucherData.from_user_name || 'IT Administrator'}</p>
                <p><strong>Đơn vị:</strong> {voucherData.from_department_name || voucherData.department_name || 'Phòng Công Nghệ Thông Tin'}</p>
              </div>

              {/* Bên B */}
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
                <span className="font-extrabold uppercase text-[10px] text-cyan-700 block border-b pb-1">
                  {isRevoke ? 'BÊN BÀN GIAO LẠI' : 'BÊN NHẬN'}
                </span>
                <p><strong>Họ và tên:</strong> {(voucherData.target_type === 'DEPARTMENT' || voucherData.target === 'DEPARTMENT' || !voucherData.to_user_name) ? '' : voucherData.to_user_name}</p>
                <p><strong>Khoa/phòng:</strong> {recipientDeptName}</p>
              </div>
            </div>

            {/* Asset Specifications Table */}
            <div className="space-y-2">
              <h5 className="font-extrabold text-xs text-slate-800 uppercase tracking-wider">
                {isRevoke ? 'DANH MỤC THIẾT BỊ THU HỒI VỀ KHO:' : 'DANH MỤC THIẾT BỊ BÀN GIAO & CẤP PHÁT:'}
              </h5>
              <table className="w-full border-collapse border border-slate-300 text-xs">
                <thead>
                  <tr className="bg-slate-100 text-slate-800 text-left font-bold">
                    <th className="border border-slate-300 p-2 text-center w-10">STT</th>
                    <th className="border border-slate-300 p-2">Mã tài sản</th>
                    <th className="border border-slate-300 p-2">Tên thiết bị</th>
                    <th className="border border-slate-300 p-2">Số SN</th>
                    <th className="border border-slate-300 p-2">Loại Tài sản</th>
                    <th className="border border-slate-300 p-2">Ghi chú</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-slate-300 p-2 text-center font-bold">1</td>
                    <td className="border border-slate-300 p-2 font-mono font-bold text-cyan-700">
                      {voucherData.asset_tag || voucherData.assetTag || 'N/A'}
                    </td>
                    <td className="border border-slate-300 p-2 font-bold">
                      {voucherData.hostname || voucherData.asset_name || voucherData.model || 'Thiết bị IT'}
                    </td>
                    <td className="border border-slate-300 p-2 font-mono text-slate-600">
                      {voucherData.serial_number || voucherData.serialNumber || 'SN-UNKNOWN'}
                    </td>
                    <td className="border border-slate-300 p-2 font-medium">
                      {voucherData.asset_type || voucherData.assetType || 'Thiết bị IT'}
                    </td>
                    <td className="border border-slate-300 p-2 italic text-slate-700">
                      {voucherData.notes || (isRevoke ? 'Thu hồi thiết bị về kho IT Central.' : 'Biên bản xác nhận tình trạng thiết bị IT')}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Responsibilities & Terms */}
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-[11px] text-slate-700 space-y-1.5 leading-relaxed">
              <p className="font-bold text-slate-900">Cam kết người nhận / giao tài sản:</p>
              <p>- Bên nhận có trách nhiệm bảo quản, giữ gìn tài sản công ty và sử dụng đúng mục đích công việc. Nếu trong quá trình sử dụng thiết bị bị hư hỏng do lỗi người sử dụng, Khoa/phòng (hoặc người sử dụng) sẽ chịu trách nhiệm bồi thường bằng giá trị tài sản theo khấu hao.</p>
              <p>- Khi nghỉ việc hoặc điều chuyển vị trí, có nghĩa vụ bàn giao lại đầy đủ tài sản cho Bộ Phận Công nghệ thông tin.</p>
            </div>

            {/* Signatures Section */}
            <div className="pt-6 grid grid-cols-2 gap-8 text-center text-xs">
              <div className="space-y-12">
                <div>
                  <p className="font-bold uppercase text-slate-900">NGƯỜI LẬP PHIẾU</p>
                  <p className="text-[10px] text-slate-500 italic">(Ký và ghi rõ họ tên)</p>
                </div>
                <div className="pt-2 font-bold text-slate-800">{voucherData.performed_by || 'IT Admin'}</div>
              </div>

              <div className="space-y-12">
                <div>
                  <p className="font-bold uppercase text-slate-900">
                    {isRevoke ? 'NGƯỜI BÀN GIAO LẠI' : 'NGƯỜI NHẬN THIẾT BỊ'}
                  </p>
                  <p className="text-[10px] text-slate-500 italic">(Ký và ghi rõ họ tên)</p>
                </div>
                <div className="pt-2 font-bold text-slate-800">
                  {(voucherData.target_type === 'DEPARTMENT' || voucherData.target === 'DEPARTMENT' || !voucherData.to_user_name) ? '' : voucherData.to_user_name}
                </div>
              </div>
            </div>
          </div>

          {/* Footer Verification Note with Scannable QR Code (Pushed to bottom with mt-auto) */}
          <div className="mt-auto pt-6 border-t border-slate-200 text-xs text-slate-500 flex items-center justify-between gap-4">
            <div className="space-y-0.5 text-left">
              <p className="font-bold text-slate-700">Xác nhận tự động bởi Hệ Thống IT AssetGuard Enterprise Management</p>
              <p className="text-[10px] text-slate-400">Quét mã QR bên phải bằng camera hoặc thiết bị quét mã để kiểm tra thông tin tài sản trên hệ thống.</p>
            </div>

            <div className="flex items-center gap-2.5 bg-slate-50 p-2 rounded-xl border border-slate-200 shrink-0">
              <div className="bg-white p-1 rounded-lg border border-slate-200 shadow-sm">
                <QRCodeSVG value={String(voucherData.qr_code || voucherData.asset_tag || voucherData.assetTag || voucherData.id || voucherCode)} size={56} />
              </div>
              <div className="text-left text-[10px] space-y-0.5">
                <p className="font-extrabold text-slate-800 tracking-wider">MÃ TÀI SẢN</p>
                <p className="font-mono font-extrabold text-cyan-700">{voucherData.asset_tag || voucherData.assetTag || 'N/A'}</p>
                <p className="text-slate-400 font-mono">{voucherCode}</p>
              </div>
            </div>
          </div>

        </div>

        {/* Modal Bottom Action Controls (Fixed Footer) */}
        <div className={`p-4 border-t shrink-0 flex items-center justify-between ${
          isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/80 border-slate-800'
        }`}>
          <div className="text-xs text-slate-400 flex items-center gap-1">
            <ShieldCheck className="w-4 h-4 text-emerald-500" /> Biên bản được lưu trữ tập trung trên máy chủ CSDL.
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                isLight ? 'bg-slate-200 text-slate-700 hover:bg-slate-300' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              Đóng Cửa Sổ
            </button>
            <button
              type="button"
              onClick={handlePrint}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs shadow-lg shadow-cyan-600/20 flex items-center gap-1.5 transition transform active:scale-95"
            >
              <Printer className="w-4 h-4" /> In Phiếu / Xuất PDF
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
