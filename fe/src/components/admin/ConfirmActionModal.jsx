import React from 'react';
import './ConfirmActionModal.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExclamationCircle, faCheck, faTimes } from '@fortawesome/free-solid-svg-icons';

const ConfirmActionModal = ({ title, message, onConfirm, onCancel, confirmText = 'Xác nhận', cancelText = 'Hủy', type = 'info' }) => {
    const getIcon = () => {
        switch(type) {
            case 'warning':
                return faExclamationCircle;
            case 'success':
                return faCheck;
            default:
                return faExclamationCircle;
        }
    };

    const getIconColor = () => {
        switch(type) {
            case 'warning':
                return '#f59e0b';
            case 'success':
                return '#10b981';
            default:
                return '#3b82f6';
        }
    };

    return (
        <div className="confirm-modal-overlay" onClick={onCancel}>
            <div className="confirm-modal-content" onClick={(e) => e.stopPropagation()}>
                <div className={`confirm-modal-icon ${type}`}>
                    <FontAwesomeIcon icon={getIcon()} />
                </div>

                <h2>{title}</h2>
                <p>{message}</p>

                <div className="confirm-modal-actions">
                    <button className="confirm-btn-cancel" onClick={onCancel}>
                        <FontAwesomeIcon icon={faTimes} /> {cancelText}
                    </button>
                    <button className={`confirm-btn-confirm ${type}`} onClick={onConfirm}>
                        <FontAwesomeIcon icon={faCheck} /> {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmActionModal;
