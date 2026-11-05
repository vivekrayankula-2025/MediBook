import React, { useState } from 'react';
import Modal from '../common/Modal';
import { appointmentApi } from '../../api/appointmentApi';
import { formatCurrency, formatTime, formatDate } from '../../utils/formatters';
import { useAuth } from '../../hooks/useAuth';
import toast from 'react-hot-toast';
import {
  Calendar,
  Clock,
  User,
  CreditCard,
  MessageSquare,
  Building,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

const BookingModal = ({ isOpen, onClose, doctor, selectedDate, selectedSlot, onSuccess }) => {
  const { user } = useAuth();
  const [reasonForVisit, setReasonForVisit] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('pay_at_clinic');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!doctor || !selectedSlot) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!reasonForVisit.trim()) {
      setError('Please provide a reason for the hospital visit.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const res = await appointmentApi.bookAppointment({
        doctorId: doctor._id,
        appointmentDate: selectedDate,
        timeSlot: selectedSlot,
        reasonForVisit,
        paymentMethod,
        notes,
      });

      toast.success('Appointment booked successfully! SMS confirmation dispatched.');
      if (onSuccess) onSuccess(res.data);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to book appointment. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Confirm Hospital Appointment" maxWidth="max-w-xl">
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Doctor Summary Banner */}
        <div className="p-4 rounded-2xl bg-cyan-50/70 border border-cyan-100 flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-cyan-600 text-white font-bold text-lg flex items-center justify-center shrink-0">
            {doctor.userId?.name ? doctor.userId.name.charAt(0) : 'D'}
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-base font-bold text-slate-800">{doctor.userId?.name}</h4>
            <p className="text-xs text-cyan-800 font-medium">{doctor.specialization}</p>
            <div className="flex items-center gap-3 mt-1.5 text-xs text-slate-500">
              <span className="flex items-center gap-1">
                <Building className="w-3.5 h-3.5 text-slate-400" />
                {doctor.roomNumber}
              </span>
              <span>•</span>
              <span className="font-bold text-slate-700">Fee: {formatCurrency(doctor.consultationFee)}</span>
            </div>
          </div>
        </div>

        {/* Selected Slot Information */}
        <div className="grid grid-cols-2 gap-3 p-3.5 bg-slate-50 rounded-xl border border-slate-200">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Appointment Date
            </span>
            <span className="text-xs font-semibold text-slate-800 flex items-center gap-1.5 mt-0.5">
              <Calendar className="w-4 h-4 text-cyan-600" />
              {formatDate(selectedDate)}
            </span>
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Time Slot
            </span>
            <span className="text-xs font-semibold text-slate-800 flex items-center gap-1.5 mt-0.5">
              <Clock className="w-4 h-4 text-cyan-600" />
              {formatTime(selectedSlot.startTime)} - {formatTime(selectedSlot.endTime)}
            </span>
          </div>
        </div>

        {/* SMS Notification Banner */}
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 flex items-start gap-3">
          <MessageSquare className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <div className="text-xs text-emerald-800">
            <span className="font-bold block">Instant SMS Confirmation</span>
            An SMS confirmation with your booking reference will be sent immediately to{' '}
            <span className="font-semibold underline">{user?.phone || 'your registered mobile number'}</span>.
          </div>
        </div>

        {/* Reason for Visit */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Reason for Consultation <span className="text-rose-500">*</span>
          </label>
          <textarea
            required
            rows={2}
            value={reasonForVisit}
            onChange={(e) => setReasonForVisit(e.target.value)}
            placeholder="e.g. Follow-up consultation for blood pressure, chest discomfort, or routine check..."
            className="w-full text-xs rounded-xl border border-slate-300 p-3 focus:outline-none focus:ring-2 focus:ring-cyan-500"
          />
        </div>

        {/* Payment Method */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Payment Preference
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label
              className={`flex items-center gap-2.5 p-3 rounded-xl border cursor-pointer text-xs transition ${
                paymentMethod === 'pay_at_clinic'
                  ? 'bg-cyan-50 border-cyan-500 text-cyan-900 font-semibold'
                  : 'bg-white border-slate-200 text-slate-700'
              }`}
            >
              <input
                type="radio"
                name="paymentMethod"
                value="pay_at_clinic"
                checked={paymentMethod === 'pay_at_clinic'}
                onChange={() => setPaymentMethod('pay_at_clinic')}
                className="text-cyan-600 focus:ring-cyan-500"
              />
              <span>Pay at Hospital Desk</span>
            </label>

            <label
              className={`flex items-center gap-2.5 p-3 rounded-xl border cursor-pointer text-xs transition ${
                paymentMethod === 'online_card'
                  ? 'bg-cyan-50 border-cyan-500 text-cyan-900 font-semibold'
                  : 'bg-white border-slate-200 text-slate-700'
              }`}
            >
              <input
                type="radio"
                name="paymentMethod"
                value="online_card"
                checked={paymentMethod === 'online_card'}
                onChange={() => setPaymentMethod('online_card')}
                className="text-cyan-600 focus:ring-cyan-500"
              />
              <span>Online Card / UPI (Demo)</span>
            </label>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-semibold text-xs hover:bg-slate-100 transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-bold text-xs shadow-md shadow-cyan-600/30 hover:from-cyan-700 hover:to-blue-700 transition disabled:opacity-50"
          >
            {submitting ? 'Reserving Slot & Sending SMS...' : 'Confirm & Book Appointment'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default BookingModal;
