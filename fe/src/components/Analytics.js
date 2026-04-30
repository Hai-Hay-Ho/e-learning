import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faUsers, 
    faStar, 
    faCheckCircle, 
    faFilePdf, 
    faSearch, 
    faArrowUp,
    faEllipsisV,
    faGraduationCap,
    faChartPie
} from '@fortawesome/free-solid-svg-icons';
import './Analytics.css';

const Analytics = ({ session, classes }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [scoreFilter, setScoreFilter] = useState('all');
    const [selectedClassId, setSelectedClassId] = useState(classes && classes.length > 0 ? classes[0].id : null);

    // Mock data for analytics
    const mockStudents = [
        { id: 1, name: 'Nguyễn Văn A', email: 'vana@example.com', score: 9.5, completion: 100, lastActive: '2 giờ trước', status: 'Active', avatar: null },
        { id: 2, name: 'Trần Thị B', email: 'thib@example.com', score: 8.0, completion: 90, lastActive: '5 giờ trước', status: 'Active', avatar: null },
        { id: 3, name: 'Lê Văn C', email: 'vanc@example.com', score: 4.5, completion: 40, lastActive: '1 ngày trước', status: 'Inactive', avatar: null },
        { id: 4, name: 'Phạm Minh D', email: 'minhd@example.com', score: 7.2, completion: 75, lastActive: '3 giờ trước', status: 'Active', avatar: null },
        { id: 5, name: 'Hoàng Anh E', email: 'anhe@example.com', score: 6.8, completion: 60, lastActive: '12 giờ trước', status: 'Active', avatar: null },
        { id: 6, name: 'Đặng Thu F', email: 'thuf@example.com', score: 8.5, completion: 95, lastActive: '45 phút trước', status: 'Active', avatar: null },
        { id: 7, name: 'Bùi Gia G', email: 'giag@example.com', score: 3.2, completion: 20, lastActive: '3 ngày trước', status: 'Inactive', avatar: null },
        { id: 8, name: 'Vũ Hải H', email: 'haih@example.com', score: 9.0, completion: 100, lastActive: '1 giờ trước', status: 'Active', avatar: null },
    ];

    const currentClass = classes?.find(c => c.id === selectedClassId) || (classes && classes[0]);

    const filteredStudents = mockStudents.filter(student => {
        const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesScore = scoreFilter === 'all' 
            || (scoreFilter === 'high' && student.score >= 8)
            || (scoreFilter === 'mid' && student.score >= 5 && student.score < 8)
            || (scoreFilter === 'low' && student.score < 5);
        return matchesSearch && matchesScore;
    });

    const avgScore = (mockStudents.reduce((acc, s) => acc + s.score, 0) / mockStudents.length).toFixed(1);
    const completionRate = (mockStudents.reduce((acc, s) => acc + s.completion, 0) / mockStudents.length).toFixed(0);

    const handleExportPDF = () => {
        alert('Đang xuất báo cáo PDF cho lớp ' + (currentClass?.name || ''));
    };

    const getScoreClass = (score) => {
        if (score >= 8) return 'score-high';
        if (score >= 5) return 'score-mid';
        return 'score-low';
    };

    return (
        <div className="analytics-container-wrapper">
            {/* Secondary Sidebar: Class List */}
            <aside className="analytics-sidebar-secondary">
                <div className="sidebar-secondary-header">
                    <h2>E-Stats</h2>
                </div>
                
                <div className="analytics-class-list">
                    {classes && classes.length > 0 ? (
                        classes.map(cls => (
                            <div 
                                key={cls.id} 
                                className={`analytics-class-item ${selectedClassId === cls.id ? 'active' : ''}`}
                                onClick={() => setSelectedClassId(cls.id)}
                            >
                                <div className="class-icon-circle">
                                    {cls.teacherAvatar ? (
                                        <img src={cls.teacherAvatar} alt="" />
                                    ) : (
                                        <FontAwesomeIcon icon={faGraduationCap} />
                                    )}
                                </div>
                                <div className="class-info-brief">
                                    <span className="class-name-text">{cls.name}</span>
                                    <span className="class-teacher-text">{cls.teacherName || 'Giáo viên'}</span>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="empty-classes">Không có lớp học nào</div>
                    )}
                </div>
            </aside>

            {/* Main Analytics Content */}
            <div className="analytics-main-layout">
                <header className="analytics-header">
                    <div className="header-title">
                        <div className="title-with-icon">
                            <FontAwesomeIcon icon={faChartPie} className="title-icon" />
                            <div>
                                <h1>{currentClass?.name || 'Tổng quan phân tích'}</h1>
                                <p className="subtitle">Báo cáo chi tiết hiệu suất học tập</p>
                            </div>
                        </div>
                    </div>
                    <div className="analytics-actions">
                        <button className="btn-export" onClick={handleExportPDF}>
                            <FontAwesomeIcon icon={faFilePdf} />
                            Xuất PDF
                        </button>
                    </div>
                </header>

                <main className="analytics-content">
                    {/* Overview Cards */}
                    <div className="overview-grid">
                        <div className="analytics-card">
                            <div className="card-icon icon-blue">
                                <FontAwesomeIcon icon={faUsers} />
                            </div>
                            <div className="card-value">{mockStudents.length}</div>
                            <div className="card-label">Tổng số học sinh</div>
                        </div>
                        <div className="analytics-card">
                            <div className="card-icon icon-purple">
                                <FontAwesomeIcon icon={faStar} />
                            </div>
                            <div className="card-value">{avgScore}</div>
                            <div className="card-label">Điểm trung bình</div>
                        </div>
                        <div className="analytics-card">
                            <div className="card-icon icon-green">
                                <FontAwesomeIcon icon={faCheckCircle} />
                            </div>
                            <div className="card-value">{completionRate}%</div>
                            <div className="card-label">Tỷ lệ hoàn thành</div>
                        </div>
                        <div className="analytics-card">
                            <div className="card-icon icon-orange">
                                <FontAwesomeIcon icon={faArrowUp} />
                            </div>
                            <div className="card-value">12%</div>
                            <div className="card-label">Tăng trưởng</div>
                        </div>
                    </div>

                    {/* Student List Section */}
                    <div className="list-section">
                        <div className="list-header">
                            <h2>Danh sách học sinh</h2>
                            <div className="filter-group">
                                <div className="search-wrapper">
                                    <FontAwesomeIcon icon={faSearch} className="search-icon" />
                                    <input 
                                        type="text" 
                                        placeholder="Tìm kiếm..." 
                                        className="search-input"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>
                                <select 
                                    className="score-filter"
                                    value={scoreFilter}
                                    onChange={(e) => setScoreFilter(e.target.value)}
                                >
                                    <option value="all">Tất cả điểm</option>
                                    <option value="high">Giỏi (8+)</option>
                                    <option value="mid">Khá (5-8)</option>
                                    <option value="low">Yếu (&lt;5)</option>
                                </select>
                            </div>
                        </div>

                        <div className="analytics-table-container">
                            <table className="analytics-table">
                                <thead>
                                    <tr>
                                        <th>Học sinh</th>
                                        <th>Điểm số</th>
                                        <th>Hoàn thành</th>
                                        <th>Hoạt động cuối</th>
                                        <th>Trạng thái</th>
                                        <th></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredStudents.map(student => (
                                        <tr key={student.id}>
                                            <td>
                                                <div className="student-info">
                                                    <div className="student-avatar">
                                                        {student.avatar ? <img src={student.avatar} alt="" /> : student.name.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <span className="student-name">{student.name}</span>
                                                        <span className="student-email">{student.email}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <span className={`score-badge ${getScoreClass(student.score)}`}>
                                                    {student.score.toFixed(1)}
                                                </span>
                                            </td>
                                            <td>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                    <div className="completion-bar-bg">
                                                        <div 
                                                            className="completion-bar-fill" 
                                                            style={{ 
                                                                width: `${student.completion}%`,
                                                                background: student.completion > 80 ? '#22c55e' : (student.completion > 50 ? '#f59e0b' : '#ef4444')
                                                            }}
                                                        ></div>
                                                    </div>
                                                    <span style={{ fontSize: '12px', fontWeight: '600' }}>{student.completion}%</span>
                                                </div>
                                            </td>
                                            <td style={{ color: '#64748b', fontSize: '14px' }}>
                                                {student.lastActive}
                                            </td>
                                            <td>
                                                <span className={`status-chip ${student.status === 'Active' ? 'status-active' : 'status-inactive'}`}>
                                                    {student.status}
                                                </span>
                                            </td>
                                            <td>
                                                <button style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
                                                    <FontAwesomeIcon icon={faEllipsisV} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default Analytics;
