package com.example.demo.repository;

import com.example.demo.model.Submission;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface SubmissionRepository extends JpaRepository<Submission, UUID> {
    @EntityGraph(attributePaths = {"student", "files"})
    List<Submission> findByPostId(UUID postId);

    @EntityGraph(attributePaths = {"student", "files"})
    Optional<Submission> findByPostIdAndStudentId(UUID postId, UUID studentId);

    @EntityGraph(attributePaths = {"student", "files"})
    List<Submission> findByStudentId(UUID studentId);

    long countByPostIdInAndScoreIsNull(List<UUID> postIds);
    long countByPostIdInAndCreatedAtAfter(List<UUID> postIds, LocalDateTime date);
    List<Submission> findByPostIdIn(List<UUID> postIds);
}
