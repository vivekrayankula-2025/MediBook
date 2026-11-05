import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { HeartPulse, Mail, Lock, LogIn, Sparkles, AlertCircle } from 'lucide-react';

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const user = await login(email, password);
      if (user.role === 'admin') {
        navigate('/admin/dashboard');
      } else if (user.role === 'doctor') {
        navigate('/doctor/dashboard');
      } else {
        navigate('/patient/dashboard');
      }
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setSubmitting(false);
    }
  };

  // Demo auto-fill helper
  const handleQuickFill = (demoEmail, demoPass) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setError('');
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 sm:p-10 rounded-3xl border border-slate-200 shadow-xl shadow-slate-900/5">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-cyan-600 text-white shadow-md shadow-cyan-600/30 mb-2">
            <HeartPulse className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Sign In to MediBook</h2>
          <p className="text-xs text-slate-500">
            Access your patient appointments, doctor schedule, or administrative console
          </p>
        </div>

        {/* Demo Account Quick-Fill Buttons */}
        <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2">
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-cyan-600" />
            <span>One-Click Demo Evaluator Logins:</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleQuickFill('patient.john@example.com', 'Patient@123')}
              className="py-1.5 px-2 rounded-lg bg-white border border-slate-200 text-[11px] font-bold text-slate-700 hover:border-cyan-400 hover:text-cyan-600 transition shadow-xs text-center"
            >
              Patient
            </button>
            <button
              type="button"
              onClick={() => handleQuickFill('dr.jenkins@medibook.com', 'Doctor@123')}
              className="py-1.5 px-2 rounded-lg bg-white border border-slate-200 text-[11px] font-bold text-slate-700 hover:border-cyan-400 hover:text-cyan-600 transition shadow-xs text-center"
            >
              Doctor
            </button>
            <button
              type="button"
              onClick={() => handleQuickFill('admin@medibook.com', 'Admin@123')}
              className="py-1.5 px-2 rounded-lg bg-white border border-slate-200 text-[11px] font-bold text-slate-700 hover:border-cyan-400 hover:text-cyan-600 transition shadow-xs text-center"
            >
              Admin
            </button>
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full text-xs rounded-xl border border-slate-300 pl-10 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full text-xs rounded-xl border border-slate-300 pl-10 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white font-bold text-xs shadow-md shadow-cyan-600/30 transition disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <LogIn className="w-4 h-4" />
            <span>{submitting ? 'Authenticating...' : 'Sign In'}</span>
          </button>
        </form>

        {/* Register link */}
        <div className="text-center pt-2 border-t border-slate-100">
          <p className="text-xs text-slate-500">
            Don't have an account yet?{' '}
            <Link to="/register" className="font-bold text-cyan-600 hover:text-cyan-700 underline">
              Create Patient Account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
