import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { useNavigate } from 'react-router-dom';
import { Activity } from 'lucide-react';
import ProgressUpdates from '../components/ProgressUpdates';

const AdminDashboard = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [issues, setIssues] = useState([]);
    const [users, setUsers] = useState([]);
    const [activeTab, setActiveTab] = useState('issues'); // 'issues' or 'villages'
    const [showProgress, setShowProgress] = useState({}); // { issueId: boolean }

    const toggleProgress = (id) => {
        setShowProgress(prev => ({ ...prev, [id]: !prev[id] }));
    };

    useEffect(() => {
        if (user?.role !== 'Admin' && user?.role !== 'SuperAdmin') {
            navigate('/dashboard');
        }
        fetchData();
    }, [user, navigate]);

    const fetchData = async () => {
        try {
            const issuesRes = await api.get('/issues');
            setIssues(issuesRes.data);

            const usersRes = await api.get('/users?village=' + user.village);
            setUsers(usersRes.data);
        } catch (err) {
            console.error("Failed to fetch admin data", err);
        }
    };


    const handleStatusUpdate = async (id, status) => {
        try {
            await api.put(`/issues/${id}/status`, { status });
            fetchData(); // Refresh data to show new status
        } catch (err) {
            alert('Failed to update status');
        }
    };

    const handleAssign = async (issueId, userId) => {
        try {
            await api.put(`/issues/${issueId}/assign`, { assignedTo: userId });
            fetchData();
        } catch (err) {
            alert('Failed to assign user');
        }
    };

    const handleBanUser = async (userId) => {
        if (window.confirm('Are you sure you want to change ban status?')) {
            try {
                await api.put(`/users/${userId}/ban`);
                fetchData();
            } catch (err) {
                alert('Failed to update ban status');
            }
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="min-h-screen bg-slate-100 text-slate-900 pb-20">

            <nav className="std-nav p-4 sticky top-0 z-50 px-6">
                <div className="container mx-auto flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <h1 className="text-xl font-bold tracking-tight text-slate-900">
                            Village <span className="text-primary">Admin</span>
                        </h1>
                    </div>
                    <div className="flex items-center space-x-6">
                        <span className="hidden md:inline text-xs font-semibold text-slate-600 uppercase tracking-widest">
                            Authority: <span className="text-slate-900 font-bold">{user?.name}</span>
                        </span>
                        <button onClick={handleLogout} className="text-slate-600 hover:text-red-600 text-xs font-bold uppercase transition-colors">
                            Logout
                        </button>
                    </div>
                </div>
            </nav>

            <main className="container mx-auto p-4">
                <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
                    <div className="flex flex-wrap gap-2">
                        <button
                            className={`rounded-lg px-6 py-2 text-xs font-semibold transition-all border ${activeTab === 'issues'
                                ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}
                            onClick={() => setActiveTab('issues')}
                        >
                            Active Issues
                        </button>
                        <button
                            className={`rounded-lg px-6 py-2 text-xs font-semibold transition-all border ${activeTab === 'users'
                                ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}
                            onClick={() => setActiveTab('users')}
                        >
                            Community List
                        </button>
                    </div>
                    <button
                        className="std-button-secondary bg-slate-800 hover:bg-slate-900 text-white text-xs py-2 px-6 ml-auto"
                        onClick={() => navigate('/admin/analytics')}
                    >
                        View Analytics
                    </button>
                </div>

                {activeTab === 'issues' && (
                    <div className="grid gap-8">
                        {issues.map(issue => (
                            <div key={issue._id} className="std-card p-6">
                                <div className="flex justify-between items-start mb-4">
                                    <h3 className="text-xl std-heading text-slate-900">{issue.title}</h3>
                                    <span className={`rounded-full px-4 py-1 text-[10px] font-bold uppercase tracking-wider border ${issue.status === 'Resolved' ? 'bg-green-100 text-green-800 border-green-200' :
                                        issue.status === 'In Progress' ? 'bg-blue-100 text-blue-800 border-blue-200' :
                                            'bg-slate-100 text-slate-600 border-slate-200'
                                        }`}>
                                        {issue.status}
                                    </span>
                                </div>
                                <p className="text-slate-600 text-sm mb-4 leading-relaxed">{issue.description}</p>
                                <div className="flex items-center space-x-4 text-xs text-slate-500 font-medium pb-4 border-b border-slate-100 mb-4">
                                    <span>Reported by: <span className="text-slate-900">{issue.reportedBy?.name}</span></span>
                                    <span>|</span>
                                    <span>Village: <span className="text-slate-900">{issue.village?.name}</span></span>
                                </div>
                                <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
                                    <div className="flex flex-wrap gap-2">
                                        {['Submitted', 'Under Review', 'In Progress', 'Resolved'].map(status => (
                                            <button
                                                key={status}
                                                onClick={() => handleStatusUpdate(issue._id, status)}
                                                disabled={issue.status === status}
                                                className={`rounded-md px-4 py-1.5 text-[10px] font-bold uppercase tracking-wider transition-all border ${issue.status === status
                                                    ? 'bg-slate-50 text-slate-400 border-slate-200 cursor-not-allowed'
                                                    : 'bg-white border-slate-200 text-slate-600 hover:border-primary hover:text-primary'
                                                    }`}
                                            >
                                                {status}
                                            </button>
                                        ))}
                                    </div>
                                    <div className="flex items-center space-x-3">
                                        <button
                                            onClick={() => toggleProgress(issue._id)}
                                            className={`flex items-center space-x-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${showProgress[issue._id] ? 'bg-slate-200 text-slate-800' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                                        >
                                            <Activity size={14} />
                                            <span>Progress ({issue.progressUpdates?.length || 0})</span>
                                        </button>
                                        <div className="flex items-center gap-2 bg-slate-50 p-1 rounded-lg border border-slate-200 px-3">
                                            <span className="text-[10px] uppercase font-bold text-slate-500">Assign:</span>
                                            <select
                                                className="bg-transparent border-none text-xs font-bold text-slate-800 focus:ring-0 p-0"
                                                value={issue.assignedTo?._id || issue.assignedTo || ''}
                                                onChange={(e) => handleAssign(issue._id, e.target.value)}
                                            >
                                                <option value="">Unassigned</option>
                                                {users.map(u => (
                                                    <option key={u._id} value={u._id}>{u.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                </div>
                                {showProgress[issue._id] && (
                                    <div className="mt-4 border-t pt-2">
                                        <ProgressUpdates issue={issue} refreshIssues={fetchData} />
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}


                {activeTab === 'users' && (
                    <div className="std-card">
                        <h3 className="mb-6 text-xl std-heading">Community Members</h3>
                        <div className="overflow-x-auto">
                            <table className="min-w-full text-left">
                                <thead>
                                    <tr className="border-b border-slate-200 text-[10px] uppercase tracking-widest text-slate-500 font-bold">
                                        <th className="p-4">Name</th>
                                        <th className="p-4">Role</th>
                                        <th className="p-4">Status</th>
                                        <th className="p-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.map(u => (
                                        <tr key={u._id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                                            <td className="p-4 font-semibold text-slate-900">{u.name}</td>
                                            <td className="p-4 text-sm text-slate-600">{u.role}</td>
                                            <td className="p-4">
                                                {u.isBanned ? (
                                                    <span className="rounded-full bg-red-100 px-3 py-1 text-[10px] font-bold text-red-800 uppercase">Banned</span>
                                                ) : (
                                                    <span className="rounded-full bg-green-100 px-3 py-1 text-[10px] font-bold text-green-800 uppercase">Active</span>
                                                )}
                                            </td>
                                            <td className="p-4 text-right">
                                                {u.role !== 'Admin' && u.role !== 'SuperAdmin' && (
                                                    <button
                                                        onClick={() => handleBanUser(u._id)}
                                                        className={`rounded-lg px-4 py-1 text-[10px] font-bold text-white transition-all shadow-sm uppercase ${u.isBanned ? 'bg-green-600' : 'bg-red-600'}`}
                                                    >
                                                        {u.isBanned ? 'Unban' : 'Ban User'}
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default AdminDashboard;
