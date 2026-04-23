package com.example.demo.repository;

import com.example.demo.model.Quiz;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.UUID;
import java.util.List;

public interface QuizRepository extends JpaRepository<Quiz, UUID> {
    List<Quiz> findByClassId(UUID classId);
    long countByClassIdIn(List<UUID> classIds);
    List<Quiz> findByClassIdIn(List<UUID> classIds);
}
