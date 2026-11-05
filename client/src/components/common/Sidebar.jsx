import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import {
  LayoutDashboard,
  Calendar,
  Clock,
  User,
  Users,
  Stethoscope,
  Building2,
  MessageSquare,
  ShieldCheck,
  CheckCircle,
  FileText
} from 'lucide-react';

const Sidebar = () => {
  const { user, isPatient, isDoctor, isAdmin } = useAuth();

  const patientLinks = [
    { to: '/patient/dashboard', label: 'Overview', icon: LayoutDashboard },
    { to: '/patient/appointments', label: 'My Appointments', icon: Calendar },
    { to: '/doctors', label: 'Book New Appointment', icon: Stethoscope },
    { to: '/patient/profile', label: 'Profile & SMS Consent', icon: User },
  ];

  const doctorLinks = [
    { to: '/doctor/dashboard', label: 'Clinic Overview', icon: LayoutDashboard },
    { to: '/doctor/appointments', label: 'Patient Queue', icon: Calendar },
    { to: '/doctor/schedule', label: 'Manage Schedule', icon: Clock },
    { to: '/patient/profile', label: 'My Profile', icon: User },
  ];

  const adminLinks = [
    { to: '/admin/dashboard', label: 'Analytics Overview', icon: LayoutDashboard },
    { to: '/admin/doctors', label: 'Doctors Management', icon: Stethoscope },
    { to: '/admin/patients', label: 'Patient Directory', icon: Users },
    { to: '/admin/departments', label: 'Hospital Departments', icon: Building2 },
    { to: '/admin/appointments', label: 'All Appointments', icon: Calendar },
    { to: '/admin/sms-logs', label: 'SMS Gateway Audit', icon: MessageSquare },
  ];

  const links = isAdmin ? adminLinks : isDoctor ? doctorLinks : patientLinks;

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col min-h-[calc(100vh-5rem)] shrink-0">
      {/* User Header in Sidebar */}
      <div className="p-6 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-cyan-600 to-blue-600 flex items-center justify-center text-white font-bold text-lg shadow-md shadow-cyan-600/20">
            {user?.name ? user.name.charAt(0) : 'U'}
          </div>
          <div className="overflow-hidden">
            <h4 className="text-sm font-bold text-slate-800 truncate">{user?.name}</h4>
            <span className="inline-block mt-0.5 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-cyan-100 text-cyan-800">
              {user?.role} Portal
            </span>
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="p-4 space-y-1.5 flex-1">
        {links.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to.endsWith('dashboard')}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition ${
                  isActive
                    ? 'bg-cyan-50 text-cyan-700 shadow-sm border border-cyan-100'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`
              }
            >
              <Icon className="w-5 h-5 shrink-0" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Bottom SMS Status Banner */}
      <div className="p-4 m-4 rounded-xl bg-slate-50 border border-slate-200/80">
        <div className="flex items-center gap-2 mb-1 text-xs font-bold text-slate-700">
          <MessageSquare className="w-4 h-4 text-cyan-600" />
          <span>SMS Gateway</span>
        </div>
        <p className="text-[11px] text-slate-500 leading-snug">
          Real-time delivery tracking and scheduled appointment reminders active.
        </p>
      </div>
    </aside>
  );
};

export default Sidebar;
