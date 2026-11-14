/**
 * Centralized Category-Based Pricing Calculator for NESTORA
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
 *    - Number of people NEVER multiplies price (only constrained by capacity)
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

/**
 * Normalizes workspace pricing data across legacy and modern schema structures.
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
 * Calculates booking price on the server, enforcing all category rules.
 *
 * @param {Object} workspace - Workspace document or plain object
 * @param {string} bookingType - "hourly" | "full-day"
 * @param {number} duration - Number of hours (for hourly booking)
 * @param {number} guests - Number of guests/seats requested
 * @returns {Object} Pricing breakdown
 */
export const calculateBookingPrice = (
  workspace,
  bookingType,
  duration = 1,
  guests = 1
) => {
  if (!workspace) {
    throw new Error("Workspace data is required for price calculation.");
  }

  const normalized = normalizeWorkspacePricing(workspace);
  const guestCount = Math.max(1, Math.floor(Number(guests) || 1));
  const capacity = normalized.capacity;

  // 1. Capacity validation
  if (guestCount > capacity) {
    throw new Error(
      `Selected guest count (${guestCount}) exceeds workspace capacity of ${capacity} people.`
    );
  }

  const { pricingType, unitLabel, currency } = normalized;

  // 2. Hourly Calculation
  if (bookingType === "hourly") {
    if (!normalized.hourly.enabled || normalized.hourly.price === null) {
      throw new Error(
        "Hourly booking is not supported or currently disabled for this workspace."
      );
    }

    const hours = Math.max(1, Math.floor(Number(duration) || 1));
    const hourlyRate = normalized.hourly.price;

    let subtotal = 0;
    let quantity = 1;
    let breakdownText = "";
    const rateText = `₹${hourlyRate} / ${unitLabel} / hr`;

    if (pricingType === "per_person") {
      // Coworking: hourlyPrice × numberOfPeople × numberOfHours
      quantity = guestCount;
      subtotal = hourlyRate * guestCount * hours;
      breakdownText = `₹${hourlyRate} × ${guestCount} ${
        guestCount === 1 ? "person" : "people"
      } × ${hours} ${hours === 1 ? "hr" : "hrs"}`;
    } else {
      // Private Office, Meeting Room, Conference Room: hourlyPrice × numberOfHours
      quantity = 1;
      subtotal = hourlyRate * hours;
      breakdownText = `₹${hourlyRate} × ${hours} ${
        hours === 1 ? "hr" : "hrs"
      } (${guestCount} of ${capacity} guests)`;
    }

    return {
      pricingType,
      unitPrice: hourlyRate,
      unitLabel,
      bookingType: "hourly",
      duration: hours,
      quantity,
      guests: guestCount,
      subtotal,
      currency,
      rateText,
      breakdownText,
    };
  }

  // 3. Daily Calculation
  if (bookingType === "full-day") {
    if (!normalized.daily.enabled || normalized.daily.price === null) {
      throw new Error(
        "Daily booking is not supported or currently disabled for this workspace."
      );
    }

    const dailyRate = normalized.daily.price;
    let subtotal = 0;
    let quantity = 1;
    let breakdownText = "";
    const rateText = `₹${dailyRate} / ${unitLabel} / day`;

    if (pricingType === "per_person") {
      // Coworking: dailyPrice × numberOfPeople
      quantity = guestCount;
      subtotal = dailyRate * guestCount;
      breakdownText = `₹${dailyRate} × ${guestCount} ${
        guestCount === 1 ? "person" : "people"
      }`;
    } else {
      // Private Office, Meeting Room, Conference Room: dailyPrice (constant)
      quantity = 1;
      subtotal = dailyRate;
      breakdownText = `₹${dailyRate} full day (${guestCount} of ${capacity} guests)`;
    }

    return {
      pricingType,
      unitPrice: dailyRate,
      unitLabel,
      bookingType: "full-day",
      duration: 1,
      quantity,
      guests: guestCount,
      subtotal,
      currency,
      rateText,
      breakdownText,
    };
  }

  throw new Error(`Unsupported booking type: ${bookingType}`);
};

