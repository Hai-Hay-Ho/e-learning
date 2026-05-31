package com.example.demo.service;

import com.example.demo.model.QuizAttempt;
import com.example.demo.model.StudentStats;
import com.example.demo.model.Submission;
import com.example.demo.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class StudentStatsCalculationService {
    private final StudentStatsRepository studentStatsRepository;
    private final SubmissionRepository submissionRepository;
    private final QuizAttemptRepository quizAttemptRepository;
    private final ClassMemberRepository classMemberRepository;
    private final PostRepository postRepository;
    private final QuizRepository quizRepository;

    /**
     * Tính toán và cập nhật StudentStats cho một student
     */
    public void calculateAndUpdateStudentStats(UUID studentId) {
        // Bước 1: Lấy tất cả lớp mà student tham gia
        List<UUID> classIds = classMemberRepository.findByStudentId(studentId)
                .stream()
                .map(cm -> cm.getClassId())
                .toList();

        if (classIds.isEmpty()) {
            // Student chưa tham gia lớp nào
            return;
        }

        // Bước 2: Lấy tất cả assignments và quizzes được giao trong các lớp đó
        List<UUID> allAssignmentIds = postRepository.findByClassIdInAndType(classIds, "assignment")
                .stream()
                .map(p -> p.getId())
                .toList();
        
        List<UUID> allQuizIds = quizRepository.findByClassIdIn(classIds)
                .stream()
                .map(q -> q.getId())
                .toList();

        // Bước 3: Lấy tất cả submissions của student
        List<Submission> submissions = submissionRepository.findByStudentId(studentId);
        
        // Bước 4: Lấy tất cả quiz attempts của student
        List<QuizAttempt> quizAttempts = quizAttemptRepository.findByUserId(studentId);

        // Bước 5: Tính best scores cho mỗi assignment
        Map<UUID, BigDecimal> bestAssignmentScores = new HashMap<>();
        for (Submission sub : submissions) {
            if (sub.getScore() != null) {
                UUID postId = sub.getPostId();
                BigDecimal currentScore = bestAssignmentScores.getOrDefault(postId, BigDecimal.ZERO);
                if (sub.getScore().compareTo(currentScore) > 0) {
                    bestAssignmentScores.put(postId, sub.getScore());
                }
            }
        }

        // Bước 6: Tính best scores cho mỗi quiz
        Map<UUID, BigDecimal> bestQuizScores = new HashMap<>();
        for (QuizAttempt attempt : quizAttempts) {
            if (attempt.getScore() != null) {
                UUID quizId = attempt.getQuizId();
                BigDecimal currentScore = bestQuizScores.getOrDefault(quizId, BigDecimal.ZERO);
                BigDecimal attemptScore = BigDecimal.valueOf(attempt.getScore());
                if (attemptScore.compareTo(currentScore) > 0) {
                    bestQuizScores.put(quizId, attemptScore);
                }
            }
        }

        // Bước 7: Tính tổng assignments và quizzes được giao (đúng cách)
        int totalAssignments = allAssignmentIds.size();
        int totalQuizzes = allQuizIds.size();
        int completedAssignments = bestAssignmentScores.size();
        int completedQuizzes = bestQuizScores.size();

        // Bước 8: Tính điểm trung bình
        // = (tổng best scores) / (tổng assignments + quizzes được giao)
        int totalItems = totalAssignments + totalQuizzes;
        BigDecimal totalScores = bestAssignmentScores.values().stream()
                .reduce(BigDecimal.ZERO, BigDecimal::add)
                .add(bestQuizScores.values().stream()
                        .reduce(BigDecimal.ZERO, BigDecimal::add));

        BigDecimal averageScore = totalItems > 0 
                ? totalScores.divide(new BigDecimal(totalItems), 2, java.math.RoundingMode.HALF_UP)
                : BigDecimal.ZERO;

        // Bước 9: Xác định xếp loại
        String classification = getClassification(averageScore);

        // Bước 10: Cập nhật hoặc tạo StudentStats
        StudentStats stats = studentStatsRepository.findByStudentId(studentId)
                .orElse(StudentStats.builder()
                        .studentId(studentId)
                        .build());

        stats.setAverageScore(averageScore);
        stats.setClassification(classification);
        stats.setTotalAssignments(totalAssignments);
        stats.setCompletedAssignments(completedAssignments);
        stats.setTotalQuizzes(totalQuizzes);
        stats.setCompletedQuizzes(completedQuizzes);
        stats.setUpdatedAt(LocalDateTime.now());

        studentStatsRepository.save(stats);
    }

    /**
     * Lấy phân loại học lực dựa trên điểm trung bình
     */
    private String getClassification(BigDecimal averageScore) {
        if (averageScore.compareTo(BigDecimal.valueOf(8)) >= 0) {
            return "Giỏi";
        } else if (averageScore.compareTo(BigDecimal.valueOf(5)) >= 0) {
            return "Khá";
        } else {
            return "Trung bình";
        }
    }

    /**
     * Lấy StudentStats của một student
     */
    public StudentStats getStudentStats(UUID studentId) {
        return studentStatsRepository.findByStudentId(studentId)
                .orElse(StudentStats.builder()
                        .studentId(studentId)
                        .averageScore(BigDecimal.ZERO)
                        .classification("Chưa có dữ liệu")
                        .totalAssignments(0)
                        .completedAssignments(0)
                        .totalQuizzes(0)
                        .completedQuizzes(0)
                        .updatedAt(LocalDateTime.now())
                        .build());
    }
}
