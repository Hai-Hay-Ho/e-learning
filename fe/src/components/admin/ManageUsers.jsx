import React, { useState, useEffect } from 'react';
import './ManageUsers.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLock, faUnlock, faEye, faArrowUp, faArrowDown } from '@fortawesome/free-solid-svg-icons';
import UserDetailModal from './UserDetailModal';
import ConfirmActionModal from './ConfirmActionModal';
import userAvatar from '../../assets/img/user.jpg';

const ManageUsers = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedUser, setSelectedUser] = useState(null);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [confirmModal, setConfirmModal] = useState(null);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const response = await fetch('http://localhost:8080/api/users');
            if (response.ok) {
                const data = await response.json();
                setUsers(data);
            }
        } catch (error) {
            console.error('Error fetching users:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleViewDetail = async (user) => {
        try {
            const response = await fetch(`http://localhost:8080/api/users/${user.id}`);
            if (response.ok) {
                const detailData = await response.json();
                setSelectedUser(detailData);
                setShowDetailModal(true);
            }
        } catch (error) {
            console.error('Error fetching user detail:', error);
        }
    };

    const handleToggleLock = async (userId, currentStatus) => {
        try {
            const newStatus = currentStatus === 0 ? 1 : 0;
            const response = await fetch(`http://localhost:8080/api/users/${userId}/status`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus })
            });

            if (response.ok) {
                fetchUsers();
            }
        } catch (error) {
            console.error('Error updating user status:', error);
        }
    };

    const handleRoleChange = (userId, user, action) => {
        const actionText = action === 'promote' ? 'Nâng' : 'Hạ';
        const newRole = action === 'promote' ? 'Giáo viên' : 'Học sinh';
        
        setConfirmModal({
            userId,
            action,
            title: `${actionText} vai trò`,
            message: `Bạn có chắc chắn muốn ${actionText.toLowerCase()} vai trò của ${user.fullName} thành ${newRole}?`,
            confirmText: `Có, ${actionText.toLowerCase()} ngay`,
            onConfirm: async () => {
                try {
                    const response = await fetch(`http://localhost:8080/api/users/${userId}/role`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ action })
                    });

                    if (response.ok) {
                        fetchUsers();
                        setConfirmModal(null);
                    }
                } catch (error) {
                    console.error('Error updating user role:', error);
                }
            }
        });
    };

    const getRoleDisplay = (role) => {
        return role === '1' ? 'Teacher' : 'Student';
    };

    const getStatusDisplay = (status) => {
        return status === 0 ? 'Active' : 'Locked';
    };

    const getStatusClass = (status) => {
        return status === 0 ? 'status-active' : 'status-locked';
    };

    const filteredUsers = users.filter(user =>
        user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return <div style={{ padding: '20px', textAlign: 'center' }}>Loading...</div>;
    }

    return (
        <div className="manage-users-container">
            <div className="manage-users-header">
                <h2>Quản lý Người dùng</h2>
                <input
                    type="text"
                    placeholder="Tìm kiếm theo tên hoặc email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="search-input"
                />
            </div>

            <div className="table-wrapper">
                <table className="users-table">
                    <thead>
                        <tr>
                            <th>Người dùng</th>
                            <th>Email</th>
                            <th>Role</th>
                            <th>Trạng thái</th>
                            <th>Ngày tạo</th>
                            <th>Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredUsers.length > 0 ? (
                            filteredUsers.map((user) => (
                                <tr
                                    key={user.id}
                                    className={user.status === 1 ? 'user-locked-row' : ''}
                                >
                                    <td>
                                        <div className="user-cell">
                                            <img src={user.avatarUrl || userAvatar} alt={user.fullName} />
                                            <span>{user.fullName}</span>
                                        </div>
                                    </td>
                                    <td>{user.email}</td>
                                    <td>
                                        <span className={`role-badge ${user.role === '1' ? 'teacher' : 'student'}`}>
                                            {getRoleDisplay(user.role)}
                                        </span>
                                    </td>
                                    <td>
                                        <span className={`status-badge ${getStatusClass(user.status)}`}>
                                            {getStatusDisplay(user.status)}
                                        </span>
                                    </td>
                                    <td>{new Date(user.createdAt).toLocaleDateString('vi-VN')}</td>
                                    <td className="actions-cell">
                                        <div className="action-menu">
                                            <button
                                                className="action-btn view-btn"
                                                onClick={() => handleViewDetail(user)}
                                                title="Xem chi tiết"
                                            >
                                                <FontAwesomeIcon icon={faEye} />
                                            </button>
                                            <button
                                                className="action-btn lock-btn"
                                                onClick={() => handleToggleLock(user.id, user.status)}
                                                title={user.status === 0 ? 'Khóa tài khoản' : 'Mở khóa tài khoản'}
                                            >
                                                <FontAwesomeIcon icon={user.status === 0 ? faLock : faUnlock} />
                                            </button>
                                            <button
                                                className="action-btn promote-btn"
                                                onClick={() => handleRoleChange(user.id, user, 'promote')}
                                                title="Nâng lên giáo viên"
                                                disabled={user.role === '1'}
                                            >
                                                <FontAwesomeIcon icon={faArrowUp} />
                                            </button>
                                            <button
                                                className="action-btn demote-btn"
                                                onClick={() => handleRoleChange(user.id, user, 'demote')}
                                                title="Hạ xuống học sinh"
                                                disabled={user.role === '0'}
                                            >
                                                <FontAwesomeIcon icon={faArrowDown} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="6" style={{ textAlign: 'center', padding: '20px' }}>
                                    Không tìm thấy người dùng nào
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {showDetailModal && selectedUser && (
                <UserDetailModal
                    user={selectedUser}
                    onClose={() => setShowDetailModal(false)}
                />
            )}

            {confirmModal && (
                <ConfirmActionModal
                    title={confirmModal.title}
                    message={confirmModal.message}
                    confirmText={confirmModal.confirmText}
                    onConfirm={confirmModal.onConfirm}
                    onCancel={() => setConfirmModal(null)}
                    type="warning"
                />
            )}
        </div>
    );
};

export default ManageUsers;
