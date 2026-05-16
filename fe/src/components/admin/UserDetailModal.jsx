import React from 'react';
import './UserDetailModal.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faFire, faBookOpen } from '@fortawesome/free-solid-svg-icons';
import userAvatar from '../../assets/img/user.jpg';

const UserDetailModal = ({ user, onClose }) => {
    const getRoleDisplay = (role) => {
        return role === '1' ? 'Giáo viên' : 'Học sinh';
    };

    const getStatusDisplay = (status) => {
        return status === 0 ? 'Hoạt động' : 'Khóa';
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>Chi tiết người dùng</h2>
                    <button className="close-btn" onClick={onClose}>
                        <FontAwesomeIcon icon={faTimes} />
                    </button>
                </div>

                <div className="modal-body">
                    <div className="user-header-section">
                        <div className="user-avatar-large">
                            <img src={user.avatarUrl || userAvatar} alt={user.fullName} />
                        </div>
                        <div className="user-basic-info">
                            <h3>{user.fullName}</h3>
                            <p className="email">{user.email}</p>
                            {user.school && <p className="school">{user.school}</p>}
                        </div>
                    </div>

                    <div className="info-grid">
                        <div className="info-card">
                            <label>Vai trò</label>
                            <span className={`role-value ${user.role === '1' ? 'teacher' : 'student'}`}>
                                {getRoleDisplay(user.role)}
                            </span>
                        </div>

                        <div className="info-card">
                            <label>Trạng thái</label>
                            <span className={`status-value ${user.status === 0 ? 'active' : 'locked'}`}>
                                {getStatusDisplay(user.status)}
                            </span>
                        </div>

                        <div className="info-card">
                            <label>Ngày tạo</label>
                            <span>{new Date(user.createdAt).toLocaleDateString('vi-VN')}</span>
                        </div>

                        <div className="info-card">
                            <label>Lần đăng nhập cuối</label>
                            <span>{user.lastSignInAt ? new Date(user.lastSignInAt).toLocaleDateString('vi-VN') : 'Chưa đăng nhập'}</span>
                        </div>

                        <div className="info-card">
                            <label>
                                <FontAwesomeIcon icon={faFire} className="streak-icon" /> Streak
                            </label>
                            <span className="streak-value">{user.streak || 0} ngày</span>
                        </div>

                        <div className="info-card">
                            <label>
                                <FontAwesomeIcon icon={faBookOpen} className="class-icon" /> Số lớp
                            </label>
                            <span className="class-value">{user.classMemberships || 0} lớp</span>
                        </div>
                    </div>
                </div>

                <div className="modal-footer">
                    <button className="btn-close" onClick={onClose}>Đóng</button>
                </div>
            </div>
        </div>
    );
};

export default UserDetailModal;
