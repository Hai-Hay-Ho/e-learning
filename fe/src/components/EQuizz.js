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

const EQuizz = ({ session, userRole, classes, isLoadingClasses }) => {
    const [selectedClass, setSelectedClass] = useState(null);
    const [loading, setLoading] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const [isCreating, setIsCreating] = useState(false);
    const [quizzes, setQuizzes] = useState([]);
    const [quizTitle, setQuizTitle] = useState('');
    const [durationMinutes, setDurationMinutes] = useState(15);
    const [deadline, setDeadline] = useState('');
    const [editingQuizId, setEditingQuizId] = useState(null);
    const [prevClassId, setPrevClassId] = useState(null);
    const [questions, setQuestions] = useState([
        {
            id: Date.now(),
            content: '',
            answers: [
                { content: '', isCorrect: false },
                { content: '', isCorrect: false },
                { content: '', isCorrect: false },
                { content: '', isCorrect: true }
            ],
            isExpanded: true
        }
    ]);

    // Student Quiz Taking State
    const [isTakingQuiz, setIsTakingQuiz] = useState(false);
    const [activeQuiz, setActiveQuiz] = useState(null);
    const [timeLeft, setTimeLeft] = useState(0);
    const [studentAnswers, setStudentAnswers] = useState({});
    const [attempts, setAttempts] = useState([]);
    const [isReviewing, setIsReviewing] = useState(false);

    const isTeacher = userRole === "1";

    useEffect(() => {
        if (session?.user?.id) {
            fetchAttempts();
        }
    }, [session]);

    useEffect(() => {
        if (selectedClass) {
            fetchQuizzes(selectedClass.id);
            
            if (prevClassId !== selectedClass.id) {
                stopQuiz();
                setIsCreating(false);
                setEditingQuizId(null);
                setPrevClassId(selectedClass.id);
            }
            
            const channel = supabase
                .channel(`class-quizzes-${selectedClass.id}`)
                .on(
                    'postgres_changes',
                    {
                        event: '*',
                        schema: 'public',
                        table: 'quizzes',
                        filter: `class_id=eq.${selectedClass.id}`
                    },
                    (payload) => {
                        console.log('Realtime update received:', payload);
                        fetchQuizzes(selectedClass.id);
                    }
                )
                .on(
                    'postgres_changes',
                    {
                        event: '*',
                        schema: 'public',
                        table: 'questions'
                    },
                    () => {
                        fetchQuizzes(selectedClass.id);
                    }
                )
                .subscribe();

            return () => {
                supabase.removeChannel(channel);
            };
        } else if (classes && classes.length > 0 && !selectedClass) {
            // Tự động chọn lớp đầu tiên nếu chưa có lớp nào được chọn
            setSelectedClass(classes[0]);
            setPrevClassId(classes[0].id);
        }
    }, [selectedClass, classes]);

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
        setIsReviewing(false);
        setActiveQuiz(null);
        setStudentAnswers({});
        setTimeLeft(0);
    };

    const handleResetForm = () => {
        setQuizTitle('');
        setDurationMinutes(15);
        setDeadline('');
        setEditingQuizId(null);
        setQuestions([
            {
                id: Date.now(),
                content: '',
                answers: [
                    { content: '', isCorrect: false },
                    { content: '', isCorrect: false },
                    { content: '', isCorrect: false },
                    { content: '', isCorrect: true }
                ],
                isExpanded: true
            }
        ]);
        setIsCreating(true);
    };

    const fetchAttempts = async () => {
        if (!session?.user?.id) return;
        try {
            const response = await fetch(`http://localhost:8080/api/quiz-attempts/user/${session.user.id}`);
            if (response.ok) {
                const data = await response.json();
                setAttempts(data);
            }
        } catch (err) {
            console.error("Error fetching attempts:", err);
        }
    };

    // Removed local fetchClasses as it is passed via props

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
        setDeadline(quiz.deadline ? quiz.deadline.substring(0, 16) : '');
        setEditingQuizId(quiz.id);
        setQuestions(quiz.questions.map(q => ({
            id: q.id,
            content: q.content,
            answers: q.answers.map(a => ({
                id: a.id,
                content: a.content,
                isCorrect: a.isCorrect
            })),
            isExpanded: true
        })));
        setIsCreating(true);
    };

    const handleStartQuiz = (quiz) => {
        setActiveQuiz(quiz);
        setIsTakingQuiz(true);
        setIsReviewing(false);
        setTimeLeft((quiz.durationMinutes || 15) * 60);
        setStudentAnswers({});
    };

    const handleReviewQuiz = async (quiz, attempt) => {
        setLoading(true);
        try {
            const response = await fetch(`http://localhost:8080/api/quiz-attempts/attempt/${attempt.id}/answers`);
            if (!response.ok) throw new Error("Failed to fetch answers");
            const savedAnswers = await response.json();

            const answersMap = {};
            savedAnswers.forEach(ans => {
                answersMap[ans.questionId] = ans.selectedAnswerId;
            });

            setStudentAnswers(answersMap);
            setActiveQuiz(quiz);
            setIsTakingQuiz(true);
            setIsReviewing(true);
            setTimeLeft(0);
        } catch (err) {
            console.error("Error fetching saved answers:", err);
            alert("Lỗi khi tải bài làm cũ: " + err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleAddQuestion = () => {
        const newQuestion = {
            id: Date.now(),
            content: '',
            answers: [
                { content: '', isCorrect: false },
                { content: '', isCorrect: false },
                { content: '', isCorrect: false },
                { content: '', isCorrect: true }
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
                    isCorrect: idx === ansIndex
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
                newAnswers[3] = { ...newAnswers[3], content: 'Tùy chọn 4', isCorrect: false };
                newAnswers.push({ content: 'nhập đáp án đúng', isCorrect: true });
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

        // Nếu là tạo mới, bắt buộc phải có ít nhất 1 câu hỏi đầy đủ
        if (!editingQuizId) {
            if (questions.length === 0) {
                alert("Vui lòng thêm ít nhất một câu hỏi!");
                return false;
            }
            
            for (let i = 0; i < questions.length; i++) {
                const q = questions[i];
                if (!q.content.trim()) {
                    alert(`Câu hỏi #${i + 1} chưa có nội dung!`);
                    return false;
                }
                if (!q.answers.some(a => a.isCorrect && a.content.trim())) {
                    alert(`Câu hỏi #${i + 1} chưa có đáp án đúng!`);
                    return false;
                }
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
                durationMinutes: durationMinutes,
                deadline: deadline || null,
                classId: selectedClass.id,
                createdBy: session.user.id
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
                        questionOrder: idx + 1,
                        answers: (editingQuizId ? q.answers : shuffleArray(q.answers)).map((ans, aIdx) => ({
                            content: ans.content,
                            isCorrect: ans.isCorrect,
                            answerOrder: aIdx + 1
                        }))
                    }))
                })
            });

            if (response.ok) {
                alert(editingQuizId ? "Đã cập nhật bộ câu hỏi thành công!" : "Đã lưu bộ câu hỏi thành công!");
                handleResetForm();
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

    const handleSubmitQuiz = async () => {
        if (isReviewing) {
            stopQuiz();
            return;
        }

        const confirmSubmit = window.confirm("Bạn có chắc chắn muốn nộp bài?");
        if (!confirmSubmit) return;

        setLoading(true);
        try {
            let correctCount = 0;
            const totalQuestions = activeQuiz.questions.length;
            const studentChoices = [];

            activeQuiz.questions.forEach(q => {
                const selectedAnsId = studentAnswers[q.id];
                const correctAnswer = q.answers.find(a => a.isCorrect);
                const isCorrect = selectedAnsId === correctAnswer?.id;
                
                if (isCorrect) correctCount++;
                
                studentChoices.push({
                    question_id: q.id,
                    selected_answer_id: selectedAnsId,
                    is_correct: isCorrect
                });
            });

            const rawScore = (correctCount / totalQuestions) * 10;
            const scoreValue = Math.ceil(rawScore * 100) / 100;

            const submissionData = {
                quizId: activeQuiz.id,
                userId: session.user.id,
                score: scoreValue,
                answers: studentChoices.map(choice => ({
                    questionId: choice.question_id,
                    selectedAnswerId: choice.selected_answer_id,
                    isCorrect: choice.is_correct
                }))
            };

            const response = await fetch('http://localhost:8080/api/quiz-attempts/submit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(submissionData)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Lỗi khi lưu bài làm");
            }

            alert(`Bạn đã hoàn thành bài thi! Điểm của bạn: ${scoreValue.toFixed(2)}/10`);
            await fetchAttempts();
            stopQuiz();
        } catch (err) {
            console.error("Error submitting quiz:", err);
            alert("Lỗi khi nộp bài: " + (err.message || "Unknown error"));
        } finally {
            setLoading(false);
        }
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
                        <button className="equizz-create-btn" onClick={handleResetForm}>
                            <FontAwesomeIcon icon={faPlus} />
                            <span>Tạo bộ câu hỏi</span>
                        </button>
                    )}
                </div>

                <div className="equizz-list-section">
                    <div className="equizz-list-label">Lớp học</div>
                    {isLoadingClasses ? (
                        <div style={{ textAlign: 'center', padding: '20px' }} className="loading-dots">Đang tải</div>
                    ) : (
                        classes.map((cls) => (
                            <div 
                                key={cls.id} 
                                className={`equizz-list-item ${selectedClass?.id === cls.id ? 'active' : ''}`}
                                onClick={() => setSelectedClass(cls)}
                            >
                                <div className="equizz-class-card-mini">
                                    {cls.teacherAvatar ? (
                                        <img src={cls.teacherAvatar} alt={cls.teacherName} />
                                    ) : (
                                        cls.teacherName ? cls.teacherName.charAt(0).toUpperCase() : 'L'
                                    )}
                                </div>
                                <div className="equizz-class-info-sidebar">
                                    <div className="equizz-class-name-row">
                                        <span className="equizz-class-name-sidebar">{cls.name}</span>
                                    </div>
                                    <div className="equizz-class-teacher-name-sidebar">{cls.teacherName || "Giáo viên"}</div>
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
                                {activeQuiz.questions.map((q, idx) => {
                                    const selectedId = studentAnswers[q.id];
                                    return (
                                        <div key={q.id} className="taking-question-card">
                                            <div className="taking-q-header">
                                                <span className="q-index">Câu {idx + 1}</span>
                                                <p className="q-content">{q.content}</p>
                                            </div>
                                            <div className="taking-answers-list">
                                                {q.answers.map((ans) => {
                                                    const isSelected = selectedId === ans.id;
                                                    const isCorrect = ans.isCorrect;
                                                    let statusClass = '';
                                                    if (isReviewing) {
                                                        if (isCorrect) statusClass = 'correct-ans';
                                                        else if (isSelected && !isCorrect) statusClass = 'wrong-ans';
                                                    }

                                                    return (
                                                        <label key={ans.id} className={`taking-answer-item ${isSelected ? 'selected' : ''} ${statusClass}`}>
                                                            <input 
                                                                type="radio"
                                                                name={`question-${q.id}`}
                                                                checked={isSelected}
                                                                onChange={() => !isReviewing && setStudentAnswers({...studentAnswers, [q.id]: ans.id})}
                                                                disabled={isReviewing}
                                                            />
                                                            <span className="ans-text">{ans.content}</span>
                                                            {isReviewing && isCorrect && (
                                                                <FontAwesomeIcon icon={faCheckCircle} className="review-status-icon correct" />
                                                            )}
                                                            {isReviewing && isSelected && !isCorrect && (
                                                                <FontAwesomeIcon icon={faTrashAlt} className="review-status-icon wrong" />
                                                            )}
                                                        </label>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            <div className="taking-footer">
                                <button className="submit-quiz-btn" onClick={handleSubmitQuiz}>
                                    <FontAwesomeIcon icon={isReviewing ? faChevronDown : faCheckCircle} rotation={isReviewing ? 90 : 0} />
                                    <span>{isReviewing ? "Quay lại danh sách" : "Nộp bài ngay"}</span>
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
                                            title="Thời gian làm bài (phút)"
                                        />
                                        <span>Phút</span>
                                    </div>
                                    <div className="duration-input-wrapper deadline">
                                        <FontAwesomeIcon icon={faCheckCircle} className="duration-icon" />
                                        <input 
                                            type="datetime-local" 
                                            value={deadline} 
                                            onChange={(e) => setDeadline(e.target.value)}
                                            title="Thời hạn nộp bài"
                                        />
                                        <span>Hạn nộp</span>
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
                                            <div key={ansIdx} className={`option-row ${ans.isCorrect ? 'is-correct' : ''}`}>
                                                <div 
                                                    className="option-radio-indicator"
                                                    onClick={() => handleToggleCorrect(q.id, ansIdx)}
                                                >
                                                    {ans.isCorrect ? (
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
                                                        : (ans.isCorrect ? "Nhập đáp án đúng..." : `Tùy chọn ${ansIdx + 1}`)
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
                            </div>

                            <div className="quiz-cards-grid">
                                {quizzes.length > 0 ? (
                                    quizzes.map((quiz) => {
                                        const attempt = attempts.find(a => a.quizId === quiz.id);
                                        const isOverdue = quiz.deadline && new Date(quiz.deadline) < new Date();
                                        const canStart = !isTeacher && !attempt && !isOverdue;
                                        
                                        return (
                                            <div key={quiz.id} className={`quiz-summary-card ${attempt ? 'completed' : ''} ${isOverdue && !attempt ? 'overdue' : ''}`}>
                                                <div className="quiz-card-icon">
                                                    <FontAwesomeIcon icon={attempt ? faCheckCircle : (isOverdue ? faTrashAlt : faBrain)} />
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
                                                            {quiz.durationMinutes || 15} phút
                                                        </span>
                                                        {quiz.deadline && (
                                                            <span className={isOverdue ? 'text-danger' : ''}>
                                                                <FontAwesomeIcon icon={faFileAlt} />
                                                                Hạn: {new Date(quiz.deadline).toLocaleString()}
                                                            </span>
                                                        )}
                                                        {attempt && (
                                                            <span className="quiz-score-badge">
                                                                <FontAwesomeIcon icon={faBolt} />
                                                                Điểm: {Number(attempt.score).toFixed(2)}/10
                                                            </span>
                                                        )}
                                                        {!attempt && isOverdue && !isTeacher && (
                                                            <span className="quiz-score-badge zero">
                                                                <FontAwesomeIcon icon={faBolt} />
                                                                Điểm: 0/10 (Quá hạn)
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                                <button 
                                                    className={`start-quiz-btn ${(!canStart && !isTeacher && !attempt) ? 'disabled' : ''}`}
                                                    onClick={() => {
                                                        if (isTeacher) handleEditQuiz(quiz);
                                                        else if (attempt) handleReviewQuiz(quiz, attempt);
                                                        else if (!isOverdue) handleStartQuiz(quiz);
                                                        else alert("Hết hạn làm bài!");
                                                    }}
                                                    disabled={!isTeacher && !attempt && isOverdue}
                                                >
                                                    <span>
                                                        {isTeacher ? "Xem chi tiết" : (attempt ? "Xem lại bài làm" : (isOverdue ? "Đã hết hạn" : "Bắt đầu làm bài"))}
                                                    </span>
                                                    <FontAwesomeIcon icon={attempt ? faFileAlt : faBolt} />
                                                </button>
                                            </div>
                                        );
                                    })
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
