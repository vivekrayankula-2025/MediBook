import api from './client';

export const smsApi = {
  getSMSLogs: (params) => api.get('/sms/logs', { params }),
  getSMSStats: () => api.get('/sms/stats'),
  retrySMS: (id) => api.post(`/sms/retry/${id}`),
};
