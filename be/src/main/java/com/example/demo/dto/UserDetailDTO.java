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
public class UserDetailDTO {
    private UUID id;
    private String fullName;
    private String email;
    private String role;
    private String avatarUrl;
    private String school;
    private Integer status;
    private OffsetDateTime createdAt;
    private OffsetDateTime lastSignInAt;
    private Integer streak;
    private Integer classMemberships;

    public String getRoleDisplay() {
        return "1".equals(role) ? "Teacher" : "Student";
    }

    public String getStatusDisplay() {
        return status == null || status == 0 ? "Active" : "Locked";
    }
}
