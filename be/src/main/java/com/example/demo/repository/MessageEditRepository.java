package com.example.demo.repository;

import com.example.demo.model.MessageEdit;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface MessageEditRepository extends JpaRepository<MessageEdit, UUID> {
    List<MessageEdit> findByMessageIdOrderByEditedAtAsc(UUID messageId);
}
