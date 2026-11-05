import React from 'react';
import { HeartPulse, PhoneCall, ShieldCheck, Mail, MapPin, Clock } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-slate-900 text-slate-300 pt-16 pb-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          {/* Col 1: Brand & Overview */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-cyan-500 flex items-center justify-center text-white shadow-md shadow-cyan-500/20">
                <HeartPulse className="w-5 h-5 stroke-[2.2]" />
              </div>
              <span className="text-xl font-extrabold text-white tracking-tight">MediBook</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Smart Hospital Appointment Booking and Real-Time SMS Notification Gateway.
              Ensuring zero double-bookings, scheduled patient reminders, and seamless hospital workflows.
            </p>
            <div className="flex items-center gap-2 text-xs text-emerald-400 font-semibold bg-emerald-950/40 border border-emerald-800/60 px-3 py-1.5 rounded-lg w-fit">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>HIPAA & TCPA Compliant SMS Gateway</span>
            </div>
          </div>

          {/* Col 2: Quick Links */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">Quick Navigation</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <a href="/doctors" className="hover:text-cyan-400 transition">
                  Search Specialists
                </a>
              </li>
              <li>
                <a href="/patient/appointments" className="hover:text-cyan-400 transition">
                  Patient Booking Portal
                </a>
              </li>
              <li>
                <a href="/doctor/dashboard" className="hover:text-cyan-400 transition">
                  Doctor Clinic Console
                </a>
              </li>
              <li>
                <a href="/admin/dashboard" className="hover:text-cyan-400 transition">
                  Hospital Admin Analytics
                </a>
              </li>
              <li>
                <a href="/admin/sms-logs" className="hover:text-cyan-400 transition">
                  SMS Gateway Delivery Audit
                </a>
              </li>
            </ul>
          </div>

          {/* Col 3: Departments */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">Clinical Departments</h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>Cardiology & Cardiovascular Care</li>
              <li>Neurology & Neurosurgery</li>
              <li>Pediatrics & Neonatal Care</li>
              <li>Orthopedics & Joint Surgery</li>
              <li>Dermatology & Skin Aesthetics</li>
              <li>Emergency Trauma & ICU</li>
            </ul>
          </div>

          {/* Col 4: Contact & Emergency */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">Emergency & Support</h4>
            <div className="bg-slate-800/70 p-4 rounded-xl border border-slate-700/60 space-y-2 text-xs">
              <div className="flex items-center gap-2 text-rose-400 font-bold">
                <PhoneCall className="w-4 h-4 animate-pulse" />
                <span>24/7 Helpline: +1-800-555-0199</span>
              </div>
              <div className="flex items-center gap-2 text-slate-400">
                <Mail className="w-4 h-4 text-slate-500" />
                <span>support@medibook.hospital</span>
              </div>
              <div className="flex items-center gap-2 text-slate-400">
                <MapPin className="w-4 h-4 text-slate-500" />
                <span>450 Healthcare Boulevard, Suite 100</span>
              </div>
              <div className="flex items-center gap-2 text-slate-400">
                <Clock className="w-4 h-4 text-slate-500" />
                <span>OPD Hours: Mon - Sat (8:00 AM - 8:00 PM)</span>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} MediBook Hospital Information System. Final Year Engineering Project.</p>
          <div className="flex items-center gap-4">
            <span>Built with MERN Stack + SMS Gateway</span>
            <span>•</span>
            <span>Zero Double-Booking Guarantee</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
