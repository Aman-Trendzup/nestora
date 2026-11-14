import React from "react";

import member1 from "../../assets/images/about/team/member1.webp";
import member2 from "../../assets/images/about/team/member2.webp";
import member3 from "../../assets/images/about/team/member3.webp";
import member4 from "../../assets/images/about/team/member4.webp";

const teamMembers = [
  {
    name: "Aarav Sharma",
    role: "Founder & CEO",
    image: member1,
    bio: "Aarav, B.Tech & MBA, brings 12+ years of experience leading marketplace platforms, PropTech initiatives, and collaborative community networks.",
  },
  {
    name: "Meera Patel",
    role: "VP of Partner Success",
    image: member2,
    bio: "Meera was previously Senior Director at top commercial workspace operators, with over a decade of space curation and host acquisition expertise.",
  },
  {
    name: "Rohan Sen",
    role: "Head of Product & UX",
    image: member3,
    bio: "Rohan has 9+ years crafting frictionless digital platforms, intuitive discovery maps, and role-based reservation workflows.",
  },
  {
    name: "Ananya Roy",
    role: "Chief Operations Officer",
    image: member4,
    bio: "Ananya brings 11+ years of leadership in operational audit standards, workspace verification protocols, and customer success excellence.",
  },
];

const AboutTeam = () => {
  return (
    <section className="bg-surface py-12 sm:py-16 lg:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header matching site style */}
        <div className="mx-auto max-w-2xl text-center mb-10 sm:mb-14">
          <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-text-secondary">
            Leadership & Team
          </p>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-semibold tracking-tight text-text-primary">
            Our team has over 50 years of combined experience.
          </h2>
          <p className="mt-3 text-xs sm:text-sm text-text-secondary leading-relaxed max-w-xl mx-auto">
            Our team brings tech innovation, commercial design, and hospitality excellence to ensure your workspace journey is seamless and reliable.
          </p>
        </div>

        {/* 4 Cards Grid matching site's card style */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {teamMembers.map((member) => (
            <article
              key={member.name}
              className="group rounded-lg sm:rounded-xl border border-border bg-surface p-6 text-center shadow-xs transition-shadow hover:shadow-md"
            >
              {/* Circular Avatar */}
              <div className="relative mx-auto mb-4 size-24">
                <img
                  src={member.image}
                  alt={member.name}
                  className="size-full rounded-full object-cover ring-2 ring-border shadow-xs"
                />
              </div>

              {/* Name & Role */}
              <h3 className="text-base font-semibold text-text-primary">
                {member.name}
              </h3>
              <p className="mt-0.5 text-xs font-medium text-primary">
                {member.role}
              </p>

              {/* Bio */}
              <p className="mt-3 text-xs text-text-secondary leading-relaxed">
                {member.bio}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default AboutTeam;
