// frontend-template/vite/src/api/kpiApi.js
import axios from "./axios"; // your axios instance

export const getClientKpis = async (entrepriseId, token) => {
  if (!entrepriseId) throw new Error("Entreprise ID is required");
  if (!token) throw new Error("Token is required");

  try {
    const response = await axios.get(`/clients/${entrepriseId}/kpis`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Failed to fetch KPIs:", error);
    throw error;
  }
};