import React, { useState, useEffect } from 'react';
import { doctorApi } from '../../api/doctorApi';
import { appointmentApi } from '../../api/appointmentApi';
import StatusBadge from '../../components/common/StatusBadge';
import ConsultationModal from '../../components/doctor/ConsultationModal';
import RescheduleModal from '../../components/appointment/RescheduleModal';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { formatDate, formatTime, formatCurrency } from '../../utils/formatters';
import toast from 'react-hot-toast';
import {
  Calendar,
  Clock,
  User,
  Pill,
  CheckCircle,
  RotateCcw,
  XCircle,
  Filter,
  MessageSquare
} from 'lucide-react';

const DoctorAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterDate, setFilterDate] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  const [selectedConsultationAppt, setSelectedConsultationAppt] = useState(null);
  const [selectedRescheduleAppt, setSelectedRescheduleAppt] = useState(null);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const res = await doctorApi.getDoctorAppointments({
        date: filterDate || undefined,
        status: filterStatus || undefined,
      });
      setAppointments(res.data);
    } catch (err) {
      toast.error('Failed to load appointments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, [filterDate, filterStatus]);

  const handleApprove = async (id) => {
    try {
      await appointmentApi.approveAppointment(id);
      toast.success('Appointment confirmed! Confirmation SMS dispatched to patient.');
      fetchAppointments();
    } catch (err) {
      toast.error(err.message || 'Failed to approve appointment');
    }
  };

  const handleCancel = async (id) => {
    const reason = window.prompt('Please enter cancellation reason (will be sent in SMS alert):', 'Doctor emergency schedule conflict');
    if (!reason) return;

    try {
      await appointmentApi.cancelAppointment(id, { reason });
      toast.success('Appointment cancelled. Cancellation SMS dispatched.');
      fetchAppointments();
    } catch (err) {
      toast.error(err.message || 'Failed to cancel appointment');
    }
  };

  return (
    <div className="space-y-6 p-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-cyan-600 block mb-1">
            Doctor Clinic Records
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Patient Appointments & Consultations
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Filter by consultation date or booking status, confirm pending slots, and record medical diagnoses and prescriptions.
          </p>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <input
            type="date"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            className="text-xs rounded-xl border border-slate-300 p-2 bg-white"
          />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="text-xs rounded-xl border border-slate-300 p-2 bg-white"
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="completed">Completed</option>
            <option value="rescheduled">Rescheduled</option>
            <option value="cancelled">Cancelled</option>
          </select>
          {(filterDate || filterStatus) && (
            <button
              type="button"
              onClick={() => {
                setFilterDate('');
                setFilterStatus('');
              }}
              className="text-xs text-slate-500 hover:text-slate-800 font-semibold underline"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Appointments List */}
      {loading ? (
        <LoadingSpinner text="Querying appointment records..." />
      ) : appointments.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-slate-200">
          <Calendar className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <h3 className="text-sm font-bold text-slate-700">No appointments found</h3>
          <p className="text-xs text-slate-500 mt-1">Try adjusting the date or status filter.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {appointments.map((appt) => (
            <div
              key={appt._id}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition space-y-4"
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs font-bold text-cyan-700 bg-cyan-50 px-2.5 py-1 rounded-lg border border-cyan-200">
                    {appt.bookingReference}
                  </span>
                  <StatusBadge status={appt.status} />
                </div>
                <span className="text-xs text-slate-400">
                  Registered Mobile: <span className="font-mono font-bold text-slate-700">{appt.patientId?.phone}</span>
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Patient</span>
                  <h4 className="text-sm font-bold text-slate-900 mt-0.5">{appt.patientId?.name}</h4>
                  <p className="text-slate-500">
                    Age: {appt.patientId?.age || 'N/A'} • Blood: {appt.patientId?.bloodGroup || 'N/A'} • {appt.patientId?.gender || 'N/A'}
                  </p>
                </div>

                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Scheduled Slot</span>
                  <p className="font-bold text-slate-800 mt-0.5 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-cyan-600" />
                    {formatDate(appt.appointmentDate)}
                  </p>
                  <p className="text-slate-500 flex items-center gap-1 mt-0.5">
                    <Clock className="w-3.5 h-3.5 text-cyan-600" />
                    {formatTime(appt.timeSlot?.startTime)} - {formatTime(appt.timeSlot?.endTime)}
                  </p>
                </div>

                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Visit Reason</span>
                  <p className="text-slate-700 mt-0.5 line-clamp-2 italic">"{appt.reasonForVisit}"</p>
                </div>

                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Payment</span>
                  <p className="font-bold text-slate-900 mt-0.5">{formatCurrency(appt.consultationFee)}</p>
                  <span className="text-[10px] uppercase font-semibold text-slate-500">{appt.paymentMethod}</span>
                </div>
              </div>

              {/* Diagnosis / Prescriptions Summary if completed */}
              {appt.status === 'completed' && appt.doctorDiagnosis && (
                <div className="p-3 rounded-xl bg-purple-50/60 border border-purple-100 text-xs text-purple-900 space-y-1">
                  <div><span className="font-bold">Diagnosis: </span>{appt.doctorDiagnosis}</div>
                  {appt.prescriptions?.length > 0 && (
                    <div className="text-[11px] text-purple-800">
                      Prescribed: {appt.prescriptions.map(p => `${p.medicineName} (${p.dosage})`).join(', ')}
                    </div>
                  )}
                </div>
              )}

              {/* Actions Footer */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100">
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                  <span>SMS confirmation sent</span>
                </div>

                <div className="flex items-center gap-2">
                  {appt.status === 'pending' && (
                    <button
                      type="button"
                      onClick={() => handleApprove(appt._id)}
                      className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1 shadow-sm transition"
                    >
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>Approve & Send SMS</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => setSelectedConsultationAppt(appt)}
                    className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition"
                  >
                    <Pill className="w-3.5 h-3.5" />
                    <span>{appt.status === 'completed' ? 'Edit Prescription' : 'Start Consultation & Prescribe'}</span>
                  </button>

                  {appt.status !== 'completed' && appt.status !== 'cancelled' && (
                    <>
                      <button
                        type="button"
                        onClick={() => setSelectedRescheduleAppt(appt)}
                        className="px-3 py-1.5 rounded-xl border border-slate-200 text-slate-700 font-semibold text-xs hover:bg-slate-50 transition"
                      >
                        Reschedule
                      </button>
                      <button
                        type="button"
                        onClick={() => handleCancel(appt._id)}
                        className="px-3 py-1.5 rounded-xl text-rose-600 hover:bg-rose-50 font-semibold text-xs transition"
                      >
                        Cancel
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Consultation Modal */}
      <ConsultationModal
        isOpen={!!selectedConsultationAppt}
        onClose={() => setSelectedConsultationAppt(null)}
        appointment={selectedConsultationAppt}
        onSuccess={fetchAppointments}
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

export default DoctorAppointments;
