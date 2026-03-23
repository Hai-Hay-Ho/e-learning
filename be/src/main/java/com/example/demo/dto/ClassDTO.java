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
public class ClassDTO {
    private UUID id;
    private String name;
    private UUID teacherId;
    private String teacherName;
    private String teacherAvatar;
    private String joinCode;
    private LocalDateTime createdAt;
}
