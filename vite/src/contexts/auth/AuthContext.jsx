// frontend-template/vite/src/contexts/auth/AuthContext.jsx

import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();
const API_URL = import.meta.env.VITE_API_URL;
//console.log("🔍 API_URL in AuthContext:", API_URL);

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // ✅ Fetch current user from backend via cookie
  async function fetchCurrentUser() {

    try {
      const res = await fetch(`${API_URL}/auth/me`, {
        credentials: "include", // include cookies
      });

      if (res.ok) {
        const userData = await res.json();
        setUser(userData);
      } else {
        console.warn("⚠️ fetchCurrentUser failed with status:", res.status);
        setUser(null);
      }
    } catch (err) {
      console.error("❌ fetchCurrentUser error:", err);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchCurrentUser();
  }, []);

// Login: call backend, cookie is set automatically
async function login(email, password) {

  try {
    // Case A: login with credentials
    if (email && password) {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
        credentials: "include", // cookie will be set by backend
      });

      if (!res.ok) {
        const errorData = await res.json();
        console.error("❌ login failed:", errorData);
        throw new Error(errorData.message || "Login failed");
      }

    }

    // Case B: fetch current user from /me (cookie)
    const resUser = await fetch(`${API_URL}/auth/me`, {
      credentials: "include", // include JWT cookie
    });

    if (resUser.ok) {
      const userData = await resUser.json();
      setUser(userData);
      return userData;
    } else {
      console.warn("⚠️ /me returned status", resUser.status);
      setUser(null);
      return null;
    }
  } catch (err) {
    console.error("❌ login error:", err);
    setUser(null);
    throw err;
  }
}


  // Logout: call backend to clear cookie
  async function logout() {

    try {
      await fetch(`${API_URL}/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
      console.log("✅ logout request sent");
    } catch (err) {
      console.error("❌ Logout failed:", err);
    } finally {
      setUser(null);
    }
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
