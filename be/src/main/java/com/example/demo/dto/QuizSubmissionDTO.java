package com.example.demo.dto;

import lombok.Data;
import java.util.List;
import java.util.UUID;

@Data
public class QuizSubmissionDTO {
    private UUID quizId;
    private UUID userId;
    private Double score;
    private List<AnswerDTO> answers;

    @Data
    public static class AnswerDTO {
        private UUID questionId;
        private UUID selectedAnswerId;
        private Boolean isCorrect;
    }
}
