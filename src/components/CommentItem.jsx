import React, { useState } from 'react';
import { Edit2, Trash2, Check, X, ShieldAlert } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';

export const CommentItem = ({
  comment,
  postAuthorId,
  onUpdate,
  onDeleteRequest,
}) => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const isCommentAuthor = Boolean(user && user._id === comment.author._id);
  const isPostAuthor = Boolean(user && user._id === postAuthorId);
  const canDelete = isCommentAuthor || isPostAuthor;

  const formattedDate = new Date(comment.createdAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const handleSaveEdit = async () => {
    if (!editContent.trim()) {
      setError('Comment cannot be empty.');
      return;
    }
    setIsSubmitting(true);
    setError(null);
    const success = await onUpdate(comment._id, editContent.trim());
    setIsSubmitting(false);
    if (success) {
      setIsEditing(false);
    }
  };

  const handleCancelEdit = () => {
    setEditContent(comment.content);
    setIsEditing(false);
    setError(null);
  };

  return (
    <div className="group relative flex gap-4 p-4.5 bg-white rounded-2xl border border-slate-200/70 hover:border-slate-300 transition-all shadow-xs">
      <img
        src={
          comment.author.avatar ||
          `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(comment.author.name)}`
        }
        alt={comment.author.name}
        className="w-10 h-10 rounded-full object-cover ring-2 ring-slate-100 shrink-0"
      />

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2 mb-1.5 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-sm text-slate-900">{comment.author.name}</span>
            {comment.author._id === postAuthorId && (
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">
                Author
              </span>
            )}
            <span className="text-xs text-slate-400">{formattedDate}</span>
          </div>

          {canDelete && !isEditing && (
            <div className="flex items-center gap-1.5 opacity-90 group-hover:opacity-100 transition-opacity">
              {isCommentAuthor && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="p-1.5 text-slate-400 hover:text-indigo-600 rounded-lg hover:bg-slate-100 transition-colors"
                  title="Edit your comment"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
              )}
              <button
                onClick={() => onDeleteRequest(comment._id, !isCommentAuthor && isPostAuthor)}
                className={`p-1.5 rounded-lg transition-colors ${
                  !isCommentAuthor && isPostAuthor
                    ? 'text-amber-600 hover:bg-amber-50'
                    : 'text-slate-400 hover:text-rose-600 hover:bg-slate-100'
                }`}
                title={
                  !isCommentAuthor && isPostAuthor
                    ? 'Remove inappropriate comment (as post owner)'
                    : 'Delete comment'
                }
              >
                {!isCommentAuthor && isPostAuthor ? (
                  <ShieldAlert className="w-3.5 h-3.5" />
                ) : (
                  <Trash2 className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
          )}
        </div>

        {isEditing ? (
          <div className="mt-2 space-y-2">
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              rows={3}
              className="w-full text-sm p-3 border border-indigo-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none resize-none"
              placeholder="Edit your comment..."
            />
            {error && <p className="text-xs text-rose-500 font-medium">{error}</p>}
            <div className="flex items-center gap-2 justify-end">
              <button
                type="button"
                onClick={handleCancelEdit}
                disabled={isSubmitting}
                className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X className="w-3 h-3" />
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveEdit}
                disabled={isSubmitting}
                className="inline-flex items-center gap-1 px-3.5 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition-all disabled:opacity-50"
              >
                <Check className="w-3 h-3" />
                {isSubmitting ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        ) : (
          <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line break-words">
            {comment.content}
          </p>
        )}
      </div>
    </div>
  );
};
