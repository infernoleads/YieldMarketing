// client/src/components/ProtectedRoute.jsx
import { Navigate, useLocation } from "react-router-dom";
import { useAuth, roleHome } from "@/lib/AuthContext";
import { Spinner } from "@/components/ui";

export default function ProtectedRoute({ children, roles }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center grid-bg">
        <Spinner label="Loading" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  // Role gate — bounce users to their own home if they wander off.
  if (roles && !roles.includes(user.role)) {
    return <Navigate to={roleHome(user.role)} replace />;
  }

  return children;
}
