import React from 'react';

const Sidebar = () => {
    return (
        <aside className="sidebar">
            <div className="logo">
                <span style={{color: '#000'}}>💠</span>
                Learnbox
            </div>
            
            <nav className="menu">
                <div className="menu-item active">
                    <span className="icon">🏠</span> Dashboard
                </div>
                <div className="menu-item">
                    <span className="icon">📈</span> Activity
                </div>
                <div className="menu-item">
                    <span className="icon">📚</span> Courses
                </div>
                <div className="menu-item">
                    <span className="icon">📝</span> Assignments
                </div>
                <div className="menu-item">
                    <span className="icon">✉️</span> Messages
                </div>
            </nav>

            <div className="sidebar-footer">
                <div className="menu-item">
                    <span className="icon">⚙️</span> Settings
                </div>
            </div>
        </aside>
    );
}

export default Sidebar;
