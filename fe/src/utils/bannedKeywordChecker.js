// Utility để kiểm tra từ khóa bị cấm trong nội dung
let cachedKeywords = [];
let lastFetchTime = 0;
const CACHE_DURATION = 60000; // Cache 60 giây

export const fetchBannedKeywords = async () => {
    const now = Date.now();
    // Nếu cache còn hiệu lực, không fetch lại
    if (cachedKeywords.length > 0 && (now - lastFetchTime) < CACHE_DURATION) {
        return cachedKeywords;
    }

    try {
        const response = await fetch('http://localhost:8080/api/banned-keywords');
        if (response.ok) {
            const keywords = await response.json();
            cachedKeywords = keywords;
            lastFetchTime = now;
            return keywords;
        }
    } catch (error) {
        console.error('Error fetching banned keywords:', error);
    }
    return [];
};

export const checkBannedKeywords = (content, keywords) => {
    if (!content || !keywords || keywords.length === 0) {
        return [];
    }

    const foundKeywords = [];
    const contentLower = content.toLowerCase();

    keywords.forEach(kw => {
        const keywordLower = kw.keyword.toLowerCase();
        // Kiểm tra từ khóa có xuất hiện trong nội dung hay không (word boundary)
        const regex = new RegExp(`\\b${keywordLower}\\b`, 'gi');
        if (regex.test(contentLower)) {
            if (!foundKeywords.find(k => k.keyword.toLowerCase() === keywordLower)) {
                foundKeywords.push(kw);
            }
        }
    });

    return foundKeywords;
};

export const resetCache = () => {
    cachedKeywords = [];
    lastFetchTime = 0;
};
