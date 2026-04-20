package com.example.demo.service;

import com.example.demo.dto.CommentDTO;
import com.example.demo.dto.PostDTO;
import com.example.demo.model.*;
import com.example.demo.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PostService {
    private final PostRepository postRepository;
    private final PostAttachmentRepository attachmentRepository;
    private final UserRepository userRepository;
    private final AssignmentDeadlineRepository assignmentDeadlineRepository;
    private final CommentRepository commentRepository;
    private final EmailService emailService;

    @Transactional
    public List<PostDTO> createPost(PostDTO postDTO) {
        List<UUID> targetClassIds = postDTO.getTargetClassIds();
        if (targetClassIds == null || targetClassIds.isEmpty()) {
            targetClassIds = Collections.singletonList(postDTO.getClassId());
        }

        // Lấy thông tin giảng viên một lần duy nhất
        User author = userRepository.findById(postDTO.getAuthorId()).orElse(null);
        String teacherName = author != null ? author.getFullName() : "Giảng viên";

        List<PostDTO> createdPosts = new ArrayList<>();
        
        for (UUID classId : targetClassIds) {
            PostEntity post = PostEntity.builder()
                    .classId(classId)
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
            createdPosts.add(getPostDTO(savedPost));

            // Gửi thông báo email cho bất kể loại bài đăng nào
            try {
                List<String> studentEmails = userRepository.findEmailsByClassId(classId);
                String directLink = "http://localhost:3000/?tab=Classes&id=" + classId;
                
                // Xác định nhãn thông báo dựa trên loại bài đăng
                String actionLabel = "vừa đăng một thông báo mới";
                String emailSubject = "[Thông báo] Giảng viên đã đăng một thông báo mới";
                
                if ("assignment".equals(savedPost.getType())) {
                    actionLabel = "vừa đăng một bài tập mới";
                    emailSubject = "[Thông báo] Giảng viên đã đăng một bài tập mới";
                } else if ("material".equals(savedPost.getType())) {
                    actionLabel = "vừa đăng một tài liệu mới";
                    emailSubject = "[Thông báo] Giảng viên đã đăng một tài liệu mới";
                }
                
                emailService.sendNotification(
                    studentEmails, 
                    emailSubject, 
                    teacherName, 
                    actionLabel, 
                    savedPost.getTitle(), 
                    directLink
                );
            } catch (Exception e) {
                System.err.println("Failed to trigger post notification: " + e.getMessage());
            }
        }

        return createdPosts;
    }

    public List<PostDTO> getPostsByClassId(UUID classId) {
        List<PostEntity> posts = postRepository.findByClassIdOrderByCreatedAtDesc(classId);
        if (posts.isEmpty()) return Collections.emptyList();

        List<UUID> postIds = posts.stream().map(PostEntity::getId).collect(Collectors.toList());
        List<UUID> authorIds = posts.stream().map(PostEntity::getAuthorId).distinct().collect(Collectors.toList());

        // Batch fetching to fix N+1 problem
        Map<UUID, User> authorsMap = userRepository.findAllById(authorIds).stream()
                .collect(Collectors.toMap(User::getId, u -> u));
        
        Map<UUID, List<PostAttachment>> attachmentsMap = attachmentRepository.findAllByPostIdIn(postIds).stream()
                .collect(Collectors.groupingBy(PostAttachment::getPostId));

        Map<UUID, AssignmentDeadline> deadlinesMap = assignmentDeadlineRepository.findAllByPostIdIn(postIds).stream()
                .collect(Collectors.toMap(AssignmentDeadline::getPostId, d -> d));

        // For counts and recent comments, we still do a bit of processing but much faster than before
        return posts.stream().map(post -> {
            User author = authorsMap.get(post.getAuthorId());
            List<PostAttachment> attachments = attachmentsMap.getOrDefault(post.getId(), Collections.emptyList());
            AssignmentDeadline deadline = deadlinesMap.get(post.getId());
            
            // Still fetching comments count - could be further optimized with a DB View or complex query
            // but these batch fetches should already bring the 30s down to < 1s.
            long commentCount = commentRepository.countByPostId(post.getId());
            List<Comment> recentComments = commentRepository.findByPostIdOrderByCreatedAtAsc(post.getId(), PageRequest.of(0, 2));

            return convertToDTO(post, author, attachments, deadline, recentComments, commentCount);
        }).collect(Collectors.toList());
    }

    private PostDTO convertToDTO(PostEntity post, User author, List<PostAttachment> attachments, 
                                AssignmentDeadline deadline, List<Comment> recentComments, long commentCount) {
        
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
                .dueAt(deadline != null ? deadline.getDueAt() : null)
                .attachments(attachmentDTOs)
                .comments(commentDTOs)
                .commentCount(commentCount)
                .build();
    }

    private PostDTO getPostDTO(PostEntity post) {
        User author = userRepository.findById(post.getAuthorId()).orElse(null);
        List<PostAttachment> attachments = attachmentRepository.findByPostId(post.getId());
        Optional<AssignmentDeadline> deadline = assignmentDeadlineRepository.findByPostId(post.getId());
        List<Comment> recentComments = commentRepository.findByPostIdOrderByCreatedAtAsc(post.getId(), PageRequest.of(0, 2));
        long commentCount = commentRepository.countByPostId(post.getId());
        
        return convertToDTO(post, author, attachments, deadline.orElse(null), recentComments, commentCount);
    }

    @Transactional
    public PostDTO updatePost(UUID postId, PostDTO postDTO) {
        PostEntity post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found"));

        post.setType(postDTO.getType());
        post.setTitle(postDTO.getTitle());
        post.setContent(postDTO.getContent());
        
        postRepository.save(post);

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
}
