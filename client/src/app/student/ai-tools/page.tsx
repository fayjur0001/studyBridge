"use client";

import Link from "next/link";
import StudentSidebar from "@/components/dashboard/StudentSidebar";

export default function AIToolsHubPage() {
  return (
    <>
<StudentSidebar />

<main className="flex-1 ml-[260px] h-screen overflow-y-auto relative">

<header className="flex justify-between items-center w-full px-margin-desktop h-16 sticky top-0 z-40 bg-surface-container-lowest shadow-[0px_2px_4px_rgba(0,0,0,0.02)]">
<div className="flex items-center gap-6">
<div className="relative w-64">
<span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline">search</span>
<input className="w-full bg-surface-container-low border-none rounded-full py-2 pl-10 pr-4 text-body-md focus:ring-2 focus:ring-primary/20" placeholder="Search AI tools..." type="text" />
</div>
</div>
<div className="flex items-center gap-6">
<div className="flex items-center gap-4 border-r border-outline-variant pr-6">
<button className="text-on-surface-variant hover:text-primary transition-colors cursor-pointer active:scale-95">
<span className="material-symbols-outlined">notifications</span>
</button>
<button className="text-on-surface-variant hover:text-primary transition-colors cursor-pointer active:scale-95">
<span className="material-symbols-outlined">help</span>
</button>
</div>
<div className="flex items-center gap-3 cursor-pointer group">
<div className="text-right">
<p className="font-body-md text-on-surface font-bold">Alex Sterling</p>
<p className="text-label-md text-on-surface-variant">Global Merit Scholar</p>
</div>
<img className="w-10 h-10 rounded-full object-cover ring-2 ring-primary/10 group-hover:ring-primary/30 transition-all" alt="A professional high-resolution headshot of a diverse male university student with a warm smile, wearing a navy blue blazer over a crisp white shirt. The background is a soft-focus academic hallway with rich wooden textures and warm light-mode ambient lighting. The visual style is premium, sharp, and corporate modern, reflecting an elite educational atmosphere." src="https://lh3.googleusercontent.com/aida-public/AB6AXuDSICN8_CGmCUykCUjUMv556WvGPs_oTI-gvgQKPZ-YsGIduT21ZC2cl25GNkPUj3IAPQMUlzTRyMekSkyQVAznuaeC8qNmJRw5NcLWWdxnMA2Lr3DyuQWxVZeQXHzHE00MQIZTl6iLN8cyvNU6b6DA7k87q81WyI_ytxAUQ7BYQP_gPIGFx9Usr198196QN5trLCOZw4mm0mbtC44AkypcteIKkO_YE0JChDHAhI3EJfq2g2v-Jtrr" />
</div>
</div>
</header>

<div className="p-margin-desktop max-w-[1400px] mx-auto">

<section className="relative rounded-[32px] overflow-hidden mb-gutter p-12 bg-primary">

<div className="relative z-10 max-w-2xl">
<span className="inline-block px-4 py-1.5 bg-on-primary/10 text-on-primary rounded-full font-label-md text-label-md mb-6 border border-on-primary/20">
                        AI-Powered Intelligence Hub
                    </span>
<h2 className="font-display-lg text-display-lg text-on-primary mb-4">Elevate Your Academic Journey.</h2>
<p className="font-body-lg text-body-lg text-primary-fixed-dim mb-8">Leverage cutting-edge neural models specifically trained for international education standards, admissions, and global student success.</p>
<div className="flex gap-4">
<button className="bg-secondary-container text-on-secondary-container px-6 py-3 rounded-xl font-headline-sm text-sm hover:bg-on-primary hover:text-primary transition-all duration-300">
                            Explore All Tools
                        </button>
<button className="border border-on-primary/30 text-on-primary px-6 py-3 rounded-xl font-headline-sm text-sm hover:bg-on-primary/10 transition-all duration-300">
                            View Documentation
                        </button>
</div>
</div>
</section>

<div className="grid grid-cols-12 gap-card-gap">

<div className="col-span-12 lg:col-span-8 ambient-card bg-surface-container-lowest p-unit*4 rounded-[24px] flex flex-col md:flex-row gap-8 items-center border border-outline-variant/30">
<div className="w-full md:w-2/5 h-64 rounded-2xl overflow-hidden relative group">
<img className="w-full h-full object-cover" alt="A highly detailed cinematic shot of a modern writing desk featuring a high-end minimalist laptop displaying complex text analysis graphs. A pristine leather-bound notebook and a premium fountain pen sit nearby. The lighting is soft and golden, coming from a nearby window, creating a serene, scholarly atmosphere. The color palette is composed of soft whites, deep blues, and warm wood tones." src="https://lh3.googleusercontent.com/aida-public/AB6AXuBc9f1dtqS2n2wsmEGM2JUNeK_L34xeksrO8tugLynoVsWBFECJYKN-R-5JR8L7uVeF5fhtFNO5F4YNYpi1XyJLleTNoePVhi761ascPz0v83ArykXXbDXOjKtQdbdhzw3fPYIkivX03zRvwnCzy-NOay9CB0Y1Ptb99S8qkpPCLhI-EbEyVwPtzx1_BSt6VT7esI-XpFB4wTTaTs_2fXDM6C-ky_YorKAyXXpYD7CbfSDF8aZgD8Qw" />
<div className="absolute inset-0 bg-gradient-to-t from-primary/60 to-transparent flex items-end p-6 opacity-0 group-hover:opacity-100 transition-opacity">
<span className="text-on-primary font-label-md">Optimized for Ivy League Standards</span>
</div>
</div>
<div className="flex-1 flex flex-col justify-center">
<div className="flex items-center gap-3 mb-4">
<div className="w-12 h-12 bg-primary-fixed rounded-xl flex items-center justify-center text-primary">
<span className="material-symbols-outlined text-2xl" style={{fontVariationSettings: "'FILL' 1"}}>edit_note</span>
</div>
<h3 className="font-headline-md text-headline-md text-on-surface">Personal Statement Reviewer</h3>
</div>
<p className="font-body-lg text-on-surface-variant mb-8 leading-relaxed">AI-powered feedback on narrative structure, tone, and thematic strength for your admissions essays.</p>
<div className="flex items-center gap-6 mt-auto">
<button disabled title="Requires an AI writing service to be connected — not yet available" className="bg-surface-container-high text-on-surface-variant px-8 py-3.5 rounded-xl font-bold flex items-center gap-2 opacity-60 cursor-not-allowed">
                                Coming Soon
                                <span className="material-symbols-outlined text-sm">lock</span>
</button>
</div>
</div>
</div>

<div className="col-span-12 lg:col-span-4 ambient-card bg-surface-container-lowest p-unit*4 rounded-[24px] flex flex-col border border-outline-variant/30">
<div className="w-12 h-12 bg-secondary-fixed rounded-xl flex items-center justify-center text-secondary mb-6">
<span className="material-symbols-outlined text-2xl">record_voice_over</span>
</div>
<h3 className="font-headline-sm text-headline-sm text-on-surface mb-3">Interview Simulator</h3>
<p className="font-body-md text-on-surface-variant mb-8">Practice with realistic AI personas for university and visa interviews, with real-time feedback.</p>
<div className="mt-auto pt-6 border-t border-outline-variant/20">
<button disabled title="Requires an AI conversation service to be connected — not yet available" className="w-full bg-surface-container-high text-on-surface-variant py-3 rounded-xl font-bold opacity-60 cursor-not-allowed">
                            Coming Soon
                        </button>
</div>
</div>

<div className="col-span-12 md:col-span-6 lg:col-span-4 ambient-card bg-surface-container-lowest p-unit*4 rounded-[24px] flex flex-col border border-outline-variant/30">
<div className="w-12 h-12 bg-tertiary-fixed rounded-xl flex items-center justify-center text-tertiary mb-6">
<span className="material-symbols-outlined text-2xl">analytics</span>
</div>
<h3 className="font-headline-sm text-headline-sm text-on-surface mb-3">Visa Probability</h3>
<p className="font-body-md text-on-surface-variant mb-8">Estimate approval likelihood based on your profile and financial documentation.</p>
<div className="mt-auto">
<button disabled title="Requires real historical visa-outcome data — not yet available" className="w-full bg-surface-container-high text-on-surface-variant py-3 rounded-xl font-bold opacity-60 cursor-not-allowed">
                            Coming Soon
                        </button>
</div>
</div>

<div className="col-span-12 md:col-span-6 lg:col-span-8 ambient-card bg-surface-container-lowest p-unit*4 rounded-[24px] flex flex-col md:flex-row gap-8 items-center border border-outline-variant/30">
<div className="flex-1">
<div className="flex items-center gap-3 mb-4">
<div className="w-12 h-12 bg-primary-fixed-dim rounded-xl flex items-center justify-center text-primary">
<span className="material-symbols-outlined text-2xl">travel_explore</span>
</div>
<h3 className="font-headline-md text-headline-md text-on-surface">Global University Matcher</h3>
</div>
<p className="font-body-lg text-on-surface-variant mb-6">Get program recommendations matched to your real profile preferences — country, field of study, and university ranking.</p>
<div className="flex gap-2 flex-wrap mb-8">
<span className="px-3 py-1 bg-surface-container-high rounded-full text-label-md font-medium text-on-surface-variant">USA</span>
<span className="px-3 py-1 bg-surface-container-high rounded-full text-label-md font-medium text-on-surface-variant">UK</span>
<span className="px-3 py-1 bg-surface-container-high rounded-full text-label-md font-medium text-on-surface-variant">Canada</span>
<span className="px-3 py-1 bg-surface-container-high rounded-full text-label-md font-medium text-on-surface-variant">Australia</span>
</div>
<Link href="/student/ai-recommendations" className="bg-primary text-on-primary px-8 py-3.5 rounded-xl font-bold flex items-center gap-2 hover:bg-secondary transition-colors active:scale-95 shadow-lg shadow-primary/20 w-fit">
                            Find My Match
                        </Link>
</div>
<div className="w-full md:w-1/3 aspect-square rounded-2xl overflow-hidden shadow-inner">
<div className="w-full h-full bg-cover bg-center transition-transform duration-700 hover:scale-110" style={{backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuCxa-ZjyuTnxrHfO9SirJZ4mKdzN_KJ2DEZKRHBVyXm0H5eKQifI9NYmooyZaCBmKxKgSNmXz0ruQjnrAscANNpwfzvKJ3ab1kcWmZ_WPnSiIxhK0_x766a1H6hLV8c39mJ8gBy-PXKaPGdu559b29pXley5-bUyl9lcoZSlKNz7tTUjlTfyvDuK83Zbtgy51rwwcH3MN31DAQ1wCnpIw0D3RkeLlrj7ugl9-EOIMk1CBl_b5z_YSCR')"}}></div>
</div>
</div>
</div>

<footer className="mt-16 grid grid-cols-1 md:grid-cols-4 gap-8 py-12 border-t border-outline-variant/20">
<div className="flex flex-col">
<span className="text-display-lg font-bold text-primary">45k+</span>
<span className="text-label-md text-on-surface-variant">Applications Assisted</span>
</div>
<div className="flex flex-col">
<span className="text-display-lg font-bold text-primary">92%</span>
<span className="text-label-md text-on-surface-variant">Visa Approval Rate</span>
</div>
<div className="flex flex-col">
<span className="text-display-lg font-bold text-primary">150+</span>
<span className="text-label-md text-on-surface-variant">Partner Universities</span>
</div>
<div className="flex flex-col">
<span className="text-display-lg font-bold text-primary">4.9/5</span>
<span className="text-label-md text-on-surface-variant">Student Rating</span>
</div>
</footer>
</div>

<div className="fixed bottom-10 right-10 z-50">
<button disabled title="Chat assistant coming soon" className="w-14 h-14 bg-surface-container-high text-on-surface-variant rounded-full shadow-2xl flex items-center justify-center opacity-60 cursor-not-allowed">
<span className="material-symbols-outlined text-2xl">chat_bubble</span>
</button>
</div>
</main>
    </>
  );
}
