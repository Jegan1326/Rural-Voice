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

    const COLORS = ['bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-red-500', 'bg-purple-500', 'bg-pink-500'];

    return (
        <div className="min-h-screen bg-gray-100 p-4">
            <div className="container mx-auto">
                <div className="mb-4 flex justify-between">
                    <button
                        onClick={() => navigate('/admin')}
                        className="rounded bg-gray-200 px-4 py-2 font-bold text-gray-700 hover:bg-gray-300"
                    >
                        &larr; Back to Admin
                    </button>
                    <button
                        onClick={handleDownload}
                        className="rounded bg-green-600 px-4 py-2 font-bold text-white hover:bg-green-700"
                    >
                        Download Report (CSV)
                    </button>
                </div>

                <h1 className="mb-6 text-3xl font-bold text-gray-800">Analytics Dashboard</h1>

                {/* Summary Cards */}
                <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-3">
                    <div className="rounded-lg bg-white p-6 shadow-md transition-shadow hover:shadow-lg">
                        <h3 className="text-gray-500 uppercase text-xs font-semibold tracking-wider">Total Issues</h3>
                        <p className="mt-2 text-3xl font-extrabold text-blue-600">{data.totalIssues}</p>
                    </div>
                    <div className="rounded-lg bg-white p-6 shadow-md transition-shadow hover:shadow-lg">
                        <h3 className="text-gray-500 uppercase text-xs font-semibold tracking-wider">Resolved</h3>
                        <p className="mt-2 text-3xl font-extrabold text-green-600">{data.resolvedIssues}</p>
                    </div>
                    <div className="rounded-lg bg-white p-6 shadow-md transition-shadow hover:shadow-lg">
                        <h3 className="text-gray-500 uppercase text-xs font-semibold tracking-wider">Pending</h3>
                        <p className="mt-2 text-3xl font-extrabold text-yellow-600">{data.pendingIssues}</p>
                    </div>
                </div>

                {/* Charts Section */}
                <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2">
                    <div className="rounded-lg bg-white p-6 shadow-md">
                        <h3 className="mb-4 text-lg font-bold text-gray-700">Issues by Category</h3>
                        <div className="h-64 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={data?.categoryDistribution}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="_id" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Bar dataKey="count" fill="#3b82f6" name="Issues" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="rounded-lg bg-white p-6 shadow-md">
                        <h3 className="mb-4 text-lg font-bold text-gray-700">Issue Status</h3>
                        <div className="h-64 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={data?.statusDistribution}
                                        dataKey="count"
                                        nameKey="_id"
                                        cx="50%"
                                        cy="50%"
                                        outerRadius={80}
                                        fill="#8884d8"
                                        label
                                    >
                                        {data?.statusDistribution?.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={['#0088FE', '#00C49F', '#FFBB28', '#FF8042'][index % 4]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                    {/* Issues by Category */}
                    <div className="rounded-lg bg-white p-6 shadow-md">
                        <h3 className="mb-6 text-xl font-bold text-gray-800 border-b pb-2">Issues by Category</h3>
                        <div className="space-y-6">
                            {data.issuesByCategory.map((entry, index) => (
                                <div key={entry._id}>
                                    <div className="mb-2 flex justify-between text-sm font-medium text-gray-700">
                                        <span>{entry._id}</span>
                                        <span>{entry.count} ({((entry.count / data.totalIssues) * 100).toFixed(0)}%)</span>
                                    </div>
                                    <div className="h-3 w-full rounded-full bg-gray-200 overflow-hidden">
                                        <div
                                            className={`h-full rounded-full ${COLORS[index % COLORS.length]}`}
                                            style={{ width: `${(entry.count / data.totalIssues) * 100}%` }}
                                        ></div>
                                    </div>
                                </div>
                            ))}
                            {data.issuesByCategory.length === 0 && <p className="text-gray-500 italic">No category data available.</p>}
                        </div>
                    </div>

                    {/* Top Villages */}
                    <div className="rounded-lg bg-white p-6 shadow-md">
                        <h3 className="mb-6 text-xl font-bold text-gray-800 border-b pb-2">Top Reporting Villages</h3>
                        <div className="space-y-3">
                            {data.topVillages.map((village, index) => (
                                <div key={index} className="flex items-center justify-between rounded bg-gray-50 p-3 hover:bg-gray-100">
                                    <div className="flex items-center">
                                        <span className="mr-3 flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-800">
                                            {index + 1}
                                        </span>
                                        <span className="font-medium text-gray-700">{village.name}</span>
                                    </div>
                                    <span className="rounded-full bg-blue-600 px-3 py-1 text-xs font-bold text-white">
                                        {village.count} issues
                                    </span>
                                </div>
                            ))}
                            {data.topVillages.length === 0 && <p className="text-gray-500 italic">No village data available.</p>}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AnalyticsDashboard;
