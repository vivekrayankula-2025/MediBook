import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import {
  HeartPulse,
  User,
  LogOut,
  Calendar,
  MessageSquare,
  Shield,
  Stethoscope,
  Menu,
  X,
  Bell
} from 'lucide-react';

const Navbar = () => {
  const { user, isAuthenticated, logout, isPatient, isDoctor, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getDashboardPath = () => {
    if (isAdmin) return '/admin/dashboard';
    if (isDoctor) return '/doctor/dashboard';
    return '/patient/dashboard';
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-600 flex items-center justify-center text-white shadow-md shadow-cyan-500/20 group-hover:scale-105 transition">
              <HeartPulse className="w-6 h-6 stroke-[2.2]" />
            </div>
            <div>
              <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-cyan-700 to-blue-800 bg-clip-text text-transparent">
                MediBook
              </span>
              <span className="hidden sm:inline-block ml-1.5 px-1.5 py-0.5 text-[10px] font-bold tracking-wide uppercase bg-cyan-100 text-cyan-800 rounded">
                Smart Hospital
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center space-x-6 text-sm font-semibold text-slate-600">
            <Link to="/" className="hover:text-cyan-600 transition">
              Home
            </Link>
            <Link to="/doctors" className="hover:text-cyan-600 transition flex items-center gap-1">
              <Stethoscope className="w-4 h-4 text-cyan-600" />
              Find Doctors
            </Link>

            {isAuthenticated && (
              <Link
                to={getDashboardPath()}
                className="hover:text-cyan-600 transition flex items-center gap-1"
              >
                {isAdmin && <Shield className="w-4 h-4 text-purple-600" />}
                {isDoctor && <Calendar className="w-4 h-4 text-blue-600" />}
                {isPatient && <Calendar className="w-4 h-4 text-teal-600" />}
                Dashboard
              </Link>
            )}

            {isAdmin && (
              <Link
                to="/admin/sms-logs"
                className="hover:text-cyan-600 transition flex items-center gap-1 text-slate-700"
              >
                <MessageSquare className="w-4 h-4 text-amber-500" />
                SMS Center
              </Link>
            )}
          </nav>

          {/* User Account & Actions */}
          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated ? (
              <div className="flex items-center space-x-3">
                {/* Patient SMS Consent Indicator */}
                {isPatient && (
                  <span
                    title={user?.smsConsent ? 'SMS notifications are active' : 'SMS notifications are opted out'}
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${
                      user?.smsConsent
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    {user?.smsConsent ? 'SMS Alerts On' : 'SMS Opted Out'}
                  </span>
                )}

                {/* User Profile Pill */}
                <Link
                  to={getDashboardPath()}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-800 transition text-sm font-medium"
                >
                  <div className="w-7 h-7 rounded-full bg-cyan-600 text-white flex items-center justify-center font-bold text-xs uppercase">
                    {user?.name ? user.name.charAt(0) : 'U'}
                  </div>
                  <span className="max-w-[120px] truncate">{user?.name}</span>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-slate-200 text-slate-700">
                    {user?.role}
                  </span>
                </Link>

                <button
                  onClick={handleLogout}
                  className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                  title="Sign Out"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  to="/login"
                  className="text-sm font-semibold text-slate-700 hover:text-cyan-600 px-3 py-2 transition"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="text-sm font-semibold text-white bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 px-4 py-2 rounded-xl shadow-sm shadow-cyan-600/30 transition transform hover:-translate-y-0.5"
                >
                  Book Appointment
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 hover:bg-slate-100"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-3">
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg font-medium text-slate-700 hover:bg-slate-100"
          >
            Home
          </Link>
          <Link
            to="/doctors"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg font-medium text-slate-700 hover:bg-slate-100"
          >
            Find Doctors
          </Link>

          {isAuthenticated ? (
            <>
              <Link
                to={getDashboardPath()}
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg font-medium text-cyan-700 bg-cyan-50"
              >
                My Dashboard ({user?.role})
              </Link>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleLogout();
                }}
                className="w-full text-left px-3 py-2 rounded-lg font-medium text-rose-600 hover:bg-rose-50"
              >
                Sign Out
              </button>
            </>
          ) : (
            <div className="pt-2 flex flex-col gap-2">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="text-center w-full py-2 border border-slate-300 rounded-xl font-semibold text-slate-700"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="text-center w-full py-2 bg-cyan-600 text-white rounded-xl font-semibold"
              >
                Register as Patient
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
};

export default Navbar;
