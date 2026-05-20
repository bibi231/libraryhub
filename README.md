# LibraryHub — Your Library, Digitized

A full-stack public library management and reservation system built with React 19, Express.js, and MongoDB.

---

## Stack

| Layer | Tech |
|-------|------|
| Frontend | React 19, Vite, TypeScript, Tailwind CSS |
| Backend | Node.js 20, Express.js, TypeScript |
| Database | MongoDB Atlas (Mongoose ODM) |
| Auth | JWT (access + refresh tokens), bcrypt |
| State | Zustand, TanStack Query |
| Charts | Recharts |
| Animations | Framer Motion |

---

## Quick Start

### Prerequisites
- Node.js 20+
- MongoDB Atlas account (or local MongoDB)

### 1. Clone & install

```bash
git clone <repo>
cd libraryhub
npm install
```

### 2. Environment setup

```bash
cp .env.example server/.env
```

Edit `server/.env`:
```
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/libraryhub
JWT_SECRET=your-min-32-char-secret-key-here
JWT_REFRESH_SECRET=another-min-32-char-refresh-key
PORT=5000
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

Create `client/.env`:
```
VITE_API_URL=http://localhost:5000/api
```

### 3. Seed demo data

```bash
npm run seed
```

### 4. Run in development

```bash
npm run dev
```

- Frontend: http://localhost:5173
- Backend: http://localhost:5000
- Health check: http://localhost:5000/health

---

## Demo Accounts

| Role | Email | Password |
|------|-------|----------|
| Librarian | librarian@libraryhub.ng | Admin1234! |
| Admin | admin@libraryhub.ng | Admin1234! |
| Patron | patron@libraryhub.ng | Patron1234! |
| Patron (with fine) | amaka@libraryhub.ng | Patron1234! |

---

## Features

### Patron
- Register and receive unique Library Card (LIB-YYYY-NNNNN)
- Browse and search catalog (full-text, filters, sort)
- Reserve books or join waitlist (FIFO queue)
- View active borrows with due date countdown
- Renew books online (if no waitlist)
- Borrowing history
- Reading list / favorites
- In-app notifications (reservation ready, due reminders, overdue alerts)
- E-book & audiobook access

### Librarian / Admin
- Catalog CRUD with ISBN auto-lookup (Open Library API)
- Checkout (patron + book IDs)
- Process returns with condition assessment
- Automatic fine calculation (₦50/day overdue)
- Manage fines (pay/waive)
- Manage reservations and fulfill pickups
- Patron management (activate/deactivate)
- Analytics dashboard with Recharts
- Reports: circulation, popular books, inventory, patron activity
- Export to CSV

### Automated
- Daily cron: mark overdue borrows, calculate fines
- Hourly cron: expire uncollected reservations (48h window)
- Daily cron: due date reminders (3 days and 1 day before)

---

## Deployment

### Frontend → Vercel

```bash
cd client
# vercel.json already includes SPA rewrites
vercel deploy
```

Set environment variable `VITE_API_URL` in Vercel dashboard.

### Backend → Render

1. Create a new Web Service pointing to the `server/` directory
2. Build command: `npm run build`
3. Start command: `node dist/app.js`
4. Set all `server/.env` variables in Render dashboard

> **Important**: The server starts the HTTP listener before connecting to MongoDB. This is required for Render's free tier health check. MongoDB uses retry logic (5 retries, exponential backoff) and never calls `process.exit()` on failure.

---

## Project Structure

```
libraryhub/
├── client/          React frontend (Vite)
├── server/          Express backend
│   └── src/
│       ├── controllers/
│       ├── jobs/    (cron jobs)
│       ├── middleware/
│       ├── models/
│       ├── routes/
│       ├── services/
│       └── utils/
├── shared/          Shared TypeScript types
└── package.json     Workspace root
```

---

## API

Base URL: `http://localhost:5000/api`

Key endpoints: `/auth`, `/books`, `/reservations`, `/borrows`, `/fines`, `/notifications`, `/reading-list`, `/reports`, `/users`

See `server/src/routes/` for full endpoint listing.
