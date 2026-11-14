
import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router";
import { useAuth } from "../../context/AuthContext";
import FAQ from "../../components/common/FAQ";
import {
  FiCheckCircle,
  FiAlertCircle,
  FiX,
  FiCheck,
  FiMail,
  FiPhone,
  FiClock,
} from "react-icons/fi";
import heroImage from "../../assets/images/contact/contact.webp"

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const Contact = ({ isOwnerSupport = false }) => {
  const { user } = useAuth();
  const location = useLocation();
  const isOwnerView = isOwnerSupport || location.pathname.startsWith("/owner/support");

  const [formData, setFormData] = useState({
    name: user?.fullName || "",
    email: user?.email || "",
    subject: isOwnerView ? "Host / Workspace Support Enquiry" : "",
    message: "",
  });

  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        name: prev.name || user.fullName || "",
        email: prev.email || user.email || "",
        subject: isOwnerView && !prev.subject ? "Host / Workspace Support Enquiry" : prev.subject,
      }));
    }
  }, [user, isOwnerView]);

  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState({ type: "", text: "" });
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const handleCloseModal = () => {
    setShowSuccessModal(false);
    setFormData({
      name: "",
      email: "",
      subject: "",
      message: "",
    });
    setStatusMessage({ type: "", text: "" });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (statusMessage.text) {
      setStatusMessage({ type: "", text: "" });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.email.trim() || !formData.subject.trim() || !formData.message.trim()) {
      setStatusMessage({
        type: "error",
        text: "Please fill out all required fields.",
      });
      return;
    }

    try {
      setLoading(true);
      setStatusMessage({ type: "", text: "" });

      const response = await fetch(`${API_BASE_URL}/api/contact`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          email: formData.email.trim(),
          subject: formData.subject.trim(),
          message: formData.message.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to send your message. Please try again.");
      }

      setStatusMessage({
        type: "success",
        text: data.message || "Thank you! Your message has been sent successfully.",
      });

      // Show the success modal with home hyperlink
      setShowSuccessModal(true);

      // Clear the form on success
      setFormData({
        name: "",
        email: "",
        subject: "",
        message: "",
      });
    } catch (error) {
      console.error("Contact Form Submission Error:", error);
      setStatusMessage({
        type: "error",
        text: error.message || "Unable to reach the server. Please check your connection and try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  if (isOwnerView) {
    return (
      <div className="space-y-6 max-w-5xl">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-text-primary">
                Host & Partner Support
              </h1>
              <span className="text-xs bg-primary/10 text-primary font-semibold px-2.5 py-0.5 rounded-full">
                Host Helpdesk
              </span>
            </div>
            <p className="mt-1 text-sm text-text-secondary">
              Need assistance managing your spaces, blocked dates, or reservations? Send our team a message.
            </p>
          </div>
        </div>

        {/* Quick Contact Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl border border-border bg-surface flex items-center gap-3">
            <div className="size-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <FiMail className="size-5" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-text-secondary">Host Support Email</p>
              <p className="text-xs sm:text-sm font-semibold text-text-primary truncate">
                partners@nestora.com
              </p>
            </div>
          </div>

          <div className="p-4 rounded-xl border border-border bg-surface flex items-center gap-3">
            <div className="size-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <FiPhone className="size-5" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-text-secondary">Direct Host Helpline</p>
              <p className="text-xs sm:text-sm font-semibold text-text-primary truncate">
                +91 98765 43210
              </p>
            </div>
          </div>

          <div className="p-4 rounded-xl border border-border bg-surface flex items-center gap-3">
            <div className="size-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <FiClock className="size-5" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-text-secondary">Operating Hours</p>
              <p className="text-xs sm:text-sm font-semibold text-text-primary truncate">
                Mon - Sat, 9 AM - 8 PM
              </p>
            </div>
          </div>
        </div>

        {/* Contact Form Card */}
        <div className="rounded-2xl border border-border bg-surface p-5 sm:p-8 shadow-xs">
          <h2 className="text-lg font-bold text-text-primary mb-1">
            Send a Support Message
          </h2>
          <p className="text-xs text-text-secondary mb-6">
            Our host success managers respond to queries within 2 hours during business hours.
          </p>

          {statusMessage.text && (
            <div
              className={`mb-6 p-4 rounded-xl text-sm flex items-center gap-3 border ${
                statusMessage.type === "success"
                  ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                  : "bg-rose-50 text-rose-800 border-rose-200"
              }`}
            >
              {statusMessage.type === "success" ? (
                <FiCheckCircle className="size-5 shrink-0 text-emerald-600" />
              ) : (
                <FiAlertCircle className="size-5 shrink-0 text-rose-600" />
              )}
              <span>{statusMessage.text}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-text-primary mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full text-xs sm:text-sm rounded-lg border border-border px-3.5 py-2.5 focus:outline-hidden focus:ring-1 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-text-primary mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full text-xs sm:text-sm rounded-lg border border-border px-3.5 py-2.5 focus:outline-hidden focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-text-primary mb-1">
                Subject
              </label>
              <input
                type="text"
                required
                name="subject"
                placeholder="e.g. Issue updating workspace pricing, booking inquiry"
                value={formData.subject}
                onChange={handleChange}
                className="w-full text-xs sm:text-sm rounded-lg border border-border px-3.5 py-2.5 focus:outline-hidden focus:ring-1 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-text-primary mb-1">
                Message / Description
              </label>
              <textarea
                required
                rows={5}
                name="message"
                placeholder="Please describe your issue or query in detail..."
                value={formData.message}
                onChange={handleChange}
                className="w-full text-xs sm:text-sm rounded-lg border border-border px-3.5 py-2.5 focus:outline-hidden focus:ring-1 focus:ring-primary"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center justify-center rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-white hover:bg-primary-hover transition shadow-xs disabled:opacity-50"
              >
                {loading ? "Sending..." : "Submit Support Request"}
              </button>
            </div>
          </form>
        </div>

        {/* SUCCESS MODAL */}
        {showSuccessModal && (
          <div
            role="dialog"
            aria-modal="true"
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs"
            onClick={handleCloseModal}
          >
            <div
              className="relative w-full max-w-md rounded-2xl bg-white p-6 sm:p-8 text-center shadow-2xl border border-border"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={handleCloseModal}
                aria-label="Close modal"
                className="absolute top-4 right-4 rounded-lg p-1.5 text-text-secondary hover:bg-slate-100 hover:text-text-primary transition"
              >
                <FiX className="size-5" />
              </button>
              <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 mb-4">
                <FiCheck className="size-7 stroke-[2.5]" />
              </div>
              <h3 className="text-xl font-bold text-text-primary">
                Support Request Received!
              </h3>
              <p className="mt-2 text-sm text-text-secondary leading-relaxed">
                Thank you! Our partner relations team has received your inquiry and will follow up with you at {formData.email}.
              </p>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <main className="bg-background text-text-primary">

      {/* HERO + CONTACT FORM */}

      <section className="relative isolate">

        {/* Background image: extends behind the top 40% of the form */}
        <div className="absolute inset-x-0 top-0 -z-10 h-[580px] overflow-hidden sm:h-[600px] lg:h-[620px]">
          <img
            src={heroImage}
            alt="Modern coworking workspace"
            className="h-full w-full object-cover"
          />

          <div className="absolute inset-0 bg-slate-950/65" />
        </div>

        <div className="mx-auto max-w-7xl px-5 pb-16 sm:px-8 lg:px-12">

          {/* Hero content */}

          <div className="mx-auto max-w-3xl pb-12 pt-20 text-center sm:pb-14 sm:pt-24 lg:pb-16 lg:pt-28">

            <span className="mb-5 inline-block text-[11px] font-semibold uppercase tracking-[0.2em] text-white/75">
              We're listening
            </span>

            <h1 className="text-4xl font-semibold leading-[1.12] tracking-tight text-white sm:text-5xl lg:text-6xl">
              Let's make finding your
              <br className="hidden sm:block" />
              <span className="text-white/75">
                workspace easier.
              </span>
            </h1>

            <p className="mx-auto mt-5 max-w-lg text-sm leading-7 text-white/80 sm:text-base">
              Whether you're booking a space or listing one of your
              own, we're here to help make things simple.
            </p>

          </div>

          {/* Contact form */}

          <div
            id="contact-form"
            className="relative mx-auto max-w-5xl rounded-2xl border border-border bg-white p-5 shadow-md sm:p-8 lg:p-10"
          >

            <div className="mb-7 flex items-center justify-between gap-4">

              <div>
                <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">
                  Send us a message
                </h2>

                <p className="mt-2 text-xs text-text-secondary sm:text-sm">
                  Tell us how we can help.
                </p>
              </div>

              <span className="hidden text-[10px] font-semibold tracking-[0.2em] text-text-secondary sm:block">
                CONTACT
              </span>

            </div>

            {/* Status Alert Notification */}
            {statusMessage.text && (
              <div
                className={`mb-6 p-4 rounded-xl text-sm flex items-center gap-3 border ${statusMessage.type === "success"
                  ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                  : "bg-rose-50 text-rose-800 border-rose-200"
                  }`}
              >
                {statusMessage.type === "success" ? (
                  <FiCheckCircle className="size-5 shrink-0 text-emerald-600" />
                ) : (
                  <FiAlertCircle className="size-5 shrink-0 text-rose-600" />
                )}
                <span>{statusMessage.text}</span>
              </div>
            )}

            <form onSubmit={handleSubmit}>

              <div className="grid gap-6 md:grid-cols-2 md:gap-8">

                {/* Left fields */}

                <div className="space-y-5">

                  <div>
                    <label
                      htmlFor="name"
                      className="mb-2 block text-xs font-semibold"
                    >
                      YOUR NAME
                    </label>

                    <input
                      id="name"
                      name="name"
                      type="text"
                      required
                      minLength={2}
                      placeholder="Enter your name"
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full rounded-md border border-border bg-white px-4 py-3 text-sm outline-none transition placeholder:text-text-secondary/60 focus:border-primary"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="email"
                      className="mb-2 block text-xs font-semibold"
                    >
                      YOUR EMAIL
                    </label>

                    <input
                      id="email"
                      name="email"
                      type="email"
                      required
                      placeholder="Enter your email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full rounded-md border border-border bg-white px-4 py-3 text-sm outline-none transition placeholder:text-text-secondary/60 focus:border-primary"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="subject"
                      className="mb-2 block text-xs font-semibold"
                    >
                      SUBJECT
                    </label>

                    <input
                      id="subject"
                      name="subject"
                      type="text"
                      required
                      placeholder="What is this regarding?"
                      value={formData.subject}
                      onChange={handleChange}
                      className="w-full rounded-md border border-border bg-white px-4 py-3 text-sm outline-none transition placeholder:text-text-secondary/60 focus:border-primary"
                    />
                  </div>

                </div>

                {/* Message */}

                <div className="flex flex-col">

                  <label
                    htmlFor="message"
                    className="mb-2 block text-xs font-semibold"
                  >
                    MESSAGE
                  </label>

                  <textarea
                    id="message"
                    name="message"
                    required
                    minLength={10}
                    placeholder="Tell us a little more about your enquiry..."
                    value={formData.message}
                    onChange={handleChange}
                    className="min-h-[190px] flex-1 resize-none rounded-md border border-border bg-white px-4 py-3 text-sm leading-6 outline-none transition placeholder:text-text-secondary/60 focus:border-primary md:min-h-0"
                  />

                </div>

              </div>

              {/* Submit button */}

              <button
                type="submit"
                disabled={loading}
                className="group mt-7 flex w-full items-center justify-center gap-3 rounded-md bg-primary px-6 py-4 text-sm font-semibold text-white transition hover:bg-primary-hover disabled:opacity-60 disabled:cursor-not-allowed shadow-xs"
              >
                {loading ? "Sending Message..." : "Send Message"}

                {!loading && (
                  <span className="transition-transform group-hover:translate-x-1">
                    →
                  </span>
                )}
              </button>

            </form>
          </div>


        </div>
      </section>


      {/* REUSABLE FAQ SECTION */}
      <FAQ />

      {/* SUCCESS MODAL */}
      {showSuccessModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs"
          onClick={handleCloseModal}
        >
          <div
            className="relative w-full max-w-md rounded-2xl bg-white p-6 sm:p-8 text-center shadow-2xl border border-border"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Only cross button */}
            <button
              type="button"
              onClick={handleCloseModal}
              aria-label="Close modal"
              className="absolute top-4 right-4 rounded-lg p-1.5 text-text-secondary hover:bg-slate-100 hover:text-text-primary transition"
            >
              <FiX className="size-5" />
            </button>

            {/* Success icon */}
            <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 mb-4">
              <FiCheck className="size-7 stroke-[2.5]" />
            </div>

            <h3 className="text-xl font-bold text-text-primary">
              Message Sent Successfully!
            </h3>

            <p className="mt-2 text-sm text-text-secondary leading-relaxed">
              Thank you for contacting NESTORA. Your message has been safely received, and our team will get back to you shortly.
            </p>

          </div>
        </div>
      )}

    </main>
  );
};

export default Contact;
