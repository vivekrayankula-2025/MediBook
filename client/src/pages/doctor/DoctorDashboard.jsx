import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { doctorApi } from '../../api/doctorApi';
import MetricCard from '../../components/admin/MetricCard';
import StatusBadge from '../../components/common/StatusBadge';
import ConsultationModal from '../../components/doctor/ConsultationModal';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { formatDate, formatTime } from '../../utils/formatters';
import {
  Calendar,
  Clock,
  Users,
  CheckCircle2,
  Stethoscope,
  Pill,
  ArrowRight,
  User
} from 'lucide-react';

const DoctorDashboard = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedConsultationAppt, setSelectedConsultationAppt] = useState(null);

  const fetchDoctorAppointments = async () => {
    setLoading(true);
    try {
      const res = await doctorApi.getDoctorAppointments();
      setAppointments(res.data);
    } catch (err) {
      console.error('Failed to load appointments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctorAppointments();
  }, []);

  const todayStr = new Date().toISOString().split('T')[0];
  const todayAppointments = appointments.filter((a) => a.appointmentDate === todayStr);
  const pendingCount = appointments.filter((a) => a.status === 'pending').length;
  const completedCount = appointments.filter((a) => a.status === 'completed').length;

  return (
    <div className="space-y-8 p-6 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-blue-700 to-indigo-800 text-white shadow-lg shadow-blue-900/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-bold backdrop-blur-sm">
            <Stethoscope className="w-3.5 h-3.5" />
            <span>Doctor Clinical Console</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Dr. {user?.name}
          </h1>
          <p className="text-xs sm:text-sm text-blue-100 max-w-xl">
            Manage your daily patient queue, complete consultations with digital prescriptions, and supervise clinic availability.
          </p>
        </div>

        <Link
          to="/doctor/schedule"
          className="px-5 py-3 rounded-2xl bg-white text-blue-800 font-extrabold text-xs shadow-md hover:bg-blue-50 transition flex items-center gap-2 shrink-0"
        >
          <Clock className="w-4 h-4 text-blue-600" />
          <span>Manage Working Shifts</span>
        </Link>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-5">
        <MetricCard
          title="Today's Patient Queue"
          value={todayAppointments.length}
          subtitle="Scheduled visits for today"
          icon={Calendar}
          color="cyan"
        />

        <MetricCard
          title="Total Hospital Bookings"
          value={appointments.length}
          subtitle="Across all dates"
          icon={Users}
          color="purple"
        />

        <MetricCard
          title="Pending Confirmations"
          value={pendingCount}
          subtitle="Awaiting doctor review"
          icon={Clock}
          color="amber"
        />

        <MetricCard
          title="Completed Consultations"
          value={completedCount}
          subtitle="Recorded clinical notes"
          icon={CheckCircle2}
          color="emerald"
        />
      </div>

      {/* Today's Queue Section */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-base font-bold text-slate-800">Today's Appointment Queue</h3>
            <p className="text-xs text-slate-400">Patients scheduled for today ({formatDate(todayStr)})</p>
          </div>
          <Link
            to="/doctor/appointments"
            className="text-xs font-bold text-cyan-600 hover:text-cyan-700 flex items-center gap-1"
          >
            <span>Full Appointment Master List</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <LoadingSpinner text="Fetching clinical queue..." />
        ) : todayAppointments.length === 0 ? (
          <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-100">
            <Clock className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-xs text-slate-500 font-medium">No patient visits scheduled for today.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 border-b border-slate-200 text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                <tr>
                  <th className="py-3 px-4">Time Slot</th>
                  <th className="py-3 px-4">Patient</th>
                  <th className="py-3 px-4">Phone / SMS Status</th>
                  <th className="py-3 px-4">Reason for Visit</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {todayAppointments.map((app) => (
                  <tr key={app._id} className="hover:bg-slate-50/60 transition">
                    <td className="py-3 px-4 font-bold text-slate-800 whitespace-nowrap">
                      {formatTime(app.timeSlot?.startTime)} - {formatTime(app.timeSlot?.endTime)}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900">{app.patientId?.name}</div>
                      <div className="text-[11px] text-slate-400">
                        Age: {app.patientId?.age || 'N/A'} • Blood: {app.patientId?.bloodGroup || 'N/A'}
                      </div>
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-600 whitespace-nowrap">
                      {app.patientId?.phone}
                    </td>
                    <td className="py-3 px-4 max-w-xs truncate italic">
                      "{app.reasonForVisit}"
                    </td>
                    <td className="py-3 px-4">
                      <StatusBadge status={app.status} />
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => setSelectedConsultationAppt(app)}
                        className="px-3 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold text-xs border border-purple-200 inline-flex items-center gap-1.5 transition"
                      >
                        <Pill className="w-3.5 h-3.5" />
                        <span>{app.status === 'completed' ? 'Edit Rx' : 'Consult & Prescribe'}</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Consultation Modal */}
      <ConsultationModal
        isOpen={!!selectedConsultationAppt}
        onClose={() => setSelectedConsultationAppt(null)}
        appointment={selectedConsultationAppt}
        onSuccess={fetchDoctorAppointments}
      />
    </div>
  );
};

export default DoctorDashboard;
