
import { Navigate, Outlet } from "react-router";
import { useAuth } from "../context/AuthContext";

const GuestRoute = () => {
  const { loading, isAuthenticated } = useAuth();

  // Wait until the existing session is checked
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-sm text-text-secondary">
          Checking your session...
        </p>
      </div>
    );
  }

  // Logged-in users should not access guest-only pages
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  // Allow guests to access the route
  return <Outlet />;
};

export default GuestRoute;
