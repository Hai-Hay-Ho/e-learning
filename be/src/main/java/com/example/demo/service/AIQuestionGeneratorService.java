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
        prompt.append("Dựa trên nội dung sau, hãy tạo ").append(numberOfQuestions)
              .append(" câu hỏi trắc nghiệm với 4 đáp án cho mỗi câu.\n\n");

        if (topic != null && !topic.isEmpty()) {
            prompt.append("Chủ đề: ").append(topic).append("\n\n");
        }

        prompt.append("Nội dung:\n").append(fileContent).append("\n\n");

        prompt.append("Yêu cầu:\n")
              .append("1. Mỗi câu hỏi phải có 4 đáp án\n")
              .append("2. Đáp án cuối cùng (đáp án 4) PHẢI là đáp án đúng\n")
              .append("3. Ba đáp án đầu tiên là đáp án sai (nhưng hợp lý)\n")
              .append("4. Trả về kết quả dưới dạng JSON array như sau:\n")
              .append("[\n")
              .append("  {\n")
              .append("    \"content\": \"Nội dung câu hỏi\",\n")
              .append("    \"answers\": [\"Đáp án sai 1\", \"Đáp án sai 2\", \"Đáp án sai 3\", \"Đáp án đúng\"]\n")
              .append("  },\n")
              .append("  ...\n")
              .append("]\n\n")
              .append("Chỉ trả về JSON array, không trả về nội dung khác.");

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
            
            System.out.println("=== GROQ RAW RESPONSE ===");
            System.out.println(content);
            System.out.println("=== END ===");
            
            return content;
        } catch (Exception e) {
            System.err.println("Failed to parse Groq response: " + response.toString());
            throw new RuntimeException("Failed to parse Groq response: " + e.getMessage(), e);
        }
    }

    private AIGeneratedQuestionsResponse parseResponse(String responseContent, Integer numberOfQuestions) throws Exception {
        AIGeneratedQuestionsResponse response = new AIGeneratedQuestionsResponse();
        List<AIGeneratedQuestionsResponse.GeneratedQuestion> questions = new ArrayList<>();

        try {
            // Nếu response không phải JSON array, return mock questions
            if (!responseContent.trim().startsWith("[")) {
                // Placeholder response - return mock data
                for (int i = 1; i <= numberOfQuestions; i++) {
                    AIGeneratedQuestionsResponse.GeneratedQuestion q = new AIGeneratedQuestionsResponse.GeneratedQuestion();
                    q.setContent("Câu hỏi " + i + ": Đây là câu hỏi mẫu từ AI");
                    q.setQuestionOrder(i);
                    
                    List<String> answers = new ArrayList<>();
                    answers.add("Đáp án A sai");
                    answers.add("Đáp án B sai");
                    answers.add("Đáp án C sai");
                    answers.add("Đáp án D đúng");
                    
                    q.setAnswers(answers);
                    questions.add(q);
                }
                response.setQuestions(questions);
                return response;
            }

            // Parse JSON array từ response
            String cleanContent = responseContent.trim();
            if (cleanContent.startsWith("```json")) {
                cleanContent = cleanContent.substring(7);
            } else if (cleanContent.startsWith("```")) {
                cleanContent = cleanContent.substring(3);
            }
            if (cleanContent.endsWith("```")) {
                cleanContent = cleanContent.substring(0, cleanContent.length() - 3);
            }
            cleanContent = cleanContent.trim();

            int startIdx = cleanContent.indexOf("[{");
            int endIdx = cleanContent.lastIndexOf("}]");
            if (startIdx >= 0 && endIdx >= 0) {
                cleanContent = cleanContent.substring(startIdx, endIdx + 2);
            }

            JsonArray jsonArray = gson.fromJson(cleanContent, JsonArray.class);
            
            for (int i = 0; i < jsonArray.size() && i < numberOfQuestions; i++) {
                JsonObject qObj = jsonArray.get(i).getAsJsonObject();
                
                AIGeneratedQuestionsResponse.GeneratedQuestion q = new AIGeneratedQuestionsResponse.GeneratedQuestion();
                q.setContent(qObj.get("content").getAsString());
                q.setQuestionOrder(i + 1);

                List<String> answers = new ArrayList<>();
                JsonArray ansArray = qObj.getAsJsonArray("answers");
                for (int j = 0; j < ansArray.size(); j++) {
                    answers.add(ansArray.get(j).getAsString());
                }
                
                while (answers.size() < 4) {
                    answers.add("Đáp án " + (answers.size() + 1));
                }
                if (answers.size() > 4) {
                    answers = answers.subList(0, 4);
                }
                
                q.setAnswers(answers);
                questions.add(q);
            }
        } catch (Exception e) {
            System.err.println("Parse error, returning mock data: " + e.getMessage());
            // Return mock data on error
            for (int i = 1; i <= numberOfQuestions; i++) {
                AIGeneratedQuestionsResponse.GeneratedQuestion q = new AIGeneratedQuestionsResponse.GeneratedQuestion();
                q.setContent("Câu hỏi " + i);
                q.setQuestionOrder(i);
                List<String> answers = new ArrayList<>();
                answers.add("A");
                answers.add("B");
                answers.add("C");
                answers.add("D");
                q.setAnswers(answers);
                questions.add(q);
            }
        }

        response.setQuestions(questions);
        return response;
    }
}
