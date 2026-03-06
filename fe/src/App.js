import React from 'react';
import './App.css';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import MainContent from './components/Dashboard';

function App() {
  return (
    <div className="dashboard-container">
      {/* TRÁI: Thanh Menu Sidebar */}
      <Sidebar />

      <div className="main-wrapper">
        {/* HEADER: Chứa thông tin chào hỏi và tìm kiếm */}
        <Header />

        {/* CENTER & PHẢI (Gộp chung): Phần nội dung chính và lịch biểu */}
        <MainContent />
      </div>
    </div>
  );
}

export default App;
