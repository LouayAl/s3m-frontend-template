// frontend-template/vite/src/routes/ProtectedRoute.jsx
import { Navigate } from 'react-router-dom';
import { useAuth } from 'contexts/auth/AuthContext';

export default function ProtectedRoute({ children }) {
  const { token, loading } = useAuth();

  // While loading, do not render anything
  if (loading)
    return (
        <div className="flex items-center justify-center h-screen">
        Loading...
        </div>
    );

  // If not logged in, redirect to /login
  if (!token) return <Navigate to="/login" replace />;

  // Logged in, render children
  return children;
}
