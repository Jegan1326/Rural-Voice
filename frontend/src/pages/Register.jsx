import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';

const Register = () => {
    const [formData, setFormData] = useState({
        name: '',
        mobile: '',
        password: '',
        confirmPassword: '',
        village: '',
        ward: '',
    });
    const [villages, setVillages] = useState([]);
    const [availableWards, setAvailableWards] = useState([]);
    const [error, setError] = useState('');
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

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        const res = await register({
            name: formData.name,
            mobile: formData.mobile,
            password: formData.password,
            village: formData.village, // Send selected village ID
            ward: formData.ward,
        });

        if (res.success) {
            navigate('/dashboard');
        } else {
            setError(res.message);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-100">
            <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-md">
                <h2 className="mb-6 text-center text-2xl font-bold text-gray-800">Register for Rural Voice</h2>
                {error && <div className="mb-4 rounded bg-red-100 p-2 text-red-700">{error}</div>}
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="mb-2 block text-sm font-bold text-gray-700" htmlFor="name">
                            Full Name
                        </label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            className="w-full rounded border px-3 py-2 leading-tight text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                            value={formData.name}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="mb-4">
                        <label className="mb-2 block text-sm font-bold text-gray-700" htmlFor="mobile">
                            Mobile Number
                        </label>
                        <input
                            type="text"
                            id="mobile"
                            name="mobile"
                            className="w-full rounded border px-3 py-2 leading-tight text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                            value={formData.mobile}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="mb-4">
                        <label className="mb-2 block text-sm font-bold text-gray-700" htmlFor="village">
                            Select Village
                        </label>
                        <select
                            id="village"
                            name="village"
                            className="w-full rounded border px-3 py-2 leading-tight text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                            value={formData.village}
                            onChange={(e) => {
                                handleChange(e);
                                const selectedVillage = villages.find(v => v._id === e.target.value);
                                setAvailableWards(selectedVillage ? selectedVillage.wards : []);
                                setFormData(prev => ({ ...prev, village: e.target.value, ward: '' }));
                            }}
                            required
                        >
                            <option value="">-- Select Village --</option>
                            {villages.map((v) => (
                                <option key={v._id} value={v._id}>
                                    {v.name} ({v.district})
                                </option>
                            ))}
                        </select>
                    </div>
                    {availableWards.length > 0 && (
                        <div className="mb-4">
                            <label className="mb-2 block text-sm font-bold text-gray-700" htmlFor="ward">
                                Select Ward
                            </label>
                            <select
                                id="ward"
                                name="ward"
                                className="w-full rounded border px-3 py-2 leading-tight text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                                value={formData.ward}
                                onChange={handleChange}
                                required
                            >
                                <option value="">-- Select Ward --</option>
                                {availableWards.map((w, index) => (
                                    <option key={index} value={w}>
                                        {w}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}
                    <div className="mb-4">
                        <label className="mb-2 block text-sm font-bold text-gray-700" htmlFor="password">
                            Password
                        </label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            className="w-full rounded border px-3 py-2 leading-tight text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                            value={formData.password}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="mb-6">
                        <label className="mb-2 block text-sm font-bold text-gray-700" htmlFor="confirmPassword">
                            Confirm Password
                        </label>
                        <input
                            type="password"
                            id="confirmPassword"
                            name="confirmPassword"
                            className="w-full rounded border px-3 py-2 leading-tight text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="flex items-center justify-between">
                        <button
                            type="submit"
                            className="rounded bg-green-600 px-4 py-2 font-bold text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                        >
                            Register
                        </button>
                    </div>
                </form>
                <p className="mt-4 text-center text-sm">
                    Already have an account? <Link to="/login" className="text-green-600 hover:underline">Login</Link>
                </p>
            </div>
        </div>
    );
};

export default Register;
