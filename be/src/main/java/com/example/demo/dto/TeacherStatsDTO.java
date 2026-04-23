package com.example.demo.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class TeacherStatsDTO {
    private long totalClasses;
    private long totalExercises;
    private long ungradedAssignments;
    private long todaySubmissions;
}
