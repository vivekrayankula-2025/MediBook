import api from './client';

export const appointmentApi = {
  bookAppointment: (bookingData) => api.post('/appointments', bookingData),
  getMyAppointments: (params) => api.get('/appointments/my-appointments', { params }),
  getAppointmentById: (id) => api.get(`/appointments/${id}`),
  rescheduleAppointment: (id, rescheduleData) =>
    api.patch(`/appointments/${id}/reschedule`, rescheduleData),
  cancelAppointment: (id, cancelData) =>
    api.patch(`/appointments/${id}/cancel`, cancelData),
  approveAppointment: (id) => api.patch(`/appointments/${id}/approve`),
};
