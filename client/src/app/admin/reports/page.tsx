import type { Metadata } from "next";
import AdminSidebar from "@/components/dashboard/AdminSidebar";

export const metadata: Metadata = {
  title: "Reports & Disputes",
};

export default function AdminReportsPage() {
  return (
    <>
<AdminSidebar />


{/* TopNavBar (Shared Component) */}
<header className="sticky top-0 z-40 ml-[260px] w-[calc(100%-260px)] h-16 bg-surface border-b border-outline-variant flex justify-between items-center px-8 shadow-sm">
<div className="flex items-center flex-1 max-w-xl">
<div className="relative w-full">
<span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">search</span>
<input className="w-full pl-10 pr-4 py-2 bg-surface-container-low border-none rounded-lg font-body-md text-body-md focus:ring-2 focus:ring-primary-container outline-none transition-all" placeholder="Search disputes, agencies, or case IDs..." type="text"/>
</div>
</div>
<div className="flex items-center gap-6">
<div className="flex items-center gap-4">
<button className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface-container transition-colors text-on-surface-variant">
<span className="material-symbols-outlined">notifications</span>
</button>
<button className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface-container transition-colors text-on-surface-variant">
<span className="material-symbols-outlined">help_outline</span>
</button>
</div>
<div className="h-8 w-[1px] bg-outline-variant"></div>
<div className="flex items-center gap-3">
<span className="font-label-md text-label-md font-semibold text-primary">StudyBridge Admin</span>
</div>
</div>
</header>
{/* Main Content Area */}
<main className="ml-[260px] p-container-padding space-y-gutter">
{/* Header Section */}
<div className="bg-amber-50 border border-amber-300 text-amber-900 rounded-2xl px-6 py-4 flex items-center gap-3">
<span className="material-symbols-outlined">construction</span>
<p className="font-body-md text-body-md">
This page describes a full dispute/case-management system (case IDs, resolution workflow, assigned staff). That&apos;s a new subsystem that hasn&apos;t been built on the backend yet — everything below is still placeholder content, not real data. Let&apos;s scope the actual dispute workflow you need before building it.
</p>
</div>
<section className="flex flex-col md:flex-row md:items-end justify-between gap-4">
<div>
<h2 className="font-headline-lg text-headline-lg text-primary">Dispute Resolution Center</h2>
<p className="font-body-lg text-body-lg text-on-surface-variant mt-1">Manage platform-level disagreements and maintaining academic integrity.</p>
</div>
<div className="flex gap-3">
<button className="flex items-center gap-2 px-5 py-2.5 bg-blue-soft text-primary rounded-xl font-label-md text-label-md hover:bg-surface-container-high transition-all">
<span className="material-symbols-outlined">filter_list</span>
                    Advanced Filters
                </button>
<button className="flex items-center gap-2 px-6 py-2.5 bg-primary text-on-primary rounded-xl font-label-md text-label-md shadow-lg hover:shadow-xl transition-all">
<span className="material-symbols-outlined">file_download</span>
                    Export Case Reports
                </button>
</div>
</section>
{/* Analytics Bento Grid */}
<section className="grid grid-cols-1 md:grid-cols-12 gap-card-gap">
<div className="md:col-span-8 grid grid-cols-1 md:grid-cols-3 gap-card-gap">
{/* Stat Card 1 */}
<div className="bg-surface-container-lowest p-6 rounded-[24px] ambient-shadow flex flex-col justify-between h-40 border border-surface-container">
<div className="flex justify-between items-start">
<span className="material-symbols-outlined text-primary p-2 bg-primary-container/10 rounded-lg">priority_high</span>
<span className="text-error font-bold text-[12px]">+12% vs last week</span>
</div>
<div>
<p className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Active Disputes</p>
<h3 className="text-[32px] font-bold text-primary">24</h3>
</div>
</div>
{/* Stat Card 2 */}
<div className="bg-surface-container-lowest p-6 rounded-[24px] ambient-shadow flex flex-col justify-between h-40 border border-surface-container">
<div className="flex justify-between items-start">
<span className="material-symbols-outlined text-secondary p-2 bg-secondary-container/10 rounded-lg">history</span>
<span className="text-on-secondary-container font-bold text-[12px]">Avg. Resolve: 4.2d</span>
</div>
<div>
<p className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Closed Cases</p>
<h3 className="text-[32px] font-bold text-primary">1,402</h3>
</div>
</div>
{/* Stat Card 3 */}
<div className="bg-surface-container-lowest p-6 rounded-[24px] ambient-shadow flex flex-col justify-between h-40 border border-surface-container">
<div className="flex justify-between items-start">
<span className="material-symbols-outlined text-tertiary p-2 bg-tertiary-fixed rounded-lg">payments</span>
<span className="text-tertiary font-bold text-[12px]">Total Volume</span>
</div>
<div>
<p className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Refund Volume</p>
<h3 className="text-[32px] font-bold text-primary">$42.8k</h3>
</div>
</div>
</div>
{/* Category Distribution Chart (Visual Representation) */}
<div className="md:col-span-4 bg-surface-container-lowest p-6 rounded-[24px] ambient-shadow border border-surface-container">
<h4 className="font-headline-sm text-headline-sm text-primary mb-4">Report Categories</h4>
<div className="space-y-4">
<div className="space-y-1">
<div className="flex justify-between text-label-md">
<span className="font-medium">Application Status</span>
<span className="text-on-surface-variant">45%</span>
</div>
<div className="h-2 w-full bg-surface-container rounded-full overflow-hidden">
<div className="h-full bg-primary" style={{width: '45%'}}></div>
</div>
</div>
<div className="space-y-1">
<div className="flex justify-between text-label-md">
<span className="font-medium">Agency Misconduct</span>
<span className="text-on-surface-variant">30%</span>
</div>
<div className="h-2 w-full bg-surface-container rounded-full overflow-hidden">
<div className="h-full bg-secondary" style={{width: '30%'}}></div>
</div>
</div>
<div className="space-y-1">
<div className="flex justify-between text-label-md">
<span className="font-medium">Scholarship Dispute</span>
<span className="text-on-surface-variant">15%</span>
</div>
<div className="h-2 w-full bg-surface-container rounded-full overflow-hidden">
<div className="h-full bg-tertiary-container" style={{width: '15%'}}></div>
</div>
</div>
<div className="space-y-1">
<div className="flex justify-between text-label-md">
<span className="font-medium">Other</span>
<span className="text-on-surface-variant">10%</span>
</div>
<div className="h-2 w-full bg-surface-container rounded-full overflow-hidden">
<div className="h-full bg-outline-variant" style={{width: '10%'}}></div>
</div>
</div>
</div>
</div>
</section>
{/* Dual Column: Feed & Resolution Workspace */}
<section className="grid grid-cols-1 lg:grid-cols-12 gap-card-gap">
{/* LEFT: Active Disputes Feed (4 columns) */}
<div className="lg:col-span-4 space-y-4 h-[750px] overflow-y-auto pr-2">
<div className="flex items-center justify-between sticky top-0 bg-background/80 backdrop-blur-md py-2 z-10">
<h4 className="font-headline-sm text-headline-sm text-primary">Active Feed</h4>
<span className="bg-primary-container text-on-primary-container px-2 py-0.5 rounded-full text-[10px] font-bold">LATEST FIRST</span>
</div>
{/* Case Card 1 (Active/Critical) */}
<div className="bg-surface-container-lowest p-5 rounded-2xl border-l-4 border-error ambient-shadow cursor-pointer hover:border-l-8 transition-all">
<div className="flex justify-between mb-2">
<span className="text-[10px] font-extrabold text-error bg-error-container px-2 py-0.5 rounded uppercase">CRITICAL</span>
<span className="text-label-md text-on-surface-variant">#DISP-9921</span>
</div>
<h5 className="font-headline-sm text-[16px] text-primary">Application Delay: Elite Pathway</h5>
<p className="text-body-md text-on-surface-variant line-clamp-2 mt-1">Student claims agency missed deadline for Oxford scholarship application despite full payment.</p>
<div className="mt-4 flex items-center justify-between">
<div className="flex -space-x-2">
<div className="w-6 h-6 rounded-full bg-blue-soft border-2 border-white overflow-hidden">
<img className="w-full h-full object-cover" alt="A portrait of a young Asian male student with a frustrated expression, wearing a simple gray sweatshirt, indoors in a bright study area. The lighting is crisp and modern, matching a corporate academic UI aesthetic." src="https://lh3.googleusercontent.com/aida-public/AB6AXuBuB373QB4n4aaV86oNfJlCb6DnW7Q57_B46o_r2c1seajs0A10Dik-zhRCt-hfoSxU0bVFWwP947orCcJ0q2TlBmFOdUMK9yw-4WQzaKR5Dv9a63QlJ7AscvgboAZe1T4DXlCpVRURDqOjIVj1Uz8LF9JYE2Rf2_4EsKDtvNbPaQliAVafTj5L6if2HrdTU9nnWbmRghanqC781SrzWI_gS2mGjRcOssKikC-I3za2oYoPCiJLEE5z"/>
</div>
<div className="w-6 h-6 rounded-full bg-secondary border-2 border-white overflow-hidden text-[8px] flex items-center justify-center text-white">EP</div>
</div>
<span className="text-[11px] text-on-surface-variant italic">Updated 14m ago</span>
</div>
</div>
{/* Case Card 2 (Medium) */}
<div className="bg-surface-container-lowest p-5 rounded-2xl border-l-4 border-secondary ambient-shadow cursor-pointer opacity-80 hover:opacity-100 transition-all">
<div className="flex justify-between mb-2">
<span className="text-[10px] font-extrabold text-secondary bg-secondary-fixed px-2 py-0.5 rounded uppercase">MEDIUM</span>
<span className="text-label-md text-on-surface-variant">#DISP-9884</span>
</div>
<h5 className="font-headline-sm text-[16px] text-primary">Document Verif. Failure</h5>
<p className="text-body-md text-on-surface-variant line-clamp-2 mt-1">University of Melbourne rejected transcript authenticity provided by BrightFutures Agency.</p>
<div className="mt-4 flex items-center justify-between">
<div className="flex -space-x-2">
<div className="w-6 h-6 rounded-full bg-blue-soft border-2 border-white overflow-hidden">
<img className="w-full h-full object-cover" alt="A portrait of a focused young female university official in business casual attire, working in a bright modern office with glass walls. High-key lighting, soft blue and gray tones, premium professional style." src="https://lh3.googleusercontent.com/aida-public/AB6AXuBcF7ooDwxfmkf6Fv1jwDTcE_rVjipD1BZanv7I_EvTsTwLc4psUBcJ-o0T5vbOOEIEjs7Cz3CRhBnnTmao-RHkcsxQKhVwPsXlteXpdYibsCs1nuLk87ASSGI8974lHDS-X_fj2eDyc6ic9J7D03GZU9suOeQWybYsk1ZoLDXOdCksTl9QFm7PN1rpSzfuuHsNfr_YLwgXR0ASQs6zypGA69vbrfaNh0OxE3RQXN-ah2aRvHMexs-u"/>
</div>
<div className="w-6 h-6 rounded-full bg-tertiary border-2 border-white overflow-hidden text-[8px] flex items-center justify-center text-white">BF</div>
</div>
<span className="text-[11px] text-on-surface-variant italic">Updated 2h ago</span>
</div>
</div>
{/* Case Card 3 (Low) */}
<div className="bg-surface-container-lowest p-5 rounded-2xl border-l-4 border-outline-variant ambient-shadow cursor-pointer opacity-60 hover:opacity-100 transition-all">
<div className="flex justify-between mb-2">
<span className="text-[10px] font-extrabold text-on-surface-variant bg-surface-container px-2 py-0.5 rounded uppercase">LOW</span>
<span className="text-label-md text-on-surface-variant">#DISP-9810</span>
</div>
<h5 className="font-headline-sm text-[16px] text-primary">Service Fee Inquiry</h5>
<p className="text-body-md text-on-surface-variant line-clamp-2 mt-1">Student requesting breakdown of $250 &apos;Administrative Convenience Fee&apos; from vendor.</p>
<div className="mt-4 flex items-center justify-between">
<div className="flex -space-x-2">
<div className="w-6 h-6 rounded-full bg-blue-soft border-2 border-white"></div>
<div className="w-6 h-6 rounded-full bg-primary border-2 border-white"></div>
</div>
<span className="text-[11px] text-on-surface-variant italic">Updated 1d ago</span>
</div>
</div>
</div>
{/* RIGHT: Case Detail & Resolution (8 columns) */}
<div className="lg:col-span-8 space-y-card-gap">
<div className="bg-surface-container-lowest rounded-[32px] ambient-shadow border border-surface-container overflow-hidden flex flex-col h-[750px]">
{/* Detail Header */}
<div className="p-8 border-b border-surface-container flex justify-between items-start">
<div>
<div className="flex items-center gap-3 mb-2">
<h3 className="font-headline-md text-headline-md text-primary">Case #DISP-9921 Detail</h3>
<span className="bg-error text-on-error px-3 py-1 rounded-full text-[12px] font-bold">ESCALATED</span>
</div>
<p className="font-body-md text-on-surface-variant">Student: <span className="font-semibold text-on-surface">Chen Wei</span> vs. Agency: <span className="font-semibold text-on-surface">Elite Pathway Consulting</span></p>
</div>
<div className="flex flex-col items-end gap-1">
<span className="text-label-md text-on-surface-variant">Opened: Oct 12, 2023</span>
<span className="text-label-md text-on-surface-variant">Priority: High Level 1</span>
</div>
</div>
{/* Detail Body (Tabs: Chat, History, Documents) */}
<div className="flex-1 overflow-hidden flex flex-col">
<div className="flex bg-surface-container-low px-8 border-b border-surface-container">
<button className="px-6 py-3 border-b-2 border-primary text-primary font-bold text-label-md">CHAT LOGS</button>
<button className="px-6 py-3 border-b-2 border-transparent text-on-surface-variant font-medium text-label-md hover:bg-surface-container-high transition-colors">TIMELINE</button>
<button className="px-6 py-3 border-b-2 border-transparent text-on-surface-variant font-medium text-label-md hover:bg-surface-container-high transition-colors">DOCUMENTS (4)</button>
</div>
{/* Content Area */}
<div className="flex-1 grid grid-cols-1 md:grid-cols-12 overflow-hidden">
{/* Chat Transcript */}
<div className="md:col-span-7 border-r border-surface-container flex flex-col bg-surface">
<div className="flex-1 overflow-y-auto p-6 space-y-4">
{/* Message Agency */}
<div className="flex flex-col items-start max-w-[85%]">
<div className="flex items-center gap-2 mb-1">
<span className="font-bold text-[11px] text-primary">AGENCY: MARCO R.</span>
<span className="text-[10px] text-on-surface-variant">10:14 AM</span>
</div>
<div className="bg-white p-3 rounded-2xl rounded-tl-none border border-surface-container shadow-sm">
<p className="text-body-md">We have submitted all documents to the portal. The delay is on the university end. We cannot control institutional review times.</p>
</div>
</div>
{/* Message Student */}
<div className="flex flex-col items-end ml-auto max-w-[85%]">
<div className="flex items-center gap-2 mb-1">
<span className="text-[10px] text-on-surface-variant">10:16 AM</span>
<span className="font-bold text-[11px] text-secondary">STUDENT: CHEN W.</span>
</div>
<div className="bg-primary text-on-primary p-3 rounded-2xl rounded-tr-none shadow-md">
<p className="text-body-md">I checked with the university registrar directly. They said they never received the scholarship addendum. I paid you for &apos;Premium Processing&apos;.</p>
</div>
</div>
{/* Admin Note */}
<div className="flex justify-center py-4">
<div className="bg-tertiary-fixed px-4 py-1.5 rounded-full flex items-center gap-2">
<span className="material-symbols-outlined text-[14px]">lock</span>
<span className="text-[11px] font-bold uppercase tracking-widest text-on-tertiary-fixed">Platform Note: File Check Success</span>
</div>
</div>
{/* Message Agency */}
<div className="flex flex-col items-start max-w-[85%]">
<div className="flex items-center gap-2 mb-1">
<span className="font-bold text-[11px] text-primary">AGENCY: MARCO R.</span>
<span className="text-[10px] text-on-surface-variant">10:45 AM</span>
</div>
<div className="bg-white p-3 rounded-2xl rounded-tl-none border border-surface-container shadow-sm">
<p className="text-body-md">We can re-upload, but this is a courtesy. The contract states no refunds for missed deadlines due to university backlog.</p>
</div>
</div>
</div>
{/* Chat Interaction */}
<div className="p-4 bg-white border-t border-surface-container flex gap-2">
<input className="flex-1 bg-surface-container-low border-none rounded-full px-4 py-2 font-body-md focus:ring-1 focus:ring-primary outline-none" placeholder="Send official admin message..." type="text"/>
<button className="w-10 h-10 bg-primary text-on-primary rounded-full flex items-center justify-center shadow-md">
<span className="material-symbols-outlined">send</span>
</button>
</div>
</div>
{/* Context & Actions Side-panel */}
<div className="md:col-span-5 p-6 space-y-6 bg-white overflow-y-auto">
<div className="space-y-4">
<h6 className="text-[12px] font-bold uppercase text-on-surface-variant tracking-widest">Evidence Ledger</h6>
<div className="space-y-2">
<div className="flex items-center justify-between p-3 bg-surface-container-low rounded-xl border border-outline-variant hover:bg-surface-container transition-colors cursor-pointer">
<div className="flex items-center gap-3">
<span className="material-symbols-outlined text-primary">picture_as_pdf</span>
<span className="text-[12px] font-medium truncate max-w-[120px]">payment_receipt.pdf</span>
</div>
<span className="material-symbols-outlined text-on-surface-variant text-[18px]">download</span>
</div>
<div className="flex items-center justify-between p-3 bg-surface-container-low rounded-xl border border-outline-variant hover:bg-surface-container transition-colors cursor-pointer">
<div className="flex items-center gap-3">
<span className="material-symbols-outlined text-secondary">image</span>
<span className="text-[12px] font-medium truncate max-w-[120px]">portal_screenshot.png</span>
</div>
<span className="material-symbols-outlined text-on-surface-variant text-[18px]">visibility</span>
</div>
</div>
</div>
<div className="h-[1px] bg-outline-variant"></div>
<div className="space-y-4">
<h6 className="text-[12px] font-bold uppercase text-on-surface-variant tracking-widest">Resolution Tools</h6>
<div className="grid grid-cols-1 gap-3">
<button className="w-full flex items-center justify-center gap-2 py-3 border-2 border-secondary text-secondary font-bold rounded-xl hover:bg-secondary-fixed transition-all text-label-md">
<span className="material-symbols-outlined">currency_exchange</span>
                                            Authorize Partial Refund
                                        </button>
<button className="w-full flex items-center justify-center gap-2 py-3 border-2 border-tertiary text-tertiary font-bold rounded-xl hover:bg-surface-container-high transition-all text-label-md">
<span className="material-symbols-outlined">gavel</span>
                                            Official Ruling (Fine)
                                        </button>
<button className="w-full flex items-center justify-center gap-2 py-3 bg-primary text-on-primary font-bold rounded-xl hover:bg-primary-container transition-all text-label-md shadow-lg">
<span className="material-symbols-outlined">check_circle</span>
                                            Close &amp; Archive Case
                                        </button>
</div>
</div>
<div className="p-4 bg-error-container rounded-2xl">
<div className="flex gap-2 items-start mb-2">
<span className="material-symbols-outlined text-error text-[20px]">warning</span>
<h6 className="text-[12px] font-bold text-on-error-container uppercase tracking-tight">Strike Warning</h6>
</div>
<p className="text-[11px] text-on-error-container">Closing this case against the agency will result in their 2nd strike this quarter. A 3rd strike results in automatic 30-day suspension.</p>
</div>
</div>
</div>
</div>
</div>
</div>
</section>
{/* Previous Discrepancies Table */}
<section className="bg-surface-container-lowest rounded-[32px] ambient-shadow border border-surface-container overflow-hidden">
<div className="px-8 py-6 border-b border-surface-container flex justify-between items-center">
<h4 className="font-headline-sm text-headline-sm text-primary">Resolution Archive</h4>
<div className="flex gap-2">
<span className="px-3 py-1 bg-surface-container text-on-surface-variant rounded-lg text-[12px]">All Time</span>
</div>
</div>
<div className="overflow-x-auto">
<table className="w-full text-left border-collapse">
<thead className="bg-surface-container-low text-on-surface-variant uppercase text-[11px] font-extrabold tracking-widest">
<tr>
<th className="px-8 py-4">Case ID</th>
<th className="px-8 py-4">Parties Involved</th>
<th className="px-8 py-4">Issue Type</th>
<th className="px-8 py-4">Resolved Date</th>
<th className="px-8 py-4">Outcome</th>
<th className="px-8 py-4">Arbiter</th>
</tr>
</thead>
<tbody className="divide-y divide-surface-container">
<tr className="hover:bg-surface transition-colors">
<td className="px-8 py-4 font-label-md text-primary">#DISP-9721</td>
<td className="px-8 py-4">
<div className="text-body-md font-medium">Liam Johnson</div>
<div className="text-[11px] text-on-surface-variant">Aura Edu Services</div>
</td>
<td className="px-8 py-4 text-body-md text-on-surface-variant">Refund Request</td>
<td className="px-8 py-4 text-body-md text-on-surface-variant">Oct 05, 2023</td>
<td className="px-8 py-4">
<span className="bg-secondary-fixed text-on-secondary-fixed-variant px-3 py-1 rounded-full text-[11px] font-bold uppercase">SETTLED</span>
</td>
<td className="px-8 py-4">
<div className="flex items-center gap-2">
<div className="w-5 h-5 rounded-full bg-surface-container overflow-hidden">
<img className="w-full h-full object-cover" alt="A small circular avatar of a professional female administrator with short dark hair and silver earrings, smiling softly, in a professional high-key office environment." src="https://lh3.googleusercontent.com/aida-public/AB6AXuAGcLKXiLaaeD45kxfd4hDB_RMb1Os_Ct5OEld6LwNHXq0ZZKVn_TEQcLn_q--5M-A21fyMLTbXJgx1q3qBpF6rezlSF5qQ2doqBwYS-e02RnjRLI1vueu_hx9YFPxaCWF4AixVc66Hc9Y2qdfmAVI5yyXEGYEfxNY7kBF9z_wzw_rbU1oVPJUq0BpVl687xHYV6KMPHIXlK4X-VRWu8MpYZNs9NeO1su-AJU8Guf53Gk6IBgzM5PM-"/>
</div>
<span className="text-label-md">S. Rivera</span>
</div>
</td>
</tr>
<tr className="hover:bg-surface transition-colors">
<td className="px-8 py-4 font-label-md text-primary">#DISP-9650</td>
<td className="px-8 py-4">
<div className="text-body-md font-medium">Sophia Wang</div>
<div className="text-[11px] text-on-surface-variant">Direct Admission Inc.</div>
</td>
<td className="px-8 py-4 text-body-md text-on-surface-variant">Credential Fraud</td>
<td className="px-8 py-4 text-body-md text-on-surface-variant">Sep 28, 2023</td>
<td className="px-8 py-4">
<span className="bg-error-container text-on-error-container px-3 py-1 rounded-full text-[11px] font-bold uppercase">REJECTED</span>
</td>
<td className="px-8 py-4">
<div className="flex items-center gap-2">
<div className="w-5 h-5 rounded-full bg-surface-container"></div>
<span className="text-label-md">J. Thorne</span>
</div>
</td>
</tr>
</tbody>
</table>
</div>
<div className="p-4 flex justify-center">
<button className="text-primary font-bold text-label-md hover:underline decoration-2 underline-offset-4">View All 1,402 Records</button>
</div>
</section>
</main>
{/* Success Feedback Notification (Hidden by default) */}
<div className="fixed bottom-8 right-8 bg-inverse-surface text-inverse-on-surface px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-4 translate-y-24 opacity-0 transition-all duration-500 z-[100]" id="toast">
<span className="material-symbols-outlined text-secondary-container" style={{fontVariationSettings: "'FILL' 1"}}>check_circle</span>
<div>
<p className="font-bold text-label-md">Case Resolved Successfully</p>
<p className="text-[11px] opacity-80">Parties have been notified of the final ruling.</p>
</div>
</div>


</>
  );
}
