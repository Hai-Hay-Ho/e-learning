package com.example.demo.repository;

import com.example.demo.model.Submission;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface SubmissionRepository extends JpaRepository<Submission, UUID> {
    List<Submission> findByPostId(UUID postId);
    Optional<Submission> findByPostIdAndStudentId(UUID postId, UUID studentId);
}
