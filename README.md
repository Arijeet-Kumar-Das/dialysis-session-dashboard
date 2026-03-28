# Dialysis Session Intake & Anomaly Dashboard

A full-stack web application for dialysis centers to track patient 
sessions, record vitals, and surface anomalies in real time during 
a nurse's shift.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React + TypeScript + Tailwind CSS (Vite) |
| Backend | Node.js + Express + TypeScript |
| Database | MongoDB + Mongoose |
| Testing | Jest + Supertest (backend), Vitest + Testing Library (frontend) |

---

## Project Structure
```
root/
├── backend/          # Express API server
│   ├── src/
│   │   ├── config/       # DB connection, anomaly thresholds
│   │   ├── controllers/  # Request/response handling
│   │   ├── middleware/   # Error handler
│   │   ├── models/       # Mongoose schemas
│   │   ├── routes/       # API route definitions
│   │   ├── services/     # Business logic + anomaly detection
│   │   ├── scripts/      # Seed script
│   │   └── types/        # Shared TypeScript interfaces
│   └── tests/            # API + unit tests
└── frontend/         # React dashboard
    └── src/
        ├── api/          # Axios API calls
        ├── components/   # UI components
        ├── context/      # Toast context
        ├── hooks/        # Data fetching hooks
        ├── pages/        # Dashboard + Patients page
        └── types/        # Shared TypeScript interfaces
```

---

## Setup Instructions

### Prerequisites
- Node.js v18+
- MongoDB Atlas account (or local MongoDB)

### 1. Clone the repository
```bash
git clone https://github.com/yourusername/your-repo.git
cd your-repo
```

### 2. Setup Backend
```bash
cd backend
npm install
```

Create a `.env` file inside `backend/`:
```env
PORT=5000
MONGODB_URI=mongodb+srv://Arijeet_123:Arijeet_BMS123@cluster0.8oqo8rv.mongodb.net/patient_dialysis_system?appName=Cluster0
NODE_ENV=development
```

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
npm run dev
```

Frontend runs at `http://localhost:5173`

### 4. Seed the Database
To populate example patients and sessions:
```bash
cd backend
npx ts-node src/scripts/seed.ts
```

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
| GET | /api/sessions/today | Today's sessions with anomalies |
| GET | /api/sessions/:id | Get session by ID |
| POST | /api/sessions | Create new session |
| PATCH | /api/sessions/:id | Update session |

---

## Architecture Overview
```
Browser (React)
     │
     ▼
  Axios API Layer
     │  HTTP requests
     ▼
Express Router  →  Controller  →  Service  →  Mongoose  →  MongoDB
                                     │
                              Anomaly Detection
                              (on create/update)
```

### Layer Responsibilities
- **Routes** — define endpoints, no business logic
- **Controllers** — validate input, handle HTTP req/res
- **Services** — business logic and database calls
- **Models** — Mongoose schemas with built-in validation
- **Anomaly Service** — pure function, fully testable, no side effects

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
| Single page frontend | Only one view needed per the requirements |

---

## Known Limitations

- No authentication or role-based access control
- Timezone handling uses server local time — not production-safe across regions
- No pagination on list endpoints
- Anomaly thresholds are static config — not editable via UI
- If thresholds change, historical session anomalies are not retroactively updated

---

## AI Usage Disclosure

AI tools were used during development as a learning and productivity 
aid — primarily for looking up TypeScript syntax, Express patterns, 
and Jest/Vitest testing conventions. All architecture decisions, 
business logic, schema design, and trade-offs were designed and 
reviewed manually.