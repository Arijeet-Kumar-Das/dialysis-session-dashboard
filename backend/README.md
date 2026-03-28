# Dialysis Session Intake & Anomaly Dashboard — Backend

## Tech Stack
- Node.js + Express + TypeScript
- MongoDB + Mongoose
- Jest + Supertest (testing)

## Setup Instructions

### 1. Clone and install
cd backend
npm install

### 2. Configure environment
Create a `.env` file in the root:
PORT=5000
MONGODB_URI=your_mongodb_connection_string
NODE_ENV=development

### 3. Run development server
npm run dev

### 4. Run tests
npm test

## API Endpoints

| Method | Endpoint               | Description                        |
|--------|------------------------|------------------------------------|
| GET    | /health                | Health check                       |
| GET    | /api/patients          | Get all patients                   |
| GET    | /api/patients/:id      | Get patient by ID                  |
| POST   | /api/patients          | Create a new patient               |
| GET    | /api/sessions/today    | Get today's sessions with anomalies|
| GET    | /api/sessions/:id      | Get session by ID                  |
| POST   | /api/sessions          | Create a new session               |
| PATCH  | /api/sessions/:id      | Update session (notes, status etc) |

## Architecture Overview

Request → Route → Controller → Service → Model → MongoDB
                                    ↓
                           Anomaly Detection
                           (on create/update)

- **Routes** — define endpoints, no logic
- **Controllers** — handle HTTP req/res, input validation
- **Services** — business logic, DB calls
- **Models** — Mongoose schemas with validation
- **Anomaly Service** — pure function, fully testable

## Anomaly Detection

Anomalies are computed and stored on the session document at
create/update time. Thresholds are configurable in:
`src/config/anomalyThresholds.ts`

| Anomaly             | Default Threshold         |
|---------------------|---------------------------|
| Excess weight gain  | > 3kg above dry weight    |
| High systolic BP    | > 180 mmHg                |
| Short session       | < 120 minutes             |
| Long session        | > 300 minutes             |

## Assumptions & Trade-offs

- Anomalies are stored on the session document (not computed
  on read) for simplicity and query performance
- "Today's sessions" uses server local time date range
- No authentication — out of scope for this assignment
- Anomaly thresholds are static config, not DB-driven

## Known Limitations

- No pagination on patient/session list endpoints
- No authentication or role-based access
- Timezone handling uses server local time

## AI Usage Disclosure

AI tools were used during development as a learning and productivity aid —
primarily for looking up TypeScript syntax, Express patterns, and Jest
testing conventions. All architecture decisions, business logic, and code
structure were designed and reviewed manually.