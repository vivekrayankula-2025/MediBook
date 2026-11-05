import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminApi } from '../../api/adminApi';
import MetricCard from '../../components/admin/MetricCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { formatCurrency } from '../../utils/formatters';
import {
  Users,
  Stethoscope,
  Calendar,
  DollarSign,
  MessageSquare,
  CheckCircle2,
  Clock,
  Building2,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  Send
} from 'lucide-react';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminApi
      .getStats()
      .then((res) => setStats(res.data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="p-8 max-w-7xl mx-auto">
        <LoadingSpinner text="Aggregating hospital analytics & SMS gateway metrics..." />
      </div>
    );
  }

  const { metrics, smsAnalytics, departmentBreakdown } = stats || {};

  return (
    <div className="space-y-8 p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-purple-600 block mb-1">
            Hospital Administration & Governance
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            MediBook Central Analytics Dashboard
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time hospital operations overview, patient registrations, appointments, revenue, and SMS gateway delivery tracking.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/admin/doctors"
            className="px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-xs shadow-sm transition"
          >
            Manage Doctors
          </Link>
          <Link
            to="/admin/sms-logs"
            className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-sm transition flex items-center gap-1.5"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>SMS Audit Trail</span>
          </Link>
        </div>
      </div>

      {/* Core Hospital Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <MetricCard
          title="Total Registered Patients"
          value={metrics?.totalPatients || 0}
          subtitle="Hospital outpatient database"
          icon={Users}
          color="cyan"
        />

        <MetricCard
          title="Active Doctors"
          value={metrics?.totalDoctors || 0}
          subtitle="Across all departments"
          icon={Stethoscope}
          color="purple"
        />

        <MetricCard
          title="Total Appointments"
          value={metrics?.totalAppointments || 0}
          subtitle={`${metrics?.todayAppointments || 0} scheduled for today`}
          icon={Calendar}
          color="emerald"
        />

        <MetricCard
          title="Gross Consultation Fees"
          value={formatCurrency(metrics?.totalRevenue || 0)}
          subtitle="Confirmed & completed bookings"
          icon={DollarSign}
          color="amber"
        />
      </div>

      {/* SMS Gateway Delivery Performance Analytics */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 text-white shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center border border-cyan-500/30">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-white">SMS Notification Gateway Performance</h3>
              <p className="text-xs text-slate-400">
                Live delivery tracking, automated reminders, and consent compliance metrics
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-950/60 border border-emerald-800 px-3 py-1 rounded-full flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Gateway Engine Operational</span>
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
          <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total SMS Logs</span>
            <span className="text-2xl font-extrabold text-white mt-1 block">
              {smsAnalytics?.totalSMSLogs || 0}
            </span>
            <span className="text-[11px] text-slate-400">All outbound alerts</span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Delivered / Sent</span>
            <span className="text-2xl font-extrabold text-emerald-400 mt-1 block">
              {smsAnalytics?.deliveredSMSLogs || 0}
            </span>
            <span className="text-[11px] text-emerald-300">Carrier confirmed</span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Failed Dispatch</span>
            <span className="text-2xl font-extrabold text-rose-400 mt-1 block">
              {smsAnalytics?.failedSMSLogs || 0}
            </span>
            <span className="text-[11px] text-rose-300">Auto-retry queue active</span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Opted Out</span>
            <span className="text-2xl font-extrabold text-amber-400 mt-1 block">
              {smsAnalytics?.optedOutSMSLogs || 0}
            </span>
            <span className="text-[11px] text-amber-300">TCPA honored</span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Delivery Rate</span>
            <span className="text-2xl font-extrabold text-cyan-400 mt-1 block">
              {smsAnalytics?.deliveryRate || 100}%
            </span>
            <span className="text-[11px] text-cyan-300">Success ratio</span>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <Link
            to="/admin/sms-logs"
            className="text-xs font-bold text-cyan-400 hover:text-cyan-300 flex items-center gap-1.5 transition"
          >
            <span>Open SMS Log Explorer & Retry Center</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Department Breakdown */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-base font-bold text-slate-900">Department Patient Load</h3>
            <p className="text-xs text-slate-400">Total appointments booked by hospital specialty</p>
          </div>
          <Link
            to="/admin/departments"
            className="text-xs font-bold text-cyan-600 hover:text-cyan-700 flex items-center gap-1"
          >
            <span>Manage Departments</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {departmentBreakdown?.map((dept) => (
            <div
              key={dept._id}
              className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between"
            >
              <div>
                <span className="font-bold text-slate-900 text-sm block">{dept.name}</span>
                <span className="text-[11px] font-mono font-bold text-cyan-700">{dept.code}</span>
              </div>
              <span className="text-base font-extrabold text-slate-800 bg-white px-3 py-1 rounded-xl border border-slate-200">
                {dept.count} Bookings
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
