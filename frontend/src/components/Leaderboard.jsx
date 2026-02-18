import { useState, useEffect } from 'react';
import api from '../api/axios';
import { Trophy, Medal, User } from 'lucide-react';

const Leaderboard = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLeaderboard = async () => {
            try {
                const { data } = await api.get('/users/leaderboard');
                setUsers(data);
            } catch (err) {
                console.error("Failed to fetch leaderboard", err);
            } finally {
                setLoading(false);
            }
        };

        fetchLeaderboard();
    }, []);

    if (loading) return <div className="p-4 text-center">Loading leaderboard...</div>;

    return (
        <div className="std-card">
            <h2 className="mb-6 flex items-center text-lg font-bold text-slate-900">
                <Trophy className="mr-2 text-primary" size={20} /> Top Contributors
            </h2>
            <div className="space-y-4">
                {users.map((user, index) => (
                    <div key={user._id} className="flex items-center justify-between border-b border-slate-50 pb-2 last:border-0">
                        <div className="flex items-center space-x-3">
                            <span className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${index === 0 ? 'bg-amber-100 text-amber-700' :
                                    index === 1 ? 'bg-slate-200 text-slate-700' :
                                        index === 2 ? 'bg-orange-100 text-orange-700' :
                                            'bg-slate-50 text-slate-400'
                                }`}>
                                {index + 1}
                            </span>
                            <div>
                                <p className="font-bold text-slate-800 text-sm">{user.name}</p>
                                <p className="text-[10px] text-slate-400 font-medium uppercase">{user.village?.name}</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="font-bold text-slate-900">{user.points}</p>
                            <p className="text-[9px] uppercase font-bold text-slate-400">points</p>
                        </div>
                    </div>
                ))}
                {users.length === 0 && <p className="text-center text-slate-400 text-sm italic py-4">No contributors yet.</p>}
            </div>
        </div>
    );
};

export default Leaderboard;
