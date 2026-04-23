import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import './Class.css';
import AssignmentDetail from './AssignmentDetail';
import { 
    faPlus, 
    faSignInAlt, 
    faUsers,  
    faCalendarAlt,
    faEllipsisH,
    faCopy,
    faBullhorn,
    faFileAlt,
    faTasks,
    faPaperclip,
    faTimes,
    faPaperPlane
} from '@fortawesome/free-solid-svg-icons';

const Class = ({ session, userRole, userData, onSwitchToMessages, classes, setClasses }) => {
    const [setLoading] = useState(false);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showJoinModal, setShowJoinModal] = useState(false);
    const [className, setClassName] = useState('');
    const [joinCode, setJoinCode] = useState('');

    // New states for Posts
    const [selectedClass, setSelectedClass] = useState(null);
    const [posts, setPosts] = useState([]);
    const [showPostModal, setShowPostModal] = useState(false);
    const [postType, setPostType] = useState('announcement');
    const [postTitle, setPostTitle] = useState('');
    const [postContent, setPostContent] = useState('');
    const [attachments, setAttachments] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [postDeadline, setPostDeadline] = useState('');
    const [commentTexts, setCommentTexts] = useState({});
    const [targetClassIds, setTargetClassIds] = useState([]);
    const [showClassSelector, setShowClassSelector] = useState(false);
    
    // States for Editing Post
    const [editingPost, setEditingPost] = useState(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const [activeMenu, setActiveMenu] = useState(null);

    // Assignment Detail view
    const [selectedAssignment, setSelectedAssignment] = useState(null);

    const isTeacher = userRole === "1";

    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => {
        // No longer fetching here as it is handled by parent App.js
    }, [userRole]);

    useEffect(() => {
        let subscription;
        let attachmentSubscription;
        let commentSubscription;
        
        if (selectedClass) {
            fetchPosts(selectedClass.id);

            // Realtime cho bảng bài đăng
            const postChannelName = `class-posts-${selectedClass.id}`;
            subscription = supabase
                .channel(postChannelName)
                .on(
                    'postgres_changes',
                    {
                        event: '*',
                        schema: 'public',
                        table: 'class_posts',
                        filter: `class_id=eq.${selectedClass.id}`
                    },
                    (payload) => {
                        console.log('Post change received via Realtime:', payload.eventType);
                        fetchPosts(selectedClass.id);
                    }
                )
                .subscribe();

            // Realtime cho bảng bình luận (để cập nhật feed bình luận nhanh)
            const commentChannelName = `class-comments-${selectedClass.id}`;
            commentSubscription = supabase
                .channel(commentChannelName)
                .on(
                    'postgres_changes',
                    {
                        event: '*',
                        schema: 'public',
                        table: 'comments'
                    },
                    (payload) => {
                        console.log('Comment change received via Realtime:', payload.eventType);
                        fetchPosts(selectedClass.id); // Tải lại posts để lấy recentComments mới nhất
                    }
                )
                .subscribe();

            // Realtime cho bảng tệp đính kèm (Để cập nhật khi upload/xóa file)
            const attachmentChannelName = `class-attachments-${selectedClass.id}`;
            attachmentSubscription = supabase
                .channel(attachmentChannelName)
                .on(
                    'postgres_changes',
                    {
                        event: '*',
                        schema: 'public',
                        table: 'post_attachments'
                    },
                    () => {
                        console.log('Attachment change received via Realtime');
                        fetchPosts(selectedClass.id);
                    }
                )
                .subscribe();
        }
        return () => {
            if (subscription) supabase.removeChannel(subscription);
            if (attachmentSubscription) supabase.removeChannel(attachmentSubscription);
            if (commentSubscription) supabase.removeChannel(commentSubscription);
        };
    }, [selectedClass]);

    const fetchClassesLocal = async () => {
        setLoading(true);
        try {
            const roleParam = userRole ? `?role=${userRole}` : '';
            const response = await fetch(`http://localhost:8080/api/classes/user/${session.user.id}${roleParam}`);
            if (response.ok) {
                const data = await response.json();
                setClasses(data);
            }
        } catch (err) {
            console.error("Error fetching classes:", err);
        } finally {
            setLoading(false);
        }
    };

    const fetchPosts = async (classId) => {
        try {
            const response = await fetch(`http://localhost:8080/api/posts/class/${classId}`);
            if (response.ok) {
                const data = await response.json();
                setPosts(data);
            }
        } catch (err) {
            console.error("Error fetching posts:", err);
        }
    };

    const handleCommentChange = (postId, text) => {
        setCommentTexts(prev => ({ ...prev, [postId]: text }));
    };

    const submitComment = async (postId) => {
        const content = commentTexts[postId];
        if (!content?.trim()) return;

        try {
            const response = await fetch('http://localhost:8080/api/comments', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    postId: postId,
                    userId: session.user.id,
                    content: content
                })
            });

            if (response.ok) {
                setCommentTexts(prev => ({ ...prev, [postId]: '' }));
                if (selectedClass) {
                    fetchPosts(selectedClass.id);
                }
            }
        } catch (err) {
            console.error("Error submitting comment:", err);
        }
    };

    const handleFileChange = async (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;

        setUploading(true);
        const newAttachments = [...attachments];

        for (const file of files) {
            try {
                const fileExt = file.name.split('.').pop();
                const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
                const filePath = `${selectedClass.id}/${fileName}`;

                // Upload to Supabase Storage
                const { error } = await supabase.storage
                    .from('post_attachments')
                    .upload(filePath, file, {
                        cacheControl: '3600',
                        upsert: false
                    });

                if (error) {
                    throw error;
                }

                // Get Public URL
                const { data: { publicUrl } } = supabase.storage
                    .from('post_attachments')
                    .getPublicUrl(filePath);

                newAttachments.push({
                    fileUrl: publicUrl,
                    fileName: file.name,
                    fileType: file.type,
                    fileSize: file.size
                });
            } catch (err) {
                alert(`L?i khi t?i l�n file ${file.name}`);
            }
        }

        setAttachments(newAttachments);
        setUploading(false);
    };

    const removeAttachment = (index) => {
        setAttachments(attachments.filter((_, i) => i !== index));
    };

    const toggleClassSelection = (classId) => {
        setTargetClassIds(prev => 
            prev.includes(classId) 
                ? prev.filter(id => id !== classId) 
                : [...prev, classId]
        );
    };

    const toggleAllClasses = () => {
        if (targetClassIds.length === classes.length) {
            setTargetClassIds([]);
        } else {
            setTargetClassIds(classes.map(c => c.id));
        }
    };

    const handleCreatePost = async (e) => {
        e.preventDefault();
        if (!postTitle.trim() || !postContent.trim()) return;

        const newPost = {
            classId: selectedClass.id,
            targetClassIds: targetClassIds.length > 0 ? targetClassIds : [selectedClass.id],
            authorId: session.user.id,
            type: postType,
            title: postTitle,
            content: postContent,
            attachments: attachments,
            dueAt: postType === 'assignment' && postDeadline ? postDeadline : null
        };

        try {
            const response = await fetch('http://localhost:8080/api/posts', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(newPost),
            });

            if (response.ok) {
                const data = await response.json();
                console.log("Posts created:", data);
                setShowPostModal(false);
                setPostTitle('');
                setPostContent('');
                setPostType('announcement');
                setAttachments([]);
                setPostDeadline('');
                setTargetClassIds([]);
                fetchPosts(selectedClass.id);
            }
        } catch (err) {
            console.error("Error creating post:", err);
        }
    };

    const handleEditPost = (post) => {
        setEditingPost(post);
        setPostType(post.type);
        setPostTitle(post.title || '');
        setPostContent(post.content || '');
        setAttachments(post.attachments || []);
        setPostDeadline(post.dueAt ? post.dueAt.slice(0, 16) : '');
        setShowEditModal(true);
        setActiveMenu(null);
    };

    const handleUpdatePost = async (e) => {
        e.preventDefault();
        if (!postTitle.trim() || !postContent.trim()) return;

        const updatedPost = {
            ...editingPost,
            type: postType,
            title: postTitle,
            content: postContent,
            attachments: attachments,
            dueAt: postType === 'assignment' && postDeadline ? postDeadline : null
        };

        try {
            const response = await fetch(`http://localhost:8080/api/posts/${editingPost.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updatedPost),
            });

            if (response.ok) {
                setShowEditModal(false);
                setEditingPost(null);
                setPostTitle('');
                setPostContent('');
                setAttachments([]);
                setPostDeadline('');
                // Realtime will refresh the list
            }
        } catch (err) {
            console.error("Error updating post:", err);
        }
    };

    const handleDeletePost = async (postId) => {
        if (!window.confirm("Bạn có chắc chắn muốn xóa bài đăng này không?")) return;

        try {
            const response = await fetch(`http://localhost:8080/api/posts/${postId}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                // Realtime will refresh the list
                setActiveMenu(null);
            }
        } catch (err) {
            console.error("Error deleting post:", err);
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
            } else {
                const errorData = await response.json();
            }
        } catch (err) {
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
                fetchClassesLocal();
            } else {
                const errorData = await response.json();
                alert(errorData.message || "Mã code không hợp lệ hoặc bạn đã tham gia lớp này.");
            }
        } catch (err) {
            console.error(err);
        }
    };

    const copyToClipboard = (code) => {
        navigator.clipboard.writeText(code);
    };

    return (
        <div className="class-container">
            {/* Sidebar */}
            {!selectedAssignment && (
                <div className="class-sidebar">
                    <div className="class-sidebar-header">
                        <div className="class-app-logo">
                            <span>E-Classes</span>
                        </div>
                        
                        <div className="class-actions-header">
                            {isTeacher ? (
                                <button className="class-create-join-btn" onClick={() => setShowCreateModal(true)} title="Tạo lớp học mới">
                                    <FontAwesomeIcon icon={faPlus} />
                                    <span>Tạo</span>
                                </button>
                            ) : (
                                <button className="class-create-join-btn" onClick={() => setShowJoinModal(true)} title="Tham gia lớp học">
                                    <FontAwesomeIcon icon={faSignInAlt} />
                                    <span>Tham gia</span>
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="class-list-section">
                        {classes.length > 0 && (
                            <div className="class-list-label">Lớp học</div>
                        )}
                        
                        {classes.map((cls) => (
                            <div 
                                key={cls.id} 
                                className={`class-list-item ${selectedClass?.id === cls.id ? 'active' : ''}`}
                                onClick={() => setSelectedClass(cls)}
                            >
                                <div className="class-card-mini">
                                    {cls.teacherAvatar ? (
                                        <img src={cls.teacherAvatar} alt={cls.teacherName} />
                                    ) : (
                                        cls.teacherName ? cls.teacherName.charAt(0).toUpperCase() : 'L'
                                    )}
                                </div>
                                <div className="class-info-sidebar">
                                    <div className="class-name-row">
                                        <span className="class-name-sidebar">{cls.name}</span>
                                    </div>
                                    <div className="class-teacher-name-sidebar">{cls.teacherName || "Giáo viên"}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Main Content Area */}
            <div className="class-main-content">
                {selectedAssignment ? (
                    <AssignmentDetail
                        post={selectedAssignment}
                        session={session}
                        userRole={userRole}
                        userData={userData}
                        selectedClass={selectedClass}
                        onBack={() => setSelectedAssignment(null)}
                        onSwitchToMessages={onSwitchToMessages}
                    />
                ) : selectedClass ? (
                    <div className="class-detail-container">
                        <div className="class-detail-scroll-area">
                            <div className="class-banner">
                                <div className="banner-header">
                                </div>
                                <h1>{selectedClass.name}</h1>
                                <p>{selectedClass.teacherName || "Giáo viên"}</p>
                            </div>

                            <div className="class-content-layout">
                                <div className="class-sidebar-info">
                                    <div className="info-card">
                                        <h4>Mã lớp học</h4>
                                        <div className="join-code-display" 
                                             style={{ cursor: 'pointer' }} 
                                             onClick={() => copyToClipboard(selectedClass.joinCode)}>
                                            {selectedClass.joinCode} <FontAwesomeIcon icon={faCopy} size="xs" style={{ opacity: 0.6 }} />
                                        </div>
                                    </div>
                                    <div className="info-card">
                                        <h4>Sắp đến hạn</h4>
                                        <p style={{ fontSize: '12px', color: '#70757a', margin: 0 }}>
                                            Tuyệt vời! Không có bài tập nào sắp đến hạn.
                                        </p>
                                    </div>
                                </div>

                                <div className="posts-feed-section">
                                    {isTeacher && (
                                        <div className="post-composer" onClick={() => setShowPostModal(true)}>
                                            <span className="composer-placeholder">Thông báo mới</span>
                                        </div>
                                    )}

                                    <div className="posts-feed">
                                        {posts.length === 0 ? (
                                            <div style={{ textAlign: 'center', padding: '40px', color: '#5f6368', background: 'white', border: '1px solid #dadce0', borderRadius: '8px' }}>
                                                <FontAwesomeIcon icon={faBullhorn} size="2x" style={{ opacity: 0.2, marginBottom: '16px' }} />
                                                <p>Chưa có bài đăng nào.</p>
                                            </div>
                                        ) : (
                                    posts.map((post) => (
                                        <div 
                                            key={post.id} 
                                            className={`post-item ${post.type === 'assignment' ? 'post-item-assignment' : ''}`} 
                                            onMouseLeave={() => setActiveMenu(null)}
                                            onClick={() => {
                                                setSelectedAssignment(post);
                                            }}
                                            style={{ cursor: 'pointer' }}
                                        >
                                            <div className="post-header-info">
                                                <div className="author-block">
                                                    <div className="user-avatar-small">
                                                        {post.authorAvatar ? (
                                                            <img src={post.authorAvatar} alt={post.authorName} style={{ width: '100%', height: '100%', borderRadius: '50%' }} />
                                                        ) : (
                                                            post.authorName.charAt(0).toUpperCase()
                                                        )}
                                                    </div>
                                                    <div className="author-details">
                                                        <h5>{post.authorName}</h5>
                                                        <span>{new Date(post.createdAt).toLocaleString('vi-VN')}</span>
                                                    </div>
                                                </div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                    <div className={`post-type-tag tag-${post.type}`}>
                                                        <FontAwesomeIcon icon={post.type === 'assignment' ? faTasks : (post.type === 'material' ? faFileAlt : faBullhorn)} style={{ marginRight: '6px' }} />
                                                        {post.type === 'assignment' ? 'Bài tập' : (post.type === 'material' ? 'Tài liệu' : 'Thông báo')}
                                                    </div>
                                                    
                                                    {isTeacher && (
                                                        <div className="post-options-container" style={{ position: 'relative' }}>
                                                            <button 
                                                                className="post-options-btn" 
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    setActiveMenu(activeMenu === post.id ? null : post.id);
                                                                }}
                                                                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '8px', color: '#5f6368' }}
                                                            >
                                                                <FontAwesomeIcon icon={faEllipsisH} />
                                                            </button>
                                                            
                                                            {activeMenu === post.id && (
                                                                <div className="post-dropdown-menu" style={{ 
                                                                    position: 'absolute', 
                                                                    right: 0, 
                                                                    top: '100%', 
                                                                    backgroundColor: 'white', 
                                                                    boxShadow: '0 2px 10px rgba(0,0,0,0.1)', 
                                                                    borderRadius: '4px', 
                                                                    zIndex: 10,
                                                                    width: '120px',
                                                                    padding: '4px 0',
                                                                    border: '1px solid #e0e0e0'
                                                                }}>
                                                                    <button onClick={(e) => { e.stopPropagation(); handleEditPost(post); }} style={{ width: '100%', padding: '8px 16px', textAlign: 'left', border: 'none', background: 'none', cursor: 'pointer', fontSize: '14px' }}>Chỉnh sửa</button>
                                                                    <button onClick={(e) => { e.stopPropagation(); handleDeletePost(post.id); }} style={{ width: '100%', padding: '8px 16px', textAlign: 'left', border: 'none', background: 'none', cursor: 'pointer', fontSize: '14px', color: '#d93025' }}>Xóa</button>
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="post-body">
                                                {post.title && <h4>{post.title}</h4>}
                                                <p>{post.content}</p>

                                                {/* Deadline tag for assignment */}
                                                {post.type === 'assignment' && post.deadline && (
                                                    <div className="post-deadline-tag">
                                                        <FontAwesomeIcon icon={faCalendarAlt} style={{ marginRight: '6px' }} />
                                                        Hạn nộp: {new Date(post.deadline).toLocaleString('vi-VN', {
                                                            weekday: 'short', month: 'long', day: 'numeric',
                                                            hour: '2-digit', minute: '2-digit'
                                                        })}
                                                    </div>
                                                )}

                                                {post.type === 'assignment' && (
                                                    <div className="post-assignment-cta">
                                                        <FontAwesomeIcon icon={faTasks} style={{ marginRight: '6px' }} />
                                                        Xem chi tiết bài tập
                                                    </div>
                                                )}
                                                
                                                {post.attachments && post.attachments.length > 0 && post.type !== 'assignment' && (
                                                    <div className="post-attachments" style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                                        {post.attachments.map((att) => (
                                                            <a 
                                                                key={att.id} 
                                                                href={att.fileUrl} 
                                                                target="_blank" 
                                                                rel="noopener noreferrer"
                                                                style={{ 
                                                                    display: 'flex', 
                                                                    alignItems: 'center', 
                                                                    padding: '10px', 
                                                                    border: '1px solid #dadce0', 
                                                                    borderRadius: '8px', 
                                                                    textDecoration: 'none',
                                                                    color: '#3c4043',
                                                                    background: '#f8f9fa'
                                                                }}
                                                            >
                                                                <FontAwesomeIcon icon={faFileAlt} style={{ marginRight: '12px', color: '#1967d2' }} />
                                                                <div style={{ flex: 1 }}>
                                                                    <div style={{ fontSize: '14px', fontWeight: '500' }}>{att.fileName}</div>
                                                                    <div style={{ fontSize: '12px', color: '#70757a' }}>
                                                                        {att.fileSize ? `${(att.fileSize / 1024 / 1024).toFixed(2)} MB` : ''}
                                                                    </div>
                                                                </div>
                                                            </a>
                                                        ))}
                                                    </div>
                                                )}

                                                {/* Comments Section */}
                                                <div className="post-footer-comments" style={{ borderTop: '1px solid #e0e0e0', marginTop: '16px', paddingTop: '12px' }}>
                                                    {post.recentComments && post.recentComments.length > 0 && (
                                                        <div className="recent-comments-list" style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '12px' }}>
                                                            {post.recentComments.map(comment => (
                                                                <div key={comment.id} className="comment-item-sm" style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                                                                    <div className="user-avatar-xs" style={{ width: '24px', height: '24px', borderRadius: '50%', background: '#ccc', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', flexShrink: 0 }}>
                                                                        {comment.userAvatar ? (
                                                                            <img src={comment.userAvatar} alt={comment.userName} style={{ width: '100%', height: '100%', borderRadius: '50%' }} />
                                                                        ) : comment.userName.charAt(0).toUpperCase()}
                                                                    </div>
                                                                    <div className="comment-content-sm" style={{ flex: 1 }}>
                                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                                            <span style={{ fontWeight: '600', fontSize: '12px' }}>{comment.userName}</span>
                                                                            <span style={{ color: '#5f6368', fontSize: '11px' }}>{new Date(comment.createdAt).toLocaleDateString('vi-VN')}</span>
                                                                        </div>
                                                                        <p style={{ margin: '2px 0 0 0', fontSize: '13px', color: '#3c4043' }}>{comment.content}</p>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}

                                                    <div className="comment-input-area" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                                        <div className="user-avatar-xs" style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#1967d2', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', flexShrink: 0, overflow: 'hidden' }}>
                                                            {userData?.avatarUrl ? (
                                                                <img src={userData.avatarUrl} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                            ) : (
                                                                (userData?.fullName || session.user.email || 'U').charAt(0).toUpperCase()
                                                            )}
                                                        </div>
                                                        <div style={{ flex: 1, position: 'relative', display: 'flex', alignItems: 'center' }}>
                                                            <input 
                                                                type="text"
                                                                placeholder="Thêm nhận xét cho lớp học..."
                                                                value={commentTexts[post.id] || ''}
                                                                onChange={(e) => handleCommentChange(post.id, e.target.value)}
                                                                onClick={(e) => e.stopPropagation()}
                                                                onKeyPress={(e) => {
                                                                    if (e.key === 'Enter') {
                                                                        submitComment(post.id);
                                                                    }
                                                                }}
                                                                style={{ 
                                                                    width: '100%', 
                                                                    padding: '8px 40px 8px 12px', 
                                                                    borderRadius: '20px', 
                                                                    border: '1px solid #dadce0', 
                                                                    fontSize: '13px',
                                                                    outline: 'none'
                                                                }}
                                                            />
                                                            <button 
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    submitComment(post.id);
                                                                }}
                                                                disabled={!commentTexts[post.id]?.trim()}
                                                                style={{ 
                                                                    position: 'absolute', 
                                                                    right: '8px', 
                                                                    background: 'none', 
                                                                    border: 'none', 
                                                                    color: commentTexts[post.id]?.trim() ? '#1967d2' : '#dadce0',
                                                                    cursor: 'pointer',
                                                                    padding: '4px'
                                                                }}
                                                            >
                                                                <FontAwesomeIcon icon={faPaperPlane} />
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                </div>
                </div>
            ) : (
                <div className="class-empty-state">
                    <div className="class-empty-state-icon">
                        <FontAwesomeIcon icon={faUsers} />
                    </div>
                    <div className="class-empty-state-text">
                        {isTeacher ? "Bạn chưa tạo lớp học nào." : "Bạn chưa tham gia lớp học nào."}
                    </div>
                </div>
            )}
            </div>

            {showPostModal && (
                <div className="modal-overlay">
                    <div className="modal-content-custom" style={{ width: '600px', maxHeight: '90vh', overflowY: 'auto' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <h2 style={{ margin: 0 }}>Tạo bài đăng mới</h2>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', position: 'relative' }}>
                                <span style={{ fontSize: '13px', color: '#5f6368' }}>Đăng lên:</span>
                                <button 
                                    type="button"
                                    onClick={() => setShowClassSelector(!showClassSelector)}
                                    style={{ 
                                        padding: '6px 14px', 
                                        borderRadius: '20px', 
                                        border: '1px solid #dadce0', 
                                        background: showClassSelector ? '#f1f5f9' : 'white',
                                        fontSize: '13px',
                                        fontWeight: '600',
                                        color: '#3c4043',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                        transition: 'all 0.2s ease'
                                    }}
                                >
                                    <FontAwesomeIcon icon={faUsers} size="sm" style={{ color: '#4f46e5' }} />
                                    {targetClassIds.length === 0 ? "Lớp hiện tại" : 
                                     targetClassIds.length === classes.length ? "Tất cả lớp" : 
                                     `${targetClassIds.length} lớp đã chọn`}
                                    <span style={{ fontSize: '10px', opacity: 0.5 }}>▼</span>
                                </button>

                                {showClassSelector && (
                                    <div style={{ 
                                        position: 'absolute',
                                        top: '100%',
                                        right: 0,
                                        marginTop: '8px',
                                        width: '280px',
                                        background: 'white', 
                                        padding: '12px', 
                                        borderRadius: '12px', 
                                        boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
                                        border: '1px solid #e0e0e0',
                                        zIndex: 100
                                    }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', borderBottom: '1px solid #f1f5f9', paddingBottom: '8px' }}>
                                            <span style={{ fontWeight: '700', fontSize: '12px', color: '#64748b', textTransform: 'uppercase' }}>Chọn lớp học</span>
                                            <button 
                                                type="button" 
                                                onClick={toggleAllClasses}
                                                style={{ background: 'none', border: 'none', color: '#4f46e5', cursor: 'pointer', fontSize: '12px', fontWeight: '700' }}
                                            >
                                                {targetClassIds.length === classes.length ? "Bỏ chọn" : "Tất cả"}
                                            </button>
                                        </div>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', maxHeight: '200px', overflowY: 'auto', paddingRight: '4px' }}>
                                            {classes.map(cls => (
                                                <div 
                                                    key={cls.id} 
                                                    onClick={() => toggleClassSelection(cls.id)}
                                                    style={{ 
                                                        display: 'flex', 
                                                        alignItems: 'center', 
                                                        gap: '10px', 
                                                        padding: '8px 10px',
                                                        borderRadius: '8px',
                                                        cursor: 'pointer',
                                                        background: targetClassIds.includes(cls.id) || (targetClassIds.length === 0 && cls.id === selectedClass.id) ? '#eef2ff' : 'transparent',
                                                        transition: 'all 0.1s ease'
                                                    }}
                                                >
                                                    <input 
                                                        type="checkbox" 
                                                        checked={targetClassIds.includes(cls.id) || (targetClassIds.length === 0 && cls.id === selectedClass.id)}
                                                        onChange={() => {}} // Controlled by div click
                                                        style={{ cursor: 'pointer' }}
                                                    />
                                                    <span style={{ fontSize: '13px', fontWeight: '500', color: '#334155', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                        {cls.name}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                        <div style={{ marginTop: '10px', paddingTop: '8px', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'flex-end' }}>
                                            <button 
                                                type="button"
                                                onClick={() => setShowClassSelector(false)}
                                                style={{ padding: '4px 12px', background: '#1e293b', color: 'white', border: 'none', borderRadius: '6px', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}
                                            >
                                                Xong
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        <form onSubmit={handleCreatePost}>
                            <div className="form-group">
                                <label>Loại bài đăng</label>
                                <select 
                                    value={postType} 
                                    onChange={(e) => setPostType(e.target.value)}
                                    style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #e0e0e0', marginBottom: '15px' }}
                                >
                                    <option value="announcement">Thông báo</option>
                                    <option value="material">Tài liệu</option>
                                    <option value="assignment">Bài tập</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Tiêu đề</label>
                                <input 
                                    type="text" 
                                    value={postTitle} 
                                    onChange={(e) => setPostTitle(e.target.value)}
                                    placeholder="Nhập tiêu đề"
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Nội dung</label>
                                <textarea 
                                    value={postContent} 
                                    onChange={(e) => setPostContent(e.target.value)}
                                    placeholder="Nhập nội dung bài đăng"
                                    rows="5"
                                    style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #e0e0e0', minHeight: '100px' }}
                                    required
                                ></textarea>
                            </div>

                            {postType === 'assignment' && (
                                <div className="form-group deadline-picker-group">
                                    <label>
                                        <FontAwesomeIcon icon={faCalendarAlt} style={{ marginRight: '8px', color: '#d93025' }} />
                                        Hạn nộp bài (Deadline)
                                    </label>
                                    <input
                                        type="datetime-local"
                                        value={postDeadline}
                                        onChange={(e) => setPostDeadline(e.target.value)}
                                        className="deadline-input"
                                        min={new Date().toISOString().slice(0, 16)}
                                    />
                                    {postDeadline && (
                                        <p className="deadline-preview">
                                            📅 Hạn nộp: {new Date(postDeadline).toLocaleString('vi-VN', {
                                                weekday: 'long', year: 'numeric', month: 'long',
                                                day: 'numeric', hour: '2-digit', minute: '2-digit'
                                            })}
                                        </p>
                                    )}
                                </div>
                            )}
                            
                            <div className="form-group">
                                <label>Tập tin đính kèm ({attachments.length})</label>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    {attachments.map((att, index) => (
                                        <div key={index} style={{ display: 'flex', alignItems: 'center', padding: '8px', border: '1px solid #dadce0', borderRadius: '4px', background: '#f8f9fa' }}>
                                            <FontAwesomeIcon icon={faFileAlt} style={{ marginRight: '8px', color: '#1967d2' }} />
                                            <span style={{ flex: 1, fontSize: '13px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{att.fileName}</span>
                                            <button type="button" onClick={() => removeAttachment(index)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#5f6368' }}>
                                                <FontAwesomeIcon icon={faTimes} />
                                            </button>
                                        </div>
                                    ))}
                                    
                                    <label style={{ 
                                        display: 'flex', 
                                        alignItems: 'center', 
                                        justifyContent: 'center', 
                                        padding: '10px', 
                                        border: '2px dashed #dadce0', 
                                        borderRadius: '4px', 
                                        cursor: 'pointer', 
                                        color: '#1967d2',
                                        gap: '8px',
                                        marginTop: '8px'
                                    }}>
                                        <input 
                                            type="file" 
                                            multiple 
                                            onChange={handleFileChange} 
                                            style={{ display: 'none' }} 
                                            disabled={uploading}
                                        />
                                        <FontAwesomeIcon icon={uploading ? faPlus : faPaperclip} spin={uploading} />
                                        {uploading ? 'Đang tải lên...' : 'Thêm tập tin đính kèm'}
                                    </label>
                                </div>
                            </div>

                            <div className="modal-actions">
                                <button type="button" onClick={() => setShowPostModal(false)}>Hủy</button>
                                <button type="submit" className="confirm-btn">Đăng</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {showEditModal && (
                <div className="modal-overlay">
                    <div className="modal-content-custom" style={{ width: '600px', maxHeight: '90vh', overflowY: 'auto' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <h2 style={{ margin: 0 }}>Chỉnh sửa bài đăng</h2>
                        </div>

                        <form onSubmit={handleUpdatePost}>
                            <div className="form-group">
                                <label>Loại bài đăng</label>
                                <select 
                                    value={postType} 
                                    onChange={(e) => setPostType(e.target.value)}
                                    style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #e0e0e0', marginBottom: '15px' }}
                                >
                                    <option value="announcement">Thông báo</option>
                                    <option value="material">Tài liệu</option>
                                    <option value="assignment">Bài tập</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Tiêu đề</label>
                                <input 
                                    type="text" 
                                    value={postTitle} 
                                    onChange={(e) => setPostTitle(e.target.value)}
                                    placeholder="Nhập tiêu đề"
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Nội dung</label>
                                <textarea 
                                    value={postContent} 
                                    onChange={(e) => setPostContent(e.target.value)}
                                    placeholder="Nhập nội dung bài đăng"
                                    rows="5"
                                    style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #e0e0e0', minHeight: '100px' }}
                                    required
                                ></textarea>
                            </div>

                            {postType === 'assignment' && (
                                <div className="form-group deadline-picker-group">
                                    <label>
                                        <FontAwesomeIcon icon={faCalendarAlt} style={{ marginRight: '8px', color: '#d93025' }} />
                                        Hạn nộp bài (Deadline)
                                    </label>
                                    <input
                                        type="datetime-local"
                                        value={postDeadline}
                                        onChange={(e) => setPostDeadline(e.target.value)}
                                        className="deadline-input"
                                        min={new Date().toISOString().slice(0, 16)}
                                    />
                                    {postDeadline && (
                                        <p className="deadline-preview">
                                            📅 Hạn nộp: {new Date(postDeadline).toLocaleString('vi-VN', {
                                                weekday: 'long', year: 'numeric', month: 'long',
                                                day: 'numeric', hour: '2-digit', minute: '2-digit'
                                            })}
                                        </p>
                                    )}
                                </div>
                            )}
                            
                            <div className="form-group">
                                <label>Tập tin đính kèm ({attachments.length})</label>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    {attachments.map((att, index) => (
                                        <div key={index} style={{ display: 'flex', alignItems: 'center', padding: '8px', border: '1px solid #dadce0', borderRadius: '4px', background: '#f8f9fa' }}>
                                            <FontAwesomeIcon icon={faFileAlt} style={{ marginRight: '8px', color: '#1967d2' }} />
                                            <span style={{ flex: 1, fontSize: '13px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{att.fileName}</span>
                                            <button type="button" onClick={() => removeAttachment(index)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#5f6368' }}>
                                                <FontAwesomeIcon icon={faTimes} />
                                            </button>
                                        </div>
                                    ))}
                                    
                                    <label style={{ 
                                        display: 'flex', 
                                        alignItems: 'center', 
                                        justifyContent: 'center', 
                                        padding: '10px', 
                                        border: '2px dashed #dadce0', 
                                        borderRadius: '4px', 
                                        cursor: 'pointer', 
                                        color: '#1967d2',
                                        gap: '8px',
                                        marginTop: '8px'
                                    }}>
                                        <input 
                                            type="file" 
                                            multiple 
                                            onChange={handleFileChange} 
                                            style={{ display: 'none' }} 
                                            disabled={uploading}
                                        />
                                        <FontAwesomeIcon icon={uploading ? faPlus : faPaperclip} spin={uploading} />
                                        {uploading ? 'Đang tải lên...' : 'Thêm tập tin đính kèm'}
                                    </label>
                                </div>
                            </div>

                            <div className="modal-actions">
                                <button type="button" onClick={() => { setShowEditModal(false); setEditingPost(null); }}>Hủy</button>
                                <button type="submit" className="confirm-btn">Cập nhật</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

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
                                    placeholder="Nhập mã code 6 ký tự"
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
