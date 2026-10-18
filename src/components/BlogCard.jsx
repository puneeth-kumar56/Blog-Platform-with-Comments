import React from 'react';
import { MessageSquare, Clock, Heart, Edit3, Trash2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';

export const BlogCard = ({
  post,
  onSelect,
  onEdit,
  onDelete,
}) => {
  const { user } = useAuth();
  const isAuthor = Boolean(user && user._id === post.author._id);

  const formattedDate = new Date(post.createdAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const getCategoryColor = (cat) => {
    switch ((cat || '').toLowerCase()) {
      case 'web development':
        return 'bg-blue-50 text-blue-700 border-blue-100';
      case 'technology':
        return 'bg-indigo-50 text-indigo-700 border-indigo-100';
      case 'design':
        return 'bg-emerald-50 text-emerald-700 border-emerald-100';
      case 'ai & machine learning':
        return 'bg-purple-50 text-purple-700 border-purple-100';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <article className="group flex flex-col bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-xl hover:border-indigo-200 transition-all duration-300 overflow-hidden">
      {/* Cover Image */}
      <div
        onClick={() => onSelect(post._id)}
        className="relative h-48 w-full overflow-hidden bg-slate-100 cursor-pointer"
      >
        <img
          src={post.coverImage || 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=800&auto=format&fit=crop&q=80'}
          alt={post.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          onError={(e) => {
            e.target.src =
              'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=800&auto=format&fit=crop&q=80';
          }}
        />
        <div className="absolute top-3 left-3">
          <span
            className={`inline-block px-3 py-1 text-xs font-semibold rounded-full border shadow-xs backdrop-blur-md ${getCategoryColor(
              post.category
            )}`}
          >
            {post.category}
          </span>
        </div>

        {isAuthor && onEdit && onDelete && (
          <div
            className="absolute top-3 right-3 flex items-center gap-1.5 opacity-90 group-hover:opacity-100 transition-opacity"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => onEdit(post._id)}
              className="p-1.5 bg-white/95 hover:bg-white text-slate-700 hover:text-indigo-600 rounded-lg shadow-sm border border-slate-200/60 transition-colors"
              title="Edit post"
            >
              <Edit3 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onDelete(post._id)}
              className="p-1.5 bg-white/95 hover:bg-white text-slate-700 hover:text-rose-600 rounded-lg shadow-sm border border-slate-200/60 transition-colors"
              title="Delete post"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Content Container */}
      <div className="flex flex-col flex-1 p-5">
        <div className="flex items-center gap-3 text-xs text-slate-400 mb-2.5">
          <span>{formattedDate}</span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            {post.readTime || 4} min read
          </span>
        </div>

        <h3
          onClick={() => onSelect(post._id)}
          className="text-lg font-bold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-2 cursor-pointer mb-2 leading-snug"
        >
          {post.title}
        </h3>

        <p className="text-sm text-slate-600 line-clamp-3 mb-4 leading-relaxed flex-1">
          {post.content.replace(/[#*`_\[\]]/g, '')}
        </p>

        {/* Footer: Author & Stats */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-between mt-auto">
          <div className="flex items-center gap-2.5">
            <img
              src={post.author.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(post.author.name)}`}
              alt={post.author.name}
              className="w-8 h-8 rounded-full object-cover ring-2 ring-slate-100"
            />
            <div className="text-xs">
              <p className="font-semibold text-slate-800">{post.author.name}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs text-slate-400 font-medium">
            <span className="flex items-center gap-1 hover:text-rose-500 transition-colors">
              <Heart className="w-3.5 h-3.5" />
              {post.likesCount || 0}
            </span>
            <span className="flex items-center gap-1 hover:text-indigo-600 transition-colors">
              <MessageSquare className="w-3.5 h-3.5" />
              {post.commentsCount || 0}
            </span>
          </div>
        </div>
      </div>
    </article>
  );
};
