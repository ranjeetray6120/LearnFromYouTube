package com.edutube.service;

import org.springframework.stereotype.Service;
import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

@Service
public class TranscriptService {

    public String fetchTranscript(String videoUrl, String language) throws Exception {
        String videoId = extractVideoId(videoUrl);
        if (videoId == null) {
            throw new IllegalArgumentException("Invalid YouTube URL");
        }

        // Default to English if language is not provided
        String targetLang = (language == null || language.isEmpty()) ? "en" : language;

        // Extract script from JAR to temp file
        java.io.File scriptFile = java.io.File.createTempFile("fetch_transcript", ".py");
        try (java.io.InputStream is = getClass().getResourceAsStream("/fetch_transcript.py")) {
            if (is == null) {
                throw new java.io.FileNotFoundException("Python script not found in resources");
            }
            java.nio.file.Files.copy(is, scriptFile.toPath(), java.nio.file.StandardCopyOption.REPLACE_EXISTING);
        }

        // Determine python command (simple heuristic)
        String pythonCmd = "python";

        // Run python script with target language
        ProcessBuilder processBuilder = new ProcessBuilder(pythonCmd, scriptFile.getAbsolutePath(), videoId,
                targetLang);
        processBuilder.redirectErrorStream(true);
        Process process = processBuilder.start();

        BufferedReader reader = new BufferedReader(new InputStreamReader(process.getInputStream()));
        StringBuilder output = new StringBuilder();
        String line;
        while ((line = reader.readLine()) != null) {
            output.append(line);
        }

        int exitCode = process.waitFor();

        // Cleanup temp file
        scriptFile.delete();

        if (exitCode != 0) {
            throw new RuntimeException("Script failed: " + output.toString());
        }

        // Parse JSON output from script
        ObjectMapper mapper = new ObjectMapper();
        JsonNode root = mapper.readTree(output.toString());

        if (root.has("status") && "error".equals(root.get("status").asText())) {
            throw new RuntimeException(root.get("message").asText());
        }

        return root.get("transcript").asText();
    }

    private String extractVideoId(String url) {
        String pattern = "(?<=watch\\?v=|/videos/|embed\\/|youtu.be\\/|\\/v\\/|\\/e\\/|watch\\?v%3D|watch\\?feature=player_embedded&v=|%2Fvideos%2F|embed%\u200C\u200B2F|youtu.be%2F|%2Fv%2F)[^#\\&\\?\\n]*";
        Pattern compiledPattern = Pattern.compile(pattern);
        Matcher matcher = compiledPattern.matcher(url);
        if (matcher.find()) {
            return matcher.group();
        }
        return null; // or throw exception
    }
}
