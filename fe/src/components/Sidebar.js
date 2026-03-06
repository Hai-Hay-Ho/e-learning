import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faThLarge, 
    faChartLine, 
    faBook, 
    faClipboardList, 
    faEnvelope, 
    faCog,
    faLayerGroup
} from '@fortawesome/free-solid-svg-icons';

const Sidebar = () => {
    return (
        <aside className="sidebar">
            <div className="logo">
                <FontAwesomeIcon icon={faLayerGroup} style={{ color: '#000', marginRight: '8px' }} />
                Learnbox
            </div>
            
            <nav className="menu">
                <div className="menu-item active">
                    <span className="icon"><FontAwesomeIcon icon={faThLarge} /></span> Dashboard
                </div>
                <div className="menu-item">
                    <span className="icon"><FontAwesomeIcon icon={faChartLine} /></span> Activity
                </div>
                <div className="menu-item">
                    <span className="icon"><FontAwesomeIcon icon={faBook} /></span> Courses
                </div>
                <div className="menu-item">
                    <span className="icon"><FontAwesomeIcon icon={faClipboardList} /></span> Assignments
                </div>
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
