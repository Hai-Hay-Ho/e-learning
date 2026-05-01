package com.example.demo.repository;

import com.example.demo.model.ClassMember;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ClassMemberRepository extends JpaRepository<ClassMember, UUID> {
    List<ClassMember> findByStudentId(UUID studentId);
    Optional<ClassMember> findByStudentIdAndClassId(UUID studentId, UUID classId);
    long countByClassId(UUID classId);
    List<ClassMember> findByClassId(UUID classId);
}
