import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faBookOpen, 
    faGraduationCap, 
    faClipboardList,
    faCalendarCheck,
    faCamera
} from '@fortawesome/free-solid-svg-icons';
import { UNIVERSITIES } from '../constants/universities';

const TeacherDashboard = ({ session, classes, setActiveTab, setSelectedClass, userData, onProfileUpdate }) => {
    const [teacherStats, setTeacherStats] = useState({
        totalClasses: 0,
        totalExercises: 0,
        ungradedAssignments: 0,
        todaySubmissions: 0
    });
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [editData, setEditData] = useState({
        full_name: userData?.full_name || userData?.fullName || '',
        school: userData?.school || ''
    });

    useEffect(() => {
        if (session?.user?.id) {
            fetchTeacherStats();
        }
    }, [session, classes]);

    const fetchTeacherStats = async () => {
        try {
            const response = await fetch(`http://localhost:8080/api/stats/teacher/${session.user.id}`);
            if (response.ok) {
                const data = await response.json();
                setTeacherStats(data);
            }
        } catch (error) {
            console.error('Error fetching teacher stats:', error);
        }
    };

    const handleAvatarUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploading(true);
        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('upload_preset', 'E-Learning');

            const res = await fetch(`https://api.cloudinary.com/v1_1/dye7dfp5s/image/upload`, {
                method: 'POST',
                body: formData
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error?.message || 'Upload failed');
            
            const imageUrl = data.secure_url;

            const { error: tableError } = await supabase
                .from('users')
                .update({ avatar_url: imageUrl })
                .eq('id', session.user.id);

            if (tableError) throw tableError;

            await supabase.auth.updateUser({
                data: { avatar_url: imageUrl }
            });

            if (onProfileUpdate) onProfileUpdate();
        } catch (error) {
            console.error('Error uploading avatar:', error);
        } finally {
            setUploading(false);
        }
    };

    const handleSaveProfile = async () => {
        setIsSaving(true);
        try {
            const { error } = await supabase
                .from('users')
                .update({ 
                    full_name: editData.full_name,
                    school: editData.school 
                })
                .eq('id', session.user.id);

            if (error) throw error;
            setIsEditing(false);
            if (onProfileUpdate) onProfileUpdate();
        } catch (error) {
            console.error('Error updating profile:', error);
        } finally {
            setIsSaving(false);
        }
    };

    // Calendar logic
    const daysInMonth = (y, m) => new Date(y, m + 1, 0).getDate();
    const firstDayOfMonth = (y, m) => new Date(y, m, 1).getDay();
    const handlePrevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    const handleNextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));

    const y = currentDate.getFullYear();
    const m = currentDate.getMonth();
    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const startDay = (firstDayOfMonth(y, m) + 6) % 7;

    const days = [];
    for (let i = 0; i < startDay; i++) days.push(<span key={`empty-${i}`} className="day-cell empty"></span>);
    for (let i = 1; i <= daysInMonth(y, m); i++) {
        const dateObj = new Date(y, m, i);
        const isActive = selectedDate.toDateString() === dateObj.toDateString();
        days.push(
            <span 
                key={i} 
                className={`day-cell ${isActive ? 'active' : ''}`}
                onClick={() => setSelectedDate(dateObj)}
                style={{ cursor: 'pointer' }}
            >
                {i}
            </span>
        );
    }

    return (
        <main className="main-content-area">
            <div className="center-content">
                <section className="overview">
                    <div className="section-header">
                        <h2>Overview</h2>
                    </div>
                    <div className="overview-cards">
                        <div className="overview-card">
                            <div className="overview-card-icon"><FontAwesomeIcon icon={faBookOpen} /></div>
                            <h3>{teacherStats.totalClasses}</h3>
                            <p>Tổng số lớp học của bạn</p>
                        </div>
                        <div className="overview-card">
                            <div className="overview-card-icon"><FontAwesomeIcon icon={faGraduationCap} /></div>
                            <h3>{teacherStats.totalExercises}</h3>
                            <p>Tổng số bài tập đã tạo</p>
                        </div>
                        <div className="overview-card">
                            <div className="overview-card-icon"><FontAwesomeIcon icon={faClipboardList} /></div>
                            <h3>{teacherStats.ungradedAssignments}</h3>
                            <p>Số bài tập chưa chấm</p>
                        </div>
                        <div className="overview-card">
                            <div className="overview-card-icon"><FontAwesomeIcon icon={faCalendarCheck} /></div>
                            <h3>{teacherStats.todaySubmissions}</h3>
                            <p>Số lượt nộp bài hôm nay</p>
                        </div>
                    </div>
                </section>

                <section className="courses">
                    <div className="section-header">
                        <h2>Classes</h2>
                    </div>
                    <div className="courses-cards">
                        {classes && classes.length > 0 ? (
                            classes.map((cls, index) => {
                                const colors = ['blue', 'yellow', 'green', 'purple', 'red'];
                                const cardColor = colors[index % colors.length];
                                return (
                                    <div 
                                        key={cls.id} 
                                        className={`course-card ${cardColor}`}
                                        onClick={() => {
                                            setSelectedClass(cls);
                                            setActiveTab('Classes');
                                        }}
                                        style={{ cursor: 'pointer' }}
                                    >
                                        <div className="course-icon">
                                            {cls.teacherAvatar ? (
                                                <img src={cls.teacherAvatar} alt="teacher" style={{ width: '100%', height: '100%', borderRadius: '50%' }} />
                                            ) : (
                                                <FontAwesomeIcon icon={faGraduationCap} />
                                            )}
                                        </div>
                                        <h4>{cls.name}</h4>
                                        <span>▷ {cls.teacherName || "Giảng viên"}</span>
                                        <div className="course-progress">
                                            <span className="progress-info">Mã lớp: {cls.joinCode}</span>
                                            <div className="progress-bar-bg">
                                                <div className="progress-bar-fill" style={{ width: '100%' }}></div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <p>Bạn chưa tạo lớp học nào.</p>
                        )}
                    </div>
                </section>
            </div>

            <aside className="right-panel-in-main">
                <div className="calendar-container">
                    <div className="calendar-header">
                        <button onClick={handlePrevMonth}>&lt;</button>
                        <span>{monthNames[m]} {y}</span>
                        <button onClick={handleNextMonth}>&gt;</button>
                    </div>
                    <div className="calendar-grid">
                        <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
                        {days}
                    </div>
                </div>

                <div className="user-profile-card">
                    <div className="avatar-wrapper">
                        <img 
                            src={userData?.avatar_url || userData?.avatarUrl} 
                            alt="Avatar" 
                            className={`profile-avatar ${uploading ? 'uploading' : ''}`} 
                        />
                        <label htmlFor="avatar-upload" className="avatar-hover-overlay">
                            <FontAwesomeIcon icon={faCamera} />
                        </label>
                        <input 
                            type="file" 
                            id="avatar-upload" 
                            accept="image/*" 
                            onChange={handleAvatarUpload} 
                            style={{ display: 'none' }} 
                            disabled={uploading}
                        />
                        {uploading && <div className="avatar-spinner"></div>}
                    </div>
                        
                    <div className="profile-info-item">
                        <span className="info-label">Tên:</span>
                        {isEditing ? (
                            <input 
                                className="edit-input"
                                value={editData.full_name}
                                onChange={(e) => setEditData({...editData, full_name: e.target.value})}
                            />
                        ) : (
                            <p>{userData?.full_name || userData?.fullName || 'User Name'}</p>
                        )}
                    </div>

                    <div className="profile-info-item">
                        <span className="info-label">Email:</span>
                        <p className="profile-email">{userData?.email}</p>
                    </div>

                    <div className="profile-info-item">
                        <span className="info-label">Chức vụ:</span>
                        <span className="profile-role">Giảng viên</span>
                    </div>

                    <div className="profile-info-item">
                        <span className="info-label">Trường đại học:</span>
                        {isEditing ? (
                            <select 
                                className="edit-input"
                                value={editData.school}
                                onChange={(e) => setEditData({...editData, school: e.target.value})}
                            >
                                <option value="">Chọn trường đại học</option>
                                {UNIVERSITIES.map((uni, index) => (
                                    <option key={index} value={uni}>{uni}</option>
                                ))}
                            </select>
                        ) : (
                            <p className="profile-school">{userData?.school || 'Chưa cập nhật'}</p>
                        )}
                    </div>
                
                    <button 
                        onClick={() => {
                            if (isEditing) handleSaveProfile();
                            else setIsEditing(true);
                        }}
                        disabled={isSaving}
                        className="save-profile-btn"
                    >
                        {isSaving ? 'Đang lưu...' : (isEditing ? 'Lưu thông tin' : 'Chỉnh sửa')}
                    </button>
                    {isEditing && (
                        <button onClick={() => setIsEditing(false)} className="cancel-edit-btn">Hủy</button>
                    )}
                </div>
            </aside>
        </main>
    );
};

export default TeacherDashboard;
