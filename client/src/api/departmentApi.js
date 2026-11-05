import api from './client';

export const departmentApi = {
  getDepartments: () => api.get('/departments'),
  getDepartmentById: (id) => api.get(`/departments/${id}`),
  createDepartment: (data) => api.post('/departments', data),
  updateDepartment: (id, data) => api.put(`/departments/${id}`, data),
  deleteDepartment: (id) => api.delete(`/departments/${id}`),
};
