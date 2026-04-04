package com.example.demo.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "submissions")
@Data
public class Submission {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private java.util.UUID id;

    @Column(name = "post_id", nullable = false)
    private java.util.UUID postId;

    @Column(name = "student_id", nullable = false)
    private java.util.UUID studentId;

    @Column(length = 20)
    private String status = "submitted"; // submitted, late, graded

    @Column(precision = 5, scale = 2)
    private java.math.BigDecimal score;

    @Column(name = "submitted_at")
    private LocalDateTime submittedAt = LocalDateTime.now();

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();
}
