import React, { useState, useEffect } from 'react';
import { adminApi } from '../../api/adminApi';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { Users, Search, MessageSquare, ShieldCheck, Phone, Mail } from 'lucide-react';

const AdminPatients = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchPatients = async () => {
    setLoading(true);
    try {
      const res = await adminApi.getPatients({ search: searchTerm || undefined });
      setPatients(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, [searchTerm]);

  return (
    <div className="space-y-6 p-6 max-w-7xl mx-auto">
      <div>
        <span className="text-xs font-bold uppercase tracking-wider text-purple-600 block mb-1">
          Patient Records
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Hospital Patient Directory
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          View all registered patients, their contact phone numbers, SMS notification consent flags, and appointment history.
        </p>
      </div>

      {/* Search */}
      <div className="bg-white p-3 rounded-2xl border border-slate-200">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search patients by name, email, or mobile number..."
            className="w-full text-xs rounded-xl border border-slate-200 pl-10 pr-4 py-2"
          />
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <LoadingSpinner text="Retrieving patient directory..." />
      ) : patients.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-slate-200">
          <Users className="w-8 h-8 text-slate-300 mx-auto mb-2" />
          <p className="text-xs text-slate-500">No patient records found.</p>
        </div>
      ) : (
        <div className="overflow-x-auto bg-white rounded-2xl border border-slate-200 shadow-sm">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 border-b border-slate-200 text-[10px] uppercase font-bold text-slate-400 tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Patient Name</th>
                <th className="py-3.5 px-4">Contact (SMS Recipient)</th>
                <th className="py-3.5 px-4">Medical Details</th>
                <th className="py-3.5 px-4">Emergency Contact</th>
                <th className="py-3.5 px-4">SMS Consent Status</th>
                <th className="py-3.5 px-4 text-right">Appointments</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {patients.map((pat) => (
                <tr key={pat._id} className="hover:bg-slate-50/60 transition">
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-slate-900">{pat.name}</div>
                    <div className="text-[11px] text-slate-400">
                      Joined: {new Date(pat.createdAt).toLocaleDateString()}
                    </div>
                  </td>

                  <td className="py-3.5 px-4">
                    <div className="font-mono font-bold text-slate-800">{pat.phone}</div>
                    <div className="text-slate-500">{pat.email}</div>
                  </td>

                  <td className="py-3.5 px-4">
                    <div>Age: {pat.age || 'N/A'} • {pat.gender || 'N/A'}</div>
                    <div className="font-bold text-slate-700">Blood: {pat.bloodGroup || 'Unknown'}</div>
                  </td>

                  <td className="py-3.5 px-4">
                    {pat.emergencyContact?.name ? (
                      <div>
                        <div className="font-semibold text-slate-800">{pat.emergencyContact.name}</div>
                        <div className="text-[11px] font-mono text-slate-500">{pat.emergencyContact.phone}</div>
                      </div>
                    ) : (
                      <span className="text-slate-300 italic">None provided</span>
                    )}
                  </td>

                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        pat.smsConsent
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}
                    >
                      <MessageSquare className="w-3 h-3" />
                      {pat.smsConsent ? 'Consent Granted' : 'Opted Out'}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 text-right font-bold text-slate-900">
                    <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-800">
                      {pat.appointmentsCount || 0} Visits
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminPatients;
