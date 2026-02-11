import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { useNavigate } from 'react-router-dom';
import { Trophy, Medal, MapPin, User, ArrowLeft } from 'lucide-react';

const Profile = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const { data } = await api.get('/auth/profile');
            // Assuming the profile data includes nested objects if populated, 
            // but our current endpoint might need an update if we want full population.
            // For now, auth/profile returns basic info.
            // We might want to fetch from a new endpoint if we want more gamification details specifically,
            // but let's stick to auth/profile for now or create a specific one.
            // Actually, let's use the data we have.
            setProfile(data);
        } catch (err) {
            console.error("Failed to fetch profile", err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="p-10 text-center">Loading...</div>;

    return (
        <div className="min-h-screen bg-gray-100 p-4">
            <div className="container mx-auto max-w-2xl">
                <button
                    onClick={() => navigate(-1)}
                    className="mb-4 flex items-center text-gray-600 hover:text-gray-800"
                >
                    <ArrowLeft size={20} className="mr-1" /> Back
                </button>

                <div className="overflow-hidden rounded-lg bg-white shadow-md">
                    <div className="bg-blue-600 p-6 text-white">
                        <div className="flex items-center space-x-4">
                            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white text-3xl font-bold text-blue-600">
                                {profile?.name?.charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold">{profile?.name}</h1>
                                <div className="flex items-center text-blue-100">
                                    <MapPin size={16} className="mr-1" />
                                    <span>{user?.village?.name || 'Village'}</span>
                                    {/* Note: user.village might be an ID in context, depending on how it's stored. 
                                        If auth/profile returns populated village, utilize profile.village.name */}
                                    <span className="ml-2 text-xs opacity-75">({profile?.role})</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 border-b p-6">
                        <div className="text-center">
                            <p className="text-sm text-gray-500">Total Points</p>
                            <p className="flex items-center justify-center text-3xl font-bold text-yellow-600">
                                <Trophy className="mr-2" /> {profile?.points || 0}
                            </p>
                        </div>
                        <div className="text-center">
                            <p className="text-sm text-gray-500">Badges Earned</p>
                            <p className="text-3xl font-bold text-purple-600">
                                {profile?.badges?.length || 0}
                            </p>
                        </div>
                    </div>

                    {profile?.points >= 50 && (
                        <div className="border-b p-6 text-center bg-green-50">
                            <h3 className="mb-2 text-lg font-bold text-green-800">🎉 Congratulations!</h3>
                            <p className="mb-4 text-sm text-green-700">You have earned a certificate for your contributions.</p>
                            <button
                                onClick={() => window.open(`http://localhost:5000/api/users/${user._id}/certificate`, '_blank')}
                                className="inline-flex items-center rounded-full bg-green-600 px-6 py-2 font-bold text-white shadow-lg hover:bg-green-700 transition"
                            >
                                <Medal className="mr-2" size={18} /> Download Certificate
                            </button>
                        </div>
                    )}

                    <div className="p-6">
                        <h2 className="mb-4 text-xl font-bold text-gray-800">Badges & Achievements</h2>
                        {profile?.badges && profile.badges.length > 0 ? (
                            <div className="grid grid-cols-3 gap-4">
                                {profile.badges.map((badge, index) => (
                                    <div key={index} className="flex flex-col items-center rounded bg-gray-50 p-3">
                                        <Medal size={32} className="mb-2 text-yellow-500" />
                                        <span className="text-sm font-bold">{badge}</span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="rounded bg-gray-50 p-6 text-center text-gray-500">
                                <p>No badges earned yet.</p>
                                <p className="text-sm">Report issues and help your community to earn badges!</p>
                            </div>
                        )}
                    </div>

                    <div className="bg-gray-50 p-6 text-center">
                        <p className="text-sm text-gray-500">Member since {new Date(profile?.createdAt).toLocaleDateString()}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
