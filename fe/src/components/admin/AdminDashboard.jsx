import React, { useState, useEffect } from 'react';
import './AdminDashboard.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faUsers, faBookOpen, faCog, faChartPie, 
    faSearch, faExchangeAlt, faSignOutAlt, faBell,
    faUserGraduate, faChalkboardTeacher, faUserPlus, faFileAlt, faQuestionCircle, faCheckCircle, faComments
} from '@fortawesome/free-solid-svg-icons';
import logoImg from '../../assets/img/logo.jpg';
import userAvatar from '../../assets/img/user.jpg';
import { supabase } from '../../supabaseClient';
import ManageUsers from './ManageUsers';

const AdminDashboard = ({ session, userData, onSwitchToStudent }) => {
    const [activeTab, setActiveTab] = useState('Overview');
    const [systemStats, setSystemStats] = useState(null);
    const [recentUsers, setRecentUsers] = useState(null);
    const [systemActivity, setSystemActivity] = useState(null);
    const [loadingStats, setLoadingStats] = useState(false);
    const userDefaultAvatar = userData?.avatarUrl || session?.user?.user_metadata?.avatar_url || userAvatar;
    const userName = userData?.fullName || session?.user?.user_metadata?.full_name || 'Admin';

    useEffect(() => {
        const fetchAllData = async () => {
            setLoadingStats(true);
            try {
                const [statsRes, usersRes, activityRes] = await Promise.all([
                    fetch('http://localhost:8080/api/stats/system'),
                    fetch('http://localhost:8080/api/stats/recent-users'),
                    fetch('http://localhost:8080/api/stats/system-activity')
                ]);

                if (statsRes.ok) {
                    const statsData = await statsRes.json();
                    setSystemStats(statsData);
                }
                if (usersRes.ok) {
                    const usersData = await usersRes.json();
                    setRecentUsers(usersData);
                }
                if (activityRes.ok) {
                    const activityData = await activityRes.json();
                    setSystemActivity(activityData);
                }
            } catch (error) {
                console.error("Error fetching dashboard data:", error);
            } finally {
                setLoadingStats(false);
            }
        };

        fetchAllData();
        // Refresh data every 30 seconds
        const interval = setInterval(fetchAllData, 30000);
        return () => clearInterval(interval);
    }, []);

    const handleLogout = async () => {
        await supabase.auth.signOut();
    };

    return (
        <div className="admin-layout">
            {/* Sidebar */}
            <aside className="admin-sidebar">
                <div className="admin-logo">
                    <img src={logoImg} alt="Logo" />
                    <span>Admin Panel</span>
                </div>
                
                <div className="admin-menu">
                    <div className={`admin-menu-item ${activeTab === 'Overview' ? 'active' : ''}`} onClick={() => setActiveTab('Overview')}>
                        <span className="icon"><FontAwesomeIcon icon={faChartPie} /></span> Overview
                    </div>
                    <div className={`admin-menu-item ${activeTab === 'Users' ? 'active' : ''}`} onClick={() => setActiveTab('Users')}>
                        <span className="icon"><FontAwesomeIcon icon={faUsers} /></span> Manage Users
                    </div>
                    <div className={`admin-menu-item ${activeTab === 'Courses' ? 'active' : ''}`} onClick={() => setActiveTab('Courses')}>
                        <span className="icon"><FontAwesomeIcon icon={faBookOpen} /></span> Manage Courses
                    </div>
                    <div className={`admin-menu-item ${activeTab === 'Settings' ? 'active' : ''}`} onClick={() => setActiveTab('Settings')}>
                        <span className="icon"><FontAwesomeIcon icon={faCog} /></span> System Settings
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="admin-main">
                <header className="admin-header">
                    
                    <div className="admin-header-actions">
                        <button className="switch-view-btn" onClick={onSwitchToStudent}>
                            <FontAwesomeIcon icon={faExchangeAlt} /> Student View
                        </button>
                        
                        <div style={{ color: '#64748b', cursor: 'pointer', fontSize: '18px', padding: '0 10px' }}>
                            <FontAwesomeIcon icon={faBell} />
                        </div>

                        <div className="admin-profile" onClick={handleLogout} title="Click to logout">
                            <div className="admin-profile-info" style={{ textAlign: 'right' }}>
                                <span className="admin-profile-name">{userName}</span>
                                <span className="admin-profile-role">Admin</span>
                            </div>
                            <img src={userDefaultAvatar} alt="Admin Avatar" />
                        </div>
                    </div>
                </header>

                <div className="admin-content">
                    {activeTab === 'Overview' && (
                        <>
                            {/* Stats */}
                            <div className="admin-stats-grid">
                                <div className="stat-card">
                                    <div className="stat-info">
                                        <h3>Tổng người dùng</h3>
                                        <p className="stat-value">{systemStats ? systemStats.totalUsers.toLocaleString() : '0'}</p>
                                    </div>
                                    <div className="stat-icon blue">
                                        <FontAwesomeIcon icon={faUsers} />
                                    </div>
                                </div>
                                <div className="stat-card">
                                    <div className="stat-info">
                                        <h3>Tổng người học</h3>
                                        <p className="stat-value">{systemStats ? systemStats.totalStudents.toLocaleString() : '0'}</p>
                                    </div>
                                    <div className="stat-icon green">
                                        <FontAwesomeIcon icon={faUserGraduate} />
                                    </div>
                                </div>
                                <div className="stat-card">
                                    <div className="stat-info">
                                        <h3>Tổng giáo viên</h3>
                                        <p className="stat-value">{systemStats ? systemStats.totalTeachers.toLocaleString() : '0'}</p>
                                    </div>
                                    <div className="stat-icon orange">
                                        <FontAwesomeIcon icon={faChalkboardTeacher} />
                                    </div>
                                </div>
                                <div className="stat-card">
                                    <div className="stat-info">
                                        <h3>Tổng lớp học</h3>
                                        <p className="stat-value">{systemStats ? systemStats.totalClasses.toLocaleString() : '0'}</p>
                                    </div>
                                    <div className="stat-icon purple">
                                        <FontAwesomeIcon icon={faBookOpen} />
                                    </div>
                                </div>
                            </div>

                            {/* Tables & Activity */}
                            <div className="admin-dashboard-layout">
                                <div className="admin-panel">
                                    <h3>
                                        Recent Users
                                        <span style={{ fontSize: '12px', color: '#4f46e5', cursor: 'pointer', fontWeight: '500' }}>View All</span>
                                    </h3>
                                    <div className="table-wrapper">
                                        <table className="admin-table">
                                            <thead>
                                                <tr>
                                                    <th>User</th>
                                                    <th>Role</th>
                                                    <th>Joined Date</th>
                                                    <th>Status</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {recentUsers && recentUsers.length > 0 ? (
                                                    recentUsers.map((user) => (
                                                        <tr key={user.id}>
                                                            <td>
                                                                <div className="user-cell">
                                                                    <img src={user.avatarUrl || userAvatar} alt="User" />
                                                                    <span style={{ fontWeight: '500' }}>{user.fullName}</span>
                                                                </div>
                                                            </td>
                                                            <td>{user.roleDisplay}</td>
                                                        <td>{user.createdAt ? new Date(user.createdAt).toLocaleDateString('vi-VN') : 'N/A'}</td>
                                                        <td>
                                                            <span className={`status-badge ${user.status === 'Active' ? 'active' : 'pending'}`}>
                                                                {user.status}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan="4" style={{ textAlign: 'center', padding: '20px' }}>Loading...</td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                    </div>
                                </div>

                                <div className="admin-panel">
                                    <h3>System Activity</h3>
                                    <div className="activity-list">
                                        {systemActivity && systemActivity.length > 0 ? (
                                            systemActivity.map((activity, index) => {
                                                const getActivityIcon = (type) => {
                                                    switch(type) {
                                                        case 'user_created': return faUserPlus;
                                                        case 'post_created': return faFileAlt;
                                                        case 'quiz_created': return faQuestionCircle;
                                                        case 'submission_created': return faCheckCircle;
                                                        case 'comment_created': return faComments;
                                                        case 'class_created': return faBookOpen;
                                                        default: return faCog;
                                                    }
                                                };

                                                const timeAgo = (timestamp) => {
                                                    if (!timestamp) return 'N/A';
                                                    const now = new Date();
                                                    const activityTime = new Date(timestamp);
                                                    const diffMs = now - activityTime;
                                                    const diffMins = Math.floor(diffMs / 60000);
                                                    const diffHours = Math.floor(diffMs / 3600000);
                                                    const diffDays = Math.floor(diffMs / 86400000);

                                                    if (diffMins < 1) return 'Just now';
                                                    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
                                                    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
                                                    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
                                                };

                                                return (
                                                    <div className="activity-item" key={index}>
                                                        <div className="activity-icon">
                                                            <FontAwesomeIcon icon={getActivityIcon(activity.type)} />
                                                        </div>
                                                        <div className="activity-details">
                                                            <p>{activity.description}</p>
                                                            <span>{timeAgo(activity.timestamp)}</span>
                                                        </div>
                                                    </div>
                                                );
                                            })
                                        ) : (
                                            <div className="activity-item">
                                                <p style={{ textAlign: 'center', color: '#94a3b8' }}>Loading activities...</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </>
                    )}

                    {activeTab === 'Users' && (
                        <ManageUsers />
                    )}

                    {activeTab !== 'Overview' && activeTab !== 'Users' && (
                        <div className="admin-panel" style={{ height: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>
                            <h3>Module "{activeTab}" is under development</h3>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}

export default AdminDashboard;
