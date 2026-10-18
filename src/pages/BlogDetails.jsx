import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Calendar,
  Clock,
  Edit3,
  Trash2,
  Share2,
  Check,
  Tag,
  User as UserIcon,
} from 'lucide-react';
import { postsApi } from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { CommentSection } from '../components/CommentSection.jsx';
import { LoadingSpinner } from '../components/LoadingSpinner.jsx';
import { DeleteConfirmModal } from '../components/DeleteConfirmModal.jsx';

export const BlogDetails = ({
  postId,
  onBack,
  onEdit,
  onSelectPost,
  onNavigateLogin,
  onNavigateProfile,
}) => {
  const { user } = useAuth();
  const [post, setPost] = useState(null);
  const [relatedPosts, setRelatedPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copiedLink, setCopiedLink] = useState(false);

  // Delete modal state
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const fetchPostDetails = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const res = await postsApi.getPostById(postId);
        if (res.success && res.post) {
          setPost(res.post);
          setRelatedPosts(res.relatedPosts || []);
        } else {
          setError('Post could not be found.');
        }
      } catch (err) {
        console.error('[BlogDetails] Error:', err);
        setError(err.message || 'Failed to load post.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPostDetails();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [postId]);

  const isAuthor = Boolean(user && post && user._id === post.author._id);

  const handleConfirmDelete = async () => {
    if (!post) return;
    try {
      setIsDeleting(true);
      await postsApi.deletePost(post._id);
      setIsDeleting(false);
      setIsDeleteModalOpen(false);
      onBack();
    } catch (err) {
      alert(err.message || 'Failed to delete post.');
      setIsDeleting(false);
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  if (isLoading) {
    return <LoadingSpinner message="Loading article..." size="lg" />;
  }

  if (error || !post) {
    return (
      <div className="max-w-2xl mx-auto my-12 text-center p-8 bg-white border border-slate-200 rounded-2xl space-y-4">
        <h2 className="text-xl font-bold text-slate-800">Article Not Found</h2>
        <p className="text-sm text-slate-500">
          The requested article does not exist or may have been removed.
        </p>
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-xs font-bold rounded-xl hover:bg-indigo-700"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Articles
        </button>
      </div>
    );
  }

  const formattedCreated = new Date(post.createdAt).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  const formattedUpdated =
    post.updatedAt && post.updatedAt !== post.createdAt
      ? new Date(post.updatedAt).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        })
      : null;

  return (
    <article className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-200">
      {/* Top Navigation & Actions Bar */}
      <div className="flex items-center justify-between gap-4">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-indigo-600 px-3 py-1.5 rounded-lg hover:bg-slate-100 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to all articles
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={handleShare}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg shadow-2xs transition-colors"
            title="Copy article link"
          >
            {copiedLink ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-700">Copied!</span>
              </>
            ) : (
              <>
                <Share2 className="w-3.5 h-3.5" />
                <span>Share</span>
              </>
            )}
          </button>

          {isAuthor && (
            <>
              <button
                onClick={() => onEdit(post._id)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-100 rounded-lg transition-colors"
              >
                <Edit3 className="w-3.5 h-3.5" />
                Edit Post
              </button>
              <button
                onClick={() => setIsDeleteModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-100 rounded-lg transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Delete Post
              </button>
            </>
          )}
        </div>
      </div>

      {/* Main Post Header */}
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-2.5">
          <span className="px-3 py-1 text-xs font-bold rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">
            {post.category}
          </span>
          <div className="flex items-center gap-3 text-xs text-slate-400">
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              {formattedCreated}
            </span>
            {formattedUpdated && (
              <span>(Updated: {formattedUpdated})</span>
            )}
            <span>•</span>
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {post.readTime || 4} min read
            </span>
          </div>
        </div>

        <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
          {post.title}
        </h1>

        {/* Author Bio Banner */}
        <div
          onClick={() => onNavigateProfile(post.author._id)}
          className="flex items-center gap-3 p-3 bg-white rounded-2xl border border-slate-200/80 shadow-2xs hover:border-indigo-200 transition-colors cursor-pointer group w-fit"
        >
          <img
            src={
              post.author.avatar ||
              `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(post.author.name)}`
            }
            alt={post.author.name}
            className="w-11 h-11 rounded-full object-cover ring-2 ring-indigo-50"
          />
          <div>
            <div className="flex items-center gap-1.5">
              <p className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                {post.author.name}
              </p>
              <UserIcon className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-500" />
            </div>
            <p className="text-xs text-slate-400">{post.author.email}</p>
          </div>
        </div>
      </div>

      {/* Cover Image */}
      {post.coverImage && (
        <div className="w-full h-72 sm:h-96 rounded-3xl overflow-hidden border border-slate-200 shadow-sm bg-slate-100">
          <img
            src={post.coverImage}
            alt={post.title}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.style.display = 'none';
            }}
          />
        </div>
      )}

      {/* Post Content Body */}
      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-xs">
        <div className="prose prose-slate max-w-none text-slate-800 leading-relaxed text-base sm:text-lg whitespace-pre-line space-y-4 font-normal">
          {post.content}
        </div>

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="pt-8 mt-8 border-t border-slate-100 flex flex-wrap items-center gap-2">
            <Tag className="w-4 h-4 text-slate-400 mr-1" />
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="px-2.5 py-1 text-xs font-medium rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200/80 transition-colors"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Author Card Box */}
      <div className="p-6 bg-slate-900 text-white rounded-3xl flex flex-col sm:flex-row items-center sm:items-start gap-5 shadow-lg">
        <img
          src={
            post.author.avatar ||
            `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(post.author.name)}`
          }
          alt={post.author.name}
          className="w-16 h-16 rounded-2xl object-cover ring-4 ring-slate-800"
        />
        <div className="text-center sm:text-left space-y-1">
          <div className="flex items-center justify-center sm:justify-start gap-2">
            <h4 className="font-bold text-base text-white">{post.author.name}</h4>
            <span className="text-[10px] font-semibold bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded-full">
              Post Author
            </span>
          </div>
          <p className="text-xs text-slate-400">{post.author.email}</p>
          <p className="text-xs text-slate-300 leading-relaxed pt-1">
            Author and contributor on DevScribe. Passionate about software engineering, scalable architectures, and developer education.
          </p>
          <div className="pt-2">
            <button
              onClick={() => onNavigateProfile(post.author._id)}
              className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 underline"
            >
              View profile and all articles →
            </button>
          </div>
        </div>
      </div>

      {/* Comments Section */}
      <CommentSection
        postId={post._id}
        postAuthorId={post.author._id}
        onNavigateLogin={onNavigateLogin}
      />

      {/* Related Posts */}
      {relatedPosts.length > 0 && (
        <section className="pt-10 border-t border-slate-200">
          <h3 className="text-lg font-bold text-slate-900 mb-6">
            More in {post.category}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {relatedPosts.map((rp) => (
              <div
                key={rp._id}
                onClick={() => onSelectPost(rp._id)}
                className="group p-4 bg-white rounded-2xl border border-slate-200/80 hover:border-indigo-300 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <span className="text-[10px] font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
                    {rp.category}
                  </span>
                  <h4 className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors mt-2 line-clamp-2">
                    {rp.title}
                  </h4>
                </div>
                <div className="text-[11px] text-slate-400 pt-3 mt-3 border-t border-slate-100 flex items-center justify-between">
                  <span>{rp.author.name}</span>
                  <span>{rp.readTime || 4} min</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Post Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        title="Delete Blog Post"
        message="Are you sure you want to permanently delete this article? All comments and metadata associated with this post will also be deleted."
        confirmLabel="Yes, Delete Post"
        isDeleting={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setIsDeleteModalOpen(false)}
      />
    </article>
  );
};
