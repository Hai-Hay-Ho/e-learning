package com.example.demo.dto;

import lombok.Data;
import java.util.List;

@Data
public class AIGeneratedQuestionsResponse {
    private List<GeneratedQuestion> questions;

    @Data
    public static class GeneratedQuestion {
        private String content;
        private List<String> answers;  // Câu trả lời, câu cuối cùng là đáp án đúng
        private Integer questionOrder;
    }
}
