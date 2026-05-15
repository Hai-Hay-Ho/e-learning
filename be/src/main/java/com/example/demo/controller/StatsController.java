package com.example.demo.controller;

import com.example.demo.dto.ClassStatsDTO;
import com.example.demo.dto.RecentUserDTO;
import com.example.demo.dto.SystemActivityDTO;
import com.example.demo.dto.SystemStatsDTO;
import com.example.demo.dto.TeacherStatsDTO;
import com.example.demo.service.StatsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/stats")
@RequiredArgsConstructor
@CrossOrigin(origins = "*", allowedHeaders = "*")
public class StatsController {
    private final StatsService statsService;

    @GetMapping("/teacher/{teacherId}")
    public ResponseEntity<TeacherStatsDTO> getTeacherStats(@PathVariable UUID teacherId) {
        return ResponseEntity.ok(statsService.getTeacherStats(teacherId));
    }

    @GetMapping("/class/{classId}")
    public ResponseEntity<ClassStatsDTO> getClassStats(@PathVariable UUID classId) {
        return ResponseEntity.ok(statsService.getClassStats(classId));
    }

    @GetMapping("/system")
    public ResponseEntity<SystemStatsDTO> getSystemStats() {
        return ResponseEntity.ok(statsService.getSystemStats());
    }

    @GetMapping("/recent-users")
    public ResponseEntity<List<RecentUserDTO>> getRecentUsers() {
        return ResponseEntity.ok(statsService.getRecentUsers());
    }

    @GetMapping("/system-activity")
    public ResponseEntity<List<SystemActivityDTO>> getSystemActivity() {
        return ResponseEntity.ok(statsService.getSystemActivity());
    }
}
