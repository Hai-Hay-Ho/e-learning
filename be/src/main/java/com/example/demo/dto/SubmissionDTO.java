package com.example.demo.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
public class SubmissionDTO {
    private UUID id;
    private UUID postId;
    private UUID studentId;
    private String studentName;
    private String studentAvatar;
    private String status;
    private BigDecimal score;
    private String gradeComment;
    private LocalDateTime submittedAt;
    private List<SubmissionFileDTO> files;

    @Data
    public static class SubmissionFileDTO {
        private UUID id;
        private String fileUrl;
        private String fileName;
    }
}
