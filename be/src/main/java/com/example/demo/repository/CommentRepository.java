package com.example.demo.repository;

import com.example.demo.model.Comment;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.UUID;

@Repository
public interface CommentRepository extends JpaRepository<Comment, UUID> {
    List<Comment> findByPostIdOrderByCreatedAtDesc(UUID postId);
    List<Comment> findByPostIdOrderByCreatedAtAsc(UUID postId, Pageable pageable);
    long countByPostId(UUID postId);
}
