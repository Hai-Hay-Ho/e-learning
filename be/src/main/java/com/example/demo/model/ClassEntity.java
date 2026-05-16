package com.example.demo.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import com.fasterxml.jackson.annotation.JsonProperty;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "classes")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ClassEntity {
    @Id
    @GeneratedValue(generator = "UUID")
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    @Column(nullable = false)
    private String name;

    @Column(name = "teacher_id", nullable = false)
    private UUID teacherId;

    @Column(name = "join_code", unique = true, nullable = false, length = 20)
    private String joinCode;

    @Column(name = "is_hidden", nullable = false, columnDefinition = "boolean default false")
    @JsonProperty(defaultValue = "false")
    @Builder.Default
    private Boolean isHidden = false;

    @Column(name = "created_at", insertable = false, updatable = false)
    private LocalDateTime createdAt;
}
