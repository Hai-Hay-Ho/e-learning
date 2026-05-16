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
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
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

    @Transactional(readOnly = true)
    public List<ClassDTO> getClassesByTeacher(UUID teacherId) {
        List<ClassEntity> classes = classRepository.findByTeacherId(teacherId);
        if (classes.isEmpty()) return List.of();
        
        // Teacher info is the same for all these classes
        User teacher = userRepository.findById(teacherId).orElse(null);
        String name = teacher != null ? teacher.getFullName() : "Unknown";
        String avatar = teacher != null ? teacher.getAvatarUrl() : null;
        
        return classes.stream().map(c -> ClassDTO.builder()
                .id(c.getId())
                .name(c.getName())
                .teacherId(c.getTeacherId())
                .teacherName(name)
                .teacherAvatar(avatar)
                .joinCode(c.getJoinCode())
                .isHidden(c.getIsHidden())
                .createdAt(c.getCreatedAt())
                .build()).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ClassDTO> getClassesByStudent(UUID studentId) {
        List<ClassMember> memberships = classMemberRepository.findByStudentId(studentId);
        if (memberships.isEmpty()) return List.of();
        
        List<UUID> classIds = memberships.stream().map(ClassMember::getClassId).collect(Collectors.toList());
        List<ClassEntity> classes = classRepository.findAllById(classIds);
        
        // Lọc ra các lớp không bị ẩn
        List<ClassEntity> visibleClasses = classes.stream()
                .filter(c -> !Boolean.TRUE.equals(c.getIsHidden()))
                .collect(Collectors.toList());
        
        List<UUID> teacherIds = visibleClasses.stream().map(ClassEntity::getTeacherId).distinct().collect(Collectors.toList());
        Map<UUID, User> teachersMap = userRepository.findAllById(teacherIds).stream()
                .collect(Collectors.toMap(User::getId, u -> u));
        
        return visibleClasses.stream().map(c -> {
            User teacher = teachersMap.get(c.getTeacherId());
            return ClassDTO.builder()
                .id(c.getId())
                .name(c.getName())
                .teacherId(c.getTeacherId())
                .teacherName(teacher != null ? teacher.getFullName() : "Unknown")
                .teacherAvatar(teacher != null ? teacher.getAvatarUrl() : null)
                .joinCode(c.getJoinCode())
                .isHidden(c.getIsHidden())
                .createdAt(c.getCreatedAt())
                .build();
        }).collect(Collectors.toList());
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
                .isHidden(entity.getIsHidden())
                .createdAt(entity.getCreatedAt())
                .build();
    }
    
    @Transactional
    public void removeStudentFromClass(UUID studentId, UUID classId) {
        classMemberRepository.deleteByStudentIdAndClassId(studentId, classId);
    }

    @Transactional
    public void toggleHideClass(UUID classId) {
        ClassEntity classEntity = classRepository.findById(classId)
                .orElseThrow(() -> new RuntimeException("Lớp học không tồn tại"));
        classEntity.setIsHidden(!classEntity.getIsHidden());
        classRepository.save(classEntity);
    }

    @Transactional
    public void deleteClass(UUID classId) {
        // Xóa tất cả thành viên lớp
        List<ClassMember> members = classMemberRepository.findByClassId(classId);
        classMemberRepository.deleteAll(members);
        
        // Xóa lớp
        classRepository.deleteById(classId);
    }

    @Transactional(readOnly = true)
    public List<User> getClassMembers(UUID classId) {
        List<ClassMember> members = classMemberRepository.findByClassId(classId);
        List<UUID> studentIds = members.stream().map(ClassMember::getStudentId).collect(Collectors.toList());
        return userRepository.findAllById(studentIds);
    }

    @Transactional(readOnly = true)
    public List<ClassDTO> getAllClasses() {
        List<ClassEntity> allClasses = classRepository.findAll();
        
        List<UUID> teacherIds = allClasses.stream().map(ClassEntity::getTeacherId).distinct().collect(Collectors.toList());
        Map<UUID, User> teachersMap = userRepository.findAllById(teacherIds).stream()
                .collect(Collectors.toMap(User::getId, u -> u));
        
        return allClasses.stream().map(c -> {
            User teacher = teachersMap.get(c.getTeacherId());
            return ClassDTO.builder()
                .id(c.getId())
                .name(c.getName())
                .teacherId(c.getTeacherId())
                .teacherName(teacher != null ? teacher.getFullName() : "Unknown")
                .teacherAvatar(teacher != null ? teacher.getAvatarUrl() : null)
                .joinCode(c.getJoinCode())
                .isHidden(c.getIsHidden())
                .createdAt(c.getCreatedAt())
                .build();
        }).collect(Collectors.toList());
    }

    // logic to join class can be expanded here with a class_members table
}
