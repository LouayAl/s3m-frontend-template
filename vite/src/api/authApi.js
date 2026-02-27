// frontend-template/vite/src/api/authApi.js
const API_URL = import.meta.env.VITE_API_URL;

export async function login({ email, password }) {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
    credentials: "include", // ✅ important: include cookies
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Login failed");
  }

  return response.json(); // { token, email, role, prenom, nom, entrepriseId }
}
