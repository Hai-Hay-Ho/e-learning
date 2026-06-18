# CHƯƠNG 2. PHƯƠNG PHÁP VÀ NỘI DUNG NGHIÊN CỨU

## 2.1. Cơ Sở Lý Thuyết Về Hệ Thống E-Learning

### 2.1.1. Khái niệm và Kiến trúc của E-Learning LMS (Learning Management System)

#### 2.1.1.1. Giới thiệu về E-Learning
E-Learning (Electronic Learning - Học tập điện tử) là hình thức học tập dựa trên sự hỗ trợ của các công nghệ thông tin và truyền thông, đặc biệt là mạng Internet. Theo định nghĩa của Clark & Mayer (2016) [1], E-Learning là việc truyền tải các bài học thông qua các thiết bị kỹ thuật số như máy tính cá nhân, máy tính bảng hoặc điện thoại thông minh nhằm mục đích thúc đẩy quá trình tiếp thu kiến thức và kỹ năng cá nhân. Sự ra đời của E-Learning đã phá bỏ rào cản về không gian và thời gian của giáo dục truyền thống, cho phép người học truy cập tài nguyên giáo dục mọi lúc, mọi nơi và thiết lập lộ trình học tập cá nhân hóa.

Hệ thống quản lý học tập (LMS - Learning Management System) là một ứng dụng phần mềm chịu trách nhiệm quản lý, theo dõi, báo cáo và phân phối các khóa học hoặc chương trình đào tạo trực tuyến. Một hệ thống LMS hiện đại được thiết kế để kết nối hai đối tượng chính là người dạy (giảng viên) và người học (sinh viên) trong một môi trường số hóa đồng bộ.

```
+-------------------------------------------------------------------------+
|                              E-Learning LMS                             |
+-------------------------------------------------------------------------+
       |                         |                        |
+--------------+          +--------------+         +--------------+
|   Quản lý    |          |  Tổ chức học |         |  Tương tác & |
|  Người dùng  |          |     tập      |         |   Đánh giá   |
+--------------+          +--------------+         +--------------+
| - Xác thực   |          | - Lớp học    |         | - Chat/Post  |
| - Phân quyền |          | - Tài liệu   |         | - Bài tập    |
| - Hồ sơ cá   |          | - Bài giảng  |         | - Trắc nghiệm|
|   nhân       |          | - Bảng tin   |         | - Chấm điểm  |
+--------------+          +--------------+         +--------------+
```
*Hình 2.1: Sơ đồ các phân hệ cốt lõi của một hệ thống quản lý học tập (LMS) (Nguồn: Tự tổng hợp)*

Các phân hệ cốt lõi của hệ thống LMS bao gồm:
- **Phân hệ quản lý người dùng**: Đảm nhận nhiệm vụ xác thực danh tính, lưu trữ thông tin cá nhân và phân chia vai trò trong hệ thống.
- **Phân hệ quản lý lớp học**: Cho phép tạo lập các không gian học tập trực tuyến riêng biệt, quản lý danh sách thành viên tham gia dựa trên mã tham gia (Join Code).
- **Phân hệ bảng tin và tài liệu**: Nơi giảng viên đăng tải các thông báo quan trọng, bài giảng dạng số và liên kết học tập để sinh viên theo dõi và tải về.
- **Phân hệ đánh giá (Bài tập & Trắc nghiệm)**: Hỗ trợ giảng viên biên soạn đề trắc nghiệm (Quiz) và giao bài tập tự luận có hạn nộp (Deadline). Sinh viên thực hiện nộp bài trực tuyến và nhận kết quả phản hồi tự động hoặc thủ công.
- **Phân hệ tương tác thời gian thực**: Cung cấp kênh trao đổi trực tiếp giữa giảng viên và sinh viên nhằm giải đáp thắc mắc lập tức, tăng tính gắn kết trong lớp học trực tuyến.
- **Phân hệ thống kê kết quả**: Tổng hợp dữ liệu học tập cá nhân và tập thể để đưa ra biểu đồ tiến độ trực quan, hỗ trợ phân loại học lực sinh viên.

#### 2.1.1.2. Mô hình Phân quyền dựa trên vai trò (Role-Based Access Control - RBAC)
Trong các hệ thống quản lý thông tin quy mô lớn, việc kiểm soát truy cập và bảo vệ tài nguyên là vô cùng quan trọng. Mô hình phân quyền dựa trên vai trò (RBAC - Role-Based Access Control) là phương pháp tiếp cận hiệu quả được định nghĩa bởi Viện Tiêu chuẩn và Công nghệ Quốc gia Hoa Kỳ (NIST) [2]. Thay vì cấp quyền trực tiếp cho từng người dùng cụ thể, các quyền hạn (Permissions) được gán cho các vai trò (Roles) cụ thể trong hệ thống, và người dùng (Users) sẽ được liên kết với một hoặc nhiều vai trò tương ứng.

```
  +-------------+            +-------------+            +-------------+
  |  Người dùng | ---------> |   Vai trò   | ---------> |  Quyền hạn  |
  |   (Users)   |   Gán vai  |   (Roles)   |  Gán quyền |(Permissions)|
  +-------------+    trò     +-------------+    hạn     +-------------+
```
*Hình 2.2: Nguyên lý hoạt động cơ bản của mô hình RBAC (Nguồn: Sandhu et al., 1996)*

Trong phạm vi đề tài xây dựng hệ thống E-Learning, mô hình RBAC được áp dụng chặt chẽ bằng cách chia tài khoản người dùng thành ba vai trò riêng biệt:
1. **Quản trị viên (Admin - vai trò `"2"`)**: Nắm giữ quyền hạn cao nhất trong hệ thống, chịu trách nhiệm quản trị tổng thể. Admin có khả năng giám sát tất cả các lớp học được tạo ra, quản lý thông tin tài khoản người dùng (khóa/mở khóa), cấu hình hệ thống bao gồm cả việc quản lý danh sách từ khóa bị cấm (Banned Keywords) nhằm xây dựng môi trường học thuật văn minh, và theo dõi các báo cáo thống kê vĩ mô.
2. **Giảng viên (Teacher - vai trò `"1"`)**: Là người sở hữu và điều phối hoạt động trong các lớp học do mình tạo ra. Giảng viên có quyền đăng bài thông báo, đính kèm học liệu, thiết kế đề thi trắc nghiệm (Quiz), chấm điểm bài tập tự luận của sinh viên, xem danh sách thành viên và có quyền loại bỏ sinh viên ra khỏi lớp học hoặc giải tán lớp học khi khóa học kết thúc.
3. **Sinh viên (Student - vai trò `"0"`)**: Là đối tượng thụ hưởng các dịch vụ học tập. Sinh viên sử dụng mã code để tham gia vào lớp học, theo dõi bảng tin lớp học để nhận tài liệu, làm bài kiểm tra trắc nghiệm, nộp bài tập tự luận trước thời hạn, tham gia trao đổi tin nhắn trực tiếp với giảng viên, xem điểm cá nhân và tự động cập nhật chuỗi chuyên cần (Streak) hàng ngày khi hoạt động tích cực trên hệ thống. Sinh viên cũng có quyền rời lớp học nếu chọn nhầm mã.

*Bảng 2.1: Bảng ma trận phân quyền chi tiết của hệ thống E-Learning*

| Tính năng nghiệp vụ | Sinh viên (`"0"`) | Giảng viên (`"1"`) | Quản trị viên (`"2"`) |
| :--- | :---: | :---: | :---: |
| Đăng ký / Đăng nhập (Google OAuth2 / Email) | Có | Có | Có |
| Tạo lớp học & Nhận mã tham gia | Không | Có | Không |
| Tham gia lớp học bằng mã code | Có | Không | Không |
| Xem bảng tin, tài liệu & viết bình luận | Có | Có | Có |
| Gửi bài tập tự luận (Upload file) | Có | Không | Không |
| Chấm điểm bài tập & Viết nhận xét | Không | Có | Không |
| Thiết kế đề trắc nghiệm (Quiz) | Không | Có | Không |
| Làm bài trắc nghiệm & Xem điểm tức thì | Có | Không | Không |
| Gửi tin nhắn chat thời gian thực | Có | Có | Không |
| Xem thống kê học lực cá nhân & Streak | Có | Không | Không |
| Xem phân tích biểu đồ & Thống kê toàn lớp | Không | Có | Không |
| Loại bỏ thành viên khỏi lớp / Giải tán lớp | Không | Có | Không |
| Quản lý người dùng & Lọc từ khóa bị cấm | Không | Không | Có |

---

### 2.1.2. Cơ chế giao tiếp RESTful API trong ứng dụng Web

REST (Representational State Transfer) là một kiểu kiến trúc phần mềm được phát triển bởi Roy Fielding trong luận án tiến sĩ năm 2000 [3]. Một hệ thống tuân thủ các nguyên tắc thiết kế của REST được gọi là hệ thống RESTful. Giao tiếp qua RESTful API dựa trên nền tảng của giao thức truyền tải siêu văn bản HTTP (Hypertext Transfer Protocol), cho phép tách biệt hoàn toàn giữa lớp giao diện (Client) và lớp xử lý logic (Server).

```
+---------------+                HTTP Requests (GET, POST, PUT, DELETE)              +---------------+
|               | -----------------------------------------------------------------> |               |
|    Client     |                                                                    |    Server     |
|   (ReactJS)   | <----------------------------------------------------------------- | (Spring Boot) |
|               |                 HTTP Responses (JSON Data + Status Codes)           |               |
+---------------+                                                                    +---------------+
```
*Hình 2.3: Cơ chế tương tác Stateless giữa Client và Server qua RESTful API (Nguồn: Tự tổng hợp)*

Các nguyên tắc thiết kế ràng buộc cốt lõi của kiến trúc REST bao gồm:
1. **Kiến trúc Client - Server**: Sự tách biệt rõ ràng giúp hai thành phần có thể phát triển và nâng cấp độc lập. Frontend chỉ quan tâm đến trải nghiệm người dùng, Backend chỉ quan tâm đến việc quản lý dữ liệu và logic nghiệp vụ.
2. **Phi trạng thái (Stateless)**: Mỗi request gửi từ Client lên Server phải chứa đầy đủ thông tin để Server hiểu và xử lý được yêu cầu đó. Server hoàn toàn không lưu trữ bất kỳ ngữ cảnh nào của Client (như Session) trên bộ nhớ. Xác thực người dùng được xử lý thông qua Token đính kèm trong mỗi request.
3. **Khả năng lưu đệm (Cacheable)**: Các phản hồi từ Server phải tự định nghĩa xem chúng có khả năng lưu đệm hay không để tối ưu hóa băng thông mạng và nâng cao tốc độ phản hồi cho Client.
4. **Hệ thống phân tầng (Layered System)**: Client không thể biết được mình đang kết nối trực tiếp với Server đích hay qua các máy chủ trung gian (như Load Balancer, Gateway). Điều này giúp hệ thống dễ dàng mở rộng và nâng cao tính bảo mật.
5. **Giao diện đồng nhất (Uniform Interface)**: Tài nguyên được định danh thông qua các URI (Uniform Resource Identifier) đồng nhất và được thao tác bằng các phương thức HTTP chuẩn:
   - **GET**: Truy xuất tài nguyên mà không làm thay đổi trạng thái dữ liệu trên hệ thống (ví dụ: `GET /api/classes` để lấy danh sách lớp học).
   - **POST**: Tạo mới một tài nguyên trong cơ sở dữ liệu (ví dụ: `POST /api/classes/create` để tạo lớp học mới).
   - **PUT / PATCH**: Cập nhật thông tin của một tài nguyên đang tồn tại (ví dụ: `PUT /api/submissions/{id}` để cập nhật điểm chấm).
   - **DELETE**: Loại bỏ tài nguyên khỏi hệ thống (ví dụ: `DELETE /api/classes/{id}/dissolve` để giải tán một lớp học).

---

### 2.1.3. Giao tiếp hai chiều thời gian thực (Real-time Communication) qua WebSocket

Trong các hệ thống E-Learning, tính tương tác trực tiếp là nhân tố thúc đẩy hiệu quả học tập. Các phương thức giao tiếp truyền thống của ứng dụng web, ví dụ như HTTP Polling (gửi request định kỳ lên server để hỏi dữ liệu mới), mang lại độ trễ lớn và gây lãng phí tài nguyên máy chủ do phải xử lý hàng loạt request rỗng không có dữ liệu cập nhật.

```
       HTTP Short Polling                            WebSocket Protocol
       
Client                  Server             Client                  Server
  |    Get New Messages   |                  |   Handshake Request   |
  |---------------------->|                  |---------------------->|
  |    No New Messages    |                  |   Handshake Response  |
  |<----------------------|                  |<----------------------|
  |                       |                  |=======================|
  |    (Wait 5 seconds)   |                  |   Persistent TCP Conn |
  |                       |                  |=======================|
  |    Get New Messages   |                  |   [Real-time Message] |
  |---------------------->|                  |<----------------------|
  |    New message data   |                  |   [Real-time Message] |
  |<----------------------|                  |---------------------->|
  v                       v                  v                       v
```
*Hình 2.4: So sánh luồng giao tiếp giữa HTTP Short Polling và giao thức WebSocket (Nguồn: HTML5 Rocks)*

Giao thức WebSocket (được định nghĩa trong chuẩn RFC 6455) [4] cung cấp một kênh giao tiếp song công toàn phần (Full-duplex), hoạt động trên một kết nối TCP duy nhất kéo dài giữa Client và Server. Quá trình giao tiếp bắt đầu bằng một yêu cầu bắt tay (Handshake) thông qua HTTP Upgrade request, sau đó kết nối được nâng cấp lên giao thức WebSocket.

---

## 2.2. Các công nghệ hỗ trợ phát triển hệ thống

### 2.2.1 Spring Boot

#### 2.2.1.1 Spring Boot là gì ?
Spring Boot là một framework mã nguồn mở được xây dựng trên nền tảng Spring Framework, được thiết kế để đơn giản hóa việc phát triển các ứng dụng Java enterprise. Spring Boot cung cấp cấu hình tự động (auto-configuration), giảm thiểu việc cấu hình thủ công và cho phép các nhà phát triển tập trung vào logic nghiệp vụ thay vì cấu hình infrastructure [4].

Spring Boot được phát triển bởi Pivotal Software (hiện tại là VMware) và được xây dựng dựa trên nguyên tắc "convention over configuration", giúp giảm thiểu boilerplate code và tăng tốc độ phát triển ứng dụng. Framework này tích hợp sẵn các web server như Tomcat, Jetty, cho phép chạy ứng dụng như một standalone JAR file mà không cần triển khai trên application server riêng biệt.

![Logo của Spring Boot](https://upload.wikimedia.org/wikipedia/commons/7/79/Spring_Boot.svg)  
*Hình 2.7: Logo của Spring Boot (Nguồn: https://upload.wikimedia.org/wikipedia/commons/7/79/Spring_Boot.svg)*

#### 2.2.1.2. Lý do lựa chọn cho đề tài nghiên cứu
Trong bối cảnh xây dựng hệ thống quản lý học tập tích hợp, em quyết định lựa chọn Spring Boot làm nền tảng phát triển Backend cốt lõi vì các ưu điểm kỹ thuật sau:
- **Xây dựng RESTful API chuẩn hóa**: Spring Boot cung cấp các công cụ mạnh mẽ (Spring MVC) để xây dựng các RESTful Web Services bảo mật thông qua hệ thống annotation trực quan.
- **Hệ sinh thái toàn diện**: Spring Boot tích hợp liền mạch với các dự án con như Spring Data JPA (quản lý cơ sở dữ liệu PostgreSQL) [3], Spring Security (bảo mật xác thực) và đặc biệt là Spring Starter Mail để gửi email tự động.
- **Hiệu suất phát triển**: Các gói thư viện "Starter Dependencies" giúp em giảm thiểu thời gian thiết lập dự án ban đầu, tập trung nguồn lực vào việc phát triển các logic nghiệp vụ (Business Logic) đặc thù của hệ thống e-learning như quản lý bài viết, chấm điểm và tính điểm trung bình học tập.

#### 2.2.1.3. Ứng dụng vào đồ án
Trong phạm vi đồ án, Spring Boot đóng vai trò là nền tảng cốt lõi (Core Framework) để xây dựng toàn bộ hệ thống Backend. Spring Boot chịu trách nhiệm xử lý logic nghiệp vụ và cung cấp RESTful API cho phía Frontend. Cụ thể, các API xử lý tạo/tham gia lớp học (`ClassController`), quản lý bài viết thông báo (`PostController`), thu bài nộp và chấm điểm (`SubmissionController`), thiết lập và tính điểm thi trắc nghiệm (`QuizController`), và lưu trữ chuỗi ngày chuyên cần (`UserStreakController`) đều được lập trình chặt chẽ trên Spring Boot.

---

### 2.2.2 React.js và TypeScript

#### 2.2.2.1. Tổng quan về React.js và TypeScript
- **React.Js**: là thư viện JavaScript mã nguồn mở do Meta (Facebook) khởi xướng, chuyên dùng để xây dựng giao diện người dùng (User Interface). React hoạt động dựa trên kiến trúc hướng thành phần (Component-based Architecture) và sử dụng cơ chế Virtual DOM để tối ưu hóa hiệu năng render, giúp ứng dụng phản hồi mượt mà ngay cả khi xử lý lượng dữ liệu lớn [5].
- **TypeScript**: là một siêu tập hợp (superset) của JavaScript do Microsoft phát triển, bổ sung tính năng định kiểu tĩnh (static typing). Mã nguồn TypeScript sẽ được biên dịch về JavaScript thuần để chạy trên trình duyệt, giúp phát hiện lỗi cú pháp và logic ngay trong giai đoạn viết code [6].

![Logo của React Framework](https://upload.wikimedia.org/wikipedia/commons/a/a7/React-icon.svg)  
*Hình 2.8: Logo của React Framework (Nguồn: https://upload.wikimedia.org/wikipedia/commons/a/a7/React-icon.svg)*

#### 2.2.2.2. Ứng dụng trong xây dựng giao diện người dùng
Đối với đề tài này, việc kết hợp React.js và TypeScript/JavaScript mang lại giải pháp toàn diện cho phía Frontend:
- **Kiến trúc Component**: Phù hợp với đặc thù của website e-learning vốn chứa nhiều thành phần giao diện lặp lại (thẻ lớp học, danh sách câu hỏi trắc nghiệm, khung tin nhắn chat, thanh bình luận). Việc tái sử dụng component giúp code gọn gàng và dễ bảo trì [5].
- **An toàn dữ liệu (Type Safety)**: Khi giao tiếp với REST API backend và Supabase, cấu trúc dữ liệu trả về rất phức tạp. TypeScript giúp định nghĩa rõ ràng các Interface (ví dụ: cấu trúc User, Class, Post, Quiz), giảm thiểu rủi ro lỗi runtime do sai lệch kiểu dữ liệu [6].
- **Tối ưu trải nghiệm**: React hỗ trợ xây dựng ứng dụng đơn trang (SPA), giúp người dùng (giảng viên/sinh viên) chuyển đổi mượt mà giữa các tab Bảng tin, Bài tập, Chat mà không cần tải lại toàn bộ trang web.

#### 2.2.2.3. Ứng dụng vào đồ án
ReactJS được lựa chọn để xây dựng toàn bộ giao diện người dùng (Frontend) cho cả trang học tập của sinh viên (Student Dashboard), trang quản lý của giảng viên (Teacher Dashboard) và trang quản trị hệ thống (Admin Dashboard). TypeScript/JavaScript được tích hợp vào dự án ReactJS nhằm tăng cường tính chặt chẽ và an toàn cho mã nguồn Frontend. Trong đồ án này, nó được sử dụng để định nghĩa rõ ràng các kiểu dữ liệu (Interfaces) cho các đối tượng như Lớp học (Class), Bài đăng (Post), Bài trắc nghiệm (Quiz) và các dữ liệu phản hồi trả về từ API.

---

### 2.2.3 Hệ quản trị cơ sở dữ liệu Supabase PostgreSQL

#### 2.2.3.1. Tổng quan
PostgreSQL (thường gọi là Postgres) là hệ quản trị cơ sở dữ liệu quan hệ (RDBMS) mã nguồn mở mạnh mẽ, nổi tiếng với sự tuân thủ chặt chẽ chuẩn SQL, tính toàn vẹn dữ liệu và hỗ trợ đầy đủ các thuộc tính ACID (Atomicity, Consistency, Isolation, Durability) [18]. Trong đề tài này, PostgreSQL được sử dụng thông qua dịch vụ điện toán đám mây Supabase BaaS.

![Logo của PostgreSQL](https://upload.wikimedia.org/wikipedia/commons/2/29/Postgresql_class.svg)  
*Hình 2.9: Logo của PostgreSQL (Nguồn: https://upload.wikimedia.org/wikipedia/commons/2/29/Postgresql_class.svg)*

#### 2.2.3.2. Vai trò trong kiến trúc hệ thống
Trong khuôn khổ nghiên cứu, Supabase PostgreSQL được chọn làm nơi lưu trữ dữ liệu chính tắc (Source of Truth) cho hệ thống E-Learning:
- **Đảm bảo tính nhất quán của giao dịch**: Đối với các nghiệp vụ yêu cầu độ chính xác tuyệt đối như tính giờ làm bài và nộp bài thi trắc nghiệm (Quiz), cơ chế Transaction của PostgreSQL đảm bảo điểm số và lượt làm bài được ghi nhận chính xác, tránh tình trạng sai lệch hoặc mất mát dữ liệu do đồng thời truy cập.
- **Ràng buộc khóa ngoại chặt chẽ**: Thiết lập tính toàn vẹn dữ liệu giữa các bảng `classes`, `class_members`, `quizzes` và `submissions`. Cơ chế `ON DELETE CASCADE` tự động dọn dẹp các bản ghi liên quan khi lớp học bị giải tán.
- **Bảo mật Row Level Security (RLS)**: PostgreSQL cho phép định nghĩa các chính sách bảo mật cấp dòng để bảo vệ học liệu và điểm số, ngăn chặn sinh viên truy cập trái phép dữ liệu của người khác.

#### 2.2.3.3. Ứng dụng vào đồ án
PostgreSQL đóng vai trò là cơ sở dữ liệu quan hệ chính của toàn hệ thống E-Learning. Trong đồ án, cơ sở dữ liệu lưu trữ bền vững các bảng thông tin người dùng (`profiles`), thông tin lớp học (`classes`), danh sách thành viên (`class_members`), ngân hàng đề thi trắc nghiệm (`quizzes`, `questions`, `answers`), lượt làm bài thi (`quiz_attempts`), bài tập tự luận và file bài làm (`submissions`). Sự kết hợp của Spring Data JPA với PostgreSQL giúp thực hiện các truy vấn dữ liệu nhanh chóng và an toàn.

---

### 2.2.4. Supabase Realtime

#### 2.2.4.1. Tổng quan
Supabase Realtime là một dịch vụ đồng bộ dữ liệu thời gian thực được xây dựng trên nền tảng WebSocket, cho phép lắng nghe và truyền tải trực tiếp các thay đổi xảy ra trong cơ sở dữ liệu PostgreSQL đến các client đang kết nối với độ trễ cực thấp dưới 1ms [19].

![Logo của Supabase](https://upload.wikimedia.org/wikipedia/commons/c/c9/Supabase_logo.svg)  
*Hình 2.10: Logo của Supabase (Nguồn: https://upload.wikimedia.org/wikipedia/commons/c/c9/Supabase_logo.svg)*

#### 2.2.4.2. Giải pháp tối ưu hiệu năng và tương tác thời gian thực
Hệ thống sử dụng Supabase Realtime để giải quyết các bài toán tương tác trực tiếp mà giao thức HTTP truyền thống khó đáp ứng tốt:
- **Hệ thống tin nhắn Chat**: Lắng nghe trực tiếp các sự kiện chèn dòng (`INSERT`) vào bảng `messages` trong phòng chat. Tin nhắn mới hiển thị lập tức trên màn hình của người nhận mà không cần polling liên tục, giúp tiết kiệm băng thông và giảm tải CPU máy chủ.
- **Đồng bộ bảng tin lớp học**: Khi giảng viên đăng thông báo mới, Supabase Realtime tự động đẩy sự kiện đến giao diện của tất cả sinh viên đang online trong lớp học đó, giúp cập nhật học liệu tức thì.
- **Quản lý trạng thái trực tuyến**: Theo dõi sự hiện diện (Presence) của người dùng trong phòng chat.

#### 2.2.4.3. Ứng dụng vào đồ án
Supabase Realtime được triển khai như một giải pháp truyền tải dữ liệu thời gian thực (Realtime Layer) cho hệ thống. Nó được tích hợp trực tiếp vào Component `Chat.jsx` để đồng bộ tin nhắn trò chuyện giữa giảng viên và sinh viên, và Component `Class.jsx` để cập nhật bảng tin lớp học ngay khi có thông báo hoặc tài liệu mới được chia sẻ.

---

### 2.2.5. Supabase Client và WebClient

#### 2.2.5.1 Khái niệm và vai trò
Supabase Client SDK cung cấp các API giao tiếp trực tiếp từ phía Frontend ReactJS đến các dịch vụ cơ sở dữ liệu, xác thực và lưu trữ của Supabase mà không cần đi qua Backend trung gian đối với các tác vụ cơ bản. Trong khi đó, Spring Boot sử dụng WebClient (hoặc các lớp HttpURLConnection) để gọi các API dịch vụ bên ngoài bất đồng bộ, tối ưu hóa giao tiếp dịch vụ.

#### 2.2.5.2. Cơ chế hoạt động trong đề tài
- **Phía Frontend**: ReactJS sử dụng thư viện `@supabase/supabase-js` được cấu hình qua khóa API công khai. Mọi thao tác như cập nhật ảnh đại diện, kiểm tra trạng thái session đăng nhập, upload file bài tập lên Storage hay subscribe kênh chat đều được gọi trực tiếp thông qua SDK này.
- **Phía Backend**: Spring Boot đóng vai trò là máy chủ xử lý logic nghiệp vụ phức tạp. Khi cần gọi dịch vụ AI (Groq API) để sinh đề thi trắc nghiệm từ tài liệu, Spring Boot sử dụng HTTP client để tạo các request POST JSON không đồng bộ gửi đến dịch vụ AI.

#### 2.2.5.3. Ứng dụng vào đồ án
Trong đồ án, Supabase Client SDK được khai báo trong file `supabaseClient.jsx` làm cổng kết nối dữ liệu trực tiếp ở Frontend. Ở Backend Spring Boot, lớp `AIQuestionGeneratorService` sử dụng kết nối HTTP gửi yêu cầu sinh câu hỏi đến mô hình ngôn ngữ lớn ở dịch vụ đám mây bên thứ ba.

---

### 2.2.6. Bảo mật với JWT (JSON Web Token)

#### 2.2.6.1. Tổng quan
JSON Web Token (JWT) là một chuẩn mở (RFC 7519) định nghĩa phương thức mã hóa và xác thực thông tin an toàn dưới dạng đối tượng JSON. JWT gồm ba phần chính: Header (thuật toán mã hóa), Payload (thông tin người dùng/claims), và Signature (chữ ký số đảm bảo tính toàn vẹn) [23].

#### 2.2.6.2. Ứng dụng trong xác thực phi trạng thái (Stateless Auth)
Với hệ thống web hiện đại, việc sử dụng Session truyền thống (lưu trên bộ nhớ server) gây khó khăn cho việc mở rộng. JWT là giải pháp xác thực stateless tối ưu:
- **Cơ chế**: Khi đăng nhập thành công, máy chủ cấp Access Token JWT cho client.
- **Hiệu quả**: Các request gửi lên backend chỉ cần đính kèm token này trong HTTP Header. Backend Spring Boot giải mã chữ ký token bằng Secret Key để xác thực thông tin định danh và vai trò người dùng (`role = "0"`: Sinh viên, `"1"`: Giảng viên, `"2"`: Admin) trực tiếp mà không cần truy vấn lại database người dùng, giúp giảm độ trễ phản hồi API [23].

#### 2.2.6.3. Ứng dụng vào đồ án
JWT được sử dụng làm cơ chế xác thực và phân quyền chính cho hệ thống E-Learning. Lớp `JwtAuthenticationFilter` trong Spring Boot backend chặn các request gửi tới API, phân tích token trong Header và thiết lập quyền truy cập tương ứng cho người dùng trong Spring Security Context. Ở phía Frontend, thông tin phân quyền trong JWT được sử dụng để hiển thị hoặc ẩn các chức năng của giáo viên (như Tạo đề quiz, Chấm điểm) hoặc của sinh viên (như Nộp bài, Làm quiz).

---

### 2.2.7. Tích hợp OAuth2

#### 2.2.7.1. Tổng quan
OAuth2 là một framework ủy quyền chuẩn mở (RFC 6749) cho phép ứng dụng bên thứ ba có được quyền truy cập hạn chế vào tài nguyên của người dùng từ các nhà cung cấp định danh lớn (như Google, Facebook) mà không cần người dùng chia sẻ trực tiếp mật khẩu [24].

#### 2.2.7.2. Tối ưu trải nghiệm đăng nhập
Hệ thống tích hợp OAuth2 nhằm giải quyết bài toán đơn giản hóa quy trình đăng ký tài khoản cho sinh viên và giảng viên:
- Cho phép người dùng đăng nhập nhanh thông qua tài khoản Google.
- Tăng tính bảo mật cho hệ thống do không cần trực tiếp lưu trữ mật khẩu, đồng thời tự động đồng bộ họ tên và ảnh đại diện của người dùng từ tài khoản Google của trường [24].

#### 2.2.7.3. Ứng dụng vào đồ án
OAuth2 Google được tích hợp thông qua Supabase Auth. Khi sinh viên hoặc giảng viên bấm chọn đăng nhập bằng Google trên màn hình đăng nhập (`Welcome.jsx`), Supabase Auth chuyển hướng đến trang xác thực của Google, thu nhận Authorization Code, đối chiếu lấy thông tin cá nhân và trả về JWT token của hệ thống để đăng nhập cho người dùng.

---

### 2.2.8. Tích hợp Trí tuệ nhân tạo - Groq Cloud API & Llama-3

#### 2.2.8.1. Giới thiệu
Groq Cloud API là cổng dịch vụ cung cấp khả năng tính toán và suy luận các mô hình ngôn ngữ lớn (LLM) với tốc độ xử lý từ vựng (Token generation speed) nhanh nhất thế giới nhờ chip xử lý LPU (Language Processing Unit) độc quyền. API này hỗ trợ tích hợp các mô hình mã nguồn mở hàng đầu như Llama-3.3 của Meta.

![Logo của Google Gemini](https://upload.wikimedia.org/wikipedia/commons/8/8a/Google_Gemini_logo.svg)  
*Hình 2.11: Logo của Google Gemini (đại diện cho xu thế Generative AI tích hợp API) (Nguồn: https://upload.wikimedia.org/wikipedia/commons/8/8a/Google_Gemini_logo.svg)*

#### 2.2.8.2. Ứng dụng tự động tạo đề thi (AI Quiz Generator)
Để hỗ trợ giảng viên tiết kiệm thời gian biên soạn ngân hàng câu hỏi thi, đề tài tích hợp mô hình Llama-3.3-70b-versatile qua Groq API để xây dựng tính năng tạo câu hỏi tự động:
- **Tự động trích xuất kiến thức**: Giảng viên tải lên tài liệu học tập (file bài giảng, tóm tắt môn học) và chọn số lượng câu hỏi mong muốn.
- **Sinh đề thi chuẩn hóa**: AI đọc hiểu tài liệu, trích xuất các ý chính và tự động soạn thảo bộ câu hỏi trắc nghiệm kèm theo 4 đáp án lựa chọn cùng lời giải thích đúng/sai theo đúng cấu trúc dữ liệu yêu cầu, trả về kết quả định dạng JSON chuẩn để import thẳng vào hệ thống.

#### 2.2.8.3. Ứng dụng vào đồ án
Trong đồ án, Groq API được tích hợp ở phía Backend tại lớp `AIQuestionGeneratorService.java`. Khi giảng viên chọn tạo câu hỏi tự động từ tài liệu trong Component `EQuizz.jsx`, Spring Boot nhận file nội dung, gửi prompt hướng dẫn cấu trúc JSON chặt chẽ tới model `llama-3.3-70b-versatile` của Groq, nhận về kết quả và tự động chèn dữ liệu câu hỏi vào bảng `questions` và đáp án tương ứng vào bảng `answers`.

---

### 2.2.9. Supabase Storage (Object Storage)

#### 2.2.9.1. Tổng quan
Supabase Storage là một hệ thống quản lý lưu trữ đối tượng (Object Storage) mã nguồn mở, tương thích hoàn toàn với chuẩn AWS S3. Nó được thiết kế để lưu trữ và quản lý các file dữ liệu lớn không cấu trúc như hình ảnh, tài liệu văn bản, file nén với tốc độ tải lên cao và khả năng bảo mật thông tin tốt.

#### 2.2.9.2. Vai trò trong quản lý tài nguyên học tập
Trong hệ thống E-Learning, việc trao đổi học liệu và nộp bài làm của sinh viên đòi hỏi hạ tầng lưu trữ file ổn định:
- **Lưu trữ tài liệu và tệp đính kèm**: Giảng viên có thể tải lên các tệp bài giảng dạng PDF, Word, hoặc các file Zip đính kèm trong bài viết thông báo.
- **Nộp bài tập tự luận**: Sinh viên nộp các file làm bài của mình lên hệ thống. Tệp tin được lưu trong các thư mục riêng tư của từng lớp học để tránh rò rỉ.
- **Bảo mật truy cập**: Supabase Storage cho phép tạo đường dẫn tải tệp có giới hạn thời gian (Signed URL) dựa trên chính sách RLS, đảm bảo chỉ có giảng viên và sinh viên đúng lớp mới có quyền đọc tệp bài làm.

#### 2.2.9.3. Ứng dụng vào đồ án
Supabase Storage được sử dụng để quản lý 3 bucket lưu trữ chính: `avatars` (chứa hình ảnh đại diện người dùng), `attachments` (chứa các tài liệu học tập của giảng viên đính kèm ở bài đăng), và `submissions` (chứa tệp làm bài tập của sinh viên nộp cho giảng viên). Các đường dẫn tệp tin (`file_url`) sau đó được lưu trong bảng `post_attachments` và `submission_files` của PostgreSQL database.

---

### 2.2.10. Dịch vụ gửi email thông báo (Spring Mail)

#### 2.2.10.1. Giới thiệu
Spring Boot Mail (JavaMailSender) là một thư viện hỗ trợ cấu hình và gửi email thông qua giao thức SMTP (Simple Mail Transfer Protocol) một cách nhanh chóng và ổn định, hỗ trợ định dạng email dạng HTML phong phú.

#### 2.2.10.2. Tối ưu truyền tải thông tin hoạt động lớp học
Để giúp sinh viên không bỏ lỡ các thông báo quan trọng và bài tập mới, hệ thống tích hợp dịch vụ gửi mail tự động:
- **Thông báo bài đăng mới**: Ngay khi giảng viên đăng bài viết lên bảng tin lớp, hệ thống tự động tìm danh sách email các thành viên của lớp đó và gửi thư thông báo tức thì.
- **Nhắc nhở làm bài**: Gửi thông báo khi giảng viên giao bài tập tự luận hoặc bài trắc nghiệm mới, đính kèm link truy cập nhanh để sinh viên vào làm bài.

#### 2.2.10.3. Ứng dụng vào đồ án
Dịch vụ gửi mail được hiện thực tại lớp `EmailService.java` ở phía Backend, sử dụng cấu hình SMTP của Google Mail. Các phương thức gửi mail thông báo được gọi bất đồng bộ (Asynchronous) trong `PostService.java` và `QuizController.java` để tránh gây nghẽn luồng xử lý chính khi lưu bài đăng.

---

### 2.2.11. Công cụ xuất báo cáo Excel & PDF (ExcelJS, jsPDF, XLSX)

#### 2.2.11.1. Giới thiệu
- **ExcelJS / XLSX**: Các thư viện JavaScript mạnh mẽ dùng để đọc, ghi và định dạng các bảng dữ liệu Excel trực tiếp từ phía client.
- **jsPDF / jsPDF-AutoTable**: Thư viện hỗ trợ sinh file tài liệu PDF trực tiếp trên trình duyệt, cho phép định dạng bảng biểu và bố cục trang tài liệu chuyên nghiệp.

#### 2.2.11.2. Ứng dụng trong thống kê và quản lý học lực
Trong môi trường giáo dục, việc xuất dữ liệu điểm số ra các file báo cáo vật lý để lưu giữ nội bộ là yêu cầu bắt buộc:
- **Xuất bảng điểm Excel**: Giảng viên có thể tải về bảng điểm của cả lớp (bao gồm điểm chuyên cần, bài tập tự luận, bài trắc nghiệm) chỉ bằng một lượt click. File Excel được định dạng cột rõ ràng, tính sẵn điểm trung bình môn.
- **Xuất kết quả học tập PDF**: Hỗ trợ sinh viên xuất báo cáo học tập cá nhân, chứng nhận điểm số dưới dạng file PDF đẹp mắt để in ấn.

#### 2.2.11.3. Ứng dụng vào đồ án
Các thư viện này được tích hợp ở phía Frontend ReactJS. Tại trang thống kê lớp học (`Analytics.jsx`), giảng viên có nút chọn "Xuất bảng điểm Excel" (sử dụng `xlsx`/`exceljs`) để sinh file `.xlsx` trực tiếp và tải về máy. Tại trang Dashboard cá nhân của sinh viên (`StudentDashboard.jsx`), nút "Xuất bảng điểm PDF" sử dụng `jspdf` để sinh file báo cáo kết quả học tập cá nhân.

---

### 2.2.12. FontAwesome và Custom CSS

#### 2.2.12.1. Tổng quan
- **FontAwesome**: Thư viện cung cấp hàng nghìn biểu tượng (icon) vector chuẩn hóa, hiển thị sắc nét ở mọi độ phân giải màn hình.
- **Custom CSS**: Sử dụng mã CSS thuần kết hợp các biến thiết kế (CSS Variables) để xây dựng hệ thống giao diện đồng nhất, tùy biến tối đa theo phong cách của hệ thống.

#### 2.2.12.2. Vai trò trong phát triển Frontend
Việc sử dụng Custom CSS kết hợp FontAwesome giúp tối ưu hóa giao diện ứng dụng E-Learning:
- **Giao diện sinh động**: Các biểu tượng FontAwesome được tích hợp ở thanh điều hướng, các nút chức năng (nút làm bài, nộp bài, gửi tin nhắn, streak ngọn lửa) giúp giao diện trực quan và thu hút.
- **Hiệu năng hiển thị**: Tránh việc phải tải các thư viện UI cồng kềnh (giảm kích thước gói bundle), Custom CSS giúp lập trình viên kiểm soát 100% dòng CSS sinh ra, tạo hiệu ứng chuyển động mượt mà (transitions, hover effects).
- **Thiết kế Responsive**: Xây dựng lưới CSS Grid và Flexbox tùy biến giúp giao diện lớp học tự động thích ứng hoàn hảo trên màn hình điện thoại, máy tính bảng và máy tính cá nhân.

#### 2.2.12.3. Ứng dụng vào đồ án
Hệ thống sử dụng các icon của FontAwesome (thư viện `@fortawesome/react-fontawesome`) trong tất cả các màn hình hiển thị. Custom CSS được viết tách biệt trong các file style tương ứng (như `Class.css`, `EQuizz.css`, `Chat.css`) để định hình phong cách hiện đại cho toàn bộ đồ án E-Learning.

---

### 2.2.13. Tài Liệu Tham Khảo Trích Dẫn Chương 2

[1] R. C. Clark and R. E. Mayer, *E-learning and the science of instruction: Proven guidelines for consumers and designers of multimedia learning*. John Wiley & Sons, 2016.  
[2] R. S. Sandhu, E. J. Coyne, H. L. Feinstein, and C. E. Youman, "Role-based access control models," *IEEE Computer*, vol. 29, no. 2, pp. 38-47, 1996.  
[3] R. T. Fielding, *Architectural styles and the design of network-based software architectures*. Doctoral dissertation, University of California, Irvine, 2000.  
[4] Pivotal Software, "Spring Boot Framework," 2014. [Online]. Available: https://spring.io/projects/spring-boot  
[5] Meta Open Source, "React – A JavaScript library for building user interfaces," 2013. [Online]. Available: https://react.dev  
[6] Microsoft Corporation, "TypeScript - JavaScript with syntax for types," 2012. [Online]. Available: https://www.typescriptlang.org  
[18] The PostgreSQL Global Development Group, "PostgreSQL Database Management System," 1996. [Online]. Available: https://www.postgresql.org  
[19] Supabase Inc., "Supabase - The Open Source Firebase Alternative," 2020. [Online]. Available: https://supabase.com  
[23] M. Jones, J. Bradley, and N. Sakimura, "JSON Web Token (JWT)," RFC 7519, May 2015. [Online]. Available: https://tools.ietf.org/html/rfc7519  
[24] D. Hardt, Ed., "The OAuth 2.0 Authorization Framework," RFC 6749, Oct. 2012. [Online]. Available: https://tools.ietf.org/html/rfc6749  
