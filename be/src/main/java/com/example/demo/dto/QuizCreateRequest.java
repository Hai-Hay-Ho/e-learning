package com.example.demo.dto;

import lombok.Data;
import java.util.List;
import java.util.UUID;

@Data
public class QuizCreateRequest {
    private QuizDTO quiz;
    private List<QuestionDTO> questions;

    @Data
    public static class QuizDTO {
        private String title;
        private Integer durationMinutes;
        private UUID classId;
        private UUID createdBy;
    }

    @Data
    public static class QuestionDTO {
        private String content;
        private Integer questionOrder;
        private List<AnswerDTO> answers;
    }

    @Data
    public static class AnswerDTO {
        private String content;
        private Boolean isCorrect;
        private Integer answerOrder;
    }
}
