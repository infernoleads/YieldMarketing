# Yield Transfers

Telemarketing & live-transfer CRM for insurance agencies. Agencies book a plan, get dedicated telemarketers who submit and warm-transfer leads, and producers work those leads through a pipeline — with follow-up tasks, team messaging, and performance reports.

Rebuilt as a clean, owned full-stack app: **React + Vite + Tailwind**, **Node + Express**, **PostgreSQL + Prisma**, **JWT auth**, deployable to **Render**.

---

## 🚀 Quick deploy (the easy way)

You only need two steps — no local setup, no database to install, no config.

**1. Put this project on GitHub.**
Create a new repo (e.g. `yield-transfers`) and upload these files. Easiest options:
- **GitHub website:** open your empty repo → **Add file → Upload files** → drag in everything from this folder → **Commit**.
- **Or command line:** `git init && git add . && git commit -m "Yield Transfers" && git branch -M main && git remote add origin <your-repo-url> && git push -u origin main`

**2. Deploy on Render.**
- Go to **[render.com](https://render.com)** → **New → Blueprint** → pick your repo → **Apply**.
- Render reads `render.yaml` and builds **one web service + a database**. The database and a security key are wired automatically.
- Wait for the build to finish, open the URL, and sign in with a demo account below. **Done.**

> Prefer a button? Once your repo is up, this link deploys it (replace `YOUR-USERNAME`):
> **`https://render.com/deploy?repo=https://github.com/YOUR-USERNAME/yield-transfers`**

That's the whole thing. The app runs fully working out of the box, and **your booking calendar is already built in** — it appears on the Book an appointment page automatically.

**To turn on email** (appointment alerts, confirmations, invites, report delivery), add one value in Render: your Gmail **App Password**. Everything else (sender address `info@yieldtransfers.com`, alert recipient, calendar) is pre-filled. See [Connecting Gmail](#connecting-gmail-email-sending) for the 60-second App Password steps.

---


## Table of contents
1. [Tech stack](#tech-stack)
2. [Project structure](#project-structure)
3. [Roles & permissions](#roles--permissions)
4. [Run locally](#run-locally)
5. [Seed accounts](#seed-accounts)
6. [Environment variables](#environment-variables)
7. [Push to GitHub](#push-to-github)
8. [Deploy to Render](#deploy-to-render)
9. [API reference](#api-reference)
10. [Production checklist](#what-still-needs-connecting-for-production)

---

## Tech stack
- **Frontend:** React 18, Vite, Tailwind CSS, React Router, Recharts, lucide-react
- **Backend:** Node.js, Express, JWT (`jsonwebtoken`), `bcryptjs`, Gmail email via `nodemailer`
- **Database:** PostgreSQL via Prisma ORM
- **Deploy:** Render (single web service serving the API + built client), managed Postgres

## Project structure
```
yield-transfers/
├── client/                 # React + Vite frontend
│   └── src/
│       ├── api/            # Reusable API client (replaces the Base44 SDK)
│       ├── components/     # UI primitives + feature panels
│       ├── pages/          # Landing, Login, dashboards, lead detail…
│       ├── layouts/        # App shell (sidebar)
│       ├── lib/            # Auth context + utils
│       └── hooks/
├── server/                 # Express API
│   └── src/
│       ├── routes/         # Route definitions
│       ├── controllers/    # Request handlers
│       ├── middleware/     # protect / authorize / error handling
│       ├── services/       # prisma client, token, access-scope
│       └── index.js        # Server entry (serves client in prod)
├── prisma/
│   ├── schema.prisma       # Data model
│   └── seed.js             # Seed users + sample data
├── render.yaml             # Render blueprint
├── .env.example
└── package.json            # Workspace scripts (client + server)
```

## Roles & permissions
| Role | Can do |
|------|--------|
| **super_admin** | Everything: all agencies, users, leads, appointment requests, reports |
| **agency_owner** | Manage their agency, team, telemarketer assignments, leads, reports, scheduled reports |
| **producer** | See all agency leads, work assigned follow-up tasks, view reports, team chat |
| **telemarketer** | Submit leads, see their own leads, team chat |
| **public** | Landing page + appointment request only |

---

## Run locally

### Prerequisites
- **Node.js 18+**
- A **PostgreSQL** database (local install, Docker, or a free hosted one like Render/Neon/Supabase)

### 1. Install
```bash
git clone <your-repo-url> yield-transfers
cd yield-transfers
npm install          # installs client + server via workspaces, runs prisma generate
```

### 2. Configure environment
```bash
cp .env.example .env
```
Edit `.env` and set `DATABASE_URL` to point at your Postgres instance, and set a `JWT_SECRET`.

> Quick local Postgres with Docker:
> ```bash
> docker run --name yt-postgres -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=yield_transfers -p 5432:5432 -d postgres:16
> ```
> Then use: `DATABASE_URL="postgresql://postgres:postgres@localhost:5432/yield_transfers?schema=public"`

### 3. Create the schema & seed data
```bash
npm run setup        # prisma generate + db push (creates tables) + seed
```
(Or run the steps individually: `npm run db:push` then `npm run db:seed`. Prefer versioned migrations? Use `npm run db:migrate` instead of `db:push`.)

### 4. Start everything with one command
```bash
npm run dev
```
- API → http://localhost:5000
- Web → http://localhost:5173  (proxies `/api` to the server automatically)

Open **http://localhost:5173** and sign in with a seed account below.

---

## Seed accounts
All use the password **`password123`**.

| Role | Email |
|------|-------|
| Super Admin | `superadmin@yieldtransfers.com` |
| Agency Owner | `owner@yieldtransfers.com` |
| Producer | `producer@yieldtransfers.com` |
| Telemarketer | `telemarketer@yieldtransfers.com` |

The login screen has one-tap buttons to fill these in.

---

## Environment variables
| Variable | Where | Description |
|----------|-------|-------------|
| `DATABASE_URL` | server | PostgreSQL connection string |
| `JWT_SECRET` | server | Secret for signing JWTs (use a long random string) |
| `JWT_EXPIRES_IN` | server | Token lifetime, e.g. `7d` |
| `PORT` | server | API port (Render sets this automatically) |
| `NODE_ENV` | server | `development` or `production` |
| `CLIENT_URL` | server | Allowed CORS origin(s), comma-separated |
| `APP_URL` | server | Public app URL, used for links inside emails |
| `GMAIL_USER` | server | Your Gmail address (email sender) |
| `GMAIL_APP_PASSWORD` | server | Google **App Password** (16 chars, no spaces) |
| `ADMIN_EMAIL` | server | Where new-appointment / signup alerts are sent (defaults to `GMAIL_USER`) |
| `VITE_API_URL` | client | API base URL; keep `/api` for same-origin (prod + dev proxy) |
| `VITE_BOOKING_CALENDAR_URL` | client | Your booking calendar embed URL (shown on the appointment page) |

See `.env.example` for a ready-to-copy template.

---

## Connecting Gmail (email sending)

The app sends email from **info@yieldtransfers.com** (already configured). You just need to give it a Google **App Password** — Google's secure way to let an app send mail without using your real password.

1. Sign in to the `info@yieldtransfers.com` Google account.
2. Turn on **2-Step Verification**: https://myaccount.google.com/security
3. Go to **App passwords**: https://myaccount.google.com/apppasswords
4. Create one named "Yield Transfers" — Google shows a 16-character code.
5. In Render: your service → **Environment** → set **`GMAIL_APP_PASSWORD`** to that code (remove the spaces) → save. The service redeploys and email is live.

> Locally, put the same value in `.env` as `GMAIL_APP_PASSWORD`.

**What gets sent automatically:**
- New appointment request → alert to `info@yieldtransfers.com` **and** a confirmation to the prospect
- New account signup → alert to `info@yieldtransfers.com`
- Team invite → the invited person gets their login + temporary password
- Scheduled reports → delivered to their recipient list on schedule (and via **Send now**)

If the App Password isn't set yet, the app still runs — it just logs "email skipped" instead of sending, so nothing breaks.

---

## Adding your booking calendar

Your Google booking calendar (`https://calendar.app.google/XJZhDDoikmXdwb56A`) is **already built into the app** — it shows on the **Book an appointment** page with no setup. If Google ever blocks it from displaying inline, a prominent "Open calendar" button on that page opens it in a new tab so booking always works.

To change it later, set `VITE_BOOKING_CALENDAR_URL` (in Render or `.env`) to a different link:
- **Google Calendar Appointment Schedule:** the share link (`https://calendar.app.google/…`) or the embed URL from **Share → Embed**.
- **Calendly:** your event link, e.g. `https://calendly.com/your-handle/intro-call`.

`VITE_*` variables are read at **build time**, so after changing it on Render the service rebuilds automatically; locally, restart `npm run dev`.

---

## Scheduled report delivery

Scheduled reports are stored per user and delivered automatically **by the web service itself** — there's no separate cron job to set up or pay for.
- **Automatic:** the app checks hourly (and shortly after each startup) and emails any report that's due, based on its frequency + send time. Just add your Gmail credentials and create a schedule.
- **On demand:** the **Send now** button on each scheduled report emails it immediately — handy for testing your Gmail setup.

> On Render's free tier the web service sleeps after inactivity, so automatic sends fire whenever the app is next awake. For guaranteed on-the-minute delivery, upgrade the service to always-on, or run `npm run reports:send` from an external scheduler. **Send now** always works regardless.

---

## Push to GitHub
```bash
cd yield-transfers
git init
git add .
git commit -m "Initial commit: Yield Transfers"
git branch -M main
git remote add origin https://github.com/<you>/yield-transfers.git
git push -u origin main
```
`.env` is gitignored — your secrets won't be committed.

---

## Deploy to Render

The repo ships with a `render.yaml` **Blueprint** that provisions the web service and a PostgreSQL database together.

1. Push the repo to GitHub (above).
2. In Render: **New → Blueprint**, and select your repo.
3. Render reads `render.yaml` and creates:
   - **yield-transfers-db** — a managed PostgreSQL database
   - **yield-transfers** — a Node web service
4. `JWT_SECRET` is auto-generated; `DATABASE_URL` is wired from the database automatically. Confirm and deploy.

On deploy, the build runs:
```
npm install → prisma generate → prisma db push → seed → build client
```
and the service starts with `npm run start -w server`, which serves the API **and** the built React app from one URL.

**Prefer manual setup (no blueprint)?**
- Create a PostgreSQL instance in Render, copy its **Internal Connection String**.
- Create a **Web Service** from the repo with:
  - Build: `npm install && npx prisma generate && npx prisma db push && npm run db:seed && npm run build`
  - Start: `npm run start -w server`
  - Env vars: `NODE_ENV=production`, `JWT_SECRET=<random>`, `JWT_EXPIRES_IN=7d`, `DATABASE_URL=<your connection string>`, plus `GMAIL_USER`, `GMAIL_APP_PASSWORD`, `ADMIN_EMAIL`, `APP_URL=<your Render URL>`, and `VITE_BOOKING_CALENDAR_URL=<your calendar embed>`
  - Health check path: `/api/health`

---

## API reference
All routes are prefixed with `/api`. Protected routes require `Authorization: Bearer <token>`.

**Auth** — `POST /auth/register`, `POST /auth/login`, `GET /auth/me`
**Agencies** — `GET /agencies`, `POST /agencies`, `GET /agencies/:id`, `PATCH /agencies/:id`
**Users** — `GET /users`, `POST /users/invite`, `PATCH /users/:id`, `DELETE /users/:id`
**Leads** — `GET /leads`, `POST /leads`, `GET /leads/:id`, `PATCH /leads/:id`, `DELETE /leads/:id`
**Tasks** — `GET /tasks`, `POST /tasks`, `PATCH /tasks/:id`, `DELETE /tasks/:id`
**Appointments** — `POST /appointments` (public), `GET /appointments`, `PATCH /appointments/:id`
**Assignments** — `GET /assignments`, `POST /assignments`, `PATCH /assignments/:id`
**Messages** — `GET /messages?conversationId=…`, `POST /messages`
**Reports** — `GET /reports/dashboard`, `GET /reports/agency/:id`, `GET/POST /reports/scheduled`, `DELETE /reports/scheduled/:id`

---

## What still needs connecting for production

The app is fully functional — **Gmail email and calendar booking are wired in.** A few optional integrations remain, left as clean extension points:

1. **File attachments in messaging.** The `Message` model has `fileUrl/fileName/fileType` fields, but there's no upload pipeline. Add object storage (S3, Cloudflare R2) and a signed-upload endpoint.
2. **Password reset & email verification.** Registration and invites work (invites email a temp password), but there's no self-serve "forgot password" flow yet. The Gmail service is already in place to send those emails — just add the reset-token endpoints.
3. **Real-time messaging.** Chat currently polls every 5 seconds. Swap in WebSockets (e.g. Socket.IO) for instant delivery and presence.
4. **Rate limiting & hardening.** Add `express-rate-limit`, `helmet`, and request validation (e.g. `zod`) before heavy production traffic.
5. **Payments.** Landing-page pricing is display-only. Integrate Stripe if you want self-serve checkout.
6. **Backups & monitoring.** Enable automated Postgres backups and add error/uptime monitoring (Sentry, Render metrics).

**Already connected:** JWT auth · role-based access · PostgreSQL persistence · Gmail notifications (appointments, signups, invites) · scheduled report delivery (cron + on-demand) · embedded booking calendar.

---

Built as an owned, deployable replacement for the original Base44 export — no Base44 SDK, auth, or hosted functions remain.
