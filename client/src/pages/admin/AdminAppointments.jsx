import React, { useState, useEffect } from 'react';
import { adminApi } from '../../api/adminApi';
import StatusBadge from '../../components/common/StatusBadge';
import AppointmentSlipModal from '../../components/appointment/AppointmentSlipModal';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { formatDate, formatTime, formatCurrency } from '../../utils/formatters';
import { Calendar, Clock, Search, FileText, Filter, MessageSquare } from 'lucide-react';

const AdminAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [selectedSlipAppointment, setSelectedSlipAppointment] = useState(null);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const res = await adminApi.getAllAppointments({
        status: filterStatus || undefined,
        date: filterDate || undefined,
      });
      setAppointments(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, [filterStatus, filterDate]);

  return (
    <div className="space-y-6 p-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-purple-600 block mb-1">
            Master Hospital Schedule
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            All Hospital Bookings & Consultations
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Supervise all outpatient bookings, audit SMS notification dispatch status, and inspect printable medical passes.
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

      {loading ? (
        <LoadingSpinner text="Retrieving hospital appointments..." />
      ) : appointments.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-slate-200">
          <Calendar className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <h3 className="text-sm font-bold text-slate-700">No appointments found</h3>
          <p className="text-xs text-slate-500 mt-1">Try resetting the filter options.</p>
        </div>
      ) : (
        <div className="overflow-x-auto bg-white rounded-2xl border border-slate-200 shadow-sm">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 border-b border-slate-200 text-[10px] uppercase font-bold text-slate-400 tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Booking Ref</th>
                <th className="py-3.5 px-4">Patient</th>
                <th className="py-3.5 px-4">Doctor & Department</th>
                <th className="py-3.5 px-4">Date & Slot</th>
                <th className="py-3.5 px-4">Fee / Payment</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Pass / Slip</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {appointments.map((appt) => (
                <tr key={appt._id} className="hover:bg-slate-50/60 transition">
                  <td className="py-3.5 px-4 font-mono font-bold text-cyan-700">
                    {appt.bookingReference}
                  </td>

                  <td className="py-3.5 px-4">
                    <div className="font-bold text-slate-900">{appt.patientId?.name}</div>
                    <div className="font-mono text-[11px] text-slate-500">{appt.patientId?.phone}</div>
                  </td>

                  <td className="py-3.5 px-4">
                    <div className="font-bold text-slate-800">
                      Dr. {appt.doctorId?.userId?.name || appt.doctorId?.name}
                    </div>
                    <div className="text-[11px] text-slate-400">{appt.departmentId?.name}</div>
                  </td>

                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <div className="font-semibold text-slate-800">{formatDate(appt.appointmentDate)}</div>
                    <div className="text-[11px] text-slate-400">
                      {formatTime(appt.timeSlot?.startTime)} - {formatTime(appt.timeSlot?.endTime)}
                    </div>
                  </td>

                  <td className="py-3.5 px-4">
                    <div className="font-bold text-slate-900">{formatCurrency(appt.consultationFee)}</div>
                    <span className="text-[10px] font-semibold uppercase text-emerald-600">
                      {appt.paymentMethod}
                    </span>
                  </td>

                  <td className="py-3.5 px-4">
                    <StatusBadge status={appt.status} />
                  </td>

                  <td className="py-3.5 px-4 text-right whitespace-nowrap">
                    <button
                      type="button"
                      onClick={() => setSelectedSlipAppointment(appt)}
                      className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs inline-flex items-center gap-1 transition"
                    >
                      <FileText className="w-3 h-3 text-cyan-600" />
                      <span>Slip</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Slip Modal */}
      <AppointmentSlipModal
        isOpen={!!selectedSlipAppointment}
        onClose={() => setSelectedSlipAppointment(null)}
        appointment={selectedSlipAppointment}
      />
    </div>
  );
};

export default AdminAppointments;
