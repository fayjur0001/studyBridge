import type { Metadata } from "next";
import PublicNavbar from "@/components/layout/PublicNavbar";
import PublicFooter from "@/components/layout/PublicFooter";
import Button from "@/components/ui/Button";

export const metadata: Metadata = { title: "Contact Us" };

const offices = [
  {
    city: "London, UK",
    tag: "HQ",
    address: "Academic Square, Bloomsbury, London WC1E 7HX",
  },
  {
    city: "New York, USA",
    address: "75 Rockefeller Plaza, Manhattan, NY 10019",
  },
  {
    city: "Sydney, Australia",
    address: "200 George Street, Sydney NSW 2000",
  },
];

export default function ContactPage() {
  return (
    <div className="bg-surface font-body-md text-on-surface">
      <PublicNavbar current="Contact" />

      <main className="max-w-7xl mx-auto px-4 md:px-margin-desktop py-16 md:py-24">
        <div className="mb-16 text-center md:text-left">
          <h1 className="font-display-lg text-3xl md:text-display-lg text-primary mb-4">
            Get in Touch
          </h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl">
            Have questions about your global education journey? Our team of
            academic experts and advisors are here to bridge the gap between
            you and your future.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-card-gap">
          {/* Form */}
          <div className="md:col-span-7 bg-surface-container-lowest rounded-[24px] p-6 md:p-container-padding premium-shadow">
            <h2 className="font-headline-md text-headline-md text-primary mb-8">
              Send us a message
            </h2>
            <form className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">
                    Full Name
                  </label>
                  <input
                    className="w-full bg-surface-container-low border-none rounded-xl px-4 py-3 font-body-md text-on-surface focus:bg-white transition-all outline-none"
                    placeholder="John Doe"
                    type="text"
                  />
                </div>
                <div className="space-y-2">
                  <label className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">
                    Email Address
                  </label>
                  <input
                    className="w-full bg-surface-container-low border-none rounded-xl px-4 py-3 font-body-md text-on-surface focus:bg-white transition-all outline-none"
                    placeholder="john@example.com"
                    type="email"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">
                  Subject
                </label>
                <select className="w-full bg-surface-container-low border-none rounded-xl px-4 py-3 font-body-md text-on-surface focus:bg-white transition-all appearance-none outline-none">
                  <option>General Inquiry</option>
                  <option>Application Support</option>
                  <option>Scholarship Guidance</option>
                  <option>Partner Agency Program</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">
                  Message
                </label>
                <textarea
                  className="w-full bg-surface-container-low border-none rounded-xl px-4 py-3 font-body-md text-on-surface focus:bg-white transition-all resize-none outline-none"
                  placeholder="How can we help you achieve your study goals?"
                  rows={6}
                />
              </div>
              <Button
                type="submit"
                className="w-full sm:w-auto"
                icon="send"
              >
                Send Message
              </Button>
            </form>
          </div>

          {/* Info */}
          <div className="md:col-span-5 space-y-card-gap">
            <div className="bg-primary text-on-primary rounded-[24px] p-6 md:p-container-padding premium-shadow">
              <h3 className="font-headline-sm text-headline-sm mb-6 text-on-primary">
                Direct Support
              </h3>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="bg-on-primary/10 p-3 rounded-full">
                    <span className="material-symbols-outlined text-on-primary">
                      mail
                    </span>
                  </div>
                  <div>
                    <p className="font-label-md text-on-primary/70 uppercase">
                      Email Support
                    </p>
                    <p className="font-body-lg text-body-lg font-semibold">
                      admissions@studybridge.com
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="bg-on-primary/10 p-3 rounded-full">
                    <span className="material-symbols-outlined text-on-primary">
                      call
                    </span>
                  </div>
                  <div>
                    <p className="font-label-md text-on-primary/70 uppercase">
                      Global Hotline
                    </p>
                    <p className="font-body-lg text-body-lg font-semibold">
                      +44 (0) 20 7946 0123
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-surface-container-lowest rounded-[24px] p-6 md:p-container-padding premium-shadow">
              <h3 className="font-headline-sm text-headline-sm text-primary mb-6">
                Global Offices
              </h3>
              <div className="space-y-8">
                {offices.map((office) => (
                  <div key={office.city}>
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="font-body-lg text-body-lg font-bold text-on-surface flex items-center gap-2">
                        <span
                          className="material-symbols-outlined text-primary"
                          style={{ fontVariationSettings: "'FILL' 1" }}
                        >
                          location_on
                        </span>
                        {office.city}
                      </h4>
                      {office.tag && (
                        <span className="text-xs font-medium text-primary bg-secondary-fixed px-2 py-1 rounded-full">
                          {office.tag}
                        </span>
                      )}
                    </div>
                    <p className="text-on-surface-variant font-body-md">
                      {office.address}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
