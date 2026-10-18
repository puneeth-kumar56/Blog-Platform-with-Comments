import React, { useState, useEffect } from 'react';
import {
  User as UserIcon,
  Mail,
  Calendar,
  BookOpen,
  ArrowLeft,
} from 'lucide-react';
import { usersApi } from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { BlogCard } from '../components/BlogCard.jsx';
import { LoadingSpinner } from '../components/LoadingSpinner.jsx';
import { EmptyState } from '../components/EmptyState.jsx';

export const Profile = ({
  userId,
  onBack,
  onSelectPost,
  onEditPost,
}) => {
  const { user: currentUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProfileAndPosts = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const [profileRes, postsRes] = await Promise.all([
          usersApi.getUserProfile(userId),
          usersApi.getUserPosts(userId),
        ]);

        if (profileRes.success && profileRes.user) {
          setProfile(profileRes.user);
        }
        if (postsRes.success) {
          setPosts(postsRes.posts);
        }
      } catch (err) {
        console.error('[Profile] Error:', err);
        setError(err.message || 'Failed to load user profile.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfileAndPosts();
  }, [userId]);

  if (isLoading) {
    return <LoadingSpinner message="Loading user profile..." size="lg" />;
  }

  if (error || !profile) {
    return (
      <div className="max-w-xl mx-auto my-12 text-center p-8 bg-white rounded-3xl border border-slate-200">
        <h2 className="text-xl font-bold text-slate-800">Profile Not Found</h2>
        <p className="text-sm text-slate-500 mt-1">{error || 'This user does not exist.'}</p>
        <button
          onClick={onBack}
          className="mt-4 px-4 py-2 bg-indigo-600 text-white text-xs font-bold rounded-xl"
        >
          Go Back
        </button>
      </div>
    );
  }

  const joinDate = new Date(profile.createdAt).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <button
        onClick={onBack}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 px-3 py-1.5 rounded-lg hover:bg-slate-100"
      >
        <ArrowLeft className="w-4 h-4" />
        Back
      </button>

      {/* Profile Header Box */}
      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left">
        <img
          src={
            profile.avatar ||
            `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(profile.name)}`
          }
          alt={profile.name}
          className="w-24 h-24 rounded-2xl object-cover ring-4 ring-indigo-50 shadow-md shrink-0"
        />

        <div className="space-y-2 flex-1">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h1 className="text-2xl font-extrabold text-slate-900">{profile.name}</h1>
              <div className="flex items-center justify-center sm:justify-start gap-2 text-xs text-slate-400 mt-1">
                <Mail className="w-3.5 h-3.5" />
                <span>{profile.email}</span>
                <span>•</span>
                <Calendar className="w-3.5 h-3.5" />
                <span>Member since {joinDate}</span>
              </div>
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 border border-indigo-100 text-indigo-700 rounded-xl text-xs font-bold self-center sm:self-start">
              <BookOpen className="w-3.5 h-3.5" />
              <span>{posts.length} Published Articles</span>
            </div>
          </div>

          <p className="text-sm text-slate-600 leading-relaxed pt-2 max-w-2xl">
            {profile.bio || 'Author on DevScribe writing about software engineering and modern web technologies.'}
          </p>
        </div>
      </div>

      {/* Published Posts by This User */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <span>Articles by {profile.name}</span>
          <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 font-normal">
            {posts.length}
          </span>
        </h2>

        {posts.length === 0 ? (
          <EmptyState
            title="No published articles yet"
            description={`${profile.name} hasn't published any articles on the platform yet.`}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {posts.map((post) => (
              <BlogCard
                key={post._id}
                post={post}
                onSelect={onSelectPost}
                onEdit={onEditPost}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
