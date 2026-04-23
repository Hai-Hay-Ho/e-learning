package com.example.demo.repository;

import com.example.demo.model.Message;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface MessageRepository extends JpaRepository<Message, UUID> {
    List<Message> findByConversationIdOrderByCreatedAtAsc(UUID conversationId);

    @org.springframework.data.jpa.repository.Query("SELECT COUNT(m) FROM Message m " +
            "JOIN m.conversation c " +
            "WHERE (c.user1.id = :userId OR c.user2.id = :userId) " +
            "AND m.sender.id != :userId " +
            "AND m.readAt IS NULL")
    long countUnreadMessagesByUserId(@org.springframework.data.repository.query.Param("userId") UUID userId);

    @org.springframework.data.jpa.repository.Modifying
    @org.springframework.data.jpa.repository.Query("UPDATE Message m SET m.readAt = :now, m.isRead = true " +
            "WHERE m.conversation.id = :conversationId " +
            "AND m.sender.id != :userId " +
            "AND m.readAt IS NULL")
    void markAsRead(@org.springframework.data.repository.query.Param("conversationId") UUID conversationId, 
                    @org.springframework.data.repository.query.Param("userId") UUID userId,
                    @org.springframework.data.repository.query.Param("now") java.time.LocalDateTime now);
}
