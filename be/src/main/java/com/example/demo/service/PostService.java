package com.example.demo.service;

import com.example.demo.dto.PostDTO;
import com.example.demo.model.PostAttachment;
import com.example.demo.model.PostEntity;
import com.example.demo.model.User;
import com.example.demo.repository.PostAttachmentRepository;
import com.example.demo.repository.PostRepository;
import com.example.demo.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PostService {
    private final PostRepository postRepository;
    private final PostAttachmentRepository attachmentRepository;
    private final UserRepository userRepository;

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

    private PostDTO getPostDTO(PostEntity post) {
        User author = userRepository.findById(post.getAuthorId()).orElse(null);
        List<PostAttachment> attachments = attachmentRepository.findByPostId(post.getId());

        List<PostDTO.AttachmentDTO> attachmentDTOs = attachments.stream()
                .map(att -> PostDTO.AttachmentDTO.builder()
                        .id(att.getId())
                        .fileUrl(att.getFileUrl())
                        .fileName(att.getFileName())
                        .fileType(att.getFileType())
                        .fileSize(att.getFileSize())
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
                .attachments(attachmentDTOs)
                .build();
    }
}
