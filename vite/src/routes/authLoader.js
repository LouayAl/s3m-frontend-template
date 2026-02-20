import { redirect } from "react-router-dom";

export async function rootRedirectLoader() {
  const base = import.meta.env.BASE_URL; // "/formation/"
  const apiUrl = import.meta.env.VITE_API_URL;

  try {
    const res = await fetch(`${apiUrl}/auth/me`, {
      credentials: "include"
    });

    if (res.ok) {
      return redirect(`${base}dashboard`);
    }
  } catch (err) {
    console.error("Error fetching current user in loader", err);
  }

  return redirect(`${base}login`);
}
