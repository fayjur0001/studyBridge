import Link from "next/link";
import Button from "@/components/ui/Button";
import PublicNavbar from "@/components/layout/PublicNavbar";
import PublicFooter from "@/components/layout/PublicFooter";

const audiences = [
  {
    icon: "person_search",
    title: "For Students",
    accent: "text-primary",
    iconBg: "bg-primary/5",
    body: "Discover programs that align with your background and goals using our MatchScore system.",
    points: ["Application Tracking", "Scholarship Matching"],
    cta: "Explore Features",
    theme: "light" as const,
  },
  {
    icon: "business_center",
    title: "For Agencies",
    accent: "text-secondary",
    iconBg: "bg-secondary/5",
    body: "Streamline recruitment workflows and manage student applications through a single dashboard.",
    points: ["CRM Integration", "Commission Management"],
    cta: "Partner With Us",
    theme: "light" as const,
  },
  {
    icon: "account_balance",
    title: "For Institutions",
    accent: "text-white",
    iconBg: "bg-white/10",
    body: "Access a pool of qualified, high-intent students and showcase your brand to a global audience.",
    points: ["Verified Lead Gen", "Direct Admissions"],
    cta: "List Your Institution",
    theme: "dark" as const,
  },
];

const stats = [
  { value: "94%", label: "Success Rate" },
  { value: "8k+", label: "Active Programs" },
];

const trustedNames = [
  { icon: "school", label: "OXFORD ELITE" },
  { icon: "account_balance", label: "IVY CONNECT" },
  { icon: "hub", label: "GLOBAL SCHOLAR" },
  { icon: "workspace_premium", label: "STANFORD REACH" },
];

export default function LandingPage() {
  return (
    <div className="bg-surface text-on-surface">
      <PublicNavbar variant="glass" />

      <main>
        {/* Hero */}
        <section className="relative min-h-[400px] flex items-center px-4 md:px-margin-desktop py-10 overflow-hidden bg-surface">
          <div className="container mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center relative z-10">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 px-2 py-0.5 bg-primary-container/10 text-primary rounded-full font-label-md mb-4">
                <span className="material-symbols-outlined text-xs">
                  verified
                </span>
                <span className="text-xs">
                  Trusted by 500+ Global Universities
                </span>
              </div>
              <h1 className="font-headline-lg text-headline-lg-mobile md:text-headline-lg text-primary mb-4 leading-tight">
                Maximize Your Chances of Global Academic Success.
              </h1>
              <p className="font-body-md text-body-md text-on-surface-variant mb-6 leading-relaxed">
                The all-in-one platform connecting ambitious students with
                world-class universities using our proprietary{" "}
                <b>MatchScore™</b> technology.
              </p>
              <div className="flex flex-wrap gap-3">
                <Button href="/register" size="md">
                  Find Your Match
                </Button>
                <Button href="/universities" variant="outline" size="md">
                  Explore Programs
                </Button>
              </div>
              <div className="mt-8 p-4 bg-white rounded-xl premium-shadow border border-outline-variant/30 max-w-sm">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-surface-container rounded flex items-center justify-center">
                      <span className="material-symbols-outlined text-primary text-sm">
                        school
                      </span>
                    </div>
                    <div>
                      <div className="font-bold text-on-surface text-sm">
                        University of Oxford
                      </div>
                      <div className="text-[10px] text-outline">
                        Computer Science, MSc
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-primary">98%</div>
                    <div className="text-[8px] uppercase font-bold text-outline tracking-wider">
                      MatchScore
                    </div>
                  </div>
                </div>
                <div className="h-1.5 w-full bg-surface-container-highest rounded-full overflow-hidden">
                  <div className="h-full bg-primary w-[98%] rounded-full" />
                </div>
              </div>
            </div>
            <div className="relative group">
              <div className="absolute -inset-4 bg-primary/5 rounded-[40px] blur-2xl group-hover:bg-primary/10 transition-colors" />
              <div className="relative rounded-[32px] overflow-hidden premium-shadow border border-white/50 aspect-[4/3]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  alt="Prestigious university campus"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  src="https://picsum.photos/seed/studybridge-campus/1200/900"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary/40 to-transparent" />
              </div>
              <div className="absolute -bottom-6 -left-6 bg-white p-6 rounded-2xl premium-shadow border border-outline-variant/20 flex items-center gap-4">
                <div className="h-12 w-12 bg-secondary-container/20 rounded-full flex items-center justify-center text-secondary">
                  <span className="material-symbols-outlined">
                    trending_up
                  </span>
                </div>
                <div>
                  <div className="text-2xl font-bold text-primary">
                    3x Higher
                  </div>
                  <div className="text-xs text-outline">
                    Admission Probability
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Social proof */}
        <section className="bg-white py-8 border-y border-outline-variant/30">
          <div className="px-4 md:px-margin-desktop text-center">
            <p className="font-label-md text-label-md uppercase tracking-[0.2em] text-outline mb-10">
              Trusted by Global Institutions
            </p>
            <div className="flex flex-wrap justify-center items-center gap-x-16 gap-y-10 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
              {trustedNames.map((item) => (
                <div
                  key={item.label}
                  className="flex items-center gap-2 font-bold text-headline-sm text-primary"
                >
                  <span className="material-symbols-outlined text-3xl">
                    {item.icon}
                  </span>{" "}
                  {item.label}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Audience pillars */}
        <section className="py-12 px-4 md:px-margin-desktop bg-surface-container-low">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="font-headline-lg text-headline-lg text-primary mb-4">
                Tailored Solutions for the Academic Ecosystem
              </h2>
              <p className="text-on-surface-variant max-w-2xl mx-auto">
                Modern infrastructure designed for students, recruitment
                partners, and higher-ed institutions.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {audiences.map((a) => (
                <div
                  key={a.title}
                  className={`p-6 rounded-2xl premium-shadow border card-hover transition-all flex flex-col relative overflow-hidden ${
                    a.theme === "dark"
                      ? "bg-primary text-on-primary border-transparent"
                      : "bg-white border-outline-variant/10"
                  }`}
                >
                  {a.theme === "dark" && (
                    <div className="absolute -top-6 -right-6 w-24 h-24 bg-white/10 rounded-full blur-2xl" />
                  )}
                  <div
                    className={`h-10 w-10 ${a.iconBg} ${a.accent} rounded-xl flex items-center justify-center mb-4 relative z-10`}
                  >
                    <span className="material-symbols-outlined text-2xl">
                      {a.icon}
                    </span>
                  </div>
                  <h3
                    className={`font-headline-sm text-headline-sm mb-2 relative z-10 ${
                      a.theme === "dark" ? "text-white" : "text-primary"
                    }`}
                  >
                    {a.title}
                  </h3>
                  <p
                    className={`font-body-md mb-4 flex-grow leading-relaxed relative z-10 ${
                      a.theme === "dark"
                        ? "text-primary-container"
                        : "text-on-surface-variant"
                    }`}
                  >
                    {a.body}
                  </p>
                  <ul className="space-y-2 mb-6 relative z-10">
                    {a.points.map((p) => (
                      <li
                        key={p}
                        className={`flex items-center gap-2 text-body-md ${
                          a.theme === "dark"
                            ? "text-on-primary/80"
                            : "text-on-surface-variant"
                        }`}
                      >
                        <span
                          className={`material-symbols-outlined text-xs ${
                            a.theme === "dark" ? "text-on-primary/60" : a.accent
                          }`}
                        >
                          check_circle
                        </span>{" "}
                        {p}
                      </li>
                    ))}
                  </ul>
                  <Link
                    href="/register"
                    className={`font-bold flex items-center gap-2 group text-body-md relative z-10 ${
                      a.theme === "dark" ? "text-white" : "text-primary"
                    }`}
                  >
                    {a.cta}{" "}
                    <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform text-sm">
                      arrow_forward
                    </span>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="py-12 bg-surface">
          <div className="px-4 md:px-margin-desktop max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
            <div>
              <h2 className="font-display-lg text-4xl md:text-display-lg text-primary mb-8">
                Empowering Excellence Through Data.
              </h2>
              <p className="font-body-lg text-body-lg text-on-surface-variant mb-12 leading-relaxed">
                Our platform is engineered to remove friction from global
                education. We provide the structural beauty and modern tools
                required for elite academic success.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {stats.map((s) => (
                  <div
                    key={s.label}
                    className="p-8 bg-white rounded-3xl border border-outline-variant/30 premium-shadow"
                  >
                    <div className="text-4xl font-bold text-primary mb-2">
                      {s.value}
                    </div>
                    <div className="text-sm font-semibold text-outline uppercase tracking-wider">
                      {s.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <div className="bg-white rounded-[32px] p-8 premium-shadow border border-outline-variant/20 overflow-hidden relative">
                <div className="flex items-center justify-between mb-8 pb-4 border-b border-outline-variant/20">
                  <div className="font-bold text-primary">
                    Performance Insights
                  </div>
                  <span className="material-symbols-outlined text-outline">
                    insights
                  </span>
                </div>
                <div className="space-y-8">
                  <div className="flex justify-between items-end">
                    <div>
                      <div className="text-3xl font-bold text-primary">
                        45k
                      </div>
                      <div className="text-xs text-outline font-bold">
                        Successful Placements
                      </div>
                    </div>
                    <div className="w-32 h-16 bg-surface-container-low rounded-lg overflow-hidden relative">
                      <svg
                        className="absolute inset-0 w-full h-full text-secondary opacity-20"
                        viewBox="0 0 100 40"
                      >
                        <path
                          d="M0,40 L10,35 L20,38 L30,25 L40,30 L50,15 L60,20 L70,5 L80,10 L90,2 L100,8 L100,40 Z"
                          fill="currentColor"
                        />
                      </svg>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-bold text-on-surface-variant">
                      <span>Global Admissions Target</span>
                      <span>85% achieved</span>
                    </div>
                    <div className="h-3 w-full bg-surface-container rounded-full overflow-hidden">
                      <div className="h-full bg-secondary w-[85%] rounded-full shadow-[0_0_12px_rgba(49,86,196,0.4)]" />
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="h-24 bg-surface-container-low rounded-xl" />
                    <div className="h-24 bg-primary/5 rounded-xl" />
                    <div className="h-24 bg-secondary/5 rounded-xl" />
                  </div>
                </div>
              </div>
              <div className="absolute -top-10 -right-10 w-40 h-40 border-[20px] border-secondary/5 rounded-full -z-10" />
            </div>
          </div>
        </section>

        {/* Testimonial */}
        <section className="py-12 px-4 md:px-margin-desktop">
          <div className="max-w-4xl mx-auto bg-primary text-on-primary rounded-3xl p-8 md:p-10 relative overflow-hidden flex flex-col md:flex-row items-center gap-8">
            <div className="absolute top-0 right-0 p-6 opacity-5">
              <span className="material-symbols-outlined text-[100px]">
                format_quote
              </span>
            </div>
            <div className="w-40 h-40 rounded-2xl overflow-hidden border-4 border-white/20 shrink-0 shadow-2xl rotate-3 transition-transform hover:rotate-0 duration-500">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                alt="Student portrait"
                className="w-full h-full object-cover"
                src="https://picsum.photos/seed/studybridge-student/400/400"
              />
            </div>
            <div className="relative z-10">
              <div className="flex gap-1 text-secondary-container mb-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <span
                    key={i}
                    className="material-symbols-outlined text-xs"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    star
                  </span>
                ))}
              </div>
              <p className="font-headline-sm text-headline-sm mb-6 leading-relaxed font-medium italic">
                &ldquo;StudyBridge didn&apos;t just help me find a university;
                they helped me architect my entire professional future. The
                clarity of the platform and the MatchScore precision are
                truly world-class.&rdquo;
              </p>
              <div>
                <div className="font-bold text-body-lg">
                  Alexander Sterling
                </div>
                <div className="text-on-primary/60 font-body-md">
                  MBA Candidate, INSEAD
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 text-center px-4 md:px-margin-desktop bg-surface-container-lowest">
          <div className="max-w-4xl mx-auto">
            <h2 className="font-display-lg text-4xl md:text-display-lg text-primary mb-8">
              Ready to Start Your Academic Journey?
            </h2>
            <p className="font-body-lg text-body-lg text-on-surface-variant mb-12 max-w-2xl mx-auto">
              Join the global network of excellence and let data-driven
              matching guide your future.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-6">
              <Button href="/register" size="lg">
                Create Your Free Profile
              </Button>
              <Button href="/universities" variant="outline" size="lg">
                View Universities
              </Button>
            </div>
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}
