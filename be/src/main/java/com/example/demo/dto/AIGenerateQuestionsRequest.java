package com.example.demo.dto;

import lombok.Data;

@Data
public class AIGenerateQuestionsRequest {
    private String fileContent;      // Nội dung file (text)
    private Integer numberOfQuestions; // Số câu hỏi muốn generate
    private String topic;             // (Optional) Chủ đề câu hỏi
}
