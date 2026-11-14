/**
 * Centralized Category-Based Pricing Calculator for NESTORA Frontend
 *
 * Rules:
 * A. Coworking Space:
 *    - Pricing type: "per_person"
 *    - Hourly: hourlyPrice × numberOfPeople × numberOfHours
 *    - Daily: dailyPrice × numberOfPeople
 *
 * B. Private Office, Meeting Room, Conference Room:
 *    - Pricing type: "per_space"
 *    - Hourly: hourlyPrice × numberOfHours
 *    - Daily: dailyPrice
 *    - Changing number of people DOES NOT change price
 */

export const getCategoryPricingType = (workspaceType) => {
  return workspaceType === "coworking" ? "per_person" : "per_space";
};

export const getCategoryUnitLabel = (workspaceType) => {
  switch (workspaceType) {
    case "coworking":
      return "person";
    case "private-office":
      return "office";
    case "meeting-room":
      return "room";
    case "conference-room":
      return "room";
    default:
      return "space";
  }
};

export const formatPrice = (amount, currency = "INR") => {
  if (amount === null || amount === undefined || amount === "" || isNaN(amount)) {
    return "—";
  }
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
};

/**
 * Normalizes workspace pricing across legacy and modern schemas.
 */
export const normalizeWorkspacePricing = (workspace) => {
  if (!workspace) return null;

  const rawPricing = workspace.pricing || {};
  const type = workspace.type || "coworking";
  const pricingType = getCategoryPricingType(type);
  const unitLabel = getCategoryUnitLabel(type);

  // Hourly pricing normalization
  let hourlyEnabled = false;
  let hourlyPrice = null;

  if (rawPricing.hourly && typeof rawPricing.hourly === "object") {
    hourlyEnabled = Boolean(rawPricing.hourly.enabled);
    hourlyPrice =
      typeof rawPricing.hourly.price === "number" && rawPricing.hourly.price >= 0
        ? rawPricing.hourly.price
        : null;
  } else if (typeof rawPricing.hourly === "number") {
    // Legacy schema fallback
    hourlyEnabled = rawPricing.hourly > 0;
    hourlyPrice = rawPricing.hourly;
  }

  // Daily pricing normalization
  let dailyEnabled = false;
  let dailyPrice = null;

  if (rawPricing.daily && typeof rawPricing.daily === "object") {
    dailyEnabled = Boolean(rawPricing.daily.enabled);
    dailyPrice =
      typeof rawPricing.daily.price === "number" && rawPricing.daily.price >= 0
        ? rawPricing.daily.price
        : null;
  } else if (typeof rawPricing.fullDay === "number") {
    // Legacy schema fallback
    dailyEnabled = rawPricing.fullDay > 0;
    dailyPrice = rawPricing.fullDay;
  }

  // Fallback for legacy workspace records with single `price` field or unset pricing
  if (!hourlyEnabled && !dailyEnabled) {
    const fallbackPrice =
      typeof workspace.price === "number" && workspace.price > 0
        ? workspace.price
        : typeof rawPricing.price === "number" && rawPricing.price > 0
        ? rawPricing.price
        : null;

    if (fallbackPrice !== null) {
      hourlyEnabled = true;
      hourlyPrice = fallbackPrice;
      dailyEnabled = true;
      dailyPrice = fallbackPrice * (type === "coworking" ? 5 : 6);
    } else {
      // If neither is explicitly disabled and no pricing structure was loaded, default both to enabled
      hourlyEnabled = true;
      dailyEnabled = true;
    }
  }

  return {
    pricingType,
    unitLabel,
    currency: rawPricing.currency || "INR",
    hourly: {
      enabled: hourlyEnabled,
      price: hourlyPrice,
    },
    daily: {
      enabled: dailyEnabled,
      price: dailyPrice,
    },
    totalUnits: Math.max(1, Number(workspace.totalUnits) || 1),
    capacity: Math.max(1, Number(workspace.capacity) || 1),
  };
};

/**
 * Generates customer-friendly display string for cards: e.g. "₹800 / office / hour"
 */
export const getFormattedPricingDisplay = (workspace, preferredDuration = "hourly") => {
  const normalized = normalizeWorkspacePricing(workspace);
  if (!normalized) return { primaryText: "Pricing unset", secondaryText: null };

  const { hourly, daily, unitLabel, currency } = normalized;

  // If hourly preferred and enabled
  if (preferredDuration === "hourly" && hourly.enabled && hourly.price !== null) {
    return {
      rate: hourly.price,
      unitText: `/ ${unitLabel} / hr`,
      formattedText: `${formatPrice(hourly.price, currency)} / ${unitLabel} / hr`,
      secondaryText: daily.enabled && daily.price !== null
        ? `${formatPrice(daily.price, currency)} / ${unitLabel} / day`
        : null,
      hourlyPrice: hourly.price,
      dailyPrice: daily.price,
      hourlyEnabled: true,
      dailyEnabled: daily.enabled,
    };
  }

  // If daily enabled
  if (daily.enabled && daily.price !== null) {
    return {
      rate: daily.price,
      unitText: `/ ${unitLabel} / day`,
      formattedText: `${formatPrice(daily.price, currency)} / ${unitLabel} / day`,
      secondaryText: hourly.enabled && hourly.price !== null
        ? `${formatPrice(hourly.price, currency)} / ${unitLabel} / hr`
        : null,
      hourlyPrice: hourly.price,
      dailyPrice: daily.price,
      hourlyEnabled: hourly.enabled,
      dailyEnabled: true,
    };
  }

  // Fallback to hourly if available
  if (hourly.enabled && hourly.price !== null) {
    return {
      rate: hourly.price,
      unitText: `/ ${unitLabel} / hr`,
      formattedText: `${formatPrice(hourly.price, currency)} / ${unitLabel} / hr`,
      secondaryText: null,
      hourlyPrice: hourly.price,
      dailyPrice: null,
      hourlyEnabled: true,
      dailyEnabled: false,
    };
  }

  return {
    rate: null,
    unitText: "",
    formattedText: "Pricing unset",
    secondaryText: null,
    hourlyPrice: null,
    dailyPrice: null,
    hourlyEnabled: false,
    dailyEnabled: false,
  };
};

/**
 * Calculates live booking price on frontend with complete breakdown.
 */
export const calculateFrontendBookingPrice = (
  workspace,
  bookingType,
  duration = 1,
  guests = 1
) => {
  if (!workspace) return null;

  const normalized = normalizeWorkspacePricing(workspace);
  if (!normalized) return null;

  const guestCount = Math.max(1, Math.floor(Number(guests) || 1));
  const capacity = normalized.capacity;
  const { pricingType, unitLabel, currency } = normalized;

  if (guestCount > capacity) {
    return {
      error: `Exceeds max capacity of ${capacity} people.`,
      subtotal: null,
    };
  }

  if (bookingType === "hourly") {
    if (!normalized.hourly.enabled || normalized.hourly.price === null) {
      return {
        error: "Hourly booking is currently disabled for this workspace.",
        subtotal: null,
      };
    }

    const hours = Math.max(1, Math.floor(Number(duration) || 1));
    const rate = normalized.hourly.price;

    let subtotal = 0;
    let breakdownText = "";

    if (pricingType === "per_person") {
      subtotal = rate * guestCount * hours;
      breakdownText = `${formatPrice(rate, currency)} × ${guestCount} ${
        guestCount === 1 ? "person" : "people"
      } × ${hours} ${hours === 1 ? "hr" : "hrs"}`;
    } else {
      subtotal = rate * hours;
      breakdownText = `${formatPrice(rate, currency)} × ${hours} ${
        hours === 1 ? "hr" : "hrs"
      } (per ${unitLabel})`;
    }

    return {
      error: null,
      pricingType,
      unitPrice: rate,
      unitLabel,
      bookingType: "hourly",
      duration: hours,
      guests: guestCount,
      subtotal,
      currency,
      rateText: `${formatPrice(rate, currency)} / ${unitLabel} / hr`,
      breakdownText,
    };
  }

  if (bookingType === "full-day") {
    if (!normalized.daily.enabled || normalized.daily.price === null) {
      return {
        error: "Daily booking is currently disabled for this workspace.",
        subtotal: null,
      };
    }

    const rate = normalized.daily.price;
    let subtotal = 0;
    let breakdownText = "";

    if (pricingType === "per_person") {
      subtotal = rate * guestCount;
      breakdownText = `${formatPrice(rate, currency)} × ${guestCount} ${
        guestCount === 1 ? "person" : "people"
      }`;
    } else {
      subtotal = rate;
      breakdownText = `${formatPrice(rate, currency)} full day (per ${unitLabel})`;
    }

    return {
      error: null,
      pricingType,
      unitPrice: rate,
      unitLabel,
      bookingType: "full-day",
      duration: 1,
      guests: guestCount,
      subtotal,
      currency,
      rateText: `${formatPrice(rate, currency)} / ${unitLabel} / day`,
      breakdownText,
    };
  }

  return null;
};

