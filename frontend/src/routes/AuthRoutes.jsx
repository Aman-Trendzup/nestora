
import { Route } from "react-router";

import AuthLayout from "../layouts/AuthLayout";
import GuestRoute from "./GuestRoutes";
import Login from "../pages/auth/login";
import Register from "../pages/auth/register";
import OwnerRegister from "../pages/auth/owner-register";

const AuthRoutes = (
  <Route element={<GuestRoute />}>
    <Route element={<AuthLayout />}>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/register/owner" element={<OwnerRegister />} />
    </Route>
  </Route>
);

export default AuthRoutes;
