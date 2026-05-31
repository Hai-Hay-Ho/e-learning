package com.example.demo.repository;

import com.example.demo.model.StudentStats;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface StudentStatsRepository extends JpaRepository<StudentStats, UUID> {
    Optional<StudentStats> findByStudentId(UUID studentId);
}
