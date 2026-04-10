package com.example.demo.service;

import com.example.demo.dto.SubmissionDTO;
import com.example.demo.model.Submission;
import com.example.demo.model.SubmissionFile;
import com.example.demo.repository.SubmissionFileRepository;
import com.example.demo.repository.SubmissionRepository;
import com.example.demo.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class SubmissionService {
    @Autowired
    private SubmissionRepository submissionRepository;
    @Autowired
    private SubmissionFileRepository submissionFileRepository;
    @Autowired
    private UserRepository userRepository;

    @Transactional
    public SubmissionDTO submitAssignment(SubmissionDTO dto) {
        Optional<Submission> existing = submissionRepository.findByPostIdAndStudentId(dto.getPostId(), dto.getStudentId());
        
        final Submission sub;
        if (existing.isPresent()) {
            sub = existing.get();
            sub.setSubmittedAt(LocalDateTime.now());
        } else {
            sub = new Submission();
            sub.setPostId(dto.getPostId());
            sub.setStudentId(dto.getStudentId());
        }
        
        submissionRepository.save(sub);
        
        if (dto.getFiles() != null) {
            for (SubmissionDTO.SubmissionFileDTO fileDto : dto.getFiles()) {
                SubmissionFile file = new SubmissionFile();
                file.setSubmissionId(sub.getId());
                file.setFileUrl(fileDto.getFileUrl());
                file.setFileName(fileDto.getFileName());
                submissionFileRepository.save(file);
            }
        }
        
        return getSubmissionById(sub.getId());
    }

    @Transactional
    public void deleteFile(UUID fileId) {
        Optional<SubmissionFile> fileOpt = submissionFileRepository.findById(fileId);
        if (fileOpt.isPresent()) {
            UUID submissionId = fileOpt.get().getSubmissionId();
            submissionFileRepository.deleteById(fileId);
            
            // Check if there are any files left
            List<SubmissionFile> remainingFiles = submissionFileRepository.findBySubmissionId(submissionId);
            if (remainingFiles.isEmpty()) {
                submissionRepository.deleteById(submissionId);
            }
        }
    }

    public List<SubmissionDTO> getSubmissionsByPost(UUID postId) {
        return submissionRepository.findByPostId(postId).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public SubmissionDTO getSubmissionByPostAndUser(UUID postId, UUID userId) {
        return submissionRepository.findByPostIdAndStudentId(postId, userId)
                .map(this::mapToDTO)
                .orElse(null);
    }

    public SubmissionDTO getSubmissionById(UUID id) {
        return submissionRepository.findById(id).map(this::mapToDTO).orElse(null);
    }

    private SubmissionDTO mapToDTO(Submission sub) {
        SubmissionDTO dto = new SubmissionDTO();
        dto.setId(sub.getId());
        dto.setPostId(sub.getPostId());
        dto.setStudentId(sub.getStudentId());
        dto.setStatus(sub.getStatus());
        dto.setScore(sub.getScore());
        dto.setSubmittedAt(sub.getSubmittedAt());

        if (sub.getStudent() != null) {
            dto.setStudentName(sub.getStudent().getFullName());
            dto.setStudentAvatar(sub.getStudent().getAvatarUrl());
        }

        if (sub.getFiles() != null) {
            List<SubmissionDTO.SubmissionFileDTO> files = sub.getFiles().stream()
                    .map(f -> {
                        SubmissionDTO.SubmissionFileDTO fDto = new SubmissionDTO.SubmissionFileDTO();
                        fDto.setId(f.getId());
                        fDto.setFileUrl(f.getFileUrl());
                        fDto.setFileName(f.getFileName());
                        return fDto;
                    }).collect(Collectors.toList());
            dto.setFiles(files);
        }
        return dto;
    }

    @Transactional
    public SubmissionDTO gradeSubmission(UUID id, BigDecimal score) {
        Submission sub = submissionRepository.findById(id).orElseThrow();
        sub.setScore(score);
        sub.setStatus("graded");
        return mapToDTO(submissionRepository.save(sub));
    }
}
