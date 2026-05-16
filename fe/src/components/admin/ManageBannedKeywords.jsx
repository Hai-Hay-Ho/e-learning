import React, { useState, useEffect } from 'react';
import './ManageBannedKeywords.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faPlus } from '@fortawesome/free-solid-svg-icons';

const ManageBannedKeywords = () => {
    const [keywords, setKeywords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [newKeyword, setNewKeyword] = useState('');
    const [newDescription, setNewDescription] = useState('');
    const [showAddForm, setShowAddForm] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [confirmModal, setConfirmModal] = useState(null);

    useEffect(() => {
        fetchKeywords();
    }, []);

    const fetchKeywords = async () => {
        try {
            setLoading(true);
            const response = await fetch('http://localhost:8080/api/banned-keywords');
            if (!response.ok) throw new Error('Lỗi tải từ khóa');
            const data = await response.json();
            // Sort by created_at descending
            const sorted = data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
            setKeywords(sorted);
        } catch (error) {
            console.error('Error fetching keywords:', error);
            alert('Lỗi tải từ khóa: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleAddKeyword = async (e) => {
        e.preventDefault();
        
        if (!newKeyword.trim()) {
            alert('Vui lòng nhập từ khóa');
            return;
        }

        try {
            const response = await fetch('http://localhost:8080/api/banned-keywords', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    keyword: newKeyword.toLowerCase().trim(),
                    description: newDescription || null
                })
            });

            const data = await response.json();

            if (!response.ok) {
                alert('Lỗi thêm từ khóa: ' + (data.error || 'Lỗi không xác định'));
                return;
            }
            
            // Add new keyword to list at the beginning
            setKeywords([data, ...keywords]);
            setNewKeyword('');
            setNewDescription('');
            setShowAddForm(false);
            alert('Đã thêm từ khóa thành công!');
        } catch (error) {
            alert('Lỗi thêm từ khóa: ' + error.message);
        }
    };

    const handleDeleteKeyword = (keyword) => {
        setConfirmModal({
            title: 'Xóa từ khóa',
            message: `Bạn có chắc chắn muốn xóa từ khóa "${keyword.keyword}" không?`,
            confirmText: 'Có, xóa',
            isDanger: true,
            onConfirm: async () => {
                try {
                    const response = await fetch(`http://localhost:8080/api/banned-keywords/${keyword.id}`, {
                        method: 'DELETE',
                    });

                    if (!response.ok) {
                        const data = await response.json();
                        throw new Error(data.error || 'Lỗi xóa từ khóa');
                    }
                    
                    setKeywords(keywords.filter(k => k.id !== keyword.id));
                    setConfirmModal(null);
                    alert('Đã xóa từ khóa thành công!');
                } catch (error) {
                    alert('Lỗi xóa từ khóa: ' + error.message);
                }
            }
        });
    };

    const filteredKeywords = keywords.filter(keyword =>
        keyword.keyword.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return <div style={{ padding: '20px', textAlign: 'center' }}>Đang tải...</div>;
    }

    return (
        <div className="manage-keywords-container">
            <div className="keywords-header">
                <div>
                    <h2>Quản lý Từ khóa bị cấm</h2>
                    <p>Những từ khóa này sẽ không được phép dùng khi tương tác</p>
                </div>
                <button 
                    className="add-keyword-btn"
                    onClick={() => setShowAddForm(!showAddForm)}
                >
                    <FontAwesomeIcon icon={faPlus} /> Thêm từ khóa
                </button>
            </div>

            {showAddForm && (
                <div className="add-keyword-form">
                    <form onSubmit={handleAddKeyword}>
                        <input
                            type="text"
                            placeholder="Nhập từ khóa..."
                            value={newKeyword}
                            onChange={(e) => setNewKeyword(e.target.value)}
                            className="keyword-input"
                        />
                        <input
                            type="text"
                            placeholder="Mô tả (tuỳ chọn)"
                            value={newDescription}
                            onChange={(e) => setNewDescription(e.target.value)}
                            className="keyword-input"
                        />
                        <div className="form-actions">
                            <button type="button" onClick={() => setShowAddForm(false)} className="btn-cancel">
                                Hủy
                            </button>
                            <button type="submit" className="btn-add">
                                Thêm
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="keywords-search">
                <input
                    type="text"
                    placeholder="Tìm kiếm từ khóa..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="search-input"
                />
            </div>

            <div className="keywords-list">
                {filteredKeywords.length > 0 ? (
                    filteredKeywords.map((keyword) => (
                        <div key={keyword.id} className="keyword-item">
                            <div className="keyword-info">
                                <div className="keyword-text">{keyword.keyword}</div>
                                {keyword.description && (
                                    <div className="keyword-description">{keyword.description}</div>
                                )}
                            
                            </div>
                            <button
                                className="delete-keyword-btn"
                                onClick={() => handleDeleteKeyword(keyword)}
                                title="Xóa từ khóa"
                            >
                                <FontAwesomeIcon icon={faTrash} />
                            </button>
                        </div>
                    ))
                ) : (
                    <div className="empty-state">
                        Không có từ khóa nào
                    </div>
                )}
            </div>

            {/* Confirm Modal */}
            {confirmModal && (
                <div className="modal-overlay" onClick={() => setConfirmModal(null)}>
                    <div className="modal-content confirm-modal" onClick={(e) => e.stopPropagation()}>
                        <h3>{confirmModal.title}</h3>
                        <p>{confirmModal.message}</p>
                        <div className="modal-actions">
                            <button 
                                className="btn-cancel"
                                onClick={() => setConfirmModal(null)}
                            >
                                Hủy
                            </button>
                            <button 
                                className={`btn-confirm ${confirmModal.isDanger ? 'danger' : ''}`}
                                onClick={confirmModal.onConfirm}
                            >
                                {confirmModal.confirmText}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManageBannedKeywords;
