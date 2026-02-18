import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import { TN_DISTRICTS } from '../utils/districts';
import {
    User, Phone, Lock, MapPin, Building2,
    ArrowRight, ArrowLeft, ShieldCheck, Heart
} from 'lucide-react';

const Register = () => {
    const [formData, setFormData] = useState({
        name: '',
        mobile: '',
        password: '',
        confirmPassword: '',
        district: '',
        village: '',
        villageName: '',
        ward: '',
    });
    const [villages, setVillages] = useState([]);
    const [filteredVillages, setFilteredVillages] = useState([]);
    const [availableWards, setAvailableWards] = useState([]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { register } = useAuth();
    const navigate = useNavigate();

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
        if (formData.district) {
            setFilteredVillages(villages.filter(v => v.district === formData.district));
            if (!filteredVillages.some(v => v._id === formData.village)) {
                setFormData(prev => ({ ...prev, village: '', ward: '' }));
                setAvailableWards([]);
            }
        } else {
            setFilteredVillages([]);
            setFormData(prev => ({ ...prev, village: '', ward: '' }));
            setAvailableWards([]);
        }
    }, [formData.district, villages]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            setLoading(false);
            return;
        }

        const res = await register({
            name: formData.name,
            mobile: formData.mobile,
            password: formData.password,
            village: formData.village,
            villageName: formData.villageName,
            ward: formData.ward,
        });

        if (res.success) {
            navigate('/dashboard');
        } else {
            setError(res.message);
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-white flex flex-col lg:flex-row overflow-hidden">
            {/* Left Side: Impact Section */}
            <div className="lg:w-2/5 bg-mesh relative flex flex-col justify-between p-12 lg:p-20 overflow-hidden">
                <div className="relative z-10">
                    <button
                        onClick={() => navigate('/login')}
                        className="inline-flex items-center gap-2 text-contrast-accent font-bold text-xs uppercase tracking-widest mb-12"
                    >
                        <ArrowLeft size={16} /> Back to Sign In
                    </button>
                    <h1 className="text-5xl lg:text-7xl font-bold text-contrast-high tracking-tighter mb-6 leading-tight">
                        Empower <br /> <span className="text-indigo-300">Community.</span>
                    </h1>
                    <p className="text-lg lg:text-xl text-contrast-subtle font-medium max-w-sm leading-relaxed">
                        Join thousands of residents making their voices heard and driving real change in rural Tamil Nadu.
                    </p>
                </div>

                <div className="relative z-10 space-y-6">
                    <div className="flex items-center gap-4 bg-white/10 backdrop-blur-md border border-white/10 p-4 rounded-2xl">
                        <div className="w-12 h-12 rounded-xl bg-indigo-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
                            <ShieldCheck size={24} />
                        </div>
                        <div>
                            <h4 className="text-sm font-bold text-contrast-high">Secure Identity</h4>
                            <p className="text-xs text-indigo-200 uppercase font-medium">Verified village-level participation.</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4 bg-white/10 backdrop-blur-md border border-white/10 p-4 rounded-2xl">
                        <div className="w-12 h-12 rounded-xl bg-pink-500 flex items-center justify-center text-white shadow-lg shadow-pink-500/20">
                            <Heart size={24} />
                        </div>
                        <div>
                            <h4 className="text-sm font-bold text-contrast-high">Community First</h4>
                            <p className="text-xs text-indigo-200 uppercase font-medium">Built by locals, for locals.</p>
                        </div>
                    </div>
                </div>

                {/* Decorative Elements */}
                <div className="absolute -bottom-20 -right-20 w-96 h-96 bg-indigo-500/20 rounded-full blur-[100px]"></div>
                <div className="absolute top-20 -left-20 w-80 h-80 bg-pink-500/10 rounded-full blur-[80px]"></div>
            </div>

            {/* Right Side: Form Section */}
            <div className="lg:w-3/5 flex items-center justify-center p-8 lg:p-16 bg-slate-50/50 overflow-y-auto">
                <div className="w-full max-w-2xl">
                    <div className="mb-10">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-100 text-indigo-700 text-[10px] font-bold uppercase tracking-widest mb-4">
                            Citizen Registration
                        </div>
                        <h2 className="text-3xl font-bold text-slate-900 mb-3 tracking-tight">Create Your Account</h2>
                        <p className="text-slate-500 font-medium">Start contributing to your community development today.</p>
                    </div>

                    {error && (
                        <div className="mb-8 rounded-xl bg-red-50 p-4 border border-red-100 flex items-center gap-3 text-red-700 text-sm font-semibold animate-shake">
                            <span className="text-lg">⚠️</span> {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-8">
                        {/* Section 1: Basic Info */}
                        <div className="space-y-4">
                            <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-indigo-600 ml-1">Personal Details</h3>
                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Full Name</label>
                                    <div className="relative group">
                                        <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                                        <input
                                            name="name"
                                            className="std-input pl-11 py-3.5 bg-white border-slate-200 focus:border-indigo-600 focus:ring-4 focus:ring-indigo-600/5 transition-all outline-none"
                                            value={formData.name}
                                            onChange={handleChange}
                                            required
                                            placeholder="John Doe"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Mobile number</label>
                                    <div className="relative group">
                                        <Phone size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                                        <input
                                            name="mobile"
                                            className="std-input pl-11 py-3.5 bg-white border-slate-200 focus:border-indigo-600 focus:ring-4 focus:ring-indigo-600/5 transition-all outline-none"
                                            value={formData.mobile}
                                            onChange={handleChange}
                                            required
                                            placeholder="10-digit number"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Section 2: Location */}
                        <div className="space-y-4">
                            <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-indigo-600 ml-1">Location Details</h3>
                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">District</label>
                                    <select
                                        name="district"
                                        className="std-select py-3.5 bg-white border-slate-200 focus:border-indigo-600 focus:ring-4 focus:ring-indigo-600/5"
                                        value={formData.district}
                                        onChange={handleChange}
                                        required
                                    >
                                        <option value="">Select District</option>
                                        {TN_DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Taluk / Block</label>
                                    <select
                                        name="village"
                                        className="std-select py-3.5 bg-white border-slate-200 focus:border-indigo-600 focus:ring-4 focus:ring-indigo-600/5"
                                        value={formData.village}
                                        onChange={(e) => {
                                            handleChange(e);
                                            const selectedVillage = villages.find(v => v._id === e.target.value);
                                            setAvailableWards(selectedVillage ? selectedVillage.wards : []);
                                        }}
                                        disabled={!formData.district}
                                        required
                                    >
                                        <option value="">Select Taluk</option>
                                        {filteredVillages.map(v => <option key={v._id} value={v._id}>{v.name}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Village Name</label>
                                    <div className="relative group">
                                        <MapPin size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                                        <input
                                            name="villageName"
                                            className="std-input pl-11 py-3.5 bg-white border-slate-200 focus:border-indigo-600 focus:ring-4 focus:ring-indigo-600/5 transition-all outline-none"
                                            value={formData.villageName}
                                            onChange={handleChange}
                                            required
                                            placeholder="Your exact village name"
                                            disabled={!formData.village}
                                        />
                                    </div>
                                </div>
                                {availableWards.length > 0 && (
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Ward Number</label>
                                        <select
                                            name="ward"
                                            className="std-select py-3.5 bg-white border-slate-200 focus:border-indigo-600 focus:ring-4 focus:ring-indigo-600/5"
                                            value={formData.ward}
                                            onChange={handleChange}
                                            required
                                        >
                                            <option value="">Select Ward</option>
                                            {availableWards.map(w => <option key={w} value={w}>{w}</option>)}
                                        </select>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Section 3: Security */}
                        <div className="space-y-4">
                            <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-indigo-600 ml-1">Security</h3>
                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Password</label>
                                    <div className="relative group">
                                        <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                                        <input
                                            type="password"
                                            name="password"
                                            className="std-input pl-11 py-3.5 bg-white border-slate-200 focus:border-indigo-600 focus:ring-4 focus:ring-indigo-600/5 transition-all outline-none"
                                            value={formData.password}
                                            onChange={handleChange}
                                            required
                                            placeholder="••••••••"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Confirm Password</label>
                                    <div className="relative group">
                                        <Building2 size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                                        <input
                                            type="password"
                                            name="confirmPassword"
                                            className="std-input pl-11 py-3.5 bg-white border-slate-200 focus:border-indigo-600 focus:ring-4 focus:ring-indigo-600/5 transition-all outline-none"
                                            value={formData.confirmPassword}
                                            onChange={handleChange}
                                            required
                                            placeholder="••••••••"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="std-button-primary w-full py-4 text-sm font-bold tracking-widest shadow-xl shadow-indigo-200 group flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <span className="animate-pulse flex items-center gap-2">Creating Account...</span>
                            ) : (
                                <>
                                    <span>Join the Movement</span>
                                    <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-12 text-center">
                        <p className="text-sm font-medium text-slate-500">
                            Already part of Rural Voice? <Link to="/login" className="text-indigo-600 font-bold hover:text-indigo-700 transition-colors">Sign In Now</Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;
