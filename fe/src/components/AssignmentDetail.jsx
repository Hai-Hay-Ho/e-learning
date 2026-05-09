import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import './AssignmentDetail.css';
import {
    faArrowLeft,
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
    faStar,
    faTasks,
    faBullhorn,
} from '@fortawesome/free-solid-svg-icons';

const AssignmentDetail = ({ post, session, userRole, onBack, selectedClass, userData, onSwitchToMessages }) => {
    const isTeacher = userRole === '1';
    const [submissions, setSubmissions] = useState([]);
    const [mySubmission, setMySubmission] = useState(null);
    const [loadingSubmissions, setLoadingSubmissions] = useState(true);
    const [uploadedFiles, setUploadedFiles] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [loading, setLoading] = useState(false);
    const [filterStatus, setFilterStatus] = useState('all'); // 'all', 'submitted', 'late', 'graded'
    const [isGradingModalOpen, setIsGradingModalOpen] = useState(false);
    const [submissionForGrading, setSubmissionForGrading] = useState(null);
    const [tempGradeInput, setTempGradeInput] = useState('');
    const [tempGradeComment, setTempGradeComment] = useState('');
    const [isGradingSubmitting, setIsGradingSubmitting] = useState(false);

    const deadline = post.dueAt ? new Date(post.dueAt) : null;
    const now = new Date();
    const isOverdue = deadline && now > deadline;
    const timeLeft = deadline ? getTimeLeft(deadline, now) : null;

    // Handle starting a private conversation with the teacher
    const handleMessageTeacher = async () => {
        try {
            // Get teacher info from post (author)
            if (!post.authorId) {
                console.error('Teacher ID not available');
                alert('Không thể tìm thấy thông tin giáo viên');
                return;
            }

            const teacherId = post.authorId;
            const studentId = session.user.id;

            // IDs must be deterministic (least id first, greatest id second) to match the unique index
            const user1_id = studentId < teacherId ? studentId : teacherId;
            const user2_id = studentId < teacherId ? teacherId : studentId;

            // Check if conversation already exists
            const { data: existingConv } = await supabase
                .from('conversations')
                .select('*')
                .or(`and(user1_id.eq.${user1_id},user2_id.eq.${user2_id})`)
                .maybeSingle();

            let conversationId = null;
            if (existingConv) {
                conversationId = existingConv.id;
            } else {
                // Create new conversation
                const { data: newConv, error: createError } = await supabase
                    .from('conversations')
                    .insert([{ user1_id, user2_id }])
                    .select()
                    .single();

                if (createError) {
                    console.error('Error creating conversation:', createError);
                    alert('Lỗi tạo cuộc trò chuyện');
                    return;
                }
                conversationId = newConv.id;
            }

            // Call the callback to switch to messages and set the conversation
            if (onSwitchToMessages) {
                onSwitchToMessages(conversationId, {
                    id: teacherId,
                    full_name: post.authorName,
                });
            }
        } catch (error) {
            console.error('Error in handleMessageTeacher:', error);
            alert('Có lỗi xảy ra khi mở tin nhắn');
        }
    };

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

    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => {
        if (post.type === 'assignment') {
            fetchSubmissions();
        }
        fetchComments();

        // grade realtime updates for teachers and students, comment realtime updates for all 
        const submissionsChannel = supabase
            .channel(`submissions-${post.id}`)
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'submissions',
                    filter: `post_id=eq.${post.id}`
                },
                (payload) => {
                    console.log('Realtime submission change:', payload);
                    fetchSubmissions(); 
                }
            )
            .subscribe();

        // Realtime comments
        const commentsChannel = supabase
            .channel(`comments-view-${post.id}`)
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'comments',
                    filter: `post_id=eq.${post.id}`
                },
                (payload) => {
                    console.log('Realtime comment change:', payload);
                    fetchComments(); 
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(submissionsChannel);
            supabase.removeChannel(commentsChannel);
        };
    }, [post.id]);

    const fetchComments = async () => {
        try {
            const response = await fetch(`http://localhost:8080/api/comments/post/${post.id}`);
            if (response.ok) {
                const data = await response.json();
                setComments(data);
            }
        } catch (err) {
            console.error('Error fetching comments:', err);
        }
    };

    const submitComment = async () => {
        if (!newComment.trim()) return;
        setLoading(true);
        try {
            const response = await fetch('http://localhost:8080/api/comments', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    postId: post.id,
                    userId: session.user.id,
                    content: newComment
                })
            });
            if (response.ok) {
                setNewComment('');
            }
        } catch (err) {
            console.error('Error submitting comment:', err);
        } finally {
            setLoading(false);
        }
    };

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
                    .from('submission_files')
                    .upload(filePath, file, { cacheControl: '3600', upsert: false });
                if (error) throw error;
                const { data: { publicUrl } } = supabase.storage
                    .from('submission_files')
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
            const submissionData = {
                postId: post.id,
                studentId: session.user.id,
                files: uploadedFiles.map(f => ({
                    fileUrl: f.fileUrl,
                    fileName: f.fileName
                }))
            };

            const response = await fetch('http://localhost:8080/api/submissions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(submissionData),
            });
            
            if (response.ok) {
                const updatedSub = await response.json();
                setMySubmission(updatedSub);
                setUploadedFiles([]);
                fetchSubmissions(); 
                alert('Nộp bài thành công!');
            }
        } catch (err) {
            alert('Có lỗi xảy ra khi nộp bài');
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

    const openGradingModal = (submission) => {
        setSubmissionForGrading(submission);
        setTempGradeInput(submission.score ? submission.score.toString() : '');
        setTempGradeComment(submission.gradeComment || '');
        setIsGradingModalOpen(true);
    };

    const closeGradingModal = () => {
        setIsGradingModalOpen(false);
        setSubmissionForGrading(null);
        setTempGradeInput('');
        setTempGradeComment('');
        setIsGradingSubmitting(false);
    };

    const handleModalGradeSubmit = async () => {
        if (!submissionForGrading) return;
        
        const grade = parseFloat(tempGradeInput);
        if (isNaN(grade) || grade < 0 || grade > 10) {
            alert('Điểm phải từ 0 đến 10');
            return;
        }

        setIsGradingSubmitting(true);
        try {
            await fetch(`http://localhost:8080/api/submissions/${submissionForGrading.id}/grade`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ grade, comment: tempGradeComment }),
            });
            await fetchSubmissions();
            closeGradingModal();
        } catch (err) {
            console.error('Error grading:', err);
            alert('Lỗi khi lưu điểm');
        } finally {
            setIsGradingSubmitting(false);
        }
    };

    const handleDeleteFile = async (file) => {
        if (!window.confirm(`Bạn có chắc muốn xóa file "${file.fileName}"?`)) return;
        
        try {
            const pathParts = file.fileUrl.split('/public/submission_files/');
            if (pathParts.length > 1) {
                const filePath = pathParts[1];
                const { error } = await supabase.storage.from('submission_files').remove([filePath]);
                if (error) console.error('Supabase delete error:', error);
            }

            const response = await fetch(`http://localhost:8080/api/submissions/files/${file.id}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                await fetchSubmissions();
            }
        } catch (err) {
            console.error('Error deleting file:', err);
            alert('Có lỗi xảy ra khi xóa file');
        }
    };

    const submittedCount = submissions.length;
    const gradedCount = submissions.filter(s => s.score !== null && s.score !== undefined).length;

    const formatDeadline = (date) => {
        if (!date) return '';
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        const day = date.getDate();
        const month = date.getMonth() + 1;
        const year = date.getFullYear();
        
        return `Đến hạn ${hours}:${minutes} ${day} thg ${month}, ${year}`;
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
                            <FontAwesomeIcon icon={post.type === 'assignment' ? faTasks : (post.type === 'material' ? faFileAlt : faBullhorn)} />
                            <span>{post.type === 'assignment' ? 'Bài tập' : (post.type === 'material' ? 'Tài liệu' : 'Thông báo')}</span>
                        </div>
                        <h1 className="assignment-title">{post.title || (post.type === 'announcement' ? 'Thông báo' : '')}</h1>

                        <div className="assignment-meta-row">
                            <div className="assignment-meta-item author-row">
                                <div className="author-info">
                                    <FontAwesomeIcon icon={faUsers} className="meta-icon" />
                                    <span>{post.authorName}</span>
                                </div>
                                {post.dueAt && (
                                    <>
                                        {!isTeacher && mySubmission?.score !== null && mySubmission?.score !== undefined && (
                                            <div className="student-grade-display">
                                                <FontAwesomeIcon icon={faStar} className="meta-icon" style={{ color: '#1e8e3e' }} />
                                                <span style={{ color: '#1e8e3e', fontWeight: '500' }}>Điểm: {mySubmission.score}/10</span>
                                            </div>
                                        )}
                                        <div className={`deadline-info ${isOverdue ? 'overdue' : ''}`}>
                                            <span>{formatDeadline(new Date(post.dueAt))}</span>
                                        </div>
                                    </>
                                )}
                            </div>
                            {deadline && !isOverdue && timeLeft && (
                                <div className="assignment-meta-item time-left">
                                    <FontAwesomeIcon icon={faClock} className="meta-icon" />
                                    <span>Còn lại: {timeLeft}</span>
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
                                                {att.fileSize ? `${(att.fileSize / 1024 / 1024).toFixed(2)} MB` : ''} 
                                            </span>
                                        </div>
                                        <FontAwesomeIcon icon={faDownload} className="file-link-download" />
                                    </a>
                                ))}
                            </div>
                        )}

                            <>
                                <div className="assignment-divider" />
                                <div className="assignment-comments-section" style={{ marginTop: '24px' }}>
                                    <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', color: '#3c4043' }}>
                                        <FontAwesomeIcon icon={faUsers} />
                                        Bình luận của lớp học ({comments.length})
                                    </h4>
                            
                            <div className="comments-list" style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
                                {comments.map(comment => (
                                    <div key={comment.id} className="comment-item-full" style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                                        <div className="user-avatar-md" style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#ccc', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                            {comment.userAvatar ? (
                                                <img src={comment.userAvatar} alt={comment.userName} style={{ width: '100%', height: '100%', borderRadius: '50%' }} />
                                            ) : comment.userName.charAt(0).toUpperCase()}
                                        </div>
                                        <div className="comment-content-full" style={{ flex: 1 }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                <span style={{ fontWeight: '600', fontSize: '14px' }}>{comment.userName}</span>
                                                <span style={{ color: '#5f6368', fontSize: '12px' }}>{new Date(comment.createdAt).toLocaleString('vi-VN')}</span>
                                            </div>
                                            <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: '#3c4043', lineHeight: '1.5' }}>{comment.content}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="add-comment-detail" >
                                <div className="user-avatar-md" style={{ 
                                    width: '40px', 
                                    height: '40px', 
                                    borderRadius: '50%', 
                                    background: '#1967d2', 
                                    color: 'white', 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    justifyContent: 'center', 
                                    flexShrink: 0, 
                                    overflow: 'hidden',
                                    fontWeight: 'bold',
                                    fontSize: '16px'
                                }}>
                                    {userData?.avatarUrl ? (
                                        <img src={userData.avatarUrl} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    ) : (
                                        (userData?.fullName || session.user.email || 'U').charAt(0).toUpperCase()
                                    )}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <textarea 
                                        placeholder="Thêm bình luận cho lớp học..."
                                        className="comment-textarea"
                                        value={newComment}
                                        onChange={(e) => setNewComment(e.target.value)}
                                        rows="1"
                                        onInput={(e) => {
                                            e.target.style.height = 'auto';
                                            e.target.style.height = (e.target.scrollHeight) + 'px';
                                        }}
                                    />
                                    <div style={{ 
                                        display: 'flex', 
                                        justifyContent: 'flex-end',
                                        marginTop: '12px',
                                        opacity: newComment.trim() ? 1 : 0.6,
                                        transition: 'opacity 0.2s'
                                    }}>
                                        <button 
                                            onClick={submitComment}
                                            disabled={!newComment.trim() || loading}
                                            className={`comment-submit-btn ${newComment.trim() ? 'active' : 'disabled'}`}
                                        >
                                            <FontAwesomeIcon icon={faPaperPlane} size="sm" />
                                            Đăng
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                            </>
                    </div>
                </div>

                {post.type === 'assignment' && (
                    <div className="assignment-right-panel">
                        {isTeacher ? (
                            <TeacherPanel
                                submissions={submissions}
                                submittedCount={submittedCount}
                                gradedCount={gradedCount}
                                loadingSubmissions={loadingSubmissions}
                                deadline={deadline}
                                filterStatus={filterStatus}
                                setFilterStatus={setFilterStatus}
                                onOpenGradingModal={openGradingModal}
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
                                handleDeleteFile={handleDeleteFile}
                                teacherName={post.authorName}
                                onMessageTeacher={handleMessageTeacher}
                            />
                        )}
                    </div>
                )}

                {/* GRADING MODAL */}
                {isTeacher && isGradingModalOpen && (
                    <GradingModal
                        submission={submissionForGrading}
                        isOpen={isGradingModalOpen}
                        onClose={closeGradingModal}
                        gradeInput={tempGradeInput}
                        setGradeInput={setTempGradeInput}
                        gradeComment={tempGradeComment}
                        setGradeComment={setTempGradeComment}
                        handleGrade={handleModalGradeSubmit}
                        isGrading={isGradingSubmitting}
                    />
                )}
            </div>
        </div>
    );
};

/* ==================== TEACHER UI ==================== */
const TeacherPanel = ({
    submissions, submittedCount, gradedCount, loadingSubmissions,
    deadline, filterStatus, setFilterStatus, onOpenGradingModal
}) => {
    const filteredSubmissions = submissions.filter(sub => {
        if (filterStatus === 'all') return true;
        const subDate = new Date(sub.submittedAt);
        const isGraded = sub.score !== null && sub.score !== undefined;
        const isLate = deadline && subDate > deadline;

        if (filterStatus === 'graded') return isGraded;
        if (filterStatus === 'late') return !isGraded && isLate;
        if (filterStatus === 'submitted') return !isGraded && !isLate;
        return true;
    });

    return (
        <div className="teacher-submission-panel">
            <div className="panel-header">
                <h3>Bài nộp của học sinh</h3>
            </div>

            <div className="submission-stats-row">
                <div 
                    className={`stat-box submitted ${filterStatus === 'submitted' ? 'active' : ''}`}
                    onClick={() => setFilterStatus(filterStatus === 'submitted' ? 'all' : 'submitted')}
                    style={{ cursor: 'pointer' }}
                >
                    <div className="stat-number">{submissions.filter(s => (s.score === null || s.score === undefined) && (!deadline || new Date(s.submittedAt) <= deadline)).length}</div>
                    <div className="stat-label">Đúng hạn</div>
                </div>
                <div 
                    className={`stat-box overdue ${filterStatus === 'late' ? 'active' : ''}`}
                    onClick={() => setFilterStatus(filterStatus === 'late' ? 'all' : 'late')}
                    style={{ cursor: 'pointer' }}
                >
                    <div className="stat-number">{submissions.filter(s => (s.score === null || s.score === undefined) && deadline && new Date(s.submittedAt) > deadline).length}</div>
                    <div className="stat-label">Nộp muộn</div>
                </div>
                <div 
                    className={`stat-box graded ${filterStatus === 'graded' ? 'active' : ''}`}
                    onClick={() => setFilterStatus(filterStatus === 'graded' ? 'all' : 'graded')}
                    style={{ cursor: 'pointer' }}
                >
                    <div className="stat-number">{gradedCount}</div>
                    <div className="stat-label">Đã chấm</div>
                </div>
            </div>

            <div className="submissions-list-container">
                {loadingSubmissions ? (
                    <div className="loading-spinner-container">
                        <div className="loading-spinner" />
                        <p>Đang tải...</p>
                    </div>
                ) : filteredSubmissions.length === 0 ? (
                    <div className="empty-submissions">
                        <FontAwesomeIcon icon={faFileAlt} size="2x" />
                        <p>{filterStatus === 'all' ? 'Chưa có học sinh nộp bài' : 'Không có bài nộp nào khớp với bộ lọc'}</p>
                        {filterStatus !== 'all' && (
                            <button className="btn-clear-filter" onClick={() => setFilterStatus('all')} style={{ marginTop: '10px', padding: '4px 12px', borderRadius: '4px', border: '1px solid #dadce0', background: 'white', cursor: 'pointer', fontSize: '12px' }}>
                                Xóa bộ lọc
                            </button>
                        )}
                    </div>
                ) : (
                    filteredSubmissions.map(sub => {
                        const subDate = new Date(sub.submittedAt);
                        const isLate = deadline && subDate > deadline;
                        const isGraded = sub.score !== null && sub.score !== undefined;

                        return (
                            <div
                                key={sub.id}
                                className="submission-row"
                                onClick={() => onOpenGradingModal(sub)}
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
                                        <span>{subDate.toLocaleString('vi-VN')}</span>
                                    </div>
                                </div>
                                <div className="submission-row-right">
                                    {isGraded ? (
                                        <span className="grade-badge">{sub.score}/10</span>
                                    ) : isLate ? (
                                        <span className="late-badge" style={{ color: '#d93025', backgroundColor: '#fce8e6', padding: '2px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: '500' }}>Nộp muộn</span>
                                    ) : (
                                        <span className="submitted-badge" style={{ color: '#188038', backgroundColor: '#e6f4ea', padding: '2px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: '500' }}>Đã nộp</span>
                                    )}
                                    <FontAwesomeIcon icon={faChevronRight} className="chevron-icon" />
                                </div>
                            </div>
                        );
                    })
                )}
            </div>


        </div>
    );
};

/* ==================== STUDENT UI ==================== */
const StudentPanel = ({
    mySubmission, uploadedFiles, uploading, submitting, isOverdue,
    handleFileChange, removeFile, handleSubmit, handleUnsubmit, handleDeleteFile,
    teacherName, onMessageTeacher
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

        

        <div className="upload-work-section">
            <div className="upload-zone-container">
                {mySubmission && (mySubmission.files || []).map((file, i) => (
                    <div key={`submitted-${i}`} className="uploaded-file-item submitted">
                        <div className="file-link-icon">
                            <FontAwesomeIcon icon={faFileAlt} />
                        </div>
                        <a href={file.fileUrl} target="_blank" rel="noopener noreferrer" className="file-link-name-submitted">
                            {file.fileName}
                        </a>
                        <button className="remove-file-btn" onClick={() => handleDeleteFile(file)}>
                            <FontAwesomeIcon icon={faTimes} />
                        </button>
                    </div>
                ))}

                {uploadedFiles.map((f, i) => (
                    <div key={`new-${i}`} className="uploaded-file-item">
                        <div className="file-link-icon">
                            <FontAwesomeIcon icon={faFileAlt} />
                        </div>
                        <span className="file-link-name">{f.fileName}</span>
                        <button className="remove-file-btn" onClick={() => removeFile(i)}>
                            <FontAwesomeIcon icon={faTimes} />
                        </button>
                    </div>
                ))}

                <label className="upload-zone" style={{ opacity: 1 }}>
                    <input
                        type="file"
                        multiple
                        onChange={handleFileChange}
                        style={{ display: 'none' }}
                        disabled={uploading}
                    />
                    <div className="upload-zone-inner">
                        <FontAwesomeIcon icon={uploading ? faClock : faUpload} className={`upload-icon ${uploading ? 'spin' : ''}`} />
                        <p className="upload-zone-text">
                            {uploading ? 'Đang tải lên...' : 'Thêm file bài làm'}
                        </p>
                    </div>
                </label>
            </div>

            {mySubmission && (
                <p className="submitted-at-text" style={{ marginTop: '8px' }}>
                    Đã nộp lúc {new Date(mySubmission.submittedAt).toLocaleString('vi-VN')}
                </p>
            )}

            {isOverdue && !mySubmission && (
                <div className="overdue-warning">
                    <FontAwesomeIcon icon={faExclamationTriangle} />
                    <span>Bài tập đã hết hạn nộp</span>
                </div>
            )}

            <div className="student-actions-row">
                <button
                    className="btn-submit-work"
                    disabled={!uploadedFiles.length || submitting || uploading}
                    onClick={handleSubmit}
                >
                    <FontAwesomeIcon icon={faPaperPlane} />
                    {submitting ? 'Đang xử lý...' : (mySubmission ? 'Nộp bổ sung' : 'Nộp bài')}
                </button>
            </div>

            {/* Private Comment Section */}
            <div style={{ marginTop: '32px' }}>
                <div 
                    className="private-comment-section"
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        padding: '20px',
                        backgroundColor: '#fff',
                        borderRadius: '12px',
                        border: '1px solid #e8eaed',
                        transition: 'box-shadow 0.2s ease',
                        boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                        gap: '12px',
                    }}
                >
                    {/* Header: Icon + Label */}
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                    }}>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: '40px',
                            height: '40px',
                            borderRadius: '50%',
                            backgroundColor: '#e8f0fe',
                            color: '#1967d2',
                            flexShrink: 0,
                            fontSize: '18px',
                        }}>
                            <FontAwesomeIcon icon={faUsers} />
                        </div>
                        <div style={{
                            fontSize: '15px',
                            fontWeight: '600',
                            color: '#202124',
                        }}>Nhận xét riêng tư</div>
                    </div>
                    
                    {/* Clickable Text */}
                    <div 
                        onClick={onMessageTeacher}
                        style={{
                            fontSize: '14px',
                            color: '#1967d2',
                            fontWeight: '500',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            display: 'inline-block',
                            padding: '6px 12px',
                            borderRadius: '6px',
                            backgroundColor: 'transparent',
                            width: 'fit-content',
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.color = '#1256b9';
                            e.currentTarget.style.backgroundColor = '#e8f0fe';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.color = '#1967d2';
                            e.currentTarget.style.backgroundColor = 'transparent';
                        }}
                    >Thêm nhận xét cho {teacherName}</div>
                </div>
            </div>
                </div>
            </div>
);

/* ==================== GRADING MODAL ==================== */
const GradingModal = ({
    submission, isOpen, onClose, gradeInput, setGradeInput,
    gradeComment, setGradeComment, handleGrade, isGrading
}) => {
    if (!isOpen || !submission) return null;

    return (
        <div className="grading-modal-overlay">
            <div className="grading-modal-content">
                {/* Header */}
                <div className="grading-modal-header">
                    <div className="student-info-header">
                        <div className="student-avatar-modal">
                            {submission.studentAvatar ? (
                                <img src={submission.studentAvatar} alt={submission.studentName} />
                            ) : (submission.studentName || 'S').charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <h2>{submission.studentName || 'Học sinh'}</h2>
                            <p style={{ margin: '4px 0 0 0', color: '#5f6368', fontSize: '13px' }}>
                                Nộp lúc: {new Date(submission.submittedAt).toLocaleString('vi-VN')}
                            </p>
                        </div>
                    </div>
                    <button className="modal-close-btn" onClick={onClose}>
                        <FontAwesomeIcon icon={faTimes} />
                    </button>
                </div>

                {/* Submitted Files */}
                <div className="grading-modal-files">
                    <h4>
                        <FontAwesomeIcon icon={faPaperclip} style={{ marginRight: '8px' }} />
                        File đã nộp
                    </h4>
                    {(submission.attachments || []).map((file, idx) => (
                        <a
                            key={idx}
                            href={file.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="modal-file-link"
                        >
                            <FontAwesomeIcon icon={faFileAlt} />
                            <span>{file.fileName}</span>
                            <FontAwesomeIcon icon={faDownload} />
                        </a>
                    ))}
                    {(!submission.attachments || submission.attachments.length === 0) && (
                        <p style={{ color: '#5f6368', fontSize: '13px', fontStyle: 'italic' }}>Không có file</p>
                    )}
                </div>

                {/* Grading Form */}
                <div className="grading-modal-form">
                    <h4>
                        <FontAwesomeIcon icon={faStar} style={{ marginRight: '8px', color: '#d93025' }} />
                        Chấm điểm
                    </h4>

                    <div className="grade-form-group">
                        <label>Điểm (0–10)</label>
                        <input
                            type="number"
                            min="0"
                            max="10"
                            step="0.5"
                            placeholder="Nhập điểm"
                            value={gradeInput}
                            onChange={(e) => {
                                let value = e.target.value;
                                if (value === '') {
                                    setGradeInput('');
                                    return;
                                }
                                let num = parseFloat(value);
                                if (isNaN(num)) return;
                                if (num > 10) num = 10;
                                if (num < 0) num = 0;

                                setGradeInput(num);
                            }}
                            className="grade-input"
                            disabled={isGrading}
                        />
                    </div>


                    <div className="grading-modal-actions">
                        <button
                            className="btn-cancel"
                            onClick={onClose}
                            disabled={isGrading}
                        >
                            Hủy
                        </button>
                        <button
                            className="btn-submit"
                            onClick={() => handleGrade(submission.id)}
                            disabled={isGrading || !gradeInput}
                        >
                            <FontAwesomeIcon icon={faCheck} style={{ marginRight: '6px' }} />
                            {isGrading ? 'Đang lưu...' : 'Lưu điểm'}
                        </button>
                    </div>

                    {submission.score !== null && submission.score !== undefined && (
                        <div style={{ marginTop: '16px', padding: '12px', backgroundColor: '#e6f4ea', borderRadius: '8px', fontSize: '13px', color: '#188038' }}>
                            <div>Điểm hiện tại: <strong>{submission.score}/10</strong></div>
                            {submission.gradeComment && (
                                <div style={{ marginTop: '8px', fontStyle: 'italic' }}>Nhận xét: {submission.gradeComment}</div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AssignmentDetail;
