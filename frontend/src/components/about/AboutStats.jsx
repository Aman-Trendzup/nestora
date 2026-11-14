import React, { useEffect, useRef } from "react";
import { animate, useInView } from "motion/react";

const stats = [
  {
    target: 500,
    suffix: "+",
    decimals: 0,
    title: "Handpicked Spaces",
    description:
      "Our curated catalog includes over 500+ verified coworking desks, quiet private cabins, and high-tech meeting rooms across leading business hubs.",
  },
  {
    target: 45000,
    suffix: "+",
    decimals: 0,
    title: "Reservation Hours",
    description:
      "As an open, modern workspace ecosystem, we have empowered over 45,000 productive work sessions and collaborative meetings for freelancers, startups, and agile teams.",
  },
  {
    target: 98.8,
    suffix: "%",
    decimals: 1,
    title: "Satisfaction Rate",
    description:
      "Customer satisfaction rating across verified workspace check-ins, powered by verified amenities, transparent pricing, and simple offline pay-at-venue convenience.",
  },
];

const StatCounter = ({ target, suffix = "", decimals = 0, isInView }) => {
  const nodeRef = useRef(null);

  useEffect(() => {
    if (!isInView) return;

    const node = nodeRef.current;
    if (!node) return;

    const controls = animate(0, target, {
      duration: 2,
      ease: "easeOut",
      onUpdate: (latest) => {
        const formatted =
          decimals > 0
            ? latest.toLocaleString("en-US", {
              minimumFractionDigits: decimals,
              maximumFractionDigits: decimals,
            })
            : Math.round(latest).toLocaleString("en-US");

        node.textContent = `${formatted}${suffix}`;
      },
    });

    return () => controls.stop();
  }, [isInView, target, suffix, decimals]);

  const initialDisplay =
    decimals > 0
      ? `0.${"0".repeat(decimals)}${suffix}`
      : `0${suffix}`;

  return <span ref={nodeRef}>{initialDisplay}</span>;
};

const AboutStats = () => {
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true });

  return (
    <section ref={sectionRef} className="py-12 sm:py-16 lg:py-20 bg-slate-300/20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Eyebrow and heading */}
        <div className="mb-8 sm:mb-12">
          <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-text-secondary">
            Numbers speak for us best of all
          </p>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-semibold tracking-tight text-text-primary">
            Measurable impact across every workspace.
          </h2>
        </div>

        {/* List of Stat Rows with Clean Dividers */}
        <div className="divide-y divide-border border-y border-border">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-8 items-center py-6 sm:py-8 "
            >
              {/* Big Stat Value */}
              <div className="md:col-span-4">
                <span className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-text-primary">
                  <StatCounter
                    target={stat.target}
                    suffix={stat.suffix}
                    decimals={stat.decimals}
                    isInView={isInView}
                  />
                </span>
                <span className="block mt-1 text-xs font-semibold uppercase tracking-wider text-primary">
                  {stat.title}
                </span>
              </div>

              {/* Explanatory Paragraph */}
              <div className="md:col-span-8">
                <p className="text-sm leading-relaxed text-text-secondary max-w-xl">
                  {stat.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default AboutStats;
