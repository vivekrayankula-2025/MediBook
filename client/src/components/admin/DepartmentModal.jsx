import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import { departmentApi } from '../../api/departmentApi';
import toast from 'react-hot-toast';

const DepartmentModal = ({ isOpen, onClose, departmentToEdit, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    headOfDepartment: '',
    roomLocation: '',
    icon: 'Activity',
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (departmentToEdit) {
      setFormData({
        name: departmentToEdit.name || '',
        code: departmentToEdit.code || '',
        description: departmentToEdit.description || '',
        headOfDepartment: departmentToEdit.headOfDepartment || '',
        roomLocation: departmentToEdit.roomLocation || '',
        icon: departmentToEdit.icon || 'Activity',
      });
    } else {
      setFormData({
        name: '',
        code: '',
        description: '',
        headOfDepartment: '',
        roomLocation: '',
        icon: 'Activity',
      });
    }
  }, [departmentToEdit, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (departmentToEdit) {
        await departmentApi.updateDepartment(departmentToEdit._id, formData);
        toast.success('Department updated successfully');
      } else {
        await departmentApi.createDepartment(formData);
        toast.success('Department created successfully');
      }
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      toast.error(err.message || 'Failed to save department');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={departmentToEdit ? 'Edit Hospital Department' : 'Add New Department'}
      maxWidth="max-w-lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        <div>
          <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
            Department Name *
          </label>
          <input
            type="text"
            required
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="e.g. Cardiology & Heart Care"
            className="w-full rounded-xl border border-slate-300 p-2.5"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
              Code (Unique) *
            </label>
            <input
              type="text"
              required
              name="code"
              value={formData.code}
              onChange={handleChange}
              placeholder="e.g. CARD"
              className="w-full rounded-xl border border-slate-300 p-2.5 uppercase"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
              Location / Wing
            </label>
            <input
              type="text"
              name="roomLocation"
              value={formData.roomLocation}
              onChange={handleChange}
              placeholder="Wing A, Level 2"
              className="w-full rounded-xl border border-slate-300 p-2.5"
            />
          </div>
        </div>

        <div>
          <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
            Head of Department
          </label>
          <input
            type="text"
            name="headOfDepartment"
            value={formData.headOfDepartment}
            onChange={handleChange}
            placeholder="Dr. Sarah Jenkins, MD"
            className="w-full rounded-xl border border-slate-300 p-2.5"
          />
        </div>

        <div>
          <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
            Description *
          </label>
          <textarea
            required
            rows={3}
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Department medical scope, specialties, and equipment..."
            className="w-full rounded-xl border border-slate-300 p-2.5"
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-semibold"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white font-bold transition disabled:opacity-50"
          >
            {submitting ? 'Saving...' : departmentToEdit ? 'Save Changes' : 'Create Department'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default DepartmentModal;
