package com.example.demo.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "user_streaks")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserStreak {
    @Id
    @Column(name = "user_id")
    private UUID userId;

    @Column(name = "streak")
    private int streak;

    @Column(name = "last_active_date")
    private LocalDate lastActiveDate;
}
