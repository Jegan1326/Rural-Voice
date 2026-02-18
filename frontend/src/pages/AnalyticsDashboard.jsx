import { useState, useEffect } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Download } from 'lucide-react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    PieChart, Pie, Cell
} from 'recharts';

const AnalyticsDashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user?.role !== 'Admin' && user?.role !== 'SuperAdmin') {
            navigate('/dashboard');
            return;
        }

        const fetchData = async () => {
            try {
                const res = await api.get('/analytics');
                setData(res.data);
            } catch (err) {
                console.error("Failed to fetch analytics", err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [user, navigate]);

    const handleDownload = async () => {
        try {
            const response = await api.get('/analytics/export', { responseType: 'blob' });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'rural_voice_issues.csv');
            document.body.appendChild(link);
            link.click();
        } catch (err) {
            console.error("Failed to download report", err);
            alert("Failed to download report");
        }
    };

    if (loading) return <div className="p-10 text-center">Loading analytics...</div>;
    if (!data) return <div className="p-10 text-center">No data available</div>;

    const COLORS_PROGRESS = ['bg-blue-500', 'bg-indigo-500', 'bg-slate-500', 'bg-amber-500', 'bg-emerald-500'];
    const CHART_COLORS = ['#3b82f6', '#6366f1', '#64748b', '#f59e0b', '#10b981'];

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 pb-20">
            <div className="container mx-auto">
                <div className="mb-12 flex flex-wrap justify-between gap-4 py-6 border-b border-slate-200">
                    <button
                        onClick={() => navigate('/admin')}
                        className="text-slate-600 hover:text-slate-900 text-sm font-bold uppercase transition-colors"
                    >
                        Back to Admin
                    </button>
                    <button
                        onClick={handleDownload}
                        className="std-button-primary px-6 py-2"
                    >
                        Export Data (CSV)
                    </button>
                </div>

                <h1 className="mb-12 text-4xl md:text-5xl font-bold tracking-tight text-slate-900 text-center md:text-left">
                    Impact <span className="text-primary">&</span> Analytics
                </h1>

                {/* Summary Cards */}
                <div className="mb-12 grid grid-cols-1 gap-6 md:grid-cols-3">
                    <div className="std-card border-l-4 border-indigo-500">
                        <h3 className="text-slate-500 font-bold uppercase text-xs tracking-wider">Total Issues</h3>
                        <p className="mt-2 text-5xl font-bold text-slate-900">{data.totalIssues}</p>
                    </div>
                    <div className="std-card border-l-4 border-emerald-500">
                        <h3 className="text-slate-500 font-bold uppercase text-xs tracking-wider">Resolved</h3>
                        <p className="mt-2 text-5xl font-bold text-slate-900">{data.resolvedIssues}</p>
                    </div>
                    <div className="std-card border-l-4 border-amber-500">
                        <h3 className="text-slate-500 font-bold uppercase text-xs tracking-wider">Pending</h3>
                        <p className="mt-2 text-5xl font-bold text-slate-900">{data.pendingIssues}</p>
                    </div>
                </div>

                {/* Charts Section */}
                <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2">
                    <div className="std-card">
                        <h3 className="mb-6 text-lg font-bold text-slate-900">Category Distribution</h3>
                        <div className="h-72 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={data?.categoryDistribution}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis dataKey="_id" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 10 }} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8' }} />
                                    <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0' }} />
                                    <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={40} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="std-card">
                        <h3 className="mb-6 text-lg font-bold text-slate-900">Issue Status</h3>
                        <div className="h-64 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={data?.statusDistribution}
                                        dataKey="count"
                                        nameKey="_id"
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                    >
                                        {data?.statusDistribution?.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0' }} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <div className="std-card">
                        <h3 className="mb-6 text-lg font-bold text-slate-900 border-b border-slate-100 pb-2">Issues by Category</h3>
                        <div className="space-y-4">
                            {data.issuesByCategory.map((entry, index) => (
                                <div key={entry._id}>
                                    <div className="mb-1.5 flex justify-between text-xs font-semibold text-slate-700">
                                        <span>{entry._id}</span>
                                        <span className="text-slate-400">{entry.count} ({((entry.count / data.totalIssues) * 100).toFixed(0)}%)</span>
                                    </div>
                                    <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
                                        <div
                                            className={`h-full rounded-full ${COLORS_PROGRESS[index % COLORS_PROGRESS.length]}`}
                                            style={{ width: `${(entry.count / data.totalIssues) * 100}%` }}
                                        ></div>
                                    </div>
                                </div>
                            ))}
                            {data.issuesByCategory.length === 0 && <p className="text-slate-400 text-sm italic">No category data available.</p>}
                        </div>
                    </div>

                    <div className="std-card">
                        <h3 className="mb-6 text-lg font-bold text-slate-900 border-b border-slate-100 pb-2">Top Participating Villages</h3>
                        <div className="space-y-3">
                            {data.topVillages.map((village, index) => (
                                <div key={index} className="flex items-center justify-between rounded-lg bg-slate-50 p-4 border border-slate-100 transition-colors">
                                    <div className="flex items-center">
                                        <span className="mr-3 flex h-6 w-6 items-center justify-center rounded-full bg-slate-200 text-[10px] font-bold text-slate-600">
                                            {index + 1}
                                        </span>
                                        <span className="font-semibold text-slate-700 text-sm">{village.name}</span>
                                    </div>
                                    <span className="rounded-md bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-700 border border-indigo-100">
                                        {village.count} issues
                                    </span>
                                </div>
                            ))}
                            {data.topVillages.length === 0 && <p className="text-slate-400 text-sm italic">No village data available.</p>}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AnalyticsDashboard;
