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
        private Integer duration_minutes;
        private UUID class_id;
        private UUID created_by;
    }

    @Data
    public static class QuestionDTO {
        private String content;
        private Integer question_order;
        private List<AnswerDTO> answers;
    }

    @Data
    public static class AnswerDTO {
        private String content;
        private Boolean is_correct;
        private Integer answer_order;
    }
}
