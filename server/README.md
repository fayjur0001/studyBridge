# StudyBridge Backend

Node.js + Express + Drizzle ORM + PostgreSQL backend for the StudyBridge
Next.js frontend.

## Setup

```bash
npm install
cp .env.example .env   # then fill in DATABASE_URL and JWT secrets
npm run db:migrate     # applies src/db/migrations/*.sql to your database
npm run dev            # starts the API on http://localhost:4000
```

## What's implemented (Phase 1)

- Project scaffold (TypeScript, Express, Drizzle, security middleware)
- Full DB schema (`src/db/schema.ts`) covering: users, student/agency
  profiles, universities, programs, scholarships, applications, documents,
  saved items, conversations/messages, notifications, refresh tokens
- Auth module: register, login, refresh (rotating, DB-backed refresh
  tokens in an httpOnly cookie), logout, `GET /api/auth/me`
- Role-based access middleware (`requireAuth`, `requireRole`)
- Centralized error handling + Zod validation

## What's implemented (Phase 2)

- `GET /api/universities` — search, country, region, maxRanking, sort, pagination
- `GET /api/universities/:id` — detail + its programs
- `GET /api/programs` — filter by universityId, field, degreeLevel, search
- `GET /api/programs/:id`
- `GET /api/scholarships` — search, category, universityId, upcomingOnly, pagination
- `GET /api/scholarships/:id`
- Admin-only `POST` / `PATCH` / `DELETE` for all three (matches the
  `admin/universities` and `admin/scholarships` management pages)
- Added `region` (universities) and `category` (scholarships) columns to
  support the filter UI already built on the frontend

## What's implemented (Phase 3)

- `GET/PATCH /api/student/me` — student profile (user + student_profiles)
- `GET /api/applications` — student's applications with program/university joined
- `GET /api/applications/stats` — dashboard counters (submitted, under review, accepted, action needed) matching the `student/applications` stat cards
- `GET/POST/PATCH /api/applications/:id`, `POST /:id/submit`, `POST /:id/withdraw` — draft → submit → track lifecycle
- `GET/POST /api/documents`, `DELETE /api/documents/:id` — local-disk upload via multer (`uploads/documents/<userId>/...`), 10MB limit, PDF/JPG/PNG/WEBP/DOC/DOCX only
- `PATCH /api/documents/:id/review` — approve/reject, restricted to agency/admin (ready for Phase 4/5)
- `GET/POST /api/saved-items`, `DELETE /api/saved-items/:itemType/:itemId` — bookmark universities/programs/scholarships

## What's implemented (Phase 4)

- `GET/PATCH /api/agency/me` — agency profile (user + agency_profiles)
- `GET /api/agency/dashboard/stats` — counters for the agency dashboard/analytics cards
- `GET /api/agency/students` — students currently linked to this agency
- `POST /api/agency/students/link` — link an existing student account by email
- `GET /api/agency/students/:id` — student detail + their applications
- `DELETE /api/agency/students/:id` — unlink a student
- `GET /api/agency/applications` — applications belonging to this agency's students, joined with program/university/student
- `PATCH /api/agency/applications/:id/status` — move status (under_review / documents_requested / accepted / rejected), scoped so an agency can only touch its own students' applications

## What's implemented (Phase 5)

- `GET /api/admin/overview`, `GET /api/admin/reports` — platform-wide stats (users by role/suspended, agency verification queue, applications by status, catalog counts) for the `admin/overview`, `admin/analytics`, `admin/reports` pages
- `GET /api/admin/users`, `GET /api/admin/users/:id` — search/filter by role/active status, pagination
- `PATCH /api/admin/users/:id/active` — suspend/reactivate an account (matches the Active/Suspended toggle on `admin/users`); an admin can't suspend themself
- `GET /api/admin/agencies` — agency directory with verification status
- `PATCH /api/admin/agencies/:id/verify` — approve/revoke agency verification (`admin/agencies` pending-review queue)
- University/scholarship content management (`admin/universities`, `admin/scholarships`) already has admin-only create/update/delete from Phase 2 — no new routes needed there

**Note:** `admin/content` (generic site content/CMS pages) and `admin/settings` weren't backed — they read as low-priority/static in the frontend. Flag if you want those built too.

## What's implemented (Phase 6)

- `GET /api/conversations` — inbox: each conversation's other participant(s), last message, unread count
- `POST /api/conversations` — start a new conversation with a recipient + first message
- `GET /api/conversations/:id/messages` — full thread, marks it read for the caller
- `POST /api/conversations/:id/messages` — send a message (participant-only, checked via `assertParticipant`)

## What's implemented (Phase 8)

- `src/db/seed.ts` (`npm run db:seed`) — creates one demo account per role (`student@example.com`, `agency@example.com`, `admin@example.com`, password `Password123!`), 2 universities, 2 programs, 2 scholarships, so the wired frontend has real data to show immediately after setup

## Status

All 8 phases are done. Frontend wiring (Phase 7) covers every core flow —
see `studyBridge-main/PHASE7-PROGRESS.md` for the handful of remaining
settings/analytics pages that are still on the original mock data (none of
them have a missing backend endpoint; they're either pure preference screens
or duplicate stats already shown on wired dashboards). What's left is manual
end-to-end QA once both apps are run together.
