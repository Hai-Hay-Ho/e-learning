package com.example.demo.controller;

import com.example.demo.model.User;
import com.example.demo.service.UserService;
import com.example.demo.dto.UserDetailDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class UserController {

    private final UserService userService;

    @GetMapping
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }

    @GetMapping("/{userId}")
    public ResponseEntity<UserDetailDTO> getUserDetail(@PathVariable UUID userId) {
        return ResponseEntity.ok(userService.getUserDetail(userId));
    }

    @PutMapping("/{userId}/status")
    public ResponseEntity<User> updateUserStatus(@PathVariable UUID userId, @RequestBody StatusUpdateRequest request) {
        return ResponseEntity.ok(userService.updateUserStatus(userId, request.getStatus()));
    }

    @PutMapping("/{userId}/role")
    public ResponseEntity<User> updateUserRole(@PathVariable UUID userId, @RequestBody RoleUpdateRequest request) {
        return ResponseEntity.ok(userService.updateUserRole(userId, request.getAction()));
    }

    @GetMapping("/{userId}/classes")
    public ResponseEntity<?> getUserClasses(@PathVariable UUID userId) {
        return ResponseEntity.ok(userService.getUserClasses(userId));
    }

    @lombok.Data
    public static class StatusUpdateRequest {
        private Integer status;
    }

    @lombok.Data
    public static class RoleUpdateRequest {
        private String action; // "promote" or "demote"
    }
}
