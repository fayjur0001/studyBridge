import Link from "next/link";

const columns = [
  {
    title: "Platform",
    links: [
      { label: "How it Works", href: "/about" },
      { label: "MatchScore™", href: "/about" },
      { label: "Scholarships", href: "/scholarships" },
      { label: "Universities", href: "/universities" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About Us", href: "/about" },
      { label: "Contact", href: "/contact" },
    ],
  },
  {
    title: "Support",
    links: [
      { label: "Help Center", href: "/contact" },
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Terms of Service", href: "/terms" },
    ],
  },
];

export default function PublicFooter() {
  return (
    <footer className="bg-primary text-on-primary border-t border-white/10">
      <div className="max-w-7xl mx-auto px-4 md:px-margin-desktop py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-16 mb-16">
          <div className="md:col-span-1">
            <div className="font-headline-sm text-headline-sm font-extrabold mb-6 tracking-tight">
              StudyBridge
            </div>
            <p className="text-on-primary/60 text-body-md leading-relaxed">
              Elevating global academic pursuits through premium digital
              infrastructure and AI-driven matching.
            </p>
          </div>
          {columns.map((col) => (
            <div key={col.title}>
              <h4 className="font-bold mb-6 text-white uppercase text-xs tracking-widest">
                {col.title}
              </h4>
              <ul className="space-y-4 text-on-primary/60 text-body-md">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="hover:text-white transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="pt-10 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-on-primary/40 text-body-md">
            © {new Date().getFullYear()} StudyBridge Global Education. All
            rights reserved.
          </p>
          <div className="flex gap-6">
            <a
              className="h-10 w-10 rounded-full border border-white/10 flex items-center justify-center hover:bg-white/5 transition-colors"
              href="#"
            >
              <span className="material-symbols-outlined text-sm">
                public
              </span>
            </a>
            <a
              className="h-10 w-10 rounded-full border border-white/10 flex items-center justify-center hover:bg-white/5 transition-colors"
              href="#"
            >
              <span className="material-symbols-outlined text-sm">
                share
              </span>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
