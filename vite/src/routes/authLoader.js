import { redirect } from "react-router-dom";

export async function rootRedirectLoader() {
  const base = import.meta.env.BASE_URL; // "/formation/"
  const apiUrl = import.meta.env.VITE_API_URL;

  try {
    const res = await fetch(`${apiUrl}/auth/me`, {
      credentials: "include"
    });

    if (res.ok) {
      const user = await res.json();
      const dashboardPath =
        user?.role === "EQUIPMENT_MANAGER" || user?.role === "TRAINER"
          ? "em/dashboard"
          : "dashboard";

      return redirect(`${base}${dashboardPath}`);
    }
  } catch (err) {
    console.error("Error fetching current user in loader", err);
  }

  return redirect(`${base}login`);
}
