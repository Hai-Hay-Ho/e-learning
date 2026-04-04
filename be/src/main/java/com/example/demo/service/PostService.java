package com.example.demo.service;

import com.example.demo.dto.CommentDTO;
import com.example.demo.dto.PostDTO;
import com.example.demo.model.*;
import com.example.demo.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PostService {
    private final PostRepository postRepository;
    private final PostAttachmentRepository attachmentRepository;
    private final UserRepository userRepository;
    private final AssignmentDeadlineRepository assignmentDeadlineRepository;
    private final CommentRepository commentRepository;

    @Transactional
    public PostDTO createPost(PostDTO postDTO) {
        PostEntity post = PostEntity.builder()
                .classId(postDTO.getClassId())
                .authorId(postDTO.getAuthorId())
                .type(postDTO.getType())
                .title(postDTO.getTitle())
                .content(postDTO.getContent())
                .createdAt(java.time.LocalDateTime.now())
                .build();

        PostEntity savedPost = postRepository.save(post);

        if ("assignment".equals(postDTO.getType()) && postDTO.getDueAt() != null) {
            AssignmentDeadline deadline = AssignmentDeadline.builder()
                    .postId(savedPost.getId())
                    .dueAt(postDTO.getDueAt())
                    .build();
            assignmentDeadlineRepository.save(deadline);
        }

        if (postDTO.getAttachments() != null) {
            List<PostAttachment> attachments = postDTO.getAttachments().stream()
                    .map(att -> PostAttachment.builder()
                            .postId(savedPost.getId())
                            .fileUrl(att.getFileUrl())
                            .fileName(att.getFileName())
                            .fileType(att.getFileType())
                            .fileSize(att.getFileSize())
                            .build())
                    .collect(Collectors.toList());
            attachmentRepository.saveAll(attachments);
        }

        return getPostDTO(savedPost);
    }

    public List<PostDTO> getPostsByClassId(UUID classId) {
        return postRepository.findByClassIdOrderByCreatedAtDesc(classId).stream()
                .map(this::getPostDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public PostDTO updatePost(UUID postId, PostDTO postDTO) {
        PostEntity post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found"));

        post.setType(postDTO.getType());
        post.setTitle(postDTO.getTitle());
        post.setContent(postDTO.getContent());
        
        postRepository.save(post);

        // Update deadline if assignment
        if ("assignment".equals(post.getType())) {
            Optional<AssignmentDeadline> deadlineOpt = assignmentDeadlineRepository.findByPostId(postId);
            if (postDTO.getDueAt() != null) {
                AssignmentDeadline deadline = deadlineOpt.orElseGet(() -> 
                    AssignmentDeadline.builder().postId(postId).build());
                deadline.setDueAt(postDTO.getDueAt());
                assignmentDeadlineRepository.save(deadline);
            } else {
                deadlineOpt.ifPresent(assignmentDeadlineRepository::delete);
            }
        }

        // Update attachments: simpler way is to delete and recreate
        attachmentRepository.deleteByPostId(postId);
        if (postDTO.getAttachments() != null) {
            List<PostAttachment> attachments = postDTO.getAttachments().stream()
                    .map(att -> PostAttachment.builder()
                            .postId(post.getId())
                            .fileUrl(att.getFileUrl())
                            .fileName(att.getFileName())
                            .fileType(att.getFileType())
                            .fileSize(att.getFileSize())
                            .build())
                    .collect(Collectors.toList());
            attachmentRepository.saveAll(attachments);
        }

        return getPostDTO(post);
    }

    @Transactional
    public void deletePost(UUID postId) {
        attachmentRepository.deleteByPostId(postId);
        assignmentDeadlineRepository.deleteByPostId(postId);
        postRepository.deleteById(postId);
    }

    private PostDTO getPostDTO(PostEntity post) {
        User author = userRepository.findById(post.getAuthorId()).orElse(null);
        List<PostAttachment> attachments = attachmentRepository.findByPostId(post.getId());
        Optional<AssignmentDeadline> deadline = assignmentDeadlineRepository.findByPostId(post.getId());
        
        // Fetch last 2 comments for feed view
        List<Comment> recentComments = commentRepository.findByPostIdOrderByCreatedAtAsc(post.getId(), PageRequest.of(0, 2));
        long commentCount = commentRepository.countByPostId(post.getId());

        List<PostDTO.AttachmentDTO> attachmentDTOs = attachments.stream()
                .map(att -> PostDTO.AttachmentDTO.builder()
                        .id(att.getId())
                        .fileUrl(att.getFileUrl())
                        .fileName(att.getFileName())
                        .fileType(att.getFileType())
                        .fileSize(att.getFileSize())
                        .build())
                .collect(Collectors.toList());

        List<CommentDTO> commentDTOs = recentComments.stream()
                .map(comment -> CommentDTO.builder()
                        .id(comment.getId())
                        .postId(post.getId())
                        .userId(comment.getUser().getId())
                        .userName(comment.getUser().getFullName())
                        .userAvatar(comment.getUser().getAvatarUrl())
                        .content(comment.getContent())
                        .createdAt(comment.getCreatedAt())
                        .build())
                .collect(Collectors.toList());

        return PostDTO.builder()
                .id(post.getId())
                .classId(post.getClassId())
                .authorId(post.getAuthorId())
                .authorName(author != null ? author.getFullName() : "Unknown")
                .authorAvatar(author != null ? author.getAvatarUrl() : null)
                .type(post.getType())
                .title(post.getTitle())
                .content(post.getContent())
                .createdAt(post.getCreatedAt())
                .dueAt(deadline.map(AssignmentDeadline::getDueAt).orElse(null))
                .attachments(attachmentDTOs)
                .comments(commentDTOs)
                .commentCount(commentCount)
                .build();
    }
}
