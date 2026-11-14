import React from "react";
import LegalLayout from "../../components/legal/LegalLayout";

const privacySections = [
  {
    left: {
      code: "01 / CONSENT & APPLICATION",
      title: "Consent to Data Processing",
      paragraphs: [
        "You hereby consent to the Processing of Your Personal Data and confirm that You have been informed of the procedure, purpose, and terms of processing in accordance with applicable data protection regulations and personal jurisdiction.",
        "By browsing NESTORA, creating an account, or reserving workspaces, You agree to this Policy and permit the Company to collect, process, and safeguard information about You for the verified workspace coordination purposes outlined herein.",
      ],
    },
    right: {
      code: "02 / SCOPE & CAPACITY",
      title: "Legal Capacity & Modifications",
      paragraphs: [
        "By continuing to use our Platform, You acknowledge that You possess the legal capacity to enter into binding agreements and consent to this Policy under applicable law.",
        "We reserve the right to modify this Policy periodically to reflect technological, operational, or statutory adjustments. Any changes will be announced on this page with an updated effective date.",
      ],
    },
  },
  {
    left: {
      code: "03 / DATA COLLECTION",
      title: "Information We Collect",
      paragraphs: [
        "Account Details: Full name, verified email address, mobile number, and password credentials provided during member or partner registration.",
        "Workspace Activity: Selected desks, meeting rooms, duration of stay, booking history, venue reviews, and communication exchanges with venue managers.",
        "Device & Diagnostic Data: IP address, browser type, operating system, and anonymous interaction metrics collected through standard web session cookies.",
      ],
    },
    right: {
      code: "04 / DATA UTILIZATION",
      title: "How We Use Your Information",
      paragraphs: [
        "Reservation Management: Generating instantaneous booking confirmations, slot passes, and check-in verifications for your reserved workspaces.",
        "Operational Communication: Notifying you of schedule confirmations, venue entry directions, emergency alerts, or administrative updates.",
        "Platform Enhancement: Analyzing aggregated usage trends to optimize discovery algorithms, pricing transparency, and workspace recommendations.",
      ],
    },
  },
  {
    left: {
      code: "05 / PAYMENTS & SECURITY",
      title: "Offline Pay-at-Venue Security",
      paragraphs: [
        "NESTORA champions a transparent direct pay-at-venue convenience model. We do not store sensitive payment cards, CVVs, or financial credentials on our servers for venue settlement.",
        "All customer identification, password hashes, and profile data are protected with industry-grade TLS/HTTPS encryption, restrictive database controls, and secure tokenization.",
      ],
    },
    right: {
      code: "06 / DATA DISCLOSURE",
      title: "Sharing with Workspace Hosts",
      paragraphs: [
        "To fulfill your reservation, necessary booking data (name, contact number, reservation time, and space specifications) is shared exclusively with the designated workspace partner.",
        "Workspace hosts are legally bound to process your information solely for desk allocation and reception check-in, and are strictly prohibited from unauthorized resale or third-party marketing.",
      ],
    },
  },
  {
    left: {
      code: "07 / USER RIGHTS",
      title: "Your Rights & Data Portability",
      paragraphs: [
        "Right of Access & Correction: You may review and update your profile information, contact numbers, and preferences directly from your dashboard settings.",
        "Right of Erasure: You may request complete deletion of your account and personal identifiers by contacting our legal team, subject to mandatory legal recordkeeping obligations.",
      ],
    },
    right: {
      code: "08 / RETENTION & CONTACT",
      title: "Data Retention & Legal Contact",
      paragraphs: [
        "Personal data is retained only for the duration necessary to deliver our services, prevent platform fraud, and resolve disputes.",
        "If you have questions regarding this Privacy Policy or wish to exercise statutory data rights, please contact us at privacy@nestora.work or through our official Contact page.",
      ],
    },
  },
];

const PrivacyPolicy = () => {
  return (
    <LegalLayout
      title="Privacy Policy"
      eyebrow="WELCOME TO NESTORA"
      leadStatement="This Data Collection and Processing Policy, or Privacy Policy (hereafter referred to as the &ldquo;Policy&rdquo;) explains how the Company collects information about You, how it is used, kept, and disclosed when You visit the Website or reserve coworking spaces across our verified network."
      sections={privacySections}
      lastUpdated="November 2026"
    />
  );
};

export default PrivacyPolicy;

