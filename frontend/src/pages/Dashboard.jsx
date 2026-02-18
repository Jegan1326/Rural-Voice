import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import IssueCard from '../components/IssueCard';
import Leaderboard from '../components/Leaderboard';
import { io } from 'socket.io-client';

import { useLanguage } from '../context/LanguageContext';

const Dashboard = () => {
    const { user, logout } = useAuth();
    const { t, toggleLanguage, language } = useLanguage();
    const navigate = useNavigate();
    const [issues, setIssues] = useState([]);
    const [filter, setFilter] = useState('all'); // all, myVillage


    const fetchIssues = async () => {
        if (!user) return;
        try {
            const isAdmin = user.role === 'Admin' || user.role === 'SuperAdmin';
            const endpoint = isAdmin ? '/issues' : '/issues/my-village';

            console.log(`[DASHBOARD] Fetching: ${endpoint}, Role: ${user.role}`);

            const { data } = await api.get(endpoint);
            console.log(`[DASHBOARD] Received ${data.length} issues`);

            setIssues(data);
        } catch (err) {
            console.error("[DASHBOARD] Fetch Error:", err);
            setIssues([]);
        }
    };

    useEffect(() => {
        fetchIssues();

        const socket = io(window.location.origin.replace('5173', '5000'));
        if (user?.village) {
            const villageId = user.village._id || user.village;
            socket.emit('joinVillage', villageId.toString());
        }

        socket.on('issueUpdated', (updatedIssue) => {
            setIssues(prev => prev.map(issue =>
                issue._id === updatedIssue._id ? updatedIssue : issue
            ));
        });

        socket.on('newIssue', (newIssue) => {
            setIssues(prev => [newIssue, ...prev]);
        });

        return () => socket.disconnect();
    }, [filter, user]);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const filteredIssues = filter === 'all' ? issues :
        filter === 'myVillage' ? issues.filter(i => {
            const issueVillageId = i.village?._id || i.village;
            const userVillageId = user?.village?._id || user?.village;
            if (!issueVillageId || !userVillageId) return false;
            return issueVillageId.toString() === userVillageId.toString();
        }) :
            filter === 'top5' ? issues.slice(0, 5) :
                issues.filter(i => i.status === filter);

    return (
        <div className="min-h-screen bg-slate-100 pb-20">

            <nav className="std-nav p-4 sticky top-0 z-50">
                <div className="container mx-auto flex items-center justify-between">
                    <div className="flex items-center space-x-2 group cursor-pointer" onClick={() => navigate('/dashboard')}>
                        <h1 className="text-xl font-bold tracking-tight text-slate-900">
                            Rural <span className="text-indigo-600">Voice</span>
                        </h1>
                    </div>
                    <div className="flex items-center space-x-6">
                        <span className="hidden md:inline text-xs font-semibold text-slate-600 uppercase tracking-widest">
                            Logged in as: <span className="text-slate-900 font-bold">{user?.name}</span>
                        </span>
                        <button
                            onClick={handleLogout}
                            className="text-slate-600 hover:text-red-600 text-xs font-bold uppercase transition-colors"
                        >
                            Logout
                        </button>
                    </div>
                </div>
            </nav>
            <header className="bg-slate-900 py-16 text-white text-center shadow-lg">
                <div className="container mx-auto px-4 relative z-10">
                    <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
                        {user?.village?.name || 'Village'} Community Dashboard
                    </h2>
                    <p className="text-slate-400 text-lg uppercase tracking-widest font-medium">
                        Connecting Citizens, Resolving Issues
                    </p>
                    <div className="mt-8 flex flex-wrap justify-center gap-4">
                        <button
                            onClick={() => navigate('/report-issue')}
                            className="std-button-primary px-8 py-3"
                        >
                            {t('report.issue')}
                        </button>
                        <button
                            onClick={() => navigate('/profile')}
                            className="std-button-secondary px-8 py-3"
                        >
                            {t('nav.profile')}
                        </button>
                    </div>
                </div>
            </header>
            <main className="container mx-auto p-4">
                <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
                    <div className="flex flex-wrap gap-2">
                        {['all', 'myVillage', 'top5', 'Submitted', 'In Progress', 'Resolved'].map((f) => {
                            const count = f === 'all' ? issues.length :
                                f === 'myVillage' ? issues.filter(i => (i.village?._id || i.village) === (user?.village?._id || user?.village)).length :
                                    f === 'top5' ? Math.min(issues.length, 5) :
                                        issues.filter(i => i.status === f).length;

                            return (
                                <button
                                    key={f}
                                    onClick={() => setFilter(f)}
                                    className={`rounded-lg px-6 py-2 text-xs font-semibold transition-all border flex items-center space-x-2 ${filter === f
                                        ? f === 'Resolved' ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm' : 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                                        : f === 'Resolved' ? 'bg-white text-emerald-600 border-emerald-200 hover:bg-emerald-50' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}
                                >
                                    <span>{f === 'all' ? 'All Issues' : f === 'myVillage' ? 'My Village' : f === 'top5' ? 'Top 5' : f}</span>
                                    {count > 0 && (
                                        <span className={`ml-2 px-1.5 py-0.5 rounded-full text-[10px] ${filter === f ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'}`}>
                                            {count}
                                        </span>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>

                <div className="flex flex-col gap-6 md:flex-row">
                    <div className="md:w-2/3">
                        <>
                            {filteredIssues.map(issue => (
                                <IssueCard key={issue._id} issue={issue} refreshIssues={fetchIssues} />
                            ))}
                            {filteredIssues.length === 0 && (
                                <div className="py-20 text-center bg-white rounded-xl border border-slate-200">
                                    <h3 className="text-lg font-bold text-slate-900 mb-1">No issues found</h3>
                                    <p className="text-slate-500 text-sm">{t('no.issues')}</p>
                                </div>
                            )}
                        </>
                    </div>
                    <div className="md:w-1/3">
                        <Leaderboard />
                    </div>
                </div>
            </main >
        </div >
    );
};

export default Dashboard;
