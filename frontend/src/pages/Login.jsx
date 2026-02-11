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
        <div className="flex min-h-screen items-center justify-center bg-gray-100">
            <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-md">
                <h2 className="mb-6 text-center text-2xl font-bold text-gray-800">Login to Rural Voice</h2>
                {error && <div className="mb-4 rounded bg-red-100 p-2 text-red-700">{error}</div>}

                <div className="mb-4 flex justify-center space-x-4">
                    <button
                        className={`border-b-2 px-4 py-2 ${loginMethod === 'password' ? 'border-green-600 text-green-600 font-bold' : 'border-transparent text-gray-500'}`}
                        onClick={() => setLoginMethod('password')}
                    >
                        Password
                    </button>
                    <button
                        className={`border-b-2 px-4 py-2 ${loginMethod === 'otp' ? 'border-green-600 text-green-600 font-bold' : 'border-transparent text-gray-500'}`}
                        onClick={() => setLoginMethod('otp')}
                    >
                        OTP (Mobile)
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    {loginMethod === 'password' ? (
                        <>
                            <div className="mb-4">
                                <label className="mb-2 block text-sm font-bold text-gray-700" htmlFor="identifier">
                                    Mobile or Email
                                </label>
                                <input
                                    type="text"
                                    id="identifier"
                                    className="w-full rounded border px-3 py-2 leading-tight text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                                    value={identifier}
                                    onChange={(e) => setIdentifier(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="mb-6">
                                <label className="mb-2 block text-sm font-bold text-gray-700" htmlFor="password">
                                    Password
                                </label>
                                <input
                                    type="password"
                                    id="password"
                                    className="w-full rounded border px-3 py-2 leading-tight text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="mb-4">
                                <label className="mb-2 block text-sm font-bold text-gray-700" htmlFor="mobile">
                                    Mobile Number
                                </label>
                                <input
                                    type="text"
                                    id="mobile"
                                    className="w-full rounded border px-3 py-2 leading-tight text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                                    value={mobile}
                                    onChange={(e) => setMobile(e.target.value)}
                                    required
                                    placeholder="Enter 10-digit mobile"
                                />
                            </div>
                            {step === 'otp' && (
                                <div className="mb-6">
                                    <label className="mb-2 block text-sm font-bold text-gray-700" htmlFor="otp">
                                        Enter OTP
                                    </label>
                                    <input
                                        type="text"
                                        id="otp"
                                        className="w-full rounded border px-3 py-2 leading-tight text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value)}
                                        required
                                        placeholder="Enter '1234'"
                                    />
                                    <p className="mt-1 text-xs text-gray-500">Hint: Use OTP 1234</p>
                                </div>
                            )}
                        </>
                    )}

                    <div className="flex items-center justify-between">
                        <button
                            type="submit"
                            className="rounded bg-green-600 px-4 py-2 font-bold text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                        >
                            {loginMethod === 'otp' && step === 'mobile' ? 'Send OTP' : 'Login'}
                        </button>
                    </div>
                </form>
                <p className="mt-4 text-center text-sm">
                    Don't have an account? <Link to="/register" className="text-green-600 hover:underline">Register</Link>
                </p>
            </div>
        </div>
    );
};

export default Login;
