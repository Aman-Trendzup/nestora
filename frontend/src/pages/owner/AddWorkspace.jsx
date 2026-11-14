import { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router";
import {
  FiArrowLeft,
  FiPlus,
  FiTrash2,
  FiCheck,
  FiAlertCircle,
  FiImage,
  FiInfo,
  FiClock,
  FiCalendar,
  FiUsers,
  FiLayers,
  FiUploadCloud,
  FiX,
} from "react-icons/fi";
import {
  normalizeWorkspacePricing,
  getCategoryPricingType,
  getCategoryUnitLabel,
} from "../../utils/pricingCalculator";
import { getImageUrl } from "../../utils/imageHelper";
import API_BASE_URL from "../../utils/apiConfig";

const WORKSPACE_TYPES = [
  { value: "coworking", label: "Coworking Space" },
  { value: "private-office", label: "Private Office" },
  { value: "meeting-room", label: "Meeting Room" },
  { value: "conference-room", label: "Conference Room" },
];

const AVAILABLE_AMENITIES = [
  "High-speed Wi-Fi",
  "Coffee & Tea",
  "Power Backup",
  "Air Conditioning",
  "Parking",
  "Meeting Table",
  "Display Screen",
  "Whiteboard",
  "Video Conferencing",
  "Reception",
  "Pantry",
];

export default function AddWorkspace({ isEdit = false }) {
  const navigate = useNavigate();
  const { id } = useParams();

  const [formData, setFormData] = useState({
    name: "",
    type: "coworking",
    description: "",
    capacity: 10,
    totalUnits: 1,
    areaSqFt: 250,
    address: {
      fullAddress: "",
      landmark: "",
      area: "",
      city: "New Delhi",
      state: "Delhi",
      postalCode: "",
      country: "India",
    },
    pricing: {
      pricingType: "per_person",
      hourly: {
        enabled: true,
        price: 150,
      },
      daily: {
        enabled: true,
        price: 900,
      },
      currency: "INR",
    },
    amenities: ["High-speed Wi-Fi", "Air Conditioning", "Coffee & Tea"],
    images: [],
    operatingHours: {
      openingTime: "09:00",
      closingTime: "20:00",
    },
  });

  // Self-hosted Image Upload State
  const [existingImages, setExistingImages] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [filePreviews, setFilePreviews] = useState([]);
  const [fileError, setFileError] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [loadingWorkspace, setLoadingWorkspace] = useState(false);
  const [error, setError] = useState("");

  // Load existing workspace if in edit mode
  useEffect(() => {
    if (isEdit && id) {
      const loadWorkspace = async () => {
        try {
          setLoadingWorkspace(true);
          const response = await fetch(`${API_BASE_URL}/api/workspaces/${id}`, {
            credentials: "include",
          });
          const data = await response.json();
          if (data.success && data.workspace) {
            const ws = data.workspace;
            const normPricing = normalizeWorkspacePricing(ws);
            setFormData({
              name: ws.name || "",
              type: ws.type || "coworking",
              description: ws.description || "",
              capacity: ws.capacity ?? 4,
              totalUnits: ws.totalUnits ?? 1,
              areaSqFt: ws.areaSqFt ?? 100,
              address: {
                fullAddress: ws.address?.fullAddress || "",
                landmark: ws.address?.landmark || "",
                area: ws.address?.area || "",
                city: ws.address?.city || "",
                state: ws.address?.state || "",
                postalCode: ws.address?.postalCode || "",
                country: ws.address?.country || "India",
              },
              pricing: {
                pricingType:
                  normPricing?.pricingType ||
                  (ws.type === "coworking" ? "per_person" : "per_space"),
                hourly: {
                  enabled: normPricing?.hourly?.enabled ?? true,
                  price:
                    normPricing?.hourly?.price !== null &&
                    normPricing?.hourly?.price !== undefined
                      ? normPricing.hourly.price
                      : "",
                },
                daily: {
                  enabled: normPricing?.daily?.enabled ?? true,
                  price:
                    normPricing?.daily?.price !== null &&
                    normPricing?.daily?.price !== undefined
                      ? normPricing.daily.price
                      : "",
                },
                currency: ws.pricing?.currency || "INR",
              },
              amenities: ws.amenities || [],
              images:
                ws.images?.map((img) =>
                  typeof img === "string" ? { url: img, alt: "" } : img
                ) || [],
              operatingHours: {
                openingTime:
                  ws.operatingHours?.openingTime ||
                  ws.operatingHours?.monday?.openingTime ||
                  "09:00",
                closingTime:
                  ws.operatingHours?.closingTime ||
                  ws.operatingHours?.monday?.closingTime ||
                  "20:00",
              },
            });

            if (ws.images && Array.isArray(ws.images)) {
              setExistingImages(
                ws.images.map((img) =>
                  typeof img === "string" ? { url: img, alt: "Workspace view" } : img
                )
              );
            }
          }
        } catch (err) {
          console.error("Load workspace error:", err);
          setError("Failed to load workspace for editing.");
        } finally {
          setLoadingWorkspace(false);
        }
      };
      loadWorkspace();
    }
  }, [isEdit, id]);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleNumberChange = (field, rawValue) => {
    if (rawValue === "") {
      setFormData((prev) => ({ ...prev, [field]: "" }));
      return;
    }
    // Remove leading zeros when digits follow (e.g. "05" -> "5")
    const clean = rawValue.replace(/^0+(?=\d)/, "");
    setFormData((prev) => ({ ...prev, [field]: clean }));
  };

  const handleAddressChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      address: { ...prev.address, [field]: value },
    }));
  };

  const handleTypeChange = (newType) => {
    const determinedPricingType = getCategoryPricingType(newType);
    setFormData((prev) => ({
      ...prev,
      type: newType,
      pricing: {
        ...prev.pricing,
        pricingType: determinedPricingType,
      },
    }));
  };

  const handleHourlyToggle = (enabled) => {
    setFormData((prev) => ({
      ...prev,
      pricing: {
        ...prev.pricing,
        hourly: {
          ...prev.pricing.hourly,
          enabled,
          price: enabled ? prev.pricing.hourly.price || "" : "",
        },
      },
    }));
  };

  const handleDailyToggle = (enabled) => {
    setFormData((prev) => ({
      ...prev,
      pricing: {
        ...prev.pricing,
        daily: {
          ...prev.pricing.daily,
          enabled,
          price: enabled ? prev.pricing.daily.price || "" : "",
        },
      },
    }));
  };

  const handleHourlyPriceChange = (rawValue) => {
    if (rawValue === "") {
      setFormData((prev) => ({
        ...prev,
        pricing: {
          ...prev.pricing,
          hourly: { ...prev.pricing.hourly, price: "" },
        },
      }));
      return;
    }
    const clean = rawValue.replace(/^0+(?=\d)/, "");
    setFormData((prev) => ({
      ...prev,
      pricing: {
        ...prev.pricing,
        hourly: { ...prev.pricing.hourly, price: clean },
      },
    }));
  };

  const handleDailyPriceChange = (rawValue) => {
    if (rawValue === "") {
      setFormData((prev) => ({
        ...prev,
        pricing: {
          ...prev.pricing,
          daily: { ...prev.pricing.daily, price: "" },
        },
      }));
      return;
    }
    const clean = rawValue.replace(/^0+(?=\d)/, "");
    setFormData((prev) => ({
      ...prev,
      pricing: {
        ...prev.pricing,
        daily: { ...prev.pricing.daily, price: clean },
      },
    }));
  };

  const toggleAmenity = (amenity) => {
    setFormData((prev) => {
      const current = prev.amenities;
      return {
        ...prev,
        amenities: current.includes(amenity)
          ? current.filter((a) => a !== amenity)
          : [...current, amenity],
      };
    });
  };

  // Handle local file selection (Max 3 files total, Max 5MB each, JPEG/PNG/WebP)
  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setFileError("");

    const currentTotal = existingImages.length + selectedFiles.length;
    const availableSlots = 3 - currentTotal;

    if (availableSlots <= 0) {
      setFileError("You can upload a maximum of 3 images per workspace listing.");
      return;
    }

    const validFiles = [];
    const newPreviews = [];
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/jpg"];

    for (const file of files) {
      if (validFiles.length >= availableSlots) {
        setFileError("Maximum 3 images reached. Some images were not added.");
        break;
      }

      const ext = "." + file.name.split(".").pop().toLowerCase();
      if (!allowedTypes.includes(file.type) && ![".jpg", ".jpeg", ".png", ".webp"].includes(ext)) {
        setFileError(`"${file.name}" has an unsupported format. Only JPG, PNG, and WebP are allowed.`);
        continue;
      }

      if (file.size > 5 * 1024 * 1024) {
        setFileError(`"${file.name}" exceeds the 5 MB limit. Please select images under 5 MB.`);
        continue;
      }

      validFiles.push(file);
      newPreviews.push({
        file,
        previewUrl: URL.createObjectURL(file),
        name: file.name,
        sizeFormatted: (file.size / (1024 * 1024)).toFixed(2) + " MB",
      });
    }

    setSelectedFiles((prev) => [...prev, ...validFiles]);
    setFilePreviews((prev) => [...prev, ...newPreviews]);
    e.target.value = "";
  };

  const removeSelectedFile = (index) => {
    const preview = filePreviews[index];
    if (preview?.previewUrl) {
      URL.revokeObjectURL(preview.previewUrl);
    }
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    setFilePreviews((prev) => prev.filter((_, i) => i !== index));
    setFileError("");
  };

  const removeExistingImage = (index) => {
    setExistingImages((prev) => prev.filter((_, i) => i !== index));
    setFileError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setFileError("");

    // Validate all workspace details
    if (!formData.name.trim()) {
      setError("Please enter a workspace name.");
      return;
    }
    if (!formData.type) {
      setError("Please select a workspace category.");
      return;
    }
    if (!formData.capacity || Number(formData.capacity) <= 0) {
      setError("Please enter a valid seating capacity (minimum 1).");
      return;
    }
    if (
      formData.type !== "coworking" &&
      (!formData.totalUnits || Number(formData.totalUnits) <= 0)
    ) {
      setError("Please enter the number of bookable units/rooms (minimum 1).");
      return;
    }
    if (!formData.areaSqFt || Number(formData.areaSqFt) <= 0) {
      setError("Please enter the workspace area in square feet.");
      return;
    }
    if (!formData.description.trim()) {
      setError("Please provide a detailed workspace description.");
      return;
    }
    if (
      !formData.address.fullAddress.trim() ||
      !formData.address.area.trim() ||
      !formData.address.city.trim() ||
      !formData.address.state.trim() ||
      !formData.address.postalCode.trim()
    ) {
      setError("Please complete all required address fields (street address, area, city, state, postal code).");
      return;
    }
    if (!formData.amenities || formData.amenities.length === 0) {
      setError("Please select at least one amenity for this workspace.");
      return;
    }

    // Validate images (at least 1, max 3)
    const totalImagesCount = existingImages.length + selectedFiles.length;
    if (totalImagesCount === 0) {
      setError("Please upload at least one photo of the workspace.");
      return;
    }
    if (totalImagesCount > 3) {
      setError("You can have a maximum of 3 photos for this listing.");
      return;
    }

    // Validate pricing: at least one enabled, enabled prices mandatory (> 0)
    if (!formData.pricing.hourly.enabled && !formData.pricing.daily.enabled) {
      setError("Please enable at least one pricing option (Hourly or Daily).");
      return;
    }
    if (
      formData.pricing.hourly.enabled &&
      (!formData.pricing.hourly.price ||
        Number(formData.pricing.hourly.price) <= 0)
    ) {
      setError("Hourly price is mandatory when hourly booking is enabled. Please enter a valid price.");
      return;
    }
    if (
      formData.pricing.daily.enabled &&
      (!formData.pricing.daily.price ||
        Number(formData.pricing.daily.price) <= 0)
    ) {
      setError("Daily price is mandatory when daily booking is enabled. Please enter a valid price.");
      return;
    }

    try {
      setSubmitting(true);

      const endpoint = isEdit
        ? `${API_BASE_URL}/api/workspaces/${id}`
        : `${API_BASE_URL}/api/workspaces`;

      const method = isEdit ? "PUT" : "POST";

      const pricingPayload = {
        pricingType:
          formData.type === "coworking" ? "per_person" : "per_space",
        hourly: {
          enabled: Boolean(formData.pricing.hourly.enabled),
          price: formData.pricing.hourly.enabled
            ? Number(formData.pricing.hourly.price) || 0
            : null,
        },
        daily: {
          enabled: Boolean(formData.pricing.daily.enabled),
          price: formData.pricing.daily.enabled
            ? Number(formData.pricing.daily.price) || 0
            : null,
        },
        currency: "INR",
      };

      // Construct multipart FormData payload for self-hosted server storage
      const formDataPayload = new FormData();
      formDataPayload.append("name", formData.name.trim());
      formDataPayload.append("type", formData.type);
      formDataPayload.append("description", formData.description.trim());
      formDataPayload.append("capacity", Math.max(1, Number(formData.capacity) || 1));
      formDataPayload.append("totalUnits", Math.max(1, Number(formData.totalUnits) || 1));
      formDataPayload.append("areaSqFt", formData.areaSqFt === "" ? 0 : Number(formData.areaSqFt) || 0);
      formDataPayload.append("address", JSON.stringify(formData.address));
      formDataPayload.append("pricing", JSON.stringify(pricingPayload));
      formDataPayload.append("amenities", JSON.stringify(formData.amenities));
      formDataPayload.append("features", JSON.stringify(formData.features || []));
      formDataPayload.append("operatingHours", JSON.stringify(formData.operatingHours));

      // Retained existing images (for edit mode)
      formDataPayload.append("existingImages", JSON.stringify(existingImages));

      // Append newly uploaded image files under field name 'images'
      selectedFiles.forEach((file) => {
        formDataPayload.append("images", file);
      });

      // Do NOT set Content-Type header when sending FormData
      const response = await fetch(endpoint, {
        method,
        credentials: "include",
        body: formDataPayload,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to save workspace listing.");
      }

      navigate("/owner/workspaces");
    } catch (err) {
      console.error("Save workspace error:", err);
      setError(err.message || "An error occurred while saving the listing.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingWorkspace) {
    return (
      <div className="py-20 text-center">
        <div className="mx-auto size-10 animate-spin rounded-full border-4 border-border border-t-primary mb-3" />
        <p className="text-sm text-text-secondary">Loading workspace details...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top back button */}
      <div>
        <Link
          to="/owner/workspaces"
          className="inline-flex items-center gap-2 text-xs font-semibold text-text-secondary hover:text-text-primary mb-3"
        >
          <FiArrowLeft className="size-4" />
          <span>Back to My Listings</span>
        </Link>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-text-primary">
          {isEdit ? "Edit Workspace Listing" : "Add New Workspace Listing"}
        </h1>
        <p className="mt-1 text-sm text-text-secondary">
          Fill in the details below to list your workspace for verified
          professionals.
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-center gap-2">
          <FiAlertCircle className="size-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Information */}
        <div className="rounded-2xl border border-border bg-surface p-6 shadow-xs space-y-4">
          <h2 className="text-base font-bold text-text-primary border-b border-border pb-3">
            1. Basic Information
          </h2>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label
                htmlFor="name"
                className="block text-xs font-semibold text-text-primary mb-1.5"
              >
                Workspace Name *
              </label>
              <input
                id="name"
                type="text"
                required
                placeholder="e.g., Executive Private Cabin at Connaught Place"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                className="w-full rounded-lg border border-border bg-background px-3.5 py-2.5 text-sm text-text-primary outline-none focus:border-primary"
              />
            </div>

            <div>
              <label
                htmlFor="type"
                className="block text-xs font-semibold text-text-primary mb-1.5"
              >
                Workspace Category *
              </label>
              <select
                id="type"
                value={formData.type}
                onChange={(e) => handleTypeChange(e.target.value)}
                className="w-full rounded-lg border border-border bg-background px-3.5 py-2.5 text-sm text-text-primary outline-none focus:border-primary"
              >
                {WORKSPACE_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="capacity"
                className="block text-xs font-semibold text-text-primary mb-1.5"
              >
                {formData.type === "coworking"
                  ? "Max Seating Capacity (Individual Seats) *"
                  : formData.type === "private-office"
                  ? "Office Seating Capacity (People per office) *"
                  : formData.type === "meeting-room"
                  ? "Meeting Room Seating Capacity (People) *"
                  : "Conference Suite Seating Capacity (People) *"}
              </label>
              <input
                id="capacity"
                type="number"
                min="1"
                required
                value={formData.capacity ?? ""}
                onChange={(e) => handleNumberChange("capacity", e.target.value)}
                className="w-full rounded-lg border border-border bg-background px-3.5 py-2.5 text-sm text-text-primary outline-none focus:border-primary"
              />
              <p className="mt-1 text-[11px] text-text-secondary">
                {formData.type === "coworking"
                  ? "Total number of individual seats/desks bookable by customers."
                  : `Maximum guests allowed inside this ${getCategoryUnitLabel(
                      formData.type
                    )}.`}
              </p>
            </div>

            {formData.type !== "coworking" && (
              <div>
                <label
                  htmlFor="totalUnits"
                  className="block text-xs font-semibold text-text-primary mb-1.5"
                >
                  Number of Available Bookable {getCategoryUnitLabel(formData.type) === "office" ? "Offices" : "Rooms"} *
                </label>
                <input
                  id="totalUnits"
                  type="number"
                  min="1"
                  required
                  value={formData.totalUnits ?? 1}
                  onChange={(e) => handleNumberChange("totalUnits", e.target.value)}
                  className="w-full rounded-lg border border-border bg-background px-3.5 py-2.5 text-sm text-text-primary outline-none focus:border-primary"
                />
                <p className="mt-1 text-[11px] text-text-secondary">
                  Physical count of distinct {getCategoryUnitLabel(formData.type)} units at this listing (default 1).
                </p>
              </div>
            )}

            <div>
              <label
                htmlFor="areaSqFt"
                className="block text-xs font-semibold text-text-primary mb-1.5"
              >
                Area (Square Feet) *
              </label>
              <input
                id="areaSqFt"
                type="number"
                min="1"
                required
                value={formData.areaSqFt ?? ""}
                onChange={(e) => handleNumberChange("areaSqFt", e.target.value)}
                className="w-full rounded-lg border border-border bg-background px-3.5 py-2.5 text-sm text-text-primary outline-none focus:border-primary"
              />
            </div>

            <div className="sm:col-span-2">
              <label
                htmlFor="description"
                className="block text-xs font-semibold text-text-primary mb-1.5"
              >
                Workspace Description *
              </label>
              <textarea
                id="description"
                rows="4"
                required
                placeholder="Highlight the vibe, seating layout, acoustic insulation, and equipment available..."
                value={formData.description}
                onChange={(e) =>
                  handleInputChange("description", e.target.value)
                }
                className="w-full rounded-lg border border-border bg-background p-3 text-sm text-text-primary outline-none focus:border-primary"
              />
            </div>
          </div>
        </div>

        {/* Location & Address */}
        <div className="rounded-2xl border border-border bg-surface p-6 shadow-xs space-y-4">
          <h2 className="text-base font-bold text-text-primary border-b border-border pb-3">
            2. Location & Address
          </h2>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label
                htmlFor="fullAddress"
                className="block text-xs font-semibold text-text-primary mb-1.5"
              >
                Full Street Address *
              </label>
              <input
                id="fullAddress"
                type="text"
                required
                placeholder="e.g., Suite 402, Barakhamba Road, Connaught Place"
                value={formData.address.fullAddress}
                onChange={(e) =>
                  handleAddressChange("fullAddress", e.target.value)
                }
                className="w-full rounded-lg border border-border bg-background px-3.5 py-2.5 text-sm text-text-primary outline-none focus:border-primary"
              />
            </div>

            <div>
              <label
                htmlFor="area"
                className="block text-xs font-semibold text-text-primary mb-1.5"
              >
                Area / Neighborhood *
              </label>
              <input
                id="area"
                type="text"
                required
                placeholder="e.g., Connaught Place / Indiranagar"
                value={formData.address.area}
                onChange={(e) => handleAddressChange("area", e.target.value)}
                className="w-full rounded-lg border border-border bg-background px-3.5 py-2.5 text-sm text-text-primary outline-none focus:border-primary"
              />
            </div>

            <div>
              <label
                htmlFor="landmark"
                className="block text-xs font-semibold text-text-primary mb-1.5"
              >
                Landmark
              </label>
              <input
                id="landmark"
                type="text"
                placeholder="Near Metro Station Gate 2"
                value={formData.address.landmark}
                onChange={(e) =>
                  handleAddressChange("landmark", e.target.value)
                }
                className="w-full rounded-lg border border-border bg-background px-3.5 py-2.5 text-sm text-text-primary outline-none focus:border-primary"
              />
            </div>

            <div>
              <label
                htmlFor="city"
                className="block text-xs font-semibold text-text-primary mb-1.5"
              >
                City *
              </label>
              <input
                id="city"
                type="text"
                required
                value={formData.address.city}
                onChange={(e) => handleAddressChange("city", e.target.value)}
                className="w-full rounded-lg border border-border bg-background px-3.5 py-2.5 text-sm text-text-primary outline-none focus:border-primary"
              />
            </div>

            <div>
              <label
                htmlFor="state"
                className="block text-xs font-semibold text-text-primary mb-1.5"
              >
                State *
              </label>
              <input
                id="state"
                type="text"
                required
                value={formData.address.state}
                onChange={(e) => handleAddressChange("state", e.target.value)}
                className="w-full rounded-lg border border-border bg-background px-3.5 py-2.5 text-sm text-text-primary outline-none focus:border-primary"
              />
            </div>

            <div>
              <label
                htmlFor="postalCode"
                className="block text-xs font-semibold text-text-primary mb-1.5"
              >
                PIN / Postal Code *
              </label>
              <input
                id="postalCode"
                type="text"
                required
                placeholder="110001"
                value={formData.address.postalCode}
                onChange={(e) =>
                  handleAddressChange("postalCode", e.target.value)
                }
                className="w-full rounded-lg border border-border bg-background px-3.5 py-2.5 text-sm text-text-primary outline-none focus:border-primary"
              />
            </div>
          </div>
        </div>

        {/* Dynamic Category Pricing & Operating Schedule */}
        <div className="rounded-2xl border border-border bg-surface p-6 shadow-xs space-y-6">
          <div className="border-b border-border pb-3">
            <h2 className="text-base font-bold text-text-primary">
              3. Dynamic Category Pricing & Schedule
            </h2>
            <p className="text-xs text-text-secondary mt-0.5">
              Set hourly and daily rates for your listing. Pricing automatically adapts to your selected category.
            </p>
          </div>

          {/* Pricing Type Banner */}
          <div className="rounded-xl border border-blue-200 bg-blue-50/70 p-4">
            <div className="flex items-start gap-3">
              <FiInfo className="size-5 text-primary shrink-0 mt-0.5" />
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-text-primary uppercase tracking-wider">
                    Pricing Model:
                  </span>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary text-white">
                    {formData.type === "coworking" ? "Per Person (Seats)" : "Per Space (Entire Room / Office)"}
                  </span>
                </div>
                <p className="mt-1 text-xs text-blue-900 leading-relaxed">
                  {formData.type === "coworking"
                    ? "Coworking spaces charge per person/seat. Total booking cost multiplies by the number of guests reserved (Hourly = Rate × Guests × Hours, Daily = Rate × Guests)."
                    : `Customers pay a flat rate for the entire ${getCategoryUnitLabel(
                        formData.type
                      )}. The price remains fixed whether 1 or ${formData.capacity} guests occupy the space (within capacity).`}
                </p>
              </div>
            </div>
          </div>

          {/* Booking Duration Toggles & Inputs */}
          <div className="grid gap-5 sm:grid-cols-2">
            {/* Hourly Option */}
            <div
              className={`rounded-xl border p-4.5 transition ${
                formData.pricing.hourly.enabled
                  ? "border-primary/40 bg-surface shadow-xs"
                  : "border-border bg-slate-50 opacity-80"
              }`}
            >
              <div className="flex items-center justify-between pb-3 border-b border-border mb-3">
                <div className="flex items-center gap-2">
                  <FiClock className="size-4 text-primary" />
                  <span className="text-xs font-bold text-text-primary uppercase tracking-wider">
                    Hourly Booking
                  </span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.pricing.hourly.enabled}
                    onChange={(e) => handleHourlyToggle(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>

              {formData.pricing.hourly.enabled ? (
                <div>
                  <label
                    htmlFor="hourlyPrice"
                    className="block text-xs font-semibold text-text-primary mb-1.5"
                  >
                    {formData.type === "coworking"
                      ? "Hourly Price Per Person (₹ INR) *"
                      : `Hourly Price Per ${getCategoryUnitLabel(formData.type) === "office" ? "Office" : "Room"} (₹ INR) *`}
                  </label>
                  <div className="relative">
                    <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-text-secondary">
                      ₹
                    </span>
                    <input
                      id="hourlyPrice"
                      type="number"
                      min="1"
                      required={formData.pricing.hourly.enabled}
                      placeholder="e.g. 150"
                      value={formData.pricing.hourly.price ?? ""}
                      onChange={(e) => handleHourlyPriceChange(e.target.value)}
                      className="w-full rounded-lg border border-border bg-background pl-7 pr-3 py-2 text-sm text-text-primary outline-none focus:border-primary"
                    />
                  </div>
                  <p className="mt-1.5 text-[11px] text-text-secondary">
                    {formData.type === "coworking"
                      ? "Charged per person for each hour reserved."
                      : "Flat hourly rate for the complete room."}
                  </p>
                </div>
              ) : (
                <p className="text-xs text-text-secondary py-3 italic text-center">
                  Hourly bookings are disabled for this workspace.
                </p>
              )}
            </div>

            {/* Daily Option */}
            <div
              className={`rounded-xl border p-4.5 transition ${
                formData.pricing.daily.enabled
                  ? "border-primary/40 bg-surface shadow-xs"
                  : "border-border bg-slate-50 opacity-80"
              }`}
            >
              <div className="flex items-center justify-between pb-3 border-b border-border mb-3">
                <div className="flex items-center gap-2">
                  <FiCalendar className="size-4 text-primary" />
                  <span className="text-xs font-bold text-text-primary uppercase tracking-wider">
                    Daily Booking
                  </span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.pricing.daily.enabled}
                    onChange={(e) => handleDailyToggle(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>

              {formData.pricing.daily.enabled ? (
                <div>
                  <label
                    htmlFor="fullDayPrice"
                    className="block text-xs font-semibold text-text-primary mb-1.5"
                  >
                    {formData.type === "coworking"
                      ? "Daily Price Per Person (₹ INR) *"
                      : `Daily Price Per ${getCategoryUnitLabel(formData.type) === "office" ? "Office" : "Room"} (₹ INR) *`}
                  </label>
                  <div className="relative">
                    <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-text-secondary">
                      ₹
                    </span>
                    <input
                      id="fullDayPrice"
                      type="number"
                      min="1"
                      required={formData.pricing.daily.enabled}
                      placeholder="e.g. 900"
                      value={formData.pricing.daily.price ?? ""}
                      onChange={(e) => handleDailyPriceChange(e.target.value)}
                      className="w-full rounded-lg border border-border bg-background pl-7 pr-3 py-2 text-sm text-text-primary outline-none focus:border-primary"
                    />
                  </div>
                  <p className="mt-1.5 text-[11px] text-text-secondary">
                    {formData.type === "coworking"
                      ? "Charged per person for a full business day."
                      : "Flat daily rate according to opening/closing hours."}
                  </p>
                </div>
              ) : (
                <p className="text-xs text-text-secondary py-3 italic text-center">
                  Daily bookings are disabled for this workspace.
                </p>
              )}
            </div>
          </div>

          {/* Operating Hours */}
          <div className="pt-2 border-t border-border">
            <h3 className="text-xs font-bold text-text-primary uppercase tracking-wider mb-3">
              Standard Operating Hours
            </h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="openingTime"
                  className="block text-xs font-semibold text-text-primary mb-1.5"
                >
                  Opening Time (HH:MM)
                </label>
                <input
                  id="openingTime"
                  type="time"
                  value={formData.operatingHours.openingTime}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      operatingHours: {
                        ...prev.operatingHours,
                        openingTime: e.target.value,
                      },
                    }))
                  }
                  className="w-full rounded-lg border border-border bg-background px-3.5 py-2.5 text-sm text-text-primary outline-none focus:border-primary"
                />
              </div>

              <div>
                <label
                  htmlFor="closingTime"
                  className="block text-xs font-semibold text-text-primary mb-1.5"
                >
                  Closing Time (HH:MM)
                </label>
                <input
                  id="closingTime"
                  type="time"
                  value={formData.operatingHours.closingTime}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      operatingHours: {
                        ...prev.operatingHours,
                        closingTime: e.target.value,
                      },
                    }))
                  }
                  className="w-full rounded-lg border border-border bg-background px-3.5 py-2.5 text-sm text-text-primary outline-none focus:border-primary"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Amenities */}
        <div className="rounded-2xl border border-border bg-surface p-6 shadow-xs space-y-4">
          <h2 className="text-base font-bold text-text-primary border-b border-border pb-3">
            4. Amenities Available
          </h2>
          <p className="text-xs text-text-secondary">
            Select the amenities customers can access at your workspace.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {AVAILABLE_AMENITIES.map((amenity) => {
              const checked = formData.amenities.includes(amenity);
              return (
                <button
                  type="button"
                  key={amenity}
                  onClick={() => toggleAmenity(amenity)}
                  className={`flex items-center gap-2 p-3 rounded-xl border text-xs font-medium text-left transition ${
                    checked
                      ? "border-primary bg-primary/5 text-primary"
                      : "border-border bg-background text-text-secondary hover:border-text-secondary"
                  }`}
                >
                  <div
                    className={`size-4 rounded flex items-center justify-center border ${
                      checked
                        ? "border-primary bg-primary text-white"
                        : "border-border bg-surface"
                    }`}
                  >
                    {checked && <FiCheck className="size-3" />}
                  </div>
                  <span>{amenity}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Photos & Visuals - Self-Hosted Image Upload */}
        <div className="rounded-2xl border border-border bg-surface p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <div>
              <h2 className="text-base font-bold text-text-primary">
                5. Workspace Photos
              </h2>
              <p className="text-xs text-text-secondary mt-0.5">
                Upload up to 3 photos. Images are stored securely on your server.
              </p>
            </div>
            <span
              className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                existingImages.length + selectedFiles.length === 3
                  ? "bg-amber-100 text-amber-800"
                  : "bg-slate-100 text-text-secondary"
              }`}
            >
              {existingImages.length + selectedFiles.length} of 3 added
            </span>
          </div>

          {/* File input / Dropzone button */}
          {existingImages.length + selectedFiles.length < 3 ? (
            <label className="relative flex flex-col items-center justify-center p-6 sm:p-8 rounded-xl border-2 border-dashed border-border hover:border-primary bg-slate-50/50 hover:bg-slate-50 transition cursor-pointer group text-center">
              <input
                type="file"
                multiple
                accept="image/jpeg,image/png,image/webp,image/jpg"
                onChange={handleFileSelect}
                className="sr-only"
              />
              <div className="size-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                <FiUploadCloud className="size-6" />
              </div>
              <p className="text-xs sm:text-sm font-bold text-text-primary">
                Click to browse or drag & drop workspace photos
              </p>
              <p className="text-[11px] text-text-secondary mt-1">
                Supported formats: JPG, PNG, WebP • Maximum 5 MB per image • Up to 3 photos
              </p>
            </label>
          ) : (
            <div className="p-3.5 rounded-xl bg-slate-50 border border-border text-xs text-text-secondary text-center">
              You have added the maximum of 3 photos. Remove a photo below if you wish to select a different one.
            </div>
          )}

          {/* Inline File Errors */}
          {fileError && (
            <div className="p-3 rounded-lg border border-rose-200 bg-rose-50 text-xs text-rose-700 flex items-center gap-2">
              <FiAlertCircle className="size-4 shrink-0 text-rose-500" />
              <span>{fileError}</span>
            </div>
          )}

          {/* Gallery Previews (Existing + Newly Selected) */}
          {(existingImages.length > 0 || filePreviews.length > 0) && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              {/* Existing Uploaded Images */}
              {existingImages.map((img, idx) => (
                <div
                  key={`existing-${idx}`}
                  className="relative rounded-xl overflow-hidden border border-border bg-slate-100 group aspect-4/3 flex flex-col justify-between"
                >
                  <img
                    src={getImageUrl(img.url)}
                    alt={img.alt || `Workspace Photo ${idx + 1}`}
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute top-2 left-2 bg-emerald-600/90 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-xs backdrop-blur-2xs">
                    Uploaded
                  </div>
                  <button
                    type="button"
                    onClick={() => removeExistingImage(idx)}
                    title="Remove Photo"
                    className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/60 text-white hover:bg-rose-600 transition shadow-xs"
                  >
                    <FiTrash2 className="size-3.5" />
                  </button>
                  <div className="absolute bottom-0 inset-x-0 bg-black/60 backdrop-blur-xs px-2.5 py-1 text-[10px] text-white truncate">
                    Photo {idx + 1}
                  </div>
                </div>
              ))}

              {/* Newly Selected Local Files */}
              {filePreviews.map((preview, idx) => (
                <div
                  key={`new-${idx}`}
                  className="relative rounded-xl overflow-hidden border border-primary/40 bg-slate-100 group aspect-4/3 flex flex-col justify-between"
                >
                  <img
                    src={preview.previewUrl}
                    alt={preview.name}
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute top-2 left-2 bg-primary/90 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-xs backdrop-blur-2xs">
                    New Selection
                  </div>
                  <button
                    type="button"
                    onClick={() => removeSelectedFile(idx)}
                    title="Remove File"
                    className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/60 text-white hover:bg-rose-600 transition shadow-xs"
                  >
                    <FiTrash2 className="size-3.5" />
                  </button>
                  <div className="absolute bottom-0 inset-x-0 bg-black/60 backdrop-blur-xs px-2.5 py-1 text-[10px] text-white flex items-center justify-between gap-1">
                    <span className="truncate">{preview.name}</span>
                    <span className="text-slate-300 shrink-0">({preview.sizeFormatted})</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Submit Bar */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
          <Link
            to="/owner/workspaces"
            className="px-5 py-2.5 rounded-lg border border-border text-sm font-semibold text-text-primary hover:bg-slate-100 transition"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={submitting}
            className="px-6 py-2.5 rounded-lg bg-primary text-sm font-semibold text-white hover:bg-primary-hover shadow-xs transition disabled:opacity-50"
          >
            {submitting
              ? "Saving Workspace..."
              : isEdit
              ? "Update Workspace"
              : "Publish Workspace Listing"}
          </button>
        </div>
      </form>
    </div>
  );
}

