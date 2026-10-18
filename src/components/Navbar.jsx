import React, { useState } from 'react';
import {
  PenTool,
  PlusCircle,
  BookOpen,
  User as UserIcon,
  LogOut,
  Terminal,
  Code2,
  ChevronDown,
  Layers,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';

export const Navbar = ({
  currentView,
  onNavigate,
  systemStatus,
}) => {
  const { user, isAuthenticated, logout, loginDemo } = useAuth();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isDemoMenuOpen, setIsDemoMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand */}
        <div
          onClick={() => onNavigate('home')}
          className="flex items-center gap-3 cursor-pointer group shrink-0"
        >
          <div className="w-10 h-10 rounded-xl bg-linear-to-tr from-indigo-600 to-violet-600 text-white flex items-center justify-center shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
            <PenTool className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-slate-900 text-lg tracking-tight">
                DevScribe
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-100">
                MERN
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium hidden sm:block">
              Full-Stack Publishing Platform
            </p>
          </div>
        </div>

        {/* Center Nav items */}
        <nav className="hidden md:flex items-center gap-1">
          <button
            onClick={() => onNavigate('home')}
            className={`px-3 py-1.5 text-sm font-semibold rounded-lg transition-colors ${
              currentView === 'home'
                ? 'text-indigo-600 bg-indigo-50/70'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
            }`}
          >
            Explore
          </button>

          {isAuthenticated && (
            <button
              onClick={() => onNavigate('my-posts')}
              className={`px-3 py-1.5 text-sm font-semibold rounded-lg transition-colors ${
                currentView === 'my-posts'
                  ? 'text-indigo-600 bg-indigo-50/70'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
            }`}
          >
            My Posts
          </button>
        )}

          <button
            onClick={() => onNavigate('docs')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold rounded-lg transition-colors ${
              currentView === 'docs'
                ? 'text-indigo-600 bg-indigo-50/70'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
            }`}
          >
            <Terminal className="w-4 h-4 text-indigo-500" />
            API & Setup
          </button>
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-2.5">
          {/* Quick Demo Switcher */}
          <div className="relative">
            <button
              onClick={() => {
                setIsDemoMenuOpen(!isDemoMenuOpen);
                setIsUserMenuOpen(false);
              }}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200/80 rounded-lg transition-colors"
              title="Fast login with pre-configured accounts"
            >
              <Layers className="w-3.5 h-3.5 text-indigo-600" />
              <span className="hidden sm:inline">Demo Users</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {isDemoMenuOpen && (
              <div
                className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-slate-100 p-2 z-50 animate-in fade-in zoom-in-95"
                onMouseLeave={() => setIsDemoMenuOpen(false)}
              >
                <div className="px-3 py-1.5 border-b border-slate-100 mb-1">
                  <p className="text-xs font-bold text-slate-800">Switch Demo Account</p>
                  <p className="text-[11px] text-slate-400">Click to instantly test multi-user permissions</p>
                </div>

                <button
                  onClick={async () => {
                    await loginDemo('alex');
                    setIsDemoMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 text-xs rounded-lg hover:bg-slate-50 flex items-center justify-between group"
                >
                  <div>
                    <p className="font-semibold text-slate-800">Alex Rivera</p>
                    <p className="text-[10px] text-slate-400">alex@example.com (Author)</p>
                  </div>
                  <span className="text-[10px] bg-indigo-50 text-indigo-600 px-1.5 py-0.5 rounded font-mono">
                    Login
                  </span>
                </button>

                <button
                  onClick={async () => {
                    await loginDemo('sarah');
                    setIsDemoMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 text-xs rounded-lg hover:bg-slate-50 flex items-center justify-between group"
                >
                  <div>
                    <p className="font-semibold text-slate-800">Sarah Chen</p>
                    <p className="text-[10px] text-slate-400">sarah@example.com (Author)</p>
                  </div>
                  <span className="text-[10px] bg-indigo-50 text-indigo-600 px-1.5 py-0.5 rounded font-mono">
                    Login
                  </span>
                </button>

                <button
                  onClick={async () => {
                    await loginDemo('marcus');
                    setIsDemoMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 text-xs rounded-lg hover:bg-slate-50 flex items-center justify-between group"
                >
                  <div>
                    <p className="font-semibold text-slate-800">Marcus Vance</p>
                    <p className="text-[10px] text-slate-400">marcus@example.com (Author)</p>
                  </div>
                  <span className="text-[10px] bg-indigo-50 text-indigo-600 px-1.5 py-0.5 rounded font-mono">
                    Login
                  </span>
                </button>
              </div>
            )}
          </div>

          {/* Create Post Button */}
          <button
            onClick={() => onNavigate('create-post')}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white text-xs font-bold rounded-xl shadow-xs transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            <span className="hidden sm:inline">Write Post</span>
          </button>

          {/* User Profile or Auth Buttons */}
          {isAuthenticated && user ? (
            <div className="relative">
              <button
                onClick={() => {
                  setIsUserMenuOpen(!isUserMenuOpen);
                  setIsDemoMenuOpen(false);
                }}
                className="flex items-center gap-2 p-1 rounded-xl hover:bg-slate-100 transition-colors"
              >
                <img
                  src={
                    user.avatar ||
                    `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user.name)}`
                  }
                  alt={user.name}
                  className="w-8 h-8 rounded-full object-cover ring-2 ring-indigo-500/20"
                />
                <span className="text-xs font-bold text-slate-800 hidden md:block max-w-[100px] truncate">
                  {user.name.split(' ')[0]}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {isUserMenuOpen && (
                <div
                  className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 p-2 z-50 animate-in fade-in"
                  onMouseLeave={() => setIsUserMenuOpen(false)}
                >
                  <div className="px-3 py-2 border-b border-slate-100 mb-1">
                    <p className="text-xs font-bold text-slate-900 truncate">{user.name}</p>
                    <p className="text-[11px] text-slate-400 truncate">{user.email}</p>
                  </div>

                  <button
                    onClick={() => {
                      onNavigate('profile', user._id);
                      setIsUserMenuOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 rounded-xl flex items-center gap-2"
                  >
                    <UserIcon className="w-4 h-4 text-slate-400" />
                    My Profile
                  </button>

                  <button
                    onClick={() => {
                      onNavigate('my-posts');
                      setIsUserMenuOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 rounded-xl flex items-center gap-2"
                  >
                    <BookOpen className="w-4 h-4 text-slate-400" />
                    Manage My Posts
                  </button>

                  <button
                    onClick={() => {
                      onNavigate('docs');
                      setIsUserMenuOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 rounded-xl flex items-center gap-2"
                  >
                    <Code2 className="w-4 h-4 text-slate-400" />
                    API Documentation
                  </button>

                  <div className="border-t border-slate-100 my-1"></div>

                  <button
                    onClick={() => {
                      logout();
                      setIsUserMenuOpen(false);
                      onNavigate('home');
                    }}
                    className="w-full text-left px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-xl flex items-center gap-2"
                  >
                    <LogOut className="w-4 h-4 text-rose-500" />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => onNavigate('login')}
                className="px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
              >
                Log In
              </button>
              <button
                onClick={() => onNavigate('register')}
                className="px-3 py-1.5 text-xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100/80 rounded-lg transition-colors"
              >
                Register
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
