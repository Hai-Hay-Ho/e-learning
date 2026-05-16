package com.example.demo.service;

import com.example.demo.model.User;
import com.example.demo.model.ClassMember;
import com.example.demo.model.UserStreak;
import com.example.demo.dto.UserDetailDTO;
import com.example.demo.repository.UserRepository;
import com.example.demo.repository.ClassMemberRepository;
import com.example.demo.repository.UserStreakRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ClassMemberRepository classMemberRepository;

    @Autowired
    private UserStreakRepository userStreakRepository;

    public User processUserLogin(UUID id, String email, String fullName, String avatarUrl, java.time.OffsetDateTime lastSignInAt) {
        Optional<User> existingUser = userRepository.findById(id);

        if (existingUser.isPresent()) {
            User user = existingUser.get();
            user.setFullName(fullName);
            user.setEmail(email);
            user.setLastSignInAt(lastSignInAt);
            
            // Chỉ cập nhật avatar từ Google nếu trong DB hiện đang trống hoặc chưa có avatar
            if (user.getAvatarUrl() == null || user.getAvatarUrl().isEmpty()) {
                user.setAvatarUrl(avatarUrl);
            }
            
            return userRepository.save(user);
        }

        // đuôi email sau @ là st.hcmuaf.edu.vn thì role = "1", ngược lại role = "0"
        String role = "0";
        if (email != null && email.contains("@")) {
            String domain = email.substring(email.indexOf("@") + 1);
            if ("st.hcmuaf.edu.vn".equalsIgnoreCase(domain)) {
                role = "1";
            }
        }

        User newUser = User.builder()
                .id(id)
                .email(email)
                .fullName(fullName)
                .avatarUrl(avatarUrl)
                .lastSignInAt(lastSignInAt)
                .role(role)
                .status(0)
                .build();

        return userRepository.save(newUser);
    }

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public UserDetailDTO getUserDetail(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        int classMemberships = (int) classMemberRepository.findByStudentId(userId).stream().count();
        
        UserStreak streak = userStreakRepository.findById(userId).orElse(null);
        int streakCount = streak != null ? streak.getStreak() : 0;

        return UserDetailDTO.builder()
                .id(user.getId())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .role(user.getRole())
                .avatarUrl(user.getAvatarUrl())
                .school(user.getSchool())
                .status(user.getStatus())
                .createdAt(user.getCreatedAt())
                .lastSignInAt(user.getLastSignInAt())
                .streak(streakCount)
                .classMemberships(classMemberships)
                .build();
    }

    public User updateUserStatus(UUID userId, Integer status) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setStatus(status);
        return userRepository.save(user);
    }

    public User updateUserRole(UUID userId, String action) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        String currentRole = user.getRole();
        if ("promote".equalsIgnoreCase(action)) {
            if ("0".equals(currentRole)) {
                user.setRole("1");
            }
        } else if ("demote".equalsIgnoreCase(action)) {
            if ("1".equals(currentRole)) {
                user.setRole("0");
            }
        }

        return userRepository.save(user);
    }

    public List<ClassMember> getUserClasses(UUID userId) {
        return classMemberRepository.findByStudentId(userId);
    }
}
