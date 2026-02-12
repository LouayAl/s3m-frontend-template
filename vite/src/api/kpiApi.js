// frontend-template/vite/src/api/kpiApi.js
import api from "./axios"; // your axios instance

export const getClientKpis = async (entrepriseId) => {
  if (!entrepriseId) throw new Error("Entreprise ID is required");

  try {
    const response = await api.get(`/clients/${entrepriseId}/kpis`);
    return response.data;
  } catch (error) {
    console.error("Failed to fetch KPIs:", error);
    throw error;
  }
};

export const getClientTotalGrowth = async (entrepriseId, period = "monthly", month = "") => {
  if (!entrepriseId) throw new Error("Entreprise ID is required");

  if (period === "daily" && !month) {
    throw new Error("Month is required for daily period");
  }

  try {
    const response = await api.get(`/clients/${entrepriseId}/kpis/total-growth`, {
      params: { period, month },
    });

    const data = response.data;

    if (data?.series) {
      data.series = data.series.map((s) => ({
        name: s.name || "Unknown",
        data: Array.isArray(s.data)
          ? s.data.map((v) => (v === null || v === undefined ? 0 : v))
          : [],
      }));
    }

    if (!Array.isArray(data.categories)) data.categories = [];
    if (!data.topFormationsByMonth) data.topFormationsByMonth = {};

    return data;
  } catch (error) {
    console.error("Failed to fetch total growth KPIs:", error);
    throw error;
  }
};
