==============================================================================
    HƯỚNG DẪN CÀI ĐẶT AGENT QUÉT TÀI SẢN IT TỰ ĐỘNG TẠI MÁY TRẠM CÁ NHÂN
==============================================================================

Bộ Agent này giúp tự động thu thập cấu hình Phần cứng (CPU, Mainboard, RAM, Ổ cứng, IP), 
Phần mềm cài đặt và báo cáo liên tục về Server Quản Lý Tài Sản IT mỗi 10 phút.

------------------------------------------------------------------------------
CÁCH 1: CHẠY TRỰC TIẾP ĐỂ NẠP DỮ LIỆU TÀI SẢN VÀO HỆ THỐNG (KHÔNG CẦN CÀI ĐẶT)
------------------------------------------------------------------------------
1. Mở file `run_agent.bat` bằng Notepad.
2. Sửa địa chỉ `SERVER_URL` thành IP Server của bạn (Ví dụ: http://192.168.1.100:5000).
3. Double-click file `run_agent.bat` để chạy ngay lập tức.
4. Màn hình console sẽ xuất hiện thông báo "Status: SUCCESS" và tự động quét lại mỗi 10 phút.

------------------------------------------------------------------------------
CÁCH 2: CÀI ĐẶT TỰ ĐỘNG CHẠY NGẦM THEO WINDOWS (CHẠY 24/7 MỖI 10 PHÚT)
------------------------------------------------------------------------------
1. Nhấp chuột phải vào file `install_as_startup_task.bat`.
2. Chọn "Run as Administrator" (Chạy dưới quyền Quản trị viên).
3. Agent sẽ tự động được đăng ký thành dịch vụ Windows Scheduled Task và chạy ngầm 
   mỗi khi máy tính khởi động.

------------------------------------------------------------------------------
THƯ MỤC CHỨA BỘ CÀI AGENT:
d:\Code\AssetManagement\IT_Asset_Agent_Package
==============================================================================
