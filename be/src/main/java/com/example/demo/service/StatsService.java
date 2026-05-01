package com.example.demo.service;

import com.example.demo.dto.ClassStatsDTO;
import com.example.demo.dto.StudentStatsDTO;
import com.example.demo.dto.TeacherStatsDTO;
import com.example.demo.model.*;
import com.example.demo.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.UUID;
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

    public TeacherStatsDTO getTeacherStats(UUID teacherId) {
        // tổng classes
        List<UUID> classIds = classRepository.findByTeacherId(teacherId).stream()
                .map(c -> c.getId())
                .collect(Collectors.toList());
        long totalClasses = classIds.size();

        if (classIds.isEmpty()) {
            return TeacherStatsDTO.builder()
                    .totalClasses(0)
                    .totalExercises(0)
                    .ungradedAssignments(0)
                    .todaySubmissions(0)
                    .build();
        }

        // tổng btap
        long totalAssignments = postRepository.countByClassIdInAndType(classIds, "assignment");
        long totalQuizzes = quizRepository.countByClassIdIn(classIds);
        long totalExercises = totalAssignments + totalQuizzes;

        // ch nộp
        List<UUID> postIds = postRepository.findByClassIdInAndType(classIds, "assignment").stream()
                .map(PostEntity::getId)
                .collect(Collectors.toList());

        long ungradedAssignments = 0;
        if (!postIds.isEmpty()) {
            ungradedAssignments = submissionRepository.countByPostIdInAndScoreIsNull(postIds);
        }

        // bài nộp hnay
        LocalDateTime startOfDay = LocalDateTime.now().with(LocalTime.MIN);

        long todayAssignmentSubmissions = 0;
        if (!postIds.isEmpty()) {
            todayAssignmentSubmissions = submissionRepository.countByPostIdInAndCreatedAtAfter(postIds, startOfDay);
        }

        List<UUID> quizIds = quizRepository.findByClassIdIn(classIds).stream()
                .map(Quiz::getId)
                .collect(Collectors.toList());

        long todayQuizAttempts = 0;
        if (!quizIds.isEmpty()) {
            todayQuizAttempts = quizAttemptRepository.countByQuizIdInAndSubmittedAtAfter(quizIds, startOfDay);
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

        // 2. Điểm trung bình
        // Lấy tất cả assignment của lớp
        List<UUID> assignmentIds = postRepository.findByClassIdInAndType(List.of(classId), "assignment").stream()
                .map(PostEntity::getId)
                .collect(Collectors.toList());

        // Lấy tất cả quiz của lớp
        List<UUID> quizIds = quizRepository.findByClassIdIn(List.of(classId)).stream()
                .map(Quiz::getId)
                .collect(Collectors.toList());

        // 3. Tính điểm trung bình lớp (dựa trên điểm cao nhất của mỗi học sinh cho mỗi bài tập)
        List<Submission> allSubmissions = assignmentIds.isEmpty() ? List.of() : submissionRepository.findByPostIdIn(assignmentIds);
        List<QuizAttempt> allAttempts = quizIds.isEmpty() ? List.of() : quizAttemptRepository.findByQuizIdIn(quizIds);

        // Map<StudentId, Map<ItemId, MaxScore>>
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

        double averageScore = (totalStudents > 0 && totalItems > 0) ? classTotalScore / (totalStudents * totalItems) : 0.0;

        // 3.1 Tỷ lệ hoàn thành (tính số bài đã làm ít nhất 1 lần)
        long totalCompletedItemsCount = 0;
        for (Map<UUID, Double> scores : studentBestScores.values()) {
            totalCompletedItemsCount += scores.size();
        }
        long totalExpected = totalItems * totalStudents;
        double completionRate = totalExpected > 0 ? (double) totalCompletedItemsCount / totalExpected * 100 : 0.0;

        // 4. Danh sách học sinh chi tiết
        List<ClassMember> members = classMemberRepository.findByClassId(classId);
        List<UUID> studentIds = members.stream().map(ClassMember::getStudentId).collect(Collectors.toList());
        List<User> students = userRepository.findAllById(studentIds);

        Map<UUID, List<Submission>> submissionsByStudent = Map.of();
        if (!assignmentIds.isEmpty()) {
            submissionsByStudent = submissionRepository.findByPostIdIn(assignmentIds).stream()
                    .collect(Collectors.groupingBy(Submission::getStudentId));
        }

        Map<UUID, List<QuizAttempt>> quizAttemptsByStudent = Map.of();
        if (!quizIds.isEmpty()) {
            quizAttemptsByStudent = quizAttemptRepository.findByQuizIdIn(quizIds).stream()
                    .collect(Collectors.groupingBy(QuizAttempt::getUserId));
        }

        Map<UUID, List<Submission>> finalSubmissionsByStudent = submissionsByStudent;
        Map<UUID, List<QuizAttempt>> finalQuizAttemptsByStudent = quizAttemptsByStudent;

        List<StudentStatsDTO> studentStatsList = students.stream().map(s -> {
            Map<UUID, Double> scores = studentBestScores.getOrDefault(s.getId(), Map.of());
            double studentTotalScore = scores.values().stream().mapToDouble(Double::doubleValue).sum();
            double studentAverageScore = totalItems > 0 ? studentTotalScore / totalItems : 0.0;

            int studentCompletionPercentage = totalItems > 0 ? (int) Math.round((double) scores.size() / totalItems * 100) : 0;

            // Trạng thái (Warning level): >=8 Thấp, >=5 Trung bình, còn lại Cao
            String warningLevel = "Cao";
            if (studentAverageScore >= 8) warningLevel = "Thấp";
            else if (studentAverageScore >= 5) warningLevel = "Trung bình";

            return StudentStatsDTO.builder()
                    .id(s.getId())
                    .name(s.getFullName())
                    .email(s.getEmail())
                    .averageScore(studentAverageScore)
                    .completionPercentage(studentCompletionPercentage)
                    .lastActive(calculateLastActive(s.getLastSignInAt(), s.getCreatedAt()))
                    .warningLevel(warningLevel)
                    .avatarUrl(s.getAvatarUrl())
                    .build();
        }).collect(Collectors.toList());

        return ClassStatsDTO.builder()
                .totalStudents(totalStudents)
                .averageScore(averageScore)
                .completionRate(completionRate)
                .standardDeviation(0.0) // placeholder
                .students(studentStatsList)
                .build();
    }

    private String calculateLastActive(OffsetDateTime lastSignIn, OffsetDateTime createdAt) {
        OffsetDateTime lastTime = lastSignIn != null ? lastSignIn : createdAt;
        if (lastTime == null) return "Chưa từng";
        
        OffsetDateTime now = OffsetDateTime.now();
        long minutes = ChronoUnit.MINUTES.between(lastTime, now);
        if (minutes < 1) return "Vừa xong";
        if (minutes < 60) return minutes + " phút trước";
        long hours = ChronoUnit.HOURS.between(lastTime, now);
        if (hours < 24) return hours + " giờ trước";
        long days = ChronoUnit.DAYS.between(lastTime, now);
        if (days < 30) return days + " ngày trước";
        return "Lâu hơn 1 tháng";
    }
}
