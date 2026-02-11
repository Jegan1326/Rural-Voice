import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [villages, setVillages] = useState([]);
    const [issues, setIssues] = useState([]);
    const [users, setUsers] = useState([]);
    const [newVillage, setNewVillage] = useState({
        name: '',
        district: '',
        state: '',
        wards: '',
    });
    const [activeTab, setActiveTab] = useState('issues'); // 'issues' or 'villages'

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

            const villagesRes = await api.get('/villages');
            setVillages(villagesRes.data);

            const usersRes = await api.get('/users?village=' + user.village);
            setUsers(usersRes.data);
        } catch (err) {
            console.error("Failed to fetch admin data", err);
        }
    };

    const handleCreateVillage = async (e) => {
        e.preventDefault();
        try {
            const wardsArray = newVillage.wards.split(',').map(w => w.trim());
            await api.post('/villages', { ...newVillage, wards: wardsArray });
            setNewVillage({ name: '', district: '', state: '', wards: '' });
            fetchData();
            alert('Village created successfully!');
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to create village');
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
        <div className="min-h-screen bg-gray-100">
            <nav className="bg-gray-800 p-4 text-white shadow-md">
                <div className="container mx-auto flex items-center justify-between">
                    <h1 className="text-xl font-bold">Admin Panel - Rural Voice</h1>
                    <div className="flex items-center space-x-4">
                        <span>{user?.name} ({user?.role})</span>
                        <button onClick={handleLogout} className="rounded bg-red-600 px-3 py-1 hover:bg-red-700">Logout</button>
                    </div>
                </div>
            </nav>

            <main className="container mx-auto p-4">
                <div className="mb-6 flex space-x-4">
                    <button
                        className={`rounded px-4 py-2 font-bold ${activeTab === 'issues' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700'}`}
                        onClick={() => setActiveTab('issues')}
                    >
                        Manage Issues
                    </button>
                    <button
                        className={`rounded px-4 py-2 font-bold ${activeTab === 'villages' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700'}`}
                        onClick={() => setActiveTab('villages')}
                    >
                        Manage Villages
                    </button>
                    <button
                        className={`rounded px-4 py-2 font-bold ${activeTab === 'users' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700'}`}
                        onClick={() => setActiveTab('users')}
                    >
                        Manage Users
                    </button>
                    <button
                        className="rounded bg-purple-600 px-4 py-2 font-bold text-white hover:bg-purple-700"
                        onClick={() => navigate('/admin/analytics')}
                    >
                        View Analytics
                    </button>
                </div>

                {activeTab === 'issues' && (
                    <div className="grid gap-4">
                        {issues.map(issue => (
                            <div key={issue._id} className="rounded-lg bg-white p-6 shadow-md">
                                <div className="flex justify-between">
                                    <h3 className="text-xl font-bold">{issue.title}</h3>
                                    <span className={`rounded px-2 py-1 text-sm font-bold ${issue.status === 'Resolved' ? 'bg-green-100 text-green-800' :
                                        issue.status === 'In Progress' ? 'bg-yellow-100 text-yellow-800' :
                                            'bg-gray-100 text-gray-800'
                                        }`}>
                                        {issue.status}
                                    </span>
                                </div>
                                <p className="text-gray-600">{issue.description}</p>
                                <p className="mt-2 text-sm text-gray-500">
                                    Reported by: {issue.reportedBy?.name} | Village: {issue.village?.name}
                                </p>
                                <div className="mt-4 flex items-center justify-between">
                                    <div className="flex space-x-2">
                                        {['Submitted', 'Under Review', 'In Progress', 'Resolved'].map(status => (
                                            <button
                                                key={status}
                                                onClick={() => handleStatusUpdate(issue._id, status)}
                                                disabled={issue.status === status}
                                                className={`rounded px-3 py-1 text-xs ${issue.status === status
                                                    ? 'cursor-not-allowed bg-gray-300'
                                                    : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                                                    }`}
                                            >
                                                {status}
                                            </button>
                                        ))}
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <span className="text-sm font-bold text-gray-700">Assign To:</span>
                                        <select
                                            className="rounded border p-1 text-sm"
                                            value={issue.assignedTo?._id || issue.assignedTo || ''}
                                            onChange={(e) => handleAssign(issue._id, e.target.value)}
                                        >
                                            <option value="">-- Unassigned --</option>
                                            {users.map(u => (
                                                <option key={u._id} value={u._id}>{u.name} ({u.role})</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {activeTab === 'villages' && (
                    <div className="grid gap-6 md:grid-cols-2">
                        <div className="rounded-lg bg-white p-6 shadow-md">
                            <h3 className="mb-4 text-lg font-bold">Add New Village</h3>
                            <form onSubmit={handleCreateVillage}>
                                <div className="mb-3">
                                    <input
                                        type="text"
                                        placeholder="Village Name"
                                        className="w-full rounded border p-2"
                                        value={newVillage.name}
                                        onChange={(e) => setNewVillage({ ...newVillage, name: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="mb-3">
                                    <input
                                        type="text"
                                        placeholder="District"
                                        className="w-full rounded border p-2"
                                        value={newVillage.district}
                                        onChange={(e) => setNewVillage({ ...newVillage, district: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="mb-3">
                                    <input
                                        type="text"
                                        placeholder="State"
                                        className="w-full rounded border p-2"
                                        value={newVillage.state}
                                        onChange={(e) => setNewVillage({ ...newVillage, state: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="mb-3">
                                    <input
                                        type="text"
                                        placeholder="Wards (comma separated)"
                                        className="w-full rounded border p-2"
                                        value={newVillage.wards}
                                        onChange={(e) => setNewVillage({ ...newVillage, wards: e.target.value })}
                                    />
                                </div>
                                <button type="submit" className="w-full rounded bg-green-600 py-2 text-white hover:bg-green-700">
                                    Create Village
                                </button>
                            </form>
                        </div>

                        <div className="rounded-lg bg-white p-6 shadow-md">
                            <h3 className="mb-4 text-lg font-bold">Existing Villages</h3>
                            <ul className="max-h-96 overflow-y-auto">
                                {villages.map(v => (
                                    <li key={v._id} className="mb-2 border-b pb-2">
                                        <p className="font-bold">{v.name}</p>
                                        <p className="text-sm text-gray-600">{v.district}, {v.state}</p>
                                        <p className="text-xs text-gray-500">{v.wards.length} Wards</p>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                )}

                {activeTab === 'users' && (
                    <div className="rounded-lg bg-white p-6 shadow-md">
                        <h3 className="mb-4 text-lg font-bold">Manage Users</h3>
                        <div className="overflow-x-auto">
                            <table className="min-w-full text-left">
                                <thead>
                                    <tr className="border-b">
                                        <th className="p-2">Name</th>
                                        <th className="p-2">Role</th>
                                        <th className="p-2">Status</th>
                                        <th className="p-2">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.map(u => (
                                        <tr key={u._id} className="border-b hover:bg-gray-50">
                                            <td className="p-2">{u.name}</td>
                                            <td className="p-2">{u.role}</td>
                                            <td className="p-2">
                                                {u.isBanned ? (
                                                    <span className="rounded bg-red-100 px-2 py-1 text-xs font-bold text-red-800">Banned</span>
                                                ) : (
                                                    <span className="rounded bg-green-100 px-2 py-1 text-xs font-bold text-green-800">Active</span>
                                                )}
                                            </td>
                                            <td className="p-2">
                                                {u.role !== 'Admin' && u.role !== 'SuperAdmin' && (
                                                    <button
                                                        onClick={() => handleBanUser(u._id)}
                                                        className={`rounded px-3 py-1 text-xs font-bold text-white ${u.isBanned ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}`}
                                                    >
                                                        {u.isBanned ? 'Unban' : 'Ban'}
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
