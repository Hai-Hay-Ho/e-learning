import React from 'react';
import './AccountLockedPage.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLock } from '@fortawesome/free-solid-svg-icons';
import { supabase } from '../../supabaseClient';

const AccountLockedPage = ({ session }) => {
    const handleLogout = async () => {
        await supabase.auth.signOut();
    };

    return (
        <div className="account-locked-container">
            <div className="locked-card">
                <div className="locked-icon">
                    <FontAwesomeIcon icon={faLock} />
                </div>
                <h1>Tài khoản bị khóa</h1>
                <p className="locked-message">
                    Tài khoản của bạn hiện đang bị khóa bởi quản trị viên. Vui lòng liên hệ với quản trị viên hệ thống để được hỗ trợ.
                </p>
                <div className="locked-info">
                    <p><strong>Email:</strong> {session?.user?.email}</p>
                </div>
                <button className="logout-btn" onClick={handleLogout}>
                    Đăng xuất
                </button>
            </div>
        </div>
    );
};

export default AccountLockedPage;
