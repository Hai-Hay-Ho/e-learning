import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faArrowLeft,
    faFileAlt,
    faDownload,
    faCheck,
    faStar,
    faChevronRight,
    faLayerGroup,
    faTasks,
    faUsers,
    faPaperclip,
    faCommentAlt
} from '@fortawesome/free-solid-svg-icons';
import './SubmissionList.css';

const SubmissionList = ({ userRole, session, onBack }) => {
    const isTeacher = userRole === '1';
    
    // Navigation states
    const [viewMode, setViewMode] = useState('classes'); // 'classes', 'assignments', 'submissions', 'grading'
    const [selectedClass, setSelectedClass] = useState(null);
    const [selectedAssignment, setSelectedAssignment] = useState(null);
    const [selectedSubmission, setSelectedSubmission] = useState(null);

    // Data states
    const [classes, setClasses] = useState([]);
    const [assignments, setAssignments] = useState([]);
    const [submissions, setSubmissions] = useState([]);
    const [loading, setLoading] = useState(false);

    // Grading states
    const [gradeInput, setGradeInput] = useState('');
    const [gradeComment, setGradeComment] = useState('');

    useEffect(() => {
        fetchClasses();
    }, []);

    const fetchClasses = async () => {
        setLoading(true);
        try {
            const roleParam = userRole ? `?role=${userRole}` : '';
            const response = await fetch(`http://localhost:8080/api/classes/user/${session.user.id}${roleParam}`);
            if (response.ok) {
                const data = await response.json();
                setClasses(data);
            }
        } catch (err) {
            console.error('Error fetching classes:', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchAssignments = async (classId) => {
        setLoading(true);
        try {
            const response = await fetch(`http://localhost:8080/api/posts/class/${classId}`);
            if (response.ok) {
                const data = await response.json();
                setAssignments(data.filter(p => p.type === 'assignment'));
            }
        } catch (err) {
            console.error('Error fetching assignments:', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchSubmissions = async (postId) => {
        setLoading(true);
        try {
            const url = isTeacher 
                ? `http://localhost:8080/api/submissions/post/${postId}`
                : `http://localhost:8080/api/submissions/post/${postId}/user/${session.user.id}`;
            const response = await fetch(url);
            if (response.ok) {
                const data = await response.json();
                const submissionsArray = Array.isArray(data) ? data : (data ? [data] : []);
                setSubmissions(submissionsArray);
            }
        } catch (err) {
            console.error('Error fetching submissions:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleClassClick = (cls) => {
        setSelectedClass(cls);
        fetchAssignments(cls.id);
        setViewMode('assignments');
    };

    const handleAssignmentClick = (asg) => {
        setSelectedAssignment(asg);
        fetchSubmissions(asg.id);
        setViewMode('submissions');
    };

    const handleSubmissionClick = (sub) => {
        setSelectedSubmission(sub);
        setGradeInput(sub.score?.toString() || '');
        setGradeComment(sub.comment || '');
        setViewMode('grading');
    };

    const handleGrade = async () => {
        const grade = parseFloat(gradeInput);
        if (isNaN(grade) || grade < 0 || grade > 10) {
            alert('Điểm phải từ 0 đến 10');
            return;
        }

        try {
            const response = await fetch(`http://localhost:8080/api/submissions/${selectedSubmission.id}/grade`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ grade, comment: gradeComment }),
            });

            if (response.ok) {
                alert('Chấm điểm thành công!');
                // Refresh data
                fetchSubmissions(selectedAssignment.id);
                setViewMode('submissions');
            }
        } catch (err) {
            console.error('Error grading:', err);
        }
    };

    const renderClasses = () => (
        <div className="submission-list-container">
            <div className="view-header">
                <h2><FontAwesomeIcon icon={faLayerGroup} /> Các lớp học của bạn</h2>
                <p>Chọn một lớp để xem bài tập</p>
            </div>
            <div className="items-grid">
                {classes.map(cls => (
                    <div key={cls.id} className="item-card" onClick={() => handleClassClick(cls)}>
                        <div className="item-card-icon"><FontAwesomeIcon icon={faLayerGroup} /></div>
                        <div className="item-card-info">
                            <h3>{cls.name}</h3>
                            <span>Mã lớp: {cls.joinCode}</span>
                        </div>
                        <FontAwesomeIcon icon={faChevronRight} className="chevron" />
                    </div>
                ))}
            </div>
        </div>
    );

    const renderAssignments = () => (
        <div className="submission-list-container">
            <div className="view-header">
                <button className="back-link" onClick={() => setViewMode('classes')}>
                    <FontAwesomeIcon icon={faArrowLeft} /> Quay lại danh sách lớp
                </button>
                <h2>Bài tập của lớp: {selectedClass.name}</h2>
            </div>
            <div className="items-grid-cards">
                {assignments.length === 0 ? (
                    <p className="empty-msg">Chưa có bài tập nào trong lớp này.</p>
                ) : assignments.map(asg => (
                    <div key={asg.id} className="assignment-grid-card" onClick={() => handleAssignmentClick(asg)}>
                        <div className="card-tag">Assignment</div>
                        <div className="card-main-content">
                            <h3 className="card-title">{asg.title}</h3>
                            <p className="card-description">
                                {asg.content || 'Không có mô tả cho bài tập này.'}
                            </p>
                        </div>
                        <div className="card-footer-layout">
                            <div className="card-author-avatar">
                                {asg.authorAvatar ? (
                                    <img src={asg.authorAvatar} alt={asg.authorName} />
                                ) : (
                                    <div className="avatar-letter">{(asg.authorName || 'T').charAt(0)}</div>
                                )}
                            </div>
                            <div className="card-footer-stats">
                                <div className="stat-item">
                                    <FontAwesomeIcon icon={faPaperclip} />
                                    <span>{asg.attachments?.length || 0}</span>
                                </div>
                                <div className="stat-item">
                                    <FontAwesomeIcon icon={faCommentAlt} />
                                    <span>{asg.commentCount || (asg.recentComments?.length || 0)}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

    const renderSubmissions = () => (
        <div className="submission-list-container">
            <div className="view-header">
                <button className="back-link" onClick={() => setViewMode('assignments')}>
                    <FontAwesomeIcon icon={faArrowLeft} /> Quay lại danh sách bài tập
                </button>
                <h2>{isTeacher ? `Danh sách nộp bài: ${selectedAssignment?.title}` : `Chi tiết bài nộp: ${selectedAssignment?.title}`}</h2>
            </div>
            
            {!isTeacher && submissions.length > 0 ? (
                // View for Student when they have a submission
                <div className="grading-content" style={{ padding: 0 }}>
                    <div className="grading-left-panel">
                        <div className="grading-card">
                            <h3><FontAwesomeIcon icon={faFileAlt} /> File bạn đã nộp</h3>
                            <div className="grading-files-list">
                                {(submissions[0].attachments || submissions[0].files || []).map((file, index) => (
                                    <a key={index} href={file.fileUrl} target="_blank" rel="noopener noreferrer" className="grading-file-item">
                                        <div className="file-icon"><FontAwesomeIcon icon={faFileAlt} /></div>
                                        <div className="file-info">
                                            <span className="file-name">{file.fileName}</span>
                                            <span className="file-meta">Xem tài liệu</span>
                                        </div>
                                        <FontAwesomeIcon icon={faDownload} className="download-icon" />
                                    </a>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="grading-right-panel">
                        <div className="grading-card">
                            <h3><FontAwesomeIcon icon={faStar} /> Kết quả</h3>
                            <div className="grading-form">
                                <div className="form-group">
                                    <label>Điểm số</label>
                                    <div className="grade-display" style={{ fontSize: '24px', fontWeight: 'bold', color: '#1a73e8', padding: '10px 0' }}>
                                        {submissions[0].score !== null && submissions[0].score !== undefined ? (
                                            <span className="grade-val">{submissions[0].score} / 10</span>
                                        ) : (
                                            <span className="pending-text" style={{ color: '#f29900', fontSize: '18px' }}>Chưa có điểm</span>
                                        )}
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label>Nhận xét từ giáo viên</label>
                                    <p className="grade-comment-text" style={{ background: '#f8f9fa', padding: '15px', borderRadius: '8px', borderLeft: '4px solid #dadce0' }}>
                                        {submissions[0].comment || "Chưa có nhận xét."}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                // Standard list view (Teacher or Student without submission)
                <div className="items-list">
                    {submissions.length === 0 ? (
                        <p className="empty-msg">{isTeacher ? "Chưa có học sinh nào nộp bài." : "Bạn chưa nộp bài tập này."}</p>
                    ) : submissions.map(sub => (
                        <div key={sub.id} className="submission-row-item" onClick={() => isTeacher && handleSubmissionClick(sub)}>
                            <div className="sub-user-info">
                                <div className="sub-avatar">{(sub.studentName || 'S').charAt(0).toUpperCase()}</div>
                                <div>
                                    <strong>{sub.studentName || 'Học sinh'}</strong>
                                    <span>Nộp lúc: {new Date(sub.submittedAt).toLocaleString('vi-VN')}</span>
                                </div>
                            </div>
                            <div className="sub-status">
                                {sub.score !== null && sub.score !== undefined ? (
                                    <span className="grade-pill">{sub.score}/10</span>
                                ) : (
                                    <span className="pending-pill">Chờ chấm</span>
                                )}
                                {isTeacher && <FontAwesomeIcon icon={faChevronRight} />}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );

    const renderGrading = () => (
        <div className="submission-grading-root">
            <div className="grading-header">
                <button className="grading-back-btn" onClick={() => setViewMode('submissions')}>
                    <FontAwesomeIcon icon={faArrowLeft} />
                    <span>Quay lại danh sách</span>
                </button>
                <div className="grading-student-info">
                    <div className="student-avatar-lg">
                        {(selectedSubmission.studentName || 'S').charAt(0).toUpperCase()}
                    </div>
                    <div className="student-details">
                        <h2>{selectedSubmission.studentName}</h2>
                        <p>Bài tập: {selectedAssignment.title}</p>
                    </div>
                </div>
            </div>

            <div className="grading-content">
                <div className="grading-left-panel">
                    <div className="grading-card">
                        <h3><FontAwesomeIcon icon={faFileAlt} /> File đã nộp</h3>
                        <div className="grading-files-list">
                            {(selectedSubmission.attachments || selectedSubmission.files || []).map((file, index) => (
                                <a key={index} href={file.fileUrl} target="_blank" rel="noopener noreferrer" className="grading-file-item">
                                    <div className="file-icon"><FontAwesomeIcon icon={faFileAlt} /></div>
                                    <div className="file-info">
                                        <span className="file-name">{file.fileName}</span>
                                        <span className="file-meta">Tải tài liệu</span>
                                    </div>
                                    <FontAwesomeIcon icon={faDownload} className="download-icon" />
                                </a>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="grading-right-panel">
                    <div className="grading-card">
                        <h3><FontAwesomeIcon icon={faStar} /> Chấm điểm</h3>
                        <div className="grading-form">
                            <div className="form-group">
                                <label>Điểm số (0-10)</label>
                                <input
                                    type="number" min="0" max="10" step="0.5"
                                    value={gradeInput}
                                    onChange={(e) => setGradeInput(e.target.value)}
                                    className="grade-input"
                                />
                            </div>
                            <div className="form-group">
                                <label>Nhận xét</label>
                                <textarea
                                    value={gradeComment}
                                    onChange={(e) => setGradeComment(e.target.value)}
                                    rows="5"
                                    className="grade-textarea"
                                />
                            </div>
                            <button className="grade-submit-btn" onClick={handleGrade}>
                                <FontAwesomeIcon icon={faCheck} /> Lưu điểm
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    if (loading) return <div className="loading-area">Đang tải dữ liệu...</div>;

    return (
        <div className="submission-wrapper">
            {viewMode === 'classes' && renderClasses()}
            {viewMode === 'assignments' && renderAssignments()}
            {viewMode === 'submissions' && renderSubmissions()}
            {viewMode === 'grading' && renderGrading()}
        </div>
    );
};

export default SubmissionList;

