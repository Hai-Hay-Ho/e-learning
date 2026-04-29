package com.example.demo.service;

import com.example.demo.dto.AIGeneratedQuestionsResponse;
import com.google.gson.Gson;
import com.google.gson.JsonArray;
import com.google.gson.JsonObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;
import java.util.Scanner;

@Service
public class AIQuestionGeneratorService {

    @Value("${groq.api.key:}")
    private String groqApiKey;

    private static final String GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
    private final Gson gson = new Gson();

    public AIGeneratedQuestionsResponse generateQuestions(String fileContent, Integer numberOfQuestions, String topic) throws Exception {
        if (groqApiKey == null || groqApiKey.isEmpty()) {
            throw new IllegalArgumentException("Groq API key is not configured");
        }

        // Tạo prompt
        String prompt = createPrompt(fileContent, numberOfQuestions, topic);

        // Gọi Groq API
        String responseContent = callGroqAPI(prompt);

        // Parse kết quả
        return parseResponse(responseContent, numberOfQuestions);
    }

    private String createPrompt(String fileContent, Integer numberOfQuestions, String topic) {
        StringBuilder prompt = new StringBuilder();
        
        // Giới hạn input
        if (fileContent.length() > 1500) {
            fileContent = fileContent.substring(0, 1500);
        }

        prompt.append("Tạo ").append(numberOfQuestions).append(" câu hỏi trắc nghiệm từ nội dung sau.\n\n");

        if (topic != null && !topic.isEmpty()) {
            prompt.append("Chủ đề: ").append(topic).append("\n\n");
        }

        prompt.append(fileContent).append("\n\n");

        prompt.append("Format mỗi câu (bắt buộc):\n")
              .append("Câu 1: [Câu hỏi]\n")
              .append("A. [Đáp án 1]\n")
              .append("B. [Đáp án 2]\n")
              .append("C. [Đáp án 3]\n")
              .append("D. [Đáp án đúng]\n\n")
              .append("Câu 2: [Câu hỏi]\n")
              .append("A. [Đáp án 1]\n")
              .append("...\n\n")
              .append("QUAN TRỌNG: CHỈ TRẢ VỀ DANH SÁCH CÂU HỎI. KHÔNG CẦN GIỚI THIỆU, GHI CHÚ HAY PHẦN KHÁC.");


        return prompt.toString();
    }

    private String callGroqAPI(String prompt) throws Exception {
        URL url = new URL(GROQ_API_URL);
        HttpURLConnection connection = (HttpURLConnection) url.openConnection();
        connection.setRequestMethod("POST");
        connection.setRequestProperty("Content-Type", "application/json");
        connection.setRequestProperty("Authorization", "Bearer " + groqApiKey);
        connection.setDoOutput(true);
        connection.setConnectTimeout(30000);
        connection.setReadTimeout(30000);

        // Tạo request body cho Groq (OpenAI format)
        JsonObject requestBody = new JsonObject();
        requestBody.addProperty("model", "llama-3.3-70b-versatile");
        
        JsonArray messagesArray = new JsonArray();
        JsonObject message = new JsonObject();
        message.addProperty("role", "user");
        message.addProperty("content", prompt);
        messagesArray.add(message);
        
        requestBody.add("messages", messagesArray);
        requestBody.addProperty("temperature", 0.7);
        requestBody.addProperty("max_tokens", 2000);

        // Gửi request
        try (OutputStream os = connection.getOutputStream()) {
            byte[] input = gson.toJson(requestBody).getBytes(StandardCharsets.UTF_8);
            os.write(input, 0, input.length);
        }

        // Kiểm tra response code
        int responseCode = connection.getResponseCode();
        
        // Đọc response
        StringBuilder response = new StringBuilder();
        try (Scanner scanner = new Scanner(
                responseCode >= 400 ? connection.getErrorStream() : connection.getInputStream(), 
                StandardCharsets.UTF_8)) {
            while (scanner.hasNextLine()) {
                response.append(scanner.nextLine());
            }
        } catch (Exception e) {
            throw new RuntimeException("Failed to read API response: " + e.getMessage(), e);
        }

        if (responseCode >= 400) {
            System.err.println("Groq API Error (" + responseCode + "): " + response.toString());
            throw new RuntimeException("Groq API Error: " + response.toString());
        }

        // Parse JSON response
        try {
            JsonObject responseJson = gson.fromJson(response.toString(), JsonObject.class);
            String content = responseJson
                    .getAsJsonArray("choices")
                    .get(0)
                    .getAsJsonObject()
                    .getAsJsonObject("message")
                    .get("content")
                    .getAsString();
            
            return content;
        } catch (Exception e) {
            System.err.println("Failed to parse Groq response: " + response.toString());
            throw new RuntimeException("Failed to parse Groq response: " + e.getMessage(), e);
        }
    }

    private AIGeneratedQuestionsResponse parseResponse(String responseContent, Integer numberOfQuestions) throws Exception {
        AIGeneratedQuestionsResponse response = new AIGeneratedQuestionsResponse();
        
        // Simply return the raw text content from AI
        response.setRawContent(responseContent);
        response.setQuestions(new ArrayList<>());  // Keep empty for backward compatibility
        
        return response;
    }
}
