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
            mediaRecorder.stream.getTracks().forEach(track => track.stop()); // Stop stream
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

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-100 p-4">
            <div className="w-full max-w-lg rounded-lg bg-white p-8 shadow-md">
                <h2 className="mb-6 text-center text-2xl font-bold text-gray-800">Report a Problem</h2>
                {error && <div className="mb-4 rounded bg-red-100 p-2 text-red-700">{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="mb-2 block text-sm font-bold text-gray-700" htmlFor="title">
                            Issue Title
                        </label>
                        <input
                            type="text"
                            id="title"
                            className="w-full rounded border px-3 py-2 leading-tight text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            required
                        />
                    </div>

                    <div className="mb-4">
                        <label className="mb-2 block text-sm font-bold text-gray-700" htmlFor="category">
                            Category
                        </label>
                        <select
                            id="category"
                            className="w-full rounded border px-3 py-2 leading-tight text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                        >
                            <option value="Water">Water</option>
                            <option value="Roads">Roads</option>
                            <option value="Electricity">Electricity</option>
                            <option value="Sanitation">Sanitation</option>
                            <option value="Agriculture">Agriculture</option>
                            <option value="Public Safety">Public Safety</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>

                    <div className="mb-4">
                        <label className="mb-2 block text-sm font-bold text-gray-700" htmlFor="description">
                            Description
                        </label>
                        <textarea
                            id="description"
                            rows="4"
                            className="w-full rounded border px-3 py-2 leading-tight text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500"
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
                            required
                        ></textarea>
                        <p className="mt-1 text-xs text-blue-500">
                            *AI Hint: Enter description and click outside to auto-select category.
                        </p>
                    </div>

                    <div className="mb-6">
                        <label className="mb-2 block text-sm font-bold text-gray-700" htmlFor="image">
                            Upload Image (Optional)
                        </label>
                        <input
                            type="file"
                            id="image"
                            accept="image/*"
                            className="w-full rounded border px-3 py-2 leading-tight text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                            onChange={handleFileChange}
                        />
                    </div>

                    <div className="mb-6">
                        <label className="mb-2 block text-sm font-bold text-gray-700">
                            Voice Note (Optional)
                        </label>
                        <div className="flex items-center space-x-4">
                            {!recording ? (
                                <button
                                    type="button"
                                    onClick={startRecording}
                                    className="rounded bg-red-500 px-4 py-2 font-bold text-white hover:bg-red-600 focus:outline-none"
                                >
                                    Start Recording
                                </button>
                            ) : (
                                <button
                                    type="button"
                                    onClick={stopRecording}
                                    className="rounded bg-gray-600 px-4 py-2 font-bold text-white hover:bg-gray-700 focus:outline-none animate-pulse"
                                >
                                    Stop Recording
                                </button>
                            )}
                            {voicePreviewUrl && (
                                <audio controls src={voicePreviewUrl} className="h-10" />
                            )}
                        </div>
                        <p className="mt-1 text-xs text-gray-500">Record a short explanation (max 1 min).</p>
                    </div>

                    <div className="flex items-center justify-between">
                        <button
                            type="button"
                            onClick={() => navigate('/dashboard')}
                            className="rounded px-4 py-2 font-bold text-gray-600 hover:text-gray-800"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="rounded bg-blue-600 px-4 py-2 font-bold text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                        >
                            {loading ? 'Submitting...' : 'Submit Issue'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ReportIssue;
