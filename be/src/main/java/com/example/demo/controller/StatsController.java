package com.example.demo.controller;

import com.example.demo.dto.TeacherStatsDTO;
import com.example.demo.service.StatsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

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
}
