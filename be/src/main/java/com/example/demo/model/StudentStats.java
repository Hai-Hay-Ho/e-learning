package com.example.demo.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "student_stats")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StudentStats {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @Column(name = "student_id", nullable = false, unique = true)
    private UUID studentId;

    @Column(name = "average_score", nullable = false, columnDefinition = "DECIMAL(5,2) DEFAULT 0")
    private BigDecimal averageScore;

    @Column(name = "classification", nullable = false, length = 50)
    private String classification; // "Giỏi", "Khá", "Trung bình"

    @Column(name = "total_assignments", nullable = false, columnDefinition = "INT DEFAULT 0")
    private Integer totalAssignments;

    @Column(name = "completed_assignments", nullable = false, columnDefinition = "INT DEFAULT 0")
    private Integer completedAssignments;

    @Column(name = "total_quizzes", nullable = false, columnDefinition = "INT DEFAULT 0")
    private Integer totalQuizzes;

    @Column(name = "completed_quizzes", nullable = false, columnDefinition = "INT DEFAULT 0")
    private Integer completedQuizzes;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", insertable = false, updatable = false)
    private User student;

    @PrePersist
    protected void onCreate() {
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
