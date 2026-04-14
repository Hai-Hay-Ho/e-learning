package com.example.demo.controller;

import com.example.demo.model.Conversation;
import com.example.demo.model.Message;
import com.example.demo.model.MessageEdit;
import com.example.demo.service.ChatService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/chat")
@CrossOrigin(origins = "*")
public class ChatController {

    @Autowired
    private ChatService chatService;

    @GetMapping("/conversations/{userId}")
    public ResponseEntity<List<Conversation>> getConversations(@PathVariable UUID userId) {
        return ResponseEntity.ok(chatService.getConversationsForUser(userId));
    }

    @PostMapping("/conversations")
    public ResponseEntity<Conversation> getOrCreateConversation(@RequestBody Map<String, UUID> payload) {
        return ResponseEntity.ok(chatService.getOrCreateConversation(
                payload.get("user1Id"),
                payload.get("user2Id")
        ));
    }

    @GetMapping("/messages/{conversationId}")
    public ResponseEntity<List<Message>> getMessages(@PathVariable UUID conversationId) {
        return ResponseEntity.ok(chatService.getMessages(conversationId));
    }

    @PostMapping("/messages")
    public ResponseEntity<Message> sendMessage(@RequestBody Map<String, Object> payload) {
        return ResponseEntity.ok(chatService.saveMessage(
                UUID.fromString(payload.get("conversationId").toString()),
                UUID.fromString(payload.get("senderId").toString()),
                payload.get("content").toString()
        ));
    }

    @PutMapping("/messages/{messageId}")
    public ResponseEntity<Message> editMessage(
            @PathVariable UUID messageId,
            @RequestBody Map<String, String> payload) {
        return ResponseEntity.ok(chatService.updateMessage(messageId, payload.get("content")));
    }

    @GetMapping("/messages/{messageId}/edits")
    public ResponseEntity<List<MessageEdit>> getMessageEdits(@PathVariable UUID messageId) {
        return ResponseEntity.ok(chatService.getMessageEdits(messageId));
    }

    @GetMapping("/messages/{messageId}/can-recall")
    public ResponseEntity<Map<String, Boolean>> canRecallMessage(@PathVariable UUID messageId) {
        boolean canRecall = chatService.canRecallMessage(messageId);
        return ResponseEntity.ok(Map.of("canRecall", canRecall));
    }

    @DeleteMapping("/messages/{messageId}")
    public ResponseEntity<Void> deleteMessage(@PathVariable UUID messageId) {
        chatService.recallMessage(messageId);
        return ResponseEntity.ok().build();
    }
}
