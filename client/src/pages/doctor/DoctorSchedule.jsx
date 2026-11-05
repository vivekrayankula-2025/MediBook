import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { authApi } from '../../api/authApi';
import DoctorScheduleEditor from '../../components/doctor/DoctorScheduleEditor';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const DoctorSchedule = () => {
  const { user } = useAuth();
  const [doctorProfile, setDoctorProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMe = async () => {
      try {
        const res = await authApi.getMe();
        setDoctorProfile(res.data.doctorProfile);
      } catch (err) {
        console.error('Failed to load profile:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMe();
  }, []);

  if (loading) {
    return (
      <div className="p-8 max-w-4xl mx-auto">
        <LoadingSpinner text="Loading your clinical schedule settings..." />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div>
        <span className="text-xs font-bold uppercase tracking-wider text-cyan-600 block mb-1">
          Clinical Availability
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Working Shifts & Slot Durations
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Configure which days of the week you hold OPD clinic sessions, shift start and end times, and duration per patient consultation.
        </p>
      </div>

      <DoctorScheduleEditor
        initialSchedule={doctorProfile?.weeklySchedule}
        doctorId={doctorProfile?._id}
      />
    </div>
  );
};

export default DoctorSchedule;
