## IAMS App – Project Overview

This document summarizes the current folder structure and high‑level status of the project so it is easier to understand and onboard.

## Folder Structure

Top‑level:

- `app/` (under `.next/`): Next.js build output for the App Router (generated)
- `public/`: Static assets served directly by Next.js
- `src/`: Main application source code
	- `app/`: Next.js App Router pages, layouts and API routes
		- `layout.jsx`: Root layout for the whole app
		- `page.jsx`: Landing page
		- `globals.css`: Global styles
		- `providers.jsx`: Global React/Next providers (e.g. auth, theme)
		- `login/`, `signup/`: Authentication pages
		- `dashboard/`: Role‑based dashboards
			- `layout.jsx`: Dashboard shell layout (navigation, header, etc.)
			- `admin/`: Admin dashboard pages
			- `faculty/`: Faculty dashboard pages
			- `student/`: Student dashboard pages
		- `admissions/`: Admissions pages (apply, create student, etc.)
		- `api/`: Route handlers (server‑side logic)
			- `admissions/`, `attendance/`, `auth/`, `course-offerings/`, `enrollments/`, `exams/`, `faculty-attendance/`, `me/`, `programs/`, `students/`
			- Each folder contains `route.js` files implementing REST‑style endpoints
	- `components/`: Reusable UI components
		- `ui/`: Design‑system primitives (`button.jsx`, `card.jsx`, `input.jsx`, etc.)
	- `hooks/`: Custom React hooks that talk to the API and encapsulate data loading
		- `useAdminDashboard.js`, `useFacultyDashboard.js`, `useStudentDashboard.js`, etc.
	- `lib/`: Shared libraries and helpers
		- `api.js`: Client‑side API helper functions
		- `auth-client.js`: Frontend auth helpers
		- `auth.js`: Server‑side auth utilities (e.g. JWT, session)
		- `db.js`: Database connection and initialization
		- `utils.js`: Misc utility functions
	- `models/`: Database models / schemas (likely Mongoose or similar)
		- `User.js`, `Student.js`, `Faculty.js`, `Course.js`, `Program.js`, etc.

Other important files:

- `.env.local`: Local environment variables (DB connection, secrets, etc.)
- `next.config.mjs`: Next.js configuration
- `jsconfig.json`: Path aliases and JS tooling configuration
- `postcss.config.mjs`: PostCSS config for Tailwind/CSS processing
- `components.json`: UI library configuration (e.g. shadcn‑ui)
- `package.json`: NPM scripts and dependencies

## Current Project Status (High Level)

- **Authentication:**
	- API routes for `auth/login` and `auth/signup` exist.
	- Corresponding `login` and `signup` pages are set up in `src/app`.
- **Dashboards:**
	- Admin, faculty and student dashboard pages are created.
	- Custom hooks (`useAdminDashboard`, `useFacultyDashboard`, `useStudentDashboard`) fetch and format dashboard data.
- **Admissions:**
	- Admissions flows implemented via `src/app/admissions` pages.
	- Backend routes under `src/app/api/admissions` manage applications and student creation.
- **Academic Structure & Enrollment:**
	- Models exist for programs, courses, offerings, semesters, students, enrollments and exams.
	- API routes for `course-offerings`, `enrollments`, `exams`, `exams/results`, and `students` are present.
- **Attendance:**
	- Separate attendance modules for students and faculty (`attendance`, `faculty-attendance`).
	- Both sessions and records routes exist for each.
- **User & Roles:**
	- Models for `User`, `Role`, `Faculty`, `Student` exist.
	- `me` API routes separated by role (`admin`, `faculty`, `student`).
- **Infrastructure:**
	- Database layer defined in `src/lib/db.js` and `src/models/*`.
	- API client wrapper in `src/lib/api.js` used by hooks and pages.

## How to Run (local)

From the `iams-app` folder:

```bash
npm install
npm run dev
```

Then open `http://localhost:3000` in your browser.

## Next Steps / TODO (suggested)

- Document each API route in a separate `docs/` or `API.md` file.
- Add high‑level diagrams for data model and user flows.
- Ensure env variables needed for local dev are listed in this README.



<!-- 
Can you give me current status of project and what thing is next to create, list in details -->