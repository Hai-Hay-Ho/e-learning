import React, { useState } from 'react';
import userAvatar from '../assets/img/user.jpg';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faBell } from '@fortawesome/free-solid-svg-icons';
import { supabase } from '../supabaseClient';
import Login from './Login';

const Header = ({ session, onLoginClick }) => {
    const userDefaultAvatar = session?.user?.user_metadata?.avatar_url || userAvatar;
    const userName = session?.user?.user_metadata?.full_name || 'Bạn';

    const handleLogout = async () => {
        await supabase.auth.signOut();
    };

    return (
        <header className="header">
            <h1>{session ? `Chào, ${userName}!` : 'Chào mừng bạn!'}</h1>
            <div className="header-right">
                <span className="header-icon"><FontAwesomeIcon icon={faSearch} /></span>
                <span className="header-icon"><FontAwesomeIcon icon={faBell} /></span>
                
                {session ? (
                    <div className="user-profile" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div className="user-avatar" onClick={handleLogout} title="Đăng xuất">
                            <img 
                                src={userDefaultAvatar}
                                alt="User Avatar"
                                style={{ width: '32px', height: '32px', borderRadius: '50%', cursor: 'pointer', objectFit: 'cover' }}
                            />
                        </div>
                    </div>
                ) : (
                    <button 
                        onClick={onLoginClick}
                        style={{ 
                            background: '#4e73df', 
                            color: 'white', 
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
