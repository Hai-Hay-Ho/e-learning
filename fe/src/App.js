import React, { useEffect, useState } from 'react';
import './App.css';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import MainContent from './components/Dashboard';
import Login from './components/Login';
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
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) setShowLogin(false);
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
      
      {/* TRÁI: Thanh Menu Sidebar */}
      <Sidebar />

      <div className="main-wrapper">
        {/* HEADER: Chứa thông tin chào hỏi và tìm kiếm */}
        <Header session={session} onLoginClick={() => setShowLogin(true)} />

        {/* CENTER & PHẢI: Chỉ hiển thị nội dung nếu có session hoặc demo */}
        {session ? <MainContent session={session} /> : (
          <div style={{ padding: '20px', textAlign: 'center' }}>
            <h1>Chào mừng bạn!</h1>
            <p>Vui lòng đăng nhập để sử dụng hệ thống.</p>
            <button onClick={() => setShowLogin(true)}>Đăng nhập ngay</button>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
