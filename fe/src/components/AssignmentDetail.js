import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faArrowLeft,
    faCalendarAlt,
    faClock,
    faUpload,
    faFileAlt,
    faTimes,
    faCheckCircle,
    faCheck,
    faExclamationTriangle,
    faUsers,
    faPaperPlane,
    faDownload,
    faPaperclip,
    faChevronRight,
    faUndo,
    faStar,
} from '@fortawesome/free-solid-svg-icons';

const AssignmentDetail = ({ post, session, userRole, onBack, selectedClass }) => {
    const isTeacher = userRole === '1';
    const [submissions, setSubmissions] = useState([]);
    const [mySubmission, setMySubmission] = useState(null);
    const [loadingSubmissions, setLoadingSubmissions] = useState(true);
    const [activePanel, setActivePanel] = useState(isTeacher ? 'submissions' : 'my-work');
    const [uploadedFiles, setUploadedFiles] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [selectedSubmission, setSelectedSubmission] = useState(null);
    const [gradeInput, setGradeInput] = useState('');
    const [gradingSubmissionId, setGradingSubmissionId] = useState(null);
    const [gradeComment, setGradeComment] = useState('');

    const deadline = post.deadline ? new Date(post.deadline) : null;
    const now = new Date();
    const isOverdue = deadline && now > deadline;
    const timeLeft = deadline ? getTimeLeft(deadline, now) : null;

    function getTimeLeft(deadline, now) {
        const diff = deadline - now;
        if (diff <= 0) return null;
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        if (days > 0) return `${days} ngày ${hours} giờ`;
        if (hours > 0) return `${hours} giờ ${minutes} phút`;
        return `${minutes} phút`;
    }

    useEffect(() => {
        fetchSubmissions();
    }, [post.id]);

    const fetchSubmissions = async () => {
        setLoadingSubmissions(true);
        try {
            const response = await fetch(`http://localhost:8080/api/submissions/post/${post.id}`);
            if (response.ok) {
                const data = await response.json();
                setSubmissions(data);
                if (!isTeacher) {
                    const mine = data.find(s => s.studentId === session.user.id);
                    setMySubmission(mine || null);
                }
            }
        } catch (err) {
            console.error('Error fetching submissions:', err);
        } finally {
            setLoadingSubmissions(false);
        }
    };

    const handleFileChange = async (e) => {
        const files = Array.from(e.target.files);
        if (!files.length) return;
        setUploading(true);
        const newFiles = [...uploadedFiles];
        for (const file of files) {
            try {
                const fileExt = file.name.split('.').pop();
                const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
                const filePath = `submissions/${post.id}/${session.user.id}/${fileName}`;
                const { error } = await supabase.storage
                    .from('post_attachments')
                    .upload(filePath, file, { cacheControl: '3600', upsert: false });
                if (error) throw error;
                const { data: { publicUrl } } = supabase.storage
                    .from('post_attachments')
                    .getPublicUrl(filePath);
                newFiles.push({ fileUrl: publicUrl, fileName: file.name, fileType: file.type, fileSize: file.size });
            } catch (err) {
                alert(`Lỗi khi tải lên file ${file.name}`);
            }
        }
        setUploadedFiles(newFiles);
        setUploading(false);
    };

    const removeFile = (index) => setUploadedFiles(uploadedFiles.filter((_, i) => i !== index));

    const handleSubmit = async () => {
        if (!uploadedFiles.length) return;
        setSubmitting(true);
        try {
            const response = await fetch('http://localhost:8080/api/submissions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    postId: post.id,
                    studentId: session.user.id,
                    attachments: uploadedFiles,
                }),
            });
            if (response.ok) {
                await fetchSubmissions();
                setUploadedFiles([]);
            }
        } catch (err) {
            console.error('Error submitting:', err);
        } finally {
            setSubmitting(false);
        }
    };

    const handleUnsubmit = async () => {
        if (!mySubmission) return;
        if (!window.confirm('Bạn có chắc muốn hủy nộp bài này?')) return;
        try {
            await fetch(`http://localhost:8080/api/submissions/${mySubmission.id}`, { method: 'DELETE' });
            setMySubmission(null);
            await fetchSubmissions();
        } catch (err) {
            console.error('Error unsubmitting:', err);
        }
    };

    const handleGrade = async (submissionId) => {
        const grade = parseInt(gradeInput, 10);
        if (isNaN(grade) || grade < 0 || grade > 10) {
            alert('Điểm phải từ 0 đến 10');
            return;
        }
        try {
            await fetch(`http://localhost:8080/api/submissions/${submissionId}/grade`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ grade, comment: gradeComment }),
            });
            setGradingSubmissionId(null);
            setGradeInput('');
            setGradeComment('');
            await fetchSubmissions();
        } catch (err) {
            console.error('Error grading:', err);
        }
    };

    const submittedCount = submissions.length;
    const gradedCount = submissions.filter(s => s.grade !== null && s.grade !== undefined).length;

    const formatDeadline = (date) => {
        if (!date) return '';
        return date.toLocaleString('vi-VN', {
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
    };

    return (
        <div className="assignment-detail-root">
            {/* Top bar */}
            <div className="assignment-topbar">
                <button className="assignment-back-btn" onClick={onBack}>
                    <FontAwesomeIcon icon={faArrowLeft} />
                    <span>Quay lại</span>
                </button>
                <div className="assignment-topbar-center">
                    <span className="assignment-class-badge">{selectedClass?.name}</span>
                </div>
                <div style={{ width: 100 }} />
            </div>

            <div className="assignment-layout">
                {/* LEFT: Assignment Info */}
                <div className="assignment-left-panel">
                    <div className="assignment-info-card">
                        <div className="assignment-type-indicator">
                            <FontAwesomeIcon icon={faStar} />
                            <span>Bài tập</span>
                        </div>
                        <h1 className="assignment-title">{post.title}</h1>

                        <div className="assignment-meta-row">
                            <div className="assignment-meta-item">
                                <FontAwesomeIcon icon={faUsers} className="meta-icon" />
                                <span>{post.authorName}</span>
                            </div>
                            {deadline && (
                                <div className={`assignment-meta-item ${isOverdue ? 'overdue' : ''}`}>
                                    <FontAwesomeIcon icon={faCalendarAlt} className="meta-icon" />
                                    <span>
                                        {isOverdue ? 'Đã hết hạn: ' : 'Hạn nộp: '}
                                        {formatDeadline(deadline)}
                                    </span>
                                </div>
                            )}
                            {!isOverdue && timeLeft && (
                                <div className="assignment-meta-item time-left">
                                    <FontAwesomeIcon icon={faClock} className="meta-icon" />
                                    <span>Còn lại: <strong>{timeLeft}</strong></span>
                                </div>
                            )}
                        </div>

                        <div className="assignment-divider" />

                        <div className="assignment-description">
                            <p>{post.content}</p>
                        </div>

                        {post.attachments && post.attachments.length > 0 && (
                            <div className="assignment-attachments-section">
                                <h4>
                                    <FontAwesomeIcon icon={faPaperclip} style={{ marginRight: 8 }} />
                                    Tài liệu đính kèm
                                </h4>
                                {post.attachments.map((att) => (
                                    <a
                                        key={att.id}
                                        href={att.fileUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="assignment-file-link"
                                    >
                                        <div className="file-link-icon">
                                            <FontAwesomeIcon icon={faFileAlt} />
                                        </div>
                                        <div className="file-link-info">
                                            <span className="file-link-name">{att.fileName}</span>
                                            <span className="file-link-meta">
                                                {att.fileSize ? `${(att.fileSize / 1024 / 1024).toFixed(2)} MB` : ''} — {att.fileType}
                                            </span>
                                        </div>
                                        <FontAwesomeIcon icon={faDownload} className="file-link-download" />
                                    </a>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* RIGHT: Teacher = Submissions list | Student = My Work */}
                <div className="assignment-right-panel">
                    {isTeacher ? (
                        <TeacherPanel
                            submissions={submissions}
                            submittedCount={submittedCount}
                            gradedCount={gradedCount}
                            loadingSubmissions={loadingSubmissions}
                            selectedSubmission={selectedSubmission}
                            setSelectedSubmission={setSelectedSubmission}
                            gradingSubmissionId={gradingSubmissionId}
                            setGradingSubmissionId={setGradingSubmissionId}
                            gradeInput={gradeInput}
                            setGradeInput={setGradeInput}
                            gradeComment={gradeComment}
                            setGradeComment={setGradeComment}
                            handleGrade={handleGrade}
                        />
                    ) : (
                        <StudentPanel
                            mySubmission={mySubmission}
                            uploadedFiles={uploadedFiles}
                            uploading={uploading}
                            submitting={submitting}
                            isOverdue={isOverdue}
                            handleFileChange={handleFileChange}
                            removeFile={removeFile}
                            handleSubmit={handleSubmit}
                            handleUnsubmit={handleUnsubmit}
                        />
                    )}
                </div>
            </div>
        </div>
    );
};

/* ==================== TEACHER PANEL ==================== */
const TeacherPanel = ({
    submissions, submittedCount, gradedCount, loadingSubmissions,
    selectedSubmission, setSelectedSubmission,
    gradingSubmissionId, setGradingSubmissionId,
    gradeInput, setGradeInput, gradeComment, setGradeComment,
    handleGrade
}) => (
    <div className="teacher-submission-panel">
        <div className="panel-header">
            <h3>Bài nộp của học sinh</h3>
        </div>

        <div className="submission-stats-row">
            <div className="stat-box submitted">
                <div className="stat-number">{submittedCount}</div>
                <div className="stat-label">Đã nộp</div>
            </div>
            <div className="stat-box graded">
                <div className="stat-number">{gradedCount}</div>
                <div className="stat-label">Đã chấm</div>
            </div>
            <div className="stat-box pending">
                <div className="stat-number">{submittedCount - gradedCount}</div>
                <div className="stat-label">Chờ chấm</div>
            </div>
        </div>

        <div className="submissions-list-container">
            {loadingSubmissions ? (
                <div className="loading-spinner-container">
                    <div className="loading-spinner" />
                    <p>Đang tải...</p>
                </div>
            ) : submissions.length === 0 ? (
                <div className="empty-submissions">
                    <FontAwesomeIcon icon={faFileAlt} size="2x" />
                    <p>Chưa có học sinh nộp bài</p>
                </div>
            ) : (
                submissions.map(sub => (
                    <div
                        key={sub.id}
                        className={`submission-row ${selectedSubmission?.id === sub.id ? 'selected' : ''}`}
                        onClick={() => setSelectedSubmission(sub)}
                    >
                        <div className="submission-row-left">
                            <div className="student-avatar-sm">
                                {sub.studentAvatar
                                    ? <img src={sub.studentAvatar} alt={sub.studentName} />
                                    : (sub.studentName || 'S').charAt(0).toUpperCase()
                                }
                            </div>
                            <div className="submission-row-info">
                                <strong>{sub.studentName || 'Học sinh'}</strong>
                                <span>{new Date(sub.submittedAt).toLocaleString('vi-VN')}</span>
                            </div>
                        </div>
                        <div className="submission-row-right">
                            {sub.grade !== null && sub.grade !== undefined ? (
                                <span className="grade-badge">{sub.grade}/10</span>
                            ) : (
                                <span className="pending-badge">Chờ chấm</span>
                            )}
                            <FontAwesomeIcon icon={faChevronRight} className="chevron-icon" />
                        </div>
                    </div>
                ))
            )}
        </div>

        {/* Selected submission detail */}
        {selectedSubmission && (
            <div className="submission-detail-panel">
                <div className="sdp-header">
                    <div className="student-avatar-sm">
                        {selectedSubmission.studentAvatar
                            ? <img src={selectedSubmission.studentAvatar} alt={selectedSubmission.studentName} />
                            : (selectedSubmission.studentName || 'S').charAt(0).toUpperCase()
                        }
                    </div>
                    <div>
                        <strong>{selectedSubmission.studentName}</strong>
                        <p>Nộp lúc: {new Date(selectedSubmission.submittedAt).toLocaleString('vi-VN')}</p>
                    </div>
                    <button className="sdp-close" onClick={() => setSelectedSubmission(null)}>
                        <FontAwesomeIcon icon={faTimes} />
                    </button>
                </div>

                <div className="sdp-files">
                    <h5>File đã nộp</h5>
                    {(selectedSubmission.attachments || []).map((att, i) => (
                        <a key={i} href={att.fileUrl} target="_blank" rel="noopener noreferrer" className="sdp-file-link">
                            <FontAwesomeIcon icon={faFileAlt} />
                            <span>{att.fileName}</span>
                            <FontAwesomeIcon icon={faDownload} className="ml-auto" />
                        </a>
                    ))}
                </div>

                <div className="sdp-grade-section">
                    <h5>Chấm điểm</h5>
                    {gradingSubmissionId === selectedSubmission.id ? (
                        <div className="grade-input-form">
                            <input
                                type="number"
                                min="0" max="10" step="0.5"
                                placeholder="Điểm (0–10)"
                                value={gradeInput}
                                onChange={e => setGradeInput(e.target.value)}
                                className="grade-input-field"
                            />
                            <textarea
                                placeholder="Nhận xét (tuỳ chọn)"
                                value={gradeComment}
                                onChange={e => setGradeComment(e.target.value)}
                                className="grade-comment-field"
                                rows={3}
                            />
                            <div className="grade-actions">
                                <button className="btn-cancel-grade" onClick={() => setGradingSubmissionId(null)}>Hủy</button>
                                <button className="btn-submit-grade" onClick={() => handleGrade(selectedSubmission.id)}>
                                    <FontAwesomeIcon icon={faCheck} /> Lưu điểm
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="current-grade-display">
                            {selectedSubmission.grade !== null && selectedSubmission.grade !== undefined ? (
                                <>
                                    <div className="grade-circle">{selectedSubmission.grade}<span>/10</span></div>
                                    {selectedSubmission.gradeComment && (
                                        <p className="grade-comment-text">{selectedSubmission.gradeComment}</p>
                                    )}
                                    <button className="btn-edit-grade" onClick={() => {
                                        setGradingSubmissionId(selectedSubmission.id);
                                        setGradeInput(String(selectedSubmission.grade));
                                        setGradeComment(selectedSubmission.gradeComment || '');
                                    }}>Sửa điểm</button>
                                </>
                            ) : (
                                <button className="btn-grade" onClick={() => setGradingSubmissionId(selectedSubmission.id)}>
                                    <FontAwesomeIcon icon={faStar} /> Chấm điểm
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>
        )}
    </div>
);

/* ==================== STUDENT PANEL ==================== */
const StudentPanel = ({
    mySubmission, uploadedFiles, uploading, submitting, isOverdue,
    handleFileChange, removeFile, handleSubmit, handleUnsubmit
}) => (
    <div className="student-work-panel">
        <div className="panel-header">
            <h3>Bài làm của tôi</h3>
            {mySubmission ? (
                <span className="status-chip submitted">
                    <FontAwesomeIcon icon={faCheckCircle} /> Đã nộp
                </span>
            ) : isOverdue ? (
                <span className="status-chip overdue">
                    <FontAwesomeIcon icon={faExclamationTriangle} /> Đã hết hạn
                </span>
            ) : (
                <span className="status-chip pending">Chưa nộp</span>
            )}
        </div>

        {/* Grade display if graded */}
        {mySubmission?.grade !== null && mySubmission?.grade !== undefined && (
            <div className="student-grade-card">
                <div className="grade-circle">{mySubmission.grade}<span>/10</span></div>
                <div>
                    <p className="grade-label">Điểm của bạn</p>
                    {mySubmission.gradeComment && (
                        <p className="grade-comment-text">"{mySubmission.gradeComment}"</p>
                    )}
                </div>
            </div>
        )}

        {/* Already submitted */}
        {mySubmission ? (
            <div className="submitted-files-section">
                <h4>File đã nộp</h4>
                {(mySubmission.attachments || []).map((att, i) => (
                    <a key={i} href={att.fileUrl} target="_blank" rel="noopener noreferrer" className="sdp-file-link">
                        <div className="file-link-icon">
                            <FontAwesomeIcon icon={faFileAlt} />
                        </div>
                        <span className="file-link-name">{att.fileName}</span>
                        <FontAwesomeIcon icon={faDownload} />
                    </a>
                ))}
                <p className="submitted-at-text">
                    Đã nộp lúc {new Date(mySubmission.submittedAt).toLocaleString('vi-VN')}
                </p>
                <button className="btn-unsubmit" onClick={handleUnsubmit}>
                    <FontAwesomeIcon icon={faUndo} /> Hủy nộp bài
                </button>
            </div>
        ) : (
            /* Not yet submitted */
            <div className="upload-work-section">
                {isOverdue && (
                    <div className="overdue-warning">
                        <FontAwesomeIcon icon={faExclamationTriangle} />
                        <span>Bài tập đã hết hạn nộp</span>
                    </div>
                )}

                {/* File upload area */}
                <div className="upload-zone-container">
                    {uploadedFiles.map((f, i) => (
                        <div key={i} className="uploaded-file-item">
                            <div className="file-link-icon">
                                <FontAwesomeIcon icon={faFileAlt} />
                            </div>
                            <span className="file-link-name">{f.fileName}</span>
                            <button className="remove-file-btn" onClick={() => removeFile(i)}>
                                <FontAwesomeIcon icon={faTimes} />
                            </button>
                        </div>
                    ))}

                    <label className="upload-zone" style={{ opacity: isOverdue ? 0.5 : 1 }}>
                        <input
                            type="file"
                            multiple
                            onChange={handleFileChange}
                            style={{ display: 'none' }}
                            disabled={uploading || isOverdue}
                        />
                        <div className="upload-zone-inner">
                            <FontAwesomeIcon icon={uploading ? faClock : faUpload} className={`upload-icon ${uploading ? 'spin' : ''}`} />
                            <p className="upload-zone-text">
                                {uploading ? 'Đang tải lên...' : 'Nhấn để thêm file bài làm'}
                            </p>
                            <p className="upload-zone-sub">hoặc kéo thả file vào đây</p>
                        </div>
                    </label>
                </div>

                <button
                    className="btn-submit-work"
                    disabled={!uploadedFiles.length || submitting || uploading || isOverdue}
                    onClick={handleSubmit}
                >
                    <FontAwesomeIcon icon={faPaperPlane} />
                    {submitting ? 'Đang nộp...' : 'Nộp bài'}
                </button>
            </div>
        )}
    </div>
);

export default AssignmentDetail;
