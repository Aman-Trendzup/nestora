
import { useState } from "react";

const heroImage =
  "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=2000&q=85";

const faqs = [
  {
    question: "How do I book a workspace?",
    answer:
      "Explore available workspaces, choose the space that suits your needs, select your preferred date and time, and submit your booking. You can manage your reservation from your account.",
  },
  {
    question: "Do I need an account to make a booking?",
    answer:
      "You can explore workspaces without an account. However, you'll need to register or log in to confirm and manage your bookings.",
  },
  {
    question: "Can I cancel or reschedule my booking?",
    answer:
      "Cancellation and rescheduling depend on the booking terms of the workspace. You can view your reservation details and available options from your account.",
  },
  {
    question: "How can I list my workspace on NESTORA?",
    answer:
      "Select 'List your space' and create a workspace owner account. Once registered, you can submit your workspace details for review and approval.",
  },
  {
    question: "How do payments work?",
    answer:
      "NESTORA helps you discover and reserve workspaces. Payment is made directly at the workspace, according to its payment terms. Online payments are not currently supported.",
  },
];

const contactOptions = [
  {
    number: "01",
    title: "Booking support",
    description:
      "Need help with a reservation or finding the right workspace?",
    icon: "calendar",
  },
  {
    number: "02",
    title: "Workspace owners",
    description:
      "Want to list your space or need help managing your listing?",
    icon: "building",
  },
  {
    number: "03",
    title: "General enquiries",
    description:
      "Have a question, suggestion or something else to share?",
    icon: "message",
  },
];

const icons = {
  calendar: (
    <>
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M16 3v4M8 3v4M3 10h18" />
      <path d="m9 15 2 2 4-4" />
    </>
  ),
  building: (
    <>
      <rect x="4" y="3" width="16" height="18" rx="2" />
      <path d="M9 21v-4h6v4M8 7h2M14 7h2M8 11h2M14 11h2" />
    </>
  ),
  message: (
    <>
      <path d="M21 11.5a8.5 8.5 0 0 1-12.5 7.5L3 21l2-5.5A8.5 8.5 0 1 1 21 11.5Z" />
      <path d="M8 11h8M8 15h5" />
    </>
  ),
};

const Contact = () => {
  const [activeFaq, setActiveFaq] = useState(0);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Connect your contact form API here.
    console.log("Contact form data:", formData);
  };

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
                className="group mt-7 flex w-full items-center justify-center gap-3 rounded-md bg-primary px-6 py-4 text-sm font-semibold text-white transition hover:bg-primary-hover"
              >
                Send Message

                <span className="transition-transform group-hover:translate-x-1">
                  →
                </span>
              </button>

            </form>
          </div>

          {/* Contact category cards */}

          <div className="mx-auto mt-10 grid max-w-5xl items-stretch gap-4 sm:grid-cols-2 lg:grid-cols-3">

            {contactOptions.map((item) => (
              <a
                key={item.number}
                href="#contact-form"
                className="group flex h-full flex-col rounded-xl border border-border bg-white p-5 transition hover:border-primary sm:p-6"
              >

                <div className="mb-6 flex items-center justify-between">

                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/10 text-primary">

                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-5 w-5"
                    >
                      {icons[item.icon]}
                    </svg>

                  </div>

                  <span className="text-[10px] font-medium tracking-widest text-text-secondary">
                    {item.number}
                  </span>

                </div>

                <h3 className="text-sm font-semibold">
                  {item.title}
                </h3>

                <p className="mt-2 flex-1 text-xs leading-6 text-text-secondary">
                  {item.description}
                </p>

                <span className="mt-5 inline-flex items-center gap-2 text-xs font-semibold text-primary">
                  Get in touch

                  <span className="transition-transform group-hover:translate-x-1">
                    →
                  </span>
                </span>

              </a>
            ))}

          </div>

        </div>
      </section>


      {/* FAQ SECTION */}

      <section className="bg-background px-5 py-16 sm:px-8 sm:py-20 lg:px-12 lg:py-24">

        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:gap-20">

          {/* FAQ introduction */}

          <div>

            <span className="mb-4 inline-block text-[11px] font-semibold uppercase tracking-[0.2em] text-text-secondary">
              Need a little clarity?
            </span>

            <h2 className="max-w-md text-3xl font-semibold leading-tight tracking-tight sm:text-4xl lg:text-5xl">
              Frequently asked questions.
            </h2>

            <p className="mt-5 max-w-sm text-sm leading-7 text-text-secondary">
              Find answers to common questions about discovering,
              booking and listing workspaces on NESTORA.
            </p>

            <a
              href="/spaces"
              className="group mt-8 inline-flex items-center gap-4 rounded-md bg-primary px-5 py-3.5 text-xs font-semibold text-white transition hover:bg-primary-hover"
            >
              Explore Workspaces

              <span className="transition-transform group-hover:translate-x-1">
                →
              </span>
            </a>

          </div>

          {/* FAQ accordion */}

          <div className="border-t border-border">

            {faqs.map((faq, index) => {
              const isOpen = activeFaq === index;

              return (
                <div
                  key={faq.question}
                  className="border-b border-border"
                >

                  <button
                    type="button"
                    onClick={() =>
                      setActiveFaq(isOpen ? -1 : index)
                    }
                    aria-expanded={isOpen}
                    className="flex w-full items-center justify-between gap-5 py-6 text-left"
                  >

                    <span className="text-sm font-semibold leading-6 sm:text-base">
                      {faq.question}
                    </span>

                    <span
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border text-lg transition-colors ${
                        isOpen
                          ? "border-primary bg-primary text-white"
                          : "bg-white text-text-secondary"
                      }`}
                    >
                      {isOpen ? "−" : "+"}
                    </span>

                  </button>

                  {isOpen && (
                    <div className="max-w-xl pb-6 pr-10 text-sm leading-7 text-text-secondary">
                      {faq.answer}
                    </div>
                  )}

                </div>
              );
            })}

          </div>

        </div>

      </section>

    </main>
  );
};

export default Contact;
