import type { Metadata } from "next";
import PublicNavbar from "@/components/layout/PublicNavbar";
import PublicFooter from "@/components/layout/PublicFooter";

export const metadata: Metadata = { title: "About Us" };

const impactStats = [
  { value: "500+", label: "Partner Universities" },
  { value: "45k+", label: "Students Placed" },
  { value: "80+", label: "Countries Represented" },
  { value: "98%", label: "Visa Success Rate" },
];

const values = [
  {
    icon: "verified",
    title: "Integrity First",
    body: "We partner only with accredited institutions to ensure student success.",
  },
  {
    icon: "psychology",
    title: "AI-Powered Matches",
    body: "Utilizing advanced algorithms to find the perfect academic fit for every student.",
  },
];

const timeline = [
  {
    year: "2016: The Beginning",
    body: "Three international students in London realized the application process was broken and decided to fix it from a tiny dorm room.",
  },
  {
    year: "2019: Global Expansion",
    body: "Opened regional hubs in Mumbai, Lagos, and Shanghai to provide localized support to thousands of aspiring students.",
  },
  {
    year: "2023: The AI Revolution",
    body: "Launched the industry's first AI matchmaking engine, reducing application times by 60% while increasing acceptance rates.",
  },
];

const leaders = [
  {
    name: "Dr. Sarah Chen",
    role: "CEO & Co-Founder",
    body: "Former Dean of International Admissions at Oxford.",
  },
  {
    name: "James Aris",
    role: "Chief Technology Officer",
    body: "Ex-Lead Engineer at a major global EdTech unicorn.",
  },
  {
    name: "Elena Rodriguez",
    role: "Head of Global Partnerships",
    body: "Specialist in international educational policy and relations.",
  },
  {
    name: "Marcus Thorne",
    role: "Chief Operating Officer",
    body: "Focusing on operational excellence and global scale.",
  },
];

export default function AboutPage() {
  return (
    <div className="bg-background text-on-surface">
      <PublicNavbar current="About" />

      {/* Hero */}
      <header className="relative w-full min-h-[420px] md:h-[70vh] flex items-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            alt="StudyBridge campus view"
            className="w-full h-full object-cover"
            src="https://picsum.photos/seed/studybridge-about-hero/1600/900"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-primary/90 to-primary/40" />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-margin-desktop w-full py-20">
          <div className="max-w-2xl">
            <span className="inline-block px-4 py-1.5 bg-primary-fixed-dim/20 text-on-primary rounded-full font-label-md text-label-md mb-6 backdrop-blur-md">
              OUR LEGACY &amp; FUTURE
            </span>
            <h1 className="font-display-lg text-3xl md:text-display-lg text-on-primary mb-6">
              Bridging the Gap Between Ambition and Education
            </h1>
            <p className="font-body-lg text-body-lg text-on-primary/80 mb-8 leading-relaxed">
              StudyBridge is a global leader in academic mobility, dedicated
              to simplifying the international student journey through
              technology and expert mentorship.
            </p>
            <a
              className="inline-block bg-surface-container-lowest text-primary px-8 py-3 rounded-xl font-bold hover:bg-primary-fixed-dim transition-all"
              href="#mission"
            >
              Discover Our Mission
            </a>
          </div>
        </div>
      </header>

      {/* Impact stats */}
      <section className="py-12 bg-primary">
        <div className="max-w-7xl mx-auto px-4 md:px-margin-desktop">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-gutter text-center">
            {impactStats.map((s) => (
              <div key={s.label} className="p-6">
                <div className="text-on-primary font-headline-lg text-headline-lg mb-1">
                  {s.value}
                </div>
                <div className="text-on-primary/60 font-label-md text-label-md uppercase tracking-wider">
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission */}
      <section className="py-16 md:py-24 bg-surface-container-low" id="mission">
        <div className="max-w-7xl mx-auto px-4 md:px-margin-desktop">
          <div className="flex flex-col md:flex-row gap-12 md:gap-20 items-center">
            <div className="w-full md:w-1/2">
              <div className="relative">
                <div className="absolute -top-12 -left-12 w-48 h-48 bg-primary/5 rounded-full blur-3xl" />
                <h2 className="font-headline-lg text-headline-lg text-primary mb-8">
                  Empowering Global Students to Reach Higher
                </h2>
                <p className="font-body-lg text-body-lg text-on-surface-variant mb-6 leading-relaxed">
                  We believe that education is a universal right that should
                  not be limited by borders. Our mission is to democratize
                  access to elite education by providing students with the
                  tools, data, and support they need to navigate the complex
                  world of international admissions.
                </p>
                <div className="space-y-4">
                  {values.map((v) => (
                    <div
                      key={v.title}
                      className="flex items-start gap-4 p-4 rounded-xl bg-surface-container-lowest premium-shadow"
                    >
                      <span
                        className="material-symbols-outlined text-primary"
                        style={{ fontVariationSettings: "'FILL' 1" }}
                      >
                        {v.icon}
                      </span>
                      <div>
                        <h4 className="font-headline-sm text-headline-sm text-on-surface">
                          {v.title}
                        </h4>
                        <p className="font-body-md text-body-md text-on-surface-variant">
                          {v.body}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="w-full md:w-1/2">
              <div className="relative rounded-3xl overflow-hidden aspect-square premium-shadow">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  className="w-full h-full object-cover"
                  alt="Students collaborating in a university library"
                  src="https://picsum.photos/seed/studybridge-mission/900/900"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Story timeline */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 md:px-margin-desktop">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="font-headline-lg text-headline-lg text-primary mb-4">
              Our Story
            </h2>
            <p className="font-body-lg text-body-lg text-on-surface-variant">
              Founded by international alumni for future international
              students. We&apos;ve been in your shoes.
            </p>
          </div>
          <div className="relative">
            <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-outline-variant hidden md:block" />
            <div className="space-y-12">
              {timeline.map((item, i) => (
                <div
                  key={item.year}
                  className={`flex flex-col md:flex-row items-center gap-8 relative ${
                    i % 2 === 1 ? "md:flex-row-reverse" : ""
                  }`}
                >
                  <div
                    className={`md:w-1/2 ${
                      i % 2 === 1
                        ? "md:text-left pl-0 md:pl-12"
                        : "md:text-right pr-0 md:pr-12"
                    }`}
                  >
                    <h3 className="font-headline-sm text-headline-sm text-primary">
                      {item.year}
                    </h3>
                    <p className="font-body-md text-body-md text-on-surface-variant">
                      {item.body}
                    </p>
                  </div>
                  <div className="absolute left-1/2 -translate-x-1/2 w-4 h-4 bg-primary rounded-full hidden md:block border-4 border-white" />
                  <div
                    className={`md:w-1/2 ${
                      i % 2 === 1
                        ? "pr-0 md:pr-12"
                        : "pl-0 md:pl-12"
                    }`}
                  >
                    <div className="h-32 w-full bg-surface-container rounded-2xl" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Leadership */}
      <section className="py-16 md:py-24 bg-surface-container-low">
        <div className="max-w-7xl mx-auto px-4 md:px-margin-desktop">
          <div className="flex justify-between items-end mb-16">
            <div>
              <h2 className="font-headline-lg text-headline-lg text-primary mb-2">
                Our Leadership
              </h2>
              <p className="font-body-lg text-body-lg text-on-surface-variant">
                The visionaries shaping the future of global education.
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-card-gap">
            {leaders.map((leader) => (
              <div
                key={leader.name}
                className="bg-white rounded-3xl overflow-hidden premium-shadow transition-all"
              >
                <div className="aspect-[4/5] relative overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    alt={leader.name}
                    className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-500"
                    src={`https://picsum.photos/seed/studybridge-${leader.name
                      .toLowerCase()
                      .replace(/[^a-z]+/g, "-")}/400/500`}
                  />
                </div>
                <div className="p-6">
                  <h4 className="font-headline-sm text-headline-sm text-on-surface">
                    {leader.name}
                  </h4>
                  <p className="text-primary font-label-md text-label-md uppercase mb-3">
                    {leader.role}
                  </p>
                  <p className="font-body-md text-body-md text-on-surface-variant">
                    {leader.body}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}
