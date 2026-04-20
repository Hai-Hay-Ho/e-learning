package com.example.demo.controller;

import com.example.demo.dto.QuizCreateRequest;
import com.example.demo.model.Answer;
import com.example.demo.model.Question;
import com.example.demo.model.Quiz;
import com.example.demo.repository.QuizRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/quizzes")
@CrossOrigin(origins = "http://localhost:3000")
public class QuizController {

    @Autowired
    private QuizRepository quizRepository;

    @Autowired
    private com.example.demo.service.EmailService emailService;

    @Autowired
    private com.example.demo.repository.UserRepository userRepository;

    @PostMapping
    public ResponseEntity<?> createQuiz(@RequestBody QuizCreateRequest request) {
        try {
            Quiz quiz = new Quiz();
            quiz.setTitle(request.getQuiz().getTitle());
            quiz.setDurationMinutes(request.getQuiz().getDurationMinutes() != null ? request.getQuiz().getDurationMinutes() : 15);
            quiz.setClassId(request.getQuiz().getClassId());
            quiz.setCreatedBy(request.getQuiz().getCreatedBy());
            quiz.setDeadline(request.getQuiz().getDeadline());
            quiz.setCreatedAt(LocalDateTime.now());
            quiz.setUpdatedAt(LocalDateTime.now());

            List<Question> questions = new ArrayList<>();
            for (QuizCreateRequest.QuestionDTO qDto : request.getQuestions()) {
                Question question = new Question();
                question.setContent(qDto.getContent());
                question.setQuestionOrder(qDto.getQuestionOrder());
                question.setQuiz(quiz);
                question.setCreatedAt(LocalDateTime.now());

                List<Answer> answers = new ArrayList<>();
                for (QuizCreateRequest.AnswerDTO aDto : qDto.getAnswers()) {
                    Answer answer = new Answer();
                    answer.setContent(aDto.getContent());
                    answer.setIsCorrect(aDto.getIsCorrect());
                    answer.setAnswerOrder(aDto.getAnswerOrder());
                    answer.setQuestion(question);
                    answers.add(answer);
                }
                question.setAnswers(answers);
                questions.add(question);
            }
            quiz.setQuestions(questions);

            Quiz savedQuiz = quizRepository.save(quiz);

            // Gửi thông báo email cho sinh viên
            try {
                List<String> studentEmails = userRepository.findEmailsByClassId(savedQuiz.getClassId());
                com.example.demo.model.User teacher = userRepository.findById(savedQuiz.getCreatedBy()).orElse(null);
                String teacherName = teacher != null ? teacher.getFullName() : "Giảng viên";
                
                String directLink = "http://localhost:3000/?tab=Quizzes&id=" + savedQuiz.getId();
                emailService.sendNotification(
                    studentEmails, 
                    "[Thông báo] Giảng viên đã đăng một bộ câu hỏi mới", 
                    teacherName, 
                    "vừa đăng một bộ câu hỏi mới", 
                    savedQuiz.getTitle(), 
                    directLink
                );
            } catch (Exception e) {
                System.err.println("Failed to trigger email notification: " + e.getMessage());
            }

            return ResponseEntity.ok(savedQuiz);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateQuiz(@PathVariable UUID id, @RequestBody QuizCreateRequest request) {
        try {
            Quiz existingQuiz = quizRepository.findById(id).orElse(null);
            if (existingQuiz == null) return ResponseEntity.notFound().build();

            existingQuiz.setTitle(request.getQuiz().getTitle());
            existingQuiz.setDurationMinutes(request.getQuiz().getDurationMinutes());
            existingQuiz.setDeadline(request.getQuiz().getDeadline());
            existingQuiz.setUpdatedAt(LocalDateTime.now());

            // Simple way: clear existings and add new ones (since it's a builder)
            existingQuiz.getQuestions().clear();
            
            for (QuizCreateRequest.QuestionDTO qDto : request.getQuestions()) {
                Question question = new Question();
                question.setContent(qDto.getContent());
                question.setQuestionOrder(qDto.getQuestionOrder());
                question.setQuiz(existingQuiz);
                question.setCreatedAt(LocalDateTime.now());

                List<Answer> answers = new ArrayList<>();
                for (QuizCreateRequest.AnswerDTO aDto : qDto.getAnswers()) {
                    Answer answer = new Answer();
                    answer.setContent(aDto.getContent());
                    answer.setIsCorrect(aDto.getIsCorrect());
                    answer.setAnswerOrder(aDto.getAnswerOrder());
                    answer.setQuestion(question);
                    answers.add(answer);
                }
                question.setAnswers(answers);
                existingQuiz.getQuestions().add(question);
            }

            Quiz updatedQuiz = quizRepository.save(existingQuiz);
            return ResponseEntity.ok(updatedQuiz);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }

    @GetMapping("/class/{classId}")
    public ResponseEntity<List<Quiz>> getQuizzesByClass(@PathVariable UUID classId) {
        return ResponseEntity.ok(quizRepository.findByClassId(classId));
    }
}
