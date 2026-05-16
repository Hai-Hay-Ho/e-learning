package com.example.demo.controller;

import com.example.demo.model.BannedKeyword;
import com.example.demo.service.BannedKeywordService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;
import java.util.Map;

@RestController
@RequestMapping("/api/banned-keywords")
@CrossOrigin(origins = "*")
public class BannedKeywordController {
    @Autowired
    private BannedKeywordService bannedKeywordService;

    @GetMapping
    public ResponseEntity<List<BannedKeyword>> getAllKeywords() {
        try {
            List<BannedKeyword> keywords = bannedKeywordService.getAllKeywords();
            return ResponseEntity.ok(keywords);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<BannedKeyword> getKeywordById(@PathVariable UUID id) {
        try {
            return bannedKeywordService.getKeywordById(id)
                    .map(ResponseEntity::ok)
                    .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PostMapping
    public ResponseEntity<Map<String, Object>> addKeyword(@RequestBody Map<String, String> request) {
        try {
            String keyword = request.get("keyword");
            String description = request.get("description");

            if (keyword == null || keyword.trim().isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "Vui lòng nhập từ khóa"));
            }

            BannedKeyword newKeyword = bannedKeywordService.addKeyword(keyword, description);
            return ResponseEntity.ok(Map.of(
                    "id", newKeyword.getId(),
                    "keyword", newKeyword.getKeyword(),
                    "description", newKeyword.getDescription(),
                    "created_at", newKeyword.getCreatedAt()
            ));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Lỗi thêm từ khóa: " + e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> deleteKeyword(@PathVariable UUID id) {
        try {
            if (bannedKeywordService.getKeywordById(id).isEmpty()) {
                return ResponseEntity.notFound().build();
            }
            bannedKeywordService.deleteKeyword(id);
            return ResponseEntity.ok(Map.of("message", "Xóa từ khóa thành công"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Lỗi xóa từ khóa: " + e.getMessage()));
        }
    }

    @GetMapping("/check/{keyword}")
    public ResponseEntity<Map<String, Object>> checkKeyword(@PathVariable String keyword) {
        try {
            boolean isBanned = bannedKeywordService.isKeywordBanned(keyword);
            return ResponseEntity.ok(Map.of("keyword", keyword, "isBanned", isBanned));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}
