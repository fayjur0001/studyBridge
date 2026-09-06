import type { Metadata } from "next";
import RegisterForm from "./RegisterForm";

export const metadata: Metadata = { title: "Register" };

export default function RegisterPage() {
  return (
    <div className="flex items-center justify-center min-h-screen p-4 md:p-margin-desktop bg-surface">
      <main className="w-full max-w-6xl bg-surface-container-lowest rounded-[32px] overflow-hidden premium-shadow flex flex-col md:flex-row min-h-[700px]">
        {/* Visual side */}
        <section className="relative w-full md:w-1/2 min-h-[280px] md:min-h-full">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage:
                "url('https://picsum.photos/seed/studybridge-register/900/1200')",
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-primary/60 to-transparent" />
          <div className="absolute bottom-8 md:bottom-12 left-8 md:left-12 right-8 md:right-12 text-on-primary">
            <p className="font-headline-md text-headline-md mb-2">
              Empowering Global Scholars
            </p>
            <p className="font-body-md text-body-md opacity-90 max-w-sm">
              Join over 50,000 students finding their perfect academic match
              through our AI-driven network.
            </p>
            <div className="mt-8 flex items-center gap-4">
              <div className="flex -space-x-2">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="w-10 h-10 rounded-full border-2 border-white bg-primary-container"
                  />
                ))}
              </div>
              <span className="text-label-md font-label-md">
                Trusted by top universities worldwide
              </span>
            </div>
          </div>
        </section>

        {/* Form side */}
        <section className="w-full md:w-1/2 p-8 md:p-16 flex flex-col justify-center bg-surface-container-lowest">
          <div className="mb-10 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2 mb-6">
              <span
                className="material-symbols-outlined text-primary text-4xl"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                school
              </span>
              <h1 className="font-headline-md text-headline-md text-primary font-bold tracking-tight">
                StudyBridge
              </h1>
            </div>
            <h2 className="font-headline-lg text-headline-lg text-on-surface mb-2">
              Join the Elite Network
            </h2>
            <p className="font-body-md text-body-md text-on-surface-variant">
              Your journey to global education starts here.
            </p>
          </div>

          <RegisterForm />

          <div className="mt-12 flex items-center justify-center gap-8 opacity-40 grayscale hover:grayscale-0 transition-all duration-500">
            <span
              className="material-symbols-outlined text-4xl"
              title="ISO Certified"
            >
              verified_user
            </span>
            <span
              className="material-symbols-outlined text-4xl"
              title="Secure Payment"
            >
              shield
            </span>
            <span className="material-symbols-outlined text-4xl" title="Global Partner">
              public
            </span>
          </div>
        </section>
      </main>
    </div>
  );
}
