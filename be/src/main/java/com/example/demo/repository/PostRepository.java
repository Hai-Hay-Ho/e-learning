package com.example.demo.repository;

import com.example.demo.model.PostEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface PostRepository extends JpaRepository<PostEntity, UUID> {
    List<PostEntity> findByClassIdOrderByCreatedAtDesc(UUID classId);
    long countByClassIdInAndType(List<UUID> classIds, String type);
    List<PostEntity> findByClassIdInAndType(List<UUID> classIds, String type);
}
