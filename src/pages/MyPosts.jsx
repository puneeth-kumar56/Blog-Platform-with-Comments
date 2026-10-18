import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  PlusCircle,
  Clock,
  Heart,
  MessageSquare,
  Edit3,
  Trash2,
  ExternalLink,
} from 'lucide-react';
import { postsApi } from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { LoadingSpinner } from '../components/LoadingSpinner.jsx';
import { EmptyState } from '../components/EmptyState.jsx';
import { DeleteConfirmModal } from '../components/DeleteConfirmModal.jsx';

export const MyPosts = ({
  onSelectPost,
  onEditPost,
  onNavigateCreate,
}) => {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Deletion modal
  const [deleteModalState, setDeleteModalState] = useState({
    isOpen: false,
    postId: null,
    isDeleting: false,
  });

  const fetchMyPosts = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await postsApi.getMyPosts();
      if (res.success) {
        setPosts(res.posts);
      }
    } catch (err) {
      console.error('[MyPosts] Error:', err);
      setError(err.message || 'Failed to load your posts.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMyPosts();
  }, []);

  const handleDeleteClick = (postId) => {
    setDeleteModalState({
      isOpen: true,
      postId,
      isDeleting: false,
    });
  };

  const handleConfirmDelete = async () => {
    if (!deleteModalState.postId) return;
    try {
      setDeleteModalState((prev) => ({ ...prev, isDeleting: true }));
      await postsApi.deletePost(deleteModalState.postId);
      setDeleteModalState({ isOpen: false, postId: null, isDeleting: false });
      fetchMyPosts();
    } catch (err) {
      alert(err.message || 'Failed to delete post.');
      setDeleteModalState((prev) => ({ ...prev, isDeleting: false }));
    }
  };

  const totalLikes = posts.reduce((acc, p) => acc + (p.likesCount || 0), 0);
  const totalComments = posts.reduce((acc, p) => acc + (p.commentsCount || 0), 0);

  if (isLoading) {
    return <LoadingSpinner message="Fetching your authored articles..." size="lg" />;
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Header and Stats */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <BookOpen className="w-7 h-7 text-indigo-600" />
            My Published Articles
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Manage your articles, review engagement, or edit published pieces.
          </p>
        </div>

        <button
          onClick={onNavigateCreate}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white text-xs font-bold rounded-xl shadow-xs transition-all"
        >
          <PlusCircle className="w-4 h-4" />
          Write New Article
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-2xs">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Total Articles
          </p>
          <p className="text-3xl font-extrabold text-slate-900 mt-1.5">{posts.length}</p>
        </div>
        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-2xs">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Comments Received
          </p>
          <p className="text-3xl font-extrabold text-indigo-600 mt-1.5">{totalComments}</p>
        </div>
        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-2xs">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Community Likes
          </p>
          <p className="text-3xl font-extrabold text-rose-500 mt-1.5">{totalLikes}</p>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs">
          {error}
        </div>
      )}

      {/* List */}
      {posts.length === 0 ? (
        <EmptyState
          title="You haven't written any articles yet"
          description="Share your knowledge with fellow developers by writing your first article on DevScribe!"
          actionText="Create an Article"
          onAction={onNavigateCreate}
        />
      ) : (
        <div className="space-y-4">
          {posts.map((post) => {
            const dateStr = new Date(post.createdAt).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            });

            return (
              <div
                key={post._id}
                className="group flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 bg-white rounded-2xl border border-slate-200/80 hover:border-indigo-200 shadow-xs hover:shadow-md transition-all"
              >
                <div className="flex items-start gap-4 flex-1">
                  {post.coverImage && (
                    <img
                      src={post.coverImage}
                      alt={post.title}
                      className="w-20 h-20 rounded-xl object-cover shrink-0 hidden sm:block border border-slate-100"
                    />
                  )}
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">
                        {post.category}
                      </span>
                      <span className="text-xs text-slate-400">{dateStr}</span>
                    </div>

                    <h3
                      onClick={() => onSelectPost(post._id)}
                      className="text-base font-bold text-slate-900 hover:text-indigo-600 transition-colors cursor-pointer line-clamp-1"
                    >
                      {post.title}
                    </h3>

                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                      {post.content.replace(/[#*`_\[\]]/g, '')}
                    </p>

                    <div className="flex items-center gap-3 text-xs text-slate-400 pt-1">
                      <span className="flex items-center gap-1">
                        <MessageSquare className="w-3.5 h-3.5" />
                        {post.commentsCount || 0} comments
                      </span>
                      <span className="flex items-center gap-1">
                        <Heart className="w-3.5 h-3.5" />
                        {post.likesCount || 0} likes
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto justify-end pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                  <button
                    onClick={() => onSelectPost(post._id)}
                    className="p-2 text-slate-600 hover:text-indigo-600 hover:bg-slate-100 rounded-xl transition-colors"
                    title="View article"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onEditPost(post._id)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200/80 rounded-xl transition-colors"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteClick(post._id)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-xl transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={deleteModalState.isOpen}
        title="Delete Article"
        message="Are you sure you want to delete this article? This action cannot be reversed and all comments will be permanently erased."
        confirmLabel="Yes, Delete Post"
        isDeleting={deleteModalState.isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteModalState({ isOpen: false, postId: null, isDeleting: false })}
      />
    </div>
  );
};
