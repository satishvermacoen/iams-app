# IAMS App — Academic Management System

IAMS is a role-based web application for managing key academic workflows:

- Admissions
- Course registrations (enrollments)
- Attendance tracking (students and faculty)
- Examination management (exams and results)

Built with Next.js App Router, React, Tailwind CSS, and MongoDB (via Mongoose). It exposes a set of REST-like API routes under `src/app/api` and ships with separate dashboards for Admin, Faculty, and Students.

## Tech Stack

- Next.js 15 (App Router) + React 19
- Tailwind CSS 4 + Radix/shadcn-inspired UI components (`src/components/ui`)
- TanStack Query for data fetching/caching (`@tanstack/react-query`)
- MongoDB via Mongoose (`src/models`, `src/lib/db.js`)
- JWT-based auth helpers (`src/lib/auth*.js`)

## Quick Start

Prerequisites:

- Node.js ≥ 18.18
- An accessible MongoDB connection string

Install and run (development uses Turbopack):

```bash
npm install
npm run dev
```

Build and start production:

```bash
npm run build
npm start
```

## Environment Variables

Use the provided `sample.env.local` as a template. Create a `.env.local` file in the project root and replace placeholder values with your own secrets. Do NOT commit real secrets.

Common variables:

- `PORT`: Port for the Next.js server (e.g., `3030`)
- `MONGODB_URI`: MongoDB connection string
- `JWT_SECRET`: Secret for signing/verifying JWTs (if used by auth helpers)
- `ACCESS_TOKEN_SECRET`, `REFRESH_TOKEN_SECRET`: Secrets for short/long-lived tokens
- `ACCESS_TOKEN_EXPIRY`, `REFRESH_TOKEN_EXPIRY`: Token lifetimes (e.g., `1d`, `10d`)
- `EMAIL_SERVICE`: SMTP service hostname (optional, if emailing is enabled)

Example setup:

```bash
cp sample.env.local .env.local
# edit .env.local and set your own values
```

## Project Structure (high level)

```
src/
	app/
		api/                 # Server routes (Next.js Route Handlers)
		dashboard/
			admin/             # Admin dashboard pages
			faculty/           # Faculty dashboard pages
			student/           # Student dashboard pages
		admissions/          # Public admissions flow pages
		login/, signup/      # Auth pages
	components/ui/         # Reusable UI primitives (Buttons, Cards, Tabs, etc.)
	hooks/                 # Data hooks (React Query)
	lib/                   # API client, auth, db, utilities
	models/                # Mongoose models (User, Student, Course, ...)
```

## Role Dashboards & Routes

Admin:

- `/dashboard/admin` — overview, quick stats, and shortcuts
- `/dashboard/admin/admissions` — manage applications
- `/dashboard/admin/students` — student overview
- `/dashboard/admin/offerings` — course offerings
- `/dashboard/admin/analytics` — analytics overview
- `/dashboard/admin/users/create` — create admin/faculty/student users
- `/dashboard/admin/admissions/[id]/create-student` — create a student from an application

Faculty:

- `/dashboard/faculty` — overview with tabs (courses, attendance, exams)
- `/dashboard/faculty/attendance/[offeringId]` — attendance by offering
- `/dashboard/faculty/offering-exams/[offeringId]` — exams for an offering
- `/dashboard/faculty/timetable` — canonical teaching timetable
- `/dashboard/faculty/my-timetable` — redirects to `/dashboard/faculty/timetable`

Student:

- `/dashboard/student` — overview with tabs (courses, attendance, exams)
- `/dashboard/student/attendance` — attendance view
- `/dashboard/student/enrollments` — current enrollments
- `/dashboard/student/exams` — exams (upcoming/history)
- `/dashboard/student/results` — results view
- `/dashboard/student/timetable` — canonical personal timetable
- `/dashboard/student/my-timetable` — redirects to `/dashboard/student/timetable`

Admissions (public flow):

- `/admissions/apply` — application form
- `/admissions/[id]/create-student` — non-admin flow exists but the app uses the admin-scoped route above as primary

## API Endpoints (selected)

Implemented using Next.js Route Handlers under `src/app/api` (HTTP methods vary by route):

- `/api/admissions`, `/api/admissions/[id]`, `/api/admissions/[id]/create-student`
- `/api/courses`, `/api/course-offerings`, `/api/course-offerings/[id]`
- `/api/enrollments`, `/api/enrollments/[id]`, `/api/enrollments/by-offering`
- `/api/exams`, `/api/exams/results`
- `/api/attendance/sessions`, `/api/attendance/records`
- `/api/faculty-exams`, `/api/faculty-exam-results`
- `/api/me`, `/api/me/admin`, `/api/me/faculty`, `/api/me/student`
- `/api/programs`, `/api/semesters`, `/api/students`, `/api/faculty`

See the source files for exact method support and payload shapes.

## Conventions

- App Router pages live in `src/app/.../page.jsx`.
- API routes live in `src/app/api/.../route.js`.
- Client components declare `"use client"` at the top of the file.
- UI components reside in `src/components/ui` (Radix/shadcn-inspired).
- Data fetching via hooks in `src/hooks` using React Query.
- MongoDB models in `src/models`; DB connection helper in `src/lib/db.js`.

## Development Tips

- Set `PORT` in `.env.local` if you need a custom dev port.
- Dev server uses Turbopack by default (`--turbopack`). You can remove the flag locally if you prefer the classic compiler.
- Keep secrets out of version control. Use `.env.local` for local development.

## Scripts

From `package.json`:

- `npm run dev` — start the dev server (Turbopack)
- `npm run build` — build for production (Turbopack)
- `npm start` — start the production server

## Roadmap (suggested)

- Wire remaining tables/forms to `/api/*` routes
- Add charts for analytics (Recharts already included)
- Enhance authorization checks on server routes
- Add e2e and component tests

## Troubleshooting

- DB connection issues: verify `MONGODB_URI` and network access. The server will fail to handle DB-dependent requests without a working connection.
- Auth errors: ensure token secrets and expiries are set and consistent.
- Port in use: change `PORT` or stop the conflicting process.

---

If you need help navigating or wiring new pages, see the route lists above or check the `src/app/dashboard/*` folders for working examples.

admissions,
course registrations, 
attendance tracking, 
examination management