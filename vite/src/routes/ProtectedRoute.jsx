// frontend-template/vite/src/routes/ProtectedRoute.jsx
import { Navigate } from "react-router-dom";
import { useAuth } from "contexts/auth/AuthContext";

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  const base = import.meta.env.BASE_URL; // "/formation/"

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        Loading...
      </div>
    );
  }

  // ✅ Redirect correctly inside basename
  if (!user) return <Navigate to={`${base}login`} replace />;

  return children;
}
