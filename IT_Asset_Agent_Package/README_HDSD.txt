==============================================================================
    HƯỚNG DẪN CÀI ĐẶT BỘ AGENT QUÉT TÀI SẢN IT CHÍNH THỨC TẠI MÁY TRẠM
==============================================================================

Bộ Agent này giúp tự động thu thập cấu hình Phần cứng (CPU, Mainboard, RAM, Ổ cứng, IP thật), 
Phần mềm cài đặt từ Registry và báo cáo liên tục về Server Quản Lý Tài Sản IT mỗi 10 phút.

------------------------------------------------------------------------------
CÁCH 1: CÀI ĐẶT DỊCH VỤ CHẠY NGẦM CHÍNH THỨC (KHUYÊN DÙNG CHO IT ADMIN)
------------------------------------------------------------------------------
1. Copy toàn bộ thư mục `IT_Asset_Agent_Package` vào máy trạm.
2. Nhấp chuột phải vào file `INSTALL_SERVICE.bat`.
3. Chọn "Run as Administrator" (Chạy dưới quyền Quản trị viên).
4. Nhập địa chỉ IP Server (Ví dụ: http://10.30.11.152:3001) hoặc nhấn Enter để dùng mặc định.
5. Agent sẽ tự động được đăng ký thành Dịch vụ Windows (SYSTEM Account) chạy ngầm 24/7.

------------------------------------------------------------------------------
CÁCH 2: GỠ BỎ DỊCH VỤ AGENT KHOI MÁY TRẠM
------------------------------------------------------------------------------
1. Nhấp chuột phải vào file `UNINSTALL_SERVICE.bat`.
2. Chọn "Run as Administrator" (Chạy dưới quyền Quản trị viên).
3. Dịch vụ Agent sẽ bị dừng và gỡ bỏ hoàn toàn khỏi hệ thống Windows.

------------------------------------------------------------------------------
CÁCH 3: CHẠY KIỂM TRA THỬ NẠP DỮ LIỆU TỨC THÌ (TESTING)
------------------------------------------------------------------------------
1. Double-click file `run_agent.bat` để khởi chạy ngay lập tức màn hình Console.
2. Màn hình xuất hiện "Status: SUCCESS" nghĩa là kết nối và gửi dữ liệu thành công.

------------------------------------------------------------------------------
THƯ MỤC CHỨA BỘ CÀI AGENT:
d:\Code\AssetManagement\IT_Asset_Agent_Package
==============================================================================
