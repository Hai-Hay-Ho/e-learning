package com.example.demo.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SystemStatsDTO {
    private long totalUsers;
    private long totalStudents;
    private long totalTeachers;
    private long totalClasses;
    private long totalPosts;
    private long totalQuizzes;
    private long totalSubmissions;
    private long activeUsersToday;
}
