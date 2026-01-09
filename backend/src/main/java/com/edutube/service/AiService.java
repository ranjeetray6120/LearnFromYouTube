package com.edutube.service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.nio.file.StandardOpenOption;

import org.springframework.stereotype.Service;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.client.RestTemplate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import com.fasterxml.jackson.core.JsonParser;

@Service
public class AiService {

    @Value("${sambanova.api.key}")
    private String apiKey;

    @Value("${sambanova.api.url}")
    private String apiUrl;

    private final ObjectMapper objectMapper = new ObjectMapper()
            .configure(JsonParser.Feature.ALLOW_UNQUOTED_CONTROL_CHARS, true);
    private final RestTemplate restTemplate = new RestTemplate();

    public String generateSummary(String transcript) throws Exception {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(apiKey);

        Map<String, Object> systemMessage = new HashMap<>();
        systemMessage.put("role", "system");
        systemMessage.put("content", "You are an expert educational content creator. " +
                "Analyze the provided transcript and generate a comprehensive, detailed study guide. " +
                "Your goal is to explain the concepts in depth, giving clear examples and context. " +
                "Your goal is to explain the concepts in depth, giving clear examples and context. " +
                "IMPORTANT: Do NOT use double quotes (\") inside the content strings. Use single quotes (') instead. " +
                "Return ONLY raw JSON. " +
                "Structure: " +
                "{" +
                "\"summary\": \"A detailed summary paragraph (max 1000 chars).\", " +
                "\"topics\": [\"Topic 1\", \"Topic 2\", ...], " +
                "\"colors\": {\"primary\": \"#HEX\", \"secondary\": \"#HEX\", \"accent\": \"#HEX\"}, " +
                "\"image_prompt\": \"Minimal, flat illustration description.\", " +
                "\"notes\": {" +
                "\"Introduction\": [\"Detailed context settting the stage...\", \"Background information...\"], " +
                "\"Core Concepts\": [\"Detailed explanation of concept A...\", \"Examples for concept A...\"], " +
                "\"Key Takeaways\": [\"Critical insight 1...\", \"Actionable advice...\"]" +
                "}" +
                "}");

        // Truncate transcript if too long to fit context window
        // Reduced to 5000 chars to save tokens for the response (preventing JSON
        // truncation)
        String inputTranscript = transcript;
        if (inputTranscript.length() > 4000) {
            inputTranscript = inputTranscript.substring(0, 4000) + "...";
        }

        Map<String, Object> userMessage = new HashMap<>();
        userMessage.put("role", "user");
        userMessage.put("content", inputTranscript);

        Map<String, Object> body = new HashMap<>();
        body.put("model", "ALLaM-7B-Instruct-preview");
        body.put("messages", List.of(systemMessage, userMessage));
        body.put("max_tokens", 2000);
        body.put("temperature", 0.1);
        body.put("top_p", 0.1);

        HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, headers);

        try {
            ResponseEntity<String> response = restTemplate.postForEntity(apiUrl, request, String.class);

            if (!response.getStatusCode().is2xxSuccessful()) {
                throw new RuntimeException("API call failed with status: " + response.getStatusCode());
            }

            JsonNode rootResponse = objectMapper.readTree(response.getBody());
            String content = rootResponse.path("choices").get(0).path("message").path("content").asText();

            // Clean up potentially malformed JSON (remove markdown blocks if present
            // despite instructions)
            // Robust JSON extraction
            int jsonStart = content.indexOf("{");
            int jsonEnd = content.lastIndexOf("}");
            if (jsonStart != -1 && jsonEnd != -1 && jsonEnd > jsonStart) {
                content = content.substring(jsonStart, jsonEnd + 1);
            } else {
                // Fallback: try to clean markdown if indices not found (unlikely if valid)
                if (content.startsWith("```json"))
                    content = content.substring(7);
                if (content.startsWith("```"))
                    content = content.substring(3);
                if (content.endsWith("```"))
                    content = content.substring(0, content.length() - 3);
            }

            // Validate JSON before returning
            try {
                objectMapper.readTree(content);
            } catch (Exception e) {
                // Attempt to repair truncated JSON (common with LLM limits)
                try {
                    String repairedContent = content + "}";
                    objectMapper.readTree(repairedContent);
                    content = repairedContent;
                } catch (Exception e2) {
                    try {
                        String repairedContent2 = content + "}}"; // Try adding two braces
                        objectMapper.readTree(repairedContent2);
                        content = repairedContent2;
                    } catch (Exception e3) {
                        System.out.println("AI returned invalid JSON: " + content); // Print to stdout for easier
                                                                                    // debugging
                        System.err.println("JSON Error: " + e.getMessage());

                        try {
                            Files.write(Paths.get("debug_json_error.txt"), content.getBytes(),
                                    StandardOpenOption.CREATE,
                                    StandardOpenOption.TRUNCATE_EXISTING);
                        } catch (IOException ioException) {
                            System.err.println("Could not write debug file: " + ioException.getMessage());
                        }

                        throw new RuntimeException("AI generated invalid JSON syntax. Check debug_json_error.txt");
                    }
                }
            }

            return content.trim();

        } catch (Exception e) {
            e.printStackTrace();
            // Fallback object to avoid breaking frontend
            ObjectNode fallback = objectMapper.createObjectNode();
            fallback.put("summary", "Error generating summary: " + e.getMessage());
            fallback.putArray("topics");
            fallback.putObject("notes");
            return objectMapper.writeValueAsString(fallback);
        }
    }

    // Removed legacy extractSentences method
}
