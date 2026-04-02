package com.example.demo.controller;

import com.example.demo.dto.PostDTO;
import com.example.demo.service.PostService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/posts")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class PostController {
    private final PostService postService;

    @PostMapping
    public ResponseEntity<PostDTO> createPost(@RequestBody PostDTO postDTO) {
        return ResponseEntity.ok(postService.createPost(postDTO));
    }

    @GetMapping("/class/{classId}")
    public ResponseEntity<List<PostDTO>> getPostsByClass(@PathVariable UUID classId) {
        return ResponseEntity.ok(postService.getPostsByClassId(classId));
    }

    @PutMapping("/{postId}")
    public ResponseEntity<PostDTO> updatePost(@PathVariable UUID postId, @RequestBody PostDTO postDTO) {
        return ResponseEntity.ok(postService.updatePost(postId, postDTO));
    }

    @DeleteMapping("/{postId}")
    public ResponseEntity<Void> deletePost(@PathVariable UUID postId) {
        postService.deletePost(postId);
        return ResponseEntity.ok().build();
    }
}
