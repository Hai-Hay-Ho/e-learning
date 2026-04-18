package com.example.demo.model;

import jakarta.persistence.*;
import lombok.Data;
import java.util.UUID;
import com.fasterxml.jackson.annotation.JsonIgnore;

@Data
@Entity
@Table(name = "student_answers")
public class StudentAnswer {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "attempt_id")
    @JsonIgnore
    private QuizAttempt attempt;

    @Column(name = "question_id")
    private UUID questionId;

    @Column(name = "selected_answer_id")
    private UUID selectedAnswerId;

    @Column(name = "is_correct")
    private Boolean isCorrect;
}
