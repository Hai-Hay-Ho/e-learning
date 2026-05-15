package com.example.demo.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.OffsetDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SystemActivityDTO {
    private String description;
    private String type; // "user_created", "class_created", "post_created", "quiz_created", "submission_created", "comment_created", "quiz_attempt_created"
    private OffsetDateTime timestamp;
    private String actorName; // Người thực hiện hành động
    private String icon; // Icon type để frontend sử dụng
}
