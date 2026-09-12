import type { Metadata } from "next";
import { Suspense } from "react";
import LoginForm from "./LoginForm";

export const metadata: Metadata = { title: "Login" };

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 md:p-0 bg-surface">
      <main className="w-full max-w-[1000px] bg-surface-container-lowest rounded-[24px] overflow-hidden flex flex-col md:flex-row premium-shadow">
        {/* Visual side */}
        <div className="hidden md:block w-1/2 relative min-h-[600px]">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage:
                "url('https://picsum.photos/seed/studybridge-login/900/1200')",
            }}
          />
          <div className="absolute inset-0 bg-primary/10 mix-blend-multiply" />
          <div className="absolute bottom-12 left-12 right-12 text-white z-10">
            <h2 className="font-headline-lg text-headline-lg mb-2">
              Build Your Academic Future
            </h2>
            <p className="font-body-lg text-body-lg opacity-90 leading-relaxed">
              Access the world&apos;s leading universities through
              StudyBridge&apos;s intelligent application portal.
            </p>
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-primary/60 via-transparent to-transparent" />
        </div>

        {/* Form side */}
        <div className="w-full md:w-1/2 p-8 md:p-margin-desktop flex flex-col justify-center">
          <div className="mb-10 flex items-center gap-2">
            <span
              className="material-symbols-outlined text-primary text-3xl"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              school
            </span>
            <span className="font-headline-md text-headline-md font-bold text-primary tracking-tight">
              StudyBridge
            </span>
          </div>
          <div className="mb-8">
            <h1 className="font-headline-lg text-headline-lg text-on-surface mb-2">
              Welcome back
            </h1>
            <p className="font-body-md text-body-md text-on-surface-variant">
              Please enter your details to sign in to your account.
            </p>
          </div>

          <Suspense fallback={null}>
            <LoginForm />
          </Suspense>
        </div>
      </main>

      <div className="fixed top-0 left-0 w-full h-full -z-10 overflow-hidden pointer-events-none opacity-40">
        <div className="absolute top-[-10%] right-[-5%] w-[400px] h-[400px] bg-primary/5 rounded-full blur-[100px]" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] bg-secondary/5 rounded-full blur-[120px]" />
      </div>
    </div>
  );
}
