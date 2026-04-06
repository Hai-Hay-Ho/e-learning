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
    faUsers
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
        if (isTeacher) {
            fetchClasses();
        }
    }, []);

    const fetchClasses = async () => {
        setLoading(true);
        try {
            const response = await fetch(`http://localhost:8080/api/classes/user/${session.user.id}?role=1`);
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
            const response = await fetch(`http://localhost:8080/api/submissions/post/${postId}`);
            if (response.ok) {
                const data = await response.json();
                setSubmissions(data);
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
        setGradeInput(sub.grade?.toString() || '');
        setGradeComment(sub.gradeComment || '');
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
                            <span>Mã lớp: {cls.code}</span>
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
            <div className="items-grid">
                {assignments.length === 0 ? (
                    <p className="empty-msg">Chưa có bài tập nào trong lớp này.</p>
                ) : assignments.map(asg => (
                    <div key={asg.id} className="item-card" onClick={() => handleAssignmentClick(asg)}>
                        <div className="item-card-icon asg"><FontAwesomeIcon icon={faTasks} /></div>
                        <div className="item-card-info">
                            <h3>{asg.title}</h3>
                            <span>Tác giả: {asg.authorName}</span>
                        </div>
                        <FontAwesomeIcon icon={faChevronRight} className="chevron" />
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
                <h2>Danh sách nộp bài: {selectedAssignment.title}</h2>
            </div>
            <div className="items-list">
                {submissions.length === 0 ? (
                    <p className="empty-msg">Chưa có học sinh nào nộp bài.</p>
                ) : submissions.map(sub => (
                    <div key={sub.id} className="submission-row-item" onClick={() => handleSubmissionClick(sub)}>
                        <div className="sub-user-info">
                            <div className="sub-avatar">{(sub.studentName || 'S').charAt(0).toUpperCase()}</div>
                            <div>
                                <strong>{sub.studentName}</strong>
                                <span>Nộp lúc: {new Date(sub.submittedAt).toLocaleString('vi-VN')}</span>
                            </div>
                        </div>
                        <div className="sub-status">
                            {sub.grade !== null && sub.grade !== undefined ? (
                                <span className="grade-pill">{sub.grade}/10</span>
                            ) : (
                                <span className="pending-pill">Chờ chấm</span>
                            )}
                            <FontAwesomeIcon icon={faChevronRight} />
                        </div>
                    </div>
                ))}
            </div>
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

