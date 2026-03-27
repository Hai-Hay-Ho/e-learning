package com.example.demo.repository;

import com.example.demo.model.PostAttachment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface PostAttachmentRepository extends JpaRepository<PostAttachment, UUID> {
    List<PostAttachment> findByPostId(UUID postId);
}
