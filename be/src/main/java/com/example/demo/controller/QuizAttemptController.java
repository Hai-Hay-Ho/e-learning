package com.example.demo.controller;

import com.example.demo.dto.QuizSubmissionDTO;
import com.example.demo.model.QuizAttempt;
import com.example.demo.model.StudentAnswer;
import com.example.demo.repository.QuizAttemptRepository;
import com.example.demo.repository.StudentAnswerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/quiz-attempts")
@CrossOrigin(origins = "http://localhost:3000")
public class QuizAttemptController {

    @Autowired
    private QuizAttemptRepository attemptRepository;

    @Autowired
    private StudentAnswerRepository answerRepository;

    @PostMapping("/submit")
    public ResponseEntity<?> submitQuiz(@RequestBody QuizSubmissionDTO submission) {
        try {
            QuizAttempt attempt = new QuizAttempt();
            attempt.setQuizId(submission.getQuizId());
            attempt.setUserId(submission.getUserId());
            attempt.setScore(submission.getScore());
            attempt.setSubmittedAt(LocalDateTime.now());

            QuizAttempt savedAttempt = attemptRepository.save(attempt);

            List<StudentAnswer> answers = submission.getAnswers().stream().map(a -> {
                StudentAnswer sa = new StudentAnswer();
                sa.setAttempt(savedAttempt);
                sa.setQuestionId(a.getQuestionId());
                sa.setSelectedAnswerId(a.getSelectedAnswerId());
                sa.setIsCorrect(a.getIsCorrect());
                return sa;
            }).collect(Collectors.toList());

            answerRepository.saveAll(answers);

            return ResponseEntity.ok(savedAttempt);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Error saving submission: " + e.getMessage());
        }
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<QuizAttempt>> getUserAttempts(@PathVariable UUID userId) {
        return ResponseEntity.ok(attemptRepository.findByUserId(userId));
    }

    @GetMapping("/attempt/{attemptId}/answers")
    public ResponseEntity<List<StudentAnswer>> getAttemptAnswers(@PathVariable UUID attemptId) {
        return ResponseEntity.ok(answerRepository.findByAttemptId(attemptId));
    }
}
