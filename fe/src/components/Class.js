import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faPlus, 
    faSignInAlt, 
    faUsers, 
    faIdBadge, 
    faCalendarAlt,
    faEllipsisH,
    faCopy
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
                        <div key={cls.id} className="course-card">
                            <div className="course-header">
                                <div className="course-icon" style={{ backgroundColor: '#e8f0fe', color: '#1a73e8' }}>
                                    <FontAwesomeIcon icon={faUsers} />
                                </div>
                                <button className="more-btn"><FontAwesomeIcon icon={faEllipsisH} /></button>
                            </div>
                            <div className="course-info">
                                <h3>{cls.name}</h3>
                                <p><FontAwesomeIcon icon={faIdBadge} style={{ marginRight: '5px' }} /> Mã lớp: 
                                    <span style={{ fontWeight: 'bold', marginLeft: '5px', color: '#1a73e8' }}>{cls.joinCode}</span>
                                    <button 
                                        onClick={() => copyToClipboard(cls.joinCode)}
                                        style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#777', marginLeft: '5px' }}
                                    >
                                        <FontAwesomeIcon icon={faCopy} />
                                    </button>
                                </p>
                                <div className="course-footer">
                                    <span><FontAwesomeIcon icon={faCalendarAlt} /> {new Date(cls.createdAt).toLocaleDateString()}</span>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Create Class Modal */}
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

            {/* Join Class Modal */}
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

            <style jsx>{`
                .modal-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(0,0,0,0.5);
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    z-index: 1000;
                }
                .modal-content-custom {
                    background: white;
                    padding: 24px;
                    border-radius: 8px;
                    width: 400px;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                }
                .form-group {
                    margin: 20px 0;
                }
                .form-group label {
                    display: block;
                    margin-bottom: 8px;
                    font-weight: 500;
                }
                .form-group input {
                    width: 100%;
                    padding: 10px;
                    border: 1px solid #ddd;
                    border-radius: 4px;
                }
                .modal-actions {
                    display: flex;
                    justify-content: flex-end;
                    gap: 12px;
                }
                .confirm-btn {
                    background: #1a73e8;
                    color: white;
                    border: none;
                    padding: 8px 16px;
                    border-radius: 4px;
                    cursor: pointer;
                }
                .create-btn {
                    background: #1a73e8;
                    color: white;
                    border: none;
                    padding: 10px 20px;
                    border-radius: 6px;
                    cursor: pointer;
                    font-weight: 500;
                }
                .create-btn:hover {
                    background: #1557b0;
                }
            `}</style>
        </div>
    );
};

export default Class;
