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
    faShareAlt,
    faBullhorn,
    faFileAlt,
    faTasks,
    faArrowLeft,
    faPaperclip,
    faTimes
} from '@fortawesome/free-solid-svg-icons';

const Class = ({ session, userRole }) => {
    const [classes, setClasses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showJoinModal, setShowJoinModal] = useState(false);
    const [className, setClassName] = useState('');
    const [joinCode, setJoinCode] = useState('');
    const [error, setError] = useState(null);

    // New states for Posts
    const [selectedClass, setSelectedClass] = useState(null);
    const [posts, setPosts] = useState([]);
    const [showPostModal, setShowPostModal] = useState(false);
    const [postType, setPostType] = useState('announcement');
    const [postTitle, setPostTitle] = useState('');
    const [postContent, setPostContent] = useState('');
    const [attachments, setAttachments] = useState([]);
    const [uploading, setUploading] = useState(false);
    
    // States for Editing Post
    const [editingPost, setEditingPost] = useState(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const [activeMenu, setActiveMenu] = useState(null);

    const isTeacher = userRole === "1";

    useEffect(() => {
        fetchClasses();
    }, [userRole]);

    useEffect(() => {
        let subscription;
        let attachmentSubscription;
        
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
                        // Lưu ý: post_attachments có thể không có class_id, 
                        // nhưng khi có bất kỳ file nào thay đổi, ta fetch lại posts là an toàn nhất
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
        };
    }, [selectedClass]);

    const fetchClasses = async () => {
        setLoading(true);
        try {
            const roleParam = userRole ? `?role=${userRole}` : '';
            const response = await fetch(`http://localhost:8080/api/classes/user/${session.user.id}${roleParam}`);
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
                const { data, error } = await supabase.storage
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

    const handleCreatePost = async (e) => {
        e.preventDefault();
        if (!postTitle.trim() || !postContent.trim()) return;

        const newPost = {
            classId: selectedClass.id,
            authorId: session.user.id,
            type: postType,
            title: postTitle,
            content: postContent,
            attachments: attachments
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
                console.log("Post created:", data);
                // Realtime will handle fetching
                setShowPostModal(false);
                setPostTitle('');
                setPostContent('');
                setPostType('announcement');
                setAttachments([]);
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
            attachments: attachments
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
                setError(errorData.message || "Kh�ng th? t?o l?p h?c");
            }
        } catch (err) {
            setError("L?i k?t n?i server");
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
            console.error(err);
        }
    };

    const copyToClipboard = (code) => {
        navigator.clipboard.writeText(code);
    };

    return (
        <div className="main-content">
            {selectedClass ? (
                <div className="class-detail-container">
                    <div className="class-banner">
                        <div className="banner-header">
                            <button className="back-link-btn" onClick={() => setSelectedClass(null)}>
                                <FontAwesomeIcon icon={faArrowLeft} />
                            </button>
                        </div>
                        <h1>{selectedClass.name}</h1>
                        <p>{selectedClass.teacherName || "Gi�o vi�n"}</p>
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
                                        <div key={post.id} className="post-item" onMouseLeave={() => setActiveMenu(null)}>
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
                                                                    <button onClick={() => handleEditPost(post)} style={{ width: '100%', padding: '8px 16px', textAlign: 'left', border: 'none', background: 'none', cursor: 'pointer', fontSize: '14px' }}>Chỉnh sửa</button>
                                                                    <button onClick={() => handleDeletePost(post.id)} style={{ width: '100%', padding: '8px 16px', textAlign: 'left', border: 'none', background: 'none', cursor: 'pointer', fontSize: '14px', color: '#d93025' }}>Xóa</button>
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="post-body">
                                                {post.title && <h4>{post.title}</h4>}
                                                <p>{post.content}</p>
                                                
                                                {post.attachments && post.attachments.length > 0 && (
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
                                                                        {att.fileSize ? `${(att.fileSize / 1024 / 1024).toFixed(2)} MB` : ''} {att.fileType}
                                                                    </div>
                                                                </div>
                                                            </a>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>

                    {showPostModal && (
                        <div className="modal-overlay">
                            <div className="modal-content-custom" style={{ width: '500px' }}>
                                <h2>Tạo bài đăng mới</h2>
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
                            <div className="modal-content-custom" style={{ width: '500px' }}>
                                <h2>Chỉnh sửa bài đăng</h2>
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
                                            placeholder="Nội dung bài đăng"
                                            rows="5"
                                            style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #e0e0e0', minHeight: '100px' }}
                                            required
                                        ></textarea>
                                    </div>
                                    
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
                                                {uploading ? 'Đang tải lên...' : 'Thêm tệp đính kèm'}
                                            </label>
                                        </div>
                                    </div>

                                    <div className="modal-actions">
                                        <button type="button" onClick={() => {
                                            setShowEditModal(false);
                                            setEditingPost(null);
                                            setPostTitle('');
                                            setPostContent('');
                                            setAttachments([]);
                                        }}>Hủy</button>
                                        <button type="submit" className="confirm-btn">Lưu thay đổi</button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}
                </div>
            ) : (
                <>
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
                                <div key={cls.id} className="course-card-custom" onClick={() => setSelectedClass(cls)} style={{ cursor: 'pointer' }}>
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
                                        <button className="more-btn-custom" onClick={(e) => { e.stopPropagation(); }}><FontAwesomeIcon icon={faEllipsisH} /></button>
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
                                            <span onClick={(e) => { e.stopPropagation(); copyToClipboard(cls.joinCode); }}>
                                                <FontAwesomeIcon icon={faIdBadge} style={{ color: '#5f6368', marginRight: '5px' }} />
                                                <span style={{ fontSize: '13px', color: '#5f6368' }}>{cls.joinCode}</span>
                                            </span>
                                        </div>
                                        <div className="course-actions-btns">
                                            <button className="footer-icon-btn" onClick={(e) => e.stopPropagation()}><FontAwesomeIcon icon={faShareAlt} /></button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </>
            )}

            {showCreateModal && (
                <div className="modal-overlay">
                    <div className="modal-content-custom">
                        <h2>Tạo lớp học mới</h2>
                        <form onSubmit={handleCreateClass}>
                            <div className="form-group">
                                <label>Tạo lớp học</label>
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
