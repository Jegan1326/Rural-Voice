import { useState } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { MessageSquare, ThumbsUp, MapPin, Activity } from 'lucide-react';
import ProgressUpdates from './ProgressUpdates';

const IssueCard = ({ issue, refreshIssues }) => {
    const { user } = useAuth();
    const [showComments, setShowComments] = useState(false);
    const [showProgress, setShowProgress] = useState(false);
    const [commentText, setCommentText] = useState('');
    const [loading, setLoading] = useState(false);

    const handleVote = async () => {
        try {
            await api.put(`/issues/${issue._id}/vote`);
            refreshIssues();
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to vote');
        }
    };

    const handleCommentSubmit = async (e) => {
        e.preventDefault();
        if (!commentText.trim()) return;

        setLoading(true);
        try {
            await api.post(`/issues/${issue._id}/comments`, { text: commentText });
            setCommentText('');
            refreshIssues();
        } catch (err) {
            alert('Failed to add comment');
        } finally {
            setLoading(false);
        }
    };

    const isVoted = issue.votes.includes(user?._id);

    return (
        <div className="mb-8 std-card p-6">
            <div className="mb-6 flex items-start justify-between">
                <div className="flex-1 mr-4">
                    <h3 className="text-xl font-bold text-slate-900 mb-2">{issue.title}</h3>
                    <div className="flex flex-wrap items-center gap-3 text-xs font-semibold text-slate-500">
                        <div className="flex items-center bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200">
                            <MapPin size={14} className="mr-1.5 text-slate-400" />
                            <span>{issue.village?.name}</span>
                        </div>
                        <div className="flex items-center bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200">
                            <span>{issue.category}</span>
                        </div>
                    </div>
                </div>
                <span className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider border ${issue.status === 'Resolved' ? 'bg-green-100 text-green-800 border-green-200' :
                    issue.status === 'In Progress' ? 'bg-blue-100 text-blue-800 border-blue-200' :
                        'bg-slate-100 text-slate-600 border-slate-200'
                    }`}>
                    {issue.status}
                </span>
            </div>

            {issue.imageUrl && (
                <div className="mb-4 overflow-hidden rounded-xl border border-slate-200">
                    <img
                        src={issue.imageUrl}
                        alt={issue.title}
                        className="h-64 w-full object-cover"
                    />
                </div>
            )}

            {issue.voiceUrl && (
                <div className="mb-4">
                    <p className="text-sm font-bold text-gray-700 mb-1">Voice Note:</p>
                    <audio controls src={issue.voiceUrl} className="w-full" />
                </div>
            )}

            <p className="mb-6 text-slate-600 text-sm leading-relaxed">{issue.description}</p>

            <div className="flex flex-wrap items-center justify-between border-t border-slate-100 pt-4 mt-4 gap-4">
                <div className="flex space-x-6">
                    <button
                        onClick={handleVote}
                        className={`flex items-center space-x-1.5 transition-colors ${isVoted ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                        <ThumbsUp size={18} fill={isVoted ? 'currentColor' : 'none'} />
                        <span className="font-bold text-xs">{issue.votes.length}</span>
                    </button>
                    <button
                        onClick={() => setShowComments(!showComments)}
                        className={`flex items-center space-x-1.5 transition-colors ${showComments ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                        <MessageSquare size={18} />
                        <span className="font-bold text-xs">{issue.comments.length}</span>
                    </button>
                    <button
                        onClick={() => setShowProgress(!showProgress)}
                        className={`flex items-center space-x-1.5 transition-colors ${showProgress ? 'text-slate-900' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                        <Activity size={18} />
                        <span className="text-[10px] font-bold uppercase tracking-wider">Progress</span>
                    </button>
                </div>
                <div className="flex items-center text-[10px] font-semibold text-slate-400 uppercase tracking-widest">
                    <span>{issue.reportedBy?.name} • {new Date(issue.createdAt).toLocaleDateString()}</span>
                </div>
            </div>

            {showProgress && (
                <ProgressUpdates issue={issue} refreshIssues={refreshIssues} />
            )}

            {showComments && (
                <div className="mt-4 border-t pt-4">
                    <div className="mb-4 max-h-60 space-y-3 overflow-y-auto">
                        {issue.comments.map((comment, index) => (
                            <div key={index} className="rounded bg-gray-50 p-3">
                                <p className="text-sm font-bold text-gray-800">{comment.user?.name}</p>
                                <p className="mt-1 text-gray-800">
                                    {comment.text.split(' ').map((word, i) => {
                                        if (word.startsWith('@')) {
                                            return <span key={i} className="font-semibold text-blue-600">{word} </span>;
                                        }
                                        return word + ' ';
                                    })}
                                </p>

                                {/* Replies */}
                                {comment.replies && comment.replies.length > 0 && (
                                    <div className="mt-2 ml-4 border-l-2 border-gray-200 pl-2">
                                        {comment.replies.map((reply, rIndex) => (
                                            <div key={rIndex} className="mt-1">
                                                <p className="text-xs font-bold text-gray-700">{reply.user?.name}</p>
                                                <p className="text-xs text-gray-600">{reply.text}</p>
                                            </div>
                                        ))}
                                    </div>
                                )}
                                <ReplyInput issueId={issue._id} commentId={comment._id} refreshIssues={refreshIssues} />
                            </div>
                        ))}
                        {issue.comments.length === 0 && <p className="text-center text-sm text-gray-500">No comments yet.</p>}
                    </div>
                    <form onSubmit={handleCommentSubmit} className="flex gap-2">
                        <input
                            type="text"
                            placeholder="Add a comment..."
                            className="flex-1 rounded border px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                            value={commentText}
                            onChange={(e) => setCommentText(e.target.value)}
                            disabled={loading}
                        />
                        <button
                            type="submit"
                            disabled={loading || !commentText.trim()}
                            className="rounded bg-blue-600 px-4 py-2 text-sm font-bold text-white hover:bg-blue-700 disabled:opacity-50"
                        >
                            Post
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
};

const ReplyInput = ({ issueId, commentId, refreshIssues }) => {
    const [replyText, setReplyText] = useState('');
    const [showReply, setShowReply] = useState(false);

    const handleReplySubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post(`/issues/${issueId}/comments/${commentId}/reply`, { text: replyText });
            setReplyText('');
            setShowReply(false);
            refreshIssues();
        } catch (err) {
            alert('Failed to reply');
        }
    };

    return (
        <div className="mt-2">
            <button onClick={() => setShowReply(!showReply)} className="text-xs text-blue-500 hover:underline">Reply</button>
            {showReply && (
                <form onSubmit={handleReplySubmit} className="mt-1 flex gap-2">
                    <input
                        type="text"
                        placeholder="Reply..."
                        className="flex-1 rounded border px-2 py-1 text-xs"
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                    />
                    <button type="submit" className="rounded bg-gray-200 px-2 py-1 text-xs">Send</button>
                </form>
            )}
        </div>
    );
};

export default IssueCard;
