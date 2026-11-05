import React from 'react';
import Modal from '../common/Modal';
import { formatDate, formatTime, formatCurrency } from '../../utils/formatters';
import { HeartPulse, Printer, CheckCircle, MapPin, Calendar, Clock, User, Phone, ShieldCheck } from 'lucide-react';

const AppointmentSlipModal = ({ isOpen, onClose, appointment }) => {
  if (!appointment) return null;

  const handlePrint = () => {
    window.print();
  };

  const doctorName = appointment.doctorId?.userId?.name || appointment.doctorId?.name || 'Physician';
  const patientName = appointment.patientId?.name || 'Patient';
  const departmentName = appointment.departmentId?.name || 'General OPD';

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Appointment Pass & Medical Slip" maxWidth="max-w-2xl">
      <div className="space-y-6">
        {/* Printable Area */}
        <div id="printable-slip" className="p-6 bg-white border-2 border-dashed border-slate-300 rounded-2xl space-y-6">
          {/* Slip Header */}
          <div className="flex items-center justify-between border-b border-slate-200 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-cyan-600 text-white flex items-center justify-center">
                <HeartPulse className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900 tracking-tight">MediBook Central Hospital</h3>
                <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Official Outpatient Pass</p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Reference No.</span>
              <span className="text-sm font-mono font-bold text-cyan-700 bg-cyan-50 px-2.5 py-1 rounded-lg border border-cyan-200 inline-block">
                {appointment.bookingReference}
              </span>
            </div>
          </div>

          {/* Core Info Grid */}
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Patient Name</span>
              <p className="font-bold text-slate-800 text-sm">{patientName}</p>
              <p className="text-slate-500">Phone: {appointment.patientId?.phone || 'Registered'}</p>
            </div>

            <div className="space-y-1 text-right">
              <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Consulting Specialist</span>
              <p className="font-bold text-slate-800 text-sm">Dr. {doctorName}</p>
              <p className="text-slate-500">{departmentName}</p>
            </div>
          </div>

          {/* Schedule & Location Box */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 grid grid-cols-3 gap-3 text-xs">
            <div>
              <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider block">Date</span>
              <span className="font-semibold text-slate-800 flex items-center gap-1 mt-0.5">
                <Calendar className="w-3.5 h-3.5 text-cyan-600" />
                {formatDate(appointment.appointmentDate)}
              </span>
            </div>

            <div>
              <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider block">Slot Time</span>
              <span className="font-semibold text-slate-800 flex items-center gap-1 mt-0.5">
                <Clock className="w-3.5 h-3.5 text-cyan-600" />
                {formatTime(appointment.timeSlot?.startTime)} - {formatTime(appointment.timeSlot?.endTime)}
              </span>
            </div>

            <div>
              <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider block">Clinic Room</span>
              <span className="font-semibold text-slate-800 flex items-center gap-1 mt-0.5">
                <MapPin className="w-3.5 h-3.5 text-cyan-600" />
                {appointment.doctorId?.roomNumber || 'Main OPD Desk'}
              </span>
            </div>
          </div>

          {/* Reason & Financials */}
          <div className="text-xs space-y-2 border-t border-slate-100 pt-3">
            <div className="flex justify-between">
              <span className="text-slate-500">Reason for Consultation:</span>
              <span className="font-semibold text-slate-800 max-w-[60%] text-right">{appointment.reasonForVisit}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Consultation Fee:</span>
              <span className="font-bold text-slate-900">{formatCurrency(appointment.consultationFee)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Payment Status:</span>
              <span className="font-semibold uppercase text-emerald-600">{appointment.paymentStatus || 'Pending'}</span>
            </div>
          </div>

          {/* Footer Guidelines */}
          <div className="border-t border-slate-200 pt-3 flex items-center justify-between text-[11px] text-slate-500">
            <span>Please arrive 15 minutes prior to slot. Present this pass at reception.</span>
            <div className="flex items-center gap-1 font-semibold text-emerald-600">
              <ShieldCheck className="w-4 h-4" />
              <span>Verified System Pass</span>
            </div>
          </div>
        </div>

        {/* Modal Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-semibold text-xs hover:bg-slate-100"
          >
            Close
          </button>
          <button
            type="button"
            onClick={handlePrint}
            className="px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-xs flex items-center gap-2 shadow-md shadow-cyan-600/30 transition"
          >
            <Printer className="w-4 h-4" />
            <span>Print / Save as PDF</span>
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default AppointmentSlipModal;
