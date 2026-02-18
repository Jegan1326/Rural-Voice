import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { useNavigate } from 'react-router-dom';
import { Trophy, Medal, MapPin, User, ArrowLeft, Edit2, Save, X } from 'lucide-react';
import { TN_DISTRICTS } from '../utils/districts';

const Profile = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState({
        name: '',
        district: '',
        village: '', // Semantically Taluk ID
        villageName: '',
        ward: ''
    });
    const [villages, setVillages] = useState([]);
    const [filteredVillages, setFilteredVillages] = useState([]);
    const [availableWards, setAvailableWards] = useState([]);

    useEffect(() => {
        fetchProfile();
        fetchVillages();
    }, []);

    const fetchProfile = async () => {
        try {
            const { data } = await api.get('/auth/profile');
            setProfile(data);
            setEditData({
                name: data.name,
                district: data.village?.district || '',
                village: data.village?._id || '',
                villageName: data.villageName || '',
                ward: data.ward || ''
            });
        } catch (err) {
            console.error("Failed to fetch profile", err);
        } finally {
            setLoading(false);
        }
    };

    const fetchVillages = async () => {
        try {
            const { data } = await api.get('/villages');
            setVillages(data);
        } catch (err) {
            console.error("Failed to fetch villages", err);
        }
    };

    useEffect(() => {
        if (editData.district) {
            const filtered = villages.filter(v => v.district === editData.district);
            setFilteredVillages(filtered);
            const selectedVillage = filtered.find(v => v._id === editData.village);
            setAvailableWards(selectedVillage ? selectedVillage.wards : []);
        } else {
            setFilteredVillages([]);
            setAvailableWards([]);
        }
    }, [editData.district, villages, editData.village]);

    const handleUpdateProfile = async () => {
        try {
            const { data } = await api.put('/auth/profile', {
                name: editData.name,
                village: editData.village, // Taluk ID
                villageName: editData.villageName,
                ward: editData.ward
            });
            setProfile(data);
            setIsEditing(false);
            // Update physical storage for auth context if needed
            localStorage.setItem('user', JSON.stringify(data));
            alert('Profile updated successfully!');
        } catch (err) {
            alert('Failed to update profile');
        }
    };

    if (loading) return <div className="p-10 text-center">Loading...</div>;

    return (
        <div className="min-h-screen bg-slate-50 py-12 px-4">
            <div className="max-w-3xl mx-auto">
                <div className="mb-6 flex items-center justify-between">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center font-bold text-slate-500 hover:text-slate-700 transition-colors text-sm"
                    >
                        <ArrowLeft size={18} className="mr-2" /> Back
                    </button>
                    {!isEditing ? (
                        <button
                            onClick={() => setIsEditing(true)}
                            className="std-button-primary py-2 px-6 text-sm flex items-center gap-2"
                        >
                            <Edit2 size={14} /> Edit Profile
                        </button>
                    ) : (
                        <div className="flex gap-3">
                            <button
                                onClick={handleUpdateProfile}
                                className="std-button-primary py-2 px-6 text-sm flex items-center gap-2"
                            >
                                <Save size={14} /> Save
                            </button>
                            <button
                                onClick={() => setIsEditing(false)}
                                className="bg-slate-200 hover:bg-slate-300 text-slate-700 py-2 px-6 rounded-lg text-sm font-bold transition-all"
                            >
                                Cancel
                            </button>
                        </div>
                    )}
                </div>

                <div className="std-card overflow-hidden">
                    {/* Header */}
                    <div className="relative bg-indigo-900 p-8 text-white overflow-hidden">
                        {/* Decorative background elements */}
                        <div className="absolute top-0 right-0 -mt-10 -mr-10 h-40 w-40 rounded-full bg-indigo-500/20 blur-3xl"></div>
                        <div className="absolute bottom-0 left-0 -mb-10 -ml-10 h-40 w-40 rounded-full bg-blue-500/20 blur-3xl"></div>

                        <div className="relative flex items-center gap-6">
                            <div className="h-20 w-20 flex items-center justify-center rounded-2xl bg-white/10 backdrop-blur-md text-3xl font-bold text-white shadow-2xl border border-white/20">
                                {profile?.name?.charAt(0).toUpperCase()}
                            </div>
                            <div className="flex-1">
                                {isEditing ? (
                                    <input
                                        className="w-full bg-white/10 border-2 border-white/20 rounded-lg p-2 text-2xl font-bold text-white outline-none focus:bg-white/20 transition-all"
                                        value={editData.name}
                                        onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                                    />
                                ) : (
                                    <h1 className="text-3xl font-bold text-contrast-high">{profile?.name}</h1>
                                )}
                                <div className="flex items-center gap-4 mt-2 text-contrast-subtle font-medium">
                                    <div className="flex items-center gap-1.5 hover:text-white transition-colors cursor-default">
                                        <MapPin size={16} className="text-indigo-300" />
                                        <span>{profile?.villageName || 'Village'}, {profile?.village?.name || 'Taluk'}</span>
                                    </div>
                                    <span className="opacity-40">|</span>
                                    <span className="bg-white/10 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border border-white/10">
                                        {profile?.role}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {isEditing && (
                        <div className="p-8 border-b border-slate-100 bg-slate-50/50">
                            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-6">Location Information</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="flex flex-col gap-2">
                                    <label className="text-xs font-bold text-slate-500 ml-1">District</label>
                                    <select
                                        className="std-select"
                                        value={editData.district}
                                        onChange={(e) => setEditData({ ...editData, district: e.target.value, village: '', ward: '' })}
                                    >
                                        <option value="">Select District</option>
                                        {TN_DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
                                    </select>
                                </div>
                                <div className="flex flex-col gap-2">
                                    <label className="text-xs font-bold text-slate-500 ml-1">Taluk</label>
                                    <select
                                        className="std-select"
                                        value={editData.village}
                                        onChange={(e) => {
                                            const vId = e.target.value;
                                            setEditData({ ...editData, village: vId, ward: '' });
                                            const selected = villages.find(v => v._id === vId);
                                            setAvailableWards(selected ? selected.wards : []);
                                        }}
                                        disabled={!editData.district}
                                    >
                                        <option value="">Select Taluk</option>
                                        {filteredVillages.map(v => <option key={v._id} value={v._id}>{v.name}</option>)}
                                    </select>
                                </div>
                                <div className="flex flex-col gap-2">
                                    <label className="text-xs font-bold text-slate-500 ml-1">Village Name</label>
                                    <input
                                        type="text"
                                        className="std-input"
                                        value={editData.villageName}
                                        onChange={(e) => setEditData({ ...editData, villageName: e.target.value })}
                                        placeholder="Type village name"
                                        disabled={!editData.village}
                                    />
                                </div>
                                <div className="flex flex-col gap-2">
                                    <label className="text-xs font-bold text-slate-500 ml-1">Ward Number</label>
                                    <select
                                        className="std-select"
                                        value={editData.ward}
                                        onChange={(e) => setEditData({ ...editData, ward: e.target.value })}
                                        disabled={!editData.village || availableWards.length === 0}
                                    >
                                        <option value="">Select Ward</option>
                                        {availableWards.map(w => <option key={w} value={w}>{w}</option>)}
                                    </select>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Stats */}
                    <div className="grid grid-cols-2 divide-x divide-slate-100 py-8 border-b border-slate-100">
                        <div className="px-8 text-center">
                            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Impact Points</p>
                            <div className="flex items-center justify-center gap-3">
                                <Trophy className="text-amber-500" size={24} />
                                <span className="text-4xl font-bold text-slate-900">{profile?.points || 0}</span>
                            </div>
                        </div>
                        <div className="px-8 text-center">
                            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Total Honors</p>
                            <div className="flex items-center justify-center gap-3">
                                <Medal className="text-blue-500" size={24} />
                                <span className="text-4xl font-bold text-slate-900">{profile?.badges?.length || 0}</span>
                            </div>
                        </div>
                    </div>

                    {/* Certificate Section */}
                    {profile?.points >= 50 && (
                        <div className="p-8 bg-slate-900 text-white flex flex-col items-center text-center">
                            <h3 className="text-xl font-bold mb-2">Community Guardian</h3>
                            <p className="text-slate-400 text-sm mb-6 max-w-sm">Your consistent contributions have earned you an official certificate of appreciation.</p>
                            <button
                                onClick={() => window.open(`${api.defaults.baseURL}/users/${user._id}/certificate`, '_blank')}
                                className="bg-white text-slate-900 px-8 py-3 rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-slate-100 transition-all shadow-lg"
                            >
                                Download Certificate
                            </button>
                        </div>
                    )}

                    {/* Achievements */}
                    <div className="p-8">
                        <h2 className="text-lg font-bold text-slate-900 mb-6">Recent Achievements</h2>
                        {profile?.badges && profile.badges.length > 0 ? (
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                {profile.badges.map((badge, index) => (
                                    <div key={index} className="flex items-center gap-3 p-4 rounded-xl bg-slate-50 border border-slate-100">
                                        <div className="bg-amber-100 p-2 rounded-lg">
                                            <Medal size={20} className="text-amber-600" />
                                        </div>
                                        <span className="text-xs font-bold text-slate-700">{badge}</span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="py-12 text-center rounded-2xl border-2 border-dashed border-slate-100">
                                <p className="text-slate-400 font-bold mb-1">No achievements yet</p>
                                <p className="text-xs text-slate-400">Report issues to earn points and badges.</p>
                            </div>
                        )}
                    </div>

                </div>
            </div>
        </div>
    );
};

export default Profile;
