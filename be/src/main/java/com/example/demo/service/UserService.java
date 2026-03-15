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

    public User processUserLogin(UUID id, String email, String fullName, String avatarUrl) {
        Optional<User> existingUser = userRepository.findByEmail(email);

        if (existingUser.isPresent()) {
            User user = existingUser.get();
            // Cập nhật thông tin nếu có thay đổi
            user.setFullName(fullName);
            user.setAvatarUrl(avatarUrl);
            return userRepository.save(user);
        }

        // Logic phân quyền theo email
        // Nếu đuôi email sau @ là st.hcmuaf.edu.vn thì role = "1", ngược lại role = "0"
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
                .role(role)
                .build();

        return userRepository.save(newUser);
    }
}
