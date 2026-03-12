// frontend-template/vite/src/api/kpiApi.js
import api from "./axios";

function buildYearsParams(years = []) {
  const params = new URLSearchParams();
  if (Array.isArray(years) && years.length > 0) {
    years.filter((y) => y != null).forEach((y) => params.append("years", y));
  }
  return params;
}

export const getClientKpis = async (entrepriseId, years = []) => {
  if (!entrepriseId) throw new Error("Entreprise ID is required");
  try {
    const params = buildYearsParams(years);
    const response = await api.get(`/clients/${entrepriseId}/kpis`, { params });
    return response.data;
  } catch (error) {
    console.error("Failed to fetch KPIs:", error);
    throw error;
  }
};

export const getAvailableYears = async (entrepriseId) => {
  if (!entrepriseId) throw new Error("Entreprise ID is required");
  try {
    const response = await api.get(`/clients/${entrepriseId}/kpis/years`);
    return (response.data ?? []).filter((y) => y != null);
  } catch (error) {
    console.error("Failed to fetch available years:", error);
    throw error;
  }
};

/**
 * Fetch total-growth chart data.
 * @param {number}   entrepriseId
 * @param {string}   period        - "monthly" | "yearly" | "daily"
 * @param {string}   month         - "YYYY-MM" (required for daily)
 * @param {number[]} years         - selected years from the filter
 */
export const getClientTotalGrowth = async (
  entrepriseId,
  period = "monthly",
  month = "",
  years = []
) => {
  if (!entrepriseId) throw new Error("Entreprise ID is required");
  if (period === "daily" && !month) throw new Error("Month is required for daily period");

  try {
    const params = new URLSearchParams();
    params.append("period", period);
    if (month) params.append("month", month);
    if (Array.isArray(years) && years.length > 0) {
      years.filter((y) => y != null).forEach((y) => params.append("years", y));
    }

    const response = await api.get(`/clients/${entrepriseId}/kpis/total-growth`, { params });
    const data = response.data;

    if (data?.series) {
      data.series = data.series.map((s) => ({
        name: s.name || "Unknown",
        data: Array.isArray(s.data)
          ? s.data.map((v) => (v === null || v === undefined ? 0 : v))
          : [],
      }));
    }

    if (!Array.isArray(data.categories))    data.categories = [];
    if (!data.topFormationsByMonth)          data.topFormationsByMonth = {};

    return data;
  } catch (error) {
    console.error("Failed to fetch total growth KPIs:", error);
    throw error;
  }
};