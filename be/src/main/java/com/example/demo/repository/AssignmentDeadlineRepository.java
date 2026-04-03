package com.example.demo.repository;

import com.example.demo.model.AssignmentDeadline;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface AssignmentDeadlineRepository extends JpaRepository<AssignmentDeadline, UUID> {
    Optional<AssignmentDeadline> findByPostId(UUID postId);
    void deleteByPostId(UUID postId);
}
