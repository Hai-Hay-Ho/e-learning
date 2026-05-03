import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faBookOpen, 
    faGraduationCap,  
    faChartBar,
    faFont,
    faEllipsisH,
    faCamera,
    faBullseye as faBullseyeIcon
} from '@fortawesome/free-solid-svg-icons';
import { UNIVERSITIES } from '../constants/universities';

const StudentDashboard = ({ session, classes, setActiveTab, setSelectedClass, userData, onProfileUpdate }) => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [submissions, setSubmissions] = useState([]);
    const [quizAttempts, setQuizAttempts] = useState([]);
    const [allAssignments, setAllAssignments] = useState([]);
    const [allQuizzes, setAllQuizzes] = useState([]);
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [editData, setEditData] = useState({
        full_name: userData?.full_name || userData?.fullName || '',
        school: userData?.school || ''
    });

    useEffect(() => {
        if (session?.user?.id) {
            fetchStudentStats();
        }
    }, [session]);

    useEffect(() => {
        const fetchClassData = async () => {
            if (!classes || classes.length === 0) return;
            try {
                // Chỉ lấy 1 lần cho mỗi lớp, hoặc lý tưởng là 1 endpoint cho tất cả
                const assignmentPromises = classes.map(cls => 
                    fetch(`http://localhost:8080/api/posts/class/${cls.id}`).then(res => res.json())
                );
                const quizPromises = classes.map(cls => 
                    fetch(`http://localhost:8080/api/quizzes/class/${cls.id}`).then(res => res.json())
                );

                const assignmentsResults = await Promise.all(assignmentPromises);
                const quizzesResults = await Promise.all(quizPromises);

                let assignments = [];
                assignmentsResults.forEach((res, index) => {
                    if (Array.isArray(res)) {
                        assignments = assignments.concat(res.filter(p => p.type === 'assignment').map(p => ({
                            ...p,
                            classId: classes[index].id,
                            className: classes[index].name
                        })));
                    }
                });

                let quizzes = [];
                quizzesResults.forEach((res, index) => {
                    if (Array.isArray(res)) {
                        quizzes = quizzes.concat(res.map(q => ({
                            ...q,
                            classId: classes[index].id,
                            className: classes[index].name
                        })));
                    }
                });

                setAllAssignments(assignments);
                setAllQuizzes(quizzes);
            } catch (error) {
                console.error('Error fetching class data:', error);
            }
        };
        fetchClassData();
    }, [classes]);

    const fetchStudentStats = async () => {
        try {
            const [subRes, quizRes] = await Promise.all([
                fetch(`http://localhost:8080/api/submissions/user/${session.user.id}`),
                fetch(`http://localhost:8080/api/quiz-attempts/user/${session.user.id}`)
            ]);

            if (subRes.ok) setSubmissions(await subRes.json());
            if (quizRes.ok) setQuizAttempts(await quizRes.json());
        } catch (error) {
            console.error('Error fetching student stats:', error);
        }
    };

    const calculateStats = () => {
        const uniqueAssignments = new Set(submissions.map(s => s.postId));
        const uniqueQuizzes = new Set(quizAttempts.map(a => a.quizId));
        const totalCompleted = uniqueAssignments.size + uniqueQuizzes.size;

        const bestAssignmentScores = {};
        submissions.forEach(s => {
            if (s.score != null) {
                const score = parseFloat(s.score);
                if (!bestAssignmentScores[s.postId] || score > bestAssignmentScores[s.postId]) {
                    bestAssignmentScores[s.postId] = score;
                }
            }
        });

        const bestQuizScores = {};
        quizAttempts.forEach(a => {
            if (a.score != null) {
                const score = parseFloat(a.score);
                if (!bestQuizScores[a.quizId] || score > bestQuizScores[a.quizId]) {
                    bestQuizScores[a.quizId] = score;
                }
            }
        });

        const totalItems = allAssignments.length + allQuizzes.length;
        const sumScores = Object.values(bestAssignmentScores).reduce((a, b) => a + b, 0) + 
                          Object.values(bestQuizScores).reduce((a, b) => a + b, 0);
        
        const finalAvg = totalItems > 0 ? sumScores / totalItems : 0;
        const classification = finalAvg >= 8 ? 'Giỏi' : (finalAvg >= 5 ? 'Khá' : 'Trung bình');

        return {
            totalClasses: classes?.length || 0,
            totalCompleted,
            avgScore: finalAvg.toFixed(2),
            classification
        };
    };

    const stats = calculateStats();

    const getClassProgress = (classId) => {
        const classAssignments = allAssignments.filter(a => a.classId === classId);
        const classQuizzes = allQuizzes.filter(q => q.classId === classId);
        
        const totalItems = classAssignments.length + classQuizzes.length;
        if (totalItems === 0) return { completed: 0, total: 0, percentage: 0 };

        const completedAssgn = classAssignments.filter(a => submissions.some(s => s.postId === a.id)).length;
        const completedQuiz = classQuizzes.filter(q => quizAttempts.some(qa => qa.quizId === q.id)).length;

        const totalCompleted = completedAssgn + completedQuiz;
        return {
            completed: totalCompleted,
            total: totalItems,
            percentage: Math.round((totalCompleted / totalItems) * 100)
        };
    };

    const handleAvatarUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setUploading(true);
        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('upload_preset', 'E-Learning');
            const res = await fetch(`https://api.cloudinary.com/v1_1/dye7dfp5s/image/upload`, { method: 'POST', body: formData });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error?.message || 'Upload failed');
            const imageUrl = data.secure_url;
            await supabase.from('users').update({ avatar_url: imageUrl }).eq('id', session.user.id);
            await supabase.auth.updateUser({ data: { avatar_url: imageUrl } });
            if (onProfileUpdate) onProfileUpdate();
        } catch (error) { console.error(error); } finally { setUploading(false); }
    };

    const handleSaveProfile = async () => {
        setIsSaving(true);
        try {
            await supabase.from('users').update({ full_name: editData.full_name, school: editData.school }).eq('id', session.user.id);
            setIsEditing(false);
            if (onProfileUpdate) onProfileUpdate();
        } catch (error) { console.error(error); } finally { setIsSaving(false); }
    };

    // Lịch biểu
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
        days.push(<span key={i} className={`day-cell ${isActive ? 'active' : ''}`} onClick={() => setSelectedDate(dateObj)} style={{ cursor: 'pointer' }}>{i}</span>);
    }

    const isSameDay = (d1, d2) => d1 && d2 && new Date(d1).toDateString() === new Date(d2).toDateString();
    const scheduleItems = [];
    allAssignments.forEach(a => { if (isSameDay(a.dueAt, selectedDate)) scheduleItems.push({ id: a.id, title: a.title, time: new Date(a.dueAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}), color: 'blue' }); });
    allQuizzes.forEach(q => { if (isSameDay(q.deadline, selectedDate)) scheduleItems.push({ id: q.id, title: q.title, time: new Date(q.deadline).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}), color: 'purple' }); });

    const pendingAssignments = allAssignments.filter(a => !submissions.some(s => s.postId === a.id));

    return (
        <main className="main-content-area">
            <div className="center-content">
                <section className="overview">
                    <div className="section-header"><h2>Overview</h2></div>
                    <div className="overview-cards">
                        <div className="overview-card"><div className="overview-card-icon"><FontAwesomeIcon icon={faBookOpen} /></div><h3>{stats.totalClasses}</h3><p>Lớp học tham gia</p></div>
                        <div className="overview-card"><div className="overview-card-icon"><FontAwesomeIcon icon={faGraduationCap} /></div><h3>{stats.totalCompleted}</h3><p>Bài tập hoàn thành</p></div>
                        <div className="overview-card"><div className="overview-card-icon"><FontAwesomeIcon icon={faBullseyeIcon} /></div><h3>{stats.avgScore}</h3><p>Điểm trung bình</p></div>
                        <div className="overview-card"><div className="overview-card-icon"><FontAwesomeIcon icon={faChartBar} /></div><h3>{stats.classification}</h3><p>Xếp loại học tập</p></div>
                    </div>
                </section>

                <section className="courses">
                    <div className="section-header"><h2>Classes</h2></div>
                    <div className="courses-cards">
                        {classes?.length > 0 ? classes.map((cls, idx) => {
                            const progress = getClassProgress(cls.id);
                            return (
                            <div key={cls.id} className={`course-card ${['blue', 'yellow', 'green', 'purple', 'red'][idx % 5]}`} onClick={() => { setSelectedClass(cls); setActiveTab('Classes'); }} style={{ cursor: 'pointer' }}>
                                <div className="course-icon">{cls.teacherAvatar ? <img src={cls.teacherAvatar} alt="t" style={{ width: '100%', height: '100%', borderRadius: '50%' }} /> : <FontAwesomeIcon icon={faGraduationCap} />}</div>
                                <h4>{cls.name}</h4><span>▷ {cls.teacherName || "Giảng viên"}</span>
                                <div className="course-progress">
                                    <span className="progress-info">{progress.completed}/{progress.total} bài tập</span>
                                    <div className="progress-bar-bg"><div className="progress-bar-fill" style={{ width: `${progress.percentage}%` }}></div></div>
                                </div>
                            </div>
                        )}) : <p>Bạn chưa tham gia lớp học nào.</p>}
                    </div>
                </section>

                <section className="assignments">
                    <div className="section-header"><h2>Assignments</h2></div>
                    <div className="assignments-list">
                        {pendingAssignments.length > 0 ? pendingAssignments.map(a => (
                            <div className="assignment-item" key={a.id}><div className="assignment-info"><div className="assignment-icon"><FontAwesomeIcon icon={faFont} /></div><div className="assignment-text"><h5>{a.title}</h5><p>{a.className}</p></div></div><div className="assignment-grade">--/10</div><div className="assignment-status">Upcoming</div></div>
                        )) : <p style={{ color: '#666' }}>Không có bài tập nào chưa làm.</p>}
                    </div>
                </section>
            </div>

            <aside className="right-panel-in-main">
                <div className="calendar-container">
                    <div className="calendar-header"><button onClick={handlePrevMonth}>&lt;</button><span>{monthNames[m]} {y}</span><button onClick={handleNextMonth}>&gt;</button></div>
                    <div className="calendar-grid"><span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>{days}</div>
                </div>

                <div className="schedule-container">
                    <h4>Schedule</h4>
                    {scheduleItems.length > 0 ? scheduleItems.map((item, idx) => (
                        <div className={`schedule-item ${item.color}`} key={`${item.id}-${idx}`}><div className="schedule-header"><h5>{item.title}</h5><FontAwesomeIcon icon={faEllipsisH} className="more-options" /></div><p>{item.time}</p></div>
                    )) : <p style={{ color: '#666', marginTop: '10px' }}>Không có deadline</p>}
                </div>

                <div className="user-profile-card">
                    <div className="avatar-wrapper">
                        <img src={userData?.avatar_url || userData?.avatarUrl} alt="A" className={`profile-avatar ${uploading ? 'uploading' : ''}`} />
                        <label htmlFor="avatar-upload" className="avatar-hover-overlay"><FontAwesomeIcon icon={faCamera} /></label>
                        <input type="file" id="avatar-upload" accept="image/*" onChange={handleAvatarUpload} style={{ display: 'none' }} disabled={uploading} />
                    </div>
                    <div className="profile-info-item"><span className="info-label">Tên:</span>{isEditing ? <input className="edit-input" value={editData.full_name} onChange={(e) => setEditData({...editData, full_name: e.target.value})} /> : <p>{userData?.full_name || userData?.fullName || 'User Name'}</p>}</div>
                    <div className="profile-info-item"><span className="info-label">Email:</span><p className="profile-email">{userData?.email}</p></div>
                    <div className="profile-info-item"><span className="info-label">Chức vụ:</span><span className="profile-role">Sinh viên</span></div>
                    <div className="profile-info-item"><span className="info-label">Trường đại học:</span>{isEditing ? <select className="edit-input" value={editData.school} onChange={(e) => setEditData({...editData, school: e.target.value})}><option value="">Chọn trường đại học</option>{UNIVERSITIES.map((uni, idx) => <option key={idx} value={uni}>{uni}</option>)}</select> : <p className="profile-school">{userData?.school || 'Chưa cập nhật'}</p>}</div>
                    <button onClick={() => { if (isEditing) handleSaveProfile(); else setIsEditing(true); }} disabled={isSaving} className="save-profile-btn">{isSaving ? 'Đang lưu...' : (isEditing ? 'Lưu thông tin' : 'Chỉnh sửa')}</button>
                    {isEditing && <button onClick={() => setIsEditing(false)} className="cancel-edit-btn">Hủy</button>}
                </div>
            </aside>
        </main>
    );
};

export default StudentDashboard;
