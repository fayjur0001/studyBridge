import type { Metadata } from "next";
import PublicNavbar from "@/components/layout/PublicNavbar";
import PublicFooter from "@/components/layout/PublicFooter";

export const metadata: Metadata = {
  title: "Global Destinations",
};

export default function GlobalDestinationsPage() {
  return (
    <>
<PublicNavbar variant="glass" current="Countries" />
<main className="min-h-screen">

<section className="relative overflow-hidden bg-primary py-24 md:py-32">

<div className="relative z-10 max-w-7xl mx-auto px-margin-desktop text-center">
<span className="inline-block bg-white/10 text-primary-fixed-dim px-4 py-1.5 rounded-full font-label-md text-label-md mb-6 backdrop-blur-sm">
                    Global Academic Directory
                </span>
<h1 className="font-display-lg text-display-lg text-on-primary mb-6 max-w-3xl mx-auto leading-tight">
                    Choose Your Global Destination
                </h1>
<p className="font-body-lg text-body-lg text-on-primary/80 max-w-2xl mx-auto mb-10">
                    Explore high-ranking universities, diverse cultures, and world-class educational standards across our elite partner countries.
                </p>
<div className="flex flex-col sm:flex-row gap-4 justify-center">
<div className="relative group max-w-md w-full">
<span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant group-focus-within:text-primary transition-colors">search</span>
<input className="w-full pl-12 pr-4 py-4 rounded-xl border-none bg-surface-container-lowest text-on-surface font-body-md focus:ring-2 focus:ring-primary shadow-lg transition-all" placeholder="Search by country or region..." type="text" />
</div>
</div>
</div>
</section>

<section className="max-w-7xl mx-auto px-margin-desktop py-20">
<div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
<div>
<h2 className="font-headline-lg text-headline-lg text-on-surface mb-2">Featured Destinations</h2>
<p className="font-body-md text-body-md text-on-surface-variant">Curated locations offering premium student experiences and visa support.</p>
</div>
<div className="flex gap-2">
<button className="px-4 py-2 rounded-lg bg-surface-container-high text-on-surface font-label-md text-label-md hover:bg-primary-container hover:text-on-primary-container transition-all">All Regions</button>
<button className="px-4 py-2 rounded-lg bg-surface-container text-on-surface-variant font-label-md text-label-md hover:bg-primary-container/20 transition-all">Europe</button>
<button className="px-4 py-2 rounded-lg bg-surface-container text-on-surface-variant font-label-md text-label-md hover:bg-primary-container/20 transition-all">Americas</button>
<button className="px-4 py-2 rounded-lg bg-surface-container text-on-surface-variant font-label-md text-label-md hover:bg-primary-container/20 transition-all">Asia Pacific</button>
</div>
</div>

<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-card-gap">

<div className="group bg-surface-container-lowest rounded-[24px] overflow-hidden ambient-occlusion flex flex-col">
<div className="h-48 relative">
<div className="bg-cover bg-center w-full h-full group-hover:scale-110 transition-transform duration-700" style={{backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuByHi3x4KVB6elj_cwQxAN-QMAyqfhWfka80AOhvFJbduXKkQDl0qJM8FzZUU-wT7kOWysHgl8rkEjPn2qVYcjhHJn28MfchNw4uo1FbzbsLyQdzibQTJYYtvchv9GzvQjcZfZV5My5KAklPoFRz3Iig5b_Z2XZMmZ1Qipkrb0jr4HAyZkfd8ubRjJnNC3qgZAMEFj1jGbV0QdjuHwgKf8CxohVH6iIyJSqJInxZKogaYU_z5-H4unc')"}}></div>
<div className="absolute inset-0 bg-gradient-to-t from-on-surface/40 to-transparent"></div>
<div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md p-2 rounded-xl shadow-sm">
<span className="font-headline-sm text-headline-sm">🇬🇧</span>
</div>
</div>
<div className="p-container-padding flex flex-col flex-grow">
<h3 className="font-headline-sm text-headline-sm text-on-surface mb-4">United Kingdom</h3>
<div className="space-y-3 mb-6">
<div className="flex justify-between items-center bg-surface-container-low p-3 rounded-xl border border-outline-variant/30">
<span className="font-label-md text-label-md text-on-surface-variant flex items-center gap-2">
<span className="material-symbols-outlined text-primary text-[18px]">school</span> Partner Universities
                                </span>
<span className="font-body-md text-body-md font-bold text-primary">150+</span>
</div>
<div className="flex justify-between items-center bg-surface-container-low p-3 rounded-xl border border-outline-variant/30">
<span className="font-label-md text-label-md text-on-surface-variant flex items-center gap-2">
<span className="material-symbols-outlined text-primary text-[18px]">payments</span> Avg. Living Cost
                                </span>
<span className="font-body-md text-body-md font-bold text-primary">£1,200/mo</span>
</div>
</div>
<button className="mt-auto w-full py-3 rounded-xl bg-blue-soft text-primary font-label-md text-label-md font-bold group-hover:bg-primary group-hover:text-on-primary transition-all">Explore Institutions</button>
</div>
</div>

<div className="group bg-surface-container-lowest rounded-[24px] overflow-hidden ambient-occlusion flex flex-col">
<div className="h-48 relative">
<div className="bg-cover bg-center w-full h-full group-hover:scale-110 transition-transform duration-700" style={{backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuD_sS0ZmazdzcWMTANNQ1BdyYuckhpvJQGcoBtwHeEl5tfJsJDLMMmree6RYKVhsA0M4d92glV0PyYYj6qgAAyVkb3ERxq_j89KcSTqzA3xRMiJNlFN0vzNTE3ld9jyjgWG5FG_7VF7Yp4K2GOIweNI_L0eKrYxNOG0tETNxm9EwwIK5oSci0yTxeV0sOT3_eKaNUElar2biFXOt1ZPCE_nLG2ZKz0ruzkZ2vKcS-NTLnV0zeySK4aB')"}}></div>
<div className="absolute inset-0 bg-gradient-to-t from-on-surface/40 to-transparent"></div>
<div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md p-2 rounded-xl shadow-sm">
<span className="font-headline-sm text-headline-sm">🇺🇸</span>
</div>
</div>
<div className="p-container-padding flex flex-col flex-grow">
<h3 className="font-headline-sm text-headline-sm text-on-surface mb-4">United States</h3>
<div className="space-y-3 mb-6">
<div className="flex justify-between items-center bg-surface-container-low p-3 rounded-xl border border-outline-variant/30">
<span className="font-label-md text-label-md text-on-surface-variant flex items-center gap-2">
<span className="material-symbols-outlined text-primary text-[18px]">school</span> Partner Universities
                                </span>
<span className="font-body-md text-body-md font-bold text-primary">420+</span>
</div>
<div className="flex justify-between items-center bg-surface-container-low p-3 rounded-xl border border-outline-variant/30">
<span className="font-label-md text-label-md text-on-surface-variant flex items-center gap-2">
<span className="material-symbols-outlined text-primary text-[18px]">payments</span> Avg. Living Cost
                                </span>
<span className="font-body-md text-body-md font-bold text-primary">$1,500/mo</span>
</div>
</div>
<button className="mt-auto w-full py-3 rounded-xl bg-blue-soft text-primary font-label-md text-label-md font-bold group-hover:bg-primary group-hover:text-on-primary transition-all">Explore Institutions</button>
</div>
</div>

<div className="group bg-surface-container-lowest rounded-[24px] overflow-hidden ambient-occlusion flex flex-col">
<div className="h-48 relative">
<div className="bg-cover bg-center w-full h-full group-hover:scale-110 transition-transform duration-700" style={{backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuCPPhIaxBBKFtyZmgkynTK-7Jw714CsOZBgbl6P_B4NbpdGzoATr4k8RKg8imlcwISrGxRLIbu3fBIwnXRTykepqDFEd1kuJ39j3tDHvBNNRg_murh6UMZe8hTFwram5kh7hl6E8S3HvM6cdXjlwJkH-JKiMg8HjCEvOFECvO9StktnD3ZjurzoVrbdQQEDnEQJnzLAA8b7fHjWlwlW-BKAMtxTodQSf6ZcXxn4BSQjn3UZoPivdkY_')"}}></div>
<div className="absolute inset-0 bg-gradient-to-t from-on-surface/40 to-transparent"></div>
<div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md p-2 rounded-xl shadow-sm">
<span className="font-headline-sm text-headline-sm">🇩🇪</span>
</div>
</div>
<div className="p-container-padding flex flex-col flex-grow">
<h3 className="font-headline-sm text-headline-sm text-on-surface mb-4">Germany</h3>
<div className="space-y-3 mb-6">
<div className="flex justify-between items-center bg-surface-container-low p-3 rounded-xl border border-outline-variant/30">
<span className="font-label-md text-label-md text-on-surface-variant flex items-center gap-2">
<span className="material-symbols-outlined text-primary text-[18px]">school</span> Partner Universities
                                </span>
<span className="font-body-md text-body-md font-bold text-primary">85+</span>
</div>
<div className="flex justify-between items-center bg-surface-container-low p-3 rounded-xl border border-outline-variant/30">
<span className="font-label-md text-label-md text-on-surface-variant flex items-center gap-2">
<span className="material-symbols-outlined text-primary text-[18px]">payments</span> Avg. Living Cost
                                </span>
<span className="font-body-md text-body-md font-bold text-primary">€900/mo</span>
</div>
</div>
<button className="mt-auto w-full py-3 rounded-xl bg-blue-soft text-primary font-label-md text-label-md font-bold group-hover:bg-primary group-hover:text-on-primary transition-all">Explore Institutions</button>
</div>
</div>

<div className="group bg-surface-container-lowest rounded-[24px] overflow-hidden ambient-occlusion flex flex-col">
<div className="h-48 relative">
<div className="bg-cover bg-center w-full h-full group-hover:scale-110 transition-transform duration-700" style={{backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuC9p4vmv29ZsSSdOBD5AAfhkuhNDwZcHzHBSwYnfB2d9QqQVHQ8AX736Nwa5O5-wFxufOlLulCaJUJ1wZItTm4KrXRG_DZIT4mQpQYgStH3gjcGsXlGuKiWFEAdZwv6LrvaeDKZ5gZlpQkMP01shZMIb2IIkh-QeGCCHY78HhaubEFUDtZi1qDIf29jb_K-vISYu7tGmbLyaR838FcfwT4LzC3VajLD7bdWTESPv-BWbZZSpWaG5Yur')"}}></div>
<div className="absolute inset-0 bg-gradient-to-t from-on-surface/40 to-transparent"></div>
<div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md p-2 rounded-xl shadow-sm">
<span className="font-headline-sm text-headline-sm">🇨🇦</span>
</div>
</div>
<div className="p-container-padding flex flex-col flex-grow">
<h3 className="font-headline-sm text-headline-sm text-on-surface mb-4">Canada</h3>
<div className="space-y-3 mb-6">
<div className="flex justify-between items-center bg-surface-container-low p-3 rounded-xl border border-outline-variant/30">
<span className="font-label-md text-label-md text-on-surface-variant flex items-center gap-2">
<span className="material-symbols-outlined text-primary text-[18px]">school</span> Partner Universities
                                </span>
<span className="font-body-md text-body-md font-bold text-primary">110+</span>
</div>
<div className="flex justify-between items-center bg-surface-container-low p-3 rounded-xl border border-outline-variant/30">
<span className="font-label-md text-label-md text-on-surface-variant flex items-center gap-2">
<span className="material-symbols-outlined text-primary text-[18px]">payments</span> Avg. Living Cost
                                </span>
<span className="font-body-md text-body-md font-bold text-primary">CAD 1,400/mo</span>
</div>
</div>
<button className="mt-auto w-full py-3 rounded-xl bg-blue-soft text-primary font-label-md text-label-md font-bold group-hover:bg-primary group-hover:text-on-primary transition-all">Explore Institutions</button>
</div>
</div>

<div className="group bg-surface-container-lowest rounded-[24px] overflow-hidden ambient-occlusion flex flex-col">
<div className="h-48 relative">
<div className="bg-cover bg-center w-full h-full group-hover:scale-110 transition-transform duration-700" style={{backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuCmIDqLQVX8eeLxemlCZgSQFoY2lfpZItytStc-iAL-qE90rdevZayOIplFOx21Dhk41RY2WmLFchnRXQSDY26wdFWw3OI52vVbWcb2F_jN7p717BmBd63vRDuiu8jBQt6xQ7iO-7LIjB95oDrPGIsUKhAJT2yp11TGR-zJgXUwiIo7vR-8oewc342CXh9_laL0DUGe8c_WJCRujuvJw89ToWN7UPEoubWpkD9PJ70TKzkR1_7Iu06F')"}}></div>
<div className="absolute inset-0 bg-gradient-to-t from-on-surface/40 to-transparent"></div>
<div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md p-2 rounded-xl shadow-sm">
<span className="font-headline-sm text-headline-sm">🇦🇺</span>
</div>
</div>
<div className="p-container-padding flex flex-col flex-grow">
<h3 className="font-headline-sm text-headline-sm text-on-surface mb-4">Australia</h3>
<div className="space-y-3 mb-6">
<div className="flex justify-between items-center bg-surface-container-low p-3 rounded-xl border border-outline-variant/30">
<span className="font-label-md text-label-md text-on-surface-variant flex items-center gap-2">
<span className="material-symbols-outlined text-primary text-[18px]">school</span> Partner Universities
                                </span>
<span className="font-body-md text-body-md font-bold text-primary">60+</span>
</div>
<div className="flex justify-between items-center bg-surface-container-low p-3 rounded-xl border border-outline-variant/30">
<span className="font-label-md text-label-md text-on-surface-variant flex items-center gap-2">
<span className="material-symbols-outlined text-primary text-[18px]">payments</span> Avg. Living Cost
                                </span>
<span className="font-body-md text-body-md font-bold text-primary">AUD 1,600/mo</span>
</div>
</div>
<button className="mt-auto w-full py-3 rounded-xl bg-blue-soft text-primary font-label-md text-label-md font-bold group-hover:bg-primary group-hover:text-on-primary transition-all">Explore Institutions</button>
</div>
</div>

<div className="group bg-surface-container-lowest rounded-[24px] overflow-hidden ambient-occlusion flex flex-col">
<div className="h-48 relative">
<div className="bg-cover bg-center w-full h-full group-hover:scale-110 transition-transform duration-700" style={{backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuCMcxy98hTYSG7ug53740e5xO6okBA9Pu5BzosxWZZ-6Fz3KsujBWSTNZdLcdwJ5QysIDhW562HI7I1HIaRZhcw_Nsl3b5-3wTGj66xIFZ2JHXHClsx3cwab-2KDh4jtLQDjWqGFletnGiimdNhO9huJJjXWulTlDn3O9DDqP_tT5SLBa20aX_brgP1Z410XYGV17wwrwGYT54T1f5MpF87lk99N0ymevD4EeDrLWD9p6kK3va66Jdj')"}}></div>
<div className="absolute inset-0 bg-gradient-to-t from-on-surface/40 to-transparent"></div>
<div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md p-2 rounded-xl shadow-sm">
<span className="font-headline-sm text-headline-sm">🇫🇷</span>
</div>
</div>
<div className="p-container-padding flex flex-col flex-grow">
<h3 className="font-headline-sm text-headline-sm text-on-surface mb-4">France</h3>
<div className="space-y-3 mb-6">
<div className="flex justify-between items-center bg-surface-container-low p-3 rounded-xl border border-outline-variant/30">
<span className="font-label-md text-label-md text-on-surface-variant flex items-center gap-2">
<span className="material-symbols-outlined text-primary text-[18px]">school</span> Partner Universities
                                </span>
<span className="font-body-md text-body-md font-bold text-primary">75+</span>
</div>
<div className="flex justify-between items-center bg-surface-container-low p-3 rounded-xl border border-outline-variant/30">
<span className="font-label-md text-label-md text-on-surface-variant flex items-center gap-2">
<span className="material-symbols-outlined text-primary text-[18px]">payments</span> Avg. Living Cost
                                </span>
<span className="font-body-md text-body-md font-bold text-primary">€1,100/mo</span>
</div>
</div>
<button className="mt-auto w-full py-3 rounded-xl bg-blue-soft text-primary font-label-md text-label-md font-bold group-hover:bg-primary group-hover:text-on-primary transition-all">Explore Institutions</button>
</div>
</div>

<div className="group bg-surface-container-lowest rounded-[24px] overflow-hidden ambient-occlusion flex flex-col">
<div className="h-48 relative">
<div className="bg-cover bg-center w-full h-full group-hover:scale-110 transition-transform duration-700" style={{backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDBrfCc5B7FeBHBsQVV9yNBMKv9fAESy7V8gCi8dUksTZ_gpLF1x_6yXkO5So11GgLHa7Dld73Kt0t9RNNxuNhuM5iIbhrSOK5m02lRRraNK3Ls1WNfmYoBH5lXwFG5Wtz8o-3GvcfjyYkUGrClNTkDAlNiGsjRHlIWs3coYmt-lhTtG49sM0Yun6dcCQLN3yUCnSqmFd5FmTEo4uKGZYWJkGGdHX8QpJ9-mjS_ZnQRZFKKpMCv_E4o')"}}></div>
<div className="absolute inset-0 bg-gradient-to-t from-on-surface/40 to-transparent"></div>
<div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md p-2 rounded-xl shadow-sm">
<span className="font-headline-sm text-headline-sm">🇳🇱</span>
</div>
</div>
<div className="p-container-padding flex flex-col flex-grow">
<h3 className="font-headline-sm text-headline-sm text-on-surface mb-4">Netherlands</h3>
<div className="space-y-3 mb-6">
<div className="flex justify-between items-center bg-surface-container-low p-3 rounded-xl border border-outline-variant/30">
<span className="font-label-md text-label-md text-on-surface-variant flex items-center gap-2">
<span className="material-symbols-outlined text-primary text-[18px]">school</span> Partner Universities
                                </span>
<span className="font-body-md text-body-md font-bold text-primary">45+</span>
</div>
<div className="flex justify-between items-center bg-surface-container-low p-3 rounded-xl border border-outline-variant/30">
<span className="font-label-md text-label-md text-on-surface-variant flex items-center gap-2">
<span className="material-symbols-outlined text-primary text-[18px]">payments</span> Avg. Living Cost
                                </span>
<span className="font-body-md text-body-md font-bold text-primary">€1,000/mo</span>
</div>
</div>
<button className="mt-auto w-full py-3 rounded-xl bg-blue-soft text-primary font-label-md text-label-md font-bold group-hover:bg-primary group-hover:text-on-primary transition-all">Explore Institutions</button>
</div>
</div>

<div className="group bg-surface-container-lowest rounded-[24px] overflow-hidden ambient-occlusion flex flex-col">
<div className="h-48 relative">
<div className="bg-cover bg-center w-full h-full group-hover:scale-110 transition-transform duration-700" style={{backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuCsrR7Yc3ngMum707NfjeHoFJhIIhu1LyOtwAvF3qepjdalFRLwCve_AE8D6sHGDiadtDUOHMBRpCU007zxQT_JZl6K1FsPDwzDituFKqCjg1Xl-ylJx2x1zgXtx3Oe3fS5o3d1kwzkFHNOGrxb7NsU2eXic2NP_zmE4wYxu9gxVVkayKZDFmRu4N1iLF1p7jWkf9woLctzonc3Rmz-FXj-HHPmXqaRRw5sXEpbU2cxULGwYw4RdFTu')"}}></div>
<div className="absolute inset-0 bg-gradient-to-t from-on-surface/40 to-transparent"></div>
<div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md p-2 rounded-xl shadow-sm">
<span className="font-headline-sm text-headline-sm">🇯🇵</span>
</div>
</div>
<div className="p-container-padding flex flex-col flex-grow">
<h3 className="font-headline-sm text-headline-sm text-on-surface mb-4">Japan</h3>
<div className="space-y-3 mb-6">
<div className="flex justify-between items-center bg-surface-container-low p-3 rounded-xl border border-outline-variant/30">
<span className="font-label-md text-label-md text-on-surface-variant flex items-center gap-2">
<span className="material-symbols-outlined text-primary text-[18px]">school</span> Partner Universities
                                </span>
<span className="font-body-md text-body-md font-bold text-primary">35+</span>
</div>
<div className="flex justify-between items-center bg-surface-container-low p-3 rounded-xl border border-outline-variant/30">
<span className="font-label-md text-label-md text-on-surface-variant flex items-center gap-2">
<span className="material-symbols-outlined text-primary text-[18px]">payments</span> Avg. Living Cost
                                </span>
<span className="font-body-md text-body-md font-bold text-primary">¥120k/mo</span>
</div>
</div>
<button className="mt-auto w-full py-3 rounded-xl bg-blue-soft text-primary font-label-md text-label-md font-bold group-hover:bg-primary group-hover:text-on-primary transition-all">Explore Institutions</button>
</div>
</div>
</div>
</section>

<section className="max-w-7xl mx-auto px-margin-desktop mb-24">
<div className="bg-primary-container rounded-[32px] p-12 md:p-16 flex flex-col md:flex-row items-center gap-12 overflow-hidden relative">
<div className="relative z-10 md:w-3/5">
<h2 className="font-headline-lg text-headline-lg text-on-primary-container mb-4">Not sure which country suits you?</h2>
<p className="font-body-lg text-body-lg text-on-primary-container/80 mb-8">
                        Our AI-powered Matching Engine analyzes your profile and academic goals to suggest the perfect study destination.
                    </p>
<button className="bg-on-primary-container text-primary-container px-8 py-4 rounded-xl font-headline-sm text-headline-sm hover:opacity-90 active:scale-95 transition-all">
                        Try AI Matchmaker
                    </button>
</div>
<div className="md:w-2/5 flex justify-center">
<div className="relative w-64 h-64">

</div>
</div>

<div className="absolute -top-12 -right-12 w-64 h-64 bg-primary/20 rounded-full blur-3xl"></div>
<div className="absolute -bottom-12 -left-12 w-64 h-64 bg-secondary/20 rounded-full blur-3xl"></div>
</div>
</section>
</main>

<PublicFooter />
    </>
  );
}
