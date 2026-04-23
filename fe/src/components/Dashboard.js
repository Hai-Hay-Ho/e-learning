import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faBookOpen, 
    faGraduationCap, 
    faBullseye, 
    faChartBar,
    faFont,
    faHome,
    faImage,
    faEllipsisH,
    faCamera,
    faClipboardList,
    faCalendarCheck
} from '@fortawesome/free-solid-svg-icons';

const MainContent = ({ session, classes, setActiveTab, setSelectedClass }) => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [user, setUser] = useState(null);
    const [,setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [universities, setUniversities] = useState([]);
    const [isEditing, setIsEditing] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [editData, setEditData] = useState({
        full_name: '',
        school: ''
    });

    //list bài tập đã nộp và các lượt làm Quiz của sinh viên
    const [submissions, setSubmissions] = useState([]);
    const [quizAttempts, setQuizAttempts] = useState([]);
    const [teacherStats, setTeacherStats] = useState({
        totalClasses: 0,
        totalExercises: 0,
        ungradedAssignments: 0,
        todaySubmissions: 0
    });

    useEffect(() => {
        if (session?.user) {
            fetchUserProfile();
            fetchUniversities();
            fetchStats();
        }
    }, [session]);

    //api lấy danh sách bài nộp và bài kiểm tra
    const fetchStats = async () => {
        try {
            // Check if user is teacher or student from user state or supabase
            const { data: { user: authUser } } = await supabase.auth.getUser();
            if (!authUser) return;

            const { data: userData } = await supabase
                .from('users')
                .select('role')
                .eq('id', authUser.id)
                .single();

            if (userData && String(userData.role) === "1") {
                // Fetch teacher stats
                const response = await fetch(`http://localhost:8080/api/stats/teacher/${authUser.id}`);
                if (response.ok) {
                    const data = await response.json();
                    setTeacherStats(data);
                }
            } else {
                // Fetch student stats
                const [subRes, quizRes] = await Promise.all([
                    fetch(`http://localhost:8080/api/submissions/user/${session.user.id}`),
                    fetch(`http://localhost:8080/api/quiz-attempts/user/${session.user.id}`)
                ]);

                if (subRes.ok) {
                    const subData = await subRes.json();
                    setSubmissions(subData);
                }
                if (quizRes.ok) {
                    const quizData = await quizRes.json();
                    setQuizAttempts(quizData);
                }
            }
        } catch (error) {
            console.error('Error fetching stats:', error);
        }
    };

    const calculateStats = () => {
        // Count unique completed assignments (by postId)
        const uniqueAssignments = new Set(submissions.map(s => s.postId));
        const completedAssignments = uniqueAssignments.size;

        // Count unique completed quizzes (by quizId)
        const uniqueQuizzes = new Set(quizAttempts.map(a => a.quizId));
        const completedQuizzes = uniqueQuizzes.size;

        const totalCompleted = completedAssignments + completedQuizzes;

        // Lấy điểm cao nhất cho từng bài tập khác nhau
        const bestAssignmentScores = {};
        submissions.forEach(s => {
            if (s.score !== null && s.score !== undefined) {
                const score = parseFloat(s.score);
                if (!bestAssignmentScores[s.postId] || score > bestAssignmentScores[s.postId]) {
                    bestAssignmentScores[s.postId] = score;
                }
            }
        });
        const assignmentScoreValues = Object.values(bestAssignmentScores);
        const avgAssignmentScore = assignmentScoreValues.length > 0 
            ? assignmentScoreValues.reduce((acc, score) => acc + score, 0) / assignmentScoreValues.length 
            : 0;

        // Lấy điểm cao nhất cho từng bài kiểm tra khác nhau
        const bestQuizScores = {};
        quizAttempts.forEach(a => {
            if (a.score !== null && a.score !== undefined) {
                const score = parseFloat(a.score);
                if (!bestQuizScores[a.quizId] || score > bestQuizScores[a.quizId]) {
                    bestQuizScores[a.quizId] = score;
                }
            }
        });
        const quizScoreValues = Object.values(bestQuizScores);
        const avgQuizScore = quizScoreValues.length > 0
            ? quizScoreValues.reduce((acc, score) => acc + score, 0) / quizScoreValues.length
            : 0;

        // Tính điểm trung bình (cộng trung bình Assignment và Quiz chia đôi)
        let finalAvg = 0;
        if (assignmentScoreValues.length > 0 && quizScoreValues.length > 0) {
            finalAvg = (avgAssignmentScore + avgQuizScore) / 2;
        } else if (assignmentScoreValues.length > 0) {
            finalAvg = avgAssignmentScore;
        } else if (quizScoreValues.length > 0) {
            finalAvg = avgQuizScore;
        }

        const classification = finalAvg >= 8 ? 'Giỏi' : (finalAvg >= 5 ? 'Khá' : 'Trung bình');

        return {
            totalClasses: classes?.length || 0,
            totalCompleted,
            avgScore: finalAvg.toFixed(2),
            classification
        };
    };

    const stats = calculateStats();

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
            
            if (!res.ok) {
                console.error('Cloudinary Error Data:', data);
                throw new Error(data.error?.message || 'Upload failed');
            }
            
            const imageUrl = data.secure_url;

            //update xuống supabase
            const { error: tableError } = await supabase
                .from('users')
                .update({ avatar_url: imageUrl })
                .eq('id', user.id);

            if (tableError) throw tableError;

            //update auth Metadata (để đồng bộ avatar_url trong auth)
            const { error: authError } = await supabase.auth.updateUser({
                data: { avatar_url: imageUrl }
            });

            if (authError) throw authError;

            setUser({ ...user, avatar_url: imageUrl });
        } catch (error) {
            console.error('Error uploading avatar:', error);
        } finally {
            setUploading(false);
        }
    };

    const fetchUniversities = async () => {
        try {
            //gọi cả hai để lấy đầy đủ danh sách nhất
            const [res1, res2] = await Promise.all([
                fetch('http://universities.hipolabs.com/search?country=Vietnam'),
                fetch('http://universities.hipolabs.com/search?country=Viet+Nam')
            ]);
            
            const data1 = await res1.json();
            const data2 = await res2.json();
            
            //dịch 
            const translationMap = {
                "Ho Chi Minh City University of Agriculture and Forestry": "Đại học Nông Lâm TP.HCM",
                "Ho Chi Minh City University of Technology": "Đại học Bách khoa TP.HCM",
                "Ho Chi Minh City University of Science": "Đại học Khoa học Tự nhiên TP.HCM",
                "Ho Chi Minh City University of Education": "Đại học Sư phạm TP.HCM",
                "Ho Chi Minh City University of Foreign Languages and Information Technology": "Đại học Ngoại ngữ - Tin học TP.HCM",
                "Vietnam National University, Ho Chi Minh City": "Đại học Quốc gia TP.HCM",
                "Vietnam National University, Hanoi": "Đại học Quốc gia Hà Nội",
                "Hanoi University of Science and Technology": "Đại học Bách khoa Hà Nội",
                "Foreign Trade University": "Đại học Ngoại thương",
                "National Economics University": "Đại học Kinh tế Quốc dân",
                "Bank University of Ho Chi Minh City": "Đại học Ngân hàng TP.HCM",
                "Can Tho University": "Đại học Cần Thơ",
                "Da Nang University": "Đại học Đà Nẵng",
                "Hue University": "Đại học Huế",
                "FPT University": "Đại học FPT",
                "Ton Duc Thang University": "Đại học Tôn Đức Thắng",
                "Ho Chi Minh City University of Social Sciences and Humanities": "Đại học Khoa học Xã hội và Nhân văn TP.HCM",
                "Ho Chi Minh City University of Economics and Law": "Đại học Kinh tế - Luật TP.HCM",
                "VNU University of Economics and Business": "Đại học Kinh tế (ĐHQGHN)",
                "Duy Tan University": "Đại học Duy Tân",
                "Lac Hong University": "Đại học Lạc Hồng",
                "Nguyen Tat Thanh University": "Đại học Nguyễn Tất Thành",
                "Industrial University of Ho Chi Minh City": "Đại học Công nghiệp TP.HCM"
            };

            const allData = [...data1, ...data2];
            const uniqueNames = [...new Set(allData.map(uni => {
                return translationMap[uni.name] || uni.name;
            }))].sort();
            
            setUniversities(uniqueNames);
        } catch (error) {
            console.error('Error fetching universities:', error);
            setUniversities([
                "Không crawl được"
            ]);
        }
    };

    const fetchUserProfile = async () => {
        try {
            const { data: { user: authUser } } = await supabase.auth.getUser();
            if (authUser) {
                const { data } = await supabase
                    .from('users')
                    .select('*')
                    .eq('id', authUser.id)
                    .single();

                if (data) {
                    setUser(data);
                    setEditData({
                        full_name: data.full_name || '',
                        school: data.school || ''
                    });
                }
            }
        } catch (error) {
            console.error('Error fetching user profile:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSaveProfile = async () => {
        if (!user) return;
        setIsSaving(true);
        try {
            const { error } = await supabase
                .from('users')
                .update({ 
                    full_name: editData.full_name,
                    school: editData.school 
                })
                .eq('id', user.id);

            if (error) throw error;
            setIsEditing(false);
            fetchUserProfile();
        } catch (error) {
            console.error('Error updating profile:', error);
            fetchUserProfile();
        } 
        finally {
            setIsSaving(false);
        }
    };

    const daysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();//hàm trả về số ngày trong tháng 
    const firstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();//trả về ngày đầu tiên của tháng

    const handlePrevMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    };

    const handleNextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    };

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const today = new Date();
    const isCurrentMonth = today.getFullYear() === year && today.getMonth() === month;

    const monthNames = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];
    const startDay = (firstDayOfMonth(year, month) + 6) % 7;
    // getDay() mặc định bắt đầu từ Sunday = 0
    // nhưng lịch muốn bắt đầu từ Monday +6 rồi mod 7 để chuyển hệ thống ngày

    const days = [];
    for (let i = 0; i < startDay; i++) {
        days.push(<span key={`empty-${i}`} className="day-cell empty"></span>);
    }
    for (let i = 1; i <= daysInMonth(year, month); i++) {
        const isActive = isCurrentMonth && today.getDate() === i;
        days.push(
            <span key={i} className={`day-cell ${isActive ? 'active' : ''}`}>
                {i}
            </span>
        );
    }

    return (
        <main className="main-content-area">
            {/* CENTER: Phần nội dung trung tâm */}
            <div className="center-content">
                <section className="overview">
                    <div className="section-header">
                        <h2>Overview</h2>
                    </div>
                    <div className="overview-cards">
                        {String(user?.role) === "1" ? (
                            <>
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
                            </>
                        ) : (
                            <>
                                <div className="overview-card">
                                    <div className="overview-card-icon"><FontAwesomeIcon icon={faBookOpen} /></div>
                                    <h3>{stats.totalClasses}</h3>
                                    <p>Tổng lớp học tham gia</p>
                                </div>
                                <div className="overview-card">
                                    <div className="overview-card-icon"><FontAwesomeIcon icon={faGraduationCap} /></div>
                                    <h3>{stats.totalCompleted}</h3>
                                    <p>Số bài tập hoàn thành</p>
                                </div>
                                <div className="overview-card">
                                    <div className="overview-card-icon"><FontAwesomeIcon icon={faBullseye} /></div>
                                    <h3>{stats.avgScore}</h3>
                                    <p>Tổng điểm trung bình</p>
                                </div>
                                <div className="overview-card">
                                    <div className="overview-card-icon"><FontAwesomeIcon icon={faChartBar} /></div>
                                    <h3>{stats.classification}</h3>
                                    <p>Xếp loại học tập</p>
                                </div>
                            </>
                        )}
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
                            <p>Bạn chưa tham gia lớp học nào.</p>
                        )}
                    </div>
                </section>

                <section className="assignments">
                    <div className="section-header">
                        <h2>Assignments</h2>
                    </div>
                    <div className="assignments-list">
                        <div className="assignment-item">
                            <div className="assignment-info">
                                <div className="assignment-icon"><FontAwesomeIcon icon={faFont} /></div>
                                <div className="assignment-text">
                                    <h5>Typography test</h5>
                                    <p>Today, 2:30 PM</p>
                                </div>
                            </div>
                            <div className="assignment-grade">--/100</div>
                            <div className="assignment-status">Upcoming</div>
                        </div>
                        <div className="assignment-item">
                            <div className="assignment-info">
                                <div className="assignment-icon"><FontAwesomeIcon icon={faHome} /></div>
                                <div className="assignment-text">
                                    <h5>3D house model</h5>
                                    <p>Today, 3:15 PM</p>
                                </div>
                            </div>
                            <div className="assignment-grade">--/100</div>
                            <div className="assignment-status">Upcoming</div>
                        </div>
                        <div className="assignment-item">
                            <div className="assignment-info">
                                <div className="assignment-icon"><FontAwesomeIcon icon={faImage} /></div>
                                <div className="assignment-text">
                                    <h5>Visual hierarchy</h5>
                                    <p>Today, 4:30 PM</p>
                                </div>
                            </div>
                            <div className="assignment-grade">92/100</div>
                            <div className="assignment-status">Completed</div>
                        </div>
                    </div>
                </section>
            </div>

            {/* PHẢI: Phần lịch biểu và thông tin bên phải */}
            <aside className="right-panel-in-main">
                <div className="calendar-container">
                    <div className="calendar-header">
                        <button onClick={handlePrevMonth}>&lt;</button>
                        <span>{monthNames[month]} {year}</span>
                        <button onClick={handleNextMonth}>&gt;</button>
                    </div>
                    <div className="calendar-grid">
                        <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
                        {days}
                    </div>
                </div>

                <div className="schedule-container">
                    <h4>Schedule</h4>
                    <div className="schedule-item blue">
                        <div className="schedule-header">
                            <h5>User pain points</h5>
                            <FontAwesomeIcon icon={faEllipsisH} className="more-options" />
                        </div>
                        <p>9:00 - 10:00 AM</p>
                    </div>
                    <div className="schedule-item purple">
                        <div className="schedule-header">
                            <h5>Bias theory</h5>
                            <FontAwesomeIcon icon={faEllipsisH} className="more-options" />
                        </div>
                        <p>10:30 - 11:30 AM</p>
                    </div>
                    <div className="schedule-item yellow">
                        <div className="schedule-header">
                            <h5>Typography</h5>
                            <FontAwesomeIcon icon={faEllipsisH} className="more-options" />
                        </div>
                        <p>12:30 - 2:30 PM</p>
                    </div>
                </div>

                <div className="user-profile-card">
                    <div className="avatar-wrapper">
                        <img 
                            src={user?.avatar_url || 'https://via.placeholder.com/80'} 
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
                            <p>{user?.full_name || 'User Name'}</p>
                        )}
                    </div>

                    <div className="profile-info-item">
                        <span className="info-label">Email:</span>
                        <p className="profile-email">{user?.email}</p>
                    </div>

                        <div className="profile-info-item">
                            <span className="info-label">Chức vụ:</span>
                            <span className="profile-role">
                                {String(user?.role) === "1" ? 'Giảng viên' : 'Sinh viên'}
                            </span>
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
                                {universities.map((uni, index) => (
                                    <option key={index} value={uni}>{uni}</option>
                                ))}
                            </select>
                        ) : (
                            <p className="profile-school">{user?.school || 'Chưa cập nhật'}</p>
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
                        <button 
                            onClick={() => setIsEditing(false)}
                            className="cancel-edit-btn"
                        >
                            Hủy
                        </button>
                    )}
                </div>
            </aside>
        </main>
    );
}

export default MainContent;

