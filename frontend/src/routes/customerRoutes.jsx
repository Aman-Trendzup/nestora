import { Route } from "react-router";
import ProtectedRoute from "./ProtectedRoute";
import CustomerLayout from "../layouts/CustomerLayout";
import MyBookings from "../pages/customer/MyBookings";
import CustomerProfile from "../pages/customer/Profile";

const customerRoutes = (
  <Route element={<ProtectedRoute allowedRoles={["customer", "owner"]} />}>
    <Route element={<CustomerLayout />}>
      <Route path="/customer/bookings" element={<MyBookings />} />
      <Route path="/customer/profile" element={<CustomerProfile />} />
    </Route>
  </Route>
);

export default customerRoutes;

