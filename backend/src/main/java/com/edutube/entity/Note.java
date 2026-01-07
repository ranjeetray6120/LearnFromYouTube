package com.edutube.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "notes")
@Data
public class Note {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long userId; // Simple link to User ID

    private String videoUrl;

    @Column(columnDefinition = "TEXT")
    private String summary;

    @Column(columnDefinition = "TEXT")
    private String topics; // Storing as JSON string for simplicity

    @Column(columnDefinition = "TEXT")
    private String notes;

    private LocalDateTime createdAt = LocalDateTime.now();

    public void setTopicsList(java.util.List<String> topicsList) {
        // Simple conversion to comma separated or JSON string
        this.topics = topicsList != null ? String.join("|||", topicsList) : "";
    }

    public java.util.List<String> getTopicsList() {
        if (this.topics == null || this.topics.isEmpty())
            return java.util.List.of();
        return java.util.Arrays.asList(this.topics.split("\\|\\|\\|"));
    }
}
