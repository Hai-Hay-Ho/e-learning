package com.example.demo.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ClassStatsDTO {
    private long totalStudents;
    private double averageScore;
    private double completionRate;
    private double standardDeviation;
    private List<StudentStatsDTO> students;
}
