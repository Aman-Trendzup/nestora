
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { FiEye, FiEyeOff, FiArrowRight } from "react-icons/fi";

const OwnerRegister = () => {
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
    `w-full rounded-lg border bg-background px-4 py-3 text-sm text-text-primary outline-none transition placeholder:text-text-secondary/60 focus:border-primary ${
      errors[field] ? "border-red-500" : "border-border"
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

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    // Backend API integration will go here.
    console.log("Owner registration data:", formData);
  };

  return (
    <main className="min-h-screen bg-background p-2 sm:p-3">
      <div className="mx-auto grid min-h-[calc(100vh-16px)] max-w-[1440px] overflow-hidden rounded-2xl bg-surface lg:grid-cols-2">

        {/* LEFT BRAND PANEL */}
        <section className="relative hidden flex-col justify-between overflow-hidden bg-primary p-10 text-white lg:flex xl:p-14">
          <Link to="/" className="relative z-10 flex items-center gap-2">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/20 text-lg font-bold">
              N.
            </span>
            <span className="text-xl font-semibold tracking-wide">
              NESTORA
            </span>
          </Link>

          <div className="relative z-10 max-w-lg">
            <p className="mb-5 text-xs font-medium uppercase tracking-[0.25em] text-white/60">
              FOR WORKSPACE PARTNERS
            </p>

            <h1 className="text-4xl font-semibold leading-tight xl:text-5xl">
              Your space has
              <br />
              a place here.
            </h1>

            <p className="mt-6 max-w-md text-base leading-7 text-white/70">
              Bring your workspace to a wider audience. Connect with people
              looking for the right place to work, meet and collaborate.
            </p>
          </div>

          <div className="relative z-10 flex items-center justify-between border-t border-white/15 pt-6 text-xs text-white/50">
            <span>BUILT FOR BETTER WORKSPACES</span>
            <span>NESTORA / PARTNERS</span>
          </div>

          {/* Decorative background element */}
          <div className="pointer-events-none absolute -bottom-40 -right-40 h-96 w-96 rounded-full border border-white/10" />
          <div className="pointer-events-none absolute -bottom-28 -right-28 h-72 w-72 rounded-full border border-white/10" />
        </section>

        {/* RIGHT FORM PANEL */}
        <section className="flex items-center justify-center px-5 py-10 sm:px-10 lg:px-12 xl:px-16">
          <div className="w-full max-w-lg">

            {/* Mobile brand */}
            <Link to="/" className="mb-10 flex items-center gap-2 lg:hidden">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-lg font-bold text-white">
                N.
              </span>
              <span className="text-xl font-semibold text-text-primary">
                NESTORA
              </span>
            </Link>

            <div className="mb-8 flex items-center justify-between">
              <p className="text-xs font-medium uppercase tracking-[0.2em] text-text-secondary">
                PARTNER REGISTRATION
              </p>

              <p className="text-sm text-text-secondary">
                Already a partner?{" "}
                <Link
                  to="/login"
                  className="font-semibold text-primary transition hover:text-primary-hover"
                >
                  Sign in
                </Link>
              </p>
            </div>

            <div className="mb-7">
              <h2 className="text-3xl font-semibold tracking-tight text-text-primary sm:text-4xl">
                List your workspace.
              </h2>

              <p className="mt-3 text-sm leading-6 text-text-secondary">
                Create your partner account to get started. You can add your
                workspace details and listing information next.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">

              {/* PERSONAL DETAILS */}
              <div>
                <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-text-secondary">
                  YOUR DETAILS
                </p>

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
              <div className="border-t border-border pt-5">
                <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-text-secondary">
                  WORKSPACE DETAILS
                </p>

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
              <div className="border-t border-border pt-5">
                <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-text-secondary">
                  ACCOUNT SECURITY
                </p>

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
                    <p className="mt-1 text-xs text-text-secondary">
                      Use at least 8 characters.
                    </p>
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
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-primary-hover"
              >
                Create partner account
                <FiArrowRight />
              </button>

              <p className="text-center text-xs leading-5 text-text-secondary">
                Your workspace will not be published automatically. You'll
                complete your listing after creating your account.
              </p>
            </form>

            <div className="mt-8 border-t border-border pt-5 text-center">
              <p className="text-xs text-text-secondary">
                Looking for a workspace instead?{" "}
                <Link to="/register" className="font-semibold text-primary">
                  Create a customer account
                </Link>
              </p>
            </div>

            <p className="mt-6 text-center text-xs text-text-secondary">
              © {new Date().getFullYear()} NESTORA. All rights reserved.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
};

export default OwnerRegister;
