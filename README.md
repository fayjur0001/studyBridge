# StudyBridge

Full-stack study-abroad platform — students, agencies, and admins.

## Structure

- `client/` — Next.js frontend
- `server/` — Express + Drizzle ORM + PostgreSQL backend

## Setup

### Server
```bash
cd server
npm install
cp .env.example .env   # fill in DATABASE_URL and JWT secrets
npm run db:migrate
npm run db:seed        # optional demo accounts
npm run dev             # http://localhost:4000
```

### Client
```bash
cd client
npm install
cp .env.local.example .env.local   # set NEXT_PUBLIC_API_URL
npm run dev             # http://localhost:3000
```

Demo accounts (after `npm run db:seed`, password `Password123!`):
`student@example.com`, `agency@example.com`, `admin@example.com`
