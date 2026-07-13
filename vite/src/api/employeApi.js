// frontend-template/vite/src/api/employeApi.js
import api from "./axios";

const BASE_URL = "/employes";

// Get all employees (used by ParticipantsModal — do not paginate)
// Optional entrepriseId — only honored for ADMIN, ignored for everyone else.
export const getAllEmployes = async (entrepriseId) => {
  const params = entrepriseId == null ? {} : { entrepriseId };
  const res = await api.get(BASE_URL, { params });
  return res.data;
};

// Get paginated employees (used by EmployesPage)
// Returns: { content: [], totalElements, totalPages, number, size }
export const getEmployesPaginated = async ({ page = 0, size = 20, search = "", entrepriseId = null, sortBy = "idEmploye", sortDir = "desc" } = {}) => {
  const params = { page, size, sortBy, sortDir };
  if (search)       params.search       = search;
  if (entrepriseId) params.entrepriseId = entrepriseId;
  const res = await api.get(`${BASE_URL}/paginated`, { params });
  return res.data;
};

// Search employees by keyword
export const searchEmployes = async (keyword) => {
  const res = await api.get(`${BASE_URL}/search`, { params: { keyword } });
  return res.data;
};

// Create employee
export const createEmploye = async (payload) => {
  const res = await api.post(BASE_URL, payload);
  return res.data;
};

// Update employee
export const updateEmploye = async (id, payload) => {
  const res = await api.put(`${BASE_URL}/${id}`, payload);
  return res.data;
};

// Delete employee
export const deleteEmploye = async (id) => {
  const res = await api.delete(`${BASE_URL}/${id}`);
  return res.data;
};

// Import employees from Excel
export const importEmployes = async (file) => {
  const formData = new FormData();
  formData.append("file", file);
  const res = await api.post("/employes/import", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};

export const getEmEmployes = async () => {
  const res = await api.get('/em/employes');
  return res.data;
};