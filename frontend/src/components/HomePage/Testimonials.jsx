import { useState, useEffect, useRef } from "react";
import { FiChevronLeft, FiChevronRight, FiCheckCircle } from "react-icons/fi";
import boy1 from "../../assets/images/home/reviews/boy1.webp"
import boy2 from "../../assets/images/home/reviews/boy2.webp"
import boy3 from "../../assets/images/home/reviews/boy3.webp"
import girl1 from "../../assets/images/home/reviews/girl1.webp"
import girl2 from "../../assets/images/home/reviews/girl2.webp"

const testimonials = [
  {
    id: 1,
    company: "Nexus Labs",
    companyCategory: "AI Tech Startup",
    headline: "Found our 12-person cabin in under 5 minutes.",
    quote:
      "Finding flexible, verified team spaces in central commercial hubs used to be a nightmare of long leases and lock-in deposits. With Nestora, we filtered by date and capacity, reserved a fully equipped private office, and paid directly at the venue. It has transformed how our hybrid team operates.",
    author: "Arjun Mehta",
    role: "Founder & CEO",
    avatar: boy1,
    verifiedBadge: "Verified Customer",
    stats: "Booked 14 Sessions",
  },
  {
    id: 2,
    company: "AltSpace Coworking",
    companyCategory: "Workspace Owner & Partner",
    headline: "Our meeting room occupancy jumped 40%.",
    quote:
      "As a workspace host, managing multi-room availability across desks and conference suites was always chaotic. Nestora's owner portal gives us real-time control over our slots and transparent pricing. The pay-at-venue model eliminates payment gateway drop-offs and brings verified professionals to our doors daily.",
    author: "Priya Sharma",
    role: "Director of Operations",
    avatar: girl1,
    verifiedBadge: "Verified Host",
    stats: "3 Hubs Listed",
  },
  {
    id: 3,
    company: "Studio Horizon",
    companyCategory: "Design & Product Advisory",
    headline: "Zero deposit friction, 100% reliable spaces.",
    quote:
      "I frequently host client sprint reviews and need pristine meeting rooms equipped with 4K displays and high-speed fiber. Nestora lets me select exact hours with locked pricing and no hidden venue fees. The digital reference code makes check-in smooth and completely professional.",
    author: "Rohan Roy",
    role: "Principal Product Designer",
    avatar: boy2,
    verifiedBadge: "Verified Customer",
    stats: "Active Pro Member",
  },
  {
    id: 4,
    company: "Zenith Executive Suites",
    companyCategory: "Workspace Owner & Host",
    headline: "Curation and verified bookings we can trust.",
    quote:
      "Having an admin-approved listing gives our premium executive suites instant credibility. We receive serious corporate bookings, set our operating hours with precision, and our front desk staff loves the straightforward offline payment settlement when guests arrive.",
    author: "Devika Nair",
    role: "Head of Real Estate Partnerships",
    avatar: girl2,
    verifiedBadge: "Verified Host",
    stats: "Top Rated Host",
  },
  {
    id: 5,
    company: "CloudMatrix Software",
    companyCategory: "Distributed Engineering Team",
    headline: "The ultimate flexible workspace protocol.",
    quote:
      "When our remote engineering pods gather for quarterly planning, we don't want rigid monthly subscriptions. Nestora's location and budget filters give us immediate access to high-performance private workspaces with zero hassle.",
    author: "Vikramaditya Sen",
    role: "VP of Engineering",
    avatar: boy3,
    verifiedBadge: "Verified Customer",
    stats: "5 Cities Booked",
  },
];

export default function Testimonials() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const total = testimonials.length;

  // Auto-advance animation timer (every 5 seconds)
  useEffect(() => {
    if (isPaused) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % total);
    }, 5000);

    return () => clearInterval(timer);
  }, [isPaused, total]);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + total) % total);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % total);
  };

  const current = testimonials[currentIndex];
  const prevIndex = (currentIndex - 1 + total) % total;
  const nextIndex = (currentIndex + 1) % total;

  return (
    <section className="relative overflow-hidden bg-[#0c1017] px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-28 text-white">
      {/* Background ambient lighting */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-0 h-96 w-full -translate-x-1/2 bg-gradient-to-b from-primary/10 via-transparent to-transparent blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-40 top-1/3 size-96 rounded-full bg-emerald-500/5 blur-3xl"
      />

      <div className="relative mx-auto max-w-7xl">
        {/* Header Section */}
        <div className="mx-auto max-w-2xl text-center mb-12 sm:mb-16">

          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
            Hear from Brands & Hosts That Trust Us
          </h2>

          <p className="mt-4 text-sm leading-relaxed text-slate-400 sm:text-base sm:leading-7">
            From fast-growing startup teams booking on-demand private suites to
            workspace owners maximizing occupancy—here is how Nestora powers the
            future of flexible work.
          </p>
        </div>

        {/* Carousel Viewport Container */}
        <div
          className="relative mx-auto max-w-6xl"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          <div className="relative flex items-center justify-center min-h-[460px] sm:min-h-[420px] lg:min-h-[380px]">

            {/* Left Adjacent Preview Card (Desktop) */}
            <div
              onClick={handlePrev}
              className="hidden lg:block absolute left-0 w-[240px] xl:w-[280px] h-[320px] rounded-2xl bg-[#141923] border border-white/5 p-6 opacity-30 scale-[0.88] blur-[0.5px] cursor-pointer transition-all duration-500 hover:opacity-50 overflow-hidden select-none -translate-x-6 z-0"
              title="View previous testimonial"
            >
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xs font-bold text-slate-400">
                  {testimonials[prevIndex].company}
                </span>
              </div>
              <p className="text-xs text-slate-400 font-semibold line-clamp-2">
                "{testimonials[prevIndex].headline}"
              </p>
              <p className="text-[11px] text-slate-500 mt-2 line-clamp-3">
                {testimonials[prevIndex].quote}
              </p>
              <div className="absolute bottom-4 left-6 flex items-center gap-2">
                <img
                  src={testimonials[prevIndex].avatar}
                  alt=""
                  className="size-7 rounded-full object-cover grayscale"
                />
                <span className="text-[11px] text-slate-400 truncate">
                  {testimonials[prevIndex].author}
                </span>
              </div>
            </div>

            {/* Active Center Card (High Focus) */}
            <div className="relative z-10 w-full max-w-3xl rounded-[24px] sm:rounded-[28px] bg-[#161b26] border border-white/10 shadow-2xl p-6 sm:p-8 lg:p-10 transition-all duration-500 ease-out">
              <div className="grid gap-8 md:grid-cols-[1.25fr_1fr] md:items-center">

                {/* Left Side: Brand, Headline, Quote & Credentials */}
                <div className="flex flex-col justify-between space-y-4">
                  {/* Brand & Badge Header */}
                  <div className="flex items-center justify-between gap-3 border-b border-white/10 pb-4">
                    <div className="flex items-center gap-2.5">
                      <div className="flex size-8 items-center justify-center rounded-lg bg-white/10 text-white font-bold text-xs tracking-wider">
                        {current.company.charAt(0)}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-white tracking-tight">
                          {current.company}
                        </h4>
                        <span className="text-[11px] text-slate-400 block">
                          {current.companyCategory}
                        </span>
                      </div>
                    </div>

                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-semibold text-emerald-400 border border-emerald-500/20">
                      <FiCheckCircle className="size-3" />
                      {current.verifiedBadge}
                    </span>
                  </div>

                  {/* Headline */}
                  <h3 className="text-lg sm:text-xl font-bold leading-snug text-white tracking-tight">
                    {current.headline}
                  </h3>

                  {/* Quote */}
                  <p className="text-xs sm:text-sm leading-relaxed text-slate-300 font-normal">
                    "{current.quote}"
                  </p>

                  {/* Author Meta */}
                  <div className="pt-2 flex items-center justify-between border-t border-white/5">
                    <div>
                      <p className="text-sm font-bold text-white">
                        {current.author}
                      </p>
                      <p className="text-xs text-slate-400">
                        {current.role}
                      </p>
                    </div>

                    <span className="text-[11px] font-mono text-slate-400 bg-white/5 px-2.5 py-1 rounded-md border border-white/5">
                      {current.stats}
                    </span>
                  </div>
                </div>

                {/* Right Side: Professional High-Contrast Studio Portrait */}
                <div className="relative h-64 sm:h-72 md:h-80 w-full overflow-hidden rounded-2xl bg-slate-800 border border-white/10 shadow-inner group">
                  <img
                    key={current.avatar}
                    src={current.avatar}
                    alt={current.author}
                    className="h-full w-full object-cover object-top grayscale contrast-110 transition-all duration-700 ease-out group-hover:scale-105"
                  />
                  {/* Subtle inner dark gradient */}
                  <div
                    aria-hidden="true"
                    className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"
                  />
                  <div className="absolute bottom-3 left-3 text-[11px] text-white/80 font-medium bg-black/50 backdrop-blur-xs px-2.5 py-1 rounded-md">
                    {current.author} • {current.company}
                  </div>
                </div>

              </div>
            </div>

            {/* Right Adjacent Preview Card (Desktop) */}
            <div
              onClick={handleNext}
              className="hidden lg:block absolute right-0 w-[240px] xl:w-[280px] h-[320px] rounded-2xl bg-[#141923] border border-white/5 p-6 opacity-30 scale-[0.88] blur-[0.5px] cursor-pointer transition-all duration-500 hover:opacity-50 overflow-hidden select-none translate-x-6 z-0"
              title="View next testimonial"
            >
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xs font-bold text-slate-400">
                  {testimonials[nextIndex].company}
                </span>
              </div>
              <p className="text-xs text-slate-400 font-semibold line-clamp-2">
                "{testimonials[nextIndex].headline}"
              </p>
              <p className="text-[11px] text-slate-500 mt-2 line-clamp-3">
                {testimonials[nextIndex].quote}
              </p>
              <div className="absolute bottom-4 left-6 flex items-center gap-2">
                <img
                  src={testimonials[nextIndex].avatar}
                  alt=""
                  className="size-7 rounded-full object-cover grayscale"
                />
                <span className="text-[11px] text-slate-400 truncate">
                  {testimonials[nextIndex].author}
                </span>
              </div>
            </div>

          </div>

          {/* Navigation Controls: Arrows Only */}
          <div className="mt-8 sm:mt-10 flex items-center justify-center gap-3">
            {/* Prev Arrow */}
            <button
              type="button"
              onClick={handlePrev}
              aria-label="Previous testimonial"
              className="flex size-11 items-center justify-center rounded-full border border-white/15 bg-white/5 text-white transition-all hover:bg-white/15 hover:scale-105 active:scale-95"
            >
              <FiChevronLeft className="size-5" />
            </button>

            {/* Next Arrow */}
            <button
              type="button"
              onClick={handleNext}
              aria-label="Next testimonial"
              className="flex size-11 items-center justify-center rounded-full border border-white/15 bg-white/5 text-white transition-all hover:bg-white/15 hover:scale-105 active:scale-95"
            >
              <FiChevronRight className="size-5" />
            </button>
          </div>

        </div>
      </div>
    </section>
  );
}
