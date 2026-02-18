import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Phone, Lock, ArrowRight, User, ShieldCheck } from 'lucide-react';

const Login = () => {
    const [identifier, setIdentifier] = useState('');
    const [password, setPassword] = useState('');
    const [loginMethod, setLoginMethod] = useState('password');
    const [mobile, setMobile] = useState('');
    const [otp, setOtp] = useState('');
    const [step, setStep] = useState('mobile');
    const [error, setError] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (loginMethod === 'password') {
            const res = await login(identifier, password);
            if (res.success) {
                const userData = JSON.parse(localStorage.getItem('user'));
                navigate(userData?.role === 'Admin' || userData?.role === 'SuperAdmin' ? '/admin' : '/dashboard');
            } else {
                setError(res.message);
            }
        } else {
            if (step === 'mobile') {
                if (mobile.length !== 10) {
                    setError("Please enter a valid 10-digit mobile number");
                    return;
                }
                setStep('otp');
            } else {
                if (otp === '1234') {
                    navigate('/dashboard');
                } else {
                    setError("Invalid OTP (Use 1234)");
                }
            }
        }
    };

    return (
        <div className="min-h-screen bg-white flex flex-col lg:flex-row overflow-hidden">
            {/* Left Side: Hero Section */}
            <div className="lg:w-3/5 bg-mesh relative flex flex-col justify-between p-12 lg:p-24 overflow-hidden">
                <div className="relative z-10">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-contrast-subtle text-[10px] font-bold uppercase tracking-widest mb-8">
                        <ShieldCheck size={14} />
                        Trusted by 100+ Villages
                    </div>
                    <h1 className="text-6xl lg:text-8xl font-bold text-contrast-high tracking-tighter mb-6 leading-tight">
                        Rural <br /> <span className="text-indigo-300">Voice.</span>
                    </h1>
                    <p className="text-xl lg:text-2xl text-contrast-subtle font-medium max-w-xl leading-relaxed">
                        The ultimate platform for community voice, transparency, and rural development in Tamil Nadu.
                    </p>
                </div>

                <div className="relative z-10 mt-12">
                    <div className="flex -space-x-3 mb-4">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className="w-10 h-10 rounded-full border-2 border-indigo-900 bg-indigo-700 flex items-center justify-center text-[10px] font-bold text-white shadow-xl">
                                {i}
                            </div>
                        ))}
                        <div className="w-10 h-10 rounded-full border-2 border-indigo-900 bg-white flex items-center justify-center text-[10px] font-bold text-indigo-900 shadow-xl">
                            +
                        </div>
                    </div>
                    <p className="text-xs font-bold text-indigo-200 uppercase tracking-widest">
                        Join 5,000+ active citizens
                    </p>
                </div>

                {/* Decorative Elements */}
                <div className="absolute -bottom-20 -left-20 w-96 h-96 bg-indigo-500/20 rounded-full blur-[100px]"></div>
                <div className="absolute top-20 -right-20 w-80 h-80 bg-pink-500/10 rounded-full blur-[80px]"></div>
            </div>

            {/* Right Side: Form Section */}
            <div className="lg:w-2/5 flex items-center justify-center p-8 lg:p-12 bg-slate-50/50">
                <div className="w-full max-w-md">
                    <div className="mb-10 text-center lg:text-left">
                        <h2 className="text-3xl font-bold text-slate-900 mb-3 tracking-tight">Welcome Back</h2>
                        <p className="text-slate-500 font-medium">Select your preferred login method to continue.</p>
                    </div>

                    {error && (
                        <div className="mb-6 rounded-xl bg-red-50 p-4 border border-red-100 flex items-center gap-3 text-red-700 text-sm font-semibold animate-shake">
                            <span className="text-lg">⚠️</span> {error}
                        </div>
                    )}

                    <div className="flex gap-2 mb-8 bg-slate-200/50 p-1.5 rounded-2xl">
                        <button
                            className={`flex-1 py-3 text-xs font-bold rounded-xl transition-all duration-300 ${loginMethod === 'password' ? 'bg-white text-slate-900 shadow-lg shadow-slate-200' : 'text-slate-500 hover:text-slate-700'}`}
                            onClick={() => setLoginMethod('password')}
                        >
                            Password
                        </button>
                        <button
                            className={`flex-1 py-3 text-xs font-bold rounded-xl transition-all duration-300 ${loginMethod === 'otp' ? 'bg-white text-slate-900 shadow-lg shadow-slate-200' : 'text-slate-500 hover:text-slate-700'}`}
                            onClick={() => setLoginMethod('otp')}
                        >
                            One-Time Pass
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {loginMethod === 'password' ? (
                            <>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Email or Mobile</label>
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-600 transition-colors">
                                            <User size={18} />
                                        </div>
                                        <input
                                            type="text"
                                            className="std-input pl-11 py-3.5 bg-white border-slate-200 focus:border-indigo-600 focus:ring-4 focus:ring-indigo-600/5 transition-all outline-none"
                                            value={identifier}
                                            onChange={(e) => setIdentifier(e.target.value)}
                                            required
                                            placeholder="johndoe@example.com"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Secure Password</label>
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-600 transition-colors">
                                            <Lock size={18} />
                                        </div>
                                        <input
                                            type="password"
                                            className="std-input pl-11 py-3.5 bg-white border-slate-200 focus:border-indigo-600 focus:ring-4 focus:ring-indigo-600/5 transition-all outline-none"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            required
                                            placeholder="••••••••"
                                        />
                                    </div>
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Mobile Number</label>
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-600 transition-colors">
                                            <Phone size={18} />
                                        </div>
                                        <input
                                            type="text"
                                            className="std-input pl-11 py-3.5 bg-white border-slate-200 focus:border-indigo-600 focus:ring-4 focus:ring-indigo-600/5 transition-all outline-none"
                                            value={mobile}
                                            onChange={(e) => setMobile(e.target.value)}
                                            required
                                            placeholder="10-digit number"
                                        />
                                    </div>
                                </div>
                                {step === 'otp' && (
                                    <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-500">
                                        <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Verification Code</label>
                                        <input
                                            type="text"
                                            className="std-input text-center tracking-[1em] text-xl font-bold py-4 focus:border-indigo-600 focus:ring-4 focus:ring-indigo-600/5 transition-all outline-none"
                                            value={otp}
                                            onFocus={(e) => e.target.select()}
                                            onChange={(e) => setOtp(e.target.value)}
                                            required
                                            placeholder="0000"
                                            maxLength={4}
                                        />
                                    </div>
                                )}
                            </>
                        )}

                        <button type="submit" className="std-button-primary w-full py-4 text-sm tracking-wide shadow-xl shadow-indigo-200 group flex items-center justify-center gap-2">
                            <span>{loginMethod === 'otp' && step === 'mobile' ? 'Send Verification' : 'Continue to Dashboard'}</span>
                            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                        </button>
                    </form>

                    <div className="mt-12 pt-8 border-t border-slate-200/60 text-center">
                        <p className="text-sm font-medium text-slate-500">
                            Don't have an account? <Link to="/register" className="text-indigo-600 font-bold hover:text-indigo-700 transition-colors inline-flex items-center gap-1 group">Join the Movement <ArrowRight size={14} className="opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" /></Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
