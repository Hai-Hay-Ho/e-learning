import React, { useEffect, useState } from 'react';
import './App.css';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import MainContent from './components/Dashboard';
import Login from './auth/Login';
import { supabase } from './supabaseClient';

function App() {
  const [session, setSession] = useState(null);
  const [showLogin, setShowLogin] = useState(false);

  useEffect(() => {
    // Kiểm tra session hiện tại
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    // Lắng nghe thay đổi trạng thái đăng nhập
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session);
      if (session) {
        setShowLogin(false);
        
        // Gửi thông tin sang Backend để cập nhật role
        const { user } = session;
        console.log("User logged in:", user);
        
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
            console.log("Backend response (User role sync):", data);
          } else {
            console.error("Failed to sync user role with backend");
          }
        } catch (error) {
          console.error("Error syncing user with backend:", error);
        }
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  if (!session && !showLogin) {
    // Nếu chưa đăng nhập, mặc định hiển thị trang chủ hoặc buộc login tùy bạn
    // Ở đây tôi giả định bạn có nút login ở Header (sẽ cập nhật Header sau)
  }

  return (
    <div className="dashboard-container">
      {!session && showLogin && <Login onClose={() => setShowLogin(false)} />}
      
      {}
      <Sidebar />

      <div className="main-wrapper">
        {}
        <Header session={session} onLoginClick={() => setShowLogin(true)} />

        {}
        {session ? <MainContent session={session} /> : (
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
