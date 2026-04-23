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
  const [classes, setClasses] = useState([]);
  const [isLoadingClasses, setIsLoadingClasses] = useState(false);
  const [selectedClass, setSelectedClass] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    // Kiểm tra session hiện tại
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) {
        fetchUserData(session.user);
        fetchUnreadCount(session.user.id);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session);
      if (session) {
        setShowLogin(false);
        fetchUserData(session.user);
        fetchUnreadCount(session.user.id);
      } else {
        setUserRole(null);
        setUserData(null);
        setUnreadCount(0);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Fetch unread count periodically
  useEffect(() => {
    let interval;
    if (session) {
      interval = setInterval(() => {
        fetchUnreadCount(session.user.id);
      }, 10000); // Mỗi 10 giây
    }
    return () => clearInterval(interval);
  }, [session]);

  const fetchUnreadCount = async (userId) => {
    try {
      const response = await fetch(`http://localhost:8080/api/chat/unread-count/${userId}`);
      if (response.ok) {
        const data = await response.json();
        setUnreadCount(data.unreadCount);
      }
    } catch (err) {
      console.error("Error fetching unread count:", err);
    }
  };

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
        fetchClasses(user.id, data.role);
      }
    } catch (error) {
    }
  };

  const fetchClasses = async (userId, role) => {
    if (!userId) return;
    setIsLoadingClasses(true);
    try {
      const roleParam = role ? `?role=${role}` : '';
      const response = await fetch(`http://localhost:8080/api/classes/user/${userId}${roleParam}`);
      if (response.ok) {
        const data = await response.json();
        setClasses(data);
      }
    } catch (err) {
      console.error("Error fetching classes:", err);
    } finally {
      setIsLoadingClasses(false);
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
      <Sidebar userRole={userRole} activeTab={activeTab} unreadCount={unreadCount} setActiveTab={(tab) => {
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
            <MainContent 
                session={session} 
                classes={classes} 
                setActiveTab={setActiveTab} 
                setSelectedClass={setSelectedClass} 
            />
          ) : activeTab === 'Classes' ? (
            <ClassPage 
              session={session} 
              userRole={userRole} 
              userData={userData}
              classes={classes}
              setClasses={setClasses}
              selectedClass={selectedClass} //sử dụng lớp học chọn từ Dashboard
              setSelectedClass={setSelectedClass}
              onSwitchToMessages={handleSwitchToMessages}
            />
          ) : activeTab === 'Messages' ? (
            <Chat 
              session={session} 
              userData={userData} 
              pendingConversation={pendingConversation} 
              refreshUnreadCount={() => fetchUnreadCount(session.user.id)} 
            />
          ) : activeTab === 'Quizzes' ? (
            <EQuizz 
              session={session} 
              userRole={userRole} 
              classes={classes}
              isLoadingClasses={isLoadingClasses}
            />
          ) : (
            <MainContent 
                session={session} 
                classes={classes} 
                setActiveTab={setActiveTab} 
                setSelectedClass={setSelectedClass}
            />
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
