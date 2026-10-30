
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { FiArrowLeft, FiArrowRight, FiMail, FiCheckCircle } from "react-icons/fi";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleChange = (e) => {
    setEmail(e.target.value);
    setError("");
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!email.trim()) {
      setError("Please enter your registered email address.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    // Backend password-reset API integration will go here.
    console.log("Password reset requested for:", email);

    setIsSubmitted(true);
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
              YOUR SPACE AWAITS
            </p>

            <h1 className="text-4xl font-semibold leading-tight xl:text-5xl">
              A fresh start
              <br />
              is one step away.
            </h1>

            <p className="mt-6 max-w-md text-base leading-7 text-white/70">
              Getting back to your account should be simple. Reset your
              password and pick up right where you left off.
            </p>
          </div>

          <div className="relative z-10 flex items-center justify-between border-t border-white/15 pt-6 text-xs text-white/50">
            <span>MADE FOR THE WAY YOU WORK</span>
            <span>NESTORA / ACCOUNT ACCESS</span>
          </div>

          {/* Decorative background elements */}
          <div className="pointer-events-none absolute -bottom-40 -right-40 h-96 w-96 rounded-full border border-white/10" />
          <div className="pointer-events-none absolute -bottom-28 -right-28 h-72 w-72 rounded-full border border-white/10" />
        </section>

        {/* RIGHT CONTENT PANEL */}
        <section className="flex items-center justify-center px-5 py-10 sm:px-10 lg:px-12 xl:px-16">
          <div className="w-full max-w-md">

            {/* Mobile brand */}
            <Link to="/" className="mb-12 flex items-center gap-2 lg:hidden">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-lg font-bold text-white">
                N.
              </span>

              <span className="text-xl font-semibold text-text-primary">
                NESTORA
              </span>
            </Link>

            {isSubmitted ? (
              /* SUCCESS STATE */
              <div>
                <div className="mb-7 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <FiCheckCircle size={28} />
                </div>

                <p className="mb-4 text-xs font-medium uppercase tracking-[0.2em] text-text-secondary">
                  REQUEST RECEIVED
                </p>

                <h2 className="text-3xl font-semibold tracking-tight text-text-primary sm:text-4xl">
                  Check your inbox.
                </h2>

                <p className="mt-4 text-sm leading-7 text-text-secondary">
                  If an account exists with{" "}
                  <span className="font-semibold text-text-primary">
                    {email}
                  </span>
                  , you'll receive a password reset link shortly.
                </p>

                <div className="mt-8 rounded-lg border border-border bg-background p-4">
                  <div className="flex items-start gap-3">
                    <FiMail className="mt-0.5 shrink-0 text-primary" size={18} />

                    <p className="text-xs leading-5 text-text-secondary">
                      Don't see the email? Check your spam or junk folder.
                      You can also try requesting another link.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setIsSubmitted(false);
                    setEmail("");
                    setError("");
                  }}
                  className="mt-6 w-full rounded-lg border border-border px-5 py-3.5 text-sm font-semibold text-text-primary transition hover:bg-background"
                >
                  Try another email
                </button>

                <Link
                  to="/login"
                  className="mt-5 flex items-center justify-center gap-2 text-sm font-semibold text-primary transition hover:text-primary-hover"
                >
                  <FiArrowLeft />
                  Back to sign in
                </Link>
              </div>
            ) : (
              /* RESET FORM */
              <div>
                <Link
                  to="/login"
                  className="mb-10 inline-flex items-center gap-2 text-sm font-medium text-text-secondary transition hover:text-primary"
                >
                  <FiArrowLeft />
                  Back to sign in
                </Link>

                <p className="mb-4 text-xs font-medium uppercase tracking-[0.2em] text-text-secondary">
                  ACCOUNT RECOVERY
                </p>

                <h2 className="text-3xl font-semibold tracking-tight text-text-primary sm:text-4xl">
                  Forgot your password?
                </h2>

                <p className="mt-4 text-sm leading-7 text-text-secondary">
                  It happens. Enter the email address linked to your NESTORA
                  account and we'll send you a link to reset your password.
                </p>

                <form onSubmit={handleSubmit} className="mt-8 space-y-5">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-text-primary">
                      Email address
                    </label>

                    <div className="relative">
                      <FiMail
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary"
                        size={17}
                      />

                      <input
                        type="email"
                        name="email"
                        value={email}
                        onChange={handleChange}
                        placeholder="Enter your registered email"
                        className={`w-full rounded-lg border bg-background py-3.5 pl-11 pr-4 text-sm text-text-primary outline-none transition placeholder:text-text-secondary/60 focus:border-primary ${
                          error ? "border-red-500" : "border-border"
                        }`}
                      />
                    </div>

                    {error && (
                      <p className="mt-2 text-xs text-red-500">{error}</p>
                    )}
                  </div>

                  <button
                    type="submit"
                    className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-primary-hover"
                  >
                    Send reset link
                    <FiArrowRight />
                  </button>
                </form>

                <p className="mt-8 text-center text-xs leading-5 text-text-secondary">
                  Remembered your password?{" "}
                  <Link
                    to="/login"
                    className="font-semibold text-primary transition hover:text-primary-hover"
                  >
                    Sign in
                  </Link>
                </p>
              </div>
            )}

            <div className="mt-12 border-t border-border pt-5 text-center">
              <p className="text-xs text-text-secondary">
                Need help accessing your account?{" "}
                <Link to="/contact" className="font-semibold text-primary">
                  Contact support
                </Link>
              </p>
            </div>

            <p className="mt-5 text-center text-xs text-text-secondary">
              © {new Date().getFullYear()} NESTORA. All rights reserved.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
};

export default ForgotPassword;
