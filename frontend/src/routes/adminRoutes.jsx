import { Route } from "react-router";
import ProtectedRoute from "./ProtectedRoute";
import AdminLayout from "../layouts/AdminLayout";
import AdminDashboard from "../pages/admin/AdminDashboard";
import AdminApprovals from "../pages/admin/AdminApprovals";
import AdminWorkspaces from "../pages/admin/AdminWorkspaces";
import AdminUsers from "../pages/admin/AdminUsers";
import AdminBookings from "../pages/admin/AdminBookings";
import CustomerProfile from "../pages/customer/Profile";

const adminRoutes = (
  <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
    <Route element={<AdminLayout />}>
      <Route path="/admin/dashboard" element={<AdminDashboard />} />
      <Route path="/admin/approvals" element={<AdminApprovals />} />
      <Route path="/admin/workspaces" element={<AdminWorkspaces />} />
      <Route path="/admin/users" element={<AdminUsers />} />
      <Route path="/admin/reservations" element={<AdminBookings />} />
      <Route path="/admin/profile" element={<CustomerProfile />} />
    </Route>
  </Route>
);

export default adminRoutes;

