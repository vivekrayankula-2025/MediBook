import React, { useState, useEffect } from 'react';
import { departmentApi } from '../../api/departmentApi';
import DepartmentModal from '../../components/admin/DepartmentModal';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import toast from 'react-hot-toast';
import { Building2, Plus, Edit, Trash2, HeartPulse, MapPin } from 'lucide-react';

const AdminDepartments = () => {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [deptToEdit, setDeptToEdit] = useState(null);

  const fetchDepartments = async () => {
    setLoading(true);
    try {
      const res = await departmentApi.getDepartments();
      setDepartments(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  const handleOpenCreate = () => {
    setDeptToEdit(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (dept) => {
    setDeptToEdit(dept);
    setModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to deactivate this department?')) return;
    try {
      await departmentApi.deleteDepartment(id);
      toast.success('Department deactivated');
      fetchDepartments();
    } catch (err) {
      toast.error(err.message || 'Failed to deactivate department');
    }
  };

  return (
    <div className="space-y-6 p-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-purple-600 block mb-1">
            Clinical Units
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Hospital Departments & Clinics
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure hospital divisions, facility locations, room assignments, and departmental leadership.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenCreate}
          className="px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-xs flex items-center gap-2 shadow-sm shadow-cyan-600/30 transition"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Department</span>
        </button>
      </div>

      {loading ? (
        <LoadingSpinner text="Retrieving clinical departments..." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {departments.map((dept) => (
            <div
              key={dept._id}
              className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-cyan-50 text-cyan-700 flex items-center justify-center font-bold">
                    <HeartPulse className="w-5 h-5" />
                  </div>
                  <span className="font-mono text-xs font-bold text-cyan-700 bg-cyan-50 px-2 py-0.5 rounded border border-cyan-200">
                    {dept.code}
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-900">{dept.name}</h3>
                <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                  {dept.description}
                </p>

                <div className="mt-4 pt-3 border-t border-slate-100 space-y-1.5 text-xs text-slate-600">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>Location: {dept.roomLocation}</span>
                  </div>
                  {dept.headOfDepartment && (
                    <div className="text-[11px] text-slate-500">
                      Head: <span className="font-semibold text-slate-700">{dept.headOfDepartment}</span>
                    </div>
                  )}
                  <div className="text-[11px] text-cyan-700 font-bold">
                    {dept.doctorCount || 0} Physicians on Duty
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => handleOpenEdit(dept)}
                  className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs inline-flex items-center gap-1 transition"
                >
                  <Edit className="w-3 h-3 text-cyan-600" />
                  <span>Edit</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(dept._id)}
                  className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 transition"
                  title="Deactivate Department"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      <DepartmentModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        departmentToEdit={deptToEdit}
        onSuccess={fetchDepartments}
      />
    </div>
  );
};

export default AdminDepartments;
