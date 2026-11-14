import { Routes, Route } from "react-router";

import PublicRoutes from "./PublicRoutes";
import AuthRoutes from "./AuthRoutes";
import customerRoutes from "./customerRoutes";
import ownerRoutes from "./ownerRoutes";
import adminRoutes from "./adminRoutes";

import NotFound from "../pages/public/NotFound";

const AppRoutes = () => {
  return (
    <Routes>
      {PublicRoutes}
      {AuthRoutes}
      {customerRoutes}
      {ownerRoutes}
      {adminRoutes}

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;
