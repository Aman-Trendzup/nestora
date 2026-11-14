import { Navigate } from "react-router";
import { useAuth } from "../../context/AuthContext";
import Hero from '../../components/HomePage/Hero'
import WorkspaceTypes from '../../components/HomePage/WorkspacesType'
import FeaturedWorkspaces from '../../components/HomePage/FeaturedWorkspaces'
import PopularLocations from '../../components/HomePage/PopularLocations'
import WhyNestora from '../../components/HomePage/WhyNestora'
import HowItWorks from '../../components/HomePage/HowItWorks'
import Testimonials from '../../components/HomePage/Testimonials'
import FAQ from '../../components/common/FAQ'

export default function Home(){
    const { user, isAuthenticated } = useAuth();

    // Prevent owner or admin from viewing the public home page
    if (isAuthenticated && user?.role === "owner") {
      return <Navigate to="/owner/dashboard" replace />;
    }

    if (isAuthenticated && user?.role === "admin") {
      return <Navigate to="/admin/dashboard" replace />;
    }

    return(
        <>
          <Hero/>
          <WorkspaceTypes/>
          <FeaturedWorkspaces/>
          <PopularLocations/>
          <WhyNestora/>
          <HowItWorks/>
          <Testimonials/>
          <FAQ/>
        </>
    )
}