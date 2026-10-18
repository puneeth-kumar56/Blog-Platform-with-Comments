import React, { useState, useEffect } from 'react';
import {
  Edit3,
  Image as ImageIcon,
  Layers,
  ArrowLeft,
  AlertCircle,
  Save,
  Tag,
} from 'lucide-react';
import { postsApi } from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { LoadingSpinner } from '../components/LoadingSpinner.jsx';

const PRESET_CATEGORIES = [
  'Web Development',
  'Technology',
  'Design',
  'AI & Machine Learning',
  'DevOps & Cloud',
  'Architecture',
  'Career & Productivity',
];

export const EditPost = ({
  postId,
  onSuccess,
  onCancel,
}) => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('Web Development');
  const [customCategory, setCustomCategory] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [tags, setTags] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        setIsLoading(true);
        const res = await postsApi.getPostById(postId);
        if (res.success && res.post) {
          const p = res.post;

          if (user && user._id !== p.author._id) {
            setError('You do not have permission to edit this post.');
            setIsLoading(false);
            return;
          }

          setTitle(p.title);
          setContent(p.content);
          if (PRESET_CATEGORIES.includes(p.category)) {
            setCategory(p.category);
          } else {
            setCategory('Custom');
            setCustomCategory(p.category);
          }
          setCoverImage(p.coverImage || '');
          setTags(p.tags ? p.tags.join(', ') : '');
        }
      } catch (err) {
        setError(err.message || 'Failed to load post.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPost();
  }, [postId, user]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const finalCategory = category === 'Custom' ? customCategory.trim() : category;

    if (!title.trim() || title.trim().length < 5) {
      setError('Title must be at least 5 characters long.');
      return;
    }

    if (!content.trim() || content.trim().length < 20) {
      setError('Content must be at least 20 characters long.');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      const res = await postsApi.updatePost(postId, {
        title: title.trim(),
        content: content.trim(),
        category: finalCategory,
        coverImage: coverImage.trim() || undefined,
        tags: tags.split(',').map((t) => t.trim()).filter(Boolean),
      });

      if (res.success) {
        onSuccess(postId);
      }
    } catch (err) {
      setError(err.message || 'Failed to update post.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <LoadingSpinner message="Loading post for editing..." size="lg" />;
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <button
          onClick={onCancel}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 px-3 py-1.5 rounded-lg hover:bg-slate-100"
        >
          <ArrowLeft className="w-4 h-4" />
          Cancel
        </button>
      </div>

      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-sm space-y-6">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Edit3 className="w-6 h-6 text-indigo-600" />
            Edit Blog Post
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Update your article details and publish the changes.
          </p>
        </div>

        {error && (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 text-xs font-medium flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
              Post Title <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full text-base font-semibold px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:border-indigo-500 focus:outline-none"
              required
            />
          </div>

          {/* Category */}
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-indigo-500" />
              Category <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {PRESET_CATEGORIES.map((cat) => (
                <button
                  type="button"
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={`px-3 py-2 text-xs font-semibold rounded-xl border text-center transition-all ${
                    category === cat
                      ? 'bg-indigo-600 border-indigo-600 text-white shadow-xs'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {cat}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setCategory('Custom')}
                className={`px-3 py-2 text-xs font-semibold rounded-xl border text-center transition-all ${
                  category === 'Custom'
                    ? 'bg-indigo-600 border-indigo-600 text-white shadow-xs'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                + Other
              </button>
            </div>
            {category === 'Custom' && (
              <input
                type="text"
                value={customCategory}
                onChange={(e) => setCustomCategory(e.target.value)}
                placeholder="Enter custom category name..."
                className="w-full mt-2 text-sm px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-500 focus:outline-none"
              />
            )}
          </div>

          {/* Cover Image */}
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <ImageIcon className="w-3.5 h-3.5 text-indigo-500" />
              Cover Image URL
            </label>
            <input
              type="url"
              value={coverImage}
              onChange={(e) => setCoverImage(e.target.value)}
              className="w-full text-xs font-mono px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-500 focus:outline-none"
            />
            {coverImage && (
              <div className="relative h-32 rounded-2xl overflow-hidden border border-slate-200 bg-slate-100">
                <img
                  src={coverImage}
                  alt="Cover preview"
                  className="w-full h-full object-cover"
                />
              </div>
            )}
          </div>

          {/* Content */}
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
              Article Content <span className="text-rose-500">*</span>
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={12}
              className="w-full text-sm p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:border-indigo-500 focus:outline-none resize-y leading-relaxed"
              required
            />
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-indigo-500" />
              Tags (Comma separated)
            </label>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              className="w-full text-xs px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-500 focus:outline-none"
            />
          </div>

          {/* Actions */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onCancel}
              disabled={isSubmitting}
              className="px-5 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 active:scale-95 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-md transition-all"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Saving Changes...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
