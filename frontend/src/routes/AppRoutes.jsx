import { Routes, Route } from "react-router";

import PublicRoutes from "./PublicRoutes";
import AuthRoutes from "./AuthRoutes";
// import CustomerRoutes from "./CustomerRoutes";
// import OwnerRoutes from "./OwnerRoutes";

import NotFound from "../pages/public/NotFound";

const AppRoutes = () => {
  return (
    <Routes>
      {PublicRoutes}
      {AuthRoutes}
      {/* {CustomerRoutes}
      {OwnerRoutes} */}

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;