import React, { useEffect, useState } from 'react';
import './App.css';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import MainContent from './components/Dashboard';
import ClassPage from './components/Class';
import Login from './auth/Login';
import Chat from './components/Chat';
import EQuizz from './components/EQuizz';
import { supabase } from './supabaseClient';

function App() {
  const [session, setSession] = useState(null);
  const [showLogin, setShowLogin] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [userData, setUserData] = useState(null);
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [pendingConversation, setPendingConversation] = useState(null);

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

  const handleSwitchToMessages = (conversationId, otherUser) => {
    setPendingConversation({ conversationId, otherUser });
    setActiveTab('Messages');
  };

  // Kiểm tra và buộc redirect về Dashboard nếu chưa đăng nhập
  useEffect(() => {
    if (!session && activeTab !== 'Dashboard') {
      setActiveTab('Dashboard');
    }
  }, [session, activeTab]);

  return (
    <div className="dashboard-container">
      {!session && showLogin && <Login onClose={() => setShowLogin(false)} />}
      
      {/* Sidebar based on role */}
      <Sidebar userRole={userRole} activeTab={activeTab} setActiveTab={(tab) => {
        // Nếu chưa đăng nhập và cố click vào tab khác, về Dashboard
        if (!session && tab !== 'Dashboard') {
          setActiveTab('Dashboard');
        } else {
          setActiveTab(tab);
        }
      }} />

      <div className={`main-wrapper ${activeTab === 'Messages' || activeTab === 'Classes' || activeTab === 'Quizzes' ? 'no-padding' : ''}`}>
        {activeTab !== 'Messages' && activeTab !== 'Classes' && activeTab !== 'Quizzes' && (
          <Header session={session} userData={userData} onLoginClick={() => setShowLogin(true)} />
        )}

        {session ? (
          activeTab === 'Dashboard' ? (
            <MainContent session={session} />
          ) : activeTab === 'Classes' ? (
            <ClassPage 
              session={session} 
              userRole={userRole} 
              userData={userData}
              onSwitchToMessages={handleSwitchToMessages}
            />
          ) : activeTab === 'Messages' ? (
            <Chat session={session} userData={userData} pendingConversation={pendingConversation} />
          ) : activeTab === 'Quizzes' ? (
            <EQuizz session={session} userRole={userRole} />
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
