package com.example.demo.service;

import com.example.demo.dto.SubmissionDTO;
import com.example.demo.model.AssignmentDeadline;
import com.example.demo.model.Submission;
import com.example.demo.model.SubmissionFile;
import com.example.demo.repository.AssignmentDeadlineRepository;
import com.example.demo.repository.SubmissionFileRepository;
import com.example.demo.repository.SubmissionRepository;
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
    private AssignmentDeadlineRepository assignmentDeadlineRepository;

    @Transactional
    public SubmissionDTO submitAssignment(SubmissionDTO dto) {
        Optional<Submission> existing = submissionRepository.findByPostIdAndStudentId(dto.getPostId(), dto.getStudentId());
        
        final Submission sub;
        if (existing.isPresent()) {
            sub = existing.get();
            // Nộp bổ sung giữ nguyên submission, chỉ thêm file
        } else {
            sub = new Submission();
            sub.setPostId(dto.getPostId());
            sub.setStudentId(dto.getStudentId());
            submissionRepository.save(sub); 
        }
        
        // Thêm các file mới
        if (dto.getFiles() != null && !dto.getFiles().isEmpty()) {
            for (SubmissionDTO.SubmissionFileDTO fileDto : dto.getFiles()) {
                SubmissionFile file = new SubmissionFile();
                file.setSubmissionId(sub.getId());
                file.setFileUrl(fileDto.getFileUrl());
                file.setFileName(fileDto.getFileName());
                file.setUploadedAt(LocalDateTime.now());
                submissionFileRepository.save(file);
            }
        }
        List<SubmissionFile> allFiles = submissionFileRepository.findBySubmissionId(sub.getId());
        if (!allFiles.isEmpty()) {
            // Lấy file upload sau cùng
            LocalDateTime latestUploadTime = allFiles.stream()
                .max((f1, f2) -> f1.getUploadedAt().compareTo(f2.getUploadedAt()))
                .map(SubmissionFile::getUploadedAt)
                .orElse(LocalDateTime.now());
            sub.setSubmittedAt(latestUploadTime);
            
            // Tính status dựa trên deadline
            String newStatus = calculateStatus(sub.getPostId(), latestUploadTime);
            sub.setStatus(newStatus);
        }
        
        submissionRepository.save(sub);
        return getSubmissionById(sub.getId());
    }

    @Transactional
    public void deleteFile(UUID fileId) {
        Optional<SubmissionFile> fileOpt = submissionFileRepository.findById(fileId);
        if (fileOpt.isPresent()) {
            UUID submissionId = fileOpt.get().getSubmissionId();
            submissionFileRepository.deleteById(fileId);
            
            List<SubmissionFile> remainingFiles = submissionFileRepository.findBySubmissionId(submissionId);
            if (remainingFiles.isEmpty()) {
                submissionRepository.deleteById(submissionId);
            } else {
                // Còn file -> cập nhật submittedAt = file upload sau cùng
                Submission sub = submissionRepository.findById(submissionId).orElseThrow();
                
                LocalDateTime latestUploadTime = remainingFiles.stream()
                    .max((f1, f2) -> f1.getUploadedAt().compareTo(f2.getUploadedAt()))
                    .map(SubmissionFile::getUploadedAt)
                    .orElse(LocalDateTime.now());
                
                sub.setSubmittedAt(latestUploadTime);
                String newStatus = calculateStatus(sub.getPostId(), latestUploadTime);
                sub.setStatus(newStatus);
                
                submissionRepository.save(sub);
            }
        }
    }

    private String calculateStatus(UUID postId, LocalDateTime submittedAt) {
        Optional<AssignmentDeadline> deadline = assignmentDeadlineRepository.findByPostId(postId);
        if (deadline.isPresent()) {
            LocalDateTime deadlineTime = deadline.get().getDueAt();
            if (submittedAt.isAfter(deadlineTime)) {
                return "late";
            }
        }
        return "submitted";
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
        dto.setGradeComment(sub.getGradeComment());
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
                        fDto.setUploadedAt(f.getUploadedAt());
                        return fDto;
                    }).collect(Collectors.toList());
            dto.setFiles(files);
        }
        return dto;
    }

    @Transactional
    public SubmissionDTO gradeSubmission(UUID id, BigDecimal score, String comment) {
        Submission sub = submissionRepository.findById(id).orElseThrow();
        sub.setScore(score);
        sub.setGradeComment(comment);
        sub.setStatus("graded");
        return mapToDTO(submissionRepository.save(sub));
    }

    public List<SubmissionDTO.SubmissionFileDTO> getSubmissionFiles(UUID submissionId) {
        Submission sub = submissionRepository.findById(submissionId).orElseThrow();
        if (sub.getFiles() == null) {
            return List.of();
        }
        return sub.getFiles().stream()
                .map(f -> {
                    SubmissionDTO.SubmissionFileDTO fDto = new SubmissionDTO.SubmissionFileDTO();
                    fDto.setId(f.getId());
                    fDto.setFileUrl(f.getFileUrl());
                    fDto.setFileName(f.getFileName());
                    fDto.setUploadedAt(f.getUploadedAt());
                    return fDto;
                }).collect(Collectors.toList());
    }
}
