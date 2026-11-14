import { useEffect, useMemo, useState, useRef } from "react";
import { Link, useParams, useSearchParams, useNavigate } from "react-router";
import { useAuth } from "../../context/AuthContext";
import {
  FiArrowLeft,
  FiArrowRight,
  FiMapPin,
  FiUsers,
  FiWifi,
  FiCoffee,
  FiMonitor,
  FiWind,
  FiZap,
  FiShield,
  FiClock,
  FiCalendar,
  FiCheck,
  FiMinus,
  FiPlus,
  FiInfo,
  FiAlertCircle,
  FiX,
  FiMaximize2,
  FiChevronLeft,
  FiChevronRight,
} from "react-icons/fi";
import {
  calculateFrontendBookingPrice,
  normalizeWorkspacePricing,
  getCategoryUnitLabel,
  getCategoryPricingType,
  formatPrice,
} from "../../utils/pricingCalculator";
import { getImageUrl } from "../../utils/imageHelper";

/* ----------------------------------
   API CONFIGURATION
---------------------------------- */

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000";

/* ----------------------------------
   AMENITY ICONS MAPPING
---------------------------------- */

const amenityIcons = {
  "Wi-Fi": FiWifi,
  "High-speed Wi-Fi": FiWifi,
  "Coffee": FiCoffee,
  "Coffee & Tea": FiCoffee,
  "Power Backup": FiZap,
  "AC": FiWind,
  "Air Conditioning": FiWind,
  "Display Screen": FiMonitor,
  "Whiteboard": FiMonitor,
  "Video Conferencing": FiMonitor,
  "Meeting Table": FiUsers,
  "Pantry": FiCoffee,
  "Parking": FiCheck,
  "Reception": FiShield,
};

/* ----------------------------------
   HELPER FUNCTIONS
---------------------------------- */

const formatType = (type = "") =>
  type
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

const getTypeLabel = (type = "") => {
  switch (type) {
    case "coworking":
      return "Coworking Space";
    case "private-office":
      return "Private Office";
    case "meeting-room":
      return "Meeting Room";
    case "conference-room":
      return "Conference Room";
    default:
      return formatType(type);
  }
};

const getToday = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const isPerPersonWorkspace = (type) =>
  type === "coworking";

const getDayName = (dateString) => {
  const date = new Date(`${dateString}T00:00:00.000Z`);
  const days = [
    "sunday",
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
  ];
  return days[date.getUTCDay()];
};

const formatTimeDisplay = (time24) => {
  if (!time24) return "";
  const [h, m] = time24.split(":").map(Number);
  const period = h >= 12 ? "pm" : "am";
  const hours12 = h % 12 || 12;
  return `${hours12}:${String(m).padStart(2, "0")} ${period}`;
};

/* ----------------------------------
   CALENDAR PICKER COMPONENT
---------------------------------- */

const CalendarPicker = ({
  selectedDate,
  onSelectDate,
  blockedDates = [],
  minDate,
  operatingHours,
}) => {
  const initialDate = selectedDate
    ? new Date(selectedDate + "T00:00:00")
    : new Date();
  const [currentMonth, setCurrentMonth] = useState(
    Number.isNaN(initialDate.getTime()) ? new Date() : initialDate
  );

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayIndex = new Date(year, month, 1).getDay();

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(year, month + 1, 1));
  };

  const todayStr = new Date().toISOString().slice(0, 10);
  const minDateStr = minDate || todayStr;

  const blockedMap = useMemo(() => {
    const map = new Map();
    blockedDates.forEach((b) => {
      if (b && b.date) {
        map.set(b.date, b.reason || "Blocked by Owner");
      }
    });
    return map;
  }, [blockedDates]);

  const daysOfWeek = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
  const dayNamesFull = [
    "sunday",
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
  ];

  const cells = [];
  for (let i = 0; i < firstDayIndex; i++) {
    cells.push({ key: `empty-${i}`, empty: true });
  }

  for (let d = 1; d <= daysInMonth; d++) {
    const dStr = String(d).padStart(2, "0");
    const mStr = String(month + 1).padStart(2, "0");
    const dateStr = `${year}-${mStr}-${dStr}`;

    const dayOfWeekIndex = new Date(year, month, d).getDay();
    const dayName = dayNamesFull[dayOfWeekIndex];
    const isClosed = operatingHours?.[dayName]?.isOpen === false;
    const isPast = dateStr < minDateStr;
    const isBlocked = blockedMap.has(dateStr);
    const blockedReason = isBlocked ? blockedMap.get(dateStr) : "";

    const isDisabled = isPast || isBlocked || isClosed;
    const isSelected = selectedDate === dateStr;

    cells.push({
      key: dateStr,
      dayNumber: d,
      dateStr,
      isPast,
      isBlocked,
      blockedReason,
      isClosed,
      isDisabled,
      isSelected,
    });
  }

  return (
    <div className="w-full">
      {/* Month Header */}
      <div className="flex items-center justify-between pb-2 mb-2 border-b border-border">
        <h4 className="text-xs font-bold text-text-primary">
          {monthNames[month]} {year}
        </h4>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={handlePrevMonth}
            className="p-1 rounded-md text-text-secondary hover:text-text-primary hover:bg-slate-200/60 transition"
            title="Previous month"
          >
            <FiChevronLeft className="size-3.5" />
          </button>
          <button
            type="button"
            onClick={handleNextMonth}
            className="p-1 rounded-md text-text-secondary hover:text-text-primary hover:bg-slate-200/60 transition"
            title="Next month"
          >
            <FiChevronRight className="size-3.5" />
          </button>
        </div>
      </div>

      {/* Weekday Labels */}
      <div className="grid grid-cols-7 gap-1 text-center mb-1">
        {daysOfWeek.map((dow) => (
          <span
            key={dow}
            className="text-[10px] font-bold text-text-secondary uppercase"
          >
            {dow}
          </span>
        ))}
      </div>

      {/* Days Grid */}
      <div className="grid grid-cols-7 gap-1 text-center">
        {cells.map((cell) => {
          if (cell.empty) {
            return <div key={cell.key} className="h-7 w-full" />;
          }

          if (cell.isBlocked) {
            return (
              <button
                key={cell.key}
                type="button"
                disabled={true}
                title={`Blocked by Owner: ${cell.blockedReason}`}
                className="h-7 w-full rounded-md text-xs font-semibold text-rose-400 bg-rose-50 line-through cursor-not-allowed border border-rose-200 flex items-center justify-center transition opacity-60 pointer-events-none"
              >
                <span>{cell.dayNumber}</span>
              </button>
            );
          }

          if (cell.isDisabled) {
            return (
              <button
                key={cell.key}
                type="button"
                disabled={true}
                title={cell.isClosed ? "Closed on this day" : "Past date"}
                className="h-7 w-full rounded-md text-xs text-slate-300 cursor-not-allowed flex items-center justify-center pointer-events-none"
              >
                {cell.dayNumber}
              </button>
            );
          }

          return (
            <button
              key={cell.key}
              type="button"
              onClick={() => onSelectDate(cell.dateStr)}
              className={`h-7 w-full rounded-md text-xs font-medium transition flex items-center justify-center ${
                cell.isSelected
                  ? "bg-primary text-white font-bold shadow-xs scale-105"
                  : "text-text-primary hover:bg-primary/10 hover:text-primary bg-white border border-border/50"
              }`}
            >
              {cell.dayNumber}
            </button>
          );
        })}
      </div>
    </div>
  );
};

/* ----------------------------------
   CUSTOM DATE PICKER INPUT WITH CALENDAR DROPDOWN
---------------------------------- */
const BookingDatePicker = ({
  selectedDate,
  onSelectDate,
  blockedDates = [],
  minDate,
  operatingHours,
  isBlocked,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const formattedDisplay = useMemo(() => {
    if (!selectedDate) return "Select booking date";
    try {
      const d = new Date(selectedDate + "T00:00:00");
      if (Number.isNaN(d.getTime())) return selectedDate;
      return d.toLocaleDateString("en-IN", {
        weekday: "short",
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    } catch {
      return selectedDate;
    }
  }, [selectedDate]);

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={`w-full flex items-center justify-between rounded-lg border bg-surface py-2.5 px-3 text-xs sm:text-sm text-text-primary outline-none transition focus:border-primary shadow-xs cursor-pointer ${
          isBlocked
            ? "border-rose-400 bg-rose-50/40 text-rose-700"
            : "border-border hover:border-primary/50"
        }`}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <FiCalendar className="size-4 text-primary shrink-0" />
          <span className="font-medium truncate">{formattedDisplay}</span>
        </div>
        <span className="text-[11px] font-semibold text-text-secondary bg-slate-100 px-2 py-0.5 rounded shrink-0">
          {selectedDate || "Choose"}
        </span>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 z-50 rounded-xl border border-border bg-white p-3 shadow-2xl min-w-[280px]">
          <CalendarPicker
            selectedDate={selectedDate}
            onSelectDate={(newDate) => {
              onSelectDate(newDate);
              setIsOpen(false);
            }}
            blockedDates={blockedDates}
            minDate={minDate}
            operatingHours={operatingHours}
          />
        </div>
      )}
    </div>
  );
};

/* ----------------------------------
   WORKSPACE DETAILS COMPONENT
---------------------------------- */

const WorkspaceDetails = () => {
  const { slug } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  /* ----------------------------------
     WORKSPACE API STATES
  ---------------------------------- */

  const [workspace, setWorkspace] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /* ----------------------------------
     IMAGE GALLERY STATES
  ---------------------------------- */

  const [activeImage, setActiveImage] = useState(0);
  const [showFullGallery, setShowFullGallery] = useState(false);

  /* ----------------------------------
     BOOKING SELECTION STATES
  ---------------------------------- */

  const [bookingType, setBookingType] = useState(
    searchParams.get("bookingType") === "full-day" ||
      searchParams.get("duration") === "full-day"
      ? "full-day"
      : "hourly"
  );

  const [date, setDate] = useState(() => searchParams.get("date") || getToday());
  const [startTime, setStartTime] = useState(
    searchParams.get("time") || "09:00"
  );

  const [duration, setDuration] = useState(() => {
    const val = Number(searchParams.get("duration"));
    return Number.isFinite(val) && val >= 1 ? val : 2;
  });

  const [guests, setGuests] = useState(() => {
    const val = Number(searchParams.get("guests"));
    return Number.isFinite(val) && val >= 1 ? val : 1;
  });

  // Ensure current date is always selected if date is empty
  useEffect(() => {
    if (!date) {
      setDate(getToday());
    }
  }, [date]);

  const isDateBlocked = (checkDate) => {
    if (!checkDate || !workspace?.blockedDates?.length) return false;
    return workspace.blockedDates.some((b) => b.date === checkDate);
  };

  const handleDateSelect = (selectedDateStr) => {
    if (selectedDateStr) {
      setDate(selectedDateStr);
      setSlotError("");
    }
  };

  /* ----------------------------------
     SLOT VALIDATION & MODAL STATES
  ---------------------------------- */

  const [slotChecking, setSlotChecking] = useState(false);
  const [slotError, setSlotError] = useState("");
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [specialRequests, setSpecialRequests] = useState("");
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingError, setBookingError] = useState("");
  const [confirmedBooking, setConfirmedBooking] = useState(null);

  /* ----------------------------------
     COUPON DISCOUNT STATES
  ---------------------------------- */

  const [couponInput, setCouponInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponMessage, setCouponMessage] = useState({ text: "", type: "" });

  const handleApplyCoupon = async () => {
    if (!couponInput.trim()) {
      setCouponMessage({ text: "Please enter a coupon code.", type: "error" });
      return;
    }
    if (!calculatedTotal || calculatedTotal <= 0) {
      setCouponMessage({
        text: "Please configure your booking options first.",
        type: "error",
      });
      return;
    }
    try {
      setCouponLoading(true);
      setCouponMessage({ text: "", type: "" });
      const res = await fetch(`${API_BASE_URL}/api/coupons/apply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: couponInput.trim(),
          bookingAmount: calculatedTotal,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to apply coupon.");
      }
      setAppliedCoupon(data.coupon);
      setCouponDiscount(data.discountAmount || 0);
      setCouponMessage({
        text: data.message || "Coupon applied successfully!",
        type: "success",
      });
    } catch (err) {
      setCouponDiscount(0);
      setAppliedCoupon(null);
      setCouponMessage({
        text: err.message || "Invalid coupon code.",
        type: "error",
      });
    } finally {
      setCouponLoading(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponDiscount(0);
    setCouponInput("");
    setCouponMessage({ text: "", type: "" });
  };

  /* ----------------------------------
     FETCH WORKSPACE DETAILS
  ---------------------------------- */

  useEffect(() => {
    const controller = new AbortController();

    const fetchWorkspace = async () => {
      try {
        setLoading(true);
        setError("");
        setWorkspace(null);

        const response = await fetch(
          `${API_BASE_URL}/api/workspaces/${encodeURIComponent(slug)}`,
          {
            signal: controller.signal,
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Unable to load workspace details.");
        }

        if (!data.workspace) {
          throw new Error("Workspace details were not found.");
        }

        setWorkspace(data.workspace);
      } catch (err) {
        if (err.name !== "AbortError") {
          setError(err.message || "Something went wrong loading this workspace.");
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    if (slug) {
      fetchWorkspace();
    } else {
      setError("Workspace identifier is missing.");
      setLoading(false);
    }

    return () => controller.abort();
  }, [slug]);

  /* ----------------------------------
     IMAGE LIST
  ---------------------------------- */

  const workspaceImages = useMemo(() => {
    if (!workspace?.images?.length) {
      return [
        "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=85",
        "https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=800&q=85",
        "https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=800&q=85",
      ];
    }

    const imgs = workspace.images
      .map((img) => getImageUrl(img))
      .filter(Boolean);

    return imgs.length
      ? imgs
      : [
          "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=85",
        ];
  }, [workspace]);

  /* ----------------------------------
     PRICING CALCULATIONS (CATEGORY-BASED)
  ---------------------------------- */

  const normalizedPricing = useMemo(() => {
    return normalizeWorkspacePricing(workspace);
  }, [workspace]);

  const currency = normalizedPricing?.currency || "INR";
  const hourlyEnabled = normalizedPricing?.hourly?.enabled ?? false;
  const hourlyPrice = normalizedPricing?.hourly?.price;
  const dailyEnabled = normalizedPricing?.daily?.enabled ?? false;
  const dailyPrice = normalizedPricing?.daily?.price;
  const unitLabel = normalizedPricing?.unitLabel || "space";
  const pricingType = normalizedPricing?.pricingType || "per_person";
  const perPerson = pricingType === "per_person";

  // Automatically adjust bookingType if selected duration is not offered
  useEffect(() => {
    if (normalizedPricing) {
      if (!hourlyEnabled && dailyEnabled && bookingType === "hourly") {
        setBookingType("full-day");
      } else if (hourlyEnabled && !dailyEnabled && bookingType === "full-day") {
        setBookingType("hourly");
      }
    }
  }, [normalizedPricing, hourlyEnabled, dailyEnabled, bookingType]);

  const pricingBreakdown = useMemo(() => {
    if (!workspace) return null;
    return calculateFrontendBookingPrice(
      workspace,
      bookingType,
      duration,
      guests
    );
  }, [workspace, bookingType, duration, guests]);

  const calculatedTotal = pricingBreakdown?.subtotal ?? null;

  /* ----------------------------------
     OPERATING HOURS SUMMARY
  ---------------------------------- */

  const operatingHoursSchedule = useMemo(() => {
    const hours = workspace?.operatingHours || {};
    const days = [
      { key: "monday", label: "Mon" },
      { key: "tuesday", label: "Tue" },
      { key: "wednesday", label: "Wed" },
      { key: "thursday", label: "Thu" },
      { key: "friday", label: "Fri" },
      { key: "saturday", label: "Sat" },
      { key: "sunday", label: "Sun" },
    ];

    return days.map(({ key, label }) => {
      const schedule = hours[key];
      if (!schedule || !schedule.isOpen) {
        return { label, text: "Closed" };
      }
      return {
        label,
        text: `${formatTimeDisplay(schedule.openingTime)} - ${formatTimeDisplay(
          schedule.closingTime
        )}`,
      };
    });
  }, [workspace]);

  /* ----------------------------------
     SLOT VALIDATION & CHECK AVAILABILITY
  ---------------------------------- */

  const handleInitiateBooking = async () => {
    setSlotError("");

    // 1. Basic validation
    if (!date) {
      setSlotError("Please choose a valid booking date.");
      return;
    }

    if (date < getToday()) {
      setSlotError("Past dates cannot be selected.");
      return;
    }

    if (isDateBlocked(date)) {
      const blockedEntry = workspace?.blockedDates?.find((b) => b.date === date);
      setSlotError(
        `This date (${date}) has been blocked by the workspace owner (${
          blockedEntry?.reason || "Unavailable"
        }). Please select an available date.`
      );
      return;
    }

    if (bookingType === "hourly" && !hourlyEnabled) {
      setSlotError("Hourly booking is not available for this workspace.");
      return;
    }

    if (bookingType === "full-day" && !dailyEnabled) {
      setSlotError("Daily booking is not available for this workspace.");
      return;
    }

    if (!guests || guests < 1) {
      setSlotError("Please select at least 1 guest.");
      return;
    }

    if (guests > (workspace.capacity || 1)) {
      setSlotError(
        `This space accommodates a maximum of ${workspace.capacity} people.`
      );
      return;
    }

    // 2. Check workspace day opening hours
    const dayName = getDayName(date);
    const daySchedule = workspace.operatingHours?.[dayName];

    if (!daySchedule || !daySchedule.isOpen) {
      setSlotError(
        `The workspace is closed on ${dayName.toUpperCase()}s. Please choose another date.`
      );
      return;
    }

    if (bookingType === "hourly") {
      if (!startTime) {
        setSlotError("Please select a start time.");
        return;
      }

      const [startHour, startMin] = startTime.split(":").map(Number);
      const totalMinutes = startHour * 60 + startMin + duration * 60;
      const endHour = Math.floor(totalMinutes / 60);
      const endMin = totalMinutes % 60;
      const calculatedEndTime = `${String(endHour).padStart(2, "0")}:${String(
        endMin
      ).padStart(2, "0")}`;

      if (
        startTime < daySchedule.openingTime ||
        calculatedEndTime > daySchedule.closingTime
      ) {
        setSlotError(
          `Operating hours on ${dayName} are ${formatTimeDisplay(
            daySchedule.openingTime
          )} to ${formatTimeDisplay(
            daySchedule.closingTime
          )}. Your ${duration}-hour booking exceeds closing time.`
        );
        return;
      }
    }

    // 3. Check availability API to guarantee slot is not mismatched/booked
    try {
      setSlotChecking(true);

      const params = new URLSearchParams({
        workspaceId: workspace._id,
        bookingDate: date,
        bookingType,
        guests: String(guests),
        ...(bookingType === "hourly"
          ? {
              startTime,
              duration: String(duration),
            }
          : {}),
      });

      const res = await fetch(`${API_BASE_URL}/api/availability?${params.toString()}`);
      if (res.ok) {
        const availData = await res.json();
        if (availData.success && availData.available === false) {
          setSlotError(
            availData.message ||
              "This time slot is already booked or conflicts with another reservation. Please select a different time slot."
          );
          setSlotChecking(false);
          return;
        }
      }
    } catch (e) {
      console.warn("Availability pre-check error (proceeding to atomic reserve):", e);
    } finally {
      setSlotChecking(false);
    }

    // 4. Authentication Check
    if (!isAuthenticated) {
      const returnUrl = `/workspaces/${workspace.slug}?date=${encodeURIComponent(
        date
      )}&time=${encodeURIComponent(startTime)}&duration=${encodeURIComponent(
        duration
      )}&guests=${encodeURIComponent(guests)}`;
      navigate(`/login?redirect=${encodeURIComponent(returnUrl)}`);
      return;
    }

    // Open confirmation modal
    setBookingError("");
    setConfirmedBooking(null);
    setShowBookingModal(true);
  };

  /* ----------------------------------
     CONFIRM RESERVATION (SAVE TO DB & NOTIFY OWNER)
  ---------------------------------- */

  const handleConfirmReservation = async () => {
    try {
      setBookingLoading(true);
      setBookingError("");

      const response = await fetch(`${API_BASE_URL}/api/bookings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          workspaceId: workspace._id,
          bookingDate: date,
          bookingType,
          startTime: bookingType === "hourly" ? startTime : undefined,
          duration: bookingType === "hourly" ? Number(duration) : undefined,
          guests: Number(guests),
          specialRequests,
          couponCode: appliedCoupon ? appliedCoupon.code : undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to confirm your booking.");
      }

      setConfirmedBooking(data.booking);
    } catch (err) {
      console.error("Booking error:", err);
      setBookingError(
        err.message ||
          "Slot conflict detected or unable to confirm booking. Please choose another time slot."
      );
    } finally {
      setBookingLoading(false);
    }
  };

  /* ----------------------------------
     LOADING & ERROR STATES
  ---------------------------------- */

  if (loading) {
    return (
      <main className="flex min-h-[70vh] items-center justify-center bg-background px-4">
        <div className="text-center">
          <div className="mx-auto size-10 animate-spin rounded-full border-4 border-border border-t-primary" />
          <p className="mt-4 text-sm text-text-secondary">
            Loading workspace details...
          </p>
        </div>
      </main>
    );
  }

  if (error || !workspace) {
    return (
      <main className="flex min-h-[70vh] items-center justify-center bg-background px-4 py-16">
        <div className="max-w-md text-center">
          <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-full bg-slate-100 text-text-secondary">
            <FiInfo size={26} />
          </div>
          <h1 className="text-2xl font-bold text-text-primary">
            Workspace Unavailable
          </h1>
          <p className="mt-2 text-sm text-text-secondary leading-relaxed">
            {error || "We could not find the workspace you were looking for."}
          </p>
          <div className="mt-6 flex items-center justify-center gap-3">
            <Link
              to="/workspaces"
              className="rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-xs hover:bg-primary-hover transition"
            >
              Explore workspaces
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background pb-20 text-text-primary selection:bg-primary/20">
      <div className="mx-auto max-w-7xl px-4 pt-6 sm:px-6 lg:px-8">
        {/* =========================================================
            TOP IMAGE GALLERY (Reference: 1 Big Left + 2 Stacked Right)
           ========================================================= */}
        <section className="overflow-hidden rounded-xl border border-border bg-surface shadow-xs">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 p-2">
            {/* Main Big Photo (Left 2 columns) */}
            <div
              className="relative md:col-span-2 h-[280px] sm:h-[380px] lg:h-[460px] overflow-hidden rounded-lg bg-slate-100 cursor-pointer group"
              onClick={() => setShowFullGallery(true)}
            >
              <img
                src={workspaceImages[0]}
                alt={workspace.name}
                className="size-full object-cover transition-transform duration-500 group-hover:scale-102"
              />
              <span className="absolute bottom-3 left-3 rounded-md bg-black/60 px-3 py-1 text-xs font-semibold text-white backdrop-blur-xs flex items-center gap-1.5">
                <FiMaximize2 className="size-3" />
                <span>View Photos</span>
              </span>
            </div>

            {/* Two Stacked Photos (Right 1 column) */}
            <div className="hidden md:grid md:grid-rows-2 gap-2 h-[460px]">
              <div
                className="overflow-hidden rounded-lg bg-slate-100 cursor-pointer group relative"
                onClick={() => {
                  setActiveImage(1);
                  setShowFullGallery(true);
                }}
              >
                <img
                  src={workspaceImages[1] || workspaceImages[0]}
                  alt={`${workspace.name} view 2`}
                  className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>

              <div
                className="overflow-hidden rounded-lg bg-slate-100 cursor-pointer group relative"
                onClick={() => {
                  setActiveImage(2);
                  setShowFullGallery(true);
                }}
              >
                <img
                  src={workspaceImages[2] || workspaceImages[0]}
                  alt={`${workspace.name} view 3`}
                  className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                {workspaceImages.length > 3 && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center text-white text-sm font-bold backdrop-blur-2xs">
                    +{workspaceImages.length - 2} more photos
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================
            SPLIT CONTENT: Details (Left) + Booking Aside (Right)
           ========================================================= */}
        <div className="mt-8 grid grid-cols-1 gap-10 lg:grid-cols-12 lg:items-start">
          {/* =======================================================
              LEFT COLUMN: Workspace Details & Specifications
             ======================================================= */}
          <div className="lg:col-span-8 space-y-8">
            {/* Header: Breadcrumbs & Title */}
            <div>
              {/* Breadcrumbs matching reference: Location > City > Area */}
              <nav className="mb-2 flex items-center gap-1.5 text-xs text-text-secondary">
                <Link to="/" className="hover:text-primary transition">
                  Home
                </Link>
                <span>&gt;</span>
                <Link to="/workspaces" className="hover:text-primary transition">
                  {workspace.address?.city || "Workspaces"}
                </Link>
                {workspace.address?.area && (
                  <>
                    <span>&gt;</span>
                    <span className="text-text-primary font-medium">
                      {workspace.address.area}
                    </span>
                  </>
                )}
              </nav>

              <div className="flex items-start justify-between gap-4">
                <div>
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-text-primary">
                    {workspace.name}
                  </h1>

                  <div className="mt-2 flex flex-wrap items-center gap-3 text-xs sm:text-sm text-text-secondary">
                    <span className="inline-flex items-center gap-1 font-semibold text-primary">
                      <span>★ 4.9</span>
                      <span className="text-text-secondary font-normal">
                        (28 reviews)
                      </span>
                    </span>
                    <span>•</span>
                    <span className="rounded-md bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-text-primary">
                      {formatType(workspace.type)}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <FiMapPin className="size-3.5 text-primary shrink-0" />
                      <span>
                        {workspace.address?.area}, {workspace.address?.city}
                      </span>
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Specs Grid: Accommodates & Operating Hours side by side */}
            <div className="rounded-xl border border-border bg-surface p-6 shadow-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                {/* Accommodates Specs */}
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-wider text-text-secondary mb-4">
                    Accommodates
                  </h3>

                  <div className="space-y-3 text-sm">
                    <div className="flex items-center justify-between py-1 border-b border-slate-100">
                      <span className="flex items-center gap-2 text-text-secondary">
                        <FiUsers className="size-4 text-primary" />
                        <span>Maximum Capacity</span>
                      </span>
                      <span className="font-semibold text-text-primary">
                        {workspace.capacity} people
                      </span>
                    </div>

                    <div className="flex items-center justify-between py-1 border-b border-slate-100">
                      <span className="flex items-center gap-2 text-text-secondary">
                        <FiMaximize2 className="size-4 text-primary" />
                        <span>Physical Area</span>
                      </span>
                      <span className="font-semibold text-text-primary">
                        {workspace.areaSqFt
                          ? `${workspace.areaSqFt} sq. ft`
                          : "Flexible layout"}
                      </span>
                    </div>

                    <div className="flex items-center justify-between py-1 border-b border-slate-100">
                      <span className="flex items-center gap-2 text-text-secondary">
                        <FiCheck className="size-4 text-primary" />
                        <span>Space Type</span>
                      </span>
                      <span className="font-semibold text-text-primary">
                        {formatType(workspace.type)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Opening Hours Schedule */}
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-wider text-text-secondary mb-4">
                    Opening Hours
                  </h3>

                  <div className="space-y-2 text-xs sm:text-sm">
                    {operatingHoursSchedule.map(({ label, text }) => (
                      <div
                        key={label}
                        className="flex items-center justify-between py-1 border-b border-slate-100"
                      >
                        <span className="font-semibold text-text-primary w-12">
                          {label}
                        </span>
                        <span
                          className={`${
                            text === "Closed"
                              ? "text-rose-500 font-semibold"
                              : "text-text-secondary"
                          }`}
                        >
                          {text}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Description: About this space */}
            <div className="rounded-xl border border-border bg-surface p-6 shadow-xs">
              <h2 className="text-lg font-bold text-text-primary mb-3">
                About this workspace
              </h2>
              <p className="text-sm leading-relaxed text-text-secondary whitespace-pre-line">
                {workspace.description}
              </p>

              {workspace.features?.length > 0 && (
                <div className="mt-5 pt-4 border-t border-border">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-text-secondary mb-3">
                    Highlights & Inclusions
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {workspace.features.map((feature, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-2 text-xs font-medium text-text-primary"
                      >
                        <span className="size-1.5 rounded-full bg-primary" />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Amenities Grid */}
            <div className="rounded-xl border border-border bg-surface p-6 shadow-xs">
              <h2 className="text-lg font-bold text-text-primary mb-4">
                Amenities & Facilities
              </h2>

              {workspace.amenities?.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {workspace.amenities.map((amenity, idx) => {
                    const IconComponent = amenityIcons[amenity] || FiCheck;
                    return (
                      <div
                        key={idx}
                        className="flex items-center gap-3 rounded-lg border border-border bg-background/50 p-3 text-xs sm:text-sm font-medium text-text-primary"
                      >
                        <IconComponent className="size-4 shrink-0 text-primary" />
                        <span>{amenity}</span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-xs text-text-secondary">
                  Standard workspace amenities provided upon check-in.
                </p>
              )}
            </div>

            {/* Address & Location Card */}
            <div className="rounded-xl border border-border bg-surface p-6 shadow-xs">
              <h2 className="text-lg font-bold text-text-primary mb-3">
                Location & Accessibility
              </h2>

              <div className="flex items-start gap-3 text-sm text-text-secondary">
                <FiMapPin className="size-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-text-primary">
                    {workspace.address?.fullAddress}
                  </p>
                  {workspace.address?.landmark && (
                    <p className="text-xs text-text-secondary mt-0.5">
                      Landmark: {workspace.address.landmark}
                    </p>
                  )}
                  <p className="text-xs text-text-secondary mt-0.5">
                    {workspace.address?.city}, {workspace.address?.state} -{" "}
                    {workspace.address?.postalCode}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* =======================================================
              RIGHT SIDEBAR: Booking Card (Matching Reference Layout)
             ======================================================= */}
          <aside className="lg:col-span-4 lg:sticky lg:top-24">
            <div className="rounded-2xl border border-border bg-surface p-6 shadow-md">
              {/* Card Title */}
              <h3 className="text-sm font-bold uppercase tracking-wider text-text-secondary mb-4 pb-2 border-b border-border flex items-center gap-2">
                <FiClock className="size-4 text-primary" />
                <span>Choose a date and time</span>
              </h3>

              {/* Dynamic Pricing Selector (Hourly vs Daily) */}
              {hourlyEnabled && dailyEnabled ? (
                <div className="grid grid-cols-2 gap-3 mb-6 p-2 rounded-xl bg-slate-50 border border-border text-center">
                  <div
                    onClick={() => setBookingType("hourly")}
                    className={`cursor-pointer rounded-lg p-2.5 transition ${
                      bookingType === "hourly"
                        ? "bg-white shadow-xs border border-primary/30 text-text-primary"
                        : "opacity-75 hover:opacity-100 text-text-secondary"
                    }`}
                  >
                    <p className="text-[11px] font-bold uppercase tracking-wider text-text-secondary">
                      Hourly
                    </p>
                    <p className="text-base sm:text-lg font-extrabold text-text-primary mt-0.5">
                      {formatPrice(hourlyPrice, currency)}
                      <span className="text-xs font-normal text-text-secondary block sm:inline">
                        {" "}/ {unitLabel} / hr
                      </span>
                    </p>
                  </div>

                  <div
                    onClick={() => setBookingType("full-day")}
                    className={`cursor-pointer rounded-lg p-2.5 transition ${
                      bookingType === "full-day"
                        ? "bg-white shadow-xs border border-primary/30 text-text-primary"
                        : "opacity-75 hover:opacity-100 text-text-secondary"
                    }`}
                  >
                    <p className="text-[11px] font-bold uppercase tracking-wider text-text-secondary">
                      Daily
                    </p>
                    <p className="text-base sm:text-lg font-extrabold text-text-primary mt-0.5">
                      {formatPrice(dailyPrice, currency)}
                      <span className="text-xs font-normal text-text-secondary block sm:inline">
                        {" "}/ {unitLabel} / day
                      </span>
                    </p>
                  </div>
                </div>
              ) : hourlyEnabled ? (
                <div className="mb-6 p-3 rounded-xl bg-slate-50 border border-border flex items-center justify-between">
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-text-secondary block">
                      Hourly Rate
                    </span>
                    <span className="text-lg font-extrabold text-text-primary">
                      {formatPrice(hourlyPrice, currency)}
                      <span className="text-xs font-normal text-text-secondary">
                        {" "}/ {unitLabel} / hr
                      </span>
                    </span>
                  </div>
                  <span className="text-[11px] px-2.5 py-1 rounded-full bg-primary/10 text-primary font-semibold">
                    Hourly Access
                  </span>
                </div>
              ) : dailyEnabled ? (
                <div className="mb-6 p-3 rounded-xl bg-slate-50 border border-border flex items-center justify-between">
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-text-secondary block">
                      Daily Rate
                    </span>
                    <span className="text-lg font-extrabold text-text-primary">
                      {formatPrice(dailyPrice, currency)}
                      <span className="text-xs font-normal text-text-secondary">
                        {" "}/ {unitLabel} / day
                      </span>
                    </span>
                  </div>
                  <span className="text-[11px] px-2.5 py-1 rounded-full bg-primary/10 text-primary font-semibold">
                    Full Day Access
                  </span>
                </div>
              ) : null}

              {/* Booking Controls Form */}
              <div className="space-y-4">
                {/* 1. Date Picker with integrated calendar popover (blocked dates disabled) */}
                <div>
                  <label
                    className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-text-secondary"
                  >
                    Booking Date
                  </label>

                  <BookingDatePicker
                    selectedDate={date}
                    onSelectDate={(newDate) => handleDateSelect(newDate)}
                    blockedDates={workspace?.blockedDates || []}
                    minDate={getToday()}
                    operatingHours={workspace?.operatingHours}
                    isBlocked={isDateBlocked(date)}
                  />
                </div>

                {/* 2. Start Time & Duration (Hourly Mode only) */}
                {bookingType === "hourly" && (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label
                        htmlFor="booking-time"
                        className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-text-secondary"
                      >
                        Start Time
                      </label>
                      <div className="relative">
                        <FiClock className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary size-4" />
                        <input
                          id="booking-time"
                          type="time"
                          value={startTime}
                          onChange={(e) => setStartTime(e.target.value)}
                          className="w-full rounded-lg border border-border bg-surface py-2.5 pl-9 pr-2 text-xs sm:text-sm text-text-primary outline-none transition focus:border-primary shadow-xs"
                        />
                      </div>
                    </div>

                    <div>
                      <label
                        htmlFor="booking-duration"
                        className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-text-secondary"
                      >
                        Duration
                      </label>
                      <select
                        id="booking-duration"
                        value={duration}
                        onChange={(e) => setDuration(Number(e.target.value))}
                        className="w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-xs sm:text-sm text-text-primary outline-none transition focus:border-primary shadow-xs"
                      >
                        {[1, 2, 3, 4, 5, 6, 7, 8].map((h) => (
                          <option key={h} value={h}>
                            {h} {h === 1 ? "hour" : "hours"}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}

                {/* 3. Number of Guests */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-semibold uppercase tracking-wider text-text-secondary">
                      {perPerson
                        ? "Number of People / Seats"
                        : `Number of Guests (Max ${workspace.capacity})`}
                    </label>
                    <span className="text-[11px] text-text-secondary font-medium">
                      Max {workspace.capacity}
                    </span>
                  </div>

                  <div className="flex items-center justify-between rounded-lg border border-border bg-surface p-2.5 shadow-xs">
                    <div>
                      <span className="text-xs text-text-primary font-semibold block">
                        {guests} {guests === 1 ? "Person" : "People"}
                      </span>
                      <span className="text-[11px] text-text-secondary">
                        {perPerson
                          ? "Rate scales per person"
                          : `Flat rate per ${unitLabel}`}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        disabled={guests <= 1}
                        onClick={() => setGuests((g) => Math.max(1, g - 1))}
                        className="size-7 rounded-md border border-border flex items-center justify-center text-text-primary hover:border-primary transition disabled:opacity-40"
                      >
                        <FiMinus className="size-3" />
                      </button>
                      <span className="text-xs font-bold w-4 text-center">
                        {guests}
                      </span>
                      <button
                        type="button"
                        disabled={guests >= (workspace.capacity || 1)}
                        onClick={() =>
                          setGuests((g) =>
                            Math.min(workspace.capacity || 1, g + 1)
                          )
                        }
                        className="size-7 rounded-md border border-border flex items-center justify-center text-text-primary hover:border-primary transition disabled:opacity-40"
                      >
                        <FiPlus className="size-3" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Slot Validation Warning (if any) */}
              {slotError && (
                <div className="mt-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2">
                  <FiAlertCircle className="size-4 shrink-0 text-rose-600 mt-0.5" />
                  <span>{slotError}</span>
                </div>
              )}

              {/* Pricing & Promo Row */}
              <div className="mt-6 pt-4 border-t border-border space-y-3">
                {/* Promo / Coupon Code Section */}
                <div>
                  <div className="text-xs font-semibold text-text-primary mb-1.5 flex items-center justify-between">
                    <span>Have a coupon code?</span>
                    {appliedCoupon && (
                      <span className="text-[11px] font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                        Applied ({appliedCoupon.code})
                      </span>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="e.g. WELCOME10"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                      disabled={!!appliedCoupon || couponLoading}
                      className="w-full text-xs uppercase px-3 py-2 rounded-lg border border-border focus:outline-hidden focus:ring-1 focus:ring-primary disabled:bg-slate-100"
                    />
                    {appliedCoupon ? (
                      <button
                        type="button"
                        onClick={handleRemoveCoupon}
                        className="px-3 py-1.5 text-xs font-medium text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-lg transition"
                      >
                        Remove
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={handleApplyCoupon}
                        disabled={couponLoading || !couponInput.trim()}
                        className="px-3 py-1.5 text-xs font-semibold text-white bg-primary hover:bg-primary-hover rounded-lg transition disabled:opacity-50"
                      >
                        {couponLoading ? "..." : "Apply"}
                      </button>
                    )}
                  </div>
                  {couponMessage.text && (
                    <p
                      className={`text-[11px] mt-1 ${
                        couponMessage.type === "success"
                          ? "text-emerald-600"
                          : "text-rose-600"
                      }`}
                    >
                      {couponMessage.text}
                    </p>
                  )}
                </div>

                {appliedCoupon && couponDiscount > 0 && (
                  <div className="flex items-center justify-between text-xs text-emerald-600 font-medium">
                    <span>Discount ({appliedCoupon.code})</span>
                    <span>- {formatPrice(couponDiscount, currency)}</span>
                  </div>
                )}

                <div className="flex items-center justify-between pt-2 border-t border-slate-100 font-bold text-text-primary text-base">
                  <span>Estimated Total</span>
                  <span className="text-primary text-xl">
                    {calculatedTotal !== null
                      ? formatPrice(
                          Math.max(0, calculatedTotal - couponDiscount),
                          currency
                        )
                      : "—"}
                  </span>
                </div>
              </div>

              {/* Action Button: Reserve Now */}
              <button
                type="button"
                onClick={handleInitiateBooking}
                disabled={
                  calculatedTotal === null ||
                  slotChecking ||
                  !date ||
                  isDateBlocked(date)
                }
                className="mt-6 w-full rounded-lg bg-primary py-3 px-4 text-sm font-semibold text-white shadow-xs hover:bg-primary-hover transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {slotChecking ? (
                  <span>Checking availability...</span>
                ) : (
                  <>
                    <span>Reserve now</span>
                    <FiArrowRight className="size-4" />
                  </>
                )}
              </button>

              {/* Trust/Guarantee points matching reference */}
              <div className="mt-4 pt-4 border-t border-border space-y-2 text-xs text-text-secondary">
                <div className="flex items-center gap-2">
                  <FiCheck className="size-3.5 text-emerald-600" />
                  <span>No online payment charged today</span>
                </div>
                <div className="flex items-center gap-2">
                  <FiCheck className="size-3.5 text-emerald-600" />
                  <span>Pay offline directly to workspace owner</span>
                </div>
                <div className="flex items-center gap-2">
                  <FiCheck className="size-3.5 text-emerald-600" />
                  <span>Instant reservation code & confirmation</span>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* =========================================================
          FULL GALLERY MODAL
         ========================================================= */}
      {showFullGallery && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
          onClick={() => setShowFullGallery(false)}
        >
          <div
            className="relative max-w-4xl w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setShowFullGallery(false)}
              className="absolute -top-12 right-0 text-white p-2 hover:bg-white/10 rounded-full"
            >
              <FiX className="size-6" />
            </button>
            <img
              src={workspaceImages[activeImage] || workspaceImages[0]}
              alt={workspace.name}
              className="w-full max-h-[75vh] object-contain rounded-lg"
            />
            <div className="flex justify-center gap-2 mt-4 overflow-x-auto py-2">
              {workspaceImages.map((img, i) => (
                <img
                  key={i}
                  src={img}
                  alt={`thumb ${i}`}
                  onClick={() => setActiveImage(i)}
                  className={`size-16 object-cover rounded cursor-pointer border-2 transition ${
                    activeImage === i ? "border-primary" : "border-transparent opacity-60"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          BOOKING CONFIRMATION MODAL (With Prominent Offline Payment Notice)
         ========================================================= */}
      {showBookingModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs overflow-y-auto"
        >
          <div className="relative w-full max-w-lg rounded-2xl bg-surface p-6 sm:p-8 shadow-2xl border border-border my-8">
            {confirmedBooking ? (
              /* Success Confirmation */
              <div className="text-center py-2 space-y-4">
                <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 mb-2">
                  <FiCheck className="size-8 stroke-[2.5]" />
                </div>

                <h3 className="text-xl sm:text-2xl font-bold text-text-primary">
                  Reservation Confirmed!
                </h3>

                <p className="text-xs sm:text-sm text-text-secondary leading-relaxed max-w-md mx-auto">
                  Your reservation request has been submitted and sent directly to
                  the workspace owner.
                </p>

                {/* Reference Code Box */}
                <div className="inline-block bg-slate-50 rounded-xl px-5 py-3 border border-border">
                  <p className="text-[11px] uppercase tracking-wider text-text-secondary font-semibold">
                    Booking Reference Code
                  </p>
                  <p className="text-xl font-mono font-extrabold text-primary mt-0.5">
                    #{confirmedBooking.bookingReference || confirmedBooking.bookingCode}
                  </p>
                </div>

                {/* Important Offline Payment Reminder Box */}
                <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs text-left leading-relaxed">
                  <p className="font-bold flex items-center gap-1.5 mb-1">
                    <span>💵</span>
                    <span>Offline Payment Notice</span>
                  </p>
                  <p>
                    Please remember that online payment is not taken. You have to
                    pay <strong>{formatPrice(calculatedTotal, currency)}</strong>{" "}
                    offline directly to the workspace owner upon arrival at the venue via UPI, Card, or Cash.
                  </p>
                </div>

                {/* Actions */}
                <div className="pt-2 flex flex-col sm:flex-row gap-3">
                  <Link
                    to="/customer/bookings"
                    className="flex-1 py-3 px-4 rounded-lg bg-primary text-white text-xs sm:text-sm font-semibold hover:bg-primary-hover transition text-center shadow-xs"
                  >
                    View in My Bookings
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      setShowBookingModal(false);
                      setConfirmedBooking(null);
                    }}
                    className="flex-1 py-3 px-4 rounded-lg border border-border text-xs sm:text-sm font-semibold text-text-primary hover:bg-slate-50 transition"
                  >
                    Close
                  </button>
                </div>
              </div>
            ) : (
              /* Review & Submit Reservation Form */
              <div className="space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-border">
                  <div>
                    <h3 className="text-lg font-bold text-text-primary">
                      Confirm Reservation
                    </h3>
                    <p className="text-xs text-text-secondary">
                      Review your booking details before submitting.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowBookingModal(false)}
                    className="p-1 rounded text-text-secondary hover:text-text-primary"
                  >
                    <FiX className="size-5" />
                  </button>
                </div>

                {bookingError && (
                  <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                    <FiAlertCircle className="size-4 shrink-0 text-rose-600" />
                    <span>{bookingError}</span>
                  </div>
                )}

                {/* Workspace Preview */}
                <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-border">
                  <img
                    src={workspaceImages[0]}
                    alt={workspace.name}
                    className="size-12 rounded-lg object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <h4 className="font-semibold text-sm text-text-primary truncate">
                      {workspace.name}
                    </h4>
                    <p className="text-xs text-text-secondary truncate">
                      {workspace.address?.area}, {workspace.address?.city}
                    </p>
                  </div>
                </div>

                {/* Summary Table */}
                <div className="rounded-xl border border-border p-3.5 text-xs space-y-2">
                  <div className="flex justify-between">
                    <span className="text-text-secondary">Workspace Category:</span>
                    <span className="font-semibold text-text-primary capitalize">
                      {getTypeLabel(workspace.type)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-secondary">Date:</span>
                    <span className="font-semibold text-text-primary">{date}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-secondary">Time / Access:</span>
                    <span className="font-semibold text-text-primary">
                      {bookingType === "hourly"
                        ? `${formatTimeDisplay(startTime)} (${duration} hrs)`
                        : "Full Day Access"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-secondary">Party Size:</span>
                    <span className="font-semibold text-text-primary">
                      {guests} {guests === 1 ? "Person" : "People"}
                    </span>
                  </div>
                  {appliedCoupon && couponDiscount > 0 && (
                    <div className="flex justify-between text-emerald-600 font-medium">
                      <span>Coupon Discount ({appliedCoupon.code}):</span>
                      <span>- {formatPrice(couponDiscount, currency)}</span>
                    </div>
                  )}
                  <div className="flex justify-between pt-2 border-t border-border font-bold text-sm">
                    <span className="text-text-primary">Total to Pay at Venue:</span>
                    <span className="text-primary">
                      {formatPrice(
                        Math.max(0, (calculatedTotal || 0) - couponDiscount),
                        currency
                      )}
                    </span>
                  </div>
                </div>

                {/* Prominent Offline Payment Notice */}
                <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 text-xs leading-relaxed">
                  <p className="font-semibold flex items-center gap-1.5 mb-0.5">
                    <FiInfo className="size-4 text-primary shrink-0" />
                    <span>Pay Offline to Workspace Owner</span>
                  </p>
                  <p className="text-blue-800">
                    Online payment is not collected on NESTORA. You will pay
                    directly to the workspace owner upon arrival at the venue.
                    Booking details will be sent immediately to the owner.
                  </p>
                </div>

                {/* Special Requests */}
                <div>
                  <label
                    htmlFor="specialRequests"
                    className="block text-xs font-semibold text-text-primary mb-1"
                  >
                    Special Requests (Optional)
                  </label>
                  <textarea
                    id="specialRequests"
                    rows="2"
                    placeholder="e.g. Whiteboard markers, quiet seating, coffee on arrival..."
                    value={specialRequests}
                    onChange={(e) => setSpecialRequests(e.target.value)}
                    className="w-full rounded-lg border border-border bg-background p-2 text-xs text-text-primary outline-none focus:border-primary"
                  />
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-3 pt-3 border-t border-border">
                  <button
                    type="button"
                    disabled={bookingLoading}
                    onClick={() => setShowBookingModal(false)}
                    className="px-4 py-2.5 rounded-lg border border-border text-xs font-semibold text-text-primary hover:bg-slate-50 transition"
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    disabled={bookingLoading}
                    onClick={handleConfirmReservation}
                    className="px-5 py-2.5 rounded-lg bg-primary text-xs font-semibold text-white hover:bg-primary-hover shadow-xs transition disabled:opacity-50"
                  >
                    {bookingLoading ? "Confirming..." : "Confirm"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </main>
  );
};

export default WorkspaceDetails;
