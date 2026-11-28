# TMS UI (`UI_TMS`)

A modern, role-based **Ticket Management System (TMS)** web application built with **Next.js 16 (App Router)**, **React 19**, **TypeScript**, and **Tailwind CSS 4**. Provides dedicated portals for **Customers**, **Support Agents**, and **Administrators** with real-time notifications and live chat.

---

## Tech Stack

- **Framework:** Next.js 16 (`App Router`) + React 19 + TypeScript 5 (`Node.js >= 20`)
- **Styling:** Tailwind CSS 4 + Lucide React icons + React Hot Toast
- **State & Data Fetching:** Redux Toolkit, TanStack React Query, Zustand, Axios (with automatic JWT refresh interceptor)
- **Forms & Validation:** React Hook Form + Zod
- **Real-Time:** `socket.io-client` for live notifications and agent/customer chat
- **Hosting:** Vercel (`vercel.json`)

---

## Application Portals & Routes

### Public & Authentication
- `/login`, `/register`, `/forgot-password`, `/oauth-callback`, `/unauthorized`
- `/pricing`, `/resources`, `/solutions`

### Customer Portal (`/customer/*`)
- `/customer/tickets`, `/customer/my-ticket`, `/customer/tickets/[id]`, `/customer/create-ticket`
- `/customer/knowledge-base`, `/customer/knowledge-base/[id]`
- `/customer/resources`, `/customer/resources/[id]`, `/customer/solutions`, `/customer/pricing`
- `/customer/support`, `/customer/notifications`, `/customer/profile`

### Agent Portal (`/agent/*`)
- `/agent/dashboard`, `/agent/queue`, `/agent/assigned`, `/agent/my-tickets`
- `/agent/tickets`, `/agent/tickets/[id]`
- `/agent/chat` (live chat), `/agent/reports`, `/agent/settings`, `/agent/profile`

### Admin Portal (`/admin/*`)
- `/admin/dashboard` & `/admin/dashboard/telemetry`
- `/admin/ticket-management`, `/admin/users`, `/admin/roles`, `/admin/permissions`
- `/admin/departments`, `/admin/departments-management`, `/admin/categories`
- `/admin/knowledge-base`, `/admin/resources`, `/admin/pricing-plans`
- `/admin/reports`, `/admin/audit-logs`, `/admin/profile`

---

## Getting Started (Local Development)

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

Create `.env.local` (or edit `.env.development`) and point it to your running TMS Backend API:

```env
# Backend REST API base URL
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1

# Optional: WebSocket URL (automatically derived from NEXT_PUBLIC_API_URL if omitted)
# NEXT_PUBLIC_WS_URL=http://localhost:8000
```

### 3. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start Next.js development server |
| `npm run build` | Build production bundle |
| `npm run start` | Start production Next.js server |
| `npm run lint` | Run ESLint checks |

---

## Deploying on Vercel

1. Import `reatreychen/UI_TMS` into [Vercel](https://vercel.com) (`vercel.json` is pre-configured for Next.js).
2. Add the environment variable in **Project Settings → Environment Variables**:
   - `NEXT_PUBLIC_API_URL` = `https://<your-backend-url>/api/v1`
   - *(Optional)* `NEXT_PUBLIC_WS_URL` = `https://<your-backend-url>`
3. Ensure your Vercel deployment URL is listed in the backend's `FRONTEND_URL` and `CORS_ORIGINS`.

---

## Related Repository

- **Backend API (NestJS + PostgreSQL):** [Service_Api_TMS](https://github.com/reatreychen/Service_Api_TMS)
