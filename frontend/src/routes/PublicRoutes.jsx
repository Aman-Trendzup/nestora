import { Route } from "react-router";

import MainLayout from "../layouts/MainLayout";
import Home from "../pages/public/Home"
import About from "../pages/public/AboutUs";
import Contact from "../pages/public/Contact";
import ExploreSpaces from "../pages/public/WorkspaceListing";
import WorkspaceDetails from "../pages/public/WorkspaceDetails";
import PrivacyPolicy from "../pages/public/PrivacyPolicy";
import TermsOfUse from "../pages/public/TermsOfUse";
import CancellationPolicy from "../pages/public/CancellationPolicy";

const PublicRoutes = (
  <>
    <Route element={<MainLayout />}>
      <Route path="/" element={<Home />} />
      <Route path="/about" element={<About />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/workspaces" element={<ExploreSpaces />} />
      <Route path="/workspaces/:slug" element={<WorkspaceDetails />} />
      <Route path="/privacy-policy" element={<PrivacyPolicy />} />
      <Route path="/terms" element={<TermsOfUse />} />
      <Route path="/terms-of-use" element={<TermsOfUse />} />
      <Route path="/cancellation-policy" element={<CancellationPolicy />} />
    </Route>
  </>
);

export default PublicRoutes;