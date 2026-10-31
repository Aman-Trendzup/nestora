
import { useState } from "react";
import { Link } from "react-router";
import { useAuth } from "../../context/AuthContext";

const Register = () => {
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
    <main className="min-h-screen bg-background p-2 sm:p-3">

      <div className="grid min-h-[calc(100vh-16px)] overflow-hidden rounded-2xl border border-border bg-surface sm:min-h-[calc(100vh-24px)] sm:rounded-3xl lg:grid-cols-[42%_58%]">

        {/* LEFT BRAND PANEL */}

        <section className="relative flex min-h-[360px] flex-col justify-between overflow-hidden bg-primary px-7 py-8 text-white sm:px-10 sm:py-10 lg:min-h-full lg:px-12 lg:py-12">

          <div className="pointer-events-none absolute -right-32 -top-32 h-80 w-80 rounded-full bg-white/5 blur-3xl" />

          <div className="pointer-events-none absolute -bottom-32 -left-24 h-80 w-80 rounded-full bg-white/5 blur-3xl" />

          {/* Brand */}

          <Link
            to="/"
            className="relative z-10 w-fit text-2xl font-bold tracking-tight"
          >
            NESTORA<span className="text-accent">.</span>
          </Link>

          {/* Content */}

          <div className="relative z-10 mx-auto flex max-w-md flex-col items-center py-10 text-center lg:py-0">

            <div className="mb-8 flex h-20 w-20 items-center justify-center rounded-2xl border border-white/10 bg-white/10">
              <svg
                viewBox="0 0 48 48"
                fill="none"
                className="h-11 w-11"
                aria-hidden="true"
              >
                <path
                  d="M6 22L24 7L42 22V41H28V29H20V41H6V22Z"
                  stroke="currentColor"
                  strokeWidth="2.4"
                  strokeLinejoin="round"
                />
                <path
                  d="M3 23L24 5L45 23"
                  stroke="currentColor"
                  strokeWidth="2.4"
                  strokeLinecap="round"
                />
              </svg>
            </div>

            <span className="mb-4 text-xs font-semibold uppercase tracking-[0.25em] text-white/50">
              YOUR NEXT CHAPTER STARTS HERE
            </span>

            <h1 className="text-3xl font-semibold leading-tight tracking-tight sm:text-4xl lg:text-[42px]">
              A space for every ambition.
            </h1>

            <p className="mt-5 max-w-sm text-sm leading-7 text-white/65 sm:text-base">
              Whether it's a focused day or a fresh perspective,
              find a workspace that helps you do your best work.
            </p>

            <div className="mt-10 flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-white/30" />
              <span className="h-2 w-7 rounded-full bg-white" />
              <span className="h-2 w-2 rounded-full bg-white/30" />
            </div>

          </div>

          {/* Footer */}

          <div className="relative z-10 flex items-center justify-between gap-3 text-[11px] text-white/45">
            <span>© {new Date().getFullYear()} NESTORA</span>
            <span className="tracking-widest">SPACE TO DO MORE.</span>
          </div>

        </section>


        {/* RIGHT REGISTRATION PANEL */}

        <section className="flex min-h-[750px] flex-col justify-between bg-surface px-6 py-7 sm:px-10 sm:py-9 md:px-14 lg:px-16 xl:px-24">

          {/* Header */}

          <header className="flex items-center justify-between">

            <Link
              to="/"
              className="text-xl font-bold tracking-tight text-primary lg:text-2xl"
            >
              N<span className="text-accent">.</span>
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

          <div className="mx-auto flex w-full max-w-[440px] flex-1 flex-col justify-center py-12">

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
