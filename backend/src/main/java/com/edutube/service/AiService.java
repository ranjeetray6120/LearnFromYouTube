package com.edutube.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

@Service
public class AiService {

    @Value("${gemini.api.key}")
    private String apiKey;

    private final HttpClient httpClient = HttpClient.newHttpClient();
    private final ObjectMapper objectMapper = new ObjectMapper();

    public String generateSummary(String transcript) throws Exception {
        String prompt = "You are an expert study assistant. Create a structured summary from the following YouTube transcript. "
                +
                "Return the result in JSON format with these fields: " +
                "1. 'summary' (a concise overview), " +
                "2. 'topics' (a list of key topics discussed with bullet points), " +
                "3. 'notes' (a JSON object where keys are section headers (e.g., 'Introduction', 'Key Concept') and values are arrays of bullet points). "
                +
                "Do not use Markdown code blocks (like ```json), just return valid raw JSON. " +
                "\n\nTranscript: " + transcript.substring(0, Math.min(transcript.length(), 25000)); // Limit length for
                                                                                                    // token limits

        // Construct Request Body
        // Structure: { "contents": [{ "parts": [{"text": "PROMPT"}] }] }
        String requestBody = objectMapper.createObjectNode()
                .putArray("contents")
                .addObject()
                .putArray("parts")
                .addObject()
                .put("text", prompt)
                .toPrettyString(); // Simplification, ideally build properly

        // Fix JSON structure via ObjectNode logic to avoid string mess
        // But above chain might fail if not handled well. Let's do string format for
        // simplicity or better JSON construction.
        // Re-doing JSON cleanly:
        /*
         * {
         * "contents": [{
         * "parts":[{
         * "text": "..."
         * }]
         * }]
         * }
         */
        // Using a simple inner class or Map is safer, but string replacement is fine
        // for this demo if careful.
        // Let's use string formatting for simplicity but escape properly.
        // Actually, using ObjectMapper is safer.

        var contentNode = objectMapper.createObjectNode();
        var partsArray = contentNode.putArray("contents").addObject().putArray("parts");
        partsArray.addObject().put("text", prompt);
        String jsonBody = objectMapper.writeValueAsString(contentNode);

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(
                        "https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key="
                                + apiKey))
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(jsonBody))
                .build();

        HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

        if (response.statusCode() != 200) {
            throw new RuntimeException("Gemini API Error: " + response.body());
        }

        // Parse Response
        JsonNode root = objectMapper.readTree(response.body());
        // Path: candidates[0].content.parts[0].text
        try {
            String text = root.path("candidates").get(0).path("content").path("parts").get(0).path("text").asText();
            // The model might accidentally wrap in ```json ... ```. Clean it.
            text = text.replaceAll("```json", "").replaceAll("```", "").trim();
            return text;
        } catch (Exception e) {
            return "Error parsing AI response: " + response.body();
        }
    }
}
