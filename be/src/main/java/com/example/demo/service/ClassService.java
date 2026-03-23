package com.example.demo.service;

import com.example.demo.dto.ClassDTO;
import com.example.demo.model.ClassEntity;
import com.example.demo.model.ClassMember;
import com.example.demo.model.User;
import com.example.demo.repository.ClassMemberRepository;
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

    @Autowired
    private ClassMemberRepository classMemberRepository;

    public ClassEntity createClass(ClassEntity classEntity) {
        return classRepository.save(classEntity);
    }

    public List<ClassDTO> getClassesByTeacher(UUID teacherId) {
        List<ClassEntity> classes = classRepository.findByTeacherId(teacherId);
        return classes.stream().map(this::convertToDTO).collect(Collectors.toList());
    }

    public List<ClassDTO> getClassesByStudent(UUID studentId) {
        List<ClassMember> memberships = classMemberRepository.findByStudentId(studentId);
        return memberships.stream()
                .map(member -> classRepository.findById(member.getClassId()))
                .filter(Optional::isPresent)
                .map(Optional::get)
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public Optional<ClassEntity> findByJoinCode(String joinCode) {
        return classRepository.findByJoinCode(joinCode);
    }

    public void joinClass(UUID studentId, UUID classId) throws Exception {
        Optional<ClassMember> existing = classMemberRepository.findByStudentIdAndClassId(studentId, classId);
        if (existing.isPresent()) {
            throw new Exception("Bạn đã tham gia lớp học này rồi.");
        }
        
        ClassMember member = ClassMember.builder()
                .studentId(studentId)
                .classId(classId)
                .build();
        classMemberRepository.save(member);
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
