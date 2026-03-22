package com.example.demo.service;

import com.example.demo.model.ClassEntity;
import com.example.demo.repository.ClassRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class ClassService {

    @Autowired
    private ClassRepository classRepository;

    public ClassEntity createClass(ClassEntity classEntity) {
        return classRepository.save(classEntity);
    }

    public List<ClassEntity> getClassesByTeacher(UUID teacherId) {
        return classRepository.findByTeacherId(teacherId);
    }

    public Optional<ClassEntity> findByJoinCode(String joinCode) {
        return classRepository.findByJoinCode(joinCode);
    }
    
    // logic to join class can be expanded here with a class_members table
}
