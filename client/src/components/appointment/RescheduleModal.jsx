import React, { useState } from 'react';
import Modal from '../common/Modal';
import SlotPicker from './SlotPicker';
import { appointmentApi } from '../../api/appointmentApi';
import { formatDate, formatTime } from '../../utils/formatters';
import toast from 'react-hot-toast';
import { AlertCircle, Calendar, Clock, MessageSquare } from 'lucide-react';

const RescheduleModal = ({ isOpen, onClose, appointment, onSuccess }) => {
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!appointment) return null;

  const doctorId = appointment.doctorId?._id || appointment.doctorId;

  const handleReschedule = async () => {
    if (!selectedSlot) {
      setError('Please select an available time slot.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      await appointmentApi.rescheduleAppointment(appointment._id, {
        newDate: selectedDate,
        newTimeSlot: selectedSlot,
        reason: 'Patient requested schedule adjustment',
      });

      toast.success('Appointment rescheduled successfully! SMS update sent.');
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to reschedule appointment');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Reschedule Appointment" maxWidth="max-w-xl">
      <div className="space-y-5">
        {/* Current appointment info */}
        <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600">
          <span className="font-bold text-slate-800 block mb-1">
            Current Appointment: Ref #{appointment.bookingReference}
          </span>
          <div className="flex items-center gap-3">
            <span>Date: {formatDate(appointment.appointmentDate)}</span>
            <span>•</span>
            <span>
              Time: {formatTime(appointment.timeSlot?.startTime)} - {formatTime(appointment.timeSlot?.endTime)}
            </span>
          </div>
        </div>

        {/* SMS notice */}
        <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-xl flex items-center gap-2 text-xs text-indigo-800">
          <MessageSquare className="w-4 h-4 text-indigo-600 shrink-0" />
          <span>A revised SMS notification will be dispatched automatically upon rescheduling.</span>
        </div>

        {/* Slot picker for new date */}
        <SlotPicker
          doctorId={doctorId}
          selectedDate={selectedDate}
          onDateChange={setSelectedDate}
          selectedSlot={selectedSlot}
          onSelectSlot={setSelectedSlot}
        />

        {error && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-semibold text-xs hover:bg-slate-100"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleReschedule}
            disabled={submitting || !selectedSlot}
            className="px-6 py-2.5 rounded-xl bg-cyan-600 text-white font-bold text-xs hover:bg-cyan-700 transition disabled:opacity-50"
          >
            {submitting ? 'Updating...' : 'Confirm Reschedule'}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default RescheduleModal;
