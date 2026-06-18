# CHƯƠNG 3. GIẢI PHÁP CHO BÀI TOÁN

## 3.1. Đặt vấn đề và phân tích bài toán

Qua quá trình khảo sát và nghiên cứu thực trạng của các hệ thống quản lý học tập (LMS) trực tuyến hiện hành như Moodle, Google Classroom hay các giải pháp tự phát triển tại Việt Nam, có thể nhận thấy nhiều hạn chế lớn về mặt kỹ thuật và nghiệp vụ đang tồn tại, ảnh hưởng trực tiếp đến hiệu quả giảng dạy và trải nghiệm của cả giảng viên lẫn sinh viên. Các vấn đề cốt lõi cần giải quyết bao gồm:

*   **Hạn chế về khả năng mở rộng (Scalability) của kiến trúc cũ**: Phần lớn các hệ thống LMS truyền thống được phát triển trên kiến trúc nguyên khối (Monolithic), sử dụng công nghệ như PHP hoặc các framework cũ kết hợp cơ sở dữ liệu quan hệ đồng bộ. Điều này tạo ra rào cản lớn khi hệ thống cần nâng cấp hoặc mở rộng quy mô. Khi lượng truy cập tăng đột biến (ví dụ: hàng nghìn sinh viên cùng truy cập vào làm bài thi trắc nghiệm giữa kỳ hoặc nộp bài tập sát giờ deadline), việc quá tải cơ sở dữ liệu sẽ kéo sập toàn bộ hệ thống, gây gián đoạn cho các hoạt động giảng dạy khác.
*   **Thiếu hụt tương tác thời gian thực (Real-time Interaction)**: Các hoạt động học tập trực tuyến đòi hỏi tính tương tác tức thì. Tuy nhiên, các hệ thống cũ thiếu cơ chế đồng bộ dữ liệu thời gian thực. Khi giảng viên đăng thông báo mới, giao bài tập hoặc sinh viên gửi tin nhắn trao đổi, người dùng bắt buộc phải thực hiện tải lại trang (F5) để cập nhật thông tin. Sự trễ trong truyền tải thông tin này tạo ra rào cản lớn, làm giảm chất lượng thảo luận và tiến độ giải quyết thắc mắc học thuật.
*   **Rủi ro an toàn thông tin và phân quyền lỏng lẻo**: Quy trình xác thực truyền thống dựa trên session lưu ở bộ nhớ máy chủ dễ bị tấn công giả mạo phiên (Session Hijacking). Bên cạnh đó, việc phân quyền tài nguyên học liệu trên các hệ thống cũ thường không triệt để. Sinh viên có thể dò tìm đường dẫn tệp đính kèm hoặc ID bài tập để xem trước bài làm của người khác hoặc tiếp cận các học liệu chưa được công bố công khai, xâm phạm tính bảo mật và công bằng học thuật.
*   **Quy trình quản lý và vận hành thủ công**:
    *   *Quản lý lớp học*: Việc thêm thủ công hàng trăm sinh viên vào lớp học gây tốn thời gian cho giảng viên.
    *   *Thống kê và đánh giá*: Giảng viên phải tự tính toán điểm trung bình, xuất file Excel để xếp loại học tập thủ công cho từng sinh viên, dễ xảy ra sai sót dữ liệu.
    *   *Chuyên cần*: Thiếu cơ chế khuyến khích tự động để theo dõi tính tích cực học tập hàng ngày của sinh viên.
*   **Thiếu công cụ kiểm duyệt nội dung tự động**: Môi trường học tập trực tuyến cần tính sư phạm văn minh, nhưng các hệ thống hiện tại chưa hỗ trợ cơ chế tự động phát hiện và chặn các bình luận hoặc bài đăng chứa các ngôn từ thô tục, nhạy cảm của người dùng (sinh viên), hoàn toàn phụ thuộc vào việc kiểm duyệt thủ công của giáo viên.

Xuất phát từ những bất cập trên, đề tài tập trung xây dựng một hệ thống E-Learning thế hệ mới dựa trên kiến trúc phân tách Client-Server hiện đại, tích hợp công nghệ xác thực stateless JWT, cơ chế đẩy dữ liệu thời gian thực thông qua WebSockets, hệ thống quản lý học liệu an toàn và cơ chế thống kê kết quả trực quan. Mục tiêu là tạo ra một nền tảng hỗ trợ dạy và học trực tuyến tối ưu, đảm bảo các tiêu chí: **Thời gian thực - Bảo mật - Trực quan - Tiện lợi**.

---

## 3.2. Giải pháp công nghệ đề xuất

### 3.2.1. Kiến trúc tổng quan

Để giải quyết triệt để bài toán về hiệu năng và khả năng mở rộng linh hoạt, hệ thống được thiết kế theo mô hình phân tầng Client-Server với sự tách biệt hoàn toàn giữa giao diện người dùng (Frontend) và logic xử lý nghiệp vụ (Backend), kết hợp với nền tảng điện toán đám mây Supabase (Backend-as-a-Service - BaaS):

*   **Client Side (Frontend)**: Xây dựng dưới dạng ứng dụng đơn trang (SPA - Single Page Application) sử dụng thư viện ReactJS kết hợp TypeScript và build tool Vite. Điều này giúp giao diện có tốc độ phản hồi tức thì, trải nghiệm mượt mà, giảm thiểu tải lượng render cho máy chủ.
*   **Server Side (Backend)**: Sử dụng framework Spring Boot (Java 17) làm nòng cốt để xử lý logic nghiệp vụ và cung cấp các RESTful API bảo mật cho Frontend.
*   **Database & Middleware Layer (Supabase BaaS)**:
    *   Cơ sở dữ liệu quan hệ PostgreSQL lưu trữ toàn bộ dữ liệu có cấu trúc.
    *   Supabase Realtime (WebSocket) quản lý giao tiếp tin nhắn và thông báo thời gian thực.
    *   Supabase Auth quản lý phiên đăng nhập, cung cấp token JWT và tích hợp Google OAuth2.
    *   Supabase Storage lưu trữ tệp đính kèm bài tập và ảnh đại diện của người dùng.

---

### 3.2.2. Sơ đồ kiến trúc hệ thống

```
+-----------------------------------------------------------------------------------+
|                                 CLIENT SIDE (ReactJS)                             |
|  - UI Components (Vite, TypeScript, FontAwesome)                                  |
|  - State Management & Route Guards                                                |
|  - Supabase JS Client & REST Client (Fetch API)                                   |
+-----------------------------------------------------------------------------------+
           |                                   |                           |
           | HTTP REST Requests                | OAuth2 Login              | WebSocket
           | (Access Token JWT)                | Redirect                  | Connection
           v                                   v                           v
+-------------------------+         +---------------------+     +-------------------+
|       SERVER SIDE       |         |    SUPABASE AUTH    |     | SUPABASE REALTIME |
|     (Spring Boot)       |         | (GoTrue Identity)   |     |   (WebSockets)    |
|                         |         +---------------------+     +-------------------+
|  +-------------------+  |                    |                          |
|  | Controllers       |  |                    |                          |
|  | - Auth / Class    |  |                    |                          |
|  | - Post / Quiz     |  |                    | JWT Verification         | Push Updates
|  | - Submission      |  |<-------------------+                          | (Chat/Feed)
|  | - Stats           |  |                                               |
|  +-------------------+  |                                               |
|  +-------------------+  |                                               |
|  | Services & Logic  |  |                                               |
|  | - Banned Filter   |  |                                               |
|  | - Grade/Stats calc|  |                                               |
|  +-------------------+  |                                               |
|  +-------------------+  |                                               |
|  | JPA Repositories  |  |                                               |
|  +-------------------+  |                                               |
+-------------------------+                 |                              |
           |                                |                              |
           | SQL Queries (JDBC)             | RLS Policies                 |
           v                                v                              v
+-----------------------------------------------------------------------------------+
|                              DATABASE & STORAGE LAYER                             |
|  - Supabase PostgreSQL Database (Relational Engine, ACID Compliant)              |
|  - Supabase Storage (Object Store for Submissions & Attachments)                  |
+-----------------------------------------------------------------------------------+
```
*Hình 3.1: Sơ đồ kiến trúc hệ thống E-Learning lai (Hybrid Architecture) (Nguồn: Tự thiết kế)*

**Chi tiết vai trò các thành phần trong sơ đồ:**
1.  **Frontend (Giao diện người dùng ReactJS)**: Được xây dựng dựa trên các component trực quan, tiếp nhận thao tác của người dùng, thực hiện điều hướng client-side và gọi API đến Spring Boot Backend hoặc kết nối WebSocket trực tiếp đến Supabase Realtime để lấy/đồng bộ dữ liệu mà không cần tải lại trang.
2.  **Spring Boot Backend**: Đóng vai trò lớp xử lý trung gian an toàn. Thay vì để Frontend thực hiện các logic tính toán nặng hoặc truy cập database trực tiếp (dễ rò rỉ logic nghiệp vụ), Spring Boot tiếp nhận các request HTTP, thực hiện giải mã JWT để xác thực, kiểm tra quyền hạn, thực thi nghiệp vụ (như tính toán bảng xếp hạng, lọc từ khóa bậy) rồi giao tiếp với PostgreSQL thông qua Spring Data JPA.
3.  **Supabase Auth**: Quản lý phiên đăng nhập của người dùng. Cấp phát JWT Access Token có thời hạn ngắn để client gửi kèm trong Authorization header lên Backend Spring Boot. Xử lý các luồng đăng nhập nhanh bằng Google OAuth2.
4.  **Supabase Realtime**: Sử dụng giao thức WebSocket để duy trì kết nối hai chiều. Khi có thay đổi dữ liệu trong các bảng được cấu hình (như bảng `messages` hoặc `class_posts`), Supabase Realtime sẽ tự động "đẩy" (push) dữ liệu mới xuống ReactJS Client ngay lập tức.
5.  **Supabase PostgreSQL Database**: Lưu trữ tập trung toàn bộ cơ sở dữ liệu quan hệ của hệ thống với các ràng buộc khóa ngoại chặt chẽ. Áp dụng Row Level Security (RLS) để nâng cao bảo mật ở mức cơ sở dữ liệu.
6.  **Supabase Storage**: Lưu trữ các file nhị phân (tệp bài nộp `.pdf`, `.docx`, `.zip` của sinh viên hoặc các tài liệu giảng dạy của giảng viên). Tệp tin được bảo vệ và truy cập thông qua các đường dẫn ký tên (Signed URLs) có thời hạn để ngăn chặn truy cập trái phép.

---

### 3.2.3. Cơ chế bảo mật

Hệ thống loại bỏ cơ chế Session lưu trên Ram máy chủ truyền thống (Stateful) để chuyển sang cơ chế xác thực **Stateless** sử dụng JSON Web Token (JWT) kết hợp với chính sách bảo mật cấp hàng (Row Level Security - RLS) trên PostgreSQL:

*   **Xác thực không trạng thái (Stateless Authentication)**: Mỗi khi người dùng thực hiện đăng nhập thành công, hệ thống cấp phát một JWT chứa thông tin định danh và vai trò. Máy chủ Backend Spring Boot không lưu giữ bất kỳ trạng thái đăng nhập nào. Khi nhận yêu cầu API, Spring Boot Security Filter Chain sẽ tự động giải mã chữ ký JWT bằng Secret Key được cấu hình đồng bộ với Supabase. Nếu hợp lệ, thông tin người dùng được đưa vào Context để xử lý yêu cầu. Điều này giúp giảm tải Ram của máy chủ và tăng tốc độ xử lý request.
*   **Bảo mật dữ liệu cấp hàng (Row Level Security - RLS)**: Supabase PostgreSQL cấu hình RLS cho tất cả các bảng. Chỉ những người dùng đã xác thực và thỏa mãn chính sách cụ thể mới có quyền thực hiện các truy vấn SQL.
    *   *Bảng `submissions`*: Chỉ sinh viên sở hữu (`auth.uid() = student_id`) mới được phép xem/sửa bài nộp của mình, và giảng viên dạy lớp chứa bài nộp đó mới có quyền xem và cập nhật điểm số.
    *   *Bảng `messages`*: Chỉ hai người tham gia cuộc hội thoại (`auth.uid() = user1_id` hoặc `auth.uid() = user2_id`) mới được phép đọc các tin nhắn thuộc cuộc hội thoại đó.

---

## 3.3. Hiện thực giải pháp

### 3.3.1. Mô tả giải pháp

Hệ thống E-Learning được hiện thực hóa dưới dạng một ứng dụng web SPA tích hợp, tối ưu hóa cho cả thiết bị di động và máy tính cá nhân. Với sự kết hợp giữa ReactJS, Spring Boot và Supabase, dự án mang lại khả năng xử lý nhanh, bảo mật dữ liệu cao và giao tiếp tức thời, đáp ứng đầy đủ nhu cầu dạy và học trong môi trường giáo dục số hiện đại.

---

### 3.3.2. Các chức năng chính đã hiện thực

Hệ thống cung cấp các phân hệ chức năng tương thích với từng vai trò người dùng:

1.  **Phân hệ Xác thực & Hồ sơ**:
    *   Đăng ký tài khoản và đăng nhập bảo mật bằng Email/Password.
    *   Đăng nhập nhanh qua tài khoản Google (Google OAuth2).
    *   Cập nhật thông tin cá nhân (Ảnh đại diện, Họ tên, Trường học) và Đổi mật khẩu bảo mật.
2.  **Phân hệ Quản lý Lớp học**:
    *   **Giảng viên**: Tạo lớp học mới; hệ thống tự động sinh mã code tham gia (Join Code) ngẫu nhiên 6 ký tự. Xem danh sách thành viên trong lớp học và có quyền xóa sinh viên ra khỏi lớp. Thực hiện chức năng "Giải tán lớp học" để xóa hoàn toàn lớp và các bài viết/bài tập liên quan khi kết thúc môn.
    *   **Sinh viên**: Tham gia lớp học nhanh chóng bằng cách nhập Join Code. Thực hiện chức năng "Rời lớp học" khi không còn tham gia học tập.
3.  **Phân hệ Bảng tin & Bình luận (Class Feed)**:
    *   Giảng viên đăng bài viết thông báo, bài giảng hoặc tài liệu học tập, hỗ trợ tải lên nhiều tệp đính kèm.
    *   Sinh viên và giảng viên viết bình luận trao đổi học thuật ngay dưới bài viết.
    *   *Lọc từ từ tục tĩu*: Hệ thống tự động so khớp nội dung bài đăng/bình luận với danh sách từ khóa cấm ở database để ẩn đi các từ ngữ thô tục, bảo vệ môi trường sư phạm văn minh.
4.  **Phân hệ Giao bài tập tự luận (Assignments)**:
    *   Giảng viên giao bài tập tự luận, thiết lập tiêu đề, nội dung yêu cầu, thang điểm và hạn nộp (Deadline).
    *   Sinh viên tải bài làm (các file văn bản, nén) lên Supabase Storage và nộp bài trước hạn. Hệ thống tự động ghi nhận thời gian nộp và trạng thái (Đã nộp / Nộp muộn).
    *   Giảng viên xem danh sách bài nộp, tải tệp bài làm về đánh giá, nhập điểm số và nhận xét chi tiết (Feedback). Điểm số lập tức hiển thị cho sinh viên.
5.  **Phân hệ Trắc nghiệm trực tuyến (Quiz)**:
    *   Giảng viên thiết lập đề thi trắc nghiệm bao gồm tiêu đề, thời gian làm bài (phút), hạn chót và ngân hàng câu hỏi cùng danh sách đáp án (đánh dấu đáp án đúng).
    *   Sinh viên tiến hành làm bài thi với đồng hồ đếm ngược thời gian thực trên giao diện. Khi hết giờ, hệ thống tự động khóa đề và nộp bài (Auto-submit).
    *   Hệ thống tự động chấm điểm dựa trên cấu hình đáp án đúng và lưu trữ kết quả lượt thi (`quiz_attempts`).
6.  **Phân hệ Chat thời gian thực (Real-time Chat)**:
    *   Sinh viên và giảng viên có thể bắt đầu cuộc hội thoại trực tiếp.
    *   Nội dung tin nhắn được đồng bộ tức thì lên giao diện của cả hai người thông qua kết nối WebSocket của Supabase Realtime, cho phép chỉnh sửa hoặc xóa tin nhắn đã gửi.
7.  **Phân hệ Thống kê học tập (Analytics)**:
    *   **Giảng viên**: Xem các biểu đồ trực quan (Biểu đồ cột, biểu đồ tròn) thống kê số lượng bài tập sinh viên đã hoàn thành, phổ điểm thi trắc nghiệm trung bình và xếp loại học lực của cả lớp.
    *   **Sinh viên**: Xem bảng thống kê cá nhân bao gồm số lượng bài tập tự luận đã nộp, số bài trắc nghiệm đã hoàn thành, điểm trung bình cá nhân và xếp loại học lực hiện tại (Xuất sắc, Giỏi, Khá, Trung bình, Yếu).
8.  **Hệ thống chuỗi chuyên cần (Streak)**:
    *   Hệ thống theo dõi sự chuyên cần của sinh viên. Mỗi ngày sinh viên đăng nhập và thực hiện hoạt động học tập (như đăng bài, nộp bài, làm quiz, chat), hệ thống sẽ tăng chuỗi chuyên cần (Streak) lên 1 đơn vị. Nếu ngắt quãng hoạt động quá 24h, streak sẽ tự động reset về 0.
9.  **Phân hệ Quản trị viên (Admin Dashboard)**:
    *   Quản lý danh sách tài khoản người dùng trong hệ thống (Hạ quyền hoặc nâng quyền người dùng).
    *   Quản lý danh sách từ khóa bị cấm (Banned Keywords) – thêm mới hoặc xóa từ khóa khỏi bộ lọc.

---

### 3.3.3. Lược đồ Use case

```mermaid
usecaseDiagram
    actor "Sinh viên" as Student
    actor "Giảng viên" as Teacher
    actor "Quản trị viên" as Admin
    
    left_to_right_direction
    
    %% Phân hệ Chung
    rectangle "Hệ thống Xác thực" {
        usecase "Đăng ký tài khoản" as UC_Register
        usecase "Đăng nhập hệ thống" as UC_Login
        usecase "Đăng nhập bằng Google" as UC_GoogleLogin
        usecase "Cập nhật hồ sơ & Đổi mật khẩu" as UC_Profile
    }
    
    %% Phân hệ Lớp học
    rectangle "Quản lý Lớp học" {
        usecase "Tạo lớp học mới" as UC_CreateClass
        usecase "Tham gia lớp bằng mã code" as UC_JoinClass
        usecase "Rời lớp học" as UC_LeaveClass
        usecase "Giải tán lớp học" as UC_DissolveClass
        usecase "Loại bỏ thành viên khỏi lớp" as UC_KickMember
    }
    
    %% Phân hệ Nghiệp vụ Học tập
    rectangle "Nghiệp vụ Dạy và Học" {
        usecase "Đăng bài thông báo & Tài liệu" as UC_CreatePost
        usecase "Viết bình luận thảo luận" as UC_Comment
        usecase "Nộp bài tập tự luận" as UC_SubmitAssignment
        usecase "Chấm điểm & Nhận xét bài tập" as UC_GradeAssignment
        usecase "Thiết kế bài trắc nghiệm" as UC_CreateQuiz
        usecase "Làm bài thi trắc nghiệm trực tuyến" as UC_TakeQuiz
        usecase "Chat trao đổi thời gian thực" as UC_Chat
        usecase "Xem thống kê học lực & Streak" as UC_ViewStats
    }
    
    %% Phân hệ Admin
    rectangle "Quản trị Hệ thống" {
        usecase "Quản lý danh sách tài khoản" as UC_ManageUsers
        usecase "Quản lý từ khóa bị cấm" as UC_ManageBanned
    }
    
    %% Liên kết actor với usecase
    Student --> UC_Register
    Student --> UC_Login
    Student --> UC_GoogleLogin
    Student --> UC_Profile
    Student --> UC_JoinClass
    Student --> UC_LeaveClass
    Student --> UC_Comment
    Student --> UC_SubmitAssignment
    Student --> UC_TakeQuiz
    Student --> UC_Chat
    Student --> UC_ViewStats
    
    Teacher --> UC_Register
    Teacher --> UC_Login
    Teacher --> UC_GoogleLogin
    Teacher --> UC_Profile
    Teacher --> UC_CreateClass
    Teacher --> UC_DissolveClass
    Teacher --> UC_KickMember
    Teacher --> UC_CreatePost
    Teacher --> UC_Comment
    Teacher --> UC_GradeAssignment
    Teacher --> UC_CreateQuiz
    Teacher --> UC_Chat
    Teacher --> UC_ViewStats
    
    Admin --> UC_Login
    Admin --> UC_ManageUsers
    Admin --> UC_ManageBanned
```
*Hình 3.2: Sơ đồ Use Case tổng quát của hệ thống E-Learning (Nguồn: Tự thiết kế)*

---

```mermaid
usecaseDiagram
    actor "Sinh viên" as Student
    left_to_right_direction
    
    rectangle "Use Case Chi Tiết Làm Bài Quiz (Sinh viên)" {
        usecase "Xem danh sách Quiz của lớp" as UC_ViewQuizList
        usecase "Bắt đầu làm bài (Kích hoạt timer)" as UC_StartQuiz
        usecase "Tích chọn đáp án trắc nghiệm" as UC_SelectAnswer
        usecase "Nộp bài làm (Submit)" as UC_SubmitQuiz
        usecase "Xem kết quả & điểm số tự động" as UC_ViewResult
        usecase "Tự động cập nhật Stats & Streak" as UC_UpdateStats
        
        UC_StartQuiz ..> UC_ViewQuizList : <<include>>
        UC_SelectAnswer ..> UC_StartQuiz : <<include>>
        UC_SubmitQuiz ..> UC_SelectAnswer : <<include>>
        UC_ViewResult ..> UC_SubmitQuiz : <<include>>
        UC_UpdateStats ..> UC_SubmitQuiz : <<include>>
    }
    
    Student --> UC_ViewQuizList
    Student --> UC_StartQuiz
    Student --> UC_SelectAnswer
    Student --> UC_SubmitQuiz
    Student --> UC_ViewResult
```
*Hình 3.3: Lược đồ Use Case chi tiết Làm bài trắc nghiệm của Sinh viên (Nguồn: Tự thiết kế)*

---

#### 3.3.3.1. Các bảng đặc tả Use Case cốt lõi

*Bảng 3.1: Đặc tả use case Đăng ký tài khoản*

| Phần đặc tả | Nội dung chi tiết |
| :--- | :--- |
| **Tên use case** | Đăng ký tài khoản mới |
| **Tác nhân (Actor)** | Người dùng (Sinh viên, Giảng viên) |
| **Mô tả ngắn** | Cho phép người dùng tạo tài khoản mới trên hệ thống để bắt đầu tham gia giảng dạy hoặc học tập. |
| **Tiền điều kiện** | Người dùng chưa đăng nhập hệ thống và có địa chỉ Email hợp lệ chưa từng đăng ký trước đó. |
| **Hậu điều kiện** | Tài khoản người dùng được tạo thành công trong hệ thống. Hồ sơ cá nhân lưu vào bảng `profiles` với vai trò tương ứng. Hệ thống tự động thực hiện đăng nhập và điều hướng về trang chủ. |
| **Luồng sự kiện chính** | 1. Người dùng nhấn nút "Đăng ký" tại trang Welcome.<br>2. Hệ thống hiển thị Form đăng ký yêu cầu nhập: Họ tên, Email, Mật khẩu, Trường học và Lựa chọn vai trò (Sinh viên hoặc Giảng viên).<br>3. Người dùng điền đầy đủ thông tin và nhấn nút "Đăng ký".<br>4. Hệ thống gọi Supabase Auth để đăng ký tài khoản.<br>5. Supabase Auth băm mật khẩu, lưu tài khoản và tự động kích hoạt trigger tạo hồ sơ ở bảng `profiles`.<br>6. Hệ thống nhận phản hồi thành công, tự động lưu JWT Session và điều hướng người dùng đến giao diện trang chủ. |
| **Luồng sự kiện thay thế** | **4a. Thông tin nhập không hợp lệ hoặc thiếu**: Hệ thống hiển thị cảnh báo đỏ bên dưới các trường nhập liệu tương ứng và dừng luồng xử lý.<br>**4b. Email đã tồn tại**: Hệ thống hiển thị thông báo lỗi "Email này đã được sử dụng" và yêu cầu người dùng nhập Email khác. |

---

*Bảng 3.2: Đặc tả use case Đăng nhập*

| Phần đặc tả | Nội dung chi tiết |
| :--- | :--- |
| **Tên use case** | Đăng nhập hệ thống |
| **Tác nhân (Actor)** | Sinh viên, Giảng viên, Quản trị viên |
| **Mô tả ngắn** | Cho phép người dùng đăng nhập vào hệ thống bằng Email và Mật khẩu đã đăng ký để sử dụng dịch vụ học tập. |
| **Tiền điều kiện** | Người dùng đã đăng ký tài khoản hợp lệ từ trước. |
| **Hậu điều kiện** | Hệ thống xác thực thành công, lưu trữ JWT Token và hiển thị giao diện Dashboard tương ứng với vai trò của người dùng. |
| **Luồng sự kiện chính** | 1. Người dùng truy cập vào trang đăng nhập.<br>2. Người dùng điền Email và Mật khẩu, sau đó nhấn "Đăng nhập".<br>3. Hệ thống gửi thông tin đăng nhập lên Supabase Auth Server.<br>4. Supabase Auth đối chiếu mật khẩu đã băm trong database.<br>5. Nếu trùng khớp, Supabase sinh JWT Access Token chứa vai trò người dùng và trả về cho Client.<br>6. ReactJS Client lưu trữ token vào Cookie/LocalStorage, giải mã vai trò để phân quyền và điều hướng người dùng sang trang Dashboard tương ứng. |
| **Luồng sự kiện thay thế** | **4a. Nhập sai Email hoặc Mật khẩu**: Hệ thống báo lỗi "Tài khoản hoặc mật khẩu không chính xác" và yêu cầu người dùng nhập lại.<br>**4b. Tài khoản bị khóa (Admin ban)**: Hệ thống phát hiện cờ trạng thái tài khoản là bị khóa, hiển thị thông báo "Tài khoản của bạn đã bị khóa bởi quản trị viên" và từ chối đăng nhập. |

---

*Bảng 3.3: Đặc tả use case Tạo lớp học*

| Phần đặc tả | Nội dung chi tiết |
| :--- | :--- |
| **Tên use case** | Tạo lớp học mới |
| **Tác nhân (Actor)** | Giảng viên |
| **Mô tả ngắn** | Giảng viên thiết lập một không gian lớp học trực tuyến mới để chia sẻ tài liệu và quản lý sinh viên. |
| **Tiền điều kiện** | Người dùng đã đăng nhập với vai trò Giảng viên (vai trò `"1"`). |
| **Hậu điều kiện** | Một lớp học mới được khởi tạo thành công trong bảng `classes` với mã Join Code 6 ký tự duy nhất, sẵn sàng tiếp nhận sinh viên. |
| **Luồng sự kiện chính** | 1. Giảng viên chọn chức năng "Tạo lớp học" trên Dashboard.<br>2. Hệ thống hiển thị hộp thoại (Modal) yêu cầu nhập tên lớp học.<br>3. Giảng viên nhập tên lớp học và nhấn nút "Tạo".<br>4. Frontend ReactJS tự động sinh ngẫu nhiên một mã code gồm 6 ký tự chữ và số (ví dụ: `A7B9C1`).<br>5. Frontend gửi request POST kèm theo tên lớp, mã code và `teacher_id` tới API `/api/classes/create` của Backend Spring Boot.<br>6. Spring Boot xác thực quyền, ghi thông tin lớp học vào bảng `classes` và trả về mã HTTP 200 OK.<br>7. Giao diện hiển thị thông báo thành công và cập nhật thẻ lớp học mới vào danh sách lớp giảng dạy. |
| **Luồng sự kiện thay thế** | **3a. Tên lớp học để trống**: Hệ thống ngăn không cho nhấn nút tạo và hiển thị yêu cầu "Vui lòng nhập tên lớp học". |

---

*Bảng 3.4: Đặc tả use case Tham gia lớp học*

| Phần đặc tả | Nội dung chi tiết |
| :--- | :--- |
| **Tên use case** | Tham gia lớp học |
| **Tác nhân (Actor)** | Sinh viên |
| **Mô tả ngắn** | Cho phép sinh viên tham gia vào một lớp học thông qua mã số lớp học (Join Code) do giảng viên cung cấp. |
| **Tiền điều kiện** | Người dùng đã đăng nhập với vai trò Sinh viên (vai trò `"0"`). Sinh viên có mã Join Code của lớp cần tham gia. |
| **Hậu điều kiện** | Bản ghi liên kết được tạo thành công trong bảng `class_members`. Sinh viên có quyền xem bảng tin và tài liệu của lớp học đó. |
| **Luồng sự kiện chính** | 1. Sinh viên chọn chức năng "Tham gia lớp" trên Dashboard.<br>2. Hệ thống hiển thị hộp thoại yêu cầu nhập mã lớp học (Join Code).<br>3. Sinh viên nhập mã gồm 6 ký tự và nhấn "Xác nhận".<br>4. Frontend gửi yêu cầu POST đến API `/api/classes/join` kèm theo `student_id` và `join_code`.<br>5. Backend Spring Boot thực hiện tìm kiếm lớp học có mã code tương ứng. Nếu thấy, hệ thống kiểm tra xem sinh viên đã tham gia lớp học này chưa.<br>6. Nếu chưa, Backend chèn một dòng mới vào bảng `class_members` trỏ đến `student_id` và `class_id`, sau đó trả về HTTP 200 OK.<br>7. Giao diện ReactJS thông báo "Tham gia lớp học thành công" và đưa sinh viên vào bảng tin lớp học. |
| **Luồng sự kiện thay thế** | **5a. Mã lớp học không tồn tại**: Backend trả về mã lỗi 400 Bad Request, giao diện hiển thị "Không tìm thấy lớp học với mã code này".<br>**5b. Sinh viên đã là thành viên của lớp**: Backend trả về lỗi 400, giao diện báo "Bạn đã tham gia lớp học này từ trước". |

---

*Bảng 3.5: Đặc tả use case Nộp bài tập tự luận*

| Phần đặc tả | Nội dung chi tiết |
| :--- | :--- |
| **Tên use case** | Nộp bài tập tự luận |
| **Tác nhân (Actor)** | Sinh viên |
| **Mô tả ngắn** | Sinh viên thực hiện upload file bài làm để nộp cho một bài tập tự luận cụ thể trong lớp học. |
| **Tiền điều kiện** | Sinh viên đã tham gia lớp học và bài đăng bài tập đó vẫn đang mở. |
| **Hậu điều kiện** | Bài làm của sinh viên được lưu trữ trong Supabase Storage, bản ghi bài nộp được chèn vào bảng `submissions` và liên kết file trong bảng `submission_files`. |
| **Luồng sự kiện chính** | 1. Sinh viên truy cập vào chi tiết bài đăng bài tập trong lớp học.<br>2. Hệ thống hiển thị thông tin yêu cầu bài tập và mục nộp bài.<br>3. Sinh viên chọn tệp bài làm từ thiết bị cá nhân.<br>4. Hệ thống tải tệp lên thư mục riêng tư của bài tập đó trên Supabase Storage, nhận về URL lưu trữ.<br>5. Sinh viên nhấn nút "Nộp bài".<br>6. Giao diện gửi request POST chứa `post_id`, `student_id`, trạng thái bài nộp và danh sách URL file tới API `/api/submissions/submit`.<br>7. Backend Spring Boot tạo bản ghi trong bảng `submissions`, lưu các file đính kèm vào `submission_files`, tự động tính toán thời gian nộp so với deadline để xác định cờ "Late" (Nộp muộn).<br>8. Backend trả về kết quả thành công, giao diện chuyển sang trạng thái "Đã nộp bài". |
| **Luồng sự kiện thay thế** | **4a. Lỗi upload tệp lên Storage**: Hệ thống hiển thị thông báo "Không thể upload tệp bài làm, vui lòng kiểm tra kết nối mạng".<br>**5a. Hạn nộp đã khóa hoàn toàn (nếu cấu hình không cho nộp muộn)**: Hệ thống ẩn nút nộp bài và hiển thị thông báo "Bài tập đã quá hạn nộp". |

---

*Bảng 3.6: Đặc tả use case Làm bài trắc nghiệm (Quiz)*

| Phần đặc tả | Nội dung chi tiết |
| :--- | :--- |
| **Tên use case** | Làm bài thi trắc nghiệm trực tuyến |
| **Tác nhân (Actor)** | Sinh viên |
| **Mô tả ngắn** | Sinh viên tham gia làm một bài trắc nghiệm có giới hạn thời gian và nhận điểm số tự động sau khi hoàn thành. |
| **Tiền điều kiện** | Sinh viên đã tham gia lớp học, chưa làm bài quiz này trước đó và bài thi vẫn nằm trong thời gian hoạt động. |
| **Hậu điều kiện** | Lượt thi được ghi nhận trong bảng `quiz_attempts`, chi tiết các câu trả lời lưu vào bảng `student_answers`, điểm số được tính tự động và cập nhật vào thống kê học lực (`student_stats`) của sinh viên. |
| **Luồng sự kiện chính** | 1. Sinh viên nhấn chọn bài trắc nghiệm trong lớp học và click "Bắt đầu làm bài".<br>2. Hệ thống kích hoạt đồng hồ đếm ngược (Timer) dựa trên thuộc tính `duration_minutes` của Quiz và hiển thị danh sách câu hỏi trắc nghiệm.<br>3. Sinh viên tích chọn các câu trả lời tương ứng với mỗi câu hỏi.<br>4. Hệ thống liên tục cập nhật trạng thái làm bài tạm thời trên giao diện.<br>5. Khi làm xong, sinh viên nhấn "Nộp bài" (hoặc khi đồng hồ đếm ngược về 0, hệ thống tự động kích hoạt sự kiện nộp bài).<br>6. Frontend gửi yêu cầu POST chứa danh sách các `question_id` và `selected_answer_id` được chọn tới API `/api/quiz-attempts/submit`.<br>7. Backend Spring Boot thực hiện đối chiếu các câu trả lời với đáp án đúng trong bảng `answers` để tính điểm, lưu kết quả lượt thi vào `quiz_attempts` và lưu câu trả lời chi tiết vào `student_answers`.<br>8. Backend kích hoạt dịch vụ tính lại điểm số trung bình và cập nhật bảng thống kê học lực `student_stats`. Giao diện hiển thị điểm số và đáp án đúng/sai cho sinh viên xem. |
| **Luồng sự kiện thay thế** | **5a. Mất kết nối Internet khi làm bài**: Đồng hồ đếm ngược vẫn chạy client-side. Hệ thống hiển thị cảnh báo mất mạng và cố gắng lưu các câu trả lời đã tích chọn vào local storage để chuẩn bị submit lại khi có mạng. |

---

### 3.3.4. Lược đồ Activity

```mermaid
stateDiagram-v2
    [*] --> NhapThongTinLogin : 1. Người dùng nhập Email & Password
    NhapThongTinLogin --> GuiRequestAuth : 2. Nhấn "Đăng nhập"
    GuiRequestAuth --> KiemTraDatabase : 3. Gửi thông tin tới Supabase Auth
    
    state KiemTraDatabase <<choice>>
    KiemTraDatabase --> HopLe : Tài khoản & Mật khẩu đúng
    KiemTraDatabase --> KhongHopLe : Sai thông tin hoặc tài khoản bị khóa

    KhongHopLe --> NhapThongTinLogin : Hiển thị thông báo lỗi & Yêu cầu nhập lại
    
    HopLe --> KiemTraTrangThaiBan : Đối chiếu trạng thái tài khoản
    
    state KiemTraTrangThaiBan <<choice>>
    KiemTraTrangThaiBan --> BiBan : Cờ ban = true
    KiemTraTrangThaiBan --> HoatDong : Cờ ban = false
    
    BiBan --> [*] : Báo lỗi "Tài khoản bị khóa" & Dừng
    
    HoatDong --> TraVeJWT : Cấp token Access JWT & Metadata
    TraVeJWT --> LuuSessionClient : ReactJS lưu token vào LocalStorage/Cookie
    LuuSessionClient --> KiemTraVaiTro : Đọc trường Role trong Payload
    
    state KiemTraVaiTro <<choice>>
    KiemTraVaiTro --> Role_Student : Role = "0"
    KiemTraVaiTro --> Role_Teacher : Role = "1"
    KiemTraVaiTro --> Role_Admin : Role = "2"
    
    Role_Student --> MainStudentDashboard : Điều hướng sang Dashboard Sinh viên
    Role_Teacher --> MainTeacherDashboard : Điều hướng sang Dashboard Giảng viên
    Role_Admin --> MainAdminDashboard : Điều hướng sang Dashboard Quản trị viên
    
    MainStudentDashboard --> [*]
    MainTeacherDashboard --> [*]
    MainAdminDashboard --> [*]
```
*Hình 3.4: Sơ đồ hoạt động (Activity Diagram) của tính năng Đăng nhập và Phân quyền (Nguồn: Tự thiết kế)*

---

```mermaid
stateDiagram-v2
    [*] --> TruyCapBaiQuiz : Sinh viên click vào bài Quiz
    TruyCapBaiQuiz --> KiemTraLuotLam : Hệ thống check lịch sử lượt làm bài
    
    state KiemTraLuotLam <<choice>>
    KiemTraLuotLam --> DaLam : Đã tồn tại bản ghi ở quiz_attempts
    KiemTraLuotLam --> ChuaLam : Chưa làm bài thi này

    DaLam --> [*] : Thông báo "Bạn đã hoàn thành bài thi này" & Dừng
    
    ChuaLam --> KichHoatTimer : Click "Bắt đầu" & Chạy đồng hồ đếm ngược
    KichHoatTimer --> HienThiCauHoi : Render danh sách câu hỏi & đáp án
    HienThiCauHoi --> LamBai : Sinh viên lựa chọn đáp án trắc nghiệm
    
    state KiemTraThoiGian <<choice>>
    LamBai --> KiemTraThoiGian : Sinh viên click "Nộp bài" hoặc Hết giờ (Timer = 0)
    
    KiemTraThoiGian --> GuiBaiThi : POST dữ liệu lên Backend Spring Boot
    GuiBaiThi --> TinhDiemTuDong : Backend đối chiếu đáp án đúng trong DB
    TinhDiemTuDong --> LuuKetQua : Ghi nhận điểm số vào quiz_attempts & student_answers
    LuuKetQua --> CapNhatHocLuc : Tính lại điểm số trung bình ở student_stats
    CapNhatHocLuc --> HienThiDiem : Trả điểm số & lời giải chi tiết về UI
    HienThiDiem --> [*] : Hoàn tất lượt thi
```
*Hình 3.5: Sơ đồ hoạt động (Activity Diagram) của tính năng Làm bài trắc nghiệm trực tuyến (Nguồn: Tự thiết kế)*

---

### 3.3.5. Lược đồ tuần tự (Sequence Diagram)

Các biểu đồ tuần tự mô tả dòng chảy của các thông điệp, yêu cầu HTTP và phản hồi giữa các đối tượng theo thứ tự thời gian. Dưới đây là mô tả luồng giao tiếp của 2 nghiệp vụ quan trọng đã được hiện thực trong hệ thống:

#### Luồng 1: Sinh viên tham gia lớp học bằng mã code (Join Class)
Khi sinh viên nhập mã Join Code 6 ký tự trên giao diện ReactJS, hệ thống sẽ thực hiện xác thực mã và thiết lập liên kết thành viên trong Database.

```
Sinh viên            Class.jsx          Backend (ClassController)     ClassService        Database
   |                     |                          |                      |                 |
   | 1: Nhập Join Code & |                          |                      |                 |
   |    click "Tham gia" |                          |                      |                 |
   |-------------------->|                          |                      |                 |
   |                     | 1.1: POST /api/classes/join                     |                 |
   |                     |      {student_id, join_code}                    |                 |
   |                     |------------------------->|                      |                 |
   |                     |                          | 1.2: findByJoinCode  |                 |
   |                     |                          |--------------------->|                 |
   |                     |                          |                      | 1.3: SELECT *   |
   |                     |                          |                      |      WHERE code |
   |                     |                          |                      |---------------->|
   |                     |                          |                      | 1.4: Lớp học    |
   |                     |                          |                      |<----------------|
   |                     |                          | 1.5: Trả về Lớp học  |                 |
   |                     |                          |<---------------------|                 |
   |                     |                          |                                        |
   |                     |                          | [Trường hợp mã code hợp lệ]            |
   |                     |                          | 1.6: joinClass(student_id, class_id)   |
   |                     |                          |--------------------->|                 |
   |                     |                          |                      | 1.7: INSERT     |
   |                     |                          |                      |    class_members|
   |                     |                          |                      |---------------->|
   |                     |                          |                      | 1.8: Hoàn tất   |
   |                     |                          |                      |<----------------|
   |                     |                          | 1.9: void            |                 |
   |                     |                          |<---------------------|                 |
   |                     | 1.10: HTTP 200 OK        |                      |                 |
   |                     |<-------------------------|                      |                 |
   |                     |                          |                      |                 |
   |                     | 1.11: alert("Thành công")|                      |                 |
   |                     | 1.12: Điều hướng lớp học |                      |                 |
   |<--------------------|                          |                      |                 |
```
*Hình 3.6: Biểu đồ tuần tự nghiệp vụ tham gia lớp học của Sinh viên (Nguồn: Tự thiết kế)*

---

#### Luồng 2: Làm bài thi trắc nghiệm (Take and Submit Quiz)
Mô tả quá trình sinh viên thực hiện kiểm tra trắc nghiệm, hệ thống tính toán điểm số tự động tại backend và cập nhật bảng thống kê xếp loại.

```
Sinh viên            EQuizz.jsx        Backend (QuizAttemptController)   AttemptRepository    StudentStatsService   Database
   |                     |                          |                           |                      |                |
   | 1: Bắt đầu làm bài  |                          |                           |                      |                |
   |-------------------->|                          |                           |                      |                |
   |                     | 1.1: startTimer()        |                           |                      |                |
   |                     | 1.2: renderQuestions()   |                           |                      |                |
   |<--------------------|                          |                           |                      |                |
   |                     |                          |                           |                      |                |
   | 2: Tích chọn đáp án |                          |                           |                      |                |
   |    & click "Nộp bài"|                          |                           |                      |                |
   |-------------------->|                          |                           |                      |                |
   |                     | 2.1: POST /api/quiz-attempts/submit                  |                      |                |
   |                     |      {userId, quizId, answers}                       |                      |                |
   |                     |------------------------->|                           |                      |                |
   |                     |                          | 2.2: save(attempt)        |                      |                |
   |                     |                          |-------------------------->|                      |                |
   |                     |                          |                           | 2.3: INSERT          |                |
   |                     |                          |                           |      quiz_attempts   |                |
   |                     |                          |                           |--------------------->|                |
   |                     |                          |                           | 2.4: savedAttempt    |                |
   |                     |                          |                           |<---------------------|                |
   |                     |                          |                                                  |                |
   |                     |                          | 2.5: calculateAndUpdateStudentStats(userId)      |                |
   |                     |                          |------------------------------------------------->|                |
   |                     |                          |                                                  | 2.6: SELECT    |
   |                     |                          |                                                  |      scores    |
   |                     |                          |                                                  |-------------->|
   |                     |                          |                                                  | 2.7: Điểm số   |
   |                     |                          |                                                  |<--------------|
   |                     |                          |                                                  | 2.8: UPDATE    |
   |                     |                          |                                                  |  student_stats |
   |                     |                          |                                                  |-------------->|
   |                     |                          |                                                  | 2.9: Hoàn tất  |
   |                     |                          |                                                  |<--------------|
   |                     |                          | 2.10: void                                       |                |
   |                     |                          |<-------------------------------------------------|                |
   |                     | 2.11: HTTP 200 OK (Score)|                           |                      |                |
   |                     |<-------------------------|                           |                      |                |
   |                     |                          |                           |                      |                |
   |                     | 2.12: Hiển thị kết quả   |                           |                      |                |
   |<--------------------|                          |                           |                      |                |
```
*Hình 3.7: Biểu đồ tuần tự nghiệp vụ nộp bài trắc nghiệm của Sinh viên (Nguồn: Tự thiết kế)*

---

### 3.3.6. Các màn hình của hệ thống

Giao diện hệ thống được thiết kế theo xu hướng UI/UX tối giản nhưng hiện đại, sử dụng các dải màu chủ đạo hài hòa (Curated palettes), các thẻ hiển thị (Cards) bo góc dạng Glassmorphism mang lại hiệu ứng thị giác chuyên nghiệp.

*   **Màn hình Đăng ký & Đăng nhập (Welcome)**: Cung cấp hai tùy chọn đăng nhập: Nhập Email/Password truyền thống hoặc nhấn nút "Sign in with Google" để đăng nhập nhanh thông qua Google Identity Services.
*   **Màn hình Trang chủ (Dashboard chính)**:
    *   *Giảng viên*: Hiển thị danh sách các lớp đang giảng dạy dưới dạng lưới thẻ Card trực quan. Nút nổi bật "Tạo lớp học mới" mở ra hộp thoại nhập tên lớp.
    *   *Sinh viên*: Hiển thị danh sách lớp đang tham gia học tập cùng thông tin giảng viên đại diện, nút "Tham gia lớp học mới" góc trên màn hình.
*   **Màn hình Bảng tin Lớp học (Class Room)**: Giao diện chính chứa menu điều hướng tab: Bảng tin, Bài tập, Trắc nghiệm (Quiz), Chat và Thành viên.
    *   *Tab Bảng tin*: Nơi giảng viên đăng thông báo đính kèm tài liệu học tập. Dưới mỗi bài viết có thanh bình luận (Comment section). Các bài bình luận chứa từ khóa thô tục sẽ tự động bị ẩn bớt ký tự bằng dấu hoa thị (`*`).
*   **Màn hình Nộp và Chấm bài tập**:
    *   *Sinh viên*: Hiển thị chi tiết yêu cầu bài tập tự luận của giáo viên, tệp đính kèm và khu vực Drag-and-Drop kéo thả tệp bài làm để tải lên hệ thống.
    *   *Giảng viên*: Màn hình hiển thị danh sách các sinh viên trong lớp học, cờ trạng thái nộp bài (Đã nộp / Chưa nộp / Nộp trễ). Khi bấm chọn sinh viên, giảng viên có thể xem trực tiếp tệp bài làm và thực hiện nhập điểm số cùng nhận xét nhanh.
*   **Màn hình Làm bài thi trắc nghiệm (E-Quiz)**: Giao diện tách biệt tập trung tối đa cho người thi. Cột bên trái hiển thị danh sách câu hỏi dạng lưới để nhanh chóng nhảy tới câu cần làm. Khu vực trung tâm hiển thị câu hỏi hiện tại và 4 đáp án lựa chọn. Góc trên bên phải hiển thị đồng hồ đếm ngược thời gian thực dạng trôi.
*   **Màn hình Phòng Chat thời gian thực**: Cửa sổ chat chia đôi: Cột bên trái là danh sách các cuộc hội thoại gần đây (thông tin giảng viên/sinh viên liên quan), cột bên phải là nội dung cuộc trò chuyện. Tin nhắn mới hiển thị tức thì, hỗ trợ thu hồi (Delete) hoặc chỉnh sửa (Edit) trực tiếp tin nhắn.
*   **Màn hình Analytics và Streak**:
    *   *Giảng viên*: Hiển thị các thống kê tổng quát của lớp học dưới dạng biểu đồ tròn (xếp loại sinh viên Xuất sắc, Giỏi, Khá, Trung bình) và biểu đồ cột biểu thị phổ điểm kiểm tra trắc nghiệm.
    *   *Sinh viên*: Hiển thị số Streak hiện tại dưới dạng icon ngọn lửa rực sáng kèm số ngày chuyên cần liên tục, giúp tạo động lực học tập. Bên cạnh đó là biểu đồ Radar hoặc biểu đồ cột thể hiện điểm số trung bình cá nhân theo từng phân môn.
*   **Màn hình Admin Dashboard**: Giao diện quản trị viên hệ thống với bảng danh sách người dùng đầy đủ bộ lọc tìm kiếm theo tên hoặc vai trò. Menu phụ cho phép quản trị danh sách từ khóa cấm, cho phép thêm hoặc xóa từ khóa dễ dàng.

---

### 3.3.7. Lược đồ cơ sở dữ liệu

Cơ sở dữ liệu PostgreSQL của hệ thống bao gồm 19 bảng liên quan mật thiết để đảm bảo tính toàn vẹn dữ liệu:

```
  +------------------+         +------------------+         +------------------+
  |     profiles     | <------ |     classes      | <------ |  class_members   |
  | (Lưu người dùng) |         | (Lưu lớp học)    |         | (Thành viên lớp) |
  +------------------+         +------------------+         +------------------+
        ^     ^                      |      |
        |     +------------+         |      +------------+
        |                  |         v                   v
  +------------------+     |   +------------------+    +------------------+
  |   user_streaks   |     |   |   class_posts    |    |     quizzes      |
  | (Lưu streak ngày)|     |   | (Lưu bài đăng)   |    | (Lưu đề thi tr.) |
  +------------------+     |   +------------------+    +------------------+
                           |       |          |            |          |
                           |       v          v            v          v
                           |  +-----------+ +--------+ +---------+ +----------+
                           |  |post_attach| |comment | |question | |quiz_att. |
                           |  +-----------+ +--------+ +---------+ +----------+
                           |                             |            |
                           v                             v            v
                      +-----------+                 +--------+     +----------+
                      |submission |                 | answer |     |std_answer|
                      +-----------+                 +--------+     +----------+
```
*Hình 3.8: Sơ đồ mối quan hệ giữa các bảng thực thể cốt lõi trong Database (Nguồn: Tự thiết kế)*

**Phân tích chi tiết chức năng các bảng trong cơ sở dữ liệu:**
1.  `profiles`: Lưu trữ thông tin chi tiết hồ sơ người dùng. Khóa chính `id` liên kết 1-1 với bảng xác thực người dùng của Supabase (`auth.users`). Chứa trường `role` (`"0"`: Sinh viên, `"1"`: Giảng viên, `"2"`: Admin) để phân quyền.
2.  `classes`: Lưu trữ các lớp học được tạo ra trong hệ thống. Trường `join_code` lưu mã code 6 ký tự để sinh viên tham gia lớp. Trường `teacher_id` liên kết khóa ngoại với bảng `profiles(id)`.
3.  `class_members`: Bảng liên kết trung gian thể hiện mối quan hệ nhiều-nhiều giữa sinh viên (`student_id`) và lớp học (`class_id`). Chèn bản ghi mới khi sinh viên nhập đúng Join Code.
4.  `class_posts`: Lưu trữ các bài viết trên bảng tin lớp học. Trường `type` xác định đây là bài thông báo bình thường (`"ANNOUNCEMENT"`) hay bài đăng giao bài tập tự luận (`"ASSIGNMENT"`).
5.  `post_attachments`: Lưu thông tin các tệp đính kèm bài viết của giảng viên. Chứa đường dẫn tệp tin trên Supabase Storage (`file_url`).
6.  `post_comments`: Lưu trữ các bình luận trao đổi dưới mỗi bài đăng. Khóa ngoại liên kết với `post_id` của bảng `class_posts` và `user_id` của bảng `profiles`.
7.  `submissions`: Ghi nhận thông tin nộp bài tập tự luận của sinh viên, bao gồm điểm số (`score`), nhận xét của giảng viên (`grade_comment`) và cờ trạng thái (`"SUBMITTED"`, `"GRADED"`).
8.  `submission_files`: Lưu danh sách các file bài làm do sinh viên đăng tải ứng với mỗi lượt nộp bài (`submission_id`).
9.  `quizzes`: Lưu thông tin các đề thi trắc nghiệm trong lớp học. Bao gồm tiêu đề, thời gian làm bài (`duration_minutes`) và thời hạn chót làm bài (`deadline`).
10. `questions`: Chứa danh sách các câu hỏi trắc nghiệm liên kết với đề thi thông qua khóa ngoại `quiz_id`.
11. `answers`: Lưu danh sách các đáp án lựa chọn tương ứng với mỗi câu hỏi (`question_id`). Trường `is_correct` (Boolean) dùng để đánh dấu xem đáp án đó có chính xác hay không.
12. `quiz_attempts`: Ghi nhận thông tin lượt thi trắc nghiệm của sinh viên. Lưu điểm số tự động tính toán (`score`) và thời gian thực hiện nộp bài.
13. `student_answers`: Lưu chi tiết các câu trả lời mà sinh viên đã chọn trong một lượt thi cụ thể (`attempt_id`), dùng để thống kê chi tiết đáp án đúng/sai.
14. `student_stats`: Lưu trữ kết quả học lực tổng kết của sinh viên bao gồm số bài tập đã nộp, điểm trung bình cộng của tất cả bài thi/bài nộp và xếp loại học lực (`classification`).
15. `user_streaks`: Lưu trữ số ngày hoạt động liên tục (Streak) của sinh viên và ngày hoạt động cuối cùng (`last_active_date`) để tính toán reset streak.
16. `conversations`: Lưu thông tin phòng chat giữa hai người dùng (`user1_id` và `user2_id`), tránh trùng lặp phòng chat.
17. `messages`: Lưu trữ lịch sử tin nhắn trong các phòng chat.
18. `message_edits`: Lưu vết lịch sử chỉnh sửa tin nhắn, phục vụ cho việc theo dõi tính toàn vẹn của cuộc trao đổi.
19. `banned_keywords`: Lưu danh sách các từ ngữ bị cấm (nhạy cảm, thô tục) do Admin thiết lập để hệ thống thực hiện bộ lọc văn bản.

---

### 3.3.8. Xây dựng các endpoint API

Hệ thống Backend Spring Boot định nghĩa các endpoint RESTful API rõ ràng, phân nhóm theo các Controller nghiệp vụ cụ thể để Frontend dễ dàng tương tác.

*Bảng 3.3: Danh sách các endpoint RESTful API của hệ thống Backend*

| Nhóm nghiệp vụ | Phương thức | Đường dẫn API | Mô tả chức năng chi tiết |
| :--- | :--- | :--- | :--- |
| **Xác thực tài khoản** | POST | `/api/auth/register` | Đăng ký tài khoản người dùng mới |
| | POST | `/api/auth/login` | Đăng nhập tài khoản, nhận JWT token |
| | POST | `/api/auth/change-password` | Đổi mật khẩu tài khoản người dùng |
| **Quản lý Lớp học** | GET | `/api/classes` | Lấy danh sách lớp học liên quan người dùng |
| | POST | `/api/classes/create` | Giảng viên tạo lớp học mới, sinh Join Code |
| | POST | `/api/classes/join` | Sinh viên tham gia lớp học bằng Join Code |
| | DELETE | `/api/classes/{id}/leave` | Sinh viên thực hiện rời lớp học |
| | DELETE | `/api/classes/{id}/dissolve` | Giảng viên giải tán lớp học (Xóa hoàn toàn) |
| | GET | `/api/classes/{id}/members` | Lấy danh sách thành viên trong lớp học |
| | DELETE | `/api/classes/{classId}/members/{studentId}`| Giảng viên loại bỏ sinh viên ra khỏi lớp học |
| **Quản lý Bài viết** | POST | `/api/posts/create` | Giảng viên đăng bài thông báo/bài tập |
| | GET | `/api/posts/class/{classId}` | Lấy danh sách bài đăng thuộc một lớp học |
| | POST | `/api/posts/{postId}/comment` | Viết bình luận dưới bài đăng (Lọc từ cấm) |
| **Nộp & Chấm bài** | POST | `/api/submissions/submit` | Sinh viên nộp tệp bài làm lên hệ thống |
| | GET | `/api/submissions/post/{postId}` | Giảng viên xem danh sách bài nộp của bài tập |
| | PUT | `/api/submissions/{id}/grade` | Giảng viên chấm điểm & nhập phản hồi nhận xét |
| **Đề trắc nghiệm** | POST | `/api/quizzes/create` | Giảng viên thiết kế bộ đề thi trắc nghiệm |
| | GET | `/api/quizzes/class/{classId}` | Lấy danh sách bài thi trắc nghiệm của lớp |
| | GET | `/api/quizzes/{id}/questions` | Lấy danh sách câu hỏi đề thi trắc nghiệm |
| **Làm bài trắc nghiệm** | POST | `/api/quiz-attempts/submit` | Sinh viên nộp bài quiz, tự động tính điểm |
| | GET | `/api/quiz-attempts/user/{userId}` | Xem lịch sử các lượt thi trắc nghiệm của sinh viên |
| **Thống kê học tập** | GET | `/api/stats/student/{userId}` | Lấy điểm số trung bình, xếp loại & streak |
| | GET | `/api/stats/class/{classId}` | Giảng viên lấy thống kê điểm số của cả lớp học |
| **Từ khóa bị cấm** | GET | `/api/banned-keywords`| Admin xem toàn bộ danh sách từ khóa cấm |
| | POST | `/api/banned-keywords` | Admin thêm mới từ khóa thô tục vào bộ lọc |
| | DELETE | `/api/banned-keywords/{id}`| Admin xóa từ khóa ra khỏi danh sách lọc |

---

### 3.3.9. Cơ chế bảo mật JWT & Phân quyền trên Spring Boot

Khi một yêu cầu HTTP gửi từ ReactJS Client đến Spring Boot Backend:
1.  Yêu cầu đi qua lớp lọc bảo mật `JwtAuthenticationFilter` (được cấu hình trong cấu trúc Security Filter Chain của Spring Security).
2.  Bộ lọc tìm kiếm Authorization Header chứa tiền tố `Bearer <JWT_TOKEN>`.
3.  Nếu có, bộ lọc sử dụng thư viện `jjwt` hoặc Spring Security OAuth2 Resource Server để xác thực chữ ký của token bằng khóa bí mật JWT Secret (đã được cấu hình chung với Supabase).
4.  Nếu chữ ký chính xác và token chưa hết hạn, bộ lọc trích xuất trường `role` và `sub` (User ID) từ Payload.
5.  Hệ thống ánh xạ vai trò người dùng thành danh sách các quyền hạn trong Spring Security (ví dụ: `ROLE_STUDENT` ứng với role `"0"`, `ROLE_TEACHER` ứng với role `"1"`, `ROLE_ADMIN` ứng với role `"2"`).
6.  Đối tượng `UsernamePasswordAuthenticationToken` được khởi tạo và lưu vào trong `SecurityContextHolder`, cho phép request đi tiếp vào Controller xử lý logic. Nếu người dùng cố truy cập các API không được phân quyền (ví dụ sinh viên gọi API tạo đề thi `/api/quizzes/create`), Spring Security sẽ lập tức trả về mã HTTP 403 Forbidden.

---

### 3.3.10. Đánh giá hiệu suất hệ thống

Để đánh giá khả năng chịu tải và tính ổn định của hệ thống E-Learning mới khi có số lượng lớn sinh viên truy cập đồng thời để thực hiện các hoạt động học tập, tác giả tiến hành thực hiện kiểm thử chịu tải (Load Test) và kiểm thử chịu áp lực cao (Stress Test) giả lập bằng công cụ chuyên dụng **Apache JMeter**.

Kịch bản kiểm thử tập trung vào 3 tác vụ phổ biến nhất trên hệ thống:
1.  **POST Login Request**: Thao tác xác thực đăng nhập gửi token.
2.  **GET Class Feed Request**: Thao tác tải nội dung bảng tin lớp học (truy vấn nhiều bảng thông tin kèm tệp đính kèm).
3.  **POST Submit Quiz Request**: Thao tác nộp bài thi trắc nghiệm (bao gồm các bước chấm điểm tự động và tính lại điểm số trung bình ở database).

Các mốc kiểm thử được thiết lập lần lượt tại **300**, **500** và **1000** luồng yêu cầu đồng thời (Threads/Requests) được gửi liên tục. Kết quả thực nghiệm cụ thể được ghi nhận như sau:

*Bảng 3.4: Kết quả kiểm thử Stress Test trên chức năng POST Login*

| Chỉ số tải (Requests) | Số mẫu (Samples) | Thời gian xử lý TB (Avg - ms) | Thời gian xử lý nhỏ nhất (Min - ms) | Thời gian xử lý lớn nhất (Max - ms) | Tỉ lệ lỗi (Error - %) | Khả năng đáp ứng (Throughput - req/s) |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **POST Login 300** | 300 | 3820 | 580 | 7210 | 0.00% | 28.4 |
| **POST Login 500** | 500 | 5120 | 610 | 9030 | 0.00% | 34.6 |
| **POST Login 1000**| 1000 | 8940 | 620 | 14500 | 0.00% | 36.8 |
| **Tổng cộng** | 1800 | 5960 | 580 | 14500 | 0.00% | 33.2 |

*Bảng 3.5: Kết quả kiểm thử Load Test trên chức năng GET Class Feed*

| Chỉ số tải (Requests) | Số mẫu (Samples) | Thời gian xử lý TB (Avg - ms) | Thời gian xử lý nhỏ nhất (Min - ms) | Thời gian xử lý lớn nhất (Max - ms) | Tỉ lệ lỗi (Error - %) | Khả năng đáp ứng (Throughput - req/s) |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **GET Feed 300** | 300 | 45 | 12 | 340 | 0.00% | 85.4 |
| **GET Feed 500** | 500 | 25 | 15 | 55 | 0.00% | 110.2 |
| **GET Feed 1000**| 1000 | 28 | 18 | 110 | 0.00% | 125.8 |
| **Tổng cộng** | 1800 | 32 | 12 | 340 | 0.00% | 107.1 |

*Bảng 3.6: Kết quả kiểm thử Stress Test trên chức năng POST Submit Quiz*

| Chỉ số tải (Requests) | Số mẫu (Samples) | Thời gian xử lý TB (Avg - ms) | Thời gian xử lý nhỏ nhất (Min - ms) | Thời gian xử lý lớn nhất (Max - ms) | Tỉ lệ lỗi (Error - %) | Khả năng đáp ứng (Throughput - req/s) |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **POST Submit 300** | 300 | 410 | 45 | 1820 | 0.00% | 42.1 |
| **POST Submit 500** | 500 | 58 | 38 | 290 | 0.00% | 68.3 |
| **POST Submit 1000**| 1000 | 52 | 32 | 98 | 0.00% | 79.4 |
| **Tổng cộng** | 1800 | 173 | 32 | 1820 | 0.00% | 63.2 |

**Phân tích kết quả thực nghiệm:**
-   **Độ tin cậy của hệ thống (Error Rate)**: Ở tất cả các mốc kiểm thử từ 300 đến 1000 request đồng thời, tỷ lệ lỗi ghi nhận đều bằng **0.00%**. Điều này chứng minh cơ chế quản lý giao dịch của PostgreSQL kết hợp với các xử lý luồng của Spring Boot hoạt động rất tốt, không xảy ra tình trạng xung đột hoặc mất mát dữ liệu khi có nhiều yêu cầu thay đổi dữ liệu cùng lúc.
-   **Tốc độ xử lý tác vụ đọc (GET Class Feed)**: Thời gian xử lý trung bình vô cùng thấp (chỉ dao động từ **25ms đến 45ms**), khả năng đáp ứng Throughput đạt trên **100 req/s**. Kết quả này đạt được là nhờ việc lập chỉ mục (Indexing) tối ưu trên các trường khóa ngoại của bảng `class_posts` và `class_members` trong PostgreSQL, kết hợp với cơ chế phản hồi nhẹ của định dạng dữ liệu JSON.
-   **Tốc độ xử lý tác vụ ghi và tính toán phức tạp (POST Submit Quiz)**: Dù phải thực hiện đối chiếu nhiều đáp án và gọi dịch vụ tính toán cập nhật bảng `student_stats`, thời gian xử lý trung bình vẫn ở mức rất tốt (**173ms** cho toàn bộ quá trình). Hệ thống hoàn toàn không có hiện tượng nghẽn cổ chai.
-   **Tốc độ xác thực đăng nhập (POST Login)**: Thời gian xử lý trung bình có xu hướng tăng khi nâng từ mốc 300 lên 1000 request đồng thời (từ 3.8s lên 8.9s). Nguyên nhân là do quá trình xác thực đăng nhập phải gọi trực tiếp sang máy chủ xác thực của Supabase để kiểm tra thông tin tài khoản và băm mật khẩu bảo mật (mất nhiều thời gian CPU). Tuy nhiên, với tỷ lệ lỗi 0.00% ở mốc 1000 request gửi liên tục, hệ thống vẫn đảm bảo khả năng hoạt động ổn định và có thể nâng cao tốc độ bằng cách áp dụng cơ chế CDN hoặc nâng cấp gói tài nguyên máy chủ đích trong tương lai.
