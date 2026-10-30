
import { useState } from "react";
import { Link , useNavigate } from "react-router";

const Login = () => {
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

    // Store non-sensitive user information for the UI.
    // The authentication token remains in the HTTP-only cookie.
    localStorage.setItem("nestoraUser", JSON.stringify(data.user));

    navigate("/");

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

        {/* LEFT BRAND PANEL */}

        <section className="relative flex min-h-[380px] flex-col justify-between overflow-hidden bg-primary px-7 py-8 text-white sm:px-10 sm:py-10 lg:min-h-full lg:px-12 lg:py-12">

          {/* Decorative background */}

          <div className="pointer-events-none absolute -right-32 -top-32 h-80 w-80 rounded-full bg-white/5 blur-3xl" />

          <div className="pointer-events-none absolute -bottom-32 -left-24 h-80 w-80 rounded-full bg-white/5 blur-3xl" />

          {/* Brand */}

          <Link
            to="/"
            className="relative z-10 w-fit text-2xl font-bold tracking-tight"
          >
            NESTORA<span className="text-accent">.</span>
          </Link>

          {/* Main Content */}

          <div className="relative z-10 mx-auto flex max-w-md flex-col items-center py-10 text-center lg:py-0">

            {/* Brand Icon */}

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
              A BETTER WAY TO WORK
            </span>

            <h1 className="text-3xl font-semibold leading-tight tracking-tight sm:text-4xl lg:text-[42px]">
              Find your space.
              <br />
              Make it count.
            </h1>

            <p className="mt-5 max-w-sm text-sm leading-7 text-white/65 sm:text-base">
              From focused workdays to meaningful collaborations,
              discover workspaces that make every workday better.
            </p>

            {/* Carousel Indicators */}

            <div className="mt-10 flex items-center gap-2">
              <span className="h-2 w-7 rounded-full bg-white" />
              <span className="h-2 w-2 rounded-full bg-white/30" />
              <span className="h-2 w-2 rounded-full bg-white/30" />
            </div>

          </div>

          {/* Left Footer */}

          <div className="relative z-10 flex items-center justify-between gap-3 text-[11px] text-white/45">
            <span>© {new Date().getFullYear()} NESTORA</span>
            <span className="tracking-widest">SPACE TO DO MORE.</span>
          </div>

        </section>


        {/* RIGHT LOGIN PANEL */}

        <section className="flex min-h-[650px] flex-col justify-between bg-surface px-6 py-7 sm:px-10 sm:py-9 md:px-14 lg:px-16 xl:px-24">

          {/* Top Header */}

          <header className="flex items-center justify-between">

            <Link
              to="/"
              className="text-xl font-bold tracking-tight text-primary lg:text-2xl"
            >
              N<span className="text-accent">.</span>
            </Link>

            <p className="text-xs text-text-secondary sm:text-sm">
              New to NESTORA?{" "}
              <Link
                to="/register"
                className="font-semibold text-primary underline underline-offset-4 transition-opacity hover:opacity-70"
              >
                Sign up
              </Link>
            </p>

          </header>


          {/* Login Form */}

          <div className="mx-auto flex w-full max-w-[420px] flex-1 flex-col justify-center py-12">

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
                  className={`h-13 w-full rounded-lg border bg-background px-4 text-sm text-text-primary outline-none transition-all placeholder:text-text-secondary/60 focus:border-primary focus:ring-2 focus:ring-primary/10 ${
                    errors.email ? "border-red-500" : "border-border"
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

                <div className="mb-2 flex items-center justify-between">

                  <label
                    htmlFor="password"
                    className="text-sm font-medium text-text-primary"
                  >
                    Password
                  </label>

                  <Link
                    to="/forgot-password"
                    className="text-xs font-medium text-text-secondary underline underline-offset-4 transition-colors hover:text-primary"
                  >
                    Forgot password?
                  </Link>

                </div>

                <div className="relative">

                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    className={`h-13 w-full rounded-lg border bg-background px-4 pr-12 text-sm text-text-primary outline-none transition-all placeholder:text-text-secondary/60 focus:border-primary focus:ring-2 focus:ring-primary/10 ${
                      errors.password ? "border-red-500" : "border-border"
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
