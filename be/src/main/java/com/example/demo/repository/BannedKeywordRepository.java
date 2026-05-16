package com.example.demo.repository;

import com.example.demo.model.BannedKeyword;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface BannedKeywordRepository extends JpaRepository<BannedKeyword, UUID> {
    Optional<BannedKeyword> findByKeywordIgnoreCase(String keyword);
}
