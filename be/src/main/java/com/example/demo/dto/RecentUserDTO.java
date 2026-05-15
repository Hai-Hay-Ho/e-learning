package com.example.demo.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.UUID;
import java.time.OffsetDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RecentUserDTO {
    private UUID id;
    private String fullName;
    private String email;
    private String role; // "0" = Student, "1" = Teacher
    private String avatarUrl;
    private OffsetDateTime createdAt;
    private OffsetDateTime lastSignInAt;
    
    public String getRoleDisplay() {
        return "1".equals(role) ? "Teacher" : "Student";
    }
    
    public String getStatus() {
        if (lastSignInAt == null) return "Pending";
        return "Active";
    }
}
