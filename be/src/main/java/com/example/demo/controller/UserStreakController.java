package com.example.demo.controller;

import com.example.demo.model.UserStreak;
import com.example.demo.service.UserStreakService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/streaks")
@RequiredArgsConstructor
@CrossOrigin(origins = "*") // Adjust if needed
public class UserStreakController {

    private final UserStreakService userStreakService;

    @PostMapping("/{userId}/update")
    public ResponseEntity<UserStreak> updateStreak(@PathVariable UUID userId) {
        return ResponseEntity.ok(userStreakService.updateStreak(userId));
    }

    @GetMapping("/{userId}")
    public ResponseEntity<UserStreak> getStreak(@PathVariable UUID userId) {
        return ResponseEntity.ok(userStreakService.getStreak(userId));
    }
}
