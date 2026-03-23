import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import './Class.css';
import { 
    faPlus, 
    faSignInAlt, 
    faUsers, 
    faIdBadge, 
    faCalendarAlt,
    faEllipsisH,
    faCopy,
    faShareAlt
} from '@fortawesome/free-solid-svg-icons';

const Class = ({ session, userRole }) => {
    const [classes, setClasses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showJoinModal, setShowJoinModal] = useState(false);
    const [className, setClassName] = useState('');
    const [joinCode, setJoinCode] = useState('');
    const [error, setError] = useState(null);

    const isTeacher = userRole === "1";

    useEffect(() => {
        fetchClasses();
    }, [userRole]);

    const fetchClasses = async () => {
        setLoading(true);
        try {
            const response = await fetch(`http://localhost:8080/api/classes/user/${session.user.id}`);
            if (response.ok) {
                const data = await response.json();
                setClasses(data);
            } else {
                console.error("Failed to fetch classes from backend");
            }
        } catch (err) {
            console.error("Error fetching classes:", err);
        } finally {
            setLoading(false);
        }
    };

    const generateJoinCode = () => {
        return Math.floor(100000 + Math.random() * 900000).toString();
    };

    const handleCreateClass = async (e) => {
        e.preventDefault();
        if (!className.trim()) return;

        const newClass = {
            name: className,
            teacherId: session.user.id, 
            joinCode: generateJoinCode() 
        };

        try {
            const response = await fetch('http://localhost:8080/api/classes/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(newClass),
            });

            if (response.ok) {
                const data = await response.json();
                setClasses([...classes, data]);
                setShowCreateModal(false);
                setClassName('');
                alert(`Lớp đã được tạo!`);
            } else {
                const errorData = await response.json();
                setError(errorData.message || "Không thể tạo lớp học");
            }
        } catch (err) {
            setError("Lỗi kết nối server");
            console.error(err);
        }
    };

    const handleJoinClass = async (e) => {
        e.preventDefault();
        if (!joinCode.trim()) return;

        try {
            const response = await fetch('http://localhost:8080/api/classes/join', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    student_id: session.user.id,
                    join_code: joinCode
                }),
            });

            if (response.ok) {
                alert("Đã tham gia lớp học thành công!");
                setShowJoinModal(false);
                setJoinCode('');
                fetchClasses();
            } else {
                const errorData = await response.json();
                alert(errorData.message || "Mã code không hợp lệ hoặc bạn đã tham gia lớp này.");
            }
        } catch (err) {
            alert("Lỗi kết nối server");
            console.error(err);
        }
    };

    const copyToClipboard = (code) => {
        navigator.clipboard.writeText(code);
        alert("Đã sao chép mã code!");
    };

    return (
        <div className="main-content">
            <div className="content-header">
                <div>
                    {isTeacher ? (
                        <button className="create-btn" onClick={() => setShowCreateModal(true)}>
                            <FontAwesomeIcon icon={faPlus} style={{ marginRight: '8px' }} />
                            Tạo lớp học
                        </button>
                    ) : (
                        <button className="create-btn" onClick={() => setShowJoinModal(true)}>
                            <FontAwesomeIcon icon={faSignInAlt} style={{ marginRight: '8px' }} />
                            Tham gia lớp học
                        </button>
                    )}
                </div>
            </div>

            <div className="dashboard-grid">
                {classes.length === 0 ? (
                    <div style={{ textAlign: 'center', gridColumn: '1/-1', padding: '50px' }}>
                        <FontAwesomeIcon icon={faUsers} size="3x" style={{ color: '#ccc', marginBottom: '20px' }} />
                        <p>{isTeacher ? "Bạn chưa tạo lớp học nào." : "Bạn chưa tham gia lớp học nào."}</p>
                    </div>
                ) : (
                    classes.map((cls) => (
                        <div key={cls.id} className="course-card-custom">
                            <div className="course-header-custom" style={{ 
                                backgroundImage: `url('https://www.gstatic.com/classroom/themes/img_read.jpg')`,
                                backgroundSize: 'cover',
                                backgroundPosition: 'center',
                                height: '100px',
                                padding: '16px',
                                borderTopLeftRadius: '8px',
                                borderTopRightRadius: '8px',
                                position: 'relative',
                                color: 'white'
                            }}>
                                <div className="course-header-content">
                                    <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '500' }}>{cls.name}</h3>
                                    <p style={{ margin: '4px 0', fontSize: '14px' }}>{cls.teacherName || "Giáo viên"}</p>
                                </div>
                                <div className="teacher-avatar-wrapper">
                                    <div className="teacher-avatar">
                                        {cls.teacherAvatar ? (
                                            <img src={cls.teacherAvatar} alt={cls.teacherName} />
                                        ) : (
                                            <div className="avatar-placeholder">
                                                {cls.teacherName ? cls.teacherName.charAt(0).toUpperCase() : 'L'}
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <button className="more-btn-custom"><FontAwesomeIcon icon={faEllipsisH} /></button>
                            </div>
                            
                            <div className="course-body-custom" style={{ height: '100px', padding: '16px' }}>
                            </div>

                            <div className="course-footer-custom" style={{ 
                                borderTop: '1px solid #e0e0e0', 
                                padding: '8px 16px', 
                                display: 'flex', 
                                justifyContent: 'space-between',
                                alignItems: 'center'
                            }}>
                                <div className="class-info-icons" style={{ display: 'flex', gap: '15px' }}>
                                    <span>
                                        <FontAwesomeIcon icon={faIdBadge} style={{ color: '#5f6368', marginRight: '5px' }} />
                                        <span style={{ fontSize: '13px', color: '#5f6368' }}>{cls.joinCode}</span>
                                    </span>
                                </div>
                                <div className="course-actions-btns">
                                    <button className="footer-icon-btn"><FontAwesomeIcon icon={faShareAlt} /></button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {showCreateModal && (
                <div className="modal-overlay">
                    <div className="modal-content-custom">
                        <h2>Tạo lớp học mới</h2>
                        <form onSubmit={handleCreateClass}>
                            <div className="form-group">
                                <label>Tên lớp học</label>
                                <input 
                                    type="text" 
                                    value={className} 
                                    onChange={(e) => setClassName(e.target.value)}
                                    placeholder="Nhập tên lớp học"
                                    required
                                />
                            </div>
                            <div className="modal-actions">
                                <button type="button" onClick={() => setShowCreateModal(false)}>Hủy</button>
                                <button type="submit" className="confirm-btn">Tạo</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {showJoinModal && (
                <div className="modal-overlay">
                    <div className="modal-content-custom">
                        <h2>Tham gia lớp học</h2>
                        <form onSubmit={handleJoinClass}>
                            <div className="form-group">
                                <label>Mã tham gia</label>
                                <input 
                                    type="text" 
                                    value={joinCode} 
                                    onChange={(e) => setJoinCode(e.target.value)}
                                    placeholder="Nhập mã code 6 số"
                                    maxLength="6"
                                    required
                                />
                            </div>
                            <div className="modal-actions">
                                <button type="button" onClick={() => setShowJoinModal(false)}>Hủy</button>
                                <button type="submit" className="confirm-btn">Tham gia</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Class;
