# 📊 Class Diagram — Cấu trúc thực thể (Entity Model)

Tài liệu này mô tả chi tiết sơ đồ lớp thực thể (Entity Class/ERD Diagram) của hệ thống e-learning, áp dụng chuẩn thiết kế UML với 6 loại mối quan hệ cơ bản.

---

## 1. Quy ước 6 loại mũi tên quan hệ trong sơ đồ

| Loại quan hệ | Ký hiệu trong UML / Mermaid | Ý nghĩa thực tế trong Hệ thống |
| :--- | :---: | :--- |
| **1. Kế thừa (Inheritance)** | `A --|> B` (Nét liền, tam giác rỗng) | Thể hiện mối quan hệ cha - con ("is-a"). Lớp con thừa hưởng các thuộc tính của lớp cha. |
| **2. Thực thi (Realization)** | `A ..|> B` (Nét đứt, tam giác rỗng) | Triển khai các phương thức được định nghĩa trong Interface. |
| **3. Cấu thành (Composition)** | `A *-- B` (Nét liền, hình thoi đặc ở A) | Quan hệ chứa đựng chặt chẽ (đời sống gắn liền). Nếu xóa lớp cha `A`, lớp con `B` tự động bị xóa theo (Cascade Delete). |
| **4. Kết tập (Aggregation)** | `A o-- B` (Nét liền, hình thoi rỗng ở A) | Quan hệ thu gom lỏng lẻo. Nếu xóa lớp chứa `A`, các thành phần `B` vẫn có thể tồn tại độc lập. |
| **5. Liên kết (Association)** | `A --> B` (Nét liền, mũi tên nhọn) | Mối quan hệ ngang hàng, hai thực thể biết thông tin hoặc tham chiếu đến nhau thông qua ID. |
| **6. Phụ thuộc (Dependency)** | `A ..> B` (Nét đứt, mũi tên nhọn) | Thực thể `A` sử dụng thực thể `B` tạm thời làm tham số hoặc dữ liệu tính toán. |

---

## 2. Sơ đồ Mermaid (UML Class Diagram)

Bạn có thể copy đoạn mã Mermaid dưới đây dán vào trang [Mermaid Live Editor](https://mermaid.live/) hoặc sử dụng extension Markdown Preview Mermaid trong VS Code để hiển thị sơ đồ trực quan.

```mermaid
classDiagram
    class User {
        +UUID id [PK]
        +String email
        +String fullName
        +String avatarUrl
        +String role
        +String school
        +OffsetDateTime lastSignInAt
        +OffsetDateTime createdAt
        +Integer status
    }

    class ClassEntity {
        +UUID id [PK]
        +String name
        +UUID teacherId [FK]
        +String joinCode
        +Boolean isHidden
        +LocalDateTime createdAt
    }

    class ClassMember {
        +UUID id [PK]
        +UUID studentId [FK]
        +UUID classId [FK]
        +LocalDateTime joinedAt
    }

    class PostEntity {
        +UUID id [PK]
        +UUID classId [FK]
        +UUID authorId [FK]
        +String type
        +String title
        +String content
        +LocalDateTime createdAt
    }

    class PostAttachment {
        +UUID id [PK]
        +UUID postId [FK]
        +String fileUrl
        +String fileName
        +String fileType
        +Integer fileSize
        +LocalDateTime uploadedAt
    }

    class Comment {
        +UUID id [PK]
        +UUID postId [FK]
        +UUID userId [FK]
        +String content
        +LocalDateTime createdAt
    }

    class Submission {
        +UUID id [PK]
        +UUID postId [FK]
        +UUID studentId [FK]
        +String status
        +BigDecimal score
        +String gradeComment
        +LocalDateTime submittedAt
        +LocalDateTime createdAt
    }

    class SubmissionFile {
        +UUID id [PK]
        +UUID submissionId [FK]
        +String fileUrl
        +String fileName
        +LocalDateTime uploadedAt
    }

    class Quiz {
        +UUID id [PK]
        +String title
        +Integer durationMinutes
        +UUID classId [FK]
        +UUID createdBy [FK]
        +LocalDateTime deadline
        +LocalDateTime createdAt
        +LocalDateTime updatedAt
    }

    class Question {
        +UUID id [PK]
        +UUID quizId [FK]
        +String content
        +Integer questionOrder
        +LocalDateTime createdAt
    }

    class Answer {
        +UUID id [PK]
        +UUID questionId [FK]
        +String content
        +Boolean isCorrect
        +Integer answerOrder
    }

    class QuizAttempt {
        +UUID id [PK]
        +UUID quizId [FK]
        +UUID userId [FK]
        +BigDecimal score
        +LocalDateTime submittedAt
    }

    class StudentAnswer {
        +UUID id [PK]
        +UUID attemptId [FK]
        +UUID questionId [FK]
        +UUID selectedAnswerId [FK]
        +Boolean isCorrect
    }

    class StudentStats {
        +UUID userId [PK, FK]
        +Integer completedAssignments
        +Integer completedQuizzes
        +BigDecimal averageScore
        +String classification
        +LocalDateTime updatedAt
    }

    class UserStreak {
        +UUID userId [PK, FK]
        +Integer streak
        +LocalDate lastActiveDate
    }

    class Conversation {
        +UUID id [PK]
        +UUID user1Id [FK]
        +UUID user2Id [FK]
        +LocalDateTime createdAt
    }

    class Message {
        +UUID id [PK]
        +UUID conversationId [FK]
        +UUID senderId [FK]
        +String content
        +Boolean isEdited
        +LocalDateTime readAt
        +LocalDateTime createdAt
    }

    class MessageEdit {
        +UUID id [PK]
        +UUID messageId [FK]
        +String oldContent
        +LocalDateTime editedAt
    }

    class BannedKeyword {
        +UUID id [PK]
        +String keyword
        +LocalDateTime createdAt
    }

    %% ==========================================
    %% THIẾT LẬP MỐI QUAN HỆ THEO 6 DẠNG MŨI TÊN
    %% ==========================================

    %% 1. Quan hệ Kế thừa / Thực thi (Generalization/Realization)
    %% Hệ thống dùng các Entity trực tiếp kế thừa từ JPA Mapping, không dùng kế thừa lớp.

    %% 2. Quan hệ Cấu thành (Composition - Nét liền hình thoi đặc)
    %% Xoá cha -> xoá con (Cascade Delete)
    ClassEntity "1" *-- "0..*" PostEntity : "quản lý posts"
    ClassEntity "1" *-- "0..*" Quiz : "chứa quizzes"
    PostEntity "1" *-- "0..*" PostAttachment : "có attachments"
    PostEntity "1" *-- "0..*" Comment : "chứa bình luận"
    PostEntity "1" *-- "0..*" Submission : "thu nhận bài nộp"
    Submission "1" *-- "0..*" SubmissionFile : "chứa các tệp bài làm"
    
    Quiz "1" *-- "0..*" Question : "bao gồm câu hỏi"
    Question "1" *-- "0..*" Answer : "chứa đáp án lựa chọn"
    
    Quiz "1" *-- "0..*" QuizAttempt : "ghi nhận lượt làm bài"
    QuizAttempt "1" *-- "0..*" StudentAnswer : "lưu kết quả chọn"
    
    Conversation "1" *-- "0..*" Message : "chứa tin nhắn"
    Message "1" *-- "0..*" MessageEdit : "lưu lịch sử sửa"

    User "1" *-- "0..1" StudentStats : "được theo dõi điểm số"
    User "1" *-- "0..1" UserStreak : "giữ streak hoạt động"

    %% 3. Quan hệ Kết tập (Aggregation - Nét liền hình thoi rỗng)
    %% Tập hợp lỏng lẻo, xoá tập hợp (Class) nhưng thành viên (User) vẫn tồn tại.
    ClassEntity "1" o-- "0..*" ClassMember : "danh sách thành viên"

    %% 4. Quan hệ Liên kết (Association - Nét liền mũi tên nhọn)
    %% Hai lớp có liên quan, giữ ID tham chiếu ngang hàng
    User "1" --> "0..*" ClassEntity : "giảng dạy (Teacher)"
    User "1" --> "0..*" ClassMember : "tham gia làm học sinh"
    User "1" --> "0..*" PostEntity : "đăng bài"
    User "1" --> "0..*" Comment : "viết bình luận"
    User "1" --> "0..*" Submission : "nộp bài làm"
    User "1" --> "0..*" Quiz : "thiết kế bộ câu hỏi"
    User "1" --> "0..*" QuizAttempt : "thực hiện thi trắc nghiệm"
    User "1" --> "0..*" Message : "gửi tin nhắn"
    
    User "1" --> "0..*" Conversation : "bắt đầu chat (user1)"
    User "1" --> "0..*" Conversation : "nhận chat (user2)"

    %% 5. Quan hệ Phụ thuộc (Dependency - Nét đứt mũi tên nhọn)
    %% Sử dụng tạm thời, tham chiếu chéo để đối chiếu kết quả
    StudentAnswer "0..*" ..> "1" Question : "trả lời cho"
    StudentAnswer "0..*" ..> "1" Answer : "lựa chọn đáp án"
```

---

## 3. Phân tích chi tiết các loại quan hệ áp dụng

### 3.1 Quan hệ Cấu thành (Composition - `*--`)
Trong cơ sở dữ liệu của dự án, các quan hệ cấu thành thể hiện các cặp bảng có ràng buộc khóa ngoại chặt chẽ và cơ chế `Cascade On Delete` (hoặc cấu hình Hibernate `cascade = CascadeType.ALL, orphanRemoval = true`):
* **Lớp học & Bài viết / Bộ câu hỏi:** Một bài đăng (`PostEntity`) hay một bài thi (`Quiz`) chỉ tồn tại trong ngữ cảnh của một lớp học cụ thể. Nếu lớp học bị xóa, tất cả bài viết, bình luận, và các bài kiểm tra bên trong lớp học đó sẽ bị sập/xóa bỏ hoàn toàn.
* **Bài viết & Tệp đính kèm / Bình luận:** Các tệp đính kèm bài đăng hoặc các bình luận không thể tồn tại độc lập ngoài bài đăng gốc.
* **Lượt làm bài & Đáp án học sinh:** `StudentAnswer` lưu trữ việc chọn đáp án cho một câu hỏi trong một lượt làm bài cụ thể (`QuizAttempt`). Nếu lượt thi đó bị xóa, chi tiết đáp án tương ứng cũng biến mất.

### 3.2 Quan hệ Kết tập (Aggregation - `o--`)
* **Lớp học & Thành viên:** Bảng `class_members` thu gom danh sách sinh viên tham gia lớp. Nếu một lớp học giải tán, các bản ghi liên kết trong bảng `class_members` bị xóa, tuy nhiên thực thể người dùng (`User` - sinh viên) vẫn tồn tại độc lập trong hệ thống để tham gia các lớp học khác.

### 3.3 Quan hệ Liên kết (Association - `-->`)
* **User & Các Thực thể tác vụ:** Người dùng liên kết với các thực thể qua trường ID tác giả/người thực hiện như: Giảng viên dạy lớp học (`User` -> `ClassEntity`), Người gửi tin nhắn (`User` -> `Message`), Sinh viên nộp bài tập (`User` -> `Submission`). Đây là các liên kết ngang hàng phục vụ cho việc định danh.

### 3.4 Quan hệ Phụ thuộc (Dependency - `..>`)
* **Đáp án chọn của Sinh viên với Câu hỏi/Đáp án hệ thống:** Bản ghi `StudentAnswer` lưu đáp án được học sinh chọn bằng cách trỏ tới `Question` và `Answer`. Mối quan hệ này mang tính phụ thuộc dữ liệu nhằm mục đích đối chiếu và tính điểm thi (`calculateStats`).
