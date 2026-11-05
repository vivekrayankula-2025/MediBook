import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { HeartPulse, Mail, Lock, Phone, User, MessageSquare, AlertCircle } from 'lucide-react';

const RegisterPage = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    age: '',
    gender: 'prefer_not_to_say',
    bloodGroup: 'Unknown',
    street: '',
    city: '',
    emergencyName: '',
    emergencyPhone: '',
    smsConsent: true,
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const payload = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        age: formData.age ? Number(formData.age) : undefined,
        gender: formData.gender,
        bloodGroup: formData.bloodGroup,
        smsConsent: formData.smsConsent,
        address: {
          street: formData.street,
          city: formData.city,
        },
        emergencyContact: {
          name: formData.emergencyName,
          phone: formData.emergencyPhone,
        },
      };

      await register(payload);
      navigate('/patient/dashboard');
    } catch (err) {
      setError(err.message || 'Registration failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-xl w-full space-y-6 bg-white p-8 sm:p-10 rounded-3xl border border-slate-200 shadow-xl shadow-slate-900/5">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-cyan-600 text-white shadow-md shadow-cyan-600/30 mb-2">
            <HeartPulse className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Create Patient Account</h2>
          <p className="text-xs text-slate-500">
            Register your profile to book specialist appointments and receive instant SMS confirmations
          </p>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                Full Name *
              </label>
              <input
                type="text"
                required
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="John Davis"
                className="w-full rounded-xl border border-slate-300 p-2.5"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                Email Address *
              </label>
              <input
                type="email"
                required
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="john@example.com"
                className="w-full rounded-xl border border-slate-300 p-2.5"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                Password *
              </label>
              <input
                type="password"
                required
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Min 6 characters"
                className="w-full rounded-xl border border-slate-300 p-2.5"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                Mobile Number (for SMS Alerts) *
              </label>
              <input
                type="text"
                required
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+15551234567"
                className="w-full rounded-xl border border-slate-300 p-2.5"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                Age
              </label>
              <input
                type="number"
                min="0"
                max="125"
                name="age"
                value={formData.age}
                onChange={handleChange}
                placeholder="e.g. 32"
                className="w-full rounded-xl border border-slate-300 p-2.5"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                Gender
              </label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-300 p-2.5 bg-white"
              >
                <option value="prefer_not_to_say">Prefer not to say</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                Blood Group
              </label>
              <select
                name="bloodGroup"
                value={formData.bloodGroup}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-300 p-2.5 bg-white"
              >
                <option value="Unknown">Unknown</option>
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                City / Location
              </label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                placeholder="e.g. Springfield"
                className="w-full rounded-xl border border-slate-300 p-2.5"
              />
            </div>
          </div>

          {/* SMS Consent Checkbox */}
          <div className="p-3.5 rounded-2xl bg-cyan-50/70 border border-cyan-200">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                name="smsConsent"
                checked={formData.smsConsent}
                onChange={handleChange}
                className="w-4 h-4 text-cyan-600 rounded border-slate-300 mt-0.5 focus:ring-cyan-500"
              />
              <div className="text-xs text-slate-700">
                <span className="font-bold text-slate-900 block flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5 text-cyan-600" />
                  SMS Appointment & Reminder Consent (TCPA / GDPR)
                </span>
                <p className="text-[11px] text-slate-600 mt-0.5 leading-snug">
                  I agree to receive automated SMS confirmations, reminders, and schedule updates at my registered mobile number.
                  I understand I can opt out anytime from my profile or by replying STOP.
                </p>
              </div>
            </label>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white font-bold text-xs shadow-md shadow-cyan-600/30 transition disabled:opacity-50"
          >
            {submitting ? 'Creating Patient Profile...' : 'Complete Patient Registration'}
          </button>
        </form>

        <div className="text-center pt-2 border-t border-slate-100">
          <p className="text-xs text-slate-500">
            Already registered?{' '}
            <Link to="/login" className="font-bold text-cyan-600 hover:text-cyan-700 underline">
              Sign In to Your Account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
