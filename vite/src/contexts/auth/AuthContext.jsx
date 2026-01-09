// frontend-template/vite/src/contexts/auth/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from "react";
import jwt_decode from "jwt-decode"; // ✅ proper import for Vite

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);

  // Load token from localStorage on first render
  useEffect(() => {
    const t = localStorage.getItem("token");

    if (t && t !== "undefined" && t !== "null") {
      const decoded = decodeToken(t);
      if (decoded) {
        setToken(t);
        setUser(decoded);
      } else {
        localStorage.removeItem("token");
      }
    }

    setLoading(false); // ✅ only after checking token
  }, []);

  // Login: save token and decode user
  function login(newToken) {
    if (!newToken) return;
    localStorage.setItem("token", newToken);
    setToken(newToken);
    setUser(decodeToken(newToken));
  }

  // Logout: clear token and user
  function logout() {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ token, user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

// Decode JWT safely and include prenom + nom
function decodeToken(token) {
  if (!token || typeof token !== "string") return null;

  try {
    const decoded = jwt_decode(token);

    if (!decoded.sub) return null;

    return {
      email: decoded.sub,
      role: decoded.role,
      entrepriseId: decoded.entrepriseId,
      prenom: decoded.prenom,
      nom: decoded.nom
    };
  } catch (err) {
    console.error("Failed to decode token:", err);
    return null;
  }
}
