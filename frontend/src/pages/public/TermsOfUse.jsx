import React from "react";
import LegalLayout from "../../components/legal/LegalLayout";

const termsSections = [
  {
    left: {
      code: "01 / AGREEMENT TO TERMS",
      title: "Contractual Relationship",
      paragraphs: [
        "These Terms of Use constitute a legally binding agreement between you (&ldquo;User&rdquo;, &ldquo;Member&rdquo;, or &ldquo;Partner&rdquo;) and NESTORA regarding your access to and utilization of our workspace discovery platform, booking portals, and associated web interfaces.",
        "By accessing our platform or confirming a workspace reservation, you acknowledge having read, understood, and consented to these Terms alongside our Privacy Policy and Cancellation Guidelines.",
      ],
    },
    right: {
      code: "02 / USER ELIGIBILITY",
      title: "Account Registration & Security",
      paragraphs: [
        "To reserve workspaces or list inventory as a partner, you must be of legal majority age (at least 18 years old) and competent to enter into enforceable contractual commitments.",
        "You agree to provide true, accurate, and updated credentials during onboarding. You remain exclusively accountable for maintaining password confidentiality and all activities occurring under your credentials.",
      ],
    },
  },
  {
    left: {
      code: "03 / PLATFORM SCOPE",
      title: "Marketplace & Intermediary Role",
      paragraphs: [
        "NESTORA functions as a modern technology platform connecting freelance professionals, distributed corporate teams, and creators with verified third-party coworking spaces, private cabins, and conference facilities.",
        "Unless specifically designated, NESTORA does not directly own, manage, or operate physical workspace premises. We facilitate seamless discovery, transparent schedule matching, and verified reservations.",
      ],
    },
    right: {
      code: "04 / VENUE CONDUCT",
      title: "Workspace Rules & Etiquette",
      paragraphs: [
        "Guests must respect the operational rules, quiet zone requirements, security check-in protocols, and fair-use broadband parameters established by individual workspace hosts.",
        "Any disruptive behavior, property damage, unlawful activities, or unauthorized commercial activities on partner premises will result in immediate reservation termination and account suspension.",
      ],
    },
  },
  {
    left: {
      code: "05 / PRICING & PAYMENT",
      title: "Transparent Rates & Offline Settlement",
      paragraphs: [
        "All desk and meeting room fees displayed on NESTORA are transparent, verified, and free from hidden booking convenience fees.",
        "Payments are executed directly at the venue during check-in via authorized cash, UPI, card, or venue-accepted methods. NESTORA does not charge cancellation penalties for unfulfilled offline bookings.",
      ],
    },
    right: {
      code: "06 / PARTNER COVENANTS",
      title: "Host Obligations & Listing Accuracy",
      paragraphs: [
        "Workspace operators listed on NESTORA guarantee that descriptions, photos, seating capacity, high-speed internet, power backup, and available amenities are true and fully functional.",
        "Partners agree to honor confirmed reservations initiated through NESTORA and maintain reserved seating for incoming guests without unwarranted rescheduling or rate modifications.",
      ],
    },
  },
  {
    left: {
      code: "07 / INTELLECTUAL PROPERTY",
      title: "Proprietary Rights & Platform Use",
      paragraphs: [
        "All visual branding, trademarks, software code, graphic layouts, and compiled database assets displayed across NESTORA are the exclusive property of the Company.",
        "Users are granted a limited, non-transferable license to access services for legitimate workspace booking purposes. Data extraction, automated crawling, or unauthorized mirroring is strictly barred.",
      ],
    },
    right: {
      code: "08 / INDEMNITY & JURISDICTION",
      title: "Limitation of Liability & Law",
      paragraphs: [
        "To the fullest extent permissible by applicable law, NESTORA disclaims liability for indirect, incidental, or consequential losses, including lost profits or property loss sustained at venue premises.",
        "These Terms are governed by and construed in accordance with the laws of India. Any disputes arising hereunder shall be subject to the exclusive jurisdiction of the competent courts.",
      ],
    },
  },
];

const TermsOfUse = () => {
  return (
    <LegalLayout
      title="Terms of Use"
      eyebrow="TERMS & CONDITIONS"
      leadStatement="These Terms of Use govern your access to and use of NESTORA&rsquo;s marketplace platform, workspace discovery services, and host partnership tools. Please read these terms carefully before creating an account or reserving spaces."
      sections={termsSections}
      lastUpdated="November 2026"
    />
  );
};

export default TermsOfUse;

