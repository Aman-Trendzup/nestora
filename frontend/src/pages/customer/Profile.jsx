import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import {
  FiUser,
  FiMail,
  FiPhone,
  FiBriefcase,
  FiMapPin,
  FiCalendar,
  FiCheck,
  FiAlertCircle,
  FiEdit2,
} from "react-icons/fi";

import API_BASE_URL from "../../utils/apiConfig";

export default function CustomerProfile() {
  const { user, refreshUser } = useAuth();

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    fullName: user?.fullName || "",
    phone: user?.phone || "",
    businessName: user?.businessName || "",
    businessCity: user?.businessCity || "",
  });

  const [isSaving, setIsSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState({ text: "", type: "" });

  useEffect(() => {
    if (user) {
      setFormData({
        fullName: user.fullName || "",
        phone: user.phone || "",
        businessName: user.businessName || "",
        businessCity: user.businessCity || "",
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setStatusMessage({ text: "", type: "" });
  };

  const handleCancel = () => {
    if (user) {
      setFormData({
        fullName: user.fullName || "",
        phone: user.phone || "",
        businessName: user.businessName || "",
        businessCity: user.businessCity || "",
      });
    }
    setStatusMessage({ text: "", type: "" });
    setIsEditing(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.fullName.trim() || formData.fullName.trim().length < 2) {
      setStatusMessage({
        text: "Please enter a valid full name.",
        type: "error",
      });
      return;
    }

    if (formData.phone && !/^[6-9]\d{9}$/.test(formData.phone.trim())) {
      setStatusMessage({
        text: "Please enter a valid 10-digit Indian phone number.",
        type: "error",
      });
      return;
    }

    try {
      setIsSaving(true);
      setStatusMessage({ text: "", type: "" });

      const response = await fetch(`${API_BASE_URL}/api/auth/profile`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to update profile.");
      }

      await refreshUser();
      setIsEditing(false);

      setStatusMessage({
        text: "Profile updated successfully.",
        type: "success",
      });
    } catch (err) {
      console.error("Profile update error:", err);
      setStatusMessage({
        text: err.message || "Failed to save profile changes.",
        type: "error",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const formattedJoinDate = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString("en-IN", {
        month: "long",
        year: "numeric",
      })
    : "Recent Member";

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-text-primary">
          {user?.role === "owner" ? "Business Profile" : "Account Profile"}
        </h1>
        <p className="mt-1 text-sm text-text-secondary">
          {user?.role === "owner"
            ? "Manage your business information and host contact details."
            : "Manage your personal information."}
        </p>
      </div>

      {/* Status banner */}
      {statusMessage.text && (
        <div
          className={`mb-6 p-4 rounded-xl text-sm flex items-center gap-3 border ${
            statusMessage.type === "success"
              ? "bg-emerald-50 text-emerald-800 border-emerald-200"
              : "bg-rose-50 text-rose-800 border-rose-200"
          }`}
        >
          {statusMessage.type === "success" ? (
            <FiCheck className="size-5 shrink-0 text-emerald-600" />
          ) : (
            <FiAlertCircle className="size-5 shrink-0 text-rose-600" />
          )}
          <span>{statusMessage.text}</span>
        </div>
      )}

      <div className="grid gap-8 md:grid-cols-[1fr_2fr]">
        {/* User Card */}
        <div className="rounded-2xl border border-border bg-surface p-6 shadow-xs text-center flex flex-col items-center h-fit">
          <div className="size-20 rounded-full bg-primary/10 flex items-center justify-center text-primary text-2xl font-bold mb-4 capitalize">
            {user?.fullName?.charAt(0) || "U"}
          </div>

          <h2 className="text-lg font-bold text-text-primary capitalize">
            {user?.fullName}
          </h2>
          <p className="text-sm text-text-secondary mb-3">{user?.email}</p>

          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary capitalize mb-6">
            <FiUser className="size-3" />
            {user?.role} Account
          </span>

          <div className="w-full border-t border-border pt-4 text-xs text-text-secondary space-y-2 text-left">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <FiCalendar className="size-3.5 text-text-secondary" />
                <span>Member Since</span>
              </span>
              <span className="font-medium text-text-primary">
                {formattedJoinDate}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <FiMail className="size-3.5 text-text-secondary" />
                <span>Verification</span>
              </span>
              <span className="font-medium text-emerald-600">Active</span>
            </div>
          </div>
        </div>

        {/* Profile Form Card */}
        <div className="rounded-2xl border border-border bg-surface p-6 sm:p-8 shadow-xs">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Form Header with ONLY the single top Edit button */}
            <div className="flex items-center justify-between border-b border-border pb-4">
              <h2 className="text-base font-semibold text-text-primary">
                Personal Information
              </h2>

              {!isEditing && (
                <button
                  type="button"
                  onClick={() => {
                    setIsEditing(true);
                    setStatusMessage({ text: "", type: "" });
                  }}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface px-3 py-1.5 text-xs font-semibold text-text-primary shadow-xs transition hover:border-primary hover:text-primary hover:bg-slate-50"
                >
                  <FiEdit2 className="size-3.5" />
                  <span>Edit</span>
                </button>
              )}
            </div>

            <div className="space-y-4">
              {/* Full Name */}
              <div>
                <label
                  htmlFor="fullName"
                  className="block text-xs font-semibold text-text-primary mb-1.5"
                >
                  Full Name
                </label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-text-secondary">
                    <FiUser className="size-4" />
                  </span>
                  <input
                    id="fullName"
                    name="fullName"
                    type="text"
                    required
                    disabled={!isEditing}
                    value={formData.fullName}
                    onChange={handleChange}
                    className={`w-full rounded-lg border py-2.5 pl-10 pr-3 text-sm text-text-primary outline-none transition capitalize ${
                      isEditing
                        ? "border-border bg-background focus:border-primary focus:ring-2 focus:ring-primary/10"
                        : "border-border/70 bg-slate-50 cursor-not-allowed select-none"
                    }`}
                  />
                </div>
              </div>

              {/* Email Address (Always Disabled) */}
              <div>
                <label
                  htmlFor="email"
                  className="block text-xs font-semibold text-text-primary mb-1.5"
                >
                  Email Address
                </label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-text-secondary">
                    <FiMail className="size-4" />
                  </span>
                  <input
                    id="email"
                    type="email"
                    disabled
                    value={user?.email || ""}
                    className="w-full rounded-lg border border-border/70 bg-slate-100 py-2.5 pl-10 pr-3 text-sm text-text-secondary cursor-not-allowed select-none"
                  />
                </div>
              </div>

              {/* Phone Number */}
              <div>
                <label
                  htmlFor="phone"
                  className="block text-xs font-semibold text-text-primary mb-1.5"
                >
                  Mobile Number
                </label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-text-secondary">
                    <FiPhone className="size-4" />
                  </span>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    placeholder="10-digit mobile number"
                    disabled={!isEditing}
                    value={formData.phone}
                    onChange={handleChange}
                    className={`w-full rounded-lg border py-2.5 pl-10 pr-3 text-sm text-text-primary outline-none transition ${
                      isEditing
                        ? "border-border bg-background focus:border-primary focus:ring-2 focus:ring-primary/10"
                        : "border-border/70 bg-slate-50 cursor-not-allowed select-none"
                    }`}
                  />
                </div>
              </div>

              {/* Owner Specific Fields */}
              {user?.role === "owner" && (
                <>
                  <div className="border-t border-border pt-4 mt-6">
                    <h3 className="text-sm font-semibold text-text-primary mb-4">
                      Business Details
                    </h3>
                  </div>

                  <div>
                    <label
                      htmlFor="businessName"
                      className="block text-xs font-semibold text-text-primary mb-1.5"
                    >
                      Workspace / Business Name
                    </label>
                    <div className="relative">
                      <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-text-secondary">
                        <FiBriefcase className="size-4" />
                      </span>
                      <input
                        id="businessName"
                        name="businessName"
                        type="text"
                        disabled={!isEditing}
                        value={formData.businessName}
                        onChange={handleChange}
                        className={`w-full rounded-lg border py-2.5 pl-10 pr-3 text-sm text-text-primary outline-none transition ${
                          isEditing
                            ? "border-border bg-background focus:border-primary focus:ring-2 focus:ring-primary/10"
                            : "border-border/70 bg-slate-50 cursor-not-allowed select-none"
                        }`}
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="businessCity"
                      className="block text-xs font-semibold text-text-primary mb-1.5"
                    >
                      Primary Operating City
                    </label>
                    <div className="relative">
                      <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-text-secondary">
                        <FiMapPin className="size-4" />
                      </span>
                      <input
                        id="businessCity"
                        name="businessCity"
                        type="text"
                        disabled={!isEditing}
                        value={formData.businessCity}
                        onChange={handleChange}
                        className={`w-full rounded-lg border py-2.5 pl-10 pr-3 text-sm text-text-primary outline-none transition ${
                          isEditing
                            ? "border-border bg-background focus:border-primary focus:ring-2 focus:ring-primary/10"
                            : "border-border/70 bg-slate-50 cursor-not-allowed select-none"
                        }`}
                      />
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Bottom Actions ONLY when editing */}
            {isEditing && (
              <div className="border-t border-border pt-6 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={isSaving}
                  className="rounded-lg border border-border px-4 py-2 text-xs font-semibold text-text-secondary hover:text-text-primary hover:bg-slate-50 transition disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isSaving}
                  className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2 text-xs font-semibold text-white transition hover:bg-primary-hover shadow-xs disabled:opacity-50"
                >
                  {isSaving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
