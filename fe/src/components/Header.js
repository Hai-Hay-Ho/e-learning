import React, { useState } from 'react';
import userAvatar from '../assets/img/user.jpg';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faBell } from '@fortawesome/free-solid-svg-icons';
import Login from './Login';

const Header = () => {
    const [showLogin, setShowLogin] = useState(false);

    return (
        <header className="header">
            <h1>Hi, Hồ Hải! </h1>
            <div className="header-right">
                <span className="header-icon"><FontAwesomeIcon icon={faSearch} /></span>
                <span className="header-icon"><FontAwesomeIcon icon={faBell} /></span>
                <div className="user-avatar" onClick={() => setShowLogin(true)}>
                   <img 
                    src={userAvatar}
                    alt="User Avatar"
                    style={{ width: '32px',height: '32px',marginTop:7,borderRadius: '50%', cursor: 'pointer' }}
                   />
                </div>
            </div>
            {showLogin && <Login onClose={() => setShowLogin(false)} />}
        </header>
    );
}

export default Header;
