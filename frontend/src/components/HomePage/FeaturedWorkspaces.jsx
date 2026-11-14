import { useEffect, useState } from "react";
import { Link } from "react-router";
import { FiMapPin, FiUsers, FiArrowRight } from "react-icons/fi";
import {
  getFormattedPricingDisplay,
  getCategoryUnitLabel,
} from "../../utils/pricingCalculator";

import API_BASE_URL from "../../utils/apiConfig";

/* ----------------------------------
   API CONFIGURATION
   WorkspaceListing backend endpoint
---------------------------------- */
const WORKSPACE_API = `${API_BASE_URL}/api/workspaces/search`;

/* ----------------------------------
   TYPE LABEL MAPPING
---------------------------------- */
const typeOptions = [
  { label: "All workspace types", value: "" },
  { label: "Coworking Space", value: "coworking" },
  { label: "Private Office", value: "private-office" },
  { label: "Meeting Room", value: "meeting-room" },
  { label: "Conference Room", value: "conference-room" },
];

function getTypeLabel(type) {
  return (
    typeOptions.find((option) => option.value === type)?.label ||
    type ||
    "Workspace"
  );
}

function formatPrice(amount) {
  if (amount === null || amount === undefined || Number.isNaN(amount)) {
    return "₹0";
  }
  return `₹${Number(amount).toLocaleString("en-IN")}`;
}

/* ----------------------------------
   FALLBACK WORKSPACES
   (Backend offline / initial dev preview)
---------------------------------- */
const FALLBACK_WORKSPACES = [
  {
    _id: "featured-1",
    name: "The Work Loft",
    slug: "the-work-loft",
    type: "coworking",
    capacity: 25,
    address: {
      area: "Connaught Place",
      city: "Delhi",
      fullAddress: "Block B, Connaught Place, New Delhi",
    },
    pricing: {
      hourly: 350,
      fullDay: 2500,
      currency: "INR",
    },
    amenities: ["Wi-Fi", "Power Backup", "AC", "Coffee & Tea"],
    images: [
      {
        url: "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=900&q=85",
        alt: "Bright coworking space with shared desks",
      },
    ],
  },
  {
    _id: "featured-2",
    name: "The Private Suite",
    slug: "the-private-suite",
    type: "private-office",
    capacity: 6,
    address: {
      area: "Sector 62",
      city: "Noida",
      fullAddress: "Tower A, Sector 62, Noida",
    },
    pricing: {
      hourly: 500,
      fullDay: 1200,
      currency: "INR",
    },
    amenities: ["Wi-Fi", "AC", "Meeting Table", "Parking"],
    images: [
      {
        url: "https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=900&q=85",
        alt: "Contemporary private office with workstations",
      },
    ],
  },
  {
    _id: "featured-3",
    name: "The Meeting Studio",
    slug: "the-meeting-studio",
    type: "meeting-room",
    capacity: 12,
    address: {
      area: "Cyber City",
      city: "Gurugram",
      fullAddress: "DLF Cyber City, Phase 2, Gurugram",
    },
    pricing: {
      hourly: 800,
      fullDay: 5000,
      currency: "INR",
    },
    amenities: ["Display Screen", "Wi-Fi", "Whiteboard", "Power Backup"],
    images: [
      {
        url: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=900&q=85",
        alt: "Modern professional workspace and meeting area",
      },
    ],
  },
];

/* ----------------------------------
   NORMALIZE WORKSPACE MODEL
   (Matches backend & WorkspaceListing schema)
---------------------------------- */
function normalizeWorkspace(workspace) {
  const address = workspace.address || {};
  const firstImage = workspace.images?.[0];

  const areaStr = address.area || workspace.area || "";
  const cityStr = address.city || workspace.location || "";
  const addressText =
    [areaStr, cityStr].filter(Boolean).join(", ") ||
    address.fullAddress ||
    "Location on request";

  const pricingDisplay = getFormattedPricingDisplay(workspace);
  const unitLabel = getCategoryUnitLabel(workspace.type);

  return {
    id: workspace._id || workspace.id,
    name: workspace.name || "Untitled Workspace",
    slug: workspace.slug,
    addressText,
    type: workspace.type || "",
    typeLabel: getTypeLabel(workspace.type),
    unitLabel,
    pricingDisplay,
    hourlyPrice: pricingDisplay.hourlyPrice,
    fullDayPrice: pricingDisplay.dailyPrice,
    hourlyEnabled: pricingDisplay.hourlyEnabled,
    dailyEnabled: pricingDisplay.dailyEnabled,
    capacity: Number(workspace.capacity || 1),
    image:
      typeof firstImage === "string"
        ? firstImage
        : firstImage?.url ||
          workspace.image ||
          "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80",
    amenities: Array.isArray(workspace.amenities) ? workspace.amenities : [],
  };
}

/* ----------------------------------
   FEATURED WORKSPACES COMPONENT
---------------------------------- */
export default function FeaturedWorkspaces() {
  const [workspaces, setWorkspaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    async function fetchFeaturedSpaces() {
      try {
        setLoading(true);
        setError("");

        // Real API call: WorkspaceListing backend search endpoint with limit=3
        const params = new URLSearchParams({
          limit: "3",
          sort: "recommended",
        });

        const response = await fetch(`${WORKSPACE_API}?${params.toString()}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(`Failed to load workspaces (status ${response.status})`);
        }

        const data = await response.json();
        const apiWorkspaces = data.workspaces || data.data?.workspaces || [];

        // Real backend se 3 workspaces select karo
        if (Array.isArray(apiWorkspaces) && apiWorkspaces.length > 0) {
          setWorkspaces(apiWorkspaces.slice(0, 3).map(normalizeWorkspace));
        } else {
          // Backend me agar abhi koi workspace approved nahi hai to fallback 3 spaces
          setWorkspaces(FALLBACK_WORKSPACES.slice(0, 3).map(normalizeWorkspace));
        }
      } catch (err) {
        if (err.name !== "AbortError") {
          console.warn("Backend API request failed, displaying fallback spaces:", err.message);
          // Network error ya backend start na hone par fallback
          setWorkspaces(FALLBACK_WORKSPACES.slice(0, 3).map(normalizeWorkspace));
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    fetchFeaturedSpaces();

    return () => {
      controller.abort();
    };
  }, []);

  return (
    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
      {/* Section heading */}
      <div className="mb-6 flex items-end justify-between gap-4">
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-text-secondary">
            Handpicked workspaces
          </p>

          <h2 className="text-2xl font-semibold tracking-tight text-text-primary sm:text-3xl">
            Spaces worth working from.
          </h2>
        </div>

        <Link
          to="/workspaces"
          className="mb-1 hidden shrink-0 items-center gap-1.5 text-sm font-medium text-text-primary transition-colors hover:text-primary sm:inline-flex group"
        >
          View all spaces
          <FiArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
        </Link>
      </div>

      {/* Loading Skeleton */}
      {loading && (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className="overflow-hidden rounded-lg border border-border bg-surface p-4 shadow-xs animate-pulse"
            >
              <div className="aspect-[4/3] rounded-md bg-slate-200" />
              <div className="mt-4 h-4 w-3/4 rounded bg-slate-200" />
              <div className="mt-2 h-3 w-1/2 rounded bg-slate-100" />
              <div className="mt-4 flex gap-2">
                <div className="h-3 w-12 rounded bg-slate-100" />
                <div className="h-3 w-12 rounded bg-slate-100" />
              </div>
              <div className="mt-5 flex justify-between pt-3 border-t border-border">
                <div className="h-5 w-20 rounded bg-slate-200" />
                <div className="h-5 w-24 rounded bg-slate-200" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Cards Grid - Exact same card UI as WorkspaceListing */}
      {!loading && workspaces.length > 0 && (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {workspaces.map((workspace) => {
            const currentPrice =
              workspace.hourlyPrice > 0
                ? workspace.hourlyPrice
                : workspace.fullDayPrice;
            const priceUnit = workspace.hourlyPrice > 0 ? "hour" : "day";
            const detailsUrl = `/workspaces/${workspace.slug}`;

            return (
              <article
                key={workspace.id}
                className="group overflow-hidden rounded-lg border border-border bg-surface shadow-xs transition-shadow hover:shadow-md flex flex-col"
              >
                {/* Image and Badges */}
                <div className="relative overflow-hidden">
                  <Link
                    to={detailsUrl}
                    aria-label={`View ${workspace.name}`}
                    className="block aspect-[4/3] overflow-hidden bg-slate-100"
                  >
                    <img
                      src={workspace.image}
                      alt={workspace.name}
                      loading="lazy"
                      className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </Link>

                  {/* Workspace Type badge top-left */}
                  <span className="absolute left-3 top-3 rounded-md bg-text-primary px-2.5 py-1 text-xs font-semibold text-surface shadow-xs">
                    {workspace.typeLabel}
                  </span>

                  {/* Capacity badge top-right */}
                  <span className="absolute right-3 top-3 flex items-center gap-1 rounded-md bg-surface/90 backdrop-blur-xs px-2.5 py-1 text-xs font-semibold text-text-primary shadow-xs">
                    <FiUsers className="size-3 text-text-secondary" />
                    <span>{workspace.capacity}</span>
                  </span>
                </div>

                {/* Workspace details body */}
                <div className="p-4 sm:p-5 flex flex-col flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <Link to={detailsUrl}>
                        <h3 className="truncate text-base font-semibold text-text-primary transition-colors group-hover:text-primary">
                          {workspace.name}
                        </h3>
                      </Link>

                      <p className="mt-1 flex items-center gap-1.5 text-xs text-text-secondary truncate">
                        <FiMapPin className="size-3.5 shrink-0 text-text-secondary" />
                        <span className="truncate">{workspace.addressText}</span>
                      </p>
                    </div>
                  </div>

                  {/* Amenities */}
                  <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-border pb-4 min-h-[38px]">
                    {workspace.amenities.slice(0, 3).map((amenity) => (
                      <span
                        key={amenity}
                        className="flex items-center gap-1.5 text-xs text-text-secondary"
                      >
                        <span
                          className="size-1.5 rounded-full bg-primary"
                          aria-hidden="true"
                        />
                        {amenity}
                      </span>
                    ))}
                    {workspace.amenities.length > 3 && (
                      <span className="text-xs text-text-secondary font-medium">
                        +{workspace.amenities.length - 3} more
                      </span>
                    )}
                  </div>

                  {/* Price and CTA */}
                  <div className="mt-auto pt-4 flex items-center justify-between gap-3">
                    <div>
                      <p className="text-base font-bold text-text-primary">
                        {workspace.hourlyPrice
                          ? formatPrice(workspace.hourlyPrice)
                          : workspace.fullDayPrice
                          ? formatPrice(workspace.fullDayPrice)
                          : "—"}
                        <span className="ml-1 text-xs font-normal text-text-secondary">
                          / {workspace.unitLabel} /{" "}
                          {workspace.hourlyEnabled ? "hr" : "day"}
                        </span>
                      </p>
                    </div>

                    <Link
                      to={detailsUrl}
                      aria-label={`View workspace details for ${workspace.name}`}
                      className="inline-flex items-center gap-1.5 text-sm font-semibold text-text-primary transition-colors hover:text-primary"
                    >
                      <span>View Workspace</span>
                      <FiArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                    </Link>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* Mobile view-all link */}
      <Link
        to="/workspaces"
        className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-text-primary transition-colors hover:text-primary sm:hidden"
      >
        View all spaces
        <FiArrowRight className="size-4" />
      </Link>
    </section>
  );
}
