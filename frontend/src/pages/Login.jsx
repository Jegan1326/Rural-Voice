import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

const Login = () => {
    const [identifier, setIdentifier] = useState('');
    const [password, setPassword] = useState('');

    // OTP State
    const [loginMethod, setLoginMethod] = useState('password'); // 'password' or 'otp'
    const [mobile, setMobile] = useState('');
    const [otp, setOtp] = useState('');
    const [step, setStep] = useState('mobile'); // 'mobile' or 'otp'

    const [error, setError] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (loginMethod === 'password') {
            const res = await login(identifier, password);
            if (res.success) {
                // Check role from storage as fallback/confirmation
                const userData = JSON.parse(localStorage.getItem('user'));
                if (userData?.role === 'Admin' || userData?.role === 'SuperAdmin') {
                    navigate('/admin');
                } else {
                    navigate('/dashboard');
                }
            } else {
                setError(res.message);
            }
        } else {
            // Mock OTP Flow
            if (step === 'mobile') {
                if (mobile.length !== 10) {
                    setError("Please enter a valid 10-digit mobile number");
                    return;
                }
                // Simulate sending OTP
                setStep('otp');
                alert(`OTP Sent to ${mobile}. (Mock OTP: 1234)`);
            } else {
                if (otp === '1234') {
                    alert("OTP Verified! (Mock Login Successful)");
                    navigate('/dashboard');
                } else {
                    setError("Invalid OTP");
                }
            }
        }
    };

    return (
        <div className="village-login-container">
            {/* Animated Village Background */}
            <div className="village-background"></div>

            {/* Decorative Elements */}
            <div className="village-sun"></div>
            <div className="village-tree village-tree-left"></div>
            <div className="village-tree village-tree-right"></div>

            {/* Login Card with Glassmorphism */}
            <div className="village-login-card">
                {/* Header with Village Theme */}
                <div className="village-header">
                    <div className="village-icon">🏘️</div>
                    <h2 className="village-title">Rural Voice</h2>
                    <p className="village-subtitle">Empowering Villages Together</p>
                </div>

                {error && (
                    <div className="village-error">
                        <span>⚠️</span> {error}
                    </div>
                )}

                {/* Login Method Tabs */}
                <div className="village-tabs">
                    <button
                        className={`village-tab ${loginMethod === 'password' ? 'village-tab-active' : ''}`}
                        onClick={() => setLoginMethod('password')}
                    >
                        🔐 Password
                    </button>
                    <button
                        className={`village-tab ${loginMethod === 'otp' ? 'village-tab-active' : ''}`}
                        onClick={() => setLoginMethod('otp')}
                    >
                        📱 OTP
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="village-form">
                    {loginMethod === 'password' ? (
                        <>
                            <div className="village-input-group">
                                <label className="village-label" htmlFor="identifier">
                                    📧 Mobile or Email
                                </label>
                                <input
                                    type="text"
                                    id="identifier"
                                    className="village-input"
                                    value={identifier}
                                    onChange={(e) => setIdentifier(e.target.value)}
                                    required
                                    placeholder="Enter your mobile or email"
                                />
                            </div>
                            <div className="village-input-group">
                                <label className="village-label" htmlFor="password">
                                    🔑 Password
                                </label>
                                <input
                                    type="password"
                                    id="password"
                                    className="village-input"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    placeholder="Enter your password"
                                />
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="village-input-group">
                                <label className="village-label" htmlFor="mobile">
                                    📱 Mobile Number
                                </label>
                                <input
                                    type="text"
                                    id="mobile"
                                    className="village-input"
                                    value={mobile}
                                    onChange={(e) => setMobile(e.target.value)}
                                    required
                                    placeholder="Enter 10-digit mobile"
                                />
                            </div>
                            {step === 'otp' && (
                                <div className="village-input-group">
                                    <label className="village-label" htmlFor="otp">
                                        🔢 Enter OTP
                                    </label>
                                    <input
                                        type="text"
                                        id="otp"
                                        className="village-input"
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value)}
                                        required
                                        placeholder="Enter OTP"
                                    />
                                    <p className="village-hint">💡 Hint: Use OTP 1234</p>
                                </div>
                            )}
                        </>
                    )}

                    <button type="submit" className="village-button">
                        {loginMethod === 'otp' && step === 'mobile' ? '📤 Send OTP' : '🚀 Login'}
                    </button>
                </form>

                <p className="village-footer">
                    Don't have an account? <Link to="/register" className="village-link">Join Us</Link>
                </p>
            </div>

            <style jsx>{`
                .village-login-container {
                    position: relative;
                    min-height: 100vh;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    overflow: hidden;
                    font-family: 'Inter', system-ui, -apple-system, sans-serif;
                }

                /* Animated Village Background */
                .village-background {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: linear-gradient(
                        135deg,
                        #87CEEB 0%,
                        #98D8C8 25%,
                        #D4A574 50%,
                        #6B8E23 75%,
                        #4A7C59 100%
                    );
                    background-size: 400% 400%;
                    animation: villageGradient 15s ease infinite;
                    z-index: 0;
                }

                @keyframes villageGradient {
                    0%, 100% { background-position: 0% 50%; }
                    50% { background-position: 100% 50%; }
                }

                /* Decorative Sun */
                .village-sun {
                    position: absolute;
                    top: 10%;
                    right: 15%;
                    width: 80px;
                    height: 80px;
                    background: radial-gradient(circle, #FFD700 0%, #FFA500 100%);
                    border-radius: 50%;
                    box-shadow: 0 0 60px rgba(255, 215, 0, 0.6);
                    animation: sunPulse 4s ease-in-out infinite;
                    z-index: 1;
                }

                @keyframes sunPulse {
                    0%, 100% { transform: scale(1); opacity: 0.9; }
                    50% { transform: scale(1.1); opacity: 1; }
                }

                /* Decorative Trees */
                .village-tree {
                    position: absolute;
                    bottom: 0;
                    width: 0;
                    height: 0;
                    border-left: 30px solid transparent;
                    border-right: 30px solid transparent;
                    border-bottom: 100px solid rgba(75, 85, 45, 0.3);
                    z-index: 1;
                }

                .village-tree-left {
                    left: 10%;
                    animation: treeSwayLeft 3s ease-in-out infinite;
                }

                .village-tree-right {
                    right: 10%;
                    animation: treeSwayRight 3s ease-in-out infinite;
                }

                @keyframes treeSwayLeft {
                    0%, 100% { transform: rotate(-2deg); }
                    50% { transform: rotate(2deg); }
                }

                @keyframes treeSwayRight {
                    0%, 100% { transform: rotate(2deg); }
                    50% { transform: rotate(-2deg); }
                }

                /* Glassmorphism Login Card */
                .village-login-card {
                    position: relative;
                    width: 90%;
                    max-width: 440px;
                    background: rgba(255, 255, 255, 0.15);
                    backdrop-filter: blur(20px);
                    border-radius: 24px;
                    padding: 40px 35px;
                    box-shadow: 
                        0 8px 32px 0 rgba(31, 38, 135, 0.2),
                        0 0 0 1px rgba(255, 255, 255, 0.18);
                    border: 1px solid rgba(255, 255, 255, 0.3);
                    animation: cardFloat 6s ease-in-out infinite;
                    z-index: 10;
                }

                @keyframes cardFloat {
                    0%, 100% { transform: translateY(0px); }
                    50% { transform: translateY(-10px); }
                }

                /* Header */
                .village-header {
                    text-align: center;
                    margin-bottom: 30px;
                }

                .village-icon {
                    font-size: 48px;
                    margin-bottom: 10px;
                    animation: iconBounce 2s ease-in-out infinite;
                }

                @keyframes iconBounce {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-8px); }
                }

                .village-title {
                    font-size: 32px;
                    font-weight: 700;
                    color: #ffffff;
                    margin: 0 0 8px 0;
                    text-shadow: 2px 2px 8px rgba(0, 0, 0, 0.3);
                }

                .village-subtitle {
                    font-size: 14px;
                    color: rgba(255, 255, 255, 0.9);
                    margin: 0;
                    font-weight: 500;
                }

                /* Error Message */
                .village-error {
                    background: rgba(220, 38, 38, 0.85);
                    backdrop-filter: blur(10px);
                    color: #ffffff;
                    padding: 12px 16px;
                    border-radius: 12px;
                    margin-bottom: 20px;
                    font-size: 14px;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    animation: errorShake 0.5s ease;
                }

                @keyframes errorShake {
                    0%, 100% { transform: translateX(0); }
                    25% { transform: translateX(-10px); }
                    75% { transform: translateX(10px); }
                }

                /* Tabs */
                .village-tabs {
                    display: flex;
                    gap: 12px;
                    margin-bottom: 24px;
                }

                .village-tab {
                    flex: 1;
                    padding: 12px 16px;
                    background: rgba(255, 255, 255, 0.1);
                    border: 2px solid rgba(255, 255, 255, 0.2);
                    border-radius: 12px;
                    color: rgba(255, 255, 255, 0.7);
                    font-weight: 600;
                    font-size: 14px;
                    cursor: pointer;
                    transition: all 0.3s ease;
                }

                .village-tab:hover {
                    background: rgba(255, 255, 255, 0.2);
                    transform: translateY(-2px);
                }

                .village-tab-active {
                    background: rgba(107, 142, 35, 0.85);
                    border-color: rgba(107, 142, 35, 1);
                    color: #ffffff;
                    box-shadow: 0 4px 12px rgba(107, 142, 35, 0.4);
                }

                /* Form */
                .village-form {
                    display: flex;
                    flex-direction: column;
                    gap: 20px;
                }

                .village-input-group {
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                }

                .village-label {
                    font-size: 14px;
                    font-weight: 600;
                    color: rgba(255, 255, 255, 0.95);
                    text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.2);
                }

                .village-input {
                    padding: 14px 16px;
                    background: rgba(255, 255, 255, 0.9);
                    border: 2px solid rgba(255, 255, 255, 0.3);
                    border-radius: 12px;
                    font-size: 15px;
                    color: #2d3748;
                    transition: all 0.3s ease;
                    outline: none;
                }

                .village-input::placeholder {
                    color: rgba(0, 0, 0, 0.4);
                }

                .village-input:focus {
                    background: rgba(255, 255, 255, 1);
                    border-color: #6B8E23;
                    box-shadow: 
                        0 0 0 4px rgba(107, 142, 35, 0.2),
                        0 4px 12px rgba(0, 0, 0, 0.1);
                    transform: translateY(-2px);
                }

                .village-hint {
                    font-size: 12px;
                    color: rgba(255, 255, 255, 0.8);
                    margin: 0;
                    font-style: italic;
                }

                /* Button */
                .village-button {
                    margin-top: 8px;
                    padding: 16px 24px;
                    background: linear-gradient(135deg, #6B8E23 0%, #4A7C59 100%);
                    border: none;
                    border-radius: 12px;
                    color: #ffffff;
                    font-size: 16px;
                    font-weight: 700;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    box-shadow: 0 4px 15px rgba(107, 142, 35, 0.4);
                }

                .village-button:hover {
                    transform: translateY(-3px);
                    box-shadow: 0 6px 20px rgba(107, 142, 35, 0.6);
                    background: linear-gradient(135deg, #7FA835 0%, #5A8C69 100%);
                }

                .village-button:active {
                    transform: translateY(-1px);
                }

                /* Footer */
                .village-footer {
                    text-align: center;
                    margin-top: 24px;
                    font-size: 14px;
                    color: rgba(255, 255, 255, 0.9);
                }

                .village-link {
                    color: #FFD700;
                    font-weight: 600;
                    text-decoration: none;
                    transition: all 0.3s ease;
                }

                .village-link:hover {
                    color: #FFA500;
                    text-decoration: underline;
                }

                /* Responsive Design */
                @media (max-width: 640px) {
                    .village-login-card {
                        padding: 30px 25px;
                    }

                    .village-title {
                        font-size: 28px;
                    }

                    .village-sun {
                        width: 60px;
                        height: 60px;
                        top: 8%;
                        right: 10%;
                    }

                    .village-tree {
                        border-left-width: 20px;
                        border-right-width: 20px;
                        border-bottom-width: 70px;
                    }
                }
            `}</style>
        </div>
    );
};

export default Login;
