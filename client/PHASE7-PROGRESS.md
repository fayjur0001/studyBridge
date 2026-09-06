# Phase 7 — Frontend ↔ Backend Wiring Progress

Backend base URL comes from `NEXT_PUBLIC_API_URL` (see `.env.local.example`).
Run the backend (`studybridge-backend`) first, then `npm run dev` here.

## Infrastructure (done)

- `src/lib/api.ts` — fetch client, in-memory access token, auto-refresh on 401
- `src/lib/auth-context.tsx` — `AuthProvider` / `useAuth()`, mounted in `layout.tsx`
- `src/lib/types.ts` — shared types matching backend response shapes

## Wired to the real API

- `login/LoginForm.tsx` — real `/api/auth/login`
- `register/RegisterForm.tsx` — real `/api/auth/register`
- `universities/page.tsx` — real `/api/universities` (search/region/ranking filters, load-more pagination); `src/components/universities/UniversityCard.tsx` extracted for reuse
- `student/dashboard/page.tsx` — real user, application stats, application timeline
- `student/applications/page.tsx` — real applications + stats table; `src/components/applications/ApplicationStatusBadge.tsx` extracted for reuse
- `agency/students/page.tsx` — real `/api/agency/students` list + link-student-by-email form; `src/components/agency/AgencyStudentCard.tsx` extracted for reuse
- `agency/dashboard/page.tsx` — real user + Total Students/Active Applications stat cards (Total Revenue/Success Rate left static — no backend concept for those)
- `agency/applications/page.tsx` — real `/api/agency/applications` table with inline status-change dropdown wired to `PATCH /api/agency/applications/:id/status`
- `admin/overview/page.tsx` — real Total Active Users + Pending Agency Approvals metrics (Monthly Revenue/Platform Success Rate left static — no backend concept for those)
- `admin/users/page.tsx` — real `/api/admin/users` table with role/status filters + suspend/activate action wired to `PATCH /api/admin/users/:id/active`
- `admin/agencies/page.tsx` — real `/api/admin/agencies` list + approve/revoke-verification detail panel; simplified out the "uploaded documents / verification checklist" mock sections since agencies don't have a document-upload concept in the backend
- `student/documents/page.tsx` — real `/api/documents` upload (multipart, type selector) + list + delete; category summary cards now group dynamically by document type instead of 4 hardcoded categories
- `student/saved-items/page.tsx` — real `/api/saved-items`, resolves each saved id against `/api/universities/:id` or `/api/scholarships/:id`, remove button wired to `DELETE /api/saved-items/:itemType/:itemId`; dropped fields with no backend equivalent (match %, employability stats, avg. salary)
- `student/profile/page.tsx` — real `/api/student/me` get/update (name, phone, bio, target countries, field of study); "Academic History"/"Test Scores" tabs left static — no backend model for a multi-entry education history or test scores list (schema only has a single currentEducationLevel + gpa field)
- `agency/students/[id]/page.tsx` — rebuilt (simplified) against real `/api/agency/students/:id`: student info + their applications list. Dropped the fictional "Tier 1 Scholar" badge, academic-history timeline, and per-application progress stepper — none of that has a backend model
- `agency/profile/page.tsx` — real `/api/agency/me` get/update (company name, website, address, description) via an inline edit panel; verified badge reflects real `isVerified`. Dropped "Offered Services" and "Team Members" sections — no backend model for either
- `student/applications/[id]/page.tsx` — rebuilt (simplified) against real `/api/applications/:id`: header, submit/withdraw actions, real attached-documents list. Dropped the fictional "Application Journey" timeline (interview scheduling, video call), advisor quote card, and interview-tips/alumni-connect widgets — none of that has a backend model
- `src/components/messaging/MessagingView.tsx` — shared conversation-list + thread component wired to real `/api/conversations`; used by both `student/messaging/page.tsx` and `agency/messages/page.tsx` (thin wrappers with role-specific sidebar/header)
- `admin/universities/page.tsx`, `admin/scholarships/page.tsx` — rebuilt as functional CRUD tables (add/edit/delete) against the real APIs from Phase 2. Dropped fictional "Tuition Range"/"Partnership Tier"/"Programs count" columns and the marketing bento stats — none of that maps to the schema (tuition lives on programs, not universities)
- `student/applications/[id]/page.tsx` — rebuilt (simplified) against real `/api/applications/:id`: header, submit/withdraw actions, real attached-documents list. Dropped the fictional "Application Journey" timeline (interview scheduling, video call), advisor quote card, and interview-tips/alumni-connect widgets
- `universities/[id]/page.tsx` — real name/location/ranking/description/programs list; "Save University" wired to `/api/saved-items`. Dropped Acceptance Rate/Intl Students stats, MatchScore™ card, and fake advisor avatars (no backend model for any of them); Admission Requirements and Campus Life gallery left as static marketing content
- `scholarships/page.tsx`, `scholarships/[id]/page.tsx` — real listing (category filter, load-more) and detail (amount, deadline, eligibility, description, save, apply link). Dropped the "Applicants/Success Rate" stats, Match% gradient card, and structured "Coverage Details"/"Application Requirements" bento grids — schema only has free-text `eligibility`/`description` fields

## Not yet wired (still on the original mock data — safe, just not connected)

- `student/settings`, `student/ai-recommendations`, `student/ai-tools` — settings/AI-feature pages with no corresponding backend endpoints built
- `agency/programs`, `agency/analytics`, `agency/settings`
- `admin/analytics`, `admin/reports`, `admin/content`, `admin/settings`

These remaining pages are either pure settings/preference screens (no backend model to wire to) or duplicate data already shown elsewhere (agency/admin analytics vs. the dashboard/overview stats already wired). The core user flows — auth, browse universities/scholarships, apply, upload documents, agency management, admin management, messaging — are fully wired end to end.

The backend already has working endpoints for nearly all of the above (see
`studybridge-backend/README.md` for the full list) — what's left is purely
frontend wiring, following the same pattern used in the pages above:
1. Add `"use client"` if not already a client component
2. Fetch with `api.get/post/patch/delete` from `@/lib/api` in a `useEffect`
3. Replace the hardcoded array/object with the fetched state, keeping the
   existing JSX/Tailwind markup — turn repeated hardcoded blocks into a
   `.map()` over one card/row template
4. Drop or simplify decorative numbers that have no backend equivalent
   (e.g. "Eligibility Score", "MatchScore %") rather than inventing fake data
