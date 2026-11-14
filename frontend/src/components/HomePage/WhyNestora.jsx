import { useState, useRef, useEffect } from "react";
import { Link } from "react-router";
import { FiArrowRight, FiChevronLeft, FiChevronRight } from "react-icons/fi";
import why1 from "../../assets/images/home/why/why1.avif"
import why2 from "../../assets/images/home/why/why2.avif"
import why3 from "../../assets/images/home/why/why3.avif"
import why4 from "../../assets/images/home/why/why4.avif"
import why5 from "../../assets/images/home/why/why5.avif"
import why6 from "../../assets/images/home/why/why6.avif"

const reasons = [
  {
    number: "01",
    watermark: "1",
    title: "On-demand agility, zero lease lock-in",
    description:
      "Reserve hot desks, private team cabins, or meeting rooms by the hour or full day. Complete flexibility with zero multi-month security deposits.",
    image: why1,
    badge: "Maximum Flexibility",
  },
  {
    number: "02",
    watermark: "2",
    title: "Admin-verified spaces & quality",
    description:
      "Every property is reviewed and approved by our team before going live. Guaranteed enterprise-grade Wi-Fi, power backup, and quiet acoustics.",
    image: why2,
    badge: "100% Curated",
  },
  {
    number: "03",
    watermark: "3",
    title: "Friction-free offline payment at venue",
    description:
      "Lock in transparent hourly rates online and settle payment directly when you check into the venue via UPI, card, or cash—no gateway fees.",
    image: why3,
    badge: "Pay on Arrival",
  },
  {
    number: "04",
    watermark: "4",
    title: "Precision search by location & budget",
    description:
      "Filter instantly by city micro-neighborhoods, exact check-in hours, capacity, and pricing to pinpoint the ideal workspace for your workday.",
    image: why4,
    badge: "Smart Filters",
  },
  {
    number: "05",
    watermark: "5",
    title: "Real-time availability with instant locks",
    description:
      "Never worry about arriving to an overbooked venue. Atomic database slot locking confirms your reservation in real time with a digital reference code.",
    image: why5,
    badge: "Guaranteed Seats",
  },
  {
    number: "06",
    watermark: "6",
    title: "Dedicated portals for guests and hosts",
    description:
      "Customers manage schedules and cancellations effortlessly, while workspace owners gain complete control over listings, pricing, and guest approvals.",
    image: why6,
    badge: "Dual Portals",
  },
];

export default function WhyNestora() {
  const sliderRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScrollBounds = () => {
    if (sliderRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = sliderRef.current;
      setCanScrollLeft(scrollLeft > 10);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  useEffect(() => {
    const el = sliderRef.current;
    if (el) {
      checkScrollBounds();
      el.addEventListener("scroll", checkScrollBounds);
      window.addEventListener("resize", checkScrollBounds);
      return () => {
        el.removeEventListener("scroll", checkScrollBounds);
        window.removeEventListener("resize", checkScrollBounds);
      };
    }
  }, []);

  const handleScroll = (direction) => {
    if (sliderRef.current) {
      const containerWidth = sliderRef.current.clientWidth;
      const scrollStep = Math.min(containerWidth * 0.8, 480);
      sliderRef.current.scrollBy({
        left: direction === "left" ? -scrollStep : scrollStep,
        behavior: "smooth",
      });
    }
  };

  return (
    <section className="overflow-hidden py-16 sm:py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        {/* Main Split Grid */}
        <div className="grid items-center gap-10 lg:grid-cols-[280px_minmax(0,1fr)] xl:grid-cols-[320px_minmax(0,1fr)] lg:gap-12">

          {/* Left Column: Editorial Headline inspired by reference */}
          <div className="space-y-6">
            <div className="space-y-2">
              <h2 className="font-serif text-3xl sm:text-4xl lg:text-[44px] font-normal leading-[1.12] tracking-tight text-slate-900">
                Why choose{" "}
                <span className="block italic text-slate-800">
                  Nestora<span className="text-primary not-italic">.</span>
                </span>
              </h2>
            </div>

            <p className="text-sm leading-relaxed text-slate-600 max-w-sm">
              We rethink how workspace is discovered, booked, and utilized. Built
              for agile teams, freelancers, and ambitious space owners.
            </p>

            <div className="pt-2">
              <Link
                to="/workspaces"
                className="inline-flex items-center gap-2 text-xs font-bold text-slate-900 uppercase tracking-wider group hover:text-primary transition-colors"
              >
                <span>Browse Workspaces</span>
                <FiArrowRight className="size-4 transition-transform duration-200 group-hover:translate-x-1" />
              </Link>
            </div>
          </div>

          {/* Right Column: Horizontal Cards Slider */}
          <div className="min-w-0 relative">

            {/* Scrollable Track */}
            <div
              ref={sliderRef}
              className="flex items-center gap-6 sm:gap-8 overflow-x-auto scroll-smooth pb-4 pt-2 no-scrollbar focus:outline-hidden"
              style={{
                scrollbarWidth: "none",
                msOverflowStyle: "none",
              }}
            >
              {reasons.map((item) => (
                <div
                  key={item.number}
                  className="flex items-center shrink-0"
                >
                  {/* Card Container */}
                  <div className="group relative w-[280px] sm:w-[360px] md:w-[420px] lg:w-[460px] h-[340px] sm:h-[390px] rounded-[24px] overflow-hidden bg-slate-900 border border-slate-200/60 shadow-xs transition-all duration-500 hover:shadow-xl hover:-translate-y-1">

                    {/* Background Image with Zoom */}
                    <img
                      src={item.image}
                      alt={item.title}
                      className="absolute inset-0 size-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                      loading="lazy"
                    />

                    {/* Gradient Overlay for Legibility */}
                    <div
                      aria-hidden="true"
                      className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent"
                    />

                    {/* Top Pill Tag */}
                    <div className="absolute top-4 left-4 z-10">
                      <span className="inline-flex items-center rounded-full bg-black/40 backdrop-blur-md px-3 py-1 text-[11px] font-semibold text-white border border-white/15">
                        {item.badge}
                      </span>
                    </div>

                    {/* Bottom Card Copy */}
                    <div className="absolute inset-x-0 bottom-0 p-6 sm:p-7 z-10 space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-emerald-400">
                          {item.number}
                        </span>
                        <span className="h-px w-6 bg-white/30" />
                      </div>

                      <h3 className="text-lg sm:text-xl font-bold leading-snug tracking-tight text-white group-hover:text-white transition-colors">
                        {item.title}
                      </h3>

                      <p className="text-xs sm:text-sm leading-relaxed text-slate-300 font-normal line-clamp-3">
                        {item.description}
                      </p>
                    </div>
                  </div>

                  {/* Watermark Numeral between cards (mirrors the reference image) */}
                  <div
                    aria-hidden="true"
                    className="select-none pointer-events-none mx-3 sm:mx-5 hidden sm:flex items-center justify-center"
                  >
                    <span className="text-[72px] md:text-[100px] lg:text-[120px] font-bold font-sans text-slate-300/90 leading-none">
                      {item.watermark}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Navigation Buttons (Bottom Right as in Reference) */}
            <div className="mt-6 flex items-center justify-between sm:justify-end gap-3 pt-2">

              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => handleScroll("left")}
                  disabled={!canScrollLeft}
                  aria-label="Previous reason"
                  className="flex size-11 items-center justify-center rounded-full bg-slate-900 text-white transition-all hover:bg-slate-800 disabled:opacity-25 disabled:cursor-not-allowed shadow-xs active:scale-95"
                >
                  <FiChevronLeft className="size-5" />
                </button>

                <button
                  type="button"
                  onClick={() => handleScroll("right")}
                  disabled={!canScrollRight}
                  aria-label="Next reason"
                  className="flex size-11 items-center justify-center rounded-full bg-slate-900 text-white transition-all hover:bg-slate-800 disabled:opacity-25 disabled:cursor-not-allowed shadow-xs active:scale-95"
                >
                  <FiChevronRight className="size-5" />
                </button>
              </div>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
