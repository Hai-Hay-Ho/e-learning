import React from 'react';
import logoImg from '../assets/img/logo.jpg';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faThLarge, 
    faChartLine, 
    faQuestionCircle, 
    faEnvelope, 
    faCog,
    faLayerGroup
} from '@fortawesome/free-solid-svg-icons';

const Sidebar = ({ userRole, activeTab, setActiveTab, unreadCount }) => {
    // role "0" là Student, "1" là Teacher (dựa trên backend model User.java)
    const isTeacher = userRole === "1";

    return (
        <aside className="sidebar">
            <div className="logo" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <img 
                    src={logoImg} 
                    alt="Logo" 
                    style={{ width: '30px', height: '30px', borderRadius: '4px' }} 
                />
                E-Learning
            </div>
            
            <nav className="menu">
                <div 
                    className={`menu-item ${activeTab === 'Dashboard' ? 'active' : ''}`}
                    onClick={() => setActiveTab('Dashboard')}
                    style={{ cursor: 'pointer' }}
                >
                    <span className="icon"><FontAwesomeIcon icon={faThLarge} /></span> Dashboard
                </div>
                <div 
                    className={`menu-item ${activeTab === 'Classes' ? 'active' : ''}`}
                    onClick={() => setActiveTab('Classes')}
                    style={{ cursor: 'pointer' }}
                >
                    <span className="icon"><FontAwesomeIcon icon={faLayerGroup} /></span> Classes
                </div>
                <div 
                    className={`menu-item ${activeTab === 'Quizzes' ? 'active' : ''}`}
                    onClick={() => setActiveTab('Quizzes')}
                    style={{ cursor: 'pointer' }}
                >
                    <span className="icon"><FontAwesomeIcon icon={faQuestionCircle} /></span> Quizzes
                </div>
                {isTeacher && (
                    <div 
                        className={`menu-item ${activeTab === 'Statistics' ? 'active' : ''}`}
                        onClick={() => setActiveTab('Statistics')}
                        style={{ cursor: 'pointer' }}
                    >
                        <span className="icon"><FontAwesomeIcon icon={faChartLine} /></span> Statistics
                    </div>
                )}
                <div 
                    className={`menu-item ${activeTab === 'Messages' ? 'active' : ''}`}
                    onClick={() => setActiveTab('Messages')}
                    style={{ cursor: 'pointer' }}
                >
                    <span className="icon"><FontAwesomeIcon icon={faEnvelope} /></span> 
                    Messages 
                    {unreadCount > 0 && (
                        <span className="unread-badge">{unreadCount}</span>
                    )}
                </div>
            </nav>

            <div className="sidebar-footer">
                <div className="menu-item">
                    <span className="icon"><FontAwesomeIcon icon={faCog} /></span> Settings
                </div>
            </div>
        </aside>
    );
}

export default Sidebar;
