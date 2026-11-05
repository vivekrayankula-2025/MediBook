import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import { adminApi } from '../../api/adminApi';
import { departmentApi } from '../../api/departmentApi';
import toast from 'react-hot-toast';

const DoctorFormModal = ({ isOpen, onClose, doctorToEdit, onSuccess }) => {
  const [departments, setDepartments] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    departmentId: '',
    specialization: '',
    qualification: '',
    experienceYears: 5,
    consultationFee: 500,
    roomNumber: 'Room 101',
    bio: '',
    avatarUrl: '',
    isAvailable: true,
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    departmentApi.getDepartments().then((res) => setDepartments(res.data)).catch(() => {});
  }, []);

  useEffect(() => {
    if (doctorToEdit) {
      setFormData({
        name: doctorToEdit.userId?.name || '',
        email: doctorToEdit.userId?.email || '',
        phone: doctorToEdit.userId?.phone || '',
        departmentId: doctorToEdit.departmentId?._id || doctorToEdit.departmentId || '',
        specialization: doctorToEdit.specialization || '',
        qualification: doctorToEdit.qualification || '',
        experienceYears: doctorToEdit.experienceYears || 1,
        consultationFee: doctorToEdit.consultationFee || 500,
        roomNumber: doctorToEdit.roomNumber || 'Room 101',
        bio: doctorToEdit.bio || '',
        avatarUrl: doctorToEdit.avatarUrl || '',
        isAvailable: doctorToEdit.isAvailable !== undefined ? doctorToEdit.isAvailable : true,
      });
    } else {
      setFormData({
        name: '',
        email: '',
        password: '',
        phone: '',
        departmentId: '',
        specialization: '',
        qualification: '',
        experienceYears: 5,
        consultationFee: 500,
        roomNumber: 'Room 101',
        bio: '',
        avatarUrl: '',
        isAvailable: true,
      });
    }
  }, [doctorToEdit, isOpen]);

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
    try {
      if (doctorToEdit) {
        await adminApi.updateDoctor(doctorToEdit._id, formData);
        toast.success('Doctor updated successfully');
      } else {
        await adminApi.createDoctor(formData);
        toast.success('Doctor created and registered successfully');
      }
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      toast.error(err.message || 'Operation failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={doctorToEdit ? 'Edit Doctor Profile' : 'Register New Specialist Doctor'}
      maxWidth="max-w-2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-3 text-xs">
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
              placeholder="Dr. Jane Smith"
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
              disabled={!!doctorToEdit}
              value={formData.email}
              onChange={handleChange}
              placeholder="dr.jane@medibook.com"
              className="w-full rounded-xl border border-slate-300 p-2.5 disabled:bg-slate-100"
            />
          </div>

          {!doctorToEdit && (
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
          )}

          <div>
            <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
              Mobile Phone (for SMS alerts) *
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
              Department *
            </label>
            <select
              required
              name="departmentId"
              value={formData.departmentId}
              onChange={handleChange}
              className="w-full rounded-xl border border-slate-300 p-2.5 bg-white"
            >
              <option value="">Select Department</option>
              {departments.map((dept) => (
                <option key={dept._id} value={dept._id}>
                  {dept.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
              Specialization *
            </label>
            <input
              type="text"
              required
              name="specialization"
              value={formData.specialization}
              onChange={handleChange}
              placeholder="e.g. Interventional Cardiology"
              className="w-full rounded-xl border border-slate-300 p-2.5"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
              Qualifications *
            </label>
            <input
              type="text"
              required
              name="qualification"
              value={formData.qualification}
              onChange={handleChange}
              placeholder="MBBS, MD, FACC"
              className="w-full rounded-xl border border-slate-300 p-2.5"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
              Consultation Fee (₹) *
            </label>
            <input
              type="number"
              required
              min="0"
              name="consultationFee"
              value={formData.consultationFee}
              onChange={handleChange}
              className="w-full rounded-xl border border-slate-300 p-2.5"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
              Experience (Years)
            </label>
            <input
              type="number"
              min="0"
              name="experienceYears"
              value={formData.experienceYears}
              onChange={handleChange}
              className="w-full rounded-xl border border-slate-300 p-2.5"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
              Room / Suite
            </label>
            <input
              type="text"
              name="roomNumber"
              value={formData.roomNumber}
              onChange={handleChange}
              placeholder="Suite 204, Wing A"
              className="w-full rounded-xl border border-slate-300 p-2.5"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
            Doctor Bio & Clinical Focus
          </label>
          <textarea
            rows={2}
            name="bio"
            value={formData.bio}
            onChange={handleChange}
            placeholder="Physician clinical background and expertise..."
            className="w-full text-xs rounded-xl border border-slate-300 p-2.5"
          />
        </div>

        <div className="flex items-center gap-2 pt-1">
          <input
            type="checkbox"
            id="isAvailable"
            name="isAvailable"
            checked={formData.isAvailable}
            onChange={handleChange}
            className="w-4 h-4 text-cyan-600 rounded border-slate-300"
          />
          <label htmlFor="isAvailable" className="text-xs font-bold text-slate-700 cursor-pointer">
            Doctor is Active & Available for Consultations
          </label>
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-semibold text-xs hover:bg-slate-100"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="px-6 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-xs shadow-md shadow-cyan-600/30 transition disabled:opacity-50"
          >
            {submitting ? 'Saving...' : doctorToEdit ? 'Save Changes' : 'Create Doctor'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default DoctorFormModal;
