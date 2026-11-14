import { Outlet, Navigate } from "react-router";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/common/Navbar";
import Footer from "../components/common/Footer";

const CustomerLayout = () => {
  const { user, isAuthenticated } = useAuth();

  // If user is owner or admin, do not render customer layout/navbar
  if (isAuthenticated && user?.role === "owner") {
    return <Navigate to="/owner/dashboard" replace />;
  }

  if (isAuthenticated && user?.role === "admin") {
    return <Navigate to="/admin/dashboard" replace />;
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      <main className="flex-1">
        <Outlet />
      </main>

      <Footer />
    </div>
  );
};

export default CustomerLayout;
