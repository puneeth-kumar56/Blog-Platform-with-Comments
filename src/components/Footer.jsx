import React from 'react';
import { PenTool, Database, Server, Laptop, ShieldCheck } from 'lucide-react';

export const Footer = ({ onNavigate }) => {
  return (
    <footer className="bg-slate-900 text-slate-400 text-sm mt-20 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          {/* Brand Info */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2.5 text-white">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
                <PenTool className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-lg text-white">DevScribe</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-mono">
                v1.0.0
              </span>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed max-w-md">
              A comprehensive MERN stack blogging platform engineered with clean architectural
              separation, secure JWT authentication, cascading document deletion, and responsive UI.
            </p>
            <div className="flex flex-wrap items-center gap-3 pt-2 text-xs text-slate-300">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-800 border border-slate-700">
                <Database className="w-3.5 h-3.5 text-emerald-400" />
                MongoDB
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-800 border border-slate-700">
                <Server className="w-3.5 h-3.5 text-indigo-400" />
                Express.js
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-800 border border-slate-700">
                <Laptop className="w-3.5 h-3.5 text-blue-400" />
                React 19 + Vite
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-800 border border-slate-700">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                JWT & Bcrypt
              </span>
            </div>
          </div>

          {/* Platform Links */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-3">
              Platform
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={() => onNavigate('home')}
                  className="hover:text-white transition-colors"
                >
                  Explore Articles
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('create-post')}
                  className="hover:text-white transition-colors"
                >
                  Write New Post
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('my-posts')}
                  className="hover:text-white transition-colors"
                >
                  Manage My Articles
                </button>
              </li>
            </ul>
          </div>

          {/* Documentation & Developer Resources */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-3">
              Developer Guide
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={() => onNavigate('docs')}
                  className="hover:text-white transition-colors"
                >
                  API Endpoints & Schemas
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('docs')}
                  className="hover:text-white transition-colors"
                >
                  Windows & VS Code Setup
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('docs')}
                  className="hover:text-white transition-colors"
                >
                  Testing Checklist
                </button>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© 2026 DevScribe Blog Platform. Full-Stack MERN Application.</p>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              REST API Online
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
