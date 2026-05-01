import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faUsers, 
    faStar, 
    faCheckCircle, 
    faFilePdf, 
    faSearch, 
    faEllipsisV,
    faGraduationCap,
    faChartPie
} from '@fortawesome/free-solid-svg-icons';
import './Analytics.css';

const Analytics = ({ session, classes }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [scoreFilter, setScoreFilter] = useState('all');
    const [selectedClassId, setSelectedClassId] = useState(classes && classes.length > 0 ? classes[0].id : null);
    const [stats, setStats] = useState({
        totalStudents: 0,
        averageScore: 0,
        completionRate: 0,
        standardDeviation: 0,
        students: []
    });
    const [activeStudentMenu, setActiveStudentMenu] = useState(null);

    const currentClass = classes?.find(c => c.id === selectedClassId) || (classes && classes[0]);

    useEffect(() => {
        if (selectedClassId) {
            fetchStats(selectedClassId);
        }
    }, [selectedClassId]);

    const fetchStats = async (classId) => {
        try {
            const response = await fetch(`http://localhost:8080/api/stats/class/${classId}`);
            if (response.ok) {
                const data = await response.json();
                setStats(data);
            }
        } catch (error) {
            console.error('Error fetching class stats:', error);
        }
    };




    const filteredStudents = (stats.students || []).filter(student => {
        const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesScore = scoreFilter === 'all' 
            || (scoreFilter === 'high' && student.averageScore >= 8)
            || (scoreFilter === 'mid' && student.averageScore >= 5 && student.averageScore < 8)
            || (scoreFilter === 'low' && student.averageScore < 5);
        return matchesSearch && matchesScore;
    });

    const handleExportPDF = () => {
        alert('Đang xuất báo cáo PDF cho lớp ' + (currentClass?.name || ''));
    };

    const getScoreClass = (score) => {
        if (score >= 8) return 'score-high';
        if (score >= 5) return 'score-mid';
        return 'score-low';
    };

    const getWarningClass = (level) => {
        if (level === 'Thấp') return 'warning-low';
        if (level === 'Trung bình') return 'warning-mid';
        return 'warning-high';
    };

    const handleRemoveStudent = async (studentId) => {
        if (!window.confirm("Bạn có chắc chắn muốn xóa học sinh này khỏi lớp?")) return;

        try {
            const response = await fetch(`http://localhost:8080/api/classes/${selectedClassId}/students/${studentId}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                fetchStats(selectedClassId);
                setActiveStudentMenu(null);
            } else {
                const errorData = await response.json();
                alert(errorData.message || "Lỗi khi xóa học sinh.");
            }
        } catch (err) {
            console.error("Error removing student:", err);
            alert("Lỗi kết nối máy chủ.");
        }
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
                            <div className="card-value">{stats.totalStudents}</div>
                            <div className="card-label">Tổng số học sinh</div>
                        </div>
                        <div className="analytics-card">
                            <div className="card-icon icon-purple">
                                <FontAwesomeIcon icon={faStar} />
                            </div>
                            <div className="card-value">{stats.averageScore.toFixed(1)}</div>
                            <div className="card-label">Điểm trung bình</div>
                        </div>
                        <div className="analytics-card">
                            <div className="card-icon icon-green">
                                <FontAwesomeIcon icon={faCheckCircle} />
                            </div>
                            <div className="card-value">{stats.completionRate.toFixed(0)}%</div>
                            <div className="card-label">Tỷ lệ hoàn thành</div>
                        </div>
                        <div className="analytics-card">
                            <div className="card-icon icon-orange">
                                <FontAwesomeIcon icon={faChartPie} />
                            </div>
                            <div className="card-value">{stats.standardDeviation.toFixed(1)}</div>
                            <div className="card-label">Độ lệch chuẩn</div>
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
                                        <th>Cảnh báo</th>
                                        <th></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredStudents.map(student => (
                                        <tr key={student.id}>
                                            <td>
                                                <div className="student-info">
                                                    <div className="student-avatar">
                                                        {student.avatarUrl ? <img src={student.avatarUrl} alt="" /> : student.name.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <span className="student-name">{student.name}</span>
                                                        <span className="student-email">{student.email}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <span className={`score-badge ${getScoreClass(student.averageScore)}`}>
                                                    {student.averageScore.toFixed(1)}
                                                </span>
                                            </td>
                                            <td>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                    <div className="completion-bar-bg">
                                                        <div 
                                                            className="completion-bar-fill" 
                                                            style={{ 
                                                                width: `${student.completionPercentage}%`,
                                                                background: student.completionPercentage > 80 ? '#22c55e' : (student.completionPercentage > 50 ? '#f59e0b' : '#ef4444')
                                                            }}
                                                        ></div>
                                                    </div>
                                                    <span style={{ fontSize: '12px', fontWeight: '600' }}>{student.completionPercentage}%</span>
                                                </div>
                                            </td>
                                            <td style={{ color: '#64748b', fontSize: '14px' }}>
                                                {student.lastActive}
                                            </td>
                                            <td>
                                                <span className={`warning-chip ${getWarningClass(student.warningLevel)}`}>
                                                    {student.warningLevel}
                                                </span>
                                            </td>
                                            <td>
                                                <div style={{ position: 'relative' }}>
                                                    <button 
                                                        onClick={() => setActiveStudentMenu(activeStudentMenu === student.id ? null : student.id)}
                                                        style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '8px' }}
                                                    >
                                                        <FontAwesomeIcon icon={faEllipsisV} />
                                                    </button>
                                                    
                                                    {activeStudentMenu === student.id && (
                                                        <div className="student-dropdown-menu" style={{ 
                                                            position: 'absolute', 
                                                            right: '100%', 
                                                            top: '0', 
                                                            backgroundColor: 'white', 
                                                            boxShadow: '0 4px 12px rgba(0,0,0,0.15)', 
                                                            borderRadius: '8px', 
                                                            zIndex: 100,
                                                            width: '120px',
                                                            padding: '8px 0',
                                                            border: '1px solid #e2e8f0',
                                                            marginRight: '8px'
                                                        }}>
                                                            <button 
                                                                onClick={() => handleRemoveStudent(student.id)}
                                                                style={{ 
                                                                    width: '100%', 
                                                                    padding: '8px 16px', 
                                                                    textAlign: 'left', 
                                                                    border: 'none', 
                                                                    background: 'none', 
                                                                    cursor: 'pointer', 
                                                                    fontSize: '14px', 
                                                                    color: '#ef4444',
                                                                    fontWeight: '500'
                                                                }}
                                                            >
                                                                Xóa khỏi lớp
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
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
