import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { TN_DISTRICTS } from '../utils/districts';
import {
    Droplets, Zap, Navigation, Trash2, Sprout,
    ShieldCheck, MoreHorizontal, MapPin,
    FileText, Camera, Mic, Info, ArrowLeft, ArrowRight,
    CheckCircle2
} from 'lucide-react';

const CATEGORIES = [
    { id: 'Water', label: 'Water Supply', icon: Droplets, color: 'text-blue-600', bg: 'bg-blue-50' },
    { id: 'Electricity', label: 'Electricity', icon: Zap, color: 'text-amber-500', bg: 'bg-amber-50' },
    { id: 'Roads', label: 'Roads & Infra', icon: Navigation, color: 'text-slate-600', bg: 'bg-slate-100' },
    { id: 'Sanitation', label: 'Sanitation', icon: Trash2, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { id: 'Agriculture', label: 'Agriculture', icon: Sprout, color: 'text-green-600', bg: 'bg-green-50' },
    { id: 'Public Safety', label: 'Public Safety', icon: ShieldCheck, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { id: 'Other', label: 'Other', icon: MoreHorizontal, color: 'text-slate-400', bg: 'bg-slate-50' },
];

const ReportIssue = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('Water');
    const [district, setDistrict] = useState(user?.village?.district || '');
    const [villageId, setVillageId] = useState(user?.village?._id || user?.village || '');
    const [villageName, setVillageName] = useState(user?.villageName || '');
    const [villages, setVillages] = useState([]);
    const [filteredVillages, setFilteredVillages] = useState([]);
    const [image, setImage] = useState(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    // Voice Recording Logic
    const [recording, setRecording] = useState(false);
    const [mediaRecorder, setMediaRecorder] = useState(null);
    const [voiceBlob, setVoiceBlob] = useState(null);
    const [voicePreviewUrl, setVoicePreviewUrl] = useState(null);

    useEffect(() => {
        const fetchVillages = async () => {
            try {
                const { data } = await api.get('/villages');
                setVillages(data);
            } catch (err) {
                console.error("Failed to fetch villages", err);
            }
        };
        fetchVillages();
    }, []);

    useEffect(() => {
        if (district) {
            setFilteredVillages(villages.filter(v => v.district === district));
        } else {
            setFilteredVillages([]);
        }
    }, [district, villages]);

    const handleFileChange = (e) => {
        setImage(e.target.files[0]);
    };

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
        formData.append('village', villageId);
        formData.append('villageName', villageName);
        if (image) formData.append('image', image);
        if (voiceBlob) formData.append('voice', voiceBlob, 'voice-note.webm');

        try {
            await api.post('/issues', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to submit issue');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50/50 pb-24">
            {/* Header */}
            <div className="bg-white border-b border-slate-200 sticky top-0 z-30 px-4 py-4 mb-8">
                <div className="max-w-4xl mx-auto flex items-center justify-between">
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors font-bold text-xs uppercase"
                    >
                        <ArrowLeft size={16} /> Discard
                    </button>
                    <h1 className="text-xl font-bold text-slate-900 tracking-tight">Report Concern</h1>
                    <div className="w-20"></div> {/* Spacer */}
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4">
                <form onSubmit={handleSubmit} className="space-y-8">
                    {error && (
                        <div className="rounded-xl bg-red-50 p-4 border border-red-100 flex items-center gap-3 text-red-700 text-sm font-semibold animate-shake">
                            <span>⚠️</span> {error}
                        </div>
                    )}

                    {/* Step 1: Category & Identification */}
                    <div className="card-premium p-8 rounded-2xl shadow-xl shadow-slate-200/50">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold shadow-lg shadow-indigo-100">1</div>
                            <div>
                                <h3 className="text-lg font-bold text-slate-900 leading-tight">Identify the Concern</h3>
                                <p className="text-xs text-slate-500 font-medium">Select a category and verify your location.</p>
                            </div>
                        </div>

                        <div className="mb-8">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block mb-4 ml-1">Select a Category</label>
                            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
                                {CATEGORIES.map((cat) => {
                                    const Icon = cat.icon;
                                    const isActive = category === cat.id;
                                    return (
                                        <button
                                            key={cat.id}
                                            type="button"
                                            onClick={() => setCategory(cat.id)}
                                            className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all duration-300 group ${isActive
                                                    ? 'border-indigo-600 bg-indigo-50 shadow-md shadow-indigo-100'
                                                    : 'border-slate-100 bg-white hover:border-slate-300'
                                                }`}
                                        >
                                            <div className={`p-2 rounded-lg mb-2 transition-colors ${isActive ? 'bg-indigo-600 text-white' : `${cat.bg} ${cat.color} group-hover:bg-opacity-100`}`}>
                                                <Icon size={20} />
                                            </div>
                                            <span className={`text-[10px] font-bold text-center tracking-tight ${isActive ? 'text-indigo-900' : 'text-slate-500'}`}>
                                                {cat.label}
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 border-t border-slate-100">
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">District</label>
                                <select
                                    className="std-select bg-slate-50/50"
                                    value={district}
                                    onChange={(e) => { setDistrict(e.target.value); setVillageId(''); }}
                                    required
                                >
                                    <option value="">Select District</option>
                                    {TN_DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Taluk</label>
                                <select
                                    className="std-select bg-slate-50/50"
                                    value={villageId}
                                    onChange={(e) => setVillageId(e.target.value)}
                                    disabled={!district}
                                    required
                                >
                                    <option value="">Select Taluk</option>
                                    {filteredVillages.map(v => <option key={v._id} value={v._id}>{v.name}</option>)}
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Village Name</label>
                                <div className="relative group">
                                    <MapPin size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-600 transition-colors" />
                                    <input
                                        className="std-input pl-11 bg-slate-50/50"
                                        value={villageName}
                                        onChange={(e) => setVillageName(e.target.value)}
                                        placeholder="Type village name"
                                        required
                                        disabled={!villageId}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Step 2: Description */}
                    <div className="card-premium p-8 rounded-2xl shadow-xl shadow-slate-200/50">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold shadow-lg shadow-indigo-100">2</div>
                            <div>
                                <h3 className="text-lg font-bold text-slate-900 leading-tight">Describe the Problem</h3>
                                <p className="text-xs text-slate-500 font-medium">Provide details to help officials understand the issue.</p>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Title</label>
                                <div className="relative group">
                                    <FileText size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-600 transition-colors" />
                                    <input
                                        className="std-input pl-11 py-3 text-base font-bold bg-slate-50/50 border-slate-200 focus:bg-white transition-all"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        placeholder="E.g., Broken water pipe near temple"
                                        required
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Detailed Description</label>
                                <textarea
                                    className="std-textarea min-h-32 bg-slate-50/50 border-slate-200 focus:bg-white transition-all p-4 text-sm font-semibold"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="Impact of the problem, location details, etc..."
                                    required
                                ></textarea>
                                <div className="flex items-center gap-2 px-3 py-2 bg-indigo-50 border border-indigo-100 rounded-lg">
                                    <Info size={14} className="text-indigo-600" />
                                    <p className="text-[10px] text-indigo-700 font-bold uppercase tracking-tighter">AI will analyze this to refine categorization</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Step 3: Evidence */}
                    <div className="card-premium p-8 rounded-2xl shadow-xl shadow-slate-200/50">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold shadow-lg shadow-indigo-100">3</div>
                            <div>
                                <h3 className="text-lg font-bold text-slate-900 leading-tight">Attach Evidence</h3>
                                <p className="text-xs text-slate-500 font-medium">Visual or audio proof accelerates resolution.</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* Photo Upload Card */}
                            <div className={`p-6 rounded-2xl border-2 border-dashed transition-all ${image ? 'border-indigo-600 bg-indigo-50/30' : 'border-slate-200 bg-white hover:border-slate-300'}`}>
                                <div className="flex flex-col items-center text-center">
                                    <div className={`p-4 rounded-full mb-4 ${image ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
                                        <Camera size={32} />
                                    </div>
                                    <h4 className="text-sm font-bold text-slate-900 mb-2">{image ? 'Image Attached' : 'Take or Upload Photo'}</h4>
                                    <p className="text-xs text-slate-500 mb-6 font-medium">PNG, JPG up to 5MB</p>
                                    <label className="cursor-pointer std-button bg-slate-900 text-white hover:bg-black py-2 px-6 flex items-center gap-2 text-xs">
                                        <ArrowRight size={14} /> {image ? 'Change Photo' : 'Select File'}
                                        <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                                    </label>
                                    {image && <p className="mt-3 text-[10px] font-bold text-indigo-600 truncate max-w-full">{image.name}</p>}
                                </div>
                            </div>

                            {/* Voice Note Card */}
                            <div className={`p-6 rounded-2xl border-2 border-dashed transition-all ${voiceBlob ? 'border-indigo-600 bg-indigo-50/30' : 'border-slate-200 bg-white hover:border-slate-300'}`}>
                                <div className="flex flex-col items-center text-center">
                                    <div className={`p-4 rounded-full mb-4 ${recording ? 'bg-red-500 text-white animate-pulse' : voiceBlob ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
                                        <Mic size={32} />
                                    </div>
                                    <h4 className="text-sm font-bold text-slate-900 mb-2">{recording ? 'Recording...' : voiceBlob ? 'Voice Note Ready' : 'Record Voice Note'}</h4>
                                    <p className="text-xs text-slate-500 mb-6 font-medium">Easier for detailed explanations</p>

                                    {!recording ? (
                                        <button
                                            type="button"
                                            onClick={startRecording}
                                            className="std-button bg-slate-900 text-white hover:bg-black py-2 px-6 flex items-center gap-2 text-xs"
                                        >
                                            <Mic size={14} /> {voiceBlob ? 'Record Again' : 'Start Recording'}
                                        </button>
                                    ) : (
                                        <button
                                            type="button"
                                            onClick={stopRecording}
                                            className="std-button bg-red-600 text-white hover:bg-red-700 py-2 px-6 flex items-center gap-2 text-xs"
                                        >
                                            Stop
                                        </button>
                                    )}

                                    {voicePreviewUrl && (
                                        <div className="mt-4 w-full bg-white p-2 rounded-xl shadow-sm">
                                            <audio controls src={voicePreviewUrl} className="w-full h-8" />
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Submit Bar */}
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6 pt-6 animate-in slide-in-from-bottom-4 duration-700">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-full border-4 border-indigo-100 flex items-center justify-center text-indigo-600">
                                <CheckCircle2 size={24} />
                            </div>
                            <div>
                                <h4 className="text-sm font-bold text-slate-900">Final Verification</h4>
                                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Please review your submission above.</p>
                            </div>
                        </div>
                        <button
                            type="submit"
                            disabled={loading || !title || !description || !villageId}
                            className="std-button-primary w-full md:w-auto px-16 py-4 text-base tracking-wide shadow-2xl shadow-indigo-200 flex items-center justify-center gap-3 group"
                        >
                            {loading ? (
                                <span className="animate-pulse flex items-center gap-2 italic">Submitting...</span>
                            ) : (
                                <>
                                    <span>Submit Report</span>
                                    <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ReportIssue;
