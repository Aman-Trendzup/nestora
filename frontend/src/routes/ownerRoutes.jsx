import { Route } from "react-router";
import ProtectedRoute from "./ProtectedRoute";
import OwnerLayout from "../layouts/OwnerLayout";
import OwnerDashboard from "../pages/owner/OwnerDashboard";
import OwnerWorkspaces from "../pages/owner/OwnerWorkspaces";
import AddWorkspace from "../pages/owner/AddWorkspace";
import OwnerReservations from "../pages/owner/OwnerReservations";
import Contact from "../pages/public/Contact";
import CustomerProfile from "../pages/customer/Profile";

const ownerRoutes = (
  <Route element={<ProtectedRoute allowedRoles={["owner"]} />}>
    <Route element={<OwnerLayout />}>
      <Route path="/owner/dashboard" element={<OwnerDashboard />} />
      <Route path="/owner/workspaces" element={<OwnerWorkspaces />} />
      <Route path="/owner/workspaces/new" element={<AddWorkspace />} />
      <Route path="/owner/workspaces/edit/:id" element={<AddWorkspace isEdit={true} />} />
      <Route path="/owner/reservations" element={<OwnerReservations />} />
      <Route path="/owner/support" element={<Contact isOwnerSupport={true} />} />
      <Route path="/owner/profile" element={<CustomerProfile />} />
    </Route>
  </Route>
);

export default ownerRoutes;

