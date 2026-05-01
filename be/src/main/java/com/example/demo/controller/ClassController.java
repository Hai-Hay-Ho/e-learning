package com.example.demo.controller;

import com.example.demo.dto.ClassDTO;
import com.example.demo.model.ClassEntity;
import com.example.demo.service.ClassService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/api/classes")
@CrossOrigin(origins = "*", allowedHeaders = "*") // Cho phép tất cả các nguồn và header để fix lỗi CORS
public class ClassController {

    @Autowired
    private ClassService classService;

    @PostMapping("/create")
    public ResponseEntity<?> createClass(@RequestBody ClassEntity classEntity) {
        try {
            ClassEntity createdClass = classService.createClass(classEntity);
            return ResponseEntity.ok(createdClass);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", "Không thể tạo lớp: " + e.getMessage()));
        }
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<ClassDTO>> getClasses(@PathVariable UUID userId, @RequestParam(required = false) String role) {
        List<ClassDTO> classes;
        if ("1".equals(role)) {
            classes = classService.getClassesByTeacher(userId);
        } else {
            classes = classService.getClassesByStudent(userId);
        }
        return ResponseEntity.ok(classes);
    }

    @PostMapping("/join")
    public ResponseEntity<?> joinClass(@RequestBody Map<String, String> payload) {
        String joinCode = payload.get("join_code");
        String studentIdStr = payload.get("student_id");
        
        if (joinCode == null || studentIdStr == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "Thiếu mã join code hoặc ID sinh viên."));
        }

        try {
            UUID studentId = UUID.fromString(studentIdStr);
            Optional<ClassEntity> classOpt = classService.findByJoinCode(joinCode);
            
            if (classOpt.isPresent()) {
                classService.joinClass(studentId, classOpt.get().getId());
                return ResponseEntity.ok(Map.of("message", "Tham gia thành công lớp " + classOpt.get().getName()));
            } else {
                return ResponseEntity.badRequest().body(Map.of("message", "Mã join code không tồn tại."));
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }
    @DeleteMapping("/{classId}/students/{studentId}")
    public ResponseEntity<?> removeStudent(@PathVariable UUID classId, @PathVariable UUID studentId) {
        try {
            classService.removeStudentFromClass(studentId, classId);
            return ResponseEntity.ok(Map.of("message", "Đã xóa học sinh ra khỏi lớp."));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }
}
