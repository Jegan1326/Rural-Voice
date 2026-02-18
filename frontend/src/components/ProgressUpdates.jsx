import { useState } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { Clock, Image as ImageIcon, Plus } from 'lucide-react';

const ProgressUpdates = ({ issue, refreshIssues }) => {
    const { user } = useAuth();
    const { t } = useLanguage();
    const [showForm, setShowForm] = useState(false);
    const [description, setDescription] = useState('');
    const [image, setImage] = useState(null);
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState(issue.status);

    const isAuthorized = user && (user.role === 'Villager' || user.role === 'Coordinator');

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!description.trim()) return;

        setLoading(true);
        const formData = new FormData();
        formData.append('description', description);
        formData.append('status', status);
        if (image) {
            formData.append('image', image);
        }

        try {
            await api.post(`/issues/${issue._id}/progress`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setDescription('');
            setImage(null);
            setShowForm(false);
            refreshIssues();
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to add progress update');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="mt-8 pt-6 border-t border-slate-100">
            <div className="flex items-center justify-between mb-6">
                <h4 className="text-sm font-bold uppercase tracking-wider text-slate-500 flex items-center">
                    <Clock size={16} className="mr-2 text-slate-400" />
                    Progress Timeline
                </h4>
                {isAuthorized && !showForm && (
                    <button
                        onClick={() => setShowForm(true)}
                        className="std-button-primary py-1.5 px-4 text-xs"
                    >
                        <Plus size={14} className="mr-1" />
                        <span>Update Progress</span>
                    </button>
                )}
            </div>

            {showForm && (
                <form onSubmit={handleSubmit} className="mb-8 rounded-xl bg-slate-50 p-6 border border-slate-200">
                    <div className="mb-4">
                        <label className="block text-[10px] uppercase font-bold tracking-wider text-slate-500 mb-2 ml-1">Update Status</label>
                        <select
                            value={status}
                            onChange={(e) => setStatus(e.target.value)}
                            className="std-select"
                        >
                            <option value="Submitted">Submitted</option>
                            <option value="Under Review">Under Review</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Resolved">Resolved</option>
                        </select>
                    </div>
                    <div className="mb-4">
                        <label className="block text-[10px] uppercase font-bold tracking-wider text-slate-500 mb-2 ml-1">Activity Description</label>
                        <textarea
                            placeholder="Describe what has been accomplished..."
                            className="std-input h-24"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            required
                        ></textarea>
                    </div>
                    <div className="mb-6">
                        <label className="block text-[10px] uppercase font-bold tracking-wider text-slate-500 mb-2 ml-1">Proof Image (Optional)</label>
                        <div className="flex items-center space-x-3 bg-white p-3 rounded-lg border border-slate-200">
                            <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => setImage(e.target.files[0])}
                                className="text-xs text-slate-500 font-semibold file:mr-4 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-[10px] file:font-bold file:uppercase file:bg-slate-100 file:text-slate-600 hover:file:bg-slate-200"
                            />
                            {image && <ImageIcon size={18} className="text-emerald-500" />}
                        </div>
                    </div>
                    <div className="flex justify-end space-x-3">
                        <button
                            type="button"
                            onClick={() => setShowForm(false)}
                            className="px-5 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 hover:text-slate-600"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading || !description.trim()}
                            className="std-button-primary py-2 px-6"
                        >
                            {loading ? 'Posting...' : 'Post Update'}
                        </button>
                    </div>
                </form>
            )}

            <div className="space-y-6">
                {issue.progressUpdates && issue.progressUpdates.length > 0 ? (
                    issue.progressUpdates.slice().reverse().map((update, index) => (
                        <div key={index} className="relative pl-8 border-l border-slate-200">
                            <div className="absolute -left-[5px] top-0 h-2.5 w-2.5 rounded-full bg-slate-300"></div>
                            <div className="mb-2 flex items-center justify-between">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-800">{update.user?.name || 'Coordinator'}</span>
                                <span className="text-[9px] font-semibold text-slate-400">
                                    {new Date(update.recordedAt).toLocaleString()}
                                </span>
                            </div>
                            <div className="bg-white rounded-lg border border-slate-100 p-4 shadow-sm">
                                <p className="text-sm text-slate-600 leading-relaxed font-medium">{update.description}</p>
                                {update.imageUrl && (
                                    <div className="mt-4 overflow-hidden rounded-lg border border-slate-100 shadow-sm">
                                        <img
                                            src={update.imageUrl}
                                            alt="Progress proof"
                                            className="max-h-64 w-full object-cover"
                                            onClick={() => window.open(update.imageUrl, '_blank')}
                                        />
                                    </div>
                                )}
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-10 px-6 rounded-xl border border-dashed border-slate-200">
                        <p className="text-xs font-semibold text-slate-400 italic">This issue's journey is just beginning.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProgressUpdates;
