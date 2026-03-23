package com.example.demo.service;

import com.example.demo.dto.ClassDTO;
import com.example.demo.model.ClassEntity;
import com.example.demo.model.User;
import com.example.demo.repository.ClassRepository;
import com.example.demo.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class ClassService {

    @Autowired
    private ClassRepository classRepository;

    @Autowired
    private UserRepository userRepository;

    public ClassEntity createClass(ClassEntity classEntity) {
        return classRepository.save(classEntity);
    }

    public List<ClassDTO> getClassesByTeacher(UUID teacherId) {
        List<ClassEntity> classes = classRepository.findByTeacherId(teacherId);
        return classes.stream().map(this::convertToDTO).collect(Collectors.toList());
    }

    public Optional<ClassEntity> findByJoinCode(String joinCode) {
        return classRepository.findByJoinCode(joinCode);
    }

    private ClassDTO convertToDTO(ClassEntity entity) {
        User teacher = userRepository.findById(entity.getTeacherId()).orElse(null);
        
        String teacherName = "";
        String teacherAvatar = null;

        if (teacher != null) {
            teacherName = teacher.getFullName();
            teacherAvatar = teacher.getAvatarUrl();
        } 

        return ClassDTO.builder()
                .id(entity.getId())
                .name(entity.getName())
                .teacherId(entity.getTeacherId())
                .teacherName(teacherName)
                .teacherAvatar(teacherAvatar)
                .joinCode(entity.getJoinCode())
                .createdAt(entity.getCreatedAt())
                .build();
    }
    
    // logic to join class can be expanded here with a class_members table
}
