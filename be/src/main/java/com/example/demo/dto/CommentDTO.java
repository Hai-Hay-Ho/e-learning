package com.example.demo.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CommentDTO {
    private UUID id;
    private UUID postId;
    private UUID userId;
    private String userName;
    private String userAvatar;
    private String content;
    private LocalDateTime createdAt;
}
