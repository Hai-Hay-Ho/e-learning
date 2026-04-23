package com.example.demo.service;

import com.example.demo.dto.TeacherStatsDTO;
import com.example.demo.model.PostEntity;
import com.example.demo.model.Quiz;
import com.example.demo.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
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
}
