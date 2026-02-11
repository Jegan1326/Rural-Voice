import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import IssueCard from '../components/IssueCard';
import IssueMap from '../components/IssueMap';
import Leaderboard from '../components/Leaderboard';
// import { io } from 'socket.io-client';

import { useLanguage } from '../context/LanguageContext';

const Dashboard = () => {
    const { user, logout } = useAuth();
    const { t, toggleLanguage, language } = useLanguage();
    const navigate = useNavigate();
    const [issues, setIssues] = useState([]);
    const [filter, setFilter] = useState('all'); // all, myVillage
    const [view, setView] = useState('list'); // list, map

    useEffect(() => {
        fetchIssues();

        /*
        const socket = io('http://localhost:5000');
        
        if (user?.village) {
            socket.emit('joinVillage', user.village);
        }

        socket.on('newIssue', (newIssue) => {
            setIssues((prev) => [newIssue, ...prev]);
        });

        socket.on('issueUpdated', (updatedIssue) => {
            setIssues((prev) => prev.map(issue => issue._id === updatedIssue._id ? updatedIssue : issue));
        });

        return () => {
            socket.disconnect();
        };
        */
    }, [filter, user]);

    const fetchIssues = async () => {
        try {
            let url = '/issues';
            if (filter === 'myVillage' && user?.village) {
                url += `?village=${user.village}`;
            } else if (filter === 'top5') {
                url += `?timeRange=weekly&sort=top&limit=5`;
                if (user?.village) url += `&village=${user.village}`;
            }
            const { data } = await api.get(url);
            setIssues(data);
        } catch (err) {
            console.error("Failed to fetch issues", err);
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="min-h-screen bg-gray-100">
            <nav className="bg-green-600 p-4 text-white shadow-md">
                <div className="container mx-auto flex items-center justify-between">
                    <h1 className="text-xl font-bold">{t('app.title')}</h1>
                    <div className="flex items-center space-x-4">
                        <button
                            onClick={toggleLanguage}
                            className="rounded border border-white px-2 py-1 text-xs hover:bg-green-700"
                        >
                            {language === 'en' ? 'हिन्दी' : 'English'}
                        </button>
                        <Link to="/profile" className="hidden font-bold hover:underline md:inline">
                            {t('welcome')}, {user?.name}
                        </Link>
                        <button
                            onClick={handleLogout}
                            className="rounded bg-red-500 px-3 py-1 hover:bg-red-600"
                        >
                            {t('logout')}
                        </button>
                    </div>
                </div>
            </nav>
            <main className="container mx-auto p-4">
                <div className="mb-6 flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800">{t('community.issues')}</h2>
                        <p className="text-gray-600">{t('community.subtitle')}</p>
                    </div>
                    <button
                        onClick={() => navigate('/report-issue')}
                        className="rounded bg-blue-600 px-6 py-2 font-bold text-white shadow-lg hover:bg-blue-700"
                    >
                        {t('report.issue')}
                    </button>
                </div>

                <div className="mb-4 flex space-x-2">
                    <button
                        onClick={() => setFilter('all')}
                        className={`rounded px-4 py-2 font-bold ${filter === 'all' ? 'bg-white text-green-600 shadow' : 'text-gray-600 hover:bg-gray-200'}`}
                    >
                        {t('all.issues')}
                    </button>
                    <button
                        onClick={() => setFilter('top5')}
                        className={`rounded px-4 py-2 font-bold ${filter === 'top5' ? 'bg-white text-green-600 shadow' : 'text-gray-600 hover:bg-gray-200'}`}
                    >
                        {t('top.5')}
                    </button>
                    <button
                        onClick={() => setFilter('myVillage')}
                        className={`rounded px-4 py-2 font-bold ${filter === 'myVillage' ? 'bg-white text-green-600 shadow' : 'text-gray-600 hover:bg-gray-200'}`}
                    >
                        {t('my.village')}
                    </button>
                    <div className="ml-auto flex bg-gray-200 rounded p-1">
                        <button
                            onClick={() => setView('list')}
                            className={`px-3 py-1 rounded ${view === 'list' ? 'bg-white shadow text-green-700 font-bold' : 'text-gray-600'}`}
                        >
                            List
                        </button>
                        <button
                            onClick={() => setView('map')}
                            className={`px-3 py-1 rounded ${view === 'map' ? 'bg-white shadow text-green-700 font-bold' : 'text-gray-600'}`}
                        >
                            Map
                        </button>
                    </div>
                </div>

                <div className="flex flex-col gap-6 md:flex-row">
                    <div className="md:w-2/3">
                        {view === 'list' ? (
                            <>
                                {issues.map(issue => (
                                    <IssueCard key={issue._id} issue={issue} refreshIssues={fetchIssues} />
                                ))}
                                {issues.length === 0 && (
                                    <div className="py-10 text-center text-gray-500">
                                        <p>{t('no.issues')}</p>
                                    </div>
                                )}
                            </>
                        ) : (
                            <IssueMap issues={issues} />
                        )}
                    </div>
                    <div className="md:w-1/3">
                        <Leaderboard />
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Dashboard;
