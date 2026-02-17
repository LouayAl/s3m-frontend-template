// frontend-template/vite/src/api/employeApi.js
import api from "./axios";

const BASE_URL = "/employes";

// ✅ Get all employees
export const getAllEmployes = async () => {
  const res = await api.get(BASE_URL);
  return res.data;
};

// ✅ Search employees by keyword
export const searchEmployes = async (keyword) => {
  const res = await api.get(`${BASE_URL}/search`, { params: { keyword } });
  return res.data;
};

// ✅ Create employee
export const createEmploye = async (payload) => {
  const res = await api.post(BASE_URL, payload);
  return res.data; // must match EmployeResponseDto
};

// ✅ Update employee
export const updateEmploye = async (id, payload) => {
  const res = await api.put(`${BASE_URL}/${id}`, payload);
  return res.data;
};

// ✅ Delete employee
export const deleteEmploye = async (id) => {
  const res = await api.delete(`${BASE_URL}/${id}`);
  return res.data;
};

export const importEmployes = async (file) => {
  const formData = new FormData();
  formData.append("file", file);

  const res = await api.post("/employes/import", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return res.data; // backend message
};
