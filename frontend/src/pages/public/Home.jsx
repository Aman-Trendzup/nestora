import Hero from '../../components/HomePage/Hero'
import WorkspaceTypes from '../../components/HomePage/WorkspacesType'
import FeaturedWorkspaces from '../../components/HomePage/FeaturedWorkspaces'
import PopularLocations from '../../components/HomePage/PopularLocations'
import WhyNestora from '../../components/HomePage/WhyNestora'
import HowItWorks from '../../components/HomePage/HowItWorks'
import Testimonials from '../../components/HomePage/Testimonials'

export default function Home(){
    return(
        <>
        <Hero/>
<WorkspaceTypes/>
<FeaturedWorkspaces/>
<PopularLocations/>
<WhyNestora/>
<HowItWorks/>
<Testimonials/>
        </>
    )
}