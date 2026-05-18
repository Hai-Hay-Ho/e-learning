package com.example.demo.service;

import com.example.demo.dto.ClassStatsDTO;
import com.example.demo.dto.RecentUserDTO;
import com.example.demo.dto.StudentStatsDTO;
import com.example.demo.dto.SystemActivityDTO;
import com.example.demo.dto.SystemStatsDTO;
import com.example.demo.dto.TeacherStatsDTO;
import com.example.demo.model.*;
import com.example.demo.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.OffsetDateTime;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class StatsService {
    private final ClassRepository classRepository;
    private final PostRepository postRepository;
    private final QuizRepository quizRepository;
    private final SubmissionRepository submissionRepository;
    private final QuizAttemptRepository quizAttemptRepository;
    private final ClassMemberRepository classMemberRepository;
    private final UserRepository userRepository;
    private final CommentRepository commentRepository;

    public TeacherStatsDTO getTeacherStats(UUID teacherId) {
        // FIX: Lấy tất cả dữ liệu cần thiết một lần thay vì nhiều lần
        List<ClassEntity> teacherClasses = classRepository.findByTeacherId(teacherId);
        long totalClasses = teacherClasses.size();

        if (teacherClasses.isEmpty()) {
            return TeacherStatsDTO.builder()
                    .totalClasses(0)
                    .totalExercises(0)
                    .ungradedAssignments(0)
                    .todaySubmissions(0)
                    .build();
        }

        // FIX: Batch fetch assignments & quizzes thay vì 2 queries riêng
        List<UUID> classIds = teacherClasses.stream().map(ClassEntity::getId).collect(Collectors.toList());
        long totalAssignments = postRepository.countByClassIdInAndType(classIds, "assignment");
        long totalQuizzes = quizRepository.countByClassIdIn(classIds);
        long totalExercises = totalAssignments + totalQuizzes;

        // FIX: Lấy 1 lần rồi mới tính ungraded/today
        List<UUID> postIds = postRepository.findByClassIdInAndType(classIds, "assignment").stream()
                .map(PostEntity::getId)
                .collect(Collectors.toList());

        List<UUID> quizIds = quizRepository.findByClassIdIn(classIds).stream()
                .map(Quiz::getId)
                .collect(Collectors.toList());

        long ungradedAssignments = 0;
        long todayAssignmentSubmissions = 0;
        long todayQuizAttempts = 0;

        LocalDateTime startOfDay = LocalDateTime.now().with(LocalTime.MIN);

        // FIX: Lấy tất cả 1 lần
        if (!postIds.isEmpty()) {
            List<Submission> submissions = submissionRepository.findByPostIdIn(postIds);
            ungradedAssignments = submissions.stream().filter(s -> s.getScore() == null).count();
            todayAssignmentSubmissions = submissions.stream()
                    .filter(s -> s.getCreatedAt() != null && s.getCreatedAt().isAfter(startOfDay))
                    .count();
        }

        if (!quizIds.isEmpty()) {
            List<QuizAttempt> attempts = quizAttemptRepository.findByQuizIdIn(quizIds);
            todayQuizAttempts = attempts.stream()
                    .filter(a -> a.getSubmittedAt() != null && a.getSubmittedAt().isAfter(startOfDay))
                    .count();
        }

        long todaySubmissions = todayAssignmentSubmissions + todayQuizAttempts;

        return TeacherStatsDTO.builder()
                .totalClasses(totalClasses)
                .totalExercises(totalExercises)
                .ungradedAssignments(ungradedAssignments)
                .todaySubmissions(todaySubmissions)
                .build();
    }

    public ClassStatsDTO getClassStats(UUID classId) {
        // 1. Tổng số học sinh
        long totalStudents = classMemberRepository.countByClassId(classId);

        if (totalStudents == 0) {
            return ClassStatsDTO.builder()
                    .totalStudents(0)
                    .averageScore(0.0)
                    .completionRate(0.0)
                    .build();
        }

        // FIX: Batch fetch assignments & quizzes 1 lần thay vì 2 lần
        List<UUID> assignmentIds = postRepository.findByClassIdInAndType(List.of(classId), "assignment").stream()
                .map(PostEntity::getId)
                .collect(Collectors.toList());

        List<UUID> quizIds = quizRepository.findByClassIdIn(List.of(classId)).stream()
                .map(Quiz::getId)
                .collect(Collectors.toList());

        // FIX: Lấy tất cả submissions & attempts 1 lần (đã sắp xếp ở query)
        List<Submission> allSubmissions = assignmentIds.isEmpty() ? List.of()
                : submissionRepository.findByPostIdIn(assignmentIds);
        List<QuizAttempt> allAttempts = quizIds.isEmpty() ? List.of() : quizAttemptRepository.findByQuizIdIn(quizIds);

        // Map best scores
        Map<UUID, Map<UUID, Double>> studentBestScores = new HashMap<>();

        for (Submission s : allSubmissions) {
            if (s.getScore() != null) {
                studentBestScores.computeIfAbsent(s.getStudentId(), k -> new HashMap<>())
                        .merge(s.getPostId(), s.getScore().doubleValue(), Double::max);
            }
        }
        for (QuizAttempt qa : allAttempts) {
            if (qa.getScore() != null) {
                studentBestScores.computeIfAbsent(qa.getUserId(), k -> new HashMap<>())
                        .merge(qa.getQuizId(), qa.getScore(), Double::max);
            }
        }

        long totalItems = assignmentIds.size() + quizIds.size();
        double classTotalScore = 0.0;
        for (Map<UUID, Double> scores : studentBestScores.values()) {
            classTotalScore += scores.values().stream().mapToDouble(Double::doubleValue).sum();
        }

        double averageScore = (totalStudents > 0 && totalItems > 0) ? classTotalScore / (totalStudents * totalItems)
                : 0.0;

        // Tỷ lệ hoàn thành
        long totalCompletedItemsCount = 0;
        for (Map<UUID, Double> scores : studentBestScores.values()) {
            totalCompletedItemsCount += scores.size();
        }
        long totalExpected = totalItems * totalStudents;
        double completionRate = totalExpected > 0 ? (double) totalCompletedItemsCount / totalExpected * 100 : 0.0;

        // FIX: Batch fetch tất cả students 1 lần thay vì query từng student
        List<ClassMember> members = classMemberRepository.findByClassId(classId);
        List<UUID> studentIds = members.stream().map(ClassMember::getStudentId).collect(Collectors.toList());
        List<User> students = userRepository.findAllById(studentIds);

        // FIX: Sử dụng grouping thay vì multiple queries
        Map<UUID, List<Submission>> submissionsByStudent = allSubmissions.stream()
                .collect(Collectors.groupingBy(Submission::getStudentId));

        Map<UUID, List<QuizAttempt>> quizAttemptsByStudent = allAttempts.stream()
                .collect(Collectors.groupingBy(QuizAttempt::getUserId));

        // Tính độ lệch chuẩn tại đây để tránh iterate lại
        List<Double> allScores = new ArrayList<>();
        
        List<StudentStatsDTO> studentStatsList = students.stream().map(s -> {
            Map<UUID, Double> scores = studentBestScores.getOrDefault(s.getId(), Map.of());
            double studentTotalScore = scores.values().stream().mapToDouble(Double::doubleValue).sum();
            double studentAverageScore = totalItems > 0 ? studentTotalScore / totalItems : 0.0;
            allScores.add(studentAverageScore);

            int studentCompletionPercentage = totalItems > 0
                    ? (int) Math.round((double) scores.size() / totalItems * 100)
                    : 0;

            List<Submission> studentSubmissions = submissionsByStudent.getOrDefault(s.getId(), List.of());
            LocalDateTime latestSub = studentSubmissions.stream()
                    .map(Submission::getSubmittedAt)
                    .filter(Objects::nonNull)
                    .max(LocalDateTime::compareTo)
                    .orElse(null);

            List<QuizAttempt> studentQuizzes = quizAttemptsByStudent.getOrDefault(s.getId(), List.of());
            LocalDateTime latestQuiz = studentQuizzes.stream()
                    .map(QuizAttempt::getSubmittedAt)
                    .filter(Objects::nonNull)
                    .max(LocalDateTime::compareTo)
                    .orElse(null);

            String warningLevel = "Cao";
            if (studentAverageScore >= 8)
                warningLevel = "Thấp";
            else if (studentAverageScore >= 5)
                warningLevel = "Trung bình";

            return StudentStatsDTO.builder()
                    .id(s.getId())
                    .name(s.getFullName())
                    .email(s.getEmail())
                    .averageScore(studentAverageScore)
                    .completionPercentage(studentCompletionPercentage)
                    .lastActive(calculateLastActive(s.getLastSignInAt(), s.getCreatedAt(), latestSub, latestQuiz))
                    .warningLevel(warningLevel)
                    .avatarUrl(s.getAvatarUrl())
                    .build();
        }).collect(Collectors.toList());

        // FIX: Tính độ lệch chuẩn từ danh sách đã tính (không iterate lại)
        double sumSquaredDiffs = 0;
        for (Double score : allScores) {
            double diff = score - averageScore;
            sumSquaredDiffs += diff * diff;
        }
        double standardDeviation = totalStudents > 0 ? Math.sqrt(sumSquaredDiffs / totalStudents) : 0.0;

        return ClassStatsDTO.builder()
                .totalStudents(totalStudents)
                .averageScore(averageScore)
                .completionRate(completionRate)
                .standardDeviation(standardDeviation)
                .students(studentStatsList)
                .build();
    }

    private String calculateLastActive(OffsetDateTime lastSignIn, OffsetDateTime createdAt, LocalDateTime lastSub,
            LocalDateTime lastQuiz) {
        OffsetDateTime lastTime = lastSignIn != null ? lastSignIn : createdAt;

        if (lastSub != null) {
            OffsetDateTime subTime = lastSub.atOffset(java.time.OffsetDateTime.now().getOffset());
            if (lastTime == null || subTime.isAfter(lastTime)) {
                lastTime = subTime;
            }
        }

        if (lastQuiz != null) {
            OffsetDateTime quizTime = lastQuiz.atOffset(java.time.OffsetDateTime.now().getOffset());
            if (lastTime == null || quizTime.isAfter(lastTime)) {
                lastTime = quizTime;
            }
        }

        if (lastTime == null)
            return "Chưa từng";

        OffsetDateTime now = OffsetDateTime.now();
        long minutes = ChronoUnit.MINUTES.between(lastTime, now);
        if (minutes < 1)
            return "Vừa xong";
        if (minutes < 60)
            return minutes + " phút trước";
        long hours = ChronoUnit.HOURS.between(lastTime, now);
        if (hours < 24)
            return hours + " giờ trước";
        long days = ChronoUnit.DAYS.between(lastTime, now);
        if (days < 30)
            return days + " ngày trước";
        return "Lâu hơn 1 tháng";
    }

    public SystemStatsDTO getSystemStats() {
        long totalUsers = userRepository.count();
        long totalStudents = userRepository.countByRole("0");
        long totalTeachers = userRepository.countByRole("1");
        long totalClasses = classRepository.count();
        long totalPosts = postRepository.count();
        long totalQuizzes = quizRepository.count();
        long totalSubmissions = submissionRepository.count();

        // Tính số người dùng hoạt động hôm nay
        LocalDateTime startOfDay = LocalDateTime.now().with(LocalTime.MIN);
        long activeUsersToday = userRepository.countByLastSignInAtAfter(
                startOfDay.atOffset(java.time.OffsetDateTime.now().getOffset())
        );

        return SystemStatsDTO.builder()
                .totalUsers(totalUsers)
                .totalStudents(totalStudents)
                .totalTeachers(totalTeachers)
                .totalClasses(totalClasses)
                .totalPosts(totalPosts)
                .totalQuizzes(totalQuizzes)
                .totalSubmissions(totalSubmissions)
                .activeUsersToday(activeUsersToday)
                .build();
    }

    public List<RecentUserDTO> getRecentUsers() {
        Pageable pageable = PageRequest.of(0, 10);
        return userRepository.findRecentUsers(pageable).stream()
                .map(u -> RecentUserDTO.builder()
                        .id(u.getId())
                        .fullName(u.getFullName())
                        .email(u.getEmail())
                        .role(u.getRole())
                        .avatarUrl(u.getAvatarUrl())
                        .status(u.getStatus())
                        .createdAt(u.getCreatedAt())
                        .lastSignInAt(u.getLastSignInAt())
                        .build())
                .collect(Collectors.toList());
    }

    public List<SystemActivityDTO> getSystemActivity() {
        List<SystemActivityDTO> activities = new ArrayList<>();
        Pageable limit = PageRequest.of(0, 3, org.springframework.data.domain.Sort.by(org.springframework.data.domain.Sort.Direction.DESC, "createdAt"));
        
        List<User> recentUsers = userRepository.findRecentUsers(PageRequest.of(0, 3));
        for (User user : recentUsers) {
            if (user.getCreatedAt() != null) {
                activities.add(SystemActivityDTO.builder()
                        .description(user.getFullName() + " joined as " + ("1".equals(user.getRole()) ? "Teacher" : "Student"))
                        .type("user_created")
                        .timestamp(user.getCreatedAt())
                        .actorName(user.getFullName())
                        .icon("user-plus")
                        .build());
            }
        }
        
        List<ClassEntity> recentClasses = classRepository.findAll(limit).getContent();
        List<UUID> teacherIds = recentClasses.stream()
                .map(ClassEntity::getTeacherId)
                .distinct()
                .collect(Collectors.toList());
        Map<UUID, User> teacherMap = userRepository.findAllById(teacherIds).stream()
                .collect(Collectors.toMap(User::getId, u -> u));
        
        for (ClassEntity classEntity : recentClasses) {
            if (classEntity.getCreatedAt() != null) {
                User teacher = teacherMap.getOrDefault(classEntity.getTeacherId(), null);
                String teacherName = teacher != null ? teacher.getFullName() : "Unknown";
                activities.add(SystemActivityDTO.builder()
                        .description(teacherName + " created class \"" + classEntity.getName() + "\"")
                        .type("class_created")
                        .timestamp(classEntity.getCreatedAt().atOffset(java.time.OffsetDateTime.now().getOffset()))
                        .actorName(teacherName)
                        .icon("book")
                        .build());
            }
        }
        
        List<PostEntity> recentPosts = postRepository.findAll(limit).getContent();
        List<UUID> authorIds = recentPosts.stream()
                .map(PostEntity::getAuthorId)
                .distinct()
                .collect(Collectors.toList());
        Map<UUID, User> authorMap = userRepository.findAllById(authorIds).stream()
                .collect(Collectors.toMap(User::getId, u -> u));
        
        for (PostEntity post : recentPosts) {
            if (post.getCreatedAt() != null) {
                User author = authorMap.getOrDefault(post.getAuthorId(), null);
                String authorName = author != null ? author.getFullName() : "Unknown";
                activities.add(SystemActivityDTO.builder()
                        .description(authorName + " created post \"" + post.getTitle() + "\"")
                        .type("post_created")
                        .timestamp(post.getCreatedAt().atOffset(java.time.OffsetDateTime.now().getOffset()))
                        .actorName(authorName)
                        .icon("file-text")
                        .build());
            }
        }
        
        List<Quiz> recentQuizzes = quizRepository.findAll(limit).getContent();
        
        List<UUID> creatorIds = recentQuizzes.stream()
                .map(Quiz::getCreatedBy)
                .distinct()
                .collect(Collectors.toList());
        Map<UUID, User> creatorMap = userRepository.findAllById(creatorIds).stream()
                .collect(Collectors.toMap(User::getId, u -> u));
        
        for (Quiz quiz : recentQuizzes) {
            if (quiz.getCreatedAt() != null) {
                User creator = creatorMap.getOrDefault(quiz.getCreatedBy(), null);
                String creatorName = creator != null ? creator.getFullName() : "Unknown";
                activities.add(SystemActivityDTO.builder()
                        .description(creatorName + " created quiz \"" + quiz.getTitle() + "\"")
                        .type("quiz_created")
                        .timestamp(quiz.getCreatedAt().atOffset(java.time.OffsetDateTime.now().getOffset()))
                        .actorName(creatorName)
                        .icon("help-circle")
                        .build());
            }
        }
        
        List<Submission> recentSubmissions = submissionRepository.findAll(limit).getContent();
        
        List<UUID> studentIds = recentSubmissions.stream()
                .map(Submission::getStudentId)
                .distinct()
                .collect(Collectors.toList());
        Map<UUID, User> studentMap = userRepository.findAllById(studentIds).stream()
                .collect(Collectors.toMap(User::getId, u -> u));
        
        for (Submission submission : recentSubmissions) {
            if (submission.getCreatedAt() != null) {
                User student = studentMap.getOrDefault(submission.getStudentId(), null);
                String studentName = student != null ? student.getFullName() : "Unknown";
                activities.add(SystemActivityDTO.builder()
                        .description(studentName + " submitted an assignment")
                        .type("submission_created")
                        .timestamp(submission.getCreatedAt().atOffset(java.time.OffsetDateTime.now().getOffset()))
                        .actorName(studentName)
                        .icon("check-circle")
                        .build());
            }
        }
        
        List<Comment> recentComments = commentRepository.findAll(limit).getContent();
        
        for (Comment comment : recentComments) {
            if (comment.getCreatedAt() != null && comment.getUser() != null) {
                activities.add(SystemActivityDTO.builder()
                        .description(comment.getUser().getFullName() + " commented on a post")
                        .type("comment_created")
                        .timestamp(comment.getCreatedAt().atOffset(java.time.OffsetDateTime.now().getOffset()))
                        .actorName(comment.getUser().getFullName())
                        .icon("message-circle")
                        .build());
            }
        }
        
        return activities.stream()
                .sorted((a, b) -> {
                    if (a.getTimestamp() == null) return 1;
                    if (b.getTimestamp() == null) return -1;
                    return b.getTimestamp().compareTo(a.getTimestamp());
                })
                .limit(7)
                .collect(Collectors.toList());
    }
}
