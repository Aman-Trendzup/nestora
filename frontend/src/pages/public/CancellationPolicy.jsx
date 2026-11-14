import React from "react";
import LegalLayout from "../../components/legal/LegalLayout";

const cancellationSections = [
  {
    left: {
      code: "01 / FLEXIBILITY FIRST",
      title: "Free Cancellations Anytime",
      paragraphs: [
        "We understand that meetings shift and work priorities evolve rapidly. NESTORA allows members to cancel workspace bookings directly through their customer dashboard prior to check-in with zero cancellation penalties.",
        "There are no hidden administrative fees or penalty deductions for adjusting your daily workspace schedule.",
      ],
    },
    right: {
      code: "02 / DIRECT SETTLEMENT",
      title: "No Refund Waiting Cycles",
      paragraphs: [
        "Because NESTORA operates on a transparent offline pay-at-venue framework, you only settle charges upon physical check-in at the workspace counter.",
        "Since payments are not charged upfront online, you never have to wait 5-7 business days for gateway reversals or store credit refunds when your plans change.",
      ],
    },
  },
  {
    left: {
      code: "03 / ARRIVAL WINDOWS",
      title: "Grace Periods & Slot Retention",
      paragraphs: [
        "To ensure fair access for all coworkers, venues hold your reserved hot desk, private booth, or cabin for up to 30 minutes past your scheduled reservation start time.",
        "If you anticipate arriving later than planned, we encourage contacting the venue host directly or updating your booking note to maintain your reserved desk.",
      ],
    },
    right: {
      code: "04 / SLOT MODIFICATIONS",
      title: "Rescheduling & Space Changes",
      paragraphs: [
        "Need to switch from an open flex desk to a quiet soundproof meeting room? You can modify booking details or rebook an alternative space with a single tap from your My Bookings portal.",
        "Modifications are instantly updated in the venue operator's dashboard, ensuring seamless host reception upon your arrival.",
      ],
    },
  },
  {
    left: {
      code: "05 / HOST CONTINGENCIES",
      title: "Host-Initiated Cancellations",
      paragraphs: [
        "In the rare circumstance that a host venue faces an emergency closure, technical disruption, or private event buyout, the host will promptly notify NESTORA.",
        "Our support team will immediately alert you and provide recommended verified partner locations nearby with priority check-in.",
      ],
    },
    right: {
      code: "06 / TEAM & ENTERPRISE PASSES",
      title: "Private Cabins & Bulk Passes",
      paragraphs: [
        "Special terms apply for extended multi-month team cabin leases or large corporate conference buyouts negotiated directly with workspace operators.",
        "Any customized cancellation timelines or security deposits agreed with the venue operator in writing shall supersede standard single-day hot desk rules.",
      ],
    },
  },
  {
    left: {
      code: "07 / RESPONSIBLE USAGE",
      title: "Fair Use & Member Etiquette",
      paragraphs: [
        "To preserve real-time desk availability for the wider creative and startup community, we request members promptly cancel unneeded slots rather than letting them lapse as no-shows.",
        "Repeated non-cancelled reservations may result in temporary booking rate throttling to protect host slot management.",
      ],
    },
    right: {
      code: "08 / RESOLUTION & SUPPORT",
      title: "Dispute Assistance & Inquiries",
      paragraphs: [
        "If you ever encounter an issue at check-in, such as unexpected pricing differences or room unavailability, our support desk is ready to resolve the matter with the venue.",
        "Reach out to our support specialists directly at support@nestora.work or submit an inquiry through our Contact page.",
      ],
    },
  },
];

const CancellationPolicy = () => {
  return (
    <LegalLayout
      title="Cancellation Policy"
      eyebrow="BOOKINGS & REFUNDS"
      leadStatement="At NESTORA, we believe work should be flexible, transparent, and completely free from rigid commitments. Here is everything you need to know about our straightforward reservation modifications and zero-penalty cancellation policies."
      sections={cancellationSections}
      lastUpdated="November 2026"
    />
  );
};

export default CancellationPolicy;

