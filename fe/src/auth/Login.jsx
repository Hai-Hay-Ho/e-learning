import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faEnvelope, faLock, faUser, faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import { supabase } from '../supabaseClient';
import './Login.css';

const Login = ({ onClose }) => {
    const [isSignUp, setIsSignUp] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [successMsg, setSuccessMsg] = useState('');

    const handleGoogleLogin = async () => {
        setLoading(true);
        setErrorMsg('');
        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    queryParams: {
                        access_type: 'offline',
                        prompt: 'consent',
                    },
                    redirectTo: window.location.origin
                }
            });
            if (error) throw error;
        } catch (error) {
            console.error("Error logging in with Google:", error.message);
            setErrorMsg("Đăng nhập bằng Google thất bại: " + error.message);
            setLoading(false);
        }
    };

    const handleAuth = async (e) => {
        e.preventDefault();
        setErrorMsg('');
        setSuccessMsg('');

        if (!email.trim() || !password.trim()) {
            setErrorMsg('Vui lòng điền đầy đủ email và mật khẩu.');
            return;
        }

        if (isSignUp) {
            if (!fullName.trim()) {
                setErrorMsg('Vui lòng nhập họ và tên.');
                return;
            }
            if (password !== confirmPassword) {
                setErrorMsg('Mật khẩu nhập lại không khớp.');
                return;
            }
            if (password.length < 6) {
                setErrorMsg('Mật khẩu phải dài ít nhất 6 ký tự.');
                return;
            }
        }

        setLoading(true);

        try {
            if (isSignUp) {
                // Đăng ký
                const { data, error } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        data: {
                            full_name: fullName,
                        }
                    }
                });
                if (error) throw error;
                
                // Nếu Supabase trả về user nhưng session null (do cần xác thực email)
                if (data.user && !data.session) {
                    setSuccessMsg('Đăng ký thành công! Vui lòng kiểm tra email của bạn để xác nhận tài khoản.');
                } else {
                    setSuccessMsg('Đăng ký tài khoản thành công!');
                    setTimeout(() => onClose(), 1500);
                }
            } else {
                // Đăng nhập
                const { data, error } = await supabase.auth.signInWithPassword({
                    email,
                    password
                });
                if (error) throw error;

                setSuccessMsg('Đăng nhập thành công!');
                setTimeout(() => onClose(), 1000);
            }
        } catch (error) {
            console.error("Authentication error:", error.message);
            setErrorMsg(error.message === 'Invalid login credentials' 
                ? 'Email hoặc mật khẩu không chính xác.' 
                : error.message
            );
        } finally {
            setLoading(false);
        }
    };

    const toggleMode = () => {
        setIsSignUp(!isSignUp);
        setErrorMsg('');
        setSuccessMsg('');
        setEmail('');
        setPassword('');
        setConfirmPassword('');
        setFullName('');
    };

    return (
        <div className="login-overlay" onClick={onClose}>
            <div className="login-container" onClick={(e) => e.stopPropagation()}>
                <button className="login-close" onClick={onClose} aria-label="Close">
                    <FontAwesomeIcon icon={faTimes} />
                </button>
                
                <div className="login-header">
                    <h2>{isSignUp ? 'Tạo tài khoản' : 'Chào mừng quay trở lại'}</h2>
                    <p>{isSignUp ? 'Đăng ký để cùng tham gia các lớp học thú vị' : 'Đăng nhập để tiếp tục hành trình học tập'}</p>
                </div>

                <div className="auth-tabs">
                    <button 
                        className={`auth-tab ${!isSignUp ? 'active' : ''}`} 
                        onClick={() => isSignUp && toggleMode()}
                    >
                        Đăng nhập
                    </button>
                    <button 
                        className={`auth-tab ${isSignUp ? 'active' : ''}`} 
                        onClick={() => !isSignUp && toggleMode()}
                    >
                        Đăng ký
                    </button>
                </div>

                <div className="login-content">
                    {errorMsg && <div className="auth-alert error">{errorMsg}</div>}
                    {successMsg && <div className="auth-alert success">{successMsg}</div>}

                    <form onSubmit={handleAuth} className="auth-form">
                        {isSignUp && (
                            <div className="input-group">
                                <span className="input-icon"><FontAwesomeIcon icon={faUser} /></span>
                                <input 
                                    type="text" 
                                    placeholder="Họ và tên" 
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    required
                                    disabled={loading}
                                />
                            </div>
                        )}

                        <div className="input-group">
                            <span className="input-icon"><FontAwesomeIcon icon={faEnvelope} /></span>
                            <input 
                                type="email" 
                                placeholder="Địa chỉ Email" 
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                disabled={loading}
                            />
                        </div>

                        <div className="input-group">
                            <span className="input-icon"><FontAwesomeIcon icon={faLock} /></span>
                            <input 
                                type={showPassword ? 'text' : 'password'} 
                                placeholder="Mật khẩu" 
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                disabled={loading}
                            />
                            <button 
                                type="button" 
                                className="password-toggle"
                                onClick={() => setShowPassword(!showPassword)}
                                tabIndex="-1"
                            >
                                <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
                            </button>
                        </div>

                        {isSignUp && (
                            <div className="input-group">
                                <span className="input-icon"><FontAwesomeIcon icon={faLock} /></span>
                                <input 
                                    type={showPassword ? 'text' : 'password'} 
                                    placeholder="Xác nhận mật khẩu" 
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                    disabled={loading}
                                />
                            </div>
                        )}

                        <button type="submit" className="submit-btn" disabled={loading}>
                            {loading ? (
                                <span className="spinner"></span>
                            ) : (
                                isSignUp ? 'Đăng ký' : 'Đăng nhập'
                            )}
                        </button>
                    </form>

                    <div className="divider">
                        <span>Hoặc tiếp tục với</span>
                    </div>

                    <button className="google-login-btn" onClick={handleGoogleLogin} disabled={loading}>
                        <svg className="google-icon" viewBox="0 0 24 24" width="20" height="20" xmlns="http://www.w3.org/2000/svg">
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 12-4.53z" fill="#EA4335"/>
                        </svg>
                        <span>Google</span>
                    </button>
                </div>
                
                <div className="login-footer">
                    <p>Bằng cách tiếp tục, bạn đồng ý với các <span>Điều khoản dịch vụ</span> và <span>Chính sách bảo mật</span> của chúng tôi.</p>
                </div>
            </div>
        </div>
    );
};

export default Login;

