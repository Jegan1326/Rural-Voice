import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

const ReportIssue = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('Water');
    const [image, setImage] = useState(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleFileChange = (e) => {
        setImage(e.target.files[0]);
    };

    // Voice Recording Logic
    const [recording, setRecording] = useState(false);
    const [mediaRecorder, setMediaRecorder] = useState(null);
    const [voiceBlob, setVoiceBlob] = useState(null);
    const [voicePreviewUrl, setVoicePreviewUrl] = useState(null);

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const recorder = new MediaRecorder(stream);
            const chunks = [];

            recorder.ondataavailable = (e) => chunks.push(e.data);
            recorder.onstop = () => {
                const blob = new Blob(chunks, { type: 'audio/webm' });
                setVoiceBlob(blob);
                setVoicePreviewUrl(window.URL.createObjectURL(blob));
            };

            recorder.start();
            setMediaRecorder(recorder);
            setRecording(true);
        } catch (err) {
            console.error("Error accessing microphone:", err);
            alert("Could not access microphone.");
        }
    };

    const stopRecording = () => {
        if (mediaRecorder) {
            mediaRecorder.stop();
            setRecording(false);
            mediaRecorder.stream.getTracks().forEach(track => track.stop());
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        const formData = new FormData();
        formData.append('title', title);
        formData.append('description', description);
        formData.append('category', category);
        formData.append('village', user.village);
        if (image) {
            formData.append('image', image);
        }
        if (voiceBlob) {
            formData.append('voice', voiceBlob, 'voice-note.webm');
        }

        try {
            await api.post('/issues', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            navigate('/dashboard');
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || 'Failed to submit issue');
        } finally {
            setLoading(false);
        }
    };

    // Category theme configurations
    const categoryThemes = {
        Water: {
            gradient: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 50%, #60a5fa 100%)',
            icon: '💧',
            decorElement: 'water-drop',
            accentColor: '#3b82f6'
        },
        Electricity: {
            gradient: 'linear-gradient(135deg, #854d0e 0%, #eab308 50%, #fde047 100%)',
            icon: '⚡',
            decorElement: 'lightning',
            accentColor: '#eab308'
        },
        Roads: {
            gradient: 'linear-gradient(135deg, #1f2937 0%, #4b5563 50%, #6b7280 100%)',
            icon: '🛣️',
            decorElement: 'road',
            accentColor: '#6b7280'
        },
        Sanitation: {
            gradient: 'linear-gradient(135deg, #14532d 0%, #16a34a 50%, #4ade80 100%)',
            icon: '🌱',
            decorElement: 'leaf',
            accentColor: '#16a34a'
        },
        Agriculture: {
            gradient: 'linear-gradient(135deg, #78350f 0%, #f59e0b 50%, #fbbf24 100%)',
            icon: '🌾',
            decorElement: 'wheat',
            accentColor: '#f59e0b'
        },
        'Public Safety': {
            gradient: 'linear-gradient(135deg, #7c2d12 0%, #ea580c 50%, #fb923c 100%)',
            icon: '🚨',
            decorElement: 'alert',
            accentColor: '#ea580c'
        },
        Other: {
            gradient: 'linear-gradient(135deg, #4c1d95 0%, #7c3aed 50%, #a78bfa 100%)',
            icon: '📋',
            decorElement: 'note',
            accentColor: '#7c3aed'
        }
    };

    const currentTheme = categoryThemes[category];

    return (
        <div className="issue-report-container">
            {/* Dynamic Background */}
            <div
                className="issue-background"
                style={{ background: currentTheme.gradient }}
            ></div>

            {/* Decorative Elements based on Category */}
            <div className={`decorative-element ${currentTheme.decorElement}`}></div>
            <div className={`decorative-element ${currentTheme.decorElement} element-2`}></div>
            <div className={`decorative-element ${currentTheme.decorElement} element-3`}></div>

            {/* Glassmorphism Form Card */}
            <div className="issue-card">
                {/* Header */}
                <div className="issue-header">
                    <div className="issue-icon">{currentTheme.icon}</div>
                    <h2 className="issue-title">Report Village Issue</h2>
                    <p className="issue-subtitle">Help improve our community</p>
                </div>

                {error && (
                    <div className="issue-error">
                        <span>⚠️</span> {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="issue-form">
                    {/* Category Selector */}
                    <div className="issue-input-group">
                        <label className="issue-label" htmlFor="category">
                            📂 Issue Category
                        </label>
                        <select
                            id="category"
                            className="issue-select"
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            style={{ borderColor: currentTheme.accentColor }}
                        >
                            <option value="Water">💧 Water Supply</option>
                            <option value="Electricity">⚡ Electricity</option>
                            <option value="Roads">🛣️ Roads & Infrastructure</option>
                            <option value="Sanitation">🌱 Sanitation & Cleanliness</option>
                            <option value="Agriculture">🌾 Agriculture</option>
                            <option value="Public Safety">🚨 Public Safety</option>
                            <option value="Other">📋 Other</option>
                        </select>
                    </div>

                    {/* Title */}
                    <div className="issue-input-group">
                        <label className="issue-label" htmlFor="title">
                            📝 Issue Title
                        </label>
                        <input
                            type="text"
                            id="title"
                            className="issue-input"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Brief description of the problem"
                            required
                            style={{
                                borderColor: currentTheme.accentColor,
                                '--focus-color': currentTheme.accentColor
                            }}
                        />
                    </div>

                    {/* Description */}
                    <div className="issue-input-group">
                        <label className="issue-label" htmlFor="description">
                            📄 Detailed Description
                        </label>
                        <textarea
                            id="description"
                            rows="4"
                            className="issue-textarea"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            onBlur={async () => {
                                if (description.length > 5) {
                                    try {
                                        const { data } = await api.post('/analytics/suggest-category', { description });
                                        if (data.category) setCategory(data.category);
                                    } catch (err) {
                                        console.error("Auto-categorization failed", err);
                                    }
                                }
                            }}
                            placeholder="Explain the issue in detail..."
                            required
                            style={{
                                borderColor: currentTheme.accentColor,
                                '--focus-color': currentTheme.accentColor
                            }}
                        ></textarea>
                        <p className="issue-hint">
                            🤖 AI will auto-suggest category based on your description
                        </p>
                    </div>

                    {/* Image Upload */}
                    <div className="issue-input-group">
                        <label className="issue-label" htmlFor="image">
                            📸 Upload Image (Optional)
                        </label>
                        <div className="file-upload-wrapper">
                            <input
                                type="file"
                                id="image"
                                accept="image/*"
                                className="file-input"
                                onChange={handleFileChange}
                            />
                            <label htmlFor="image" className="file-upload-label" style={{ borderColor: currentTheme.accentColor }}>
                                {image ? (
                                    <>✅ {image.name}</>
                                ) : (
                                    <>📁 Click to select image</>
                                )}
                            </label>
                        </div>
                    </div>

                    {/* Voice Recording */}
                    <div className="issue-input-group">
                        <label className="issue-label">
                            🎤 Voice Note (Optional)
                        </label>
                        <div className="voice-controls">
                            {!recording ? (
                                <button
                                    type="button"
                                    onClick={startRecording}
                                    className="voice-button record-button"
                                    style={{ backgroundColor: currentTheme.accentColor }}
                                >
                                    <span className="mic-icon">🎙️</span>
                                    Start Recording
                                </button>
                            ) : (
                                <button
                                    type="button"
                                    onClick={stopRecording}
                                    className="voice-button stop-button"
                                >
                                    <span className="stop-icon">⏹️</span>
                                    Stop Recording
                                </button>
                            )}
                            {voicePreviewUrl && (
                                <audio controls src={voicePreviewUrl} className="audio-player" />
                            )}
                        </div>
                        <p className="issue-hint">Record up to 1 minute</p>
                    </div>

                    {/* Action Buttons */}
                    <div className="action-buttons">
                        <button
                            type="button"
                            onClick={() => navigate('/dashboard')}
                            className="cancel-button"
                        >
                            ← Back
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="submit-button"
                            style={{ background: `linear-gradient(135deg, ${currentTheme.accentColor} 0%, ${currentTheme.accentColor}dd 100%)` }}
                        >
                            {loading ? '⏳ Submitting...' : '🚀 Submit Issue'}
                        </button>
                    </div>
                </form>
            </div>

            <style jsx>{`
                .issue-report-container {
                    position: relative;
                    min-height: 100vh;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 20px;
                    overflow: hidden;
                    font-family: 'Inter', system-ui, -apple-system, sans-serif;
                }

                /* Dynamic Background */
                .issue-background {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    transition: background 0.6s ease;
                    z-index: 0;
                }

                /* Decorative Elements */
                .decorative-element {
                    position: absolute;
                    opacity: 0.15;
                    z-index: 1;
                }

                /* Water Drops */
                .water-drop {
                    width: 60px;
                    height: 80px;
                    background: rgba(255, 255, 255, 0.4);
                    border-radius: 0 50% 50% 50%;
                    transform: rotate(-45deg);
                    animation: fallDrop 4s ease-in-out infinite;
                }

                .water-drop.element-2 {
                    top: 10%;
                    right: 20%;
                    animation-delay: 1s;
                }

                .water-drop.element-3 {
                    top: 60%;
                    left: 15%;
                    animation-delay: 2s;
                }

                @keyframes fallDrop {
                    0%, 100% { transform: rotate(-45deg) translateY(0); }
                    50% { transform: rotate(-45deg) translateY(20px); }
                }

                /* Lightning Bolts */
                .lightning {
                    width: 0;
                    height: 0;
                    border-left: 25px solid transparent;
                    border-right: 25px solid transparent;
                    border-top: 60px solid rgba(255, 255, 255, 0.5);
                    animation: flash 2s ease-in-out infinite;
                }

                .lightning.element-2 {
                    top: 15%;
                    right: 25%;
                    animation-delay: 0.5s;
                }

                .lightning.element-3 {
                    bottom: 20%;
                    left: 20%;
                    animation-delay: 1.5s;
                }

                @keyframes flash {
                    0%, 100% { opacity: 0.15; }
                    50% { opacity: 0.4; }
                }

                /* Road Markings */
                .road {
                    width: 80px;
                    height: 20px;
                    background: repeating-linear-gradient(
                        90deg,
                        rgba(255, 255, 255, 0.4) 0px,
                        rgba(255, 255, 255, 0.4) 20px,
                        transparent 20px,
                        transparent 40px
                    );
                    animation: roadMove 3s linear infinite;
                }

                .road.element-2 {
                    top: 20%;
                    right: 15%;
                }

                .road.element-3 {
                    bottom: 30%;
                    left: 10%;
                }

                @keyframes roadMove {
                    0% { background-position: 0 0; }
                    100% { background-position: 40px 0; }
                }

                /* Leaves */
                .leaf {
                    width: 50px;
                    height: 50px;
                    background: rgba(255, 255, 255, 0.3);
                    border-radius: 0 100%;
                    animation: leafSway 3s ease-in-out infinite;
                }

                .leaf.element-2 {
                    top: 25%;
                    right: 18%;
                    animation-delay: 1s;
                }

                .leaf.element-3 {
                    bottom: 25%;
                    left: 22%;
                    animation-delay: 2s;
                }

                @keyframes leafSway {
                    0%, 100% { transform: rotate(0deg); }
                    50% { transform: rotate(15deg); }
                }

                /* Wheat */
                .wheat {
                    width: 5px;
                    height: 70px;
                    background: rgba(255, 255, 255, 0.4);
                    border-radius: 50% 50% 0 0;
                    animation: wheatWave 2.5s ease-in-out infinite;
                }

                .wheat.element-2 {
                    top: 18%;
                    right: 12%;
                    animation-delay: 0.8s;
                }

                .wheat.element-3 {
                    bottom: 22%;
                    left: 18%;
                    animation-delay: 1.6s;
                }

                @keyframes wheatWave {
                    0%, 100% { transform: rotate(-5deg); }
                    50% { transform: rotate(5deg); }
                }

                /* Alert/Safety */
                .alert {
                    width: 70px;
                    height: 70px;
                    border: 8px solid rgba(255, 255, 255, 0.4);
                    border-radius: 50%;
                    animation: alertPulse 2s ease-in-out infinite;
                }

                .alert.element-2 {
                    top: 22%;
                    right: 20%;
                }

                .alert.element-3 {
                    bottom: 28%;
                    left: 16%;
                    animation-delay: 1s;
                }

                @keyframes alertPulse {
                    0%, 100% { transform: scale(1); opacity: 0.15; }
                    50% { transform: scale(1.2); opacity: 0.3; }
                }

                /* Note/Other */
                .note {
                    width: 60px;
                    height: 60px;
                    background: rgba(255, 255, 255, 0.3);
                    border-radius: 8px;
                    animation: noteFloat 4s ease-in-out infinite;
                }

                .note.element-2 {
                    top: 20%;
                    right: 25%;
                    animation-delay: 1.3s;
                }

                .note.element-3 {
                    bottom: 25%;
                    left: 20%;
                    animation-delay: 2.6s;
                }

                @keyframes noteFloat {
                    0%, 100% { transform: translateY(0) rotate(0deg); }
                    50% { transform: translateY(-15px) rotate(5deg); }
                }

                /* Form Card */
                .issue-card {
                    position: relative;
                    width: 100%;
                    max-width: 600px;
                    background: rgba(255, 255, 255, 0.18);
                    backdrop-filter: blur(25px);
                    border-radius: 20px;
                    padding: 35px 30px;
                    box-shadow: 
                        0 8px 32px 0 rgba(31, 38, 135, 0.25),
                        0 0 0 1px rgba(255, 255, 255, 0.2);
                    border: 1px solid rgba(255, 255, 255, 0.3);
                    z-index: 10;
                    animation: cardEntrance 0.6s ease-out;
                }

                @keyframes cardEntrance {
                    from {
                        opacity: 0;
                        transform: translateY(30px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                /* Header */
                .issue-header {
                    text-align: center;
                    margin-bottom: 25px;
                }

                .issue-icon {
                    font-size: 48px;
                    margin-bottom: 10px;
                    animation: iconPop 0.8s ease-out;
                }

                @keyframes iconPop {
                    0% { transform: scale(0); }
                    60% { transform: scale(1.2); }
                    100% { transform: scale(1); }
                }

                .issue-title {
                    font-size: 28px;
                    font-weight: 700;
                    color: #ffffff;
                    margin: 0 0 6px 0;
                    text-shadow: 2px 2px 8px rgba(0, 0, 0, 0.3);
                }

                .issue-subtitle {
                    font-size: 14px;
                    color: rgba(255, 255, 255, 0.9);
                    margin: 0;
                    font-weight: 400;
                }

                /* Error */
                .issue-error {
                    background: rgba(220, 38, 38, 0.85);
                    backdrop-filter: blur(10px);
                    color: #ffffff;
                    padding: 12px 16px;
                    border-radius: 10px;
                    margin-bottom: 20px;
                    font-size: 14px;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    animation: errorShake 0.5s ease;
                }

                @keyframes errorShake {
                    0%, 100% { transform: translateX(0); }
                    25% { transform: translateX(-8px); }
                    75% { transform: translateX(8px); }
                }

                /* Form */
                .issue-form {
                    display: flex;
                    flex-direction: column;
                    gap: 18px;
                }

                .issue-input-group {
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                }

                .issue-label {
                    font-size: 14px;
                    font-weight: 600;
                    color: rgba(255, 255, 255, 0.95);
                    text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.2);
                }

                .issue-input,
                .issue-select,
                .issue-textarea {
                    padding: 12px 14px;
                    background: rgba(255, 255, 255, 0.92);
                    border: 2px solid rgba(255, 255, 255, 0.4);
                    border-radius: 10px;
                    font-size: 15px;
                    color: #2d3748;
                    transition: all 0.3s ease;
                    outline: none;
                }

                .issue-input::placeholder,
                .issue-textarea::placeholder {
                    color: rgba(0, 0, 0, 0.4);
                }

                .issue-input:focus,
                .issue-select:focus,
                .issue-textarea:focus {
                    background: rgba(255, 255, 255, 1);
                    box-shadow: 
                        0 0 0 4px var(--focus-color, #3b82f6)33,
                        0 4px 12px rgba(0, 0, 0, 0.1);
                    transform: translateY(-2px);
                }

                .issue-select {
                    cursor: pointer;
                    font-weight: 500;
                }

                .issue-hint {
                    font-size: 12px;
                    color: rgba(255, 255, 255, 0.85);
                    margin: 0;
                    font-style: italic;
                }

                /* File Upload */
                .file-upload-wrapper {
                    position: relative;
                }

                .file-input {
                    display: none;
                }

                .file-upload-label {
                    display: block;
                    padding: 14px 16px;
                    background: rgba(255, 255, 255, 0.92);
                    border: 2px dashed rgba(255, 255, 255, 0.4);
                    border-radius: 10px;
                    text-align: center;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    color: #2d3748;
                    font-weight: 500;
                }

                .file-upload-label:hover {
                    background: rgba(255, 255, 255, 1);
                    transform: translateY(-2px);
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
                }

                /* Voice Controls */
                .voice-controls {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    flex-wrap: wrap;
                }

                .voice-button {
                    padding: 12px 20px;
                    border: none;
                    border-radius: 10px;
                    color: #ffffff;
                    font-size: 14px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }

                .record-button {
                    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
                }

                .record-button:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
                }

                .stop-button {
                    background: #dc2626;
                    animation: recordPulse 1.5s ease-in-out infinite;
                }

                @keyframes recordPulse {
                    0%, 100% { box-shadow: 0 0 0 0 rgba(220, 38, 38, 0.7); }
                    50% { box-shadow: 0 0 0 10px rgba(220, 38, 38, 0); }
                }

                .mic-icon,
                .stop-icon {
                    font-size: 18px;
                }

                .audio-player {
                    flex: 1;
                    min-width: 200px;
                    height: 40px;
                    border-radius: 20px;
                }

                /* Action Buttons */
                .action-buttons {
                    display: flex;
                    justify-content: space-between;
                    gap: 12px;
                    margin-top: 10px;
                }

                .cancel-button,
                .submit-button {
                    padding: 14px 28px;
                    border: none;
                    border-radius: 10px;
                    font-size: 15px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.3s ease;
                }

                .cancel-button {
                    background: rgba(255, 255, 255, 0.2);
                    color: rgba(255, 255, 255, 0.95);
                    border: 2px solid rgba(255, 255, 255, 0.3);
                }

                .cancel-button:hover {
                    background: rgba(255, 255, 255, 0.3);
                    transform: translateY(-2px);
                }

                .submit-button {
                    color: #ffffff;
                    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
                    flex: 1;
                }

                .submit-button:hover:not(:disabled) {
                    transform: translateY(-3px);
                    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
                }

                .submit-button:disabled {
                    opacity: 0.6;
                    cursor: not-allowed;
                }

                /* Responsive */
                @media (max-width: 640px) {
                    .issue-card {
                        padding: 25px 20px;
                    }

                    .issue-title {
                        font-size: 24px;
                    }

                    .issue-icon {
                        font-size: 40px;
                    }

                    .action-buttons {
                        flex-direction: column;
                    }

                    .decorative-element {
                        transform: scale(0.7);
                    }
                }
            `}</style>
        </div>
    );
};

export default ReportIssue;
