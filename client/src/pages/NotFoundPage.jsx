import React from 'react';
import { Link } from 'react-router-dom';
import { HeartPulse, ArrowLeft } from 'lucide-react';

const NotFoundPage = () => {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center space-y-4">
      <div className="w-16 h-16 rounded-2xl bg-cyan-50 text-cyan-600 flex items-center justify-center font-bold mb-2">
        <HeartPulse className="w-10 h-10" />
      </div>
      <h1 className="text-4xl font-extrabold text-slate-900">404</h1>
      <h2 className="text-lg font-bold text-slate-700">Page Not Found</h2>
      <p className="text-xs text-slate-500 max-w-sm">
        The medical portal page you requested does not exist or has been relocated.
      </p>
      <Link
        to="/"
        className="px-5 py-2.5 rounded-xl bg-cyan-600 text-white font-bold text-xs flex items-center gap-2 hover:bg-cyan-700 transition"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Return to Homepage</span>
      </Link>
    </div>
  );
};

export default NotFoundPage;
