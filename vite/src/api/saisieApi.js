// frontend-template/vite/src/api/saisieApi.js
import api from './axios';

export const getFormateurs = () => api.get(`/saisie/formateurs`);
export const getEntreprises = () => api.get(`/saisie/entreprises`);
export const getFormations = () => api.get(`/saisie/formations`);


