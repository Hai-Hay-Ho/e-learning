package com.example.demo.controller;

import com.example.demo.dto.SubmissionDTO;
import com.example.demo.service.SubmissionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/submissions")
@CrossOrigin(origins = "http://localhost:3000")
public class SubmissionController {
    @Autowired
    private SubmissionService submissionService;

    @PostMapping
    public ResponseEntity<SubmissionDTO> submit(@RequestBody SubmissionDTO dto) {
        return ResponseEntity.ok(submissionService.submitAssignment(dto));
    }

    @GetMapping("/post/{postId}")
    public ResponseEntity<List<SubmissionDTO>> getByPost(@PathVariable UUID postId) {
        return ResponseEntity.ok(submissionService.getSubmissionsByPost(postId));
    }

    @GetMapping("/post/{postId}/user/{userId}")
    public ResponseEntity<SubmissionDTO> getByPostAndUser(@PathVariable UUID postId, @PathVariable UUID userId) {
        return ResponseEntity.ok(submissionService.getSubmissionByPostAndUser(postId, userId));
    }

    @PutMapping("/{id}/grade")
    public ResponseEntity<SubmissionDTO> grade(@PathVariable UUID id, @RequestParam BigDecimal score) {
        return ResponseEntity.ok(submissionService.gradeSubmission(id, score));
    }

    @DeleteMapping("/files/{fileId}")
    public ResponseEntity<Void> deleteFile(@PathVariable UUID fileId) {
        submissionService.deleteFile(fileId);
        return ResponseEntity.ok().build();
    }
}
