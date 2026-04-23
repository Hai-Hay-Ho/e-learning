package com.example.demo.service;

import com.example.demo.model.Conversation;
import com.example.demo.model.Message;
import com.example.demo.model.MessageEdit;
import com.example.demo.model.User;
import com.example.demo.repository.ConversationRepository;
import com.example.demo.repository.MessageRepository;
import com.example.demo.repository.MessageEditRepository;
import com.example.demo.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
public class ChatService {

    @Autowired
    private ConversationRepository conversationRepository;

    @Autowired
    private MessageRepository messageRepository;

    @Autowired
    private MessageEditRepository messageEditRepository;

    @Autowired
    private UserRepository userRepository;

    private static final long RECALL_LIMIT_HOURS = 3;

    public List<Conversation> getConversationsForUser(UUID userId) {
        User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));
        return conversationRepository.findByUser1OrUser2OrderByCreatedAtDesc(user, user);
    }

    public Conversation getOrCreateConversation(UUID user1Id, UUID user2Id) {
        User u1 = userRepository.findById(user1Id).orElseThrow(() -> new RuntimeException("User 1 not found"));
        User u2 = userRepository.findById(user2Id).orElseThrow(() -> new RuntimeException("User 2 not found"));

        return conversationRepository.findBetweenUsers(u1, u2)
                .orElseGet(() -> conversationRepository.save(
                        Conversation.builder().user1(u1).user2(u2).build()
                ));
    }

    public Message saveMessage(UUID conversationId, UUID senderId, String content) {
        Conversation conversation = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new RuntimeException("Conversation not found"));
        User sender = userRepository.findById(senderId)
                .orElseThrow(() -> new RuntimeException("Sender not found"));

        Message message = Message.builder()
                .conversation(conversation)
                .sender(sender)
                .content(content)
                .messageType("text")
                .isRead(false)
                .isEdited(false)
                .createdAt(LocalDateTime.now())
                .build();

        return messageRepository.save(message);
    }

    public List<Message> getMessages(UUID conversationId) {
        return messageRepository.findByConversationIdOrderByCreatedAtAsc(conversationId);
    }

    public Message updateMessage(UUID messageId, String newContent) {
        Message message = messageRepository.findById(messageId)
                .orElseThrow(() -> new RuntimeException("Message not found"));

        // Lưu lịch sử chỉnh sửa
        MessageEdit messageEdit = MessageEdit.builder()
                .message(message)
                .oldContent(message.getContent())
                .editedAt(LocalDateTime.now())
                .build();
        messageEditRepository.save(messageEdit);

        // Cập nhật nội dung tin nhắn
        message.setContent(newContent);
        message.setIsEdited(true);
        message.setUpdatedAt(LocalDateTime.now());

        return messageRepository.save(message);
    }

    public boolean canRecallMessage(UUID messageId) {
        Message message = messageRepository.findById(messageId)
                .orElseThrow(() -> new RuntimeException("Message not found"));

        LocalDateTime createdAt = message.getCreatedAt();
        LocalDateTime now = LocalDateTime.now();
        
        long hours = java.time.temporal.ChronoUnit.HOURS.between(createdAt, now);
        
        return hours < RECALL_LIMIT_HOURS;
    }

    public void recallMessage(UUID messageId) {
        if (!canRecallMessage(messageId)) {
            throw new RuntimeException("Tin nhắn đã gửi quá 3 giờ, không thể thu hồi");
        }

        messageRepository.deleteById(messageId);
    }

    public List<MessageEdit> getMessageEdits(UUID messageId) {
        return messageEditRepository.findByMessageIdOrderByEditedAtAsc(messageId);
    }
    
    public long countUnreadMessages(UUID userId) {
        return messageRepository.countUnreadMessagesByUserId(userId);
    }

    @org.springframework.transaction.annotation.Transactional
    public void markAsRead(UUID conversationId, UUID userId) {
        messageRepository.markAsRead(conversationId, userId, LocalDateTime.now());
    }
}
