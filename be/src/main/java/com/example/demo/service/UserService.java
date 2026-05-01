package com.example.demo.service;

import com.example.demo.model.User;
import com.example.demo.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Optional;
import java.util.UUID;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

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
                .build();

        return userRepository.save(newUser);
    }
}
