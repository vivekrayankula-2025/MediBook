import React, { useState, useEffect } from 'react';
import { doctorApi } from '../../api/doctorApi';
import { formatTime } from '../../utils/formatters';
import { Calendar as CalendarIcon, Clock, AlertCircle, CheckCircle } from 'lucide-react';
import LoadingSpinner from '../common/LoadingSpinner';

const SlotPicker = ({ doctorId, selectedSlot, onSelectSlot, selectedDate, onDateChange }) => {
  const [slotData, setSlotData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Generate list of next 7 days for quick tab selection
  const quickDates = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    const dateStr = d.toISOString().split('T')[0];
    const dayLabel = i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : d.toLocaleDateString('en-US', { weekday: 'short' });
    const formatted = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    return { dateStr, dayLabel, formatted };
  });

  useEffect(() => {
    if (!doctorId || !selectedDate) return;

    const fetchSlots = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await doctorApi.getAvailableSlots(doctorId, selectedDate);
        setSlotData(res.data);
      } catch (err) {
        setError(err.message || 'Failed to fetch appointment slots');
        setSlotData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchSlots();
  }, [doctorId, selectedDate]);

  return (
    <div className="space-y-5">
      {/* Date Selector Header */}
      <div>
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
          <CalendarIcon className="w-4 h-4 text-cyan-600" />
          Select Appointment Date
        </label>

        {/* Quick Date Pills */}
        <div className="grid grid-cols-3 sm:grid-cols-7 gap-2">
          {quickDates.map((item) => {
            const isSelected = selectedDate === item.dateStr;
            return (
              <button
                key={item.dateStr}
                type="button"
                onClick={() => onDateChange(item.dateStr)}
                className={`flex flex-col items-center justify-center py-2.5 px-2 rounded-xl text-center border transition ${
                  isSelected
                    ? 'bg-cyan-600 text-white border-cyan-600 shadow-md shadow-cyan-600/30 font-bold'
                    : 'bg-white text-slate-700 border-slate-200 hover:border-cyan-300 hover:bg-cyan-50/50'
                }`}
              >
                <span className="text-[11px] uppercase tracking-wide opacity-80">{item.dayLabel}</span>
                <span className="text-xs font-semibold mt-0.5">{item.formatted}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Available Slots Area */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-cyan-600" />
            Available Consultation Slots
          </label>
          {slotData && (
            <span className="text-xs font-semibold text-slate-500">
              {slotData.availableSlotsCount} of {slotData.totalSlots} slots free
            </span>
          )}
        </div>

        {loading ? (
          <div className="py-8 bg-slate-50 rounded-2xl border border-slate-200/80">
            <LoadingSpinner size="sm" text="Querying live doctor availability..." />
          </div>
        ) : error ? (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        ) : !slotData?.isWorkingDay ? (
          <div className="p-6 rounded-2xl bg-amber-50/60 border border-amber-200 text-center space-y-1">
            <p className="text-sm font-bold text-amber-800">No Clinic Sessions on this Date</p>
            <p className="text-xs text-amber-600">
              {slotData?.message || 'Doctor does not consult on this day of week.'} Please pick another date above.
            </p>
          </div>
        ) : slotData?.slots?.length === 0 ? (
          <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 text-center">
            <p className="text-xs font-medium text-slate-500">No appointment slots configured for this date.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
            {slotData.slots.map((slot) => {
              const isSelected =
                selectedSlot?.startTime === slot.startTime &&
                selectedSlot?.endTime === slot.endTime;

              if (slot.isBooked) {
                return (
                  <div
                    key={slot.startTime}
                    title="This slot is already booked by another patient"
                    className="flex items-center justify-between p-2.5 rounded-xl border border-slate-200 bg-slate-100/80 text-slate-400 cursor-not-allowed select-none"
                  >
                    <span className="text-xs font-medium line-through">
                      {formatTime(slot.startTime)}
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-slate-200 text-slate-500">
                      Booked
                    </span>
                  </div>
                );
              }

              return (
                <button
                  key={slot.startTime}
                  type="button"
                  onClick={() => onSelectSlot(slot)}
                  className={`flex items-center justify-between p-2.5 rounded-xl border text-left transition ${
                    isSelected
                      ? 'bg-cyan-600 text-white border-cyan-600 shadow-md shadow-cyan-600/30'
                      : 'bg-white text-slate-700 border-slate-200 hover:border-cyan-400 hover:bg-cyan-50/50'
                  }`}
                >
                  <span className="text-xs font-bold">{formatTime(slot.startTime)}</span>
                  {isSelected ? (
                    <CheckCircle className="w-4 h-4 text-white" />
                  ) : (
                    <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                      Free
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default SlotPicker;
