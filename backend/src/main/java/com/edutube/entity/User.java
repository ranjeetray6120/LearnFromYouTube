package com.edutube.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    @Column(unique = true)
    private String email;

    private String password; // Nullable for OAuth users

    @Enumerated(EnumType.STRING)
    private Role role;

    private String provider; // "local", "google"
    private String providerId; // Google sub ID

    public enum Role {
        USER, ADMIN
    }
}
