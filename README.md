
# Dialysis Session Intake & Anomaly Dashboard

This project simulates a nurse's workflow during a dialysis shift,
focusing on real-time monitoring and early detection of unsafe conditions.


---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React + TypeScript + Tailwind CSS (Vite) |
| Backend | Node.js + Express + TypeScript |
| Database | MongoDB + Mongoose |
| Real-time | Socket.io (WebSocket) |
| Deployment | Vercel (serverless backend + static frontend) |
| Testing | Jest + Supertest (backend), Vitest + Testing Library (frontend) |

---

## Features

### Core Functionality
- **Patient Management** — Register, edit, delete patients with full CRUD
- **Session Intake** — Create and update dialysis sessions with vitals (weight, BP, duration)
- **Anomaly Detection** — Automatic detection of unsafe conditions at create/update time
- **Multi-unit Support** — Filter sessions by unit (Ward-A, Ward-B, ICU, General)
- **Date Navigation** — Browse sessions by date with prev/next day navigation

### Real-time Updates (Socket.io)
- **Live Dashboard** — Sessions and patients update automatically across all connected clients
- **Toast Notifications** — Instant feedback when data changes from any source
- **Connection Status** — Live indicator in navbar (🟢 Live / 🟡 Reconnecting / ⚪ Offline)

### Schedule Timeline View
- **Hourly Timeline** — Visual timeline from 06:00 to 22:00 in 1-hour increments
- **Status Color Coding** — Slate (not started), amber (in progress), emerald (completed)
- **Anomaly Markers** — Red left border on sessions with anomalies
- **Current Time Indicator** — Blue line showing the current time with auto-scroll
- **Clickable Cards** — Click any session card in the timeline to edit it

### Form Validation & UX
- **Inline Validation** — On-blur and on-submit validation with clear error messages
- **Visual Feedback** — Red borders for invalid fields, green borders for valid filled fields
- **Cross-field Validation** — e.g. post-weight must be less than pre-weight
- **Character Counter** — Nurse notes field shows live count (X/500)
- **Live Anomaly Preview** — See detected anomalies before submitting

### Dashboard UI
- **Responsive Grid** — 3 columns desktop, 2 tablet, 1 mobile
- **Stats Cards** — Today's sessions, in progress, completed, anomalies detected
- **Anomaly Filter** — Toggle to show only patients with anomalies
- **Pulse Animation** — Subtle pulse on anomaly cards
- **Auto-refresh** — Data refreshes every 30 seconds with "last updated" timestamp

---

## Project Structure
```
root/
├── backend/              # Express API server
│   ├── api/              # Vercel serverless entrypoint
│   │   └── index.ts      # Vercel handler (lazy MongoDB connection)
│   ├── src/
│   │   ├── config/       # DB connection, anomaly thresholds
│   │   ├── controllers/  # Request/response handling
│   │   ├── middleware/   # Error handler
│   │   ├── models/       # Mongoose schemas (Patient, Session)
│   │   ├── routes/       # API route definitions
│   │   ├── services/     # Business logic + anomaly detection
│   │   ├── scripts/      # Seed script
│   │   ├── types/        # Shared TypeScript interfaces
│   │   ├── app.ts        # Pure Express app (middleware, routes)
│   │   ├── index.ts      # Local dev entry (HTTP + Socket.io)
│   │   └── socket.ts     # Shared Socket.io instance module
│   ├── vercel.json       # Vercel routing config
│   └── API.md            # Full API documentation
└── frontend/             # React dashboard
    └── src/
        ├── api/          # Axios API calls
        ├── components/   # UI components (Navbar, PatientCard, Forms)
        ├── context/      # Toast context
        ├── hooks/        # Data fetching hooks (useSessions, usePatients, useSocket)
        ├── pages/        # Dashboard + Patients page
        ├── utils/        # Validation utilities
        ├── socket.ts     # Socket.io client singleton
        └── types/        # Shared TypeScript interfaces
```

---

## Setup Instructions

### Prerequisites
- Node.js v18+
- MongoDB Atlas account — [create a free account here](https://www.mongodb.com/cloud/atlas)

### 1. Clone the repository
```bash
git clone https://github.com/Arijeet-Kumar-Das/dialysis-session-dashboard
cd dialysis-session-dashboard
```

### 2. Setup Backend
```bash
cd backend
npm install
```

Create a `.env` file inside `backend/`:
```env
PORT=5000
MONGODB_URI=your_mongodb_atlas_connection_string
NODE_ENV=development
```

> **How to get your MongoDB URI:**
> 1. Log in to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
> 2. Create a free cluster (M0 — free tier)
> 3. Click **Connect** → **Drivers**
> 4. Copy the connection string
> 5. Replace `<password>` with your Atlas password
> 6. Add `dialysis` as the database name before the `?`:
>    `mongodb+srv://user:pass@cluster0.xxxxx.mongodb.net/dialysis?retryWrites=true&w=majority`
> 7. Go to **Network Access** → **Add IP Address** → **Allow Access from Anywhere**

Start the backend server:
```bash
npm run dev
```

Server runs at `http://localhost:5000`

### 3. Setup Frontend

Open a new terminal:
```bash
cd frontend
npm install
```

Create a `.env` file inside `frontend/`:
```env
VITE_API_URL=http://localhost:5000
```

> This tells the frontend where to find the backend.
> No other URL changes needed anywhere in the code.

Start the frontend:
```bash
npm run dev
```

Frontend runs at `http://localhost:5173`

### 4. Seed the Database

To populate example patients and sessions:
```bash
cd backend
npx ts-node src/scripts/seed.ts
```

This creates 4 patients across Ward-A, Ward-B, and ICU with
10 sessions including anomaly-triggering data for testing.

---

## Running Tests

### Backend Tests (Jest + Supertest)
```bash
cd backend
npm test
```
- Unit test: anomaly detection logic
- Integration test: patient and session API routes
- **13 tests passing**

### Frontend Tests (Vitest + Testing Library)
```bash
cd frontend
npm test
```
- Component test: AnomalyBadge renders correctly
- **3 tests passing**
---

## API Endpoints

Full API documentation is available in [`backend/API.md`](./backend/API.md)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /health | Health check |
| GET | /api/patients | Get all patients |
| GET | /api/patients/:id | Get patient by ID |
| POST | /api/patients | Register new patient |
| PATCH | /api/patients/:id | Update patient |
| DELETE | /api/patients/:id | Delete patient + sessions |
| GET | /api/sessions/today | Sessions by date (with ?date & ?unit filters) |
| GET | /api/sessions/:id | Get session by ID |
| POST | /api/sessions | Create new session |
| PATCH | /api/sessions/:id | Update session |
| DELETE | /api/sessions/:id | Delete session |

### Socket.io Events
| Event | Direction | Description |
|-------|-----------|-------------|
| `session:created` | Server → Client | New session created |
| `session:updated` | Server → Client | Session updated |
| `session:deleted` | Server → Client | Session deleted |
| `patient:created` | Server → Client | New patient registered |
| `patient:updated` | Server → Client | Patient updated |
| `patient:deleted` | Server → Client | Patient deleted |

---

## Architecture Overview
```
Browser (React)
     │
     ├── HTTP REST ──► Express Router → Controller → Service → Mongoose → MongoDB
     │                                                │
     │                                         Anomaly Detection
     │                                         (on create/update)
     │
     └── WebSocket ◄── Socket.io Server ◄── Service (emit on mutations)
```

### Layer Responsibilities
- **Routes** — define endpoints, no business logic
- **Controllers** — validate input, handle HTTP req/res
- **Services** — business logic, database calls, socket emissions
- **Models** — Mongoose schemas with built-in validation
- **Anomaly Service** — pure function, fully testable, no side effects
- **Socket Module** — shared io instance, null-safe for serverless

### Deployment Architecture
```
Local Development:
  index.ts → createServer(app) + Socket.io → httpServer.listen()

Vercel (Serverless):
  api/index.ts → import app → mongoose.connect() → app(req, res)
  (Socket.io disabled — getIO() returns null, emit calls are safely skipped)
```

---

## Anomaly Detection

Anomalies are computed and **stored** on the session document at
create/update time. Thresholds live in:
`backend/src/config/anomalyThresholds.ts`

| Anomaly | Threshold | Clinical Justification |
|---------|-----------|----------------------|
| Excess interdialytic weight gain | > 3kg above dry weight | KDOQI guidelines recommend limiting weight gain to 2–3kg between sessions. We flag at 3kg as the upper safe bound. |
| High systolic BP | > 180 mmHg | JNC 8 classifies systolic BP ≥ 180 mmHg as hypertensive crisis requiring immediate clinical attention. |
| Session too short | < 120 minutes | Minimum adequate dialysis dose (Kt/V) requires at least 2 hours. Shorter sessions risk under-dialysis. |
| Session too long | > 300 minutes | Sessions over 5 hours are clinically unusual and likely indicate a machine fault or data entry error. |

### Detection Strategy
- Anomalies are computed **once on write**, not on every read — keeps GET requests fast
- Only fields that are **present** are checked — missing vitals are skipped, not flagged
- This supports progressive data entry during a shift (e.g. pre-weight recorded first, BP added later)
- Trade-off: if thresholds change, existing stored anomalies are not retroactively updated

---

## Assumptions & Trade-offs

| Decision | Reason |
|----------|--------|
| Anomalies stored on session document | Avoids recomputing on every read, simplifies filtering |
| Today's schedule via date range query | Simple and reliable without a separate scheduling collection |
| No authentication | Out of scope for this assignment |
| Timezone uses server local time | Acceptable at this scale; production would need UTC + user timezone |
| No pagination | Dataset is small (one shift = ~20 patients max) |
| Socket.io local-only | Vercel serverless doesn't support WebSockets; REST API works everywhere |
| Shared socket module (socket.ts) | Avoids circular dependency between index.ts and services |

---

## Known Limitations

- No authentication or role-based access control
- Timezone handling uses server local time — not production-safe across regions
- No pagination on list endpoints
- Anomaly thresholds are static config — not editable via UI
- If thresholds change, historical session anomalies are not retroactively updated
- Socket.io real-time updates only work in local development (not on Vercel)

---

## AI Usage Disclosure

AI tools were used during development as a learning and productivity aid:

- **Claude (via Antigravity)** — used to analyze the existing backend
  codebase and generate the `API.md` documentation file based on the
  actual implemented routes and response shapes.
- **AI assistance (general)** — used for looking up TypeScript syntax,
  Express patterns, and Jest/Vitest testing conventions.

All architecture decisions, schema design, business logic, anomaly
detection thresholds, and trade-offs were designed and reviewed manually.


## Future Improvements

- Editable anomaly thresholds via admin UI
- Authentication and role-based access (nurse vs admin)
- Patient history and trend graphs
- Multi-shift scheduling support
- Push notifications for critical anomalies
- WebSocket support in production (dedicated server or adapter)