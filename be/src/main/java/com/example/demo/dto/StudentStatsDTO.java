package com.example.demo.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StudentStatsDTO {
    private UUID id;
    private String name;
    private String email;
    private double averageScore;
    private int completionPercentage;
    private String lastActive;
    private String warningLevel; // Low, Medium, High
    private String avatarUrl;
}
