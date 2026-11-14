
import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { Link, useNavigate, useSearchParams, useLocation } from "react-router";
import login from "../../assets/images/auth/login.webp"

const Login = () => {
  const { refreshUser } = useAuth();
  const [searchParams] = useSearchParams();
  const location = useLocation();

  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState({});

  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));
  };


  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = "Please enter your email address.";
    }

    if (!formData.password) {
      newErrors.password = "Please enter your password.";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      setLoading(true);
      setServerError("");

      const response = await fetch(
        `${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/auth/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            email: formData.email.trim(),
            password: formData.password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Login failed. Please try again.");
      }

      // Refresh the authenticated user from the backend
      const loggedInUser = await refreshUser();

      if (!loggedInUser) {
        throw new Error("Unable to verify your session. Please try again.");
      }

      // Role-based redirection
      if (loggedInUser.role === "owner") {
        navigate("/owner/dashboard");
      } else if (loggedInUser.role === "admin") {
        const redirectParam = searchParams.get("redirect");
        const fromState = location.state?.from?.pathname;
        navigate(redirectParam || fromState || "/admin/dashboard");
      } else {
        const redirectParam = searchParams.get("redirect");
        const fromState = location.state?.from?.pathname;
        navigate(redirectParam || fromState || "/");
      }

    } catch (error) {
      setServerError(
        error.message || "Unable to connect to the server. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };


  return (
    <main className="min-h-screen bg-background p-2 sm:p-3">

      <div className="grid min-h-[calc(100vh-16px)] overflow-hidden rounded-2xl border border-border bg-surface sm:min-h-[calc(100vh-24px)] sm:rounded-3xl lg:grid-cols-[42%_58%]">

        {/* LEFT BRAND PANEL (Matching Reference UI) */}
        <section className="relative hidden lg:flex min-h-[420px] flex-col justify-between overflow-hidden bg-slate-900 p-8 sm:p-10 lg:min-h-full lg:p-12">
          {/* Atmospheric background photo matching reference */}
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-700 hover:scale-105"
            style={{
              backgroundImage: `url(${login})`
            }}
          />

          {/* Soft ambient gradient overlay for crisp readability */}
          <div className="absolute inset-0 bg-black/70" />

          {/* Top: Nestora Logo replacing the Unsplash logo, using project color theme */}
          <div className="relative z-10">
            <Link
              to="/"
              aria-label="NESTORA home"
              className="inline-flex items-center gap-2.5 group"
            >
              <span className="font-serif text-2xl font-bold tracking-tight text-white drop-shadow-sm">
                Nest<span className="italic font-normal">ora</span>
                <span className="text-primary font-bold">.</span>
              </span>
            </Link>
          </div>

          {/* Bottom Content matching reference image layout */}
          <div className="relative z-10 max-w-lg">
            <h1 className="text-3xl sm:text-4xl lg:text-[42px] font-bold tracking-tight text-white leading-[1.15] drop-shadow-sm">
              Creation starts here
            </h1>

            <p className="mt-3 text-xs sm:text-sm text-white/90 leading-relaxed max-w-md drop-shadow-xs">
              Over 500+ verified coworking spaces, quiet desks, and private suites you can reserve in seconds.
            </p>

          </div>
        </section>


        {/* RIGHT LOGIN PANEL */}

        <section className="flex min-h-[650px] flex-col justify-between bg-surface px-6 py-7 sm:px-10 sm:py-9 md:px-14 lg:px-16 xl:px-24">

          {/* Login Form */}

          <div className="mx-auto flex w-full max-w-[420px] flex-1 flex-col justify-center py-12">

            {/* Mobile Brand Logo */}
            <div className="mb-6 lg:hidden">
              <Link
                to="/"
                aria-label="NESTORA home"
                className="inline-flex items-center gap-2 group"
              >
                <span className="font-serif text-2xl font-bold tracking-tight text-text-primary">
                  Nest<span className="italic font-normal">ora</span>
                  <span className="text-primary font-bold">.</span>
                </span>
              </Link>
            </div>

            {/* Heading */}

            <div className="mb-9">

              <span className="mb-3 block text-xs font-semibold uppercase tracking-[0.2em] text-text-secondary">
                YOUR SPACE AWAITS
              </span>

              <h2 className="text-3xl font-semibold tracking-tight text-text-primary sm:text-4xl">
                Welcome back.
              </h2>

              <p className="mt-3 text-sm leading-6 text-text-secondary">
                Sign in to discover spaces and stay on top of your bookings.
              </p>

            </div>


            {/* Form */}

            <form onSubmit={handleSubmit} className="space-y-6" noValidate>

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
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  autoComplete="email"
                  className={`h-13 w-full rounded-lg border bg-background px-4 text-sm text-text-primary outline-none transition-all placeholder:text-text-secondary/60 focus:border-primary focus:ring-2 focus:ring-primary/10 ${errors.email ? "border-red-500" : "border-border"
                    }`}
                />

                {errors.email && (
                  <p className="mt-2 text-xs text-red-500">
                    {errors.email}
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
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    className={`h-13 w-full rounded-lg border bg-background px-4 pr-12 text-sm text-text-primary outline-none transition-all placeholder:text-text-secondary/60 focus:border-primary focus:ring-2 focus:ring-primary/10 ${errors.password ? "border-red-500" : "border-border"
                      }`}
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-text-secondary transition-colors hover:text-primary"
                  >

                    {showPassword ? (

                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.7"
                        className="h-5 w-5"
                      >
                        <path d="M3 3L21 21" />
                        <path d="M10.6 10.6a2 2 0 002.8 2.8" />
                        <path d="M9.9 5.2A10.8 10.8 0 0112 5c5 0 8.5 4 10 7a12.5 12.5 0 01-2.7 3.6" />
                        <path d="M6.2 6.2C3.9 7.7 2.5 10 2 12c1.5 3 5 7 10 7 1.1 0 2.1-.2 3-.5" />
                      </svg>

                    ) : (

                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.7"
                        className="h-5 w-5"
                      >
                        <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>

                    )}

                  </button>

                </div>

                {errors.password && (
                  <p className="mt-2 text-xs text-red-500">
                    {errors.password}
                  </p>
                )}

              </div>


              {serverError && (
                <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                  {serverError}
                </p>
              )}


              {/* Submit */}

              <button
                type="submit"
                disabled={loading}
                className="flex h-13 w-full items-center justify-center gap-2 rounded-lg bg-primary px-5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-primary-hover active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Signing in..." : "Sign in"}
                {!loading && <span aria-hidden="true">→</span>}
              </button>

            </form>


            {/* Bottom Form Content */}

            <p className="mt-8 text-center text-sm text-text-secondary">
              New to NESTORA?{" "}
              <Link
                to="/register"
                className="font-semibold text-primary underline underline-offset-4 hover:opacity-70"
              >
                Create an account
              </Link>
            </p>

          </div>


          {/* Right Footer */}

          <footer className="flex items-center justify-between gap-3 text-xs text-text-secondary">

            <span>© {new Date().getFullYear()} NESTORA</span>

            <div className="flex items-center gap-5">
              <Link
                to="/privacy-policy"
                className="transition-colors hover:text-primary"
              >
                Privacy Policy
              </Link>

              <Link
                to="/contact"
                className="transition-colors hover:text-primary"
              >
                Support
              </Link>
            </div>

          </footer>

        </section>

      </div>

    </main>
  );
};

export default Login;
