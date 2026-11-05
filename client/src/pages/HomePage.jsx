import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { departmentApi } from '../api/departmentApi';
import { doctorApi } from '../api/doctorApi';
import DoctorCard from '../components/doctor/DoctorCard';
import BookingModal from '../components/appointment/BookingModal';
import { useAuth } from '../hooks/useAuth';
import {
  HeartPulse,
  Search,
  Calendar,
  MessageSquare,
  ShieldCheck,
  Clock,
  PhoneCall,
  ArrowRight,
  CheckCircle2,
  Stethoscope,
  Sparkles,
  Users
} from 'lucide-react';

const HomePage = () => {
  const navigate = useNavigate();
  const { isAuthenticated, isPatient } = useAuth();
  const [departments, setDepartments] = useState([]);
  const [featuredDoctors, setFeaturedDoctors] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDoctorForBooking, setSelectedDoctorForBooking] = useState(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);

  useEffect(() => {
    departmentApi.getDepartments().then((res) => setDepartments(res.data)).catch(() => {});
    doctorApi.getDoctors({ limit: 4 }).then((res) => setFeaturedDoctors(res.data.slice(0, 4))).catch(() => {});
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/doctors?search=${encodeURIComponent(searchTerm.trim())}`);
    } else {
      navigate('/doctors');
    }
  };

  const handleBookClick = (doctor) => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    navigate(`/doctors/${doctor._id}`);
  };

  return (
    <div className="space-y-20 pb-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-cyan-50/60 via-white to-slate-50 pt-12 pb-20 border-b border-slate-200/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            {/* Pill Banner */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-100/80 border border-cyan-200 text-cyan-900 text-xs font-bold tracking-wide">
              <Sparkles className="w-4 h-4 text-cyan-600" />
              <span>Smart Hospital Scheduling & Real-Time SMS Confirmations</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.15]">
              Seamless Doctor Bookings,{' '}
              <span className="bg-gradient-to-r from-cyan-600 to-blue-700 bg-clip-text text-transparent">
                Instant SMS Delivery.
              </span>
            </h1>

            <p className="text-base sm:text-lg text-slate-600 leading-relaxed font-normal">
              Book consultations with top medical specialists. MediBook prevents double-bookings with atomic slot reservation,
              and sends immediate SMS confirmation, schedule updates, and automated reminders straight to your mobile.
            </p>

            {/* Search Bar */}
            <form
              onSubmit={handleSearchSubmit}
              className="mt-8 p-2 rounded-2xl bg-white shadow-xl shadow-cyan-900/5 border border-slate-200 flex flex-col sm:flex-row items-center gap-2 max-w-2xl mx-auto"
            >
              <div className="flex items-center gap-2 px-3 py-2 flex-1 w-full text-slate-400">
                <Search className="w-5 h-5 text-cyan-600 shrink-0" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by doctor name, specialty, or condition..."
                  className="w-full text-sm text-slate-800 focus:outline-none placeholder:text-slate-400"
                />
              </div>

              <button
                type="submit"
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white font-bold text-sm shadow-md shadow-cyan-600/30 transition transform hover:-translate-y-0.5"
              >
                Find Specialist
              </button>
            </form>

            {/* Highlights Bar */}
            <div className="pt-6 grid grid-cols-2 sm:grid-cols-4 gap-4 text-left border-t border-slate-200/60 mt-10">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div className="text-xs">
                  <span className="font-bold text-slate-800 block">Zero Double-Booking</span>
                  <span className="text-slate-500">Atomic slot locks</span>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-cyan-100 text-cyan-700 flex items-center justify-center shrink-0">
                  <MessageSquare className="w-4 h-4" />
                </div>
                <div className="text-xs">
                  <span className="font-bold text-slate-800 block">Instant SMS Alerts</span>
                  <span className="text-slate-500">Booking & Reminders</span>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                  <Stethoscope className="w-4 h-4" />
                </div>
                <div className="text-xs">
                  <span className="font-bold text-slate-800 block">Verified Doctors</span>
                  <span className="text-slate-500">Board-certified specialists</span>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div className="text-xs">
                  <span className="font-bold text-slate-800 block">TCPA Compliant</span>
                  <span className="text-slate-500">Opt-in & Opt-out support</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Clinical Departments Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-8">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-cyan-600 block mb-1">
              Centers of Excellence
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Hospital Departments & Specialties
            </h2>
          </div>
          <Link
            to="/doctors"
            className="text-xs font-bold text-cyan-600 hover:text-cyan-700 flex items-center gap-1 transition"
          >
            <span>Browse All Departments</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {departments.map((dept) => (
            <Link
              key={dept._id}
              to={`/doctors?department=${dept._id}`}
              className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-sm hover:shadow-md hover:border-cyan-300 transition group"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-cyan-50 text-cyan-700 group-hover:bg-cyan-600 group-hover:text-white transition flex items-center justify-center font-bold">
                  <HeartPulse className="w-6 h-6" />
                </div>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  {dept.code}
                </span>
              </div>
              <h3 className="text-base font-bold text-slate-900 group-hover:text-cyan-700 transition">
                {dept.name}
              </h3>
              <p className="text-xs text-slate-500 mt-2 line-clamp-2 leading-relaxed">
                {dept.description}
              </p>
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-medium text-slate-500">
                <span>{dept.roomLocation}</span>
                <span className="text-cyan-600 font-bold group-hover:translate-x-1 transition flex items-center gap-1">
                  View Doctors <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Doctors Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-8">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-cyan-600 block mb-1">
              Expert Healthcare Providers
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Featured Consulting Physicians
            </h2>
          </div>
          <Link
            to="/doctors"
            className="text-xs font-bold text-cyan-600 hover:text-cyan-700 flex items-center gap-1 transition"
          >
            <span>View All Doctors</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredDoctors.map((doc) => (
            <DoctorCard key={doc._id} doctor={doc} onBookClick={handleBookClick} />
          ))}
        </div>
      </section>

      {/* How It Works Section */}
      <section className="bg-slate-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
            <span className="text-xs font-bold uppercase tracking-widest text-cyan-400">
              Effortless Care Workflow
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              How MediBook Works in 4 Simple Steps
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="p-6 rounded-2xl bg-slate-800/60 border border-slate-700/60 space-y-3 relative">
              <span className="text-3xl font-extrabold text-cyan-500">01</span>
              <h4 className="text-base font-bold text-white">Select Doctor</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Filter by department, review physician credentials, consulting fees, and patient reviews.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-800/60 border border-slate-700/60 space-y-3 relative">
              <span className="text-3xl font-extrabold text-cyan-500">02</span>
              <h4 className="text-base font-bold text-white">Pick Available Slot</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Choose from real-time dynamic slots. The atomic reservation engine blocks double bookings.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-800/60 border border-slate-700/60 space-y-3 relative">
              <span className="text-3xl font-extrabold text-cyan-500">03</span>
              <h4 className="text-base font-bold text-white">Instant SMS Alert</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Receive an immediate booking SMS with reference number, plus automated reminders before your visit.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-800/60 border border-slate-700/60 space-y-3 relative">
              <span className="text-3xl font-extrabold text-cyan-500">04</span>
              <h4 className="text-base font-bold text-white">Visit & Prescription</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Present your digital slip at clinic desk and access your doctor's e-prescriptions anytime online.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Emergency Callout */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 sm:p-10 rounded-3xl bg-gradient-to-r from-rose-600 via-rose-700 to-red-800 text-white shadow-xl shadow-rose-900/10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <span className="text-xs font-bold uppercase tracking-widest text-rose-200">
              Immediate Care Assistance
            </span>
            <h3 className="text-2xl sm:text-3xl font-extrabold">Need Urgent Medical Attention?</h3>
            <p className="text-xs sm:text-sm text-rose-100 max-w-xl">
              Our 24/7 Trauma and Emergency Care unit is always staffed with on-call physicians.
              Call the emergency response line directly.
            </p>
          </div>
          <a
            href="tel:+18005550199"
            className="px-6 py-3.5 rounded-2xl bg-white text-rose-700 font-extrabold text-sm shadow-md hover:bg-rose-50 transition flex items-center gap-2 shrink-0"
          >
            <PhoneCall className="w-5 h-5 text-rose-600 animate-pulse" />
            <span>Call +1-800-555-0199</span>
          </a>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
