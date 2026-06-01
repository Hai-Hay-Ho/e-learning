import React from 'react';
import './BannedKeywordWarning.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExclamationTriangle, faTimes } from '@fortawesome/free-solid-svg-icons';

const BannedKeywordWarning = ({ bannedKeywords, onConfirm, onCancel }) => {
    if (!bannedKeywords || bannedKeywords.length === 0) {
        return null;
    }

    return (
        <div className="banned-keyword-modal-overlay">
            <div className="banned-keyword-modal">
                <div className="banned-keyword-header">
                    <div className="header-title">
                        <FontAwesomeIcon icon={faExclamationTriangle} className="warning-icon" />
                        <h3>Cảnh báo - Từ khóa bị cấm</h3>
                    </div>
                    <button className="close-btn" onClick={onCancel}>
                        <FontAwesomeIcon icon={faTimes} />
                    </button>
                </div>

                <div className="banned-keyword-content">
                    <p className="warning-message">
                        Nội dung của bạn chứa những từ khóa sau đây bị cấm:
                    </p>
                    <div className="banned-keywords-list">
                        {bannedKeywords.map((kw, index) => (
                            <div key={index} className="banned-keyword-item">
                                <span className="keyword-badge">{kw.keyword}</span>
                                {kw.description && (
                                    <span className="keyword-description">{kw.description}</span>
                                )}
                            </div>
                        ))}
                    </div>
                    <p className="info-message">
                        Bạn có thể gửi, nhưng vui lòng chú ý tuân thủ quy tắc cộng đồng.
                    </p>
                </div>

                <div className="banned-keyword-footer">
                    <button className="btn-cancel" onClick={onCancel}>
                        Hủy
                    </button>
                    <button className="btn-continue" onClick={onConfirm}>
                        Vẫn gửi
                    </button>
                </div>
            </div>
        </div>
    );
};

export default BannedKeywordWarning;
