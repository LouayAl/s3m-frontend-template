import api from "./axios";

const BASE_URL = "/formateurs";

export const getAllFormateurs = async () => {
  const res = await api.get(`${BASE_URL}/all`);
  return res.data;
};

export const createFormateur = async (payload) => {
  const res = await api.post(BASE_URL, payload);
  return res.data;
};

export const updateFormateur = async (id, payload) => {
  const res = await api.put(`${BASE_URL}/${id}`, payload);
  return res.data;
};

export const deleteFormateur = async (id) => {
  const res = await api.delete(`${BASE_URL}/${id}`);
  return res.data;
};