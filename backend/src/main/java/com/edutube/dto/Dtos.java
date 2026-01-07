package com.edutube.dto;

import lombok.Data;

public class Dtos {
    @Data
    public static class LoginRequest {
        private String email;
        private String password;
    }

    @Data
    public static class RegisterRequest {
        private String name;
        private String email;
        private String password;
    }

    @Data
    public static class AuthResponse {
        private String token;
        private String name;
        private String email;
        private String message;

        public AuthResponse(String token, String name, String email, String message) {
            this.token = token;
            this.name = name;
            this.email = email;
            this.message = message;
        }
    }

    @Data
    public static class ExportRequest {
        private String summary;
        private java.util.List<String> topics;
        private Object notes; // Can be string or structure, simplified to string for export usually
        private String thumbnailUrl;
    }
}
