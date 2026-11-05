import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doctorApi } from '../api/doctorApi';
import SlotPicker from '../components/appointment/SlotPicker';
import BookingModal from '../components/appointment/BookingModal';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { formatCurrency } from '../utils/formatters';
import { useAuth } from '../hooks/useAuth';
import {
  Star,
  Award,
  MapPin,
  Calendar,
  Clock,
  Building,
  HeartPulse,
  MessageSquare,
  ShieldCheck,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

const DoctorDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);

  useEffect(() => {
    const fetchDoctor = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await doctorApi.getDoctorById(id);
        setDoctor(res.data);
      } catch (err) {
        setError(err.message || 'Failed to load doctor profile');
      } finally {
        setLoading(false);
      }
    };

    fetchDoctor();
  }, [id]);

  const handleSelectSlot = (slot) => {
    setSelectedSlot(slot);
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    setIsBookingModalOpen(true);
  };

  const handleBookingSuccess = (newAppointment) => {
    navigate('/patient/appointments');
  };

  if (loading) {
    return (
      <div className="py-20 max-w-7xl mx-auto px-4">
        <LoadingSpinner text="Loading physician profile & clinical calendar..." />
      </div>
    );
  }

  if (error || !doctor) {
    return (
      <div className="max-w-xl mx-auto py-20 px-4 text-center">
        <div className="p-6 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-sm">
          <AlertCircle className="w-8 h-8 mx-auto mb-2" />
          <p className="font-bold">{error || 'Doctor not found'}</p>
        </div>
      </div>
    );
  }

  const doctorName = doctor.userId?.name || 'Physician';
  const deptName = doctor.departmentId?.name || 'General Clinic';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Breadcrumb */}
      <div className="text-xs text-slate-400 flex items-center gap-2">
        <a href="/" className="hover:text-cyan-600">Home</a>
        <span>/</span>
        <a href="/doctors" className="hover:text-cyan-600">Doctors</a>
        <span>/</span>
        <span className="text-slate-700 font-semibold">{doctorName}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Doctor Profile & Clinical Background (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
            {/* Avatar & Header */}
            <div className="flex items-start gap-5">
              <div className="relative shrink-0">
                {doctor.avatarUrl ? (
                  <img
                    src={doctor.avatarUrl}
                    alt={doctorName}
                    className="w-20 h-20 rounded-2xl object-cover border border-slate-200"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-cyan-600 to-blue-600 flex items-center justify-center text-white font-bold text-2xl shadow-md shadow-cyan-600/20">
                    {doctorName.charAt(0)}
                  </div>
                )}
                <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 border-2 border-white" title="Active"></span>
              </div>

              <div className="flex-1 min-w-0">
                <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-bold bg-cyan-50 text-cyan-800 border border-cyan-100 mb-1">
                  {deptName}
                </span>
                <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 leading-tight">
                  {doctorName}
                </h1>
                <p className="text-xs text-slate-500 font-medium mt-0.5">{doctor.qualification}</p>

                <div className="flex items-center gap-1.5 mt-2 text-xs">
                  <div className="flex items-center text-amber-500">
                    <Star className="w-4 h-4 fill-amber-400 stroke-amber-500" />
                    <span className="font-bold text-slate-800 ml-1">{doctor.ratingsAverage || 4.8}</span>
                  </div>
                  <span className="text-slate-400">({doctor.ratingsQuantity || 15} verified reviews)</span>
                </div>
              </div>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-3 gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100 text-center">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Experience</span>
                <span className="text-sm font-bold text-slate-800 mt-0.5 block">{doctor.experienceYears} Years</span>
              </div>
              <div className="border-x border-slate-200">
                <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Clinic Fee</span>
                <span className="text-sm font-extrabold text-cyan-700 mt-0.5 block">{formatCurrency(doctor.consultationFee)}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Clinic Room</span>
                <span className="text-sm font-bold text-slate-800 mt-0.5 block truncate">{doctor.roomNumber}</span>
              </div>
            </div>

            {/* Bio */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                About the Specialist
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                {doctor.bio}
              </p>
            </div>

            {/* Specialization & Department */}
            <div className="p-4 rounded-2xl bg-cyan-50/50 border border-cyan-100 space-y-2 text-xs">
              <div className="flex items-center gap-2 text-cyan-900 font-bold">
                <HeartPulse className="w-4 h-4 text-cyan-600" />
                <span>Specialization: {doctor.specialization}</span>
              </div>
              <p className="text-[11px] text-cyan-800 leading-relaxed">
                {doctor.departmentId?.description}
              </p>
            </div>

            {/* Weekly Schedule Overview */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-cyan-600" />
                Weekly Clinic Shift Overview
              </h3>
              <div className="space-y-1.5 text-xs">
                {doctor.weeklySchedule?.map((shift) => (
                  <div
                    key={shift.dayOfWeek}
                    className="flex items-center justify-between py-1.5 px-3 rounded-lg bg-slate-50 text-slate-600"
                  >
                    <span className="font-semibold text-slate-700">{shift.dayName}</span>
                    <span>
                      {shift.isWorkingDay ? (
                        <span className="text-emerald-700 font-medium">
                          {shift.startTime} - {shift.endTime} ({shift.slotDurationMinutes} min slots)
                        </span>
                      ) : (
                        <span className="text-slate-400 italic">Off Duty</span>
                      )}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Interactive Live Slot Picker & Booking (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
          <div>
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-cyan-600 block mb-1">
                  Real-Time Appointment Scheduling
                </span>
                <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
                  Select Consultation Date & Time Slot
                </h2>
              </div>
              <div className="hidden sm:flex items-center gap-1.5 text-xs text-emerald-700 font-semibold bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Atomic Concurrency Lock</span>
              </div>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Select an available time slot below to lock your booking. You will receive an instant SMS confirmation on your mobile phone upon completion.
            </p>
          </div>

          {/* Interactive Slot Picker */}
          <SlotPicker
            doctorId={doctor._id}
            selectedDate={selectedDate}
            onDateChange={setSelectedDate}
            selectedSlot={selectedSlot}
            onSelectSlot={handleSelectSlot}
          />

          {/* Prompt banner */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-slate-600">
              <MessageSquare className="w-4 h-4 text-cyan-600 shrink-0" />
              <span>SMS delivery confirmations and reminders are active for this clinic.</span>
            </div>
            {!isAuthenticated && (
              <button
                type="button"
                onClick={() => navigate('/login')}
                className="text-xs font-bold text-cyan-600 hover:text-cyan-700 underline shrink-0"
              >
                Sign in to book
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Booking Confirmation Modal */}
      <BookingModal
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        doctor={doctor}
        selectedDate={selectedDate}
        selectedSlot={selectedSlot}
        onSuccess={handleBookingSuccess}
      />
    </div>
  );
};

export default DoctorDetailPage;
