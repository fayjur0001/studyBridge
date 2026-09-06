import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import { AuthProvider } from "@/lib/auth-context";
import { LocaleProvider } from "@/lib/locale-context";

export const metadata: Metadata = {
  title: {
    default: "StudyBridge",
    template: "%s | StudyBridge",
  },
  description:
    "StudyBridge connects students, agencies, and universities for a smoother study-abroad journey.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased" suppressHydrationWarning>
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap"
          rel="stylesheet"
        />
        {/*
          Apply the saved theme before first paint so returning dark-mode
          visitors don't see a flash of the light theme on the public site.
          Keep the storage key in sync with lib/theme.ts. Uses next/script's
          beforeInteractive strategy (instead of a raw <script> tag) so Next
          runs it before hydration without React flagging it as a script
          tag inside the render tree.
        */}
        <Script id="theme-init" strategy="beforeInteractive">
          {`(function(){try{var m=localStorage.getItem("sb-theme");if(m==="dark")document.documentElement.classList.add("dark");}catch(e){}})();`}
        </Script>
      </head>
      <body className="min-h-full flex flex-col bg-surface text-on-surface">
        <AuthProvider><LocaleProvider>{children}</LocaleProvider></AuthProvider>
      </body>
    </html>
  );
}