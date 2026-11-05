import React, { useState } from 'react';
import Modal from '../common/Modal';
import { doctorApi } from '../../api/doctorApi';
import toast from 'react-hot-toast';
import { Plus, Trash2, CheckCircle2, Pill } from 'lucide-react';

const ConsultationModal = ({ isOpen, onClose, appointment, onSuccess }) => {
  const [diagnosis, setDiagnosis] = useState(appointment?.doctorDiagnosis || '');
  const [notes, setNotes] = useState(appointment?.notes || '');
  const [prescriptions, setPrescriptions] = useState(
    appointment?.prescriptions && appointment.prescriptions.length > 0
      ? appointment.prescriptions
      : []
  );
  const [submitting, setSubmitting] = useState(false);

  if (!appointment) return null;

  const handleAddMedicine = () => {
    setPrescriptions([
      ...prescriptions,
      {
        medicineName: '',
        dosage: '500mg',
        frequency: 'Twice daily after food',
        duration: '5 days',
        instructions: ''
      }
    ]);
  };

  const handleRemoveMedicine = (index) => {
    setPrescriptions(prescriptions.filter((_, i) => i !== index));
  };

  const handleMedicineChange = (index, field, value) => {
    const updated = [...prescriptions];
    updated[index][field] = value;
    setPrescriptions(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await doctorApi.updateConsultation(appointment._id, {
        doctorDiagnosis: diagnosis,
        notes,
        prescriptions,
        status: 'completed',
      });
      toast.success('Consultation record and e-prescription saved successfully!');
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      toast.error(err.message || 'Failed to save consultation records');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Clinical Consultation & Prescription" maxWidth="max-w-2xl">
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Patient Summary */}
        <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700 flex justify-between items-center">
          <div>
            <span className="font-bold text-slate-900 block">{appointment.patientId?.name}</span>
            <span className="text-slate-500">
              Age: {appointment.patientId?.age || 'N/A'} • Gender: {appointment.patientId?.gender || 'N/A'} • Blood: {appointment.patientId?.bloodGroup || 'N/A'}
            </span>
          </div>
          <span className="font-mono font-bold text-cyan-700 bg-cyan-50 px-2 py-0.5 rounded border border-cyan-200">
            {appointment.bookingReference}
          </span>
        </div>

        {/* Diagnosis */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Clinical Diagnosis <span className="text-rose-500">*</span>
          </label>
          <textarea
            required
            rows={2}
            value={diagnosis}
            onChange={(e) => setDiagnosis(e.target.value)}
            placeholder="e.g. Acute Bronchitis with secondary rhinitis..."
            className="w-full text-xs rounded-xl border border-slate-300 p-3 focus:outline-none focus:ring-2 focus:ring-cyan-500"
          />
        </div>

        {/* Clinical Advice & Notes */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Doctor's Advice & Clinical Notes
          </label>
          <textarea
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g. Rest for 3 days, drink warm fluids, review in 1 week if fever persists..."
            className="w-full text-xs rounded-xl border border-slate-300 p-3 focus:outline-none focus:ring-2 focus:ring-cyan-500"
          />
        </div>

        {/* Prescription Builder */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <Pill className="w-4 h-4 text-cyan-600" />
              Prescription Medicines
            </label>
            <button
              type="button"
              onClick={handleAddMedicine}
              className="text-xs font-bold text-cyan-600 hover:text-cyan-700 flex items-center gap-1 px-2.5 py-1 rounded-lg bg-cyan-50 border border-cyan-200 transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Medicine</span>
            </button>
          </div>

          {prescriptions.length === 0 ? (
            <p className="text-xs italic text-slate-400 p-3 bg-slate-50 rounded-xl text-center">
              No medications prescribed yet. Click "Add Medicine" above to prescribe.
            </p>
          ) : (
            <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
              {prescriptions.map((med, idx) => (
                <div
                  key={idx}
                  className="p-3 bg-slate-50 border border-slate-200 rounded-xl grid grid-cols-12 gap-2 items-center text-xs"
                >
                  <div className="col-span-4">
                    <input
                      type="text"
                      required
                      placeholder="Medicine Name (e.g. Amoxicillin)"
                      value={med.medicineName}
                      onChange={(e) => handleMedicineChange(idx, 'medicineName', e.target.value)}
                      className="w-full text-xs rounded-lg border border-slate-300 p-1.5"
                    />
                  </div>
                  <div className="col-span-2">
                    <input
                      type="text"
                      placeholder="Dosage (500mg)"
                      value={med.dosage}
                      onChange={(e) => handleMedicineChange(idx, 'dosage', e.target.value)}
                      className="w-full text-xs rounded-lg border border-slate-300 p-1.5"
                    />
                  </div>
                  <div className="col-span-3">
                    <input
                      type="text"
                      placeholder="Frequency (2x daily)"
                      value={med.frequency}
                      onChange={(e) => handleMedicineChange(idx, 'frequency', e.target.value)}
                      className="w-full text-xs rounded-lg border border-slate-300 p-1.5"
                    />
                  </div>
                  <div className="col-span-2">
                    <input
                      type="text"
                      placeholder="Duration (5 days)"
                      value={med.duration}
                      onChange={(e) => handleMedicineChange(idx, 'duration', e.target.value)}
                      className="w-full text-xs rounded-lg border border-slate-300 p-1.5"
                    />
                  </div>
                  <div className="col-span-1 text-right">
                    <button
                      type="button"
                      onClick={() => handleRemoveMedicine(idx)}
                      className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition"
                      title="Remove"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Buttons */}
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
            className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs flex items-center gap-2 shadow-md shadow-purple-600/30 transition disabled:opacity-50"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>{submitting ? 'Saving...' : 'Mark Consultation Completed'}</span>
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default ConsultationModal;
