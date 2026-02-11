// frontend-template/vite/src/api/kpiApi.js
import axios from "./axios"; // your axios instance

export const getClientKpis = async (entrepriseId, token) => {
  if (!entrepriseId) throw new Error("Entreprise ID is required");
  if (!token) throw new Error("Token is required");

  try {
    const response = await axios.get(`/clients/${entrepriseId}/kpis`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    console.error("Failed to fetch KPIs:", error);
    throw error;
  }
};

/**
 * Fetch only the total growth KPI data
 * period: 'daily', 'monthly', 'yearly'
 * month: 'YYYY-MM' string, required if period='daily'
 * Returns: { categories: [...], series: [...], topFormationsByMonth: {...} }
 */
export const getClientTotalGrowth = async (
  entrepriseId,
  token,
  period = "monthly",
  month = ""
) => {
  if (!entrepriseId) throw new Error("Entreprise ID is required");
  if (!token) throw new Error("Token is required");

  // Validate month for daily
  if (period === "daily" && !month) {
    throw new Error("Month is required for daily period");
  }

  try {
    const response = await axios.get(
      `/clients/${entrepriseId}/kpis/total-growth`,
      {
        params: { period, month },
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    const data = response.data;

    // Normalize daily/monthly/yearly data to avoid undefined/null
    if (data?.series) {
      data.series = data.series.map((s) => ({
        name: s.name || "Unknown",
        data: Array.isArray(s.data)
          ? s.data.map((v) => (v === null || v === undefined ? 0 : v))
          : [],
      }));
    }

    if (!Array.isArray(data.categories)) {
      data.categories = [];
    }

    if (!data.topFormationsByMonth) {
      data.topFormationsByMonth = {};
    }

    return data;
  } catch (error) {
    console.error("Failed to fetch total growth KPIs:", error);
    throw error;
  }
};
