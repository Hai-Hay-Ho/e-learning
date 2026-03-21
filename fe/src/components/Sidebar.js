import React from 'react';
import logoImg from '../assets/img/logo.jpg';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faThLarge, 
    faChartLine, 
    faBook, 
    faClipboardList, 
    faEnvelope, 
    faCog,
    faLayerGroup,
    faTasks
} from '@fortawesome/free-solid-svg-icons';

const Sidebar = ({ userRole }) => {
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
                Learnbox
            </div>
            
            <nav className="menu">
                <div className="menu-item active">
                    <span className="icon"><FontAwesomeIcon icon={faThLarge} /></span> Dashboard
                </div>
                <div className="menu-item">
                    <span className="icon"><FontAwesomeIcon icon={faLayerGroup} /></span> Classes
                </div>
                <div className="menu-item">
                    <span className="icon"><FontAwesomeIcon icon={faTasks} /></span> Assignments
                </div>
                <div className="menu-item">
                    <span className="icon"><FontAwesomeIcon icon={faChartLine} /></span> Quizzes
                </div>
                {isTeacher && (
                    <div className="menu-item">
                        <span className="icon"><FontAwesomeIcon icon={faBook} /></span> Analytics
                    </div>
                )}
                <div className="menu-item">
                    <span className="icon"><FontAwesomeIcon icon={faEnvelope} /></span> Messages
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
