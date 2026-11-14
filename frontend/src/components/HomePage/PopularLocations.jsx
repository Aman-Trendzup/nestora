import { Link } from "react-router";
import gurugram from "../../assets/images/home/locations/gurugram.webp"
import delhi from "../../assets/images/home/locations/delhi.webp"
import bengaluru from "../../assets/images/home/locations/bengaluru.webp"
import hyderabad from "../../assets/images/home/locations/hyderabad.webp"
import mumbai from "../../assets/images/home/locations/mumbai.webp"
import noida from "../../assets/images/home/locations/noida.webp"


const locations = [
  {
    name: "Gurugram",
    image: gurugram,
    alt: "Modern commercial buildings in Gurugram",
  },
  {
    name: "Delhi",
    image: delhi,
    alt: "City skyline of Delhi",
  },
  {
    name: "Noida",
    image: noida,
    alt: "Contemporary workspace in Noida",
  },
  {
    name: "Bengaluru",
    image: bengaluru,
    alt: "Bright modern office in Bengaluru",
  },
  {
    name: "Mumbai",
    image: mumbai,
    alt: "City buildings in Mumbai",
  },
  {
    name: "Hyderabad",
    image: hyderabad,
    alt: "Modern professional workspace in Hyderabad",
  },
];

export default function PopularLocations() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
      {/* Section heading */}
      <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-text-secondary">
            Find your next workspace
          </p>

          <h2 className="max-w-2xl text-3xl font-semibold tracking-tight text-text-primary sm:text-4xl">
            Good work starts in the right place.
          </h2>

          <p className="mt-3 max-w-xl text-sm leading-relaxed text-text-secondary sm:text-base">
            From India's leading business hubs to your neighbourhood,
            find a workspace that fits your day.
          </p>
        </div>

        <Link
          to="/workspaces"
          className="inline-flex shrink-0 items-center gap-2 text-sm font-semibold text-text-primary transition-colors hover:text-primary"
        >
          Explore all spaces
          <span aria-hidden="true">→</span>
        </Link>
      </div>

      {/* Location cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 lg:grid-cols-6 sm:gap-6">
        {locations.map((location) => (
          <Link
            key={location.name}
            to={`/workspaces?location=${encodeURIComponent(location.name)}`}
            className="group relative isolate h-56 sm:h-64 lg:h-72 overflow-hidden rounded-2xl bg-slate-900 block shadow-xs transition-all duration-300 hover:shadow-md"
          >
            {/* Background image */}
            <img
              src={location.image}
              alt={location.alt}
              loading="lazy"
              className="absolute inset-0 size-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
            />

            {/* Gradient overlay for readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent transition-opacity duration-300 group-hover:opacity-90" />

            {/* Location name positioned absolute at bottom */}
            <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6 z-10">
              <h3 className="text-xl font-bold tracking-tight text-white transition-transform duration-300 group-hover:translate-x-1">
                {location.name}
              </h3>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
