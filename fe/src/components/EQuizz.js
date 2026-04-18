import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faRobot, 
    faPlus, 
    faGraduationCap, 
    faMagic, 
    faSave,
    faLayerGroup,
    faCheckCircle,
    faBrain,
    faBolt,
    faPencilAlt,
    faFileAlt,
    faFlask,
    faEllipsisH,
    faChevronDown,
    faCopy,
    faTrashAlt,
    faClone,
    faCircle as faSolidCircle,
    faPlusCircle,
    faSquareRootAlt,
    faImage,
    faLightbulb,
    faComment,
    faSearch,
    faAlignLeft
} from '@fortawesome/free-solid-svg-icons';
import { faCircle } from '@fortawesome/free-regular-svg-icons';
import { faYoutube } from '@fortawesome/free-brands-svg-icons';
import './EQuizz.css';
import { supabase } from '../supabaseClient';

const EQuizz = ({ session, userRole }) => {
    const [classes, setClasses] = useState([]);
    const [selectedClass, setSelectedClass] = useState(null);
    const [loading, setLoading] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const [isCreating, setIsCreating] = useState(false);
    const [quizzes, setQuizzes] = useState([]);
    const [quizTitle, setQuizTitle] = useState('');
    const [durationMinutes, setDurationMinutes] = useState(15);
    const [editingQuizId, setEditingQuizId] = useState(null);
    const [questions, setQuestions] = useState([
        {
            id: Date.now(),
            content: '',
            answers: [
                { content: '', is_correct: false },
                { content: '', is_correct: false },
                { content: '', is_correct: false },
                { content: '', is_correct: true }
            ],
            isExpanded: true
        }
    ]);

    // Student Quiz Taking State
    const [isTakingQuiz, setIsTakingQuiz] = useState(false);
    const [activeQuiz, setActiveQuiz] = useState(null);
    const [timeLeft, setTimeLeft] = useState(0);
    const [studentAnswers, setStudentAnswers] = useState({});

    const isTeacher = userRole === "1";

    useEffect(() => {
        if (session?.user?.id) {
            fetchClasses();
        }
    }, [session]);

    useEffect(() => {
        if (selectedClass) {
            fetchQuizzes(selectedClass.id);
            stopQuiz();
            setIsCreating(false);
            setEditingQuizId(null);
        }
    }, [selectedClass]);

    useEffect(() => {
        let timer;
        if (isTakingQuiz && timeLeft > 0) {
            timer = setInterval(() => {
                setTimeLeft(prev => {
                    if (prev <= 1) {
                        clearInterval(timer);
                        handleSubmitQuiz();
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }
        return () => clearInterval(timer);
    }, [isTakingQuiz, timeLeft]);

    const stopQuiz = () => {
        setIsTakingQuiz(false);
        setActiveQuiz(null);
        setStudentAnswers({});
        setTimeLeft(0);
    };

    const fetchClasses = async () => {
        setLoading(true);
        try {
            const roleParam = userRole ? `?role=${userRole}` : '';
            const response = await fetch(`http://localhost:8080/api/classes/user/${session.user.id}${roleParam}`);
            if (response.ok) {
                const data = await response.json();
                setClasses(data);
                if (data.length > 0) {
                    setSelectedClass(data[0]);
                }
            }
        } catch (err) {
            console.error("Error fetching classes:", err);
        } finally {
            setLoading(false);
        }
    };

    const fetchQuizzes = async (classId) => {
        try {
            const response = await fetch(`http://localhost:8080/api/quizzes/class/${classId}`);
            if (response.ok) {
                const data = await response.json();
                setQuizzes(data);
            }
        } catch (err) {
            console.error("Error fetching quizzes:", err);
        }
    };

    const handleEditQuiz = (quiz) => {
        setQuizTitle(quiz.title);
        setDurationMinutes(quiz.durationMinutes || 15);
        setEditingQuizId(quiz.id);
        setQuestions(quiz.questions.map(q => ({
            id: q.id,
            content: q.content,
            answers: q.answers.map(a => ({
                id: a.id,
                content: a.content,
                is_correct: a.is_correct
            })),
            isExpanded: true
        })));
        setIsCreating(true);
    };

    const handleStartQuiz = (quiz) => {
        setActiveQuiz(quiz);
        setIsTakingQuiz(true);
        setTimeLeft((quiz.durationMinutes || 15) * 60);
        setStudentAnswers({});
    };

    const handleAddQuestion = () => {
        const newQuestion = {
            id: Date.now(),
            content: '',
            answers: [
                { content: '', is_correct: false },
                { content: '', is_correct: false },
                { content: '', is_correct: false },
                { content: '', is_correct: true }
            ],
            isExpanded: true
        };
        setQuestions([...questions, newQuestion]);
    };

    const handleDeleteQuestion = (id) => {
        if (questions.length === 1) {
            alert("Phải có ít nhất một câu hỏi!");
            return;
        }
        setQuestions(questions.filter(q => q.id !== id));
    };

    const handleQuestionChange = (id, value) => {
        setQuestions(questions.map(q => q.id === id ? { ...q, content: value } : q));
    };

    const handleAnswerChange = (qId, ansIndex, value) => {
        setQuestions(questions.map(q => {
            if (q.id === qId) {
                const newAnswers = q.answers.map((ans, idx) => 
                    idx === ansIndex ? { ...ans, content: value } : ans
                );
                return { ...q, answers: newAnswers };
            }
            return q;
        }));
    };

    const handleToggleCorrect = (qId, ansIndex) => {
        setQuestions(questions.map(q => {
            if (q.id === qId) {
                const newAnswers = q.answers.map((ans, idx) => ({
                    ...ans,
                    is_correct: idx === ansIndex
                }));
                return { ...q, answers: newAnswers };
            }
            return q;
        }));
    };

    const handleAddOption = (qId) => {
        setQuestions(questions.map(q => {
            if (q.id === qId) {
                if (q.answers.length >= 5) return q;
                const newAnswers = [...q.answers];
                newAnswers[3] = { ...newAnswers[3], content: 'Tùy chọn 4', is_correct: false };
                newAnswers.push({ content: 'nhập đáp án đúng', is_correct: true });
                return { ...q, answers: newAnswers };
            }
            return q;
        }));
    };

    const shuffleArray = (array) => {
        const newArr = [...array];
        for (let i = newArr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
        }
        return newArr;
    };

    const validateForm = () => {
        if (!quizTitle.trim()) {
            alert("Vui lòng nhập tiêu đề bộ câu hỏi!");
            return false;
        }
        
        for (let i = 0; i < questions.length; i++) {
            const q = questions[i];
            if (!q.content.trim()) {
                alert(`Câu hỏi #${i + 1} chưa có nội dung!`);
                return false;
            }
            for (let j = 0; j < q.answers.length; j++) {
                if (!q.answers[j].content.trim()) {
                    alert(`Đáp án ${j + 1} của câu hỏi #${i + 1} chưa được điền!`);
                    return false;
                }
            }
            if (!q.answers.some(a => a.is_correct)) {
                alert(`Câu hỏi #${i + 1} chưa chọn đáp án đúng!`);
                return false;
            }
        }
        return true;
    };

    const handleSave = async () => {
        if (!validateForm()) return;

        setLoading(true);
        try {
            const quizData = {
                title: quizTitle,
                duration_minutes: durationMinutes,
                class_id: selectedClass.id,
                created_by: session.user.id
            };

            const url = editingQuizId ? `http://localhost:8080/api/quizzes/${editingQuizId}` : 'http://localhost:8080/api/quizzes';
            const method = editingQuizId ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    quiz: quizData,
                    questions: questions.map((q, idx) => ({
                        content: q.content,
                        question_order: idx + 1,
                        answers: (editingQuizId ? q.answers : shuffleArray(q.answers)).map((ans, aIdx) => ({
                            content: ans.content,
                            is_correct: ans.is_correct,
                            answer_order: aIdx + 1
                        }))
                    }))
                })
            });

            if (response.ok) {
                alert(editingQuizId ? "Đã cập nhật bộ câu hỏi thành công!" : "Đã lưu bộ câu hỏi thành công!");
                setQuizTitle('');
                setDurationMinutes(15);
                setEditingQuizId(null);
                setQuestions([{
                    id: Date.now(),
                    content: '',
                    answers: [
                        { content: '', is_correct: false },
                        { content: '', is_correct: false },
                        { content: '', is_correct: false },
                        { content: '', is_correct: true }
                    ],
                    isExpanded: true
                }]);
                setIsCreating(false);
                fetchQuizzes(selectedClass.id);
            } else {
                const errorData = await response.json();
                alert("Lỗi khi lưu: " + (errorData.message || "Unknown error"));
            }
        } catch (err) {
            console.error("Error saving quiz:", err);
            alert("Đã xảy ra lỗi kết nối!");
        } finally {
            setLoading(false);
        }
    };

    const handleSubmitQuiz = () => {
        alert("Thời gian đã hết hoặc bạn đã nộp bài! Hệ thống đang ghi nhận kết quả.");
        stopQuiz();
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    };

    return (
        <div className="equizz-container">
            {/* Sidebar */}
            <aside className="equizz-sidebar">
                <div className="equizz-sidebar-header">
                    <div className="equizz-app-logo">
                        <span>E-Quizz</span>
                    </div>
                    
                    {isTeacher && (
                        <button className="equizz-create-btn" onClick={() => setIsCreating(true)}>
                            <FontAwesomeIcon icon={faPlus} />
                            <span>Tạo bộ câu hỏi</span>
                        </button>
                    )}
                </div>

                <div className="equizz-list-section">
                    <div className="equizz-list-label">Lớp học</div>
                    {loading ? (
                        <div style={{ textAlign: 'center', padding: '20px' }} className="loading-dots">Đang tải</div>
                    ) : (
                        classes.map((cls) => (
                            <div 
                                key={cls.id} 
                                className={`equizz-list-item ${selectedClass?.id === cls.id ? 'active' : ''}`}
                                onClick={() => setSelectedClass(cls)}
                            >
                                <div className="equizz-class-icon">
                                    <FontAwesomeIcon icon={faLayerGroup} size="xs" />
                                </div>
                                <div className="equizz-class-info-sidebar">
                                    <span className="equizz-class-name-sidebar">{cls.name}</span>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </aside>

            {/* Main Content */}
            {/* Main Content */}
            <main className="equizz-main-content">
                {selectedClass ? (
                    isTakingQuiz ? (
                        /* Student Taking Quiz View */
                        <div className="equizz-taking-view">
                            <div className="taking-header">
                                <div className="quiz-info">
                                    <h2>{activeQuiz.title}</h2>
                                    <p>{activeQuiz.questions.length} câu hỏi</p>
                                </div>
                                <div className="countdown-timer">
                                    <FontAwesomeIcon icon={faBolt} className="timer-icon" />
                                    <span>{formatTime(timeLeft)}</span>
                                </div>
                            </div>

                            <div className="taking-scroll-area">
                                {activeQuiz.questions.map((q, idx) => (
                                    <div key={q.id} className="taking-question-card">
                                        <div className="taking-q-header">
                                            <span className="q-index">Câu {idx + 1}</span>
                                            <p className="q-content">{q.content}</p>
                                        </div>
                                        <div className="taking-answers-list">
                                            {q.answers.map((ans) => (
                                                <label key={ans.id} className={`taking-answer-item ${studentAnswers[q.id] === ans.id ? 'selected' : ''}`}>
                                                    <input 
                                                        type="radio"
                                                        name={`question-${q.id}`}
                                                        checked={studentAnswers[q.id] === ans.id}
                                                        onChange={() => setStudentAnswers({...studentAnswers, [q.id]: ans.id})}
                                                    />
                                                    <span className="ans-text">{ans.content}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="taking-footer">
                                <button className="submit-quiz-btn" onClick={handleSubmitQuiz}>
                                    <FontAwesomeIcon icon={faCheckCircle} />
                                    <span>Nộp bài ngay</span>
                                </button>
                            </div>
                        </div>
                    ) : isCreating ? (
                        <div className="equizz-builder-scroll-area">
                            <div className="builder-header">
                                <button className="back-to-list-btn" onClick={() => { setIsCreating(false); setEditingQuizId(null); }}>
                                    <FontAwesomeIcon icon={faChevronDown} rotation={90} />
                                    <span>Quay lại</span>
                                </button>
                                <h2>{editingQuizId ? "Chỉnh sửa bộ câu hỏi" : "Tạo bộ câu hỏi mới"}</h2>
                            </div>

                            <div className="equizz-header-input-section">
                                <div className="title-row">
                                    <input 
                                        type="text"
                                        className="quiz-title-input"
                                        placeholder="Nhập tiêu đề bộ câu hỏi..."
                                        value={quizTitle}
                                        onChange={(e) => setQuizTitle(e.target.value)}
                                    />
                                    <div className="duration-input-wrapper">
                                        <FontAwesomeIcon icon={faBolt} className="duration-icon" />
                                        <input 
                                            type="number" 
                                            value={durationMinutes} 
                                            onChange={(e) => setDurationMinutes(parseInt(e.target.value) || 0)}
                                            min="1"
                                        />
                                        <span>Phút</span>
                                    </div>
                                </div>
                            </div>

                            {/* Question List */}
                            {questions.map((q, index) => (
                                <div key={q.id} className="equizz-question-builder-card">
                                    <div className="card-drag-handle">
                                        <FontAwesomeIcon icon={faEllipsisH} />
                                    </div>

                                    <div className="card-header">
                                        <div className="header-left">
                                            <span className="question-number"># {index + 1}</span>
                                        </div>
                                        <div className="header-right">
                                            <button className="utility-icon-btn">
                                                <FontAwesomeIcon icon={faCopy} />
                                            </button>
                                            <button 
                                                className="utility-icon-btn delete"
                                                onClick={() => handleDeleteQuestion(q.id)}
                                            >
                                                <FontAwesomeIcon icon={faTrashAlt} />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="question-input-section">
                                        <textarea 
                                            className="question-textarea"
                                            placeholder="Nhập nội dung câu hỏi tại đây..."
                                            rows="2"
                                            value={q.content}
                                            onChange={(e) => handleQuestionChange(q.id, e.target.value)}
                                        />
                                    </div>

                                    <div className="options-vertical-list">
                                        {q.answers.map((ans, ansIdx) => (
                                            <div key={ansIdx} className={`option-row ${ans.is_correct ? 'is-correct' : ''}`}>
                                                <div 
                                                    className="option-radio-indicator"
                                                    onClick={() => handleToggleCorrect(q.id, ansIdx)}
                                                >
                                                    {ans.is_correct ? (
                                                        <FontAwesomeIcon icon={faCheckCircle} className="checked-icon" />
                                                    ) : (
                                                        <FontAwesomeIcon icon={faCircle} className="unchecked-icon" />
                                                    )}
                                                </div>
                                                <input 
                                                    type="text"
                                                    className="option-text-input"
                                                    placeholder={
                                                        q.answers.length === 5 
                                                        ? (ansIdx === 3 ? "Tùy chọn 4" : (ansIdx === 4 ? "Nhập đáp án đúng..." : `Đáp án ${ansIdx + 1}`))
                                                        : (ans.is_correct ? "Nhập đáp án đúng..." : `Tùy chọn ${ansIdx + 1}`)
                                                    }
                                                    value={ans.content}
                                                    onChange={(e) => handleAnswerChange(q.id, ansIdx, e.target.value)}
                                                />
                                            </div>
                                        ))}
                                    </div>

                                    {q.answers.length < 5 && (
                                        <div className="options-footer-actions">
                                            <button 
                                                className="add-option-full-btn" 
                                                onClick={() => handleAddOption(q.id)}
                                            >
                                                <FontAwesomeIcon icon={faPlusCircle} />
                                                <span>Thêm tùy chọn</span>
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ))}

                            <div className="add-new-question-section">
                                <button className="q-type-card trắc-nghiệm" onClick={handleAddQuestion}>
                                    <FontAwesomeIcon icon={faPlus} />
                                    <span>Thêm câu hỏi mới</span>
                                </button>
                            </div>

                            <div className="global-save-section">
                                <button className="equizz-save-main-btn" onClick={handleSave} disabled={loading}>
                                    <FontAwesomeIcon icon={loading ? faBolt : faSave} className={loading ? "fa-spin" : ""} />
                                    <span>{loading ? "Đang lưu..." : (editingQuizId ? "Cập nhật bộ câu hỏi" : "Lưu bộ câu hỏi")}</span>
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="equizz-list-view">
                            <div className="list-view-header">
                                <div className="header-info">
                                    <h1>Bộ câu hỏi của lớp</h1>
                                    <p>{quizzes.length} bộ câu hỏi đã sẵn sàng</p>
                                </div>
                                {isTeacher && (
                                    <button className="create-shortcut-btn" onClick={() => setIsCreating(true)}>
                                        <FontAwesomeIcon icon={faPlus} />
                                        <span>Tạo mới</span>
                                    </button>
                                )}
                            </div>

                            <div className="quiz-cards-grid">
                                {quizzes.length > 0 ? (
                                    quizzes.map((quiz) => (
                                        <div key={quiz.id} className="quiz-summary-card">
                                            <div className="quiz-card-icon">
                                                <FontAwesomeIcon icon={faBrain} />
                                            </div>
                                            <div className="quiz-card-content">
                                                <h3>{quiz.title}</h3>
                                                <div className="quiz-meta">
                                                    <span>
                                                        <FontAwesomeIcon icon={faGraduationCap} /> 
                                                        {quiz.questions?.length || 0} câu hỏi
                                                    </span>
                                                    <span>
                                                        <FontAwesomeIcon icon={faLayerGroup} />
                                                        Thời gian: {quiz.durationMinutes || 15} phút
                                                    </span>
                                                </div>
                                            </div>
                                            <button 
                                                className="start-quiz-btn"
                                                onClick={() => isTeacher ? handleEditQuiz(quiz) : handleStartQuiz(quiz)}
                                            >
                                                <span>{isTeacher ? "Xem chi tiết" : "Bắt đầu"}</span>
                                                <FontAwesomeIcon icon={faBolt} />
                                            </button>
                                        </div>
                                    ))
                                ) : (
                                    <div className="no-quizzes-state">
                                        <FontAwesomeIcon icon={faFlask} className="empty-flask" />
                                        <p>Chưa có bộ câu hỏi nào được tạo cho lớp này.</p>
                                        {isTeacher && <button onClick={() => setIsCreating(true)}>Tạo ngay bộ câu hỏi đầu tiên</button>}
                                    </div>
                                )}
                            </div>
                        </div>
                    )
                ) : (
                    <div className="equizz-empty-state">
                        <div className="equizz-empty-icon">
                            <FontAwesomeIcon icon={faGraduationCap} />
                        </div>
                        <h3>Chọn một lớp học để xem các bộ câu hỏi</h3>
                    </div>
                )}
            </main>
        </div>
    );
};

export default EQuizz;
