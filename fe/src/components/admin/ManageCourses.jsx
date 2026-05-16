import React, { useState, useEffect } from 'react';
import './ManageCourses.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash, faTrash, faUsers, faEllipsisH } from '@fortawesome/free-solid-svg-icons';

const ManageCourses = () => {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [showMembersModal, setShowMembersModal] = useState(false);
    const [courseMembers, setCourseMembers] = useState([]);
    const [loadingMembers, setLoadingMembers] = useState(false);
    const [confirmModal, setConfirmModal] = useState(null);
    const [activeMenu, setActiveMenu] = useState(null);

    useEffect(() => {
        fetchCourses();
    }, []);

    const fetchCourses = async () => {
        try {
            setLoading(true);
            const response = await fetch('http://localhost:8080/api/classes/admin/all');
            if (response.ok) {
                const data = await response.json();
                setCourses(data);
            }
        } catch (error) {
            console.error('Error fetching courses:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleViewMembers = async (course) => {
        try {
            setSelectedCourse(course);
            setLoadingMembers(true);
            const response = await fetch(`http://localhost:8080/api/classes/${course.id}/members`);
            if (response.ok) {
                const data = await response.json();
                setCourseMembers(data);
                setShowMembersModal(true);
            }
        } catch (error) {
            console.error('Error fetching course members:', error);
        } finally {
            setLoadingMembers(false);
        }
    };

    const handleToggleHidden = (course) => {
        setConfirmModal({
            title: course.isHidden ? 'Hiển thị lớp học' : 'Ẩn lớp học',
            message: course.isHidden 
                ? `Bạn có chắc chắn muốn hiển thị lớp "${course.name}" không?`
                : `Bạn có chắc chắn muốn ẩn lớp "${course.name}" không?`,
            confirmText: course.isHidden ? 'Có, hiển thị' : 'Có, ẩn',
            onConfirm: async () => {
                try {
                    const response = await fetch(`http://localhost:8080/api/classes/${course.id}/toggle-hidden`, {
                        method: 'PUT',
                    });

                    if (response.ok) {
                        fetchCourses();
                        setConfirmModal(null);
                        setActiveMenu(null);
                    }
                } catch (error) {
                    console.error('Error toggling hidden status:', error);
                }
            }
        });
    };

    const handleDeleteCourse = (course) => {
        setConfirmModal({
            title: 'Xóa lớp học',
            message: `Bạn có chắc chắn muốn xóa lớp "${course.name}" không? Thao tác này không thể hoàn tác.`,
            confirmText: 'Có, xóa',
            isDanger: true,
            onConfirm: async () => {
                try {
                    const response = await fetch(`http://localhost:8080/api/classes/${course.id}`, {
                        method: 'DELETE',
                    });

                    if (response.ok) {
                        fetchCourses();
                        setConfirmModal(null);
                        setActiveMenu(null);
                    }
                } catch (error) {
                    console.error('Error deleting course:', error);
                }
            }
        });
    };

    const filteredCourses = courses.filter(course =>
        course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.teacherName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return <div style={{ padding: '20px', textAlign: 'center' }}>Đang tải...</div>;
    }

    return (
        <div className="manage-courses-container">
            <div className="manage-courses-header">
                <h2>Quản lý Lớp học</h2>
                <input
                    type="text"
                    placeholder="Tìm kiếm theo tên lớp hoặc giáo viên..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="search-input"
                />
            </div>

            <div className="table-wrapper">
                <table className="courses-table">
                    <thead>
                        <tr>
                            <th>Tên lớp</th>
                            <th>Giáo viên</th>
                            <th>Mã tham gia</th>
                            <th>Số học sinh</th>
                            <th>Trạng thái</th>
                            <th>Ngày tạo</th>
                            <th>Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredCourses.length > 0 ? (
                            filteredCourses.map((course) => (
                                <tr key={course.id} className={course.isHidden ? 'course-hidden-row' : ''}>
                                    <td>
                                        <div className="course-name">
                                            {course.isHidden && <span className="hidden-badge">Ẩn</span>}
                                            <span>{course.name}</span>
                                        </div>
                                    </td>
                                    <td>
                                        <div className="teacher-cell">
                                            {course.teacherAvatar && (
                                                <img src={course.teacherAvatar} alt={course.teacherName} />
                                            )}
                                            <span>{course.teacherName}</span>
                                        </div>
                                    </td>
                                    <td className="join-code">{course.joinCode}</td>
                                    <td className="text-center">
                                        <button 
                                            className="members-badge"
                                            onClick={() => handleViewMembers(course)}
                                        >
                                            <FontAwesomeIcon icon={faUsers} /> Xem
                                        </button>
                                    </td>
                                    <td>
                                        <span className={`status-badge ${course.isHidden ? 'hidden' : 'visible'}`}>
                                            {course.isHidden ? 'Ẩn' : 'Hiển thị'}
                                        </span>
                                    </td>
                                    <td>{new Date(course.createdAt).toLocaleDateString('vi-VN')}</td>
                                    <td className="actions-cell">
                                        <div className="action-menu-wrapper">
                                            <button
                                                className="menu-toggle"
                                                onClick={() => setActiveMenu(activeMenu === course.id ? null : course.id)}
                                            >
                                                <FontAwesomeIcon icon={faEllipsisH} />
                                            </button>
                                            {activeMenu === course.id && (
                                                <div className="action-dropdown">
                                                    <button
                                                        className="action-item"
                                                        onClick={() => handleToggleHidden(course)}
                                                    >
                                                        <FontAwesomeIcon icon={course.isHidden ? faEye : faEyeSlash} />
                                                        {course.isHidden ? 'Hiển thị' : 'Ẩn'}
                                                    </button>
                                                    <button
                                                        className="action-item danger"
                                                        onClick={() => handleDeleteCourse(course)}
                                                    >
                                                        <FontAwesomeIcon icon={faTrash} />
                                                        Xóa
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="7" style={{ textAlign: 'center', padding: '20px' }}>
                                    Không có lớp học nào
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Members Modal */}
            {showMembersModal && selectedCourse && (
                <div className="modal-overlay" onClick={() => setShowMembersModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>Danh sách học sinh - {selectedCourse.name}</h3>
                            <button className="close-btn" onClick={() => setShowMembersModal(false)}>×</button>
                        </div>
                        
                        <div className="modal-body">
                            {loadingMembers ? (
                                <div style={{ textAlign: 'center', padding: '20px' }}>Đang tải...</div>
                            ) : courseMembers.length > 0 ? (
                                <div className="members-list">
                                    {courseMembers.map((member) => (
                                        <div key={member.id} className="member-item">
                                            <img src={member.avatarUrl || 'https://via.placeholder.com/40'} alt={member.fullName} />
                                            <div className="member-info">
                                                <div className="member-name">{member.fullName}</div>
                                                <div className="member-email">{member.email}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div style={{ textAlign: 'center', padding: '20px', color: '#666' }}>
                                    Lớp học này chưa có học sinh nào
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

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

export default ManageCourses;
