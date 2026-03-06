import React, { useState } from 'react';

const MainContent = () => {
    const [currentDate, setCurrentDate] = useState(new Date());

    const daysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();//hàm trả về số ngày trong tháng 
    const firstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();//trả về ngày đầu tiên của tháng

    const handlePrevMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    };

    const handleNextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    };

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const today = new Date();
    const isCurrentMonth = today.getFullYear() === year && today.getMonth() === month;

    const monthNames = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];
    const startDay = (firstDayOfMonth(year, month) + 6) % 7;
    // getDay() mặc định bắt đầu từ Sunday = 0
    // nhưng lịch muốn bắt đầu từ Monday +6 rồi mod 7 để chuyển hệ thống ngày

    const days = [];
    for (let i = 0; i < startDay; i++) {
        days.push(<span key={`empty-${i}`} className="day-cell empty"></span>);
    }
    for (let i = 1; i <= daysInMonth(year, month); i++) {
        const isActive = isCurrentMonth && today.getDate() === i;
        days.push(
            <span key={i} className={`day-cell ${isActive ? 'active' : ''}`}>
                {i}
            </span>
        );
    }

    return (
        <main className="main-content-area">
            {/* CENTER: Phần nội dung trung tâm */}
            <div className="center-content">
                <section className="overview">
                    <div className="section-header">
                        <h2>Overview</h2>
                    </div>
                    <div className="overview-cards">
                        <div className="overview-card">
                            <div className="overview-card-icon">📖</div>
                            <h3>8</h3>
                            <p>Courses In Progress</p>
                        </div>
                        <div className="overview-card">
                            <div className="overview-card-icon">🎓</div>
                            <h3>14</h3>
                            <p>Courses Completed</p>
                        </div>
                        <div className="overview-card">
                            <div className="overview-card-icon">🎯</div>
                            <h3>96</h3>
                            <p>Average test results</p>
                        </div>
                        <div className="overview-card">
                            <div className="overview-card-icon">🕒</div>
                            <h3>1.2K</h3>
                            <p>Hours in training</p>
                        </div>
                    </div>
                </section>

                <section className="courses">
                    <div className="section-header">
                        <h2>Courses</h2>
                    </div>
                    <div className="courses-cards">
                        <div className="course-card blue">
                            <div className="course-icon">📊</div>
                            <h4>Data analysis</h4>
                            <span>▷ Machine learning</span>
                            <div className="course-progress">
                                <span className="progress-info">12/40 lessons</span>
                                <div className="progress-bar-bg">
                                    <div className="progress-bar-fill" style={{ width: '30%' }}></div>
                                </div>
                            </div>
                        </div>
                        <div className="course-card yellow">
                            <div className="course-icon">💡</div>
                            <h4>Design thinking</h4>
                            <span>▷ Heuristics</span>
                            <div className="course-progress">
                                <span className="progress-info">20/32 lessons</span>
                                <div className="progress-bar-bg">
                                    <div className="progress-bar-fill" style={{ width: '60%' }}></div>
                                </div>
                            </div>
                        </div>
                        <div className="course-card green">
                            <div className="course-icon">🎨</div>
                            <h4>UI fundamentals</h4>
                            <span>▷ Visual hierarchy</span>
                            <div className="course-progress">
                                <span className="progress-info">10/60 lessons</span>
                                <div className="progress-bar-bg">
                                    <div className="progress-bar-fill" style={{ width: '16%' }}></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="assignments">
                    <div className="section-header">
                        <h2>Assignments</h2>
                    </div>
                    <div className="assignments-list">
                        <div className="assignment-item">
                            <div className="assignment-info">
                                <div className="assignment-icon">T</div>
                                <div className="assignment-text">
                                    <h5>Typography test</h5>
                                    <p>Today, 2:30 PM</p>
                                </div>
                            </div>
                            <div className="assignment-grade">--/100</div>
                            <div className="assignment-status">Upcoming</div>
                        </div>
                        <div className="assignment-item">
                            <div className="assignment-info">
                                <div className="assignment-icon">🏠</div>
                                <div className="assignment-text">
                                    <h5>3D house model</h5>
                                    <p>Today, 3:15 PM</p>
                                </div>
                            </div>
                            <div className="assignment-grade">--/100</div>
                            <div className="assignment-status">Upcoming</div>
                        </div>
                        <div className="assignment-item">
                            <div className="assignment-info">
                                <div className="assignment-icon">🖼️</div>
                                <div className="assignment-text">
                                    <h5>Visual hierarchy</h5>
                                    <p>Today, 4:30 PM</p>
                                </div>
                            </div>
                            <div className="assignment-grade">92/100</div>
                            <div className="assignment-status">Completed</div>
                        </div>
                    </div>
                </section>
            </div>

            {/* PHẢI: Phần lịch biểu và thông tin bên phải */}
            <aside className="right-panel-in-main">
                <div className="calendar-container">
                    <div className="calendar-header">
                        <button onClick={handlePrevMonth}>&lt;</button>
                        <span>{monthNames[month]} {year}</span>
                        <button onClick={handleNextMonth}>&gt;</button>
                    </div>
                    <div className="calendar-grid">
                        <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
                        {days}
                    </div>
                </div>

                <div className="schedule-container">
                    <h4>Schedule</h4>
                    <div className="schedule-item blue">
                        <h5>User pain points</h5>
                        <p>9:00 - 10:00 AM</p>
                    </div>
                    <div className="schedule-item purple">
                        <h5>Bias theory</h5>
                        <p>10:30 - 11:30 AM</p>
                    </div>
                    <div className="schedule-item yellow">
                        <h5>Typography</h5>
                        <p>12:30 - 2:30 PM</p>
                    </div>
                </div>

                <div className="premium-card">
                    <h4>Go premium</h4>
                    <p>Unlock all features</p>
                    <button>Get access</button>
                </div>
            </aside>
        </main>
    );
}

export default MainContent;
