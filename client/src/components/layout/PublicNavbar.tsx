import Link from "next/link";
import Button from "@/components/ui/Button";

const links = [
  { label: "Universities", href: "/universities" },
  { label: "Scholarships", href: "/scholarships" },
  { label: "Countries", href: "/destinations" },
  { label: "Contact", href: "/contact" },
];

interface PublicNavbarProps {
  variant?: "glass" | "solid";
  current?: string;
}

export default function PublicNavbar({
  variant = "solid",
  current,
}: PublicNavbarProps) {
  const wrapperClass =
    variant === "glass"
      ? "sticky top-0 w-full z-50 glass-header border-b border-outline-variant/30"
      : "sticky top-0 w-full z-50 bg-surface shadow-sm";

  return (
    <header className={wrapperClass}>
      <nav className="flex justify-between items-center w-full px-4 md:px-margin-desktop py-4 max-w-7xl mx-auto">
        <Link
          href="/"
          className="font-headline-md text-headline-md font-bold text-primary tracking-tight"
        >
          StudyBridge
        </Link>
        <div className="hidden md:flex items-center gap-8">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={
                current === link.label
                  ? "font-body-md text-body-md text-primary border-b-2 border-primary pb-0.5 font-bold transition-colors"
                  : "font-body-md text-body-md text-on-surface-variant hover:text-primary transition-colors"
              }
            >
              {link.label}
            </Link>
          ))}
        </div>
        <div className="flex items-center gap-4">
          <Link
            href="/login"
            className="hidden sm:block font-body-md font-bold text-primary hover:opacity-80 transition-all"
          >
            Log In
          </Link>
          <Button href="/register" size="sm">
            Get Started
          </Button>
        </div>
      </nav>
    </header>
  );
}
