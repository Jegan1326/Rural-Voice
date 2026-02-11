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
        <div className="rounded-lg bg-white p-6 shadow-md">
            <h2 className="mb-4 flex items-center text-xl font-bold text-gray-800">
                <Trophy className="mr-2 text-yellow-500" /> Top Contributors
            </h2>
            <div className="space-y-4">
                {users.map((user, index) => (
                    <div key={user._id} className="flex items-center justify-between border-b pb-2 last:border-0">
                        <div className="flex items-center space-x-3">
                            <span className={`flex h-8 w-8 items-center justify-center rounded-full font-bold ${index === 0 ? 'bg-yellow-100 text-yellow-700' :
                                    index === 1 ? 'bg-gray-100 text-gray-700' :
                                        index === 2 ? 'bg-orange-100 text-orange-700' :
                                            'bg-blue-50 text-blue-600'
                                }`}>
                                {index + 1}
                            </span>
                            <div>
                                <p className="font-bold text-gray-800">{user.name}</p>
                                <p className="text-xs text-gray-500">{user.village?.name}</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="font-bold text-blue-600">{user.points} pts</p>
                        </div>
                    </div>
                ))}
                {users.length === 0 && <p className="text-center text-gray-500">No data yet.</p>}
            </div>
        </div>
    );
};

export default Leaderboard;
