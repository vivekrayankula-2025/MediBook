import React, { useState, useEffect } from 'react';
import { doctorApi } from '../../api/doctorApi';
import DoctorFormModal from '../../components/admin/DoctorFormModal';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { formatCurrency } from '../../utils/formatters';
import { Plus, Stethoscope, Star, Edit, Search } from 'lucide-react';

const AdminDoctors = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [doctorToEdit, setDoctorToEdit] = useState(null);

  const fetchDoctors = async () => {
    setLoading(true);
    try {
      const res = await doctorApi.getDoctors();
      setDoctors(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  const handleOpenCreate = () => {
    setDoctorToEdit(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (doc) => {
    setDoctorToEdit(doc);
    setModalOpen(true);
  };

  const filteredDoctors = doctors.filter((d) => {
    const name = d.userId?.name?.toLowerCase() || '';
    const spec = d.specialization?.toLowerCase() || '';
    const dept = d.departmentId?.name?.toLowerCase() || '';
    const term = searchTerm.toLowerCase();
    return name.includes(term) || spec.includes(term) || dept.includes(term);
  });

  return (
    <div className="space-y-6 p-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-purple-600 block mb-1">
            Clinical Staff
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Hospital Doctors & Specialists
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Register new physicians, assign departments, configure consultation fees, and update profiles.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenCreate}
          className="px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-xs flex items-center gap-2 shadow-sm shadow-cyan-600/30 transition"
        >
          <Plus className="w-4 h-4" />
          <span>Register New Doctor</span>
        </button>
      </div>

      {/* Search Input */}
      <div className="bg-white p-3 rounded-2xl border border-slate-200">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search doctors by name, specialty, or department..."
            className="w-full text-xs rounded-xl border border-slate-200 pl-10 pr-4 py-2"
          />
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <LoadingSpinner text="Fetching doctor profiles..." />
      ) : (
        <div className="overflow-x-auto bg-white rounded-2xl border border-slate-200 shadow-sm">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 border-b border-slate-200 text-[10px] uppercase font-bold text-slate-400 tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Doctor</th>
                <th className="py-3.5 px-4">Department & Room</th>
                <th className="py-3.5 px-4">Contact (SMS)</th>
                <th className="py-3.5 px-4">Fee</th>
                <th className="py-3.5 px-4">Rating</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredDoctors.map((doc) => (
                <tr key={doc._id} className="hover:bg-slate-50/60 transition">
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-slate-900">{doc.userId?.name}</div>
                    <div className="text-[11px] text-slate-500">{doc.specialization}</div>
                    <div className="text-[10px] text-slate-400">{doc.qualification}</div>
                  </td>

                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-slate-800">{doc.departmentId?.name}</div>
                    <div className="text-[11px] text-slate-500">{doc.roomNumber}</div>
                  </td>

                  <td className="py-3.5 px-4 font-mono text-[11px]">
                    <div>{doc.userId?.phone}</div>
                    <div className="text-slate-400 font-sans">{doc.userId?.email}</div>
                  </td>

                  <td className="py-3.5 px-4 font-bold text-slate-900">
                    {formatCurrency(doc.consultationFee)}
                  </td>

                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-1 font-bold text-amber-600">
                      <Star className="w-3.5 h-3.5 fill-amber-400 stroke-amber-500" />
                      <span>{doc.ratingsAverage}</span>
                      <span className="text-[10px] text-slate-400 font-normal">({doc.ratingsQuantity})</span>
                    </div>
                  </td>

                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        doc.isAvailable
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {doc.isAvailable ? 'Active' : 'On Leave'}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 text-right">
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(doc)}
                      className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold inline-flex items-center gap-1 transition"
                    >
                      <Edit className="w-3 h-3 text-cyan-600" />
                      <span>Edit</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      <DoctorFormModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        doctorToEdit={doctorToEdit}
        onSuccess={fetchDoctors}
      />
    </div>
  );
};

export default AdminDoctors;
