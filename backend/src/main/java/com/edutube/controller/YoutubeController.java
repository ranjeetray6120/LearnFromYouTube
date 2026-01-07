package com.edutube.controller;

import com.edutube.service.AiService;
import com.edutube.service.TranscriptService;
import lombok.Data;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/youtube")
public class YoutubeController {

    @Autowired
    private TranscriptService transcriptService;

    @Autowired
    private AiService aiService;

    @PostMapping("/process")
    public ResponseEntity<?> processVideo(@RequestBody VideoRequest request) {
        try {
            // 1. Get Transcript
            String transcript = transcriptService.fetchTranscript(request.getUrl());

            // 2. Generate Summary
            String summaryJson = aiService.generateSummary(transcript);

            return ResponseEntity.ok(summaryJson); // Returns the JSON string specific by AI
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }

    @Data
    public static class VideoRequest {
        private String url;
    }
}
