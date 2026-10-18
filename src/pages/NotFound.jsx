import React from 'react';
import { Home, Compass } from 'lucide-react';

export const NotFound = ({ onNavigateHome }) => {
  return (
    <div className="max-w-md mx-auto my-16 text-center p-8 bg-white rounded-3xl border border-slate-200 shadow-sm space-y-6">
      <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-3xl flex items-center justify-center mx-auto ring-8 ring-indigo-50/50">
        <Compass className="w-8 h-8" />
      </div>
      <div>
        <span className="text-4xl font-black text-indigo-600">404</span>
        <h2 className="text-xl font-extrabold text-slate-900 mt-2">
          Page Not Found
        </h2>
        <p className="text-sm text-slate-500 mt-1 max-w-xs mx-auto">
          The page or article you are looking for doesn't exist or has been moved.
        </p>
      </div>
      <button
        onClick={onNavigateHome}
        className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white text-xs font-bold rounded-xl shadow-sm transition-all"
      >
        <Home className="w-4 h-4" />
        Return to Home Page
      </button>
    </div>
  );
};
