package com.example.demo.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "message_edits")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MessageEdit {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @ManyToOne
    @JoinColumn(name = "message_id")
    private Message message;

    @Column(columnDefinition = "TEXT", name = "old_content")
    private String oldContent;

    @Column(name = "edited_at", insertable = false, updatable = false)
    private LocalDateTime editedAt;
}
