import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faUsers, 
    faStar, 
    faCheckCircle, 
    faFileExcel,
    faSearch, 
    faEllipsisV,
    faGraduationCap,
    faChartPie
} from '@fortawesome/free-solid-svg-icons';
import { supabase } from '../supabaseClient';
import ExcelJS from 'exceljs';
import './Analytics.css';

const Analytics = ({ session, classes, onSwitchToMessages }) => {
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
    const isTeacher = currentClass && session?.user?.id === currentClass.teacherId;

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

    const handleExportExcel = async () => {
        const defaultName = `Bao_cao_${currentClass?.name?.replace(/\s+/g, '_') || 'lop_hoc'}`;
        const fileName = window.prompt("Nhập tên file Excel:", defaultName);
        
        if (fileName === null) return;
        const finalFileName = fileName.trim() || defaultName;

        const workbook = new ExcelJS.Workbook();

        // ===== SHEET 1: TỔNG QUAN =====
        const summarySheet = workbook.addWorksheet("Tổng Quan", { 
            pageSetup: { paperSize: 9, orientation: 'portrait' } 
        });

        // Tiêu đề
        const titleRow = summarySheet.addRow(["BÁO CÁO PHÂN TÍCH LỚP HỌC"]);
        titleRow.font = { bold: true, size: 16, color: { argb: "FFFFFFFF" } };
        titleRow.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF4472C4" } };
        titleRow.alignment = { horizontal: "center", vertical: "center" };
        summarySheet.mergeCells("A1:B1");
        summarySheet.getRow(1).height = 28;

        // Dòng trống
        summarySheet.addRow([]);

        // Thông tin lớp
        const classRow = summarySheet.addRow(["Lớp", currentClass?.name || "N/A"]);
        classRow.getCell(1).font = { bold: true };
        classRow.getCell(1).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFE7E6E6" } };

        // Ngày xuất
        const dateRow = summarySheet.addRow(["Ngày xuất", new Date().toLocaleDateString('vi-VN')]);
        dateRow.getCell(1).font = { bold: true };
        dateRow.getCell(1).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFE7E6E6" } };

        // Dòng trống
        summarySheet.addRow([]);

        // Thống kê
        const stats1Row = summarySheet.addRow(["Tổng số học sinh", stats.totalStudents]);
        stats1Row.getCell(1).font = { bold: true };
        stats1Row.getCell(1).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFE7E6E6" } };
        stats1Row.getCell(2).number = stats.totalStudents;

        const stats2Row = summarySheet.addRow(["Điểm trung bình", parseFloat(stats.averageScore.toFixed(1))]);
        stats2Row.getCell(1).font = { bold: true };
        stats2Row.getCell(1).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFE7E6E6" } };
        stats2Row.getCell(2).numFmt = '0.0';

        const stats3Row = summarySheet.addRow(["Tỷ lệ hoàn thành (%)", parseFloat(stats.completionRate.toFixed(1))]);
        stats3Row.getCell(1).font = { bold: true };
        stats3Row.getCell(1).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFE7E6E6" } };
        stats3Row.getCell(2).numFmt = '0.0';

        const stats4Row = summarySheet.addRow(["Phân bố học lực", getDistributionLabel(stats.standardDeviation)]);
        stats4Row.getCell(1).font = { bold: true };
        stats4Row.getCell(1).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFE7E6E6" } };

        summarySheet.columns = [
            { width: 25 },
            { width: 35 }
        ];

        // ===== SHEET 2: DANH SÁCH HỌC SINH =====
        const studentSheet = workbook.addWorksheet("Danh Sách Học Sinh");

        // Header row
        const headerRow = studentSheet.addRow([
            "STT", "Họ tên", "Email", "Điểm số", "Hoàn thành (%)", "Cảnh báo"
        ]);
        
        headerRow.font = { bold: true, color: { argb: "FFFFFFFF" }, size: 11 };
        headerRow.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF4472C4" } };
        headerRow.alignment = { horizontal: "center", vertical: "center" };
        studentSheet.getRow(1).height = 22;

        // Dữ liệu học sinh
        filteredStudents.forEach((student, index) => {
            const row = studentSheet.addRow([
                index + 1,
                student.name,
                student.email,
                parseFloat(student.averageScore.toFixed(1)),
                parseFloat(student.completionPercentage.toFixed(1)),
                student.warningLevel
            ]);

            // Border và alignment
            row.eachCell({ includeEmpty: true }, (cell) => {
                cell.border = {
                    top: { style: "thin", color: { argb: "FFD3D3D3" } },
                    left: { style: "thin", color: { argb: "FFD3D3D3" } },
                    bottom: { style: "thin", color: { argb: "FFD3D3D3" } },
                    right: { style: "thin", color: { argb: "FFD3D3D3" } }
                };
                cell.alignment = { horizontal: "center", vertical: "center" };
            });

            // Number formatting
            row.getCell(4).numFmt = '0.0';  // Điểm số
            row.getCell(5).numFmt = '0.0';  // Hoàn thành
        });

        // Column widths
        studentSheet.columns = [
            { width: 6 },
            { width: 22 },
            { width: 28 },
            { width: 12 },
            { width: 15 },
            { width: 14 }
        ];

        // Tải file
        const buffer = await workbook.xlsx.writeBuffer();
        const blob = new Blob([buffer], { 
            type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
        });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${finalFileName}.xlsx`;
        a.click();
        window.URL.revokeObjectURL(url);
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

    const getDistributionLabel = (standardDeviation) => {
        if (standardDeviation < 1) return 'Rất đều';
        if (standardDeviation < 1.5) return 'Khá đều';
        if (standardDeviation < 2) return 'Bình thường';
        if (standardDeviation < 3) return 'Lệch cao';
        return 'Lệch rất cao';
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

    const handleMessageStudent = async (student) => {
        if (!onSwitchToMessages) return;

        try {
            const otherUser = {
                id: student.id,
                full_name: student.name,
                avatar_url: student.avatarUrl,
                email: student.email
            };

            const user1_id = session.user.id < otherUser.id ? session.user.id : otherUser.id;
            const user2_id = session.user.id < otherUser.id ? otherUser.id : session.user.id;

            // Kiểm tra xem đã có conversation chưa
            let { data: existingConv } = await supabase
                .from('conversations')
                .select('*')
                .or(`and(user1_id.eq.${user1_id},user2_id.eq.${user2_id})`)
                .maybeSingle();

            if (existingConv) {
                onSwitchToMessages(existingConv.id, otherUser);
                return;
            }

            // Tạo conversation mới
            const { data: newConv, error: createError } = await supabase
                .from('conversations')
                .insert([{ user1_id, user2_id }])
                .select()
                .single();

            if (createError) {
                console.error('Error creating conversation:', createError);
                alert('Lỗi tạo cuộc trò chuyện.');
            } else {
                onSwitchToMessages(newConv.id, otherUser);
            }
        } catch (err) {
            console.error("Error starting message:", err);
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
                        <button className="btn-export" onClick={handleExportExcel}>
                            <FontAwesomeIcon icon={faFileExcel} />
                            Xuất Excel
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
                            <div className="card-value">{getDistributionLabel(stats.standardDeviation)}</div>
                            <div className="card-label">Phân bố học lực</div>
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
                                                {student.id !== session?.user?.id && (
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
                                                                    onClick={() => handleMessageStudent(student)}
                                                                    style={{ 
                                                                        width: '100%', 
                                                                        padding: '8px 16px', 
                                                                        textAlign: 'left', 
                                                                        border: 'none', 
                                                                        background: 'none', 
                                                                        cursor: 'pointer', 
                                                                        fontSize: '14px', 
                                                                        color: '#0f172a',
                                                                        fontWeight: '500',
                                                                        borderBottom: isTeacher ? '1px solid #f1f5f9' : 'none'
                                                                                                        }}
                                                                >
                                                                    Nhắn tin
                                                                </button>
                                                                {isTeacher && (
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
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
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
