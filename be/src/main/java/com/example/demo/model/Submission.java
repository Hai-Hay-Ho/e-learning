package com.example.demo.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

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

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", insertable = false, updatable = false)
    private User student;

    @OneToMany(fetch = FetchType.LAZY)
    @JoinColumn(name = "submission_id", insertable = false, updatable = false)
    private List<SubmissionFile> files;
}
