📚 E-Learning Platform

Một nền tảng E-Learning hiện đại hỗ trợ quản lý lớp học, kiểm tra trực tuyến, nhắn tin realtime và tích hợp AI để hỗ trợ giáo viên tạo nội dung học tập nhanh chóng.
Hệ thống được xây dựng theo mô hình Fullstack với Backend sử dụng Spring Boot và Frontend sử dụng React.

🚀 Tính năng chính

1. 🔐 Xác thực & Phân quyền
Đăng ký / đăng nhập tài khoản
JWT Authentication
Phân quyền:
Admin
Teacher
Student

2. 🏫 Quản lý lớp học
Giáo viên tạo lớp học
Sinh mã tham gia lớp
Học sinh tham gia lớp bằng code
Quản lý thành viên lớp
Danh sách lớp đã tham gia
Phân quyền giáo viên / học sinh trong lớp

3. 📝 Bài tập & Bài đăng
Bài đăng lớp học
Tạo bài đăng thông báo
Bình luận bài đăng
Đính kèm file
Bài tập
Tạo bài tập
Deadline bài tập
Nộp bài online
Chấm điểm bài tập
Upload file bài làm

4. 🤖 Kiểm tra trực tuyến + AI sinh câu hỏi
Kiểm tra trực tuyến
Tạo bài kiểm tra
Trắc nghiệm nhiều đáp án
Tự động chấm điểm
Giới hạn thời gian
Theo dõi trạng thái làm bài realtime
AI sinh câu hỏi
Sinh câu hỏi tự động từ file txt dạng câu hỏi trắc nghiệm

5. 💬 Hệ thống nhắn tin
Nhắn tin realtime bằng WebSocket
Tạo cuộc trò chuyện
Tin nhắn cá nhân
Danh sách bạn bè
Hiển thị trạng thái online
Gửi emoji
Tìm kiếm người dùng
6. 📊 Thống kê & Phân tích
Thống kê điểm số
Phân tích tiến độ học tập
Theo dõi hiệu suất lớp học
Thống kê bài kiểm tra
Dashboard quản trị

7. 🔥 Streak (Theo dõi kiên trì)
Theo dõi số ngày học liên tiếp
Reset streak khi không hoạt động
Hiển thị streak profile
Ghi nhận hoạt động học tập mỗi ngày
Gamification trải nghiệm học tập
8. 📁 Xuất dữ liệu
Export Excel
Xuất danh sách điểm
Xuất thống kê lớp học
Xuất kết quả kiểm tra

🛠 Yêu cầu hệ thống
Thành phần	Phiên bản
Java	17+
Node.js	16+
Maven	3.8+
npm	8+
⚙️ Công nghệ sử dụng
Backend
Java 17
Spring Boot
Spring Security
JWT Authentication
WebSocket
JPA / Hibernate
Maven
Frontend
ReactJS
React Router
Axios
Socket.io / WebSocket Client
Database & Services
Supabase
Cloud Storage

🧩 Hướng dẫn cài đặt
1. Clone project
git clone https://github.com/your-username/elearning-platform.git
cd elearning-platform

2. Chạy Backend
cd backend
mvn clean install
mvn spring-boot:run

Backend chạy tại:

http://localhost:8080
3. Chạy Frontend
cd frontend
npm install
npm run dev

Frontend chạy tại:

http://localhost:5173
👨‍🏫 Hướng dẫn sử dụng
Giáo viên
Có thể:
Tạo lớp học
Tạo bài kiểm tra
Tạo bài tập
Chấm điểm
Theo dõi thống kê học sinh
Xuất dữ liệu lớp học
Sử dụng AI tạo câu hỏi
Học sinh
Có thể:
Tham gia lớp học
Làm bài kiểm tra
Nộp bài tập
Nhắn tin với bạn bè
Theo dõi streak học tập
Xem thống kê cá nhân

🚀 Deployment
Backend Deployment
Build project
mvn clean package
Chạy file JAR
java -jar target/elearning-platform.jar
Frontend Deployment
Build frontend
npm run build

Deploy Web lên: Vercel
Deploy PostgreSQL
sử dụng:Supabase
🔒 Bảo mật
JWT Authentication
Password Encryption
Role-based Authorization
Protected API Routes
CORS Configuration

📈 Định hướng phát triển
Video call học trực tuyến
AI chấm bài tự động
Whiteboard realtime
Mobile App
Notification System
Voice Chat
👨‍💻 Tác giả

Developed by: Your Team Name
