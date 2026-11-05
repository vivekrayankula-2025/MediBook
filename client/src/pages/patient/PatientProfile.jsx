import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import toast from 'react-hot-toast';
import { User, Phone, Mail, Shield, MessageSquare, AlertCircle, Save } from 'lucide-react';

const PatientProfile = () => {
  const { user, updateProfile, toggleSMSConsent } = useAuth();

  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    age: user?.age || '',
    gender: user?.gender || 'prefer_not_to_say',
    bloodGroup: user?.bloodGroup || 'Unknown',
    street: user?.address?.street || '',
    city: user?.address?.city || '',
    emergencyName: user?.emergencyContact?.name || '',
    emergencyPhone: user?.emergencyContact?.phone || '',
  });

  const [saving, setSaving] = useState(false);
  const [consentUpdating, setConsentUpdating] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateProfile({
        name: formData.name,
        phone: formData.phone,
        age: formData.age ? Number(formData.age) : undefined,
        gender: formData.gender,
        bloodGroup: formData.bloodGroup,
        address: { street: formData.street, city: formData.city },
        emergencyContact: { name: formData.emergencyName, phone: formData.emergencyPhone },
      });
    } finally {
      setSaving(false);
    }
  };

  const handleToggleConsent = async () => {
    setConsentUpdating(true);
    try {
      await toggleSMSConsent(!user?.smsConsent);
    } finally {
      setConsentUpdating(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div>
        <span className="text-xs font-bold uppercase tracking-wider text-cyan-600 block mb-1">
          Patient Account
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Profile & SMS Notification Consent
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Manage your personal medical information, emergency contact details, and SMS gateway opt-in/opt-out preferences.
        </p>
      </div>

      {/* SMS Consent Card */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
              user?.smsConsent ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
            }`}>
              <MessageSquare className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                SMS Notification Preference (TCPA / GDPR Compliant)
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed max-w-xl">
                When enabled, MediBook sends instant booking confirmations, scheduled reminder alerts 24 hours prior to your visit, and notifications if a doctor reschedules or cancels.
              </p>
              <div className="mt-2 text-xs font-semibold">
                Current Registered Mobile:{' '}
                <span className="font-mono text-cyan-700 bg-cyan-50 px-2 py-0.5 rounded border border-cyan-200">
                  {user?.phone || 'Not set'}
                </span>
              </div>
            </div>
          </div>

          <button
            type="button"
            disabled={consentUpdating}
            onClick={handleToggleConsent}
            className={`px-5 py-2.5 rounded-xl font-bold text-xs transition border shrink-0 ${
              user?.smsConsent
                ? 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
                : 'bg-emerald-600 text-white border-emerald-600 hover:bg-emerald-700 shadow-sm shadow-emerald-600/30'
            }`}
          >
            {consentUpdating
              ? 'Updating...'
              : user?.smsConsent
              ? 'Opt-Out of SMS'
              : 'Opt-In to SMS'}
          </button>
        </div>

        <div className="pt-3 border-t border-slate-100 flex items-center gap-2 text-[11px] text-slate-500">
          <Shield className="w-3.5 h-3.5 text-cyan-600" />
          <span>
            Status: {user?.smsConsent ? 'Consent Granted (Active)' : 'Consent Revoked (Opted Out)'}.
            You can also reply "STOP" to any incoming hospital SMS to immediately revoke consent.
          </span>
        </div>
      </div>

      {/* Profile Form */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm">
        <form onSubmit={handleProfileSubmit} className="space-y-6">
          <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
            Personal & Medical Details
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
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
                className="w-full rounded-xl border border-slate-300 p-2.5"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                Email Address (Account Login)
              </label>
              <input
                type="email"
                disabled
                value={user?.email || ''}
                className="w-full rounded-xl border border-slate-200 p-2.5 bg-slate-100 text-slate-500 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                Mobile Phone (SMS Recipient) *
              </label>
              <input
                type="text"
                required
                name="phone"
                value={formData.phone}
                onChange={handleChange}
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
                max="130"
                name="age"
                value={formData.age}
                onChange={handleChange}
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
                City / Region
              </label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-300 p-2.5"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                Street Address
              </label>
              <input
                type="text"
                name="street"
                value={formData.street}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-300 p-2.5"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                Emergency Contact Name
              </label>
              <input
                type="text"
                name="emergencyName"
                value={formData.emergencyName}
                onChange={handleChange}
                placeholder="Relative or guardian"
                className="w-full rounded-xl border border-slate-300 p-2.5"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                Emergency Contact Phone
              </label>
              <input
                type="text"
                name="emergencyPhone"
                value={formData.emergencyPhone}
                onChange={handleChange}
                placeholder="+15550009999"
                className="w-full rounded-xl border border-slate-300 p-2.5"
              />
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-100">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-xs flex items-center gap-2 shadow-md shadow-cyan-600/30 transition disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Saving Profile...' : 'Save Profile Changes'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PatientProfile;
