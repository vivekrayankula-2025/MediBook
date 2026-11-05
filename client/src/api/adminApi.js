import api from './client';

export const adminApi = {
  getStats: () => api.get('/admin/stats'),
  getPatients: (params) => api.get('/admin/patients', { params }),
  getAllAppointments: (params) => api.get('/admin/appointments', { params }),
  createDoctor: (doctorData) => api.post('/admin/doctors', doctorData),
  updateDoctor: (id, doctorData) => api.put(`/admin/doctors/${id}`, doctorData),
};
