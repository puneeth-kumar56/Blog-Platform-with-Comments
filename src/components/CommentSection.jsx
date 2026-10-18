import React, { useState, useEffect } from 'react';
import { Send, MessageSquare, LogIn, Sparkles } from 'lucide-react';
import { commentsApi } from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { CommentItem } from './CommentItem.jsx';
import { DeleteConfirmModal } from './DeleteConfirmModal.jsx';
import { LoadingSpinner } from './LoadingSpinner.jsx';

export const CommentSection = ({
  postId,
  postAuthorId,
  onNavigateLogin,
}) => {
  const { user, isAuthenticated } = useAuth();
  const [comments, setComments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // Deletion modal state
  const [deleteModalState, setDeleteModalState] = useState({
    isOpen: false,
    commentId: null,
    isPostOwnerModeration: false,
    isDeleting: false,
  });

  const loadComments = async () => {
    try {
      setIsLoading(true);
      const res = await commentsApi.getComments(postId);
      if (res.success) {
        setComments(res.comments);
      }
    } catch (err) {
      console.error('[CommentSection] Error fetching comments:', err);
      setError('Failed to load comments.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadComments();
  }, [postId]);

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) {
      setError('Please type your comment before submitting.');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      const res = await commentsApi.addComment(postId, newComment.trim());
      if (res.success && res.comment) {
        setComments((prev) => [res.comment, ...prev]);
        setNewComment('');
        setSuccessMessage('Comment posted successfully!');
        setTimeout(() => setSuccessMessage(null), 3000);
      }
    } catch (err) {
      setError(err.message || 'Failed to submit comment.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateComment = async (commentId, content) => {
    try {
      const res = await commentsApi.updateComment(commentId, content);
      if (res.success && res.comment) {
        setComments((prev) =>
          prev.map((c) => (c._id === commentId ? { ...c, content, updatedAt: res.comment.updatedAt } : c))
        );
        return true;
      }
      return false;
    } catch (err) {
      setError(err.message || 'Failed to update comment.');
      return false;
    }
  };

  const handleDeleteRequest = (commentId, isPostOwnerModeration) => {
    setDeleteModalState({
      isOpen: true,
      commentId,
      isPostOwnerModeration,
      isDeleting: false,
    });
  };

  const handleConfirmDelete = async () => {
    if (!deleteModalState.commentId) return;

    try {
      setDeleteModalState((prev) => ({ ...prev, isDeleting: true }));
      const res = await commentsApi.deleteComment(deleteModalState.commentId);
      if (res.success) {
        setComments((prev) => prev.filter((c) => c._id !== deleteModalState.commentId));
        setDeleteModalState({
          isOpen: false,
          commentId: null,
          isPostOwnerModeration: false,
          isDeleting: false,
        });
        setSuccessMessage(res.message || 'Comment removed.');
        setTimeout(() => setSuccessMessage(null), 3000);
      }
    } catch (err) {
      setError(err.message || 'Failed to delete comment.');
      setDeleteModalState((prev) => ({ ...prev, isDeleting: false, isOpen: false }));
    }
  };

  return (
    <section className="mt-12 pt-10 border-t border-slate-200" id="comments">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-900">
              Discussion ({comments.length})
            </h3>
            <p className="text-xs text-slate-500">
              Join the conversation with other developers
            </p>
          </div>
        </div>
      </div>

      {/* Notifications */}
      {successMessage && (
        <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm rounded-xl flex items-center gap-2 animate-in fade-in">
          <Sparkles className="w-4 h-4 shrink-0 text-emerald-600" />
          {successMessage}
        </div>
      )}

      {error && (
        <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-sm rounded-xl">
          {error}
        </div>
      )}

      {/* Add Comment Form or Login Prompt */}
      {isAuthenticated && user ? (
        <form onSubmit={handleAddComment} className="mb-8">
          <div className="flex gap-4 items-start">
            <img
              src={
                user.avatar ||
                `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user.name)}`
              }
              alt={user.name}
              className="w-10 h-10 rounded-full object-cover ring-2 ring-slate-100 shrink-0"
            />
            <div className="flex-1">
              <div className="relative rounded-2xl border border-slate-200 bg-white shadow-xs focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/20 transition-all overflow-hidden">
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Add your constructive thoughts or questions..."
                  rows={3}
                  className="w-full p-4 text-sm text-slate-800 placeholder-slate-400 focus:outline-none resize-none"
                />
                <div className="flex items-center justify-between px-4 py-2.5 bg-slate-50 border-t border-slate-100">
                  <span className="text-xs text-slate-400">
                    Markdown supported
                  </span>
                  <button
                    type="submit"
                    disabled={isSubmitting || !newComment.trim()}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 active:scale-95 disabled:opacity-50 text-white text-xs font-semibold rounded-xl shadow-xs transition-all"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Posting...
                      </>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        Post Comment
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </form>
      ) : (
        <div className="mb-8 p-6 bg-linear-to-r from-slate-50 to-indigo-50/30 border border-slate-200/80 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-center sm:text-left">
            <h4 className="text-sm font-bold text-slate-800">
              Want to contribute to this discussion?
            </h4>
            <p className="text-xs text-slate-500 mt-0.5">
              Sign in with your account to ask questions or share your experience.
            </p>
          </div>
          <button
            onClick={onNavigateLogin}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all active:scale-95 shrink-0"
          >
            <LogIn className="w-4 h-4" />
            Log In to Comment
          </button>
        </div>
      )}

      {/* Comment List */}
      {isLoading ? (
        <LoadingSpinner message="Loading discussion..." size="sm" />
      ) : comments.length === 0 ? (
        <div className="text-center py-12 px-4 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
          <MessageSquare className="w-8 h-8 text-slate-300 mx-auto mb-2" />
          <h4 className="text-sm font-semibold text-slate-700">No comments yet</h4>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            Be the first person to share your insights on this article!
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => (
            <CommentItem
              key={comment._id}
              comment={comment}
              postAuthorId={postAuthorId}
              onUpdate={handleUpdateComment}
              onDeleteRequest={handleDeleteRequest}
            />
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={deleteModalState.isOpen}
        title={
          deleteModalState.isPostOwnerModeration
            ? 'Moderate Inappropriate Comment'
            : 'Delete Your Comment'
        }
        message={
          deleteModalState.isPostOwnerModeration
            ? 'As the author of this blog post, you have the authority to remove inappropriate or off-topic comments. Are you sure you wish to delete it?'
            : 'Are you sure you want to delete this comment? This action cannot be undone.'
        }
        confirmLabel="Yes, Delete"
        isDeleting={deleteModalState.isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={() =>
          setDeleteModalState({
            isOpen: false,
            commentId: null,
            isPostOwnerModeration: false,
            isDeleting: false,
          })
        }
      />
    </section>
  );
};
