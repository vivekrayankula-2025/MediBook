import React, { useState } from 'react';
import { doctorApi } from '../../api/doctorApi';
import toast from 'react-hot-toast';
import { Clock, Calendar, Check, Save } from 'lucide-react';

const DoctorScheduleEditor = ({ initialSchedule, doctorId, onSaved }) => {
  const [schedule, setSchedule] = useState(
    initialSchedule && initialSchedule.length > 0
      ? initialSchedule
      : [
          { dayOfWeek: 1, dayName: 'Monday', isWorkingDay: true, startTime: '09:00', endTime: '17:00', slotDurationMinutes: 30, breakStartTime: '13:00', breakEndTime: '14:00' },
          { dayOfWeek: 2, dayName: 'Tuesday', isWorkingDay: true, startTime: '09:00', endTime: '17:00', slotDurationMinutes: 30, breakStartTime: '13:00', breakEndTime: '14:00' },
          { dayOfWeek: 3, dayName: 'Wednesday', isWorkingDay: true, startTime: '09:00', endTime: '17:00', slotDurationMinutes: 30, breakStartTime: '13:00', breakEndTime: '14:00' },
          { dayOfWeek: 4, dayName: 'Thursday', isWorkingDay: true, startTime: '09:00', endTime: '17:00', slotDurationMinutes: 30, breakStartTime: '13:00', breakEndTime: '14:00' },
          { dayOfWeek: 5, dayName: 'Friday', isWorkingDay: true, startTime: '09:00', endTime: '17:00', slotDurationMinutes: 30, breakStartTime: '13:00', breakEndTime: '14:00' },
          { dayOfWeek: 6, dayName: 'Saturday', isWorkingDay: false, startTime: '09:00', endTime: '13:00', slotDurationMinutes: 30, breakStartTime: '', breakEndTime: '' },
          { dayOfWeek: 0, dayName: 'Sunday', isWorkingDay: false, startTime: '09:00', endTime: '13:00', slotDurationMinutes: 30, breakStartTime: '', breakEndTime: '' }
        ]
  );

  const [saving, setSaving] = useState(false);

  const handleDayToggle = (index) => {
    const updated = [...schedule];
    updated[index].isWorkingDay = !updated[index].isWorkingDay;
    setSchedule(updated);
  };

  const handleFieldChange = (index, field, value) => {
    const updated = [...schedule];
    updated[index][field] = value;
    setSchedule(updated);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await doctorApi.updateSchedule({
        doctorId,
        weeklySchedule: schedule,
      });
      toast.success('Clinical consultation schedule saved successfully!');
      if (onSaved) onSaved(schedule);
    } catch (err) {
      toast.error(err.message || 'Failed to update schedule');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-6">
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <div>
          <h3 className="text-base font-bold text-slate-800">Weekly Consultation Shifts & Slot Duration</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure clinic working days, working hours, and appointment duration per patient.
          </p>
        </div>
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-xs flex items-center gap-2 shadow-sm shadow-cyan-600/30 transition disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          <span>{saving ? 'Saving...' : 'Save Schedule'}</span>
        </button>
      </div>

      <div className="space-y-3">
        {schedule.map((shift, idx) => (
          <div
            key={shift.dayOfWeek}
            className={`p-4 rounded-xl border transition flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${
              shift.isWorkingDay ? 'bg-white border-slate-200' : 'bg-slate-50 border-slate-200/60 opacity-60'
            }`}
          >
            {/* Day Checkbox */}
            <div className="flex items-center gap-3 w-36 shrink-0">
              <input
                type="checkbox"
                id={`day-${shift.dayOfWeek}`}
                checked={shift.isWorkingDay}
                onChange={() => handleDayToggle(idx)}
                className="w-4 h-4 text-cyan-600 rounded border-slate-300 focus:ring-cyan-500 cursor-pointer"
              />
              <label
                htmlFor={`day-${shift.dayOfWeek}`}
                className="text-xs font-bold text-slate-800 cursor-pointer select-none"
              >
                {shift.dayName}
              </label>
            </div>

            {/* Shift Hours & Break Times */}
            {shift.isWorkingDay ? (
              <div className="flex-1 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs w-full">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Start Time
                  </span>
                  <input
                    type="time"
                    value={shift.startTime}
                    onChange={(e) => handleFieldChange(idx, 'startTime', e.target.value)}
                    className="w-full text-xs rounded-lg border border-slate-200 px-2 py-1.5 focus:ring-1 focus:ring-cyan-500"
                  />
                </div>

                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    End Time
                  </span>
                  <input
                    type="time"
                    value={shift.endTime}
                    onChange={(e) => handleFieldChange(idx, 'endTime', e.target.value)}
                    className="w-full text-xs rounded-lg border border-slate-200 px-2 py-1.5 focus:ring-1 focus:ring-cyan-500"
                  />
                </div>

                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Slot Duration
                  </span>
                  <select
                    value={shift.slotDurationMinutes || 30}
                    onChange={(e) => handleFieldChange(idx, 'slotDurationMinutes', Number(e.target.value))}
                    className="w-full text-xs rounded-lg border border-slate-200 px-2 py-1.5 focus:ring-1 focus:ring-cyan-500 bg-white"
                  >
                    <option value={15}>15 Minutes</option>
                    <option value={20}>20 Minutes</option>
                    <option value={30}>30 Minutes</option>
                    <option value={45}>45 Minutes</option>
                    <option value={60}>60 Minutes</option>
                  </select>
                </div>

                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Lunch Break
                  </span>
                  <div className="flex items-center gap-1">
                    <input
                      type="time"
                      value={shift.breakStartTime || ''}
                      onChange={(e) => handleFieldChange(idx, 'breakStartTime', e.target.value)}
                      className="w-1/2 text-[11px] rounded border border-slate-200 px-1 py-1"
                    />
                    <span className="text-slate-400">-</span>
                    <input
                      type="time"
                      value={shift.breakEndTime || ''}
                      onChange={(e) => handleFieldChange(idx, 'breakEndTime', e.target.value)}
                      className="w-1/2 text-[11px] rounded border border-slate-200 px-1 py-1"
                    />
                  </div>
                </div>
              </div>
            ) : (
              <span className="text-xs italic text-slate-400">Clinic Closed on this day</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default DoctorScheduleEditor;
