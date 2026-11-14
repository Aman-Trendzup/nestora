import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { useAuth } from "../../context/AuthContext";
import { FiEye, FiEyeOff, FiArrowRight } from "react-icons/fi";
import ownerRegister from "../../assets/images/auth/owner register.webp";


const OwnerRegister = () => {
  const navigate = useNavigate();
  const { refreshUser } = useAuth();

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverMessage, setServerMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    workspaceName: "",
    city: "",
    password: "",
    confirmPassword: "",
    agreeToTerms: false,
  });

  const [errors, setErrors] = useState({});

  const inputClass = (field) =>
    `w-full rounded-lg border bg-background px-4 py-3 text-sm text-text-primary outline-none transition placeholder:text-text-secondary/60 focus:border-primary ${errors[field] ? "border-red-500" : "border-border"
    }`;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = "Please enter your full name.";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Please enter your business email.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address.";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Please enter your phone number.";
    } else if (!/^[6-9]\d{9}$/.test(formData.phone)) {
      newErrors.phone = "Enter a valid 10-digit Indian mobile number.";
    }

    if (!formData.workspaceName.trim()) {
      newErrors.workspaceName = "Please enter your workspace name.";
    }

    if (!formData.city.trim()) {
      newErrors.city = "Please enter your city.";
    }

    if (!formData.password) {
      newErrors.password = "Please create a password.";
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters.";
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password.";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match.";
    }

    if (!formData.agreeToTerms) {
      newErrors.agreeToTerms = "Please accept the partner terms to continue.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };


  const handleSubmit = async (e) => {
    e.preventDefault();

    setServerMessage("");

    if (!validateForm()) return;

    try {
      setIsSubmitting(true);

      const response = await fetch(
        `${API_URL}/api/auth/register/owner`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            fullName: formData.fullName.trim(),
            email: formData.email.trim(),
            phone: formData.phone.trim(),
            businessName: formData.workspaceName.trim(),
            businessCity: formData.city.trim(),
            password: formData.password,
            termsAccepted: formData.agreeToTerms,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Owner registration failed."
        );
      }

      const registeredUser = await refreshUser();

      if (!registeredUser || registeredUser.role !== "owner") {
        throw new Error(
          "Account created, but owner session verification failed. Please log in."
        );
      }

      navigate("/owner/dashboard");
    } catch (error) {
      setServerMessage(
        error.message || "Something went wrong. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };


  return (
    <main className="min-h-screen lg:h-screen lg:overflow-hidden bg-background p-2 sm:p-3">
      <div className="grid h-full min-h-[calc(100vh-16px)] sm:min-h-[calc(100vh-24px)] lg:min-h-0 lg:h-full overflow-hidden rounded-2xl border border-border bg-surface sm:rounded-3xl lg:grid-cols-[42%_58%]">

        {/* LEFT BRAND & DASHBOARD PANEL (Fixed height to screen on desktop) */}
        <section className="relative hidden lg:flex h-full flex-col justify-between overflow-hidden bg-slate-900 p-8 text-white sm:p-10 lg:p-12 shrink-0">
          {/* Background image with black/60 overlay */}
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-700 hover:scale-105"
            style={{
              backgroundImage: `url(${ownerRegister})`,
            }}
          />
          <div className="absolute inset-0 bg-black/60" />

          {/* Top Brand & Header */}
          <div className="relative z-10">
            <Link
              to="/"
              aria-label="NESTORA home"
              className="inline-flex items-center gap-2.5 group mb-6"
            >
              <span className="font-serif text-2xl font-bold tracking-tight text-white drop-shadow-sm">
                Nest<span className="italic font-normal">ora</span>
                <span className="text-primary font-bold">.</span>
              </span>
            </Link>

            <h1 className="mt-2 text-2xl sm:text-3xl xl:text-4xl font-bold tracking-tight text-white leading-tight drop-shadow-sm">
              Manage your spaces & bookings in real time.
            </h1>

            <p className="mt-2.5 text-xs sm:text-sm text-white/90 max-w-md leading-relaxed drop-shadow-xs">
              Full control over your pricing, slot availability, and guest check-ins from a powerful owner dashboard.
            </p>
          </div>

          {/* Bottom Value Props */}
          <div className="relative z-10 flex flex-col items-start justify-between text-xs text-white/90 gap-1.5 drop-shadow-xs">
            <span>✓ Direct Offline Payments</span>
            <span>✓ Real-time Slot Control</span>
            <span>✓ Zero Listing Fees</span>
          </div>
        </section>

        {/* RIGHT FORM PANEL (Scrollable without visible scrollbar) */}
        <section className="flex flex-col justify-between bg-surface px-6 py-7 sm:px-10 sm:py-9 md:px-14 lg:px-16 xl:px-24 h-full overflow-y-auto no-scrollbar [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">

          {/* Header */}
          <header className="flex items-center justify-between">
            <Link
              to="/"
              aria-label="NESTORA home"
              className="shrink-0 font-serif text-2xl font-bold tracking-tight text-text-primary"
            >
              Nest<span className="italic font-normal">ora</span>
              <span className="text-primary">.</span>
            </Link>

            <p className="text-xs text-text-secondary sm:text-sm">
              Already a partner?{" "}
              <Link
                to="/login"
                className="font-semibold text-primary underline underline-offset-4 hover:opacity-70"
              >
                Sign in
              </Link>
            </p>
          </header>

          {/* Form Content */}
          <div className="mx-auto flex w-full max-w-[440px] sm:max-w-none flex-1 flex-col justify-center py-12">

            <div className="mb-7">
              <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-text-secondary">
                FOR WORKSPACE OWNERS
              </span>
              <h2 className="text-3xl font-semibold tracking-tight text-text-primary sm:text-4xl">
                List your workspace.
              </h2>

              <p className="mt-3 text-sm leading-6 text-text-secondary">
                Create your partner account to get started. You can add your
                workspace details and listing information next.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">

              {serverMessage && (
                <div
                  role="alert"
                  className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600"
                >
                  {serverMessage}
                </div>
              )}

              {/* PERSONAL DETAILS */}
              <div>

                <div className="space-y-4">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-text-primary">
                      Full name
                    </label>
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                      placeholder="Enter your full name"
                      className={inputClass("fullName")}
                    />
                    {errors.fullName && (
                      <p className="mt-1 text-xs text-red-500">{errors.fullName}</p>
                    )}
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-sm font-medium text-text-primary">
                        Business email
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="you@company.com"
                        className={inputClass("email")}
                      />
                      {errors.email && (
                        <p className="mt-1 text-xs text-red-500">{errors.email}</p>
                      )}
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-text-primary">
                        Phone number
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, "").slice(0, 10);
                          setFormData((prev) => ({ ...prev, phone: value }));
                          setErrors((prev) => ({ ...prev, phone: "" }));
                        }}
                        placeholder="10-digit number"
                        maxLength={10}
                        className={inputClass("phone")}
                      />
                      {errors.phone && (
                        <p className="mt-1 text-xs text-red-500">{errors.phone}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* BUSINESS DETAILS */}
              <div className="pt-5">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-text-primary">
                      Workspace name
                    </label>
                    <input
                      type="text"
                      name="workspaceName"
                      value={formData.workspaceName}
                      onChange={handleChange}
                      placeholder="e.g. The Work Loft"
                      className={inputClass("workspaceName")}
                    />
                    {errors.workspaceName && (
                      <p className="mt-1 text-xs text-red-500">{errors.workspaceName}</p>
                    )}
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-text-primary">
                      City
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      placeholder="e.g. New Delhi"
                      className={inputClass("city")}
                    />
                    {errors.city && (
                      <p className="mt-1 text-xs text-red-500">{errors.city}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* PASSWORD */}
              <div className="pt-5">
                <div className="space-y-4">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-text-primary">
                      Password
                    </label>

                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="Create a password"
                        className={`${inputClass("password")} pr-12`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-text-secondary"
                        aria-label={showPassword ? "Hide password" : "Show password"}
                      >
                        {showPassword ? <FiEyeOff /> : <FiEye />}
                      </button>
                    </div>

                    {errors.password && (
                      <p className="mt-1 text-xs text-red-500">{errors.password}</p>
                    )}
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-text-primary">
                      Confirm password
                    </label>

                    <div className="relative">
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        placeholder="Re-enter your password"
                        className={`${inputClass("confirmPassword")} pr-12`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-text-secondary"
                        aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                      >
                        {showConfirmPassword ? <FiEyeOff /> : <FiEye />}
                      </button>
                    </div>

                    {errors.confirmPassword && (
                      <p className="mt-1 text-xs text-red-500">{errors.confirmPassword}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* TERMS */}
              <div>
                <label className="flex cursor-pointer items-start gap-3">
                  <input
                    type="checkbox"
                    name="agreeToTerms"
                    checked={formData.agreeToTerms}
                    onChange={handleChange}
                    className="mt-1 h-4 w-4 accent-primary"
                  />
                  <span className="text-xs leading-5 text-text-secondary">
                    I agree to NESTORA's{" "}
                    <Link to="/partner-terms" className="font-medium text-primary underline">
                      Partner Terms
                    </Link>{" "}
                    and{" "}
                    <Link to="/privacy-policy" className="font-medium text-primary underline">
                      Privacy Policy
                    </Link>
                    .
                  </span>
                </label>

                {errors.agreeToTerms && (
                  <p className="mt-1 text-xs text-red-500">{errors.agreeToTerms}</p>
                )}
              </div>

              {/* SUBMIT */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting ? "Creating account..." : "Create partner account"}
                {!isSubmitting && <FiArrowRight />}
              </button>
            </form>

            <p className="mt-8 text-center text-sm text-text-secondary">
              Looking for a workspace instead?{" "}
              <Link
                to="/register"
                className="font-semibold text-primary underline underline-offset-4 hover:opacity-70"
              >
                Create a customer account
              </Link>
            </p>
          </div>

          {/* Footer */}
          <footer className="flex items-center justify-between gap-3 text-xs text-text-secondary">
            <span>© {new Date().getFullYear()} NESTORA</span>
            <div className="flex items-center gap-5">
              <Link to="/privacy-policy" className="hover:text-primary">
                Privacy Policy
              </Link>
              <Link to="/contact" className="hover:text-primary">
                Support
              </Link>
            </div>
          </footer>
        </section>
      </div>
    </main>
  );
};

export default OwnerRegister;
