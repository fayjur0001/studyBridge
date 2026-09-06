import type { Metadata } from "next";
import PublicNavbar from "@/components/layout/PublicNavbar";
import PublicFooter from "@/components/layout/PublicFooter";

export const metadata: Metadata = {
  title: "Terms of Service",
};

const sections = [
  {
    title: "1. Acceptance of Terms",
    body: "By creating an account or using StudyBridge, you agree to be bound by these Terms of Service and our Privacy Policy.",
  },
  {
    title: "2. Eligibility",
    body: "You must provide accurate and complete information when registering as a student or agency, and keep your account information up to date.",
  },
  {
    title: "3. Use of the Platform",
    body: "StudyBridge is provided to help students discover universities and scholarships, and to help agencies manage student applications. You agree not to misuse the platform, submit false information, or interfere with its normal operation.",
  },
  {
    title: "4. Applications and Third Parties",
    body: "Final admission and scholarship decisions are made by the respective universities and scholarship providers, not by StudyBridge. We facilitate the application process but do not guarantee acceptance.",
  },
  {
    title: "5. Account Termination",
    body: "We may suspend or terminate accounts that violate these terms or engage in fraudulent activity.",
  },
  {
    title: "6. Changes to These Terms",
    body: "We may update these terms from time to time. Continued use of StudyBridge after changes take effect constitutes acceptance of the revised terms.",
  },
  {
    title: "7. Contact Us",
    body: "For any questions about these terms, please reach out through our Contact page.",
  },
];

export default function TermsOfServicePage() {
  return (
    <>
      <PublicNavbar variant="glass" />
      <main className="max-w-4xl mx-auto px-margin-mobile md:px-margin-desktop py-16">
        <span className="text-primary font-bold tracking-wider font-label-md uppercase mb-4 block">
          Legal
        </span>
        <h1 className="font-display-lg text-display-lg text-on-surface mb-4">
          Terms of Service
        </h1>
        <p className="font-body-lg text-body-lg text-on-surface-variant mb-12">
          Last updated: January 2026. Please read these terms carefully
          before using StudyBridge.
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
