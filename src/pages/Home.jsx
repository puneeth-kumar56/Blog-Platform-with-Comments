import React, { useState, useEffect } from 'react';
import {
  Search,
  SlidersHorizontal,
  PlusCircle,
  X,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';
import { postsApi } from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { BlogCard } from '../components/BlogCard.jsx';
import { LoadingSpinner } from '../components/LoadingSpinner.jsx';
import { EmptyState } from '../components/EmptyState.jsx';
import { DeleteConfirmModal } from '../components/DeleteConfirmModal.jsx';

export const Home = ({
  onSelectPost,
  onNavigateCreate,
  onEditPost,
}) => {
  const { isAuthenticated } = useAuth();
  const [postsData, setPostsData] = useState({
    success: true,
    posts: [],
    totalPosts: 0,
    totalPages: 1,
    currentPage: 1,
    categories: ['All'],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sort, setSort] = useState('newest');
  const [currentPage, setCurrentPage] = useState(1);
  const [error, setError] = useState(null);

  // Deletion modal state
  const [deleteModalState, setDeleteModalState] = useState({
    isOpen: false,
    postId: null,
    isDeleting: false,
  });

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setCurrentPage(1);
    }, 300);
    return () => clearTimeout(handler);
  }, [search]);

  // Fetch posts when filters change
  const fetchPosts = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await postsApi.getPosts({
        search: debouncedSearch,
        category: selectedCategory === 'All' ? '' : selectedCategory,
        sort,
        page: currentPage,
        limit: 6,
      });
      if (res.success) {
        setPostsData(res);
      }
    } catch (err) {
      console.error('[Home] Error loading posts:', err);
      setError(err.message || 'Failed to load posts.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [debouncedSearch, selectedCategory, sort, currentPage]);

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
      fetchPosts();
    } catch (err) {
      alert(err.message || 'Failed to delete post.');
      setDeleteModalState((prev) => ({ ...prev, isDeleting: false }));
    }
  };

  return (
    <div className="space-y-10">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-linear-to-br from-indigo-900 via-indigo-800 to-slate-900 text-white p-8 sm:p-12 md:p-16 shadow-xl">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-80 h-80 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />
        <div className="relative max-w-2xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-xs font-semibold text-indigo-200">
            <TrendingUp className="w-3.5 h-3.5 text-indigo-300" />
            Engineering & Technology Articles
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
            Share ideas. Build together. Learn in public.
          </h1>
          <p className="text-base sm:text-lg text-indigo-100/90 leading-relaxed max-w-xl">
            A collaborative developer hub for deep dives, architectural design patterns, and engineering insights.
          </p>
          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              onClick={onNavigateCreate}
              className="inline-flex items-center gap-2 px-5 py-3 bg-white text-indigo-900 hover:bg-indigo-50 active:scale-95 text-sm font-bold rounded-xl shadow-lg transition-all"
            >
              <PlusCircle className="w-4 h-4 text-indigo-600" />
              Write an Article
            </button>
            <button
              onClick={() => {
                const el = document.getElementById('explore-section');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="px-5 py-3 bg-white/10 hover:bg-white/20 text-white text-sm font-semibold rounded-xl backdrop-blur-sm transition-all"
            >
              Browse Articles
            </button>
          </div>
        </div>
      </section>

      {/* Explore Section */}
      <section id="explore-section" className="space-y-6">
        {/* Search & Filter Bar */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search articles by title, keywords, or content..."
                className="w-full pl-10 pr-9 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none transition-all"
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-2 shrink-0">
              <SlidersHorizontal className="w-4 h-4 text-slate-400 shrink-0" />
              <select
                value={sort}
                onChange={(e) => {
                  setSort(e.target.value);
                  setCurrentPage(1);
                }}
                className="text-sm bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 font-medium text-slate-700 focus:outline-none focus:border-indigo-500"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="popular">Most Liked</option>
              </select>
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 no-scrollbar">
            {postsData.categories.map((cat) => (
              <button
                key={cat}
                onClick={() => {
                  setSelectedCategory(cat);
                  setCurrentPage(1);
                }}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedCategory === cat
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70 hover:text-slate-900'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Results Header */}
        <div className="flex items-center justify-between text-xs text-slate-500 font-medium px-1">
          <span>
            Showing <strong className="text-slate-800">{postsData.posts.length}</strong> of{' '}
            <strong className="text-slate-800">{postsData.totalPosts}</strong> posts
            {selectedCategory !== 'All' && ` in ${selectedCategory}`}
            {debouncedSearch && ` matching "${debouncedSearch}"`}
          </span>
          {postsData.totalPages > 1 && (
            <span>
              Page {postsData.currentPage} of {postsData.totalPages}
            </span>
          )}
        </div>

        {/* Error message */}
        {error && (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-sm">
            {error}
          </div>
        )}

        {/* Posts Grid */}
        {isLoading ? (
          <LoadingSpinner message="Fetching blog posts..." size="lg" />
        ) : postsData.posts.length === 0 ? (
          <EmptyState
            title="No posts found"
            description={
              search || selectedCategory !== 'All'
                ? 'Try adjusting your search criteria or selecting a different category.'
                : 'No articles have been published yet. Be the first to share an article!'
            }
            actionText={
              search || selectedCategory !== 'All'
                ? 'Clear Filters'
                : 'Write First Post'
            }
            onAction={() => {
              if (search || selectedCategory !== 'All') {
                setSearch('');
                setSelectedCategory('All');
              } else {
                onNavigateCreate();
              }
            }}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {postsData.posts.map((post) => (
              <BlogCard
                key={post._id}
                post={post}
                onSelect={onSelectPost}
                onEdit={onEditPost}
                onDelete={handleDeleteClick}
              />
            ))}
          </div>
        )}

        {/* Pagination Controls */}
        {postsData.totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 pt-8">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1 || isLoading}
              className="p-2 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              title="Previous page"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            {Array.from({ length: postsData.totalPages }, (_, i) => i + 1).map((pageNum) => (
              <button
                key={pageNum}
                onClick={() => setCurrentPage(pageNum)}
                className={`w-9 h-9 rounded-xl text-xs font-bold transition-all ${
                  currentPage === pageNum
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'border border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                {pageNum}
              </button>
            ))}

            <button
              onClick={() => setCurrentPage((p) => Math.min(postsData.totalPages, p + 1))}
              disabled={currentPage === postsData.totalPages || isLoading}
              className="p-2 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              title="Next page"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}
      </section>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={deleteModalState.isOpen}
        title="Delete Blog Post"
        message="Are you sure you want to permanently delete this post? This will also remove all comments associated with this post."
        confirmLabel="Yes, Delete Post"
        isDeleting={deleteModalState.isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteModalState({ isOpen: false, postId: null, isDeleting: false })}
      />
    </div>
  );
};
