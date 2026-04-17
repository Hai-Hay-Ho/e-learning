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
    const [question, setQuestion] = useState('');
    const [options, setOptions] = useState({
        A: '',
        B: '',
        C: '',
        D: ''
    });
    const [correctOption, setCorrectOption] = useState('D'); // D is correct by default as per user request

    const isTeacher = userRole === "1";

    useEffect(() => {
        if (session?.user?.id) {
            fetchClasses();
        }
    }, [session]);

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

    const handleGenerateAI = () => {
        const correctText = options[correctOption];
        if (!question.trim() || !correctText.trim()) {
            alert("Vui lòng nhập câu hỏi và nội dung đáp án đúng!");
            return;
        }

        setIsGenerating(true);

        // Simulate AI process
        setTimeout(() => {
            const newOptions = { ...options };
            const distractorLabels = ['A', 'B', 'C', 'D'].filter(l => l !== correctOption);
            
            distractorLabels.forEach((label, index) => {
                newOptions[label] = `Phương án gây nhiễu ${index + 1} cho "${correctText.slice(0, 15)}..."`;
            });

            setOptions(newOptions);
            setIsGenerating(false);
        }, 1500);
    };

    const handleOptionChange = (label, value) => {
        setOptions(prev => ({ ...prev, [label]: value }));
    };

    const handleSave = () => {
        alert("Đã lưu bộ câu hỏi thành công! (Mockup)");
        // Reset form
        setQuestion('');
        setOptions({ A: '', B: '', C: '', D: '' });
    };

    return (
        <div className="equizz-container">
            {/* Sidebar */}
            <aside className="equizz-sidebar">
                <div className="equizz-sidebar-header">
                    <div className="equizz-app-logo">
                        <span>E-Quizz</span>
                    </div>
                    
                    <button className="equizz-create-btn">
                        <FontAwesomeIcon icon={faPlus} />
                        <span>Tạo bộ câu hỏi</span>
                    </button>
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
            <main className="equizz-main-content">
                {selectedClass ? (
                    <div className="equizz-builder-scroll-area">
                        {/* AI Toolbox Banner */}
                        <div className="equizz-ai-banner">
                            <div className="equizz-ai-banner-title">
                                <div className="ai-spark-icon">
                                    <FontAwesomeIcon icon={faBolt} />
                                </div>
                                <p>Hãy sử dụng <span className="ai-highlight">E-QUIZZ AI</span> để nhanh chóng tạo ra nhiều câu hỏi khác</p>
                                <div className="ai-mascot-container">
                                    <FontAwesomeIcon icon={faRobot} className="ai-robot-mascot" />
                                </div>
                            </div>
                            <div className="equizz-ai-cards">
                                <div className="equizz-ai-card">
                                    <div className="ai-card-icon-wrapper file">
                                        <FontAwesomeIcon icon={faFileAlt} />
                                    </div>
                                    <span>Trích xuất từ tệp</span>
                                </div>
                            </div>
                        </div>

                        {/* Question Builder Card */}
                        <div className="equizz-question-builder-card">
                            <div className="card-drag-handle">
                                <FontAwesomeIcon icon={faEllipsisH} />
                            </div>

                            <div className="card-header">
                                <div className="header-left">
                                    <span className="question-number"># 1</span>
                                </div>
                                <div className="header-right">
                                    <button className="ai-similar-btn" onClick={handleGenerateAI}>
                                        <FontAwesomeIcon icon={faClone} />
                                        <span>Tạo câu hỏi tương tự</span>
                                        <div className="spark-badge">
                                            <FontAwesomeIcon icon={faBolt} />
                                        </div>
                                    </button>
                                    <button className="utility-icon-btn">
                                        <FontAwesomeIcon icon={faCopy} />
                                    </button>
                                    <button className="utility-icon-btn delete">
                                        <FontAwesomeIcon icon={faTrashAlt} />
                                    </button>
                                </div>
                            </div>

                            <div className="question-input-section">
                                <textarea 
                                    className="question-textarea"
                                    placeholder="Nhập nội dung câu hỏi tại đây..."
                                    rows="2"
                                    value={question}
                                    onChange={(e) => setQuestion(e.target.value)}
                                />
                            </div>

                            <div className="options-vertical-list">
                                {['A', 'B', 'C', 'D'].map((label) => (
                                    <div key={label} className={`option-row ${correctOption === label ? 'is-correct' : ''}`}>
                                        <div 
                                            className="option-radio-indicator"
                                            onClick={() => setCorrectOption(label)}
                                        >
                                            {correctOption === label ? (
                                                <FontAwesomeIcon icon={faCheckCircle} className="checked-icon" />
                                            ) : (
                                                <FontAwesomeIcon icon={faCircle} className="unchecked-icon" />
                                            )}
                                        </div>
                                        <input 
                                            type="text"
                                            className="option-text-input"
                                            placeholder={correctOption === label ? "Nhập đáp án đúng..." : `Tùy chọn ${['1','2','3','4'][['A','B','C','D'].indexOf(label)]}`}
                                            value={options[label]}
                                            onChange={(e) => handleOptionChange(label, e.target.value)}
                                        />
                                    </div>
                                ))}
                            </div>

                            <div className="options-footer-actions">
                                <button className="add-option-full-btn" onClick={() => {/* handle add option logic */}}>
                                    <FontAwesomeIcon icon={faPlusCircle} />
                                    <span>Thêm tùy chọn</span>
                                </button>
                            </div>

                            <div className="card-footer">
                                <button className="equizz-save-main-btn" onClick={handleSave} disabled={!question}>
                                    <FontAwesomeIcon icon={faSave} />
                                    <span>Lưu câu hỏi</span>
                                </button>
                            </div>
                        </div>

                        {/* Add New Question Section */}
                        <div className="add-new-question-section">
                            <div className="question-type-grid">
                                <div className="q-type-card trắc-nghiệm">
                                    <div className="q-type-icon checked">
                                        <FontAwesomeIcon icon={faCheckCircle} />
                                    </div>
                                    <span>Thêm câu hỏi +</span>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="equizz-empty-state">
                        <div className="equizz-empty-icon">
                            <FontAwesomeIcon icon={faGraduationCap} />
                        </div>
                        <h3>Chọn một lớp học để bắt đầu tạo Quiz</h3>
                    </div>
                )}
            </main>
        </div>
    );
};

export default EQuizz;
