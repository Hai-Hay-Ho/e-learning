import React, { useEffect, useState } from 'react';
import './App.css';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import MainContent from './components/Dashboard';
import ClassPage from './components/Class';
import Login from './auth/Login';
import { supabase } from './supabaseClient';

function App() {
  const [session, setSession] = useState(null);
  const [showLogin, setShowLogin] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [userData, setUserData] = useState(null);
  const [activeTab, setActiveTab] = useState('Dashboard');

  useEffect(() => {
    // Kiểm tra session hiện tại
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) {
        fetchUserData(session.user);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session);
      if (session) {
        setShowLogin(false);
        fetchUserData(session.user);
      } else {
        setUserRole(null);
        setUserData(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserData = async (user) => {
    try {
      const response = await fetch('http://localhost:8080/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: user.id,
          email: user.email,
          fullName: user.user_metadata.full_name || user.user_metadata.name,
          avatarUrl: user.user_metadata.avatar_url,
        }),
      });
      
      if (response.ok) {
        const data = await response.json();
        setUserRole(data.role); 
        setUserData(data); // Lưu thông tin trả về từ supabase
      } else {
        console.error("Failed to sync user role with backend");
      }
    } catch (error) {
      console.error("Error syncing user with backend:", error);
    }
  };

  if (!session && !showLogin) {
    // Nếu chưa đăng nhập, mặc định hiển thị trang chủ hoặc buộc login tùy bạn
    // Ở đây tôi giả định bạn có nút login ở Header (sẽ cập nhật Header sau)
  }

  return (
    <div className="dashboard-container">
      {!session && showLogin && <Login onClose={() => setShowLogin(false)} />}
      
      {/* Sidebar based on role */}
      <Sidebar userRole={userRole} activeTab={activeTab} setActiveTab={setActiveTab} />

      <div className="main-wrapper">
        {}
        <Header session={session} userData={userData} onLoginClick={() => setShowLogin(true)} />

        {}
        {session ? (
          activeTab === 'Dashboard' ? (
            <MainContent session={session} />
          ) : activeTab === 'Classes' ? (
            <ClassPage session={session} userRole={userRole} userData={userData} />
          ) : (
            <MainContent session={session} />
          )
        ) : (
          <div style={{ padding: '20px', textAlign: 'center' }}>
            <h1>Chào mừng bạn!</h1>
            <p>Vui lòng đăng nhập để sử dụng hệ thống.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
