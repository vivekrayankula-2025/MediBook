import api from './client';

export const doctorApi = {
  getDoctors: (params) => api.get('/doctors', { params }),
  getDoctorById: (id) => api.get(`/doctors/${id}`),
  getAvailableSlots: (id, date) => api.get(`/doctors/${id}/slots`, { params: { date } }),
  updateSchedule: (scheduleData) => api.put('/doctors/schedule', scheduleData),
  getDoctorAppointments: (params) => api.get('/doctors/me/appointments', { params }),
  updateConsultation: (id, consultationData) =>
    api.put(`/doctors/appointments/${id}/consultation`, consultationData),
};
