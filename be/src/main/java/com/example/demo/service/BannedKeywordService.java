package com.example.demo.service;

import com.example.demo.model.BannedKeyword;
import com.example.demo.repository.BannedKeywordRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class BannedKeywordService {
    @Autowired
    private BannedKeywordRepository bannedKeywordRepository;

    public List<BannedKeyword> getAllKeywords() {
        return bannedKeywordRepository.findAll();
    }

    public Optional<BannedKeyword> getKeywordById(UUID id) {
        return bannedKeywordRepository.findById(id);
    }

    public Optional<BannedKeyword> getKeywordByName(String keyword) {
        return bannedKeywordRepository.findByKeywordIgnoreCase(keyword);
    }

    public BannedKeyword addKeyword(String keyword, String description) {
        // Check if keyword already exists
        Optional<BannedKeyword> existing = bannedKeywordRepository.findByKeywordIgnoreCase(keyword);
        if (existing.isPresent()) {
            throw new IllegalArgumentException("Từ khóa này đã tồn tại");
        }

        BannedKeyword newKeyword = BannedKeyword.builder()
                .keyword(keyword.toLowerCase().trim())
                .description(description)
                .build();

        return bannedKeywordRepository.save(newKeyword);
    }

    public void deleteKeyword(UUID id) {
        bannedKeywordRepository.deleteById(id);
    }

    public boolean isKeywordBanned(String word) {
        return bannedKeywordRepository.findByKeywordIgnoreCase(word).isPresent();
    }
}
