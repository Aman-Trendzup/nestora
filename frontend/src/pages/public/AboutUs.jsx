import React from "react";
import AboutHero from "../../components/about/AboutHero";
import AboutStory from "../../components/about/AboutStory";
import AboutTeam from "../../components/about/AboutTeam";
import AboutStats from "../../components/about/AboutStats";
import AboutCta from "../../components/about/AboutCta";

const About = () => {
  return (
    <main className="min-h-screen bg-white text-text-primary selection:bg-primary/20">
      {/* 1. HERO SECTION: We set out to build a better way to work */}
      <AboutHero />

      {/* 2. STORY SECTION: Our Story ↘ & Founder's Vision */}
      <AboutStory />

      {/* 3. TEAM SECTION: Decades of combined experience */}
      <AboutTeam />

      {/* 4. STATS SECTION: Numbers speak for us best of all */}
      <AboutStats />

      {/* 5. CTA BANNER: Explore Workspaces */}
      <AboutCta />
    </main>
  );
};

export default About;
