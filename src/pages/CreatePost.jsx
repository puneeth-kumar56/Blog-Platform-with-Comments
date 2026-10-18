import React, { useState } from 'react';
import {
  PenLine,
  Image as ImageIcon,
  Layers,
  Tag,
  ArrowLeft,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import { postsApi } from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';

const PRESET_CATEGORIES = [
  'Web Development',
  'Technology',
  'Design',
  'AI & Machine Learning',
  'DevOps & Cloud',
  'Architecture',
  'Career & Productivity',
];

const PRESET_IMAGES = [
  {
    label: 'Code Workspace',
    url: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=1200&auto=format&fit=crop&q=80',
  },
  {
    label: 'Modern Laptop',
    url: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1200&auto=format&fit=crop&q=80',
  },
  {
    label: 'Creative Design',
    url: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=1200&auto=format&fit=crop&q=80',
  },
  {
    label: 'Data Center',
    url: 'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=1200&auto=format&fit=crop&q=80',
  },
  {
    label: 'Security & Tech',
    url: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=1200&auto=format&fit=crop&q=80',
  },
];

export const CreatePost = ({
  onSuccess,
  onCancel,
  onNavigateLogin,
}) => {
  const { isAuthenticated, user } = useAuth();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('Web Development');
  const [customCategory, setCustomCategory] = useState('');
  const [coverImage, setCoverImage] = useState(PRESET_IMAGES[0].url);
  const [tags, setTags] = useState('MERN, React, Express, MongoDB');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  if (!isAuthenticated || !user) {
    return (
      <div className="max-w-xl mx-auto my-12 p-8 bg-white rounded-3xl border border-slate-200 shadow-md text-center space-y-4">
        <div className="w-14 h-14 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mx-auto">
          <AlertCircle className="w-7 h-7" />
        </div>
        <h2 className="text-xl font-bold text-slate-800">Authentication Required</h2>
        <p className="text-sm text-slate-500 max-w-md mx-auto">
          You must be logged in to create and publish blog posts. Please sign in or create an account.
        </p>
        <div className="pt-2 flex justify-center gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
          >
            Cancel
          </button>
          <button
            onClick={onNavigateLogin}
            className="px-5 py-2.5 bg-indigo-600 text-white text-xs font-bold rounded-xl hover:bg-indigo-700 shadow-sm"
          >
            Log In Now
          </button>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();

    const finalCategory = category === 'Custom' ? customCategory.trim() : category;

    if (!title.trim() || title.trim().length < 5) {
      setError('Title must be at least 5 characters.');
      return;
    }

    if (!content.trim() || content.trim().length < 20) {
      setError('Content must be at least 20 characters long.');
      return;
    }

    if (!finalCategory) {
      setError('Please provide a category for your post.');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      const res = await postsApi.createPost({
        title: title.trim(),
        content: content.trim(),
        category: finalCategory,
        coverImage: coverImage.trim() || undefined,
        tags: tags.split(',').map((t) => t.trim()).filter(Boolean),
      });

      if (res.success && res.post) {
        onSuccess(res.post._id);
      }
    } catch (err) {
      setError(err.message || 'Failed to create post.');
    } finally {
      setIsSubmitting(false);
    }
  };

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
        <span className="text-xs text-slate-400 font-medium">
          Writing as: <strong className="text-slate-800">{user.name}</strong>
        </span>
      </div>

      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-sm space-y-6">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <PenLine className="w-6 h-6 text-indigo-600" />
            Create New Blog Post
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Fill in the details below to publish your article on the DevScribe platform.
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
              placeholder="e.g. Architecting Scalable REST APIs with Node.js and Express"
              className="w-full text-base font-semibold px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none transition-all"
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
          <div className="space-y-3">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <ImageIcon className="w-3.5 h-3.5 text-indigo-500" />
              Cover Image URL (Optional)
            </label>
            <input
              type="url"
              value={coverImage}
              onChange={(e) => setCoverImage(e.target.value)}
              placeholder="https://images.unsplash.com/..."
              className="w-full text-xs font-mono px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-500 focus:outline-none"
            />
            {/* Quick Unsplash Preset Buttons */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] text-slate-400 font-medium">Presets:</span>
              {PRESET_IMAGES.map((img) => (
                <button
                  type="button"
                  key={img.label}
                  onClick={() => setCoverImage(img.url)}
                  className={`text-[11px] px-2.5 py-1 rounded-lg border transition-colors ${
                    coverImage === img.url
                      ? 'bg-indigo-50 border-indigo-200 text-indigo-700 font-semibold'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {img.label}
                </button>
              ))}
            </div>

            {/* Live Preview */}
            {coverImage && (
              <div className="relative h-36 rounded-2xl overflow-hidden border border-slate-200 bg-slate-100">
                <img
                  src={coverImage}
                  alt="Cover preview"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
                <span className="absolute bottom-2 right-2 px-2 py-0.5 bg-black/60 backdrop-blur-xs text-white text-[10px] rounded-md">
                  Preview
                </span>
              </div>
            )}
          </div>

          {/* Content */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                Article Content <span className="text-rose-500">*</span>
              </label>
              <span className="text-[11px] text-slate-400">
                {content.split(/\s+/).filter(Boolean).length} words
              </span>
            </div>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={10}
              placeholder="Write your article here. You can include headers (###), bullet points, and code snippets..."
              className="w-full text-sm p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none transition-all resize-y leading-relaxed"
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
              placeholder="e.g. MERN, JavaScript, WebDev, Backend"
              className="w-full text-xs px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-500 focus:outline-none"
            />
          </div>

          {/* Buttons */}
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
                  Publishing Post...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Publish Post
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
