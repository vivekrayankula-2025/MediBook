import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { appointmentApi } from '../../api/appointmentApi';
import MetricCard from '../../components/admin/MetricCard';
import StatusBadge from '../../components/common/StatusBadge';
import AppointmentSlipModal from '../../components/appointment/AppointmentSlipModal';
import RescheduleModal from '../../components/appointment/RescheduleModal';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { formatDate, formatTime, formatCurrency } from '../../utils/formatters';
import {
  Calendar,
  Clock,
  MessageSquare,
  FileText,
  RotateCcw,
  CheckCircle,
  Plus,
  ArrowRight,
  ShieldCheck,
  Building,
  User
} from 'lucide-react';

const PatientDashboard = () => {
  const { user, toggleSMSConsent } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSlipAppointment, setSelectedSlipAppointment] = useState(null);
  const [selectedRescheduleAppt, setSelectedRescheduleAppt] = useState(null);
  const [consentLoading, setConsentLoading] = useState(false);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const res = await appointmentApi.getMyAppointments();
      setAppointments(res.data);
    } catch (err) {
      console.error('Failed to load appointments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const upcomingAppointments = appointments.filter(
    (a) => a.status === 'confirmed' || a.status === 'pending' || a.status === 'rescheduled'
  );

  const completedCount = appointments.filter((a) => a.status === 'completed').length;
  const nextAppointment = upcomingAppointments[0];

  const handleConsentToggle = async () => {
    setConsentLoading(true);
    try {
      await toggleSMSConsent(!user?.smsConsent);
    } finally {
      setConsentLoading(false);
    }
  };

  return (
    <div className="space-y-8 p-6 max-w-7xl mx-auto">
      {/* Welcome Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-cyan-600 to-blue-700 text-white shadow-lg shadow-cyan-900/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-bold backdrop-blur-sm">
            <User className="w-3.5 h-3.5" />
            <span>Patient Healthcare Portal</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Welcome back, {user?.name}!
          </h1>
          <p className="text-xs sm:text-sm text-cyan-100 max-w-xl">
            Track your hospital visits, review specialist e-prescriptions, and manage SMS notification preferences.
          </p>
        </div>

        <Link
          to="/doctors"
          className="px-5 py-3 rounded-2xl bg-white text-cyan-800 font-extrabold text-xs shadow-md hover:bg-cyan-50 transition flex items-center gap-2 shrink-0"
        >
          <Plus className="w-4 h-4 text-cyan-600" />
          <span>Book New Consultation</span>
        </Link>
      </div>

      {/* Top Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <MetricCard
          title="Upcoming Appointments"
          value={upcomingAppointments.length}
          subtitle="Scheduled outpatient visits"
          icon={Calendar}
          color="cyan"
        />

        <MetricCard
          title="Completed Consultations"
          value={completedCount}
          subtitle="Past hospital visits & prescriptions"
          icon={CheckCircle}
          color="purple"
        />

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">SMS Notification Status</span>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-emerald-50 text-emerald-600">
              <MessageSquare className="w-5 h-5" />
            </div>
          </div>

          <div className="my-2">
            <span className="text-base font-extrabold text-slate-800 flex items-center gap-2">
              <span className={`w-3 h-3 rounded-full ${user?.smsConsent ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
              {user?.smsConsent ? 'SMS Alerts Active' : 'SMS Opted Out'}
            </span>
            <p className="text-xs text-slate-500 mt-0.5">
              {user?.smsConsent
                ? `Alerts dispatched to ${user?.phone}`
                : 'You have opted out of SMS messages.'}
            </p>
          </div>

          <button
            type="button"
            disabled={consentLoading}
            onClick={handleConsentToggle}
            className={`w-full py-2 px-3 rounded-xl text-xs font-bold transition border ${
              user?.smsConsent
                ? 'bg-slate-100 text-slate-700 hover:bg-slate-200 border-slate-200'
                : 'bg-emerald-600 text-white hover:bg-emerald-700 border-emerald-600'
            }`}
          >
            {consentLoading
              ? 'Updating...'
              : user?.smsConsent
              ? 'Opt-Out of SMS'
              : 'Opt-In to SMS Notifications'}
          </button>
        </div>
      </div>

      {/* Next Upcoming Appointment Highlight */}
      {nextAppointment && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-cyan-600 flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-cyan-600" />
              Next Scheduled Appointment
            </span>
            <StatusBadge status={nextAppointment.status} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Doctor</span>
              <h4 className="text-sm font-bold text-slate-900 mt-0.5">
                Dr. {nextAppointment.doctorId?.userId?.name || nextAppointment.doctorId?.name || 'Physician'}
              </h4>
              <p className="text-xs text-slate-500">{nextAppointment.departmentId?.name}</p>
            </div>

            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Date & Slot</span>
              <p className="text-xs font-bold text-slate-800 mt-0.5">
                {formatDate(nextAppointment.appointmentDate)}
              </p>
              <p className="text-xs text-slate-500">
                {formatTime(nextAppointment.timeSlot?.startTime)} - {formatTime(nextAppointment.timeSlot?.endTime)}
              </p>
            </div>

            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Location / Room</span>
              <p className="text-xs font-bold text-slate-800 mt-0.5">
                {nextAppointment.doctorId?.roomNumber || 'OPD Desk'}
              </p>
              <p className="text-xs text-slate-500 font-mono">Ref: {nextAppointment.bookingReference}</p>
            </div>

            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setSelectedSlipAppointment(nextAppointment)}
                className="px-3 py-2 rounded-xl border border-slate-200 hover:border-cyan-400 hover:bg-cyan-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition"
              >
                <FileText className="w-3.5 h-3.5 text-cyan-600" />
                <span>View Slip</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedRescheduleAppt(nextAppointment)}
                className="px-3 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-bold flex items-center gap-1.5 transition"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reschedule</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Recent Appointments Table */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-800">Recent Appointments</h3>
          <Link
            to="/patient/appointments"
            className="text-xs font-bold text-cyan-600 hover:text-cyan-700 flex items-center gap-1"
          >
            <span>View All Records</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <LoadingSpinner text="Fetching appointment history..." />
        ) : appointments.length === 0 ? (
          <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-100">
            <Calendar className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-xs text-slate-500">You haven't booked any hospital appointments yet.</p>
            <Link
              to="/doctors"
              className="mt-3 inline-block px-4 py-2 rounded-xl bg-cyan-600 text-white text-xs font-bold"
            >
              Book Your First Appointment
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 border-b border-slate-200 text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                <tr>
                  <th className="py-3 px-4">Booking Ref</th>
                  <th className="py-3 px-4">Doctor & Department</th>
                  <th className="py-3 px-4">Date & Time</th>
                  <th className="py-3 px-4">Fee</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Pass</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {appointments.slice(0, 5).map((app) => (
                  <tr key={app._id} className="hover:bg-slate-50/60 transition">
                    <td className="py-3 px-4 font-mono font-bold text-cyan-700">
                      {app.bookingReference}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-800">
                        Dr. {app.doctorId?.userId?.name || app.doctorId?.name || 'Doctor'}
                      </div>
                      <div className="text-[11px] text-slate-400">{app.departmentId?.name}</div>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="font-semibold text-slate-800">{formatDate(app.appointmentDate)}</div>
                      <div className="text-[11px] text-slate-400">
                        {formatTime(app.timeSlot?.startTime)} - {formatTime(app.timeSlot?.endTime)}
                      </div>
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-900">
                      {formatCurrency(app.consultationFee)}
                    </td>
                    <td className="py-3 px-4">
                      <StatusBadge status={app.status} />
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => setSelectedSlipAppointment(app)}
                        className="text-xs font-bold text-cyan-600 hover:text-cyan-700 hover:underline"
                      >
                        View Slip
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Slip Modal */}
      <AppointmentSlipModal
        isOpen={!!selectedSlipAppointment}
        onClose={() => setSelectedSlipAppointment(null)}
        appointment={selectedSlipAppointment}
      />

      {/* Reschedule Modal */}
      <RescheduleModal
        isOpen={!!selectedRescheduleAppt}
        onClose={() => setSelectedRescheduleAppt(null)}
        appointment={selectedRescheduleAppt}
        onSuccess={fetchAppointments}
      />
    </div>
  );
};

export default PatientDashboard;
