import React, { useState, useEffect } from 'react';
import { appointmentApi } from '../../api/appointmentApi';
import StatusBadge from '../../components/common/StatusBadge';
import AppointmentSlipModal from '../../components/appointment/AppointmentSlipModal';
import RescheduleModal from '../../components/appointment/RescheduleModal';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { formatDate, formatTime, formatCurrency } from '../../utils/formatters';
import toast from 'react-hot-toast';
import {
  Calendar,
  Clock,
  MapPin,
  FileText,
  RotateCcw,
  XCircle,
  MessageSquare,
  AlertCircle
} from 'lucide-react';

const PatientAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');

  const [selectedSlipAppointment, setSelectedSlipAppointment] = useState(null);
  const [selectedRescheduleAppt, setSelectedRescheduleAppt] = useState(null);

  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [apptToCancel, setApptToCancel] = useState(null);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelling, setCancelling] = useState(false);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const res = await appointmentApi.getMyAppointments();
      setAppointments(res.data);
    } catch (err) {
      toast.error('Failed to load appointments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const handleOpenCancelModal = (appt) => {
    setApptToCancel(appt);
    setCancelReason('Patient scheduling conflict');
    setCancelModalOpen(true);
  };

  const handleConfirmCancel = async () => {
    if (!apptToCancel) return;
    setCancelling(true);
    try {
      await appointmentApi.cancelAppointment(apptToCancel._id, {
        reason: cancelReason,
      });
      toast.success('Appointment cancelled. Cancellation SMS notification sent.');
      setCancelModalOpen(false);
      setApptToCancel(null);
      fetchAppointments();
    } catch (err) {
      toast.error(err.message || 'Failed to cancel appointment');
    } finally {
      setCancelling(false);
    }
  };

  const filteredAppointments = appointments.filter((app) => {
    if (activeTab === 'upcoming') {
      return ['confirmed', 'pending', 'rescheduled'].includes(app.status);
    }
    if (activeTab === 'completed') {
      return app.status === 'completed';
    }
    if (activeTab === 'cancelled') {
      return app.status === 'cancelled';
    }
    return true;
  });

  return (
    <div className="space-y-6 p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-cyan-600 block mb-1">
            Consultation History
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            My Hospital Appointments
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            View booking details, print official medical passes, and reschedule or cancel visits.
          </p>
        </div>

        {/* Tab Filters */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1.5 rounded-lg transition ${
              activeTab === 'all' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All ({appointments.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('upcoming')}
            className={`px-3 py-1.5 rounded-lg transition ${
              activeTab === 'upcoming' ? 'bg-white text-cyan-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Upcoming
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('completed')}
            className={`px-3 py-1.5 rounded-lg transition ${
              activeTab === 'completed' ? 'bg-white text-purple-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Completed
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('cancelled')}
            className={`px-3 py-1.5 rounded-lg transition ${
              activeTab === 'cancelled' ? 'bg-white text-rose-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Cancelled
          </button>
        </div>
      </div>

      {/* Appointments List */}
      {loading ? (
        <LoadingSpinner text="Retrieving appointment records..." />
      ) : filteredAppointments.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-slate-200">
          <Calendar className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <h3 className="text-sm font-bold text-slate-700">No appointments found</h3>
          <p className="text-xs text-slate-500 mt-1">There are no records matching the selected filter.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredAppointments.map((appt) => {
            const doctorName = appt.doctorId?.userId?.name || appt.doctorId?.name || 'Physician';
            const deptName = appt.departmentId?.name || 'OPD';
            const canRescheduleOrCancel = ['pending', 'confirmed', 'rescheduled'].includes(appt.status);

            return (
              <div
                key={appt._id}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition space-y-4"
              >
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs font-bold text-cyan-700 bg-cyan-50 px-2.5 py-1 rounded-lg border border-cyan-200">
                      {appt.bookingReference}
                    </span>
                    <StatusBadge status={appt.status} />
                  </div>
                  <span className="text-xs text-slate-400">
                    Booked on {new Date(appt.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                  {/* Doctor Info */}
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Doctor</span>
                    <h4 className="text-sm font-bold text-slate-900 mt-0.5">Dr. {doctorName}</h4>
                    <p className="text-slate-500">{deptName}</p>
                  </div>

                  {/* Date & Time */}
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Date & Time</span>
                    <p className="font-bold text-slate-800 mt-0.5 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-cyan-600" />
                      {formatDate(appt.appointmentDate)}
                    </p>
                    <p className="text-slate-500 flex items-center gap-1 mt-0.5">
                      <Clock className="w-3.5 h-3.5 text-cyan-600" />
                      {formatTime(appt.timeSlot?.startTime)} - {formatTime(appt.timeSlot?.endTime)}
                    </p>
                  </div>

                  {/* Room & Fee */}
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Location & Fee</span>
                    <p className="font-semibold text-slate-800 mt-0.5 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-cyan-600" />
                      {appt.doctorId?.roomNumber || 'Clinic Wing'}
                    </p>
                    <p className="text-slate-900 font-bold mt-0.5">Fee: {formatCurrency(appt.consultationFee)}</p>
                  </div>

                  {/* Reason */}
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Reason for Visit</span>
                    <p className="text-slate-600 mt-0.5 line-clamp-2 italic">"{appt.reasonForVisit}"</p>
                  </div>
                </div>

                {/* Prescriptions and Doctor Notes (if completed) */}
                {appt.status === 'completed' && (appt.doctorDiagnosis || appt.prescriptions?.length > 0) && (
                  <div className="p-3.5 rounded-xl bg-purple-50/70 border border-purple-100 space-y-2 text-xs">
                    {appt.doctorDiagnosis && (
                      <div>
                        <span className="font-bold text-purple-900">Diagnosis: </span>
                        <span className="text-purple-800">{appt.doctorDiagnosis}</span>
                      </div>
                    )}
                    {appt.notes && (
                      <div>
                        <span className="font-bold text-purple-900">Clinical Advice: </span>
                        <span className="text-purple-800">{appt.notes}</span>
                      </div>
                    )}
                    {appt.prescriptions?.length > 0 && (
                      <div className="pt-1">
                        <span className="font-bold text-purple-900 block mb-1">Prescription Medicines:</span>
                        <div className="flex flex-wrap gap-2">
                          {appt.prescriptions.map((p, i) => (
                            <span key={i} className="px-2 py-1 bg-white rounded border border-purple-200 text-purple-900 font-medium">
                              {p.medicineName} ({p.dosage}) - {p.frequency} [{p.duration}]
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Actions Footer */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100">
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                    <span>SMS alerts sent: {appt.smsDeliveryStatus?.confirmationSent ? 'Confirmation ✓' : ''} {appt.smsDeliveryStatus?.reminderSent ? '• Reminder ✓' : ''}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedSlipAppointment(appt)}
                      className="px-3 py-1.5 rounded-xl border border-slate-200 hover:border-cyan-400 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition"
                    >
                      <FileText className="w-3.5 h-3.5 text-cyan-600" />
                      <span>Print Slip</span>
                    </button>

                    {canRescheduleOrCancel && (
                      <>
                        <button
                          type="button"
                          onClick={() => setSelectedRescheduleAppt(appt)}
                          className="px-3 py-1.5 rounded-xl bg-cyan-50 hover:bg-cyan-100 text-cyan-700 text-xs font-bold flex items-center gap-1.5 border border-cyan-200 transition"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>Reschedule</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleOpenCancelModal(appt)}
                          className="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold flex items-center gap-1.5 border border-rose-200 transition"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Cancel</span>
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

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

      {/* Cancel Confirmation Modal */}
      {cancelModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full border border-slate-200 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-slate-900">Cancel Appointment?</h3>
            <p className="text-xs text-slate-600">
              Are you sure you want to cancel appointment{' '}
              <span className="font-mono font-bold text-cyan-700">#{apptToCancel?.bookingReference}</span>?
              An automated cancellation SMS will be dispatched to your registered phone number.
            </p>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Reason for Cancellation</label>
              <textarea
                rows={2}
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                className="w-full text-xs rounded-xl border border-slate-300 p-2.5"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setCancelModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 text-xs font-semibold"
              >
                Keep Booking
              </button>
              <button
                type="button"
                disabled={cancelling}
                onClick={handleConfirmCancel}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition disabled:opacity-50"
              >
                {cancelling ? 'Cancelling...' : 'Confirm Cancellation'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientAppointments;
