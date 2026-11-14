import { useState } from "react";
import { Link } from "react-router";
import { FiArrowRight, FiMinus, FiPlus } from "react-icons/fi";

const defaultFaqs = [
  {
    question: "How do I book a workspace on NESTORA?",
    answer:
      "Explore available workspaces by location, date, time, and budget. Choose the space that suits your needs, select your preferred schedule and guest count, and submit your reservation. You will immediately receive a digital booking reference code and can track your reservations anytime from your account dashboard.",
  },
  {
    question: "Do I need an account to make a booking?",
    answer:
      "You can freely explore and filter workspaces without logging in. However, you will need a verified customer account to confirm your reservation and manage your bookings.",
  },
  {
    question: "How does payment work at the workspace?",
    answer:
      "NESTORA provides transparent, locked hourly and full-day rates with zero upfront payment gateway fees. When you arrive at the venue, simply show your digital booking reference code at the front desk and settle payment directly via UPI, card, or cash.",
  },
  {
    question: "Can I cancel my workspace reservation?",
    answer:
      "Yes. You can manage and cancel any pending or confirmed booking directly from your 'My Bookings' customer portal with a single click before the scheduled check-in time.",
  },
  {
    question: "How can I list my workspace on NESTORA?",
    answer:
      "Click 'List Your Space' in the navigation header to register a Workspace Owner account. Once registered, your partner dashboard allows you to list desks, private offices, or conference rooms with your custom hourly rates, amenities, and real-time slot control.",
  },
  {
    question: "What amenities are typically included?",
    answer:
      "Verified listings typically include high-speed fiber Wi-Fi, air conditioning, power backup, ergonomic seating, and complimentary coffee/tea. Meeting suites often feature 4K display monitors, whiteboards, and video conferencing gear.",
  },
];

export default function FAQ({
  items = defaultFaqs,
  tag = "Need a little clarity?",
  heading = "Frequently asked questions.",
  description = "Find answers to common questions about discovering, reserving, and listing workspaces on NESTORA.",
  showCta = true,
  className = "",
}) {
  const [activeFaq, setActiveFaq] = useState(0);

  const toggleFaq = (index) => {
    setActiveFaq((prev) => (prev === index ? -1 : index));
  };

  return (
    <section
      id="faq-section"
      className={`bg-white px-5 py-16 sm:px-8 sm:py-20 lg:px-12 lg:py-24 ${className}`}
    >
      <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:gap-20 items-start">
        {/* Left Column: FAQ Introduction */}
        <div className=" space-y-5">
          <span className="inline-block text-[11px] font-semibold uppercase tracking-[0.2em] text-text-secondary">
            {tag}
          </span>

          <h2 className="max-w-md text-3xl font-semibold leading-tight tracking-tight text-text-primary sm:text-4xl lg:text-5xl">
            {heading}
          </h2>

          <p className="max-w-sm text-sm leading-7 text-text-secondary">
            {description}
          </p>

          {showCta && (
            <div className="pt-3">
              <Link
                to="/workspaces"
                className="group inline-flex items-center gap-3 rounded-lg bg-primary px-5 py-3.5 text-xs font-semibold text-white transition hover:bg-primary-hover shadow-xs"
              >
                <span>Explore Workspaces</span>
                <FiArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          )}
        </div>

        {/* Right Column: FAQ Accordion */}
        <div className="border-t border-border">
          {items.map((faq, index) => {
            const isOpen = activeFaq === index;

            return (
              <div key={faq.question} className="border-b border-border">
                <button
                  type="button"
                  onClick={() => toggleFaq(index)}
                  aria-expanded={isOpen}
                  className="flex w-full items-center justify-between gap-5 py-6 text-left transition-colors hover:text-primary"
                >
                  <span className="text-sm font-semibold leading-6 sm:text-base text-text-primary">
                    {faq.question}
                  </span>

                  <span
                    className={`flex size-8 shrink-0 items-center justify-center rounded-full border border-border text-sm transition-all ${isOpen
                      ? "border-primary bg-primary text-white"
                      : "bg-surface text-text-secondary group-hover:border-primary"
                      }`}
                  >
                    {isOpen ? <FiMinus className="size-3.5" /> : <FiPlus className="size-3.5" />}
                  </span>
                </button>

                {isOpen && (
                  <div className="max-w-xl pb-6 pr-6 text-sm leading-7 text-text-secondary animate-in fade-in-50 duration-200">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}