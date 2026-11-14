
import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { useAuth } from "../../context/AuthContext";
import register from "../../assets/images/auth/register.webp";

const Register = () => {
  const navigate = useNavigate();
  const { refreshUser } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    agreeToTerms: false,
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [serverMessage, setServerMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

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

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = "Please enter your full name.";
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address.";
    }

    if (!/^[6-9]\d{9}$/.test(formData.phone)) {
      newErrors.phone = "Enter a valid 10-digit Indian mobile number.";
    }

    if (formData.password.length < 8) {
      newErrors.password = "Password must contain at least 8 characters.";
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match.";
    }

    if (!formData.agreeToTerms) {
      newErrors.agreeToTerms = "Please accept the terms to continue.";
    }

    setErrors(newErrors);
    setServerMessage("");
    setIsSuccess(false);

    if (Object.keys(newErrors).length > 0) {
      return;
    }

    try {
      setIsLoading(true);

      const response = await fetch(
        `${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/auth/register`,
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
            password: formData.password,
            termsAccepted: formData.agreeToTerms,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Registration failed.");
      }

      // Verify the newly created user's session
      const registeredUser = await refreshUser();

      if (!registeredUser) {
        throw new Error(
          "Account created, but session verification failed. Please log in."
        );
      }

      setIsSuccess(true);
      setServerMessage(data.message || "Account created successfully!");

      // Role-based redirection
      if (registeredUser.role === "owner") {
        navigate("/owner/dashboard");
      } else if (registeredUser.role === "admin") {
        navigate("/admin/dashboard");
      } else {
        navigate("/");
      }

    } catch (error) {
      setIsSuccess(false);
      setServerMessage(
        error.message || "Unable to connect to the server."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const inputClass = (field) =>
    `h-12 w-full rounded-lg border bg-background px-4 text-sm text-text-primary outline-none transition-all placeholder:text-text-secondary/60 focus:border-primary focus:ring-2 focus:ring-primary/10 ${errors[field] ? "border-red-500" : "border-border"
    }`;

  return (
    <main className="min-h-screen lg:h-screen lg:overflow-hidden bg-background p-2 sm:p-3">

      <div className="grid h-full min-h-[calc(100vh-16px)] sm:min-h-[calc(100vh-24px)] lg:min-h-0 lg:h-full overflow-hidden rounded-2xl border border-border bg-surface sm:rounded-3xl lg:grid-cols-[42%_58%]">

        {/* LEFT BRAND PANEL (Fixed height to screen on desktop) */}
        <section className="relative hidden lg:flex h-full flex-col justify-between overflow-hidden bg-slate-900 p-8 text-white sm:p-10 lg:p-12 shrink-0">
          {/* Background Photo with black/60 overlay */}
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-700 hover:scale-105"
            style={{
              backgroundImage: `url(${register})`,
            }}
          />
          <div className="absolute inset-0 bg-black/60" />

          {/* Top: Logo matching reference position */}
          <div className="relative z-10">
            <Link
              to="/"
              aria-label="NESTORA home"
              className="inline-flex items-center gap-2.5 group"
            >

              {/* Brand Wordmark */}
              <span className="font-serif text-xl font-bold tracking-tight text-white drop-shadow-sm">
                Nest<span className="italic font-normal">ora</span>
                <span className="text-primary font-bold">.</span>
              </span>
            </Link>
          </div>

          {/* Middle: Main Statement Headline matching reference */}
          <div className="relative z-10 my-auto py-10 lg:py-0">
            <h1 className="text-2xl sm:text-3xl lg:text-[34px] font-semibold tracking-tight text-white leading-[1.3] max-w-md drop-shadow-sm">
              The workspace where modern creators, remote teams and growing startups find their space to thrive.
            </h1>
          </div>

          {/* Bottom: Customer Testimonial Quote & Author matching reference */}
          <div className="relative z-10 pt-4">
            <blockquote className="text-xs sm:text-sm text-white/90 font-medium leading-relaxed mb-4 drop-shadow-xs">
              &ldquo;Booking a flexible desk or team office takes seconds with zero upfront lease commitments.&rdquo;
            </blockquote>

            <div className="flex items-center gap-2.5">
              <div className="flex size-7 items-center justify-center rounded-full bg-primary text-[11px] font-bold text-white shadow-xs shrink-0 ring-2 ring-white/10">
                MP
              </div>
              <div className="text-xs flex items-center gap-1.5 flex-wrap">
                <span className="font-semibold text-white/95">Meera Patel</span>
                <span className="text-white/40">·</span>
                <span className="text-white/70">Operations Lead, StudioPulse</span>
              </div>
            </div>
          </div>
        </section>


        {/* RIGHT REGISTRATION PANEL (Scrollable without visible scrollbar) */}

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
              Already a member?{" "}
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

              <span className="mb-3 block text-xs font-semibold uppercase tracking-[0.2em] text-text-secondary">
                GET STARTED WITH NESTORA
              </span>

              <h2 className="text-3xl font-semibold tracking-tight text-text-primary sm:text-4xl">
                Create your account.
              </h2>

              <p className="mt-3 text-sm leading-6 text-text-secondary">
                Make room for what matters. Create your account
                and discover spaces that work around you.
              </p>

            </div>


            {/* Registration Form */}

            <form onSubmit={handleSubmit} noValidate className="space-y-4">

              {/* Full Name */}

              <div>
                <label
                  htmlFor="fullName"
                  className="mb-2 block text-sm font-medium text-text-primary"
                >
                  Full name
                </label>

                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                  autoComplete="name"
                  className={inputClass("fullName")}
                />

                {errors.fullName && (
                  <p className="mt-1.5 text-xs text-red-500">
                    {errors.fullName}
                  </p>
                )}
              </div>


              {/* Email */}

              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-medium text-text-primary"
                >
                  Email address
                </label>

                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  autoComplete="email"
                  className={inputClass("email")}
                />

                {errors.email && (
                  <p className="mt-1.5 text-xs text-red-500">
                    {errors.email}
                  </p>
                )}
              </div>


              {/* Phone */}

              <div>
                <label
                  htmlFor="phone"
                  className="mb-2 block text-sm font-medium text-text-primary"
                >
                  Phone number
                </label>

                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  inputMode="numeric"
                  maxLength={10}
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Enter your 10-digit mobile number"
                  autoComplete="tel-national"
                  className={inputClass("phone")}
                />

                {errors.phone && (
                  <p className="mt-1.5 text-xs text-red-500">
                    {errors.phone}
                  </p>
                )}
              </div>


              {/* Password */}

              <div>
                <label
                  htmlFor="password"
                  className="mb-2 block text-sm font-medium text-text-primary"
                >
                  Password
                </label>

                <div className="relative">

                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Create a password"
                    autoComplete="new-password"
                    className={`${inputClass("password")} pr-12`}
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-text-secondary hover:text-primary"
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>

                </div>

                {errors.password && (
                  <p className="mt-1.5 text-xs text-red-500">
                    {errors.password}
                  </p>
                )}
              </div>


              {/* Confirm Password */}

              <div>
                <label
                  htmlFor="confirmPassword"
                  className="mb-2 block text-sm font-medium text-text-primary"
                >
                  Confirm password
                </label>

                <div className="relative">

                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Re-enter your password"
                    autoComplete="new-password"
                    className={`${inputClass("confirmPassword")} pr-12`}
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowConfirmPassword(!showConfirmPassword)
                    }
                    aria-label={
                      showConfirmPassword ? "Hide password" : "Show password"
                    }
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-text-secondary hover:text-primary"
                  >
                    {showConfirmPassword ? "Hide" : "Show"}
                  </button>

                </div>

                {errors.confirmPassword && (
                  <p className="mt-1.5 text-xs text-red-500">
                    {errors.confirmPassword}
                  </p>
                )}
              </div>


              {/* Terms & Conditions */}

              <div className="pt-1">

                <label className="flex cursor-pointer items-start gap-3">

                  <input
                    type="checkbox"
                    name="agreeToTerms"
                    checked={formData.agreeToTerms}
                    onChange={handleChange}
                    className="mt-1 h-4 w-4 shrink-0 accent-primary"
                  />

                  <span className="text-xs leading-5 text-text-secondary">
                    I agree to the{" "}
                    <Link
                      to="/terms"
                      className="font-semibold text-primary underline underline-offset-2"
                    >
                      Terms of Service
                    </Link>{" "}
                    and{" "}
                    <Link
                      to="/privacy-policy"
                      className="font-semibold text-primary underline underline-offset-2"
                    >
                      Privacy Policy
                    </Link>.
                  </span>

                </label>

                {errors.agreeToTerms && (
                  <p className="mt-1.5 text-xs text-red-500">
                    {errors.agreeToTerms}
                  </p>
                )}

              </div>

              {serverMessage && (
                <div
                  role="alert"
                  className={`rounded-lg border p-3 text-sm ${isSuccess
                    ? "border-green-200 bg-green-50 text-green-700"
                    : "border-red-200 bg-red-50 text-red-600"
                    }`}
                >
                  {serverMessage}
                </div>
              )}

              {/* Submit Button */}

              <button
                type="submit"
                disabled={isLoading || isSuccess}
                className="flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-primary px-5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-primary-hover active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isLoading
                  ? "Creating account..."
                  : isSuccess
                    ? "Account created"
                    : "Create account"}

                {!isLoading && !isSuccess && (
                  <span aria-hidden="true">→</span>
                )}
              </button>

            </form>


            {/* Owner Registration Link */}

            <div className="mt-7 border-t border-border pt-6 text-center">

              <p className="text-sm text-text-secondary">
                Have a workspace to list?
              </p>

              <Link
                to="/register/owner"
                className="mt-2 inline-flex items-center gap-2 text-sm font-semibold text-primary transition-opacity hover:opacity-70"
              >
                Become a workspace partner
                <span aria-hidden="true">→</span>
              </Link>

            </div>

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

export default Register;
