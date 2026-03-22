package com.example.demo.repository;

import com.example.demo.model.ClassEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ClassRepository extends JpaRepository<ClassEntity, UUID> {
    Optional<ClassEntity> findByJoinCode(String joinCode);
    List<ClassEntity> findByTeacherId(UUID teacherId);
}
