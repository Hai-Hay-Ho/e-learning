import React, { useState } from 'react';
import userAvatar from '../assets/img/user.jpg';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faBell } from '@fortawesome/free-solid-svg-icons';
import { supabase } from '../supabaseClient';
import Login from '../auth/Login';

const Header = ({ session, onLoginClick }) => {
    const userDefaultAvatar = session?.user?.user_metadata?.avatar_url || userAvatar;
    const userName = session?.user?.user_metadata?.full_name || 'Bạn';

    const handleLogout = async () => {
        await supabase.auth.signOut();
    };

    return (
        <header className="header">
            <h1>{session ? `Chào, ${userName}!` : ''}</h1>
            <div className="header-right">
                <span className="header-icon"><FontAwesomeIcon icon={faSearch} /></span>
                <span className="header-icon"><FontAwesomeIcon icon={faBell} /></span>
                
                {session ? (
                    <div className="header-user-wrapper">
                        <div className="user-avatar-container">
                            <img 
                                src={userDefaultAvatar}
                                alt="User Avatar"
                                className="nav-avatar"
                            />
                            <div className="avatar-dropdown">
                                <button onClick={handleLogout} className="logout-btn">
                                    Đăng xuất
                                </button>
                            </div>
                        </div>
                    </div>
                ) : (
                    <button 
                        onClick={onLoginClick}
                        style={{ 
                            background: '#dee2e6', 
                            color: '#343a40', 
                            border: 'none', 
                            padding: '8px 16px', 
                            borderRadius: '5px', 
                            cursor: 'pointer',
                            fontWeight: 'bold'
                        }}
                    >
                        Đăng nhập
                    </button>
                )}
            </div>
        </header>
    );
}

export default Header;
