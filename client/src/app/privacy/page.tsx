import type { Metadata } from "next";
import PublicNavbar from "@/components/layout/PublicNavbar";
import PublicFooter from "@/components/layout/PublicFooter";

export const metadata: Metadata = {
  title: "Privacy Policy",
};

const sections = [
  {
    title: "1. Information We Collect",
    body: "We collect the information you provide directly to us when you create an account, complete your profile, or submit an application — including your name, email address, academic history, and documents you upload to your Document Vault.",
  },
  {
    title: "2. How We Use Your Information",
    body: "Your information is used to operate and improve StudyBridge, match you with relevant universities, scholarships, and partner agencies, communicate with you about your applications, and keep your account secure.",
  },
  {
    title: "3. Sharing Your Information",
    body: "We share your application materials only with the universities, scholarship providers, or agencies you choose to apply through. We do not sell your personal information to third parties.",
  },
  {
    title: "4. Data Security",
    body: "We use industry-standard safeguards to protect your data, including encryption in transit and restricted access to your documents and personal records.",
  },
  {
    title: "5. Your Choices",
    body: "You can review, update, or delete your personal information at any time from your account settings, or by contacting our support team.",
  },
  {
    title: "6. Contact Us",
    body: "If you have questions about this policy or how your data is handled, reach out through our Contact page and our team will respond promptly.",
  },
];

export default function PrivacyPolicyPage() {
  return (
    <>
      <PublicNavbar variant="glass" />
      <main className="max-w-4xl mx-auto px-margin-mobile md:px-margin-desktop py-16">
        <span className="text-primary font-bold tracking-wider font-label-md uppercase mb-4 block">
          Legal
        </span>
        <h1 className="font-display-lg text-display-lg text-on-surface mb-4">
          Privacy Policy
        </h1>
        <p className="font-body-lg text-body-lg text-on-surface-variant mb-12">
          Last updated: January 2026. This policy explains how StudyBridge
          collects, uses, and protects your personal information.
        </p>

        <div className="space-y-10">
          {sections.map((s) => (
            <section key={s.title}>
              <h2 className="font-headline-sm text-headline-sm text-on-surface mb-3">
                {s.title}
              </h2>
              <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
                {s.body}
              </p>
            </section>
          ))}
        </div>
      </main>
      <PublicFooter />
    </>
  );
}
