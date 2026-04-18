package com.example.demo.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PostDTO {
    private UUID id;
    private UUID classId;
    private List<UUID> targetClassIds;
    private UUID authorId;
    private String authorName;
    private String authorAvatar;
    private String type; // 'announcement' | 'material' | 'assignment'
    private String title;
    private String content;
    private LocalDateTime createdAt;
    private LocalDateTime dueAt;
    private List<AttachmentDTO> attachments;
    private List<CommentDTO> comments;
    private Long commentCount;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class AttachmentDTO {
        private UUID id;
        private String fileUrl;
        private String fileName;
        private String fileType;
        private Integer fileSize;
    }
}
