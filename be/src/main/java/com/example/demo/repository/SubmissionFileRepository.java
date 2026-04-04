package com.example.demo.repository;

import com.example.demo.model.SubmissionFile;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface SubmissionFileRepository extends JpaRepository<SubmissionFile, UUID> {
    List<SubmissionFile> findBySubmissionId(UUID submissionId);
}
