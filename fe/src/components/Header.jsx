import React, { useState, useEffect } from 'react';
import userAvatar from '../assets/img/user.jpg';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faFire } from '@fortawesome/free-solid-svg-icons';
import { supabase } from '../supabaseClient';

const Header = ({ session, userData, onLoginClick }) => {
    const userDefaultAvatar = userData?.avatarUrl || session?.user?.user_metadata?.avatar_url || userAvatar;
    const userName = userData?.fullName || session?.user?.user_metadata?.full_name || 'Bạn';
    const [streak, setStreak] = useState(0);
    const [isActiveToday, setIsActiveToday] = useState(false);

    const checkIsToday = (dateData) => {
        if (!dateData) return false;
        if (Array.isArray(dateData)) {
            const d = new Date(dateData[0], dateData[1] - 1, dateData[2]);
            return d.toDateString() === new Date().toDateString();
        }
        return new Date(dateData).toDateString() === new Date().toDateString();
    };

    useEffect(() => {
        if (!session?.user?.id) return;

        const userId = session.user.id;

        const fetchStreak = async () => {
            try {
                const res = await fetch(`http://localhost:8080/api/streaks/${userId}`);
                if (res.ok) {
                    const data = await res.json();
                    setStreak(data.streak);
                    setIsActiveToday(checkIsToday(data.lastActiveDate));
                }
            } catch (error) {
                console.error("Error fetching streak:", error);
            }
        };

        fetchStreak();

        // Tracker logic
        let activeTime = parseInt(localStorage.getItem(`activeTime_${userId}`)) || 0;
        const lastDate = localStorage.getItem(`lastActiveDate_${userId}`);
        const todayStr = new Date().toDateString();

        if (lastDate !== todayStr || activeTime >= 10000) {
            activeTime = 0;
            localStorage.setItem(`activeTime_${userId}`, 0);
            localStorage.setItem(`lastActiveDate_${userId}`, todayStr);
        }

        const interval = setInterval(() => {
            if (activeTime >= 10 * 1000) {
                clearInterval(interval);
                return;
            }

            activeTime += 1000; 
            localStorage.setItem(`activeTime_${userId}`, activeTime);

            if (activeTime === 10 * 1000) {
                updateStreak();
            }
        }, 1000); 

        const updateStreak = async () => {
            try {
                const res = await fetch(`http://localhost:8080/api/streaks/${userId}/update`, {
                    method: 'POST'
                });
                if (res.ok) {
                    const data = await res.json();
                    setStreak(data.streak);
                    setIsActiveToday(checkIsToday(data.lastActiveDate));
                }
            } catch (error) {
                console.error("Lỗi khi update streak:", error);
            }
        };

        return () => clearInterval(interval);

    }, [session]);

    const handleLogout = async () => {
        await supabase.auth.signOut();
    };

    return (
        <header className="header">
            <h1>{session ? `Chào, ${userName}!` : ''}</h1>
            <div className="header-right">
                <span className="header-icon" title="Streak" style={{ display: 'flex', alignItems: 'center',width: '100%', gap: '5px', color: isActiveToday ? '#ff9800' : '#9e9e9e', fontWeight: 'bold' }}>
                    {streak} <FontAwesomeIcon icon={faFire} />
                </span>
                
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
