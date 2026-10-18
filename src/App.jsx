import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import { Navbar } from './components/Navbar.jsx';
import { Footer } from './components/Footer.jsx';
import { Home } from './pages/Home.jsx';
import { BlogDetails } from './pages/BlogDetails.jsx';
import { CreatePost } from './pages/CreatePost.jsx';
import { EditPost } from './pages/EditPost.jsx';
import { MyPosts } from './pages/MyPosts.jsx';
import { Profile } from './pages/Profile.jsx';
import { Login } from './pages/Login.jsx';
import { Register } from './pages/Register.jsx';
import { NotFound } from './pages/NotFound.jsx';
import { DocsGuide } from './pages/DocsGuide.jsx';
import { systemApi } from './services/api.js';

function AppContent() {
  const { user, isAuthenticated } = useAuth();
  const [currentView, setCurrentView] = useState('home');
  const [selectedPostId, setSelectedPostId] = useState(null);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [systemStatus, setSystemStatus] = useState({
    status: 'online',
    database: 'Ready',
  });

  useEffect(() => {
    const checkSystem = async () => {
      try {
        const data = await systemApi.getHealth();
        setSystemStatus({ status: data.status, database: data.database });
      } catch (err) {
        console.warn('[System] Could not retrieve health status yet:', err);
      }
    };
    checkSystem();
  }, []);

  const navigateTo = (view, param) => {
    window.scrollTo({ top: 0, behavior: 'smooth' });

    if (view === 'blog-details' && param) {
      setSelectedPostId(param);
      setCurrentView('blog-details');
      return;
    }

    if (view === 'edit-post' && param) {
      setSelectedPostId(param);
      setCurrentView('edit-post');
      return;
    }

    if (view === 'profile' && param) {
      setSelectedUserId(param);
      setCurrentView('profile');
      return;
    }

    if ((view === 'create-post' || view === 'my-posts') && !isAuthenticated) {
      setCurrentView('login');
      return;
    }

    setCurrentView(view);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans selection:bg-indigo-500 selection:text-white">
      {/* Top Navbar */}
      <Navbar
        currentView={currentView}
        onNavigate={navigateTo}
        systemStatus={systemStatus}
      />

      {/* Main View Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        {currentView === 'home' && (
          <Home
            onSelectPost={(id) => navigateTo('blog-details', id)}
            onNavigateCreate={() => navigateTo('create-post')}
            onEditPost={(id) => navigateTo('edit-post', id)}
          />
        )}

        {currentView === 'blog-details' && selectedPostId && (
          <BlogDetails
            postId={selectedPostId}
            onBack={() => navigateTo('home')}
            onEdit={(id) => navigateTo('edit-post', id)}
            onSelectPost={(id) => navigateTo('blog-details', id)}
            onNavigateLogin={() => navigateTo('login')}
            onNavigateProfile={(userId) => navigateTo('profile', userId)}
          />
        )}

        {currentView === 'create-post' && (
          <CreatePost
            onSuccess={(newId) => navigateTo('blog-details', newId)}
            onCancel={() => navigateTo('home')}
            onNavigateLogin={() => navigateTo('login')}
          />
        )}

        {currentView === 'edit-post' && selectedPostId && (
          <EditPost
            postId={selectedPostId}
            onSuccess={(updatedId) => navigateTo('blog-details', updatedId)}
            onCancel={() => navigateTo('blog-details', selectedPostId)}
          />
        )}

        {currentView === 'my-posts' && (
          <MyPosts
            onSelectPost={(id) => navigateTo('blog-details', id)}
            onEditPost={(id) => navigateTo('edit-post', id)}
            onNavigateCreate={() => navigateTo('create-post')}
          />
        )}

        {currentView === 'profile' && selectedUserId && (
          <Profile
            userId={selectedUserId}
            onBack={() => navigateTo('home')}
            onSelectPost={(id) => navigateTo('blog-details', id)}
            onEditPost={(id) => navigateTo('edit-post', id)}
          />
        )}

        {currentView === 'login' && (
          <Login
            onSuccess={() => navigateTo('home')}
            onNavigateRegister={() => navigateTo('register')}
          />
        )}

        {currentView === 'register' && (
          <Register
            onSuccess={() => navigateTo('home')}
            onNavigateLogin={() => navigateTo('login')}
          />
        )}

        {currentView === 'docs' && <DocsGuide />}

        {currentView === 'not-found' && (
          <NotFound onNavigateHome={() => navigateTo('home')} />
        )}
      </main>

      {/* Footer */}
      <Footer onNavigate={navigateTo} />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
