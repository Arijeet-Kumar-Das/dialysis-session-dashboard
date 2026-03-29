# Dialysis Dashboard — API Documentation

Base URL: `http://localhost:5000`

---

## Health Check

### `GET /health`
Returns server status.

**Response**
```json
{ "success": true, "message": "Server is running" }
```

---

## Patients

### `GET /api/patients`
Returns all registered patients.

**Response**
```json
{
  "success": true,
  "data": [
    {
      "_id": "64abc...",
      "name": "John Doe",
      "age": 45,
      "gender": "male",
      "dryWeight": 70,
      "contactNumber": "9876543210",
      "createdAt": "2026-03-28T09:00:00.000Z"
    }
  ]
}
```

---

### `GET /api/patients/:id`
Returns a single patient by ID.

**Params**
| Name | Type | Description |
|------|------|-------------|
| id | string | MongoDB ObjectId |

**Response**
```json
{ "success": true, "data": { ...patient } }
```

**Error**
```json
{ "success": false, "message": "Patient not found" }
```

---

### `POST /api/patients`
Registers a new patient.

**Request Body**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| name | string | ✅ | Full name |
| age | number | ✅ | Age in years |
| gender | string | ✅ | male / female / other |
| dryWeight | number | ✅ | Baseline weight in kg |
| contactNumber | string | ❌ | Phone number |

**Example**
```json
{
  "name": "John Doe",
  "age": 45,
  "gender": "male",
  "dryWeight": 70,
  "contactNumber": "9876543210"
}
```

**Response** `201 Created`
```json
{ "success": true, "data": { ...patient } }
```

**Socket Event**: `patient:created` emitted with patient object.

---

### `PATCH /api/patients/:id`
Updates an existing patient.

**Request Body** — all fields optional
| Field | Type | Description |
|-------|------|-------------|
| name | string | Full name |
| age | number | Age in years |
| gender | string | male / female / other |
| dryWeight | number | Baseline weight in kg |
| contactNumber | string | Phone number |

**Response**
```json
{ "success": true, "data": { ...updated patient } }
```

**Socket Event**: `patient:updated` emitted with updated patient object.

---

### `DELETE /api/patients/:id`
Deletes a patient and all their associated sessions.

**Response**
```json
{ "success": true, "data": { ...deleted patient } }
```

**Socket Event**: `patient:deleted` emitted with `{ id }`.

---

## Sessions

### `GET /api/sessions/today`
Returns sessions for a given date (defaults to today) with anomalies populated.

**Query Parameters**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| date | string | ❌ | Date in `YYYY-MM-DD` format (defaults to today) |
| unit | string | ❌ | Filter by unit (e.g. Ward-A, Ward-B, ICU, General) |

**Examples**
```
GET /api/sessions/today                          → all sessions today
GET /api/sessions/today?date=2026-03-28          → sessions on March 28
GET /api/sessions/today?unit=Ward-A              → Ward-A sessions today
GET /api/sessions/today?date=2026-03-28&unit=ICU → ICU sessions on March 28
```

**Response**
```json
{
  "success": true,
  "data": [
    {
      "_id": "64def...",
      "patientId": {
        "_id": "64abc...",
        "name": "John Doe",
        "age": 45,
        "gender": "male",
        "dryWeight": 70
      },
      "scheduledDate": "2026-03-28T09:00:00.000Z",
      "status": "in_progress",
      "preWeight": 75,
      "postWeight": null,
      "systolicBP": 185,
      "durationMinutes": 90,
      "machineId": "M-101",
      "unit": "Ward-A",
      "nurseNotes": "",
      "anomalies": [
        "Excess weight gain: 5.0kg above dry weight (limit: 3kg)",
        "High systolic BP: 185 mmHg (limit: 180 mmHg)",
        "Session too short: 90 min (minimum: 120 min)"
      ],
      "createdAt": "2026-03-28T09:00:00.000Z",
      "updatedAt": "2026-03-28T09:00:00.000Z"
    }
  ]
}
```

---

### `GET /api/sessions/:id`
Returns a single session by ID with patient populated.

**Response**
```json
{ "success": true, "data": { ...session } }
```

---

### `POST /api/sessions`
Records a new dialysis session. Anomaly detection runs automatically on creation.

**Request Body**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| patientId | string | ✅ | MongoDB ObjectId of patient |
| scheduledDate | string | ✅ | ISO 8601 datetime |
| status | string | ❌ | not_started / in_progress / completed |
| preWeight | number | ❌ | Pre-session weight in kg |
| postWeight | number | ❌ | Post-session weight in kg |
| systolicBP | number | ❌ | Systolic blood pressure in mmHg |
| durationMinutes | number | ❌ | Session duration in minutes |
| machineId | string | ❌ | Dialysis machine identifier |
| nurseNotes | string | ❌ | Free-text notes (max 500 characters) |
| unit | string | ❌ | Hospital unit (default: "General") |

**Example**
```json
{
  "patientId": "64abc...",
  "scheduledDate": "2026-03-28T09:00:00.000Z",
  "preWeight": 75,
  "systolicBP": 185,
  "durationMinutes": 90,
  "machineId": "M-101",
  "unit": "Ward-A",
  "status": "in_progress"
}
```

**Response** `201 Created`
```json
{ "success": true, "data": { ...session with anomalies } }
```

**Socket Event**: `session:created` emitted with populated session object.

---

### `PATCH /api/sessions/:id`
Updates an existing session. Anomaly detection re-runs on every update.

**Request Body** — all fields optional
| Field | Type | Description |
|-------|------|-------------|
| status | string | not_started / in_progress / completed |
| nurseNotes | string | Updated notes |
| preWeight | number | kg |
| postWeight | number | kg |
| systolicBP | number | mmHg |
| durationMinutes | number | minutes |
| machineId | string | Machine ID |

**Response**
```json
{ "success": true, "data": { ...updated session } }
```

**Socket Event**: `session:updated` emitted with populated session object.

---

### `DELETE /api/sessions/:id`
Deletes a session by ID.

**Response**
```json
{ "success": true, "data": { ...deleted session } }
```

**Socket Event**: `session:deleted` emitted with `{ id }`.

---

## Socket.io Events

The backend emits real-time events via Socket.io when data changes.
Connect to: `http://localhost:5000`

### Session Events
| Event | Payload | Trigger |
|-------|---------|---------|
| `session:created` | Populated session object | New session created |
| `session:updated` | Populated session object | Session updated |
| `session:deleted` | `{ id: string }` | Session deleted |

### Patient Events
| Event | Payload | Trigger |
|-------|---------|---------|
| `patient:created` | Patient object | New patient registered |
| `patient:updated` | Patient object | Patient updated |
| `patient:deleted` | `{ id: string }` | Patient deleted |

> **Note**: Socket.io events are only available in local development.
> Vercel serverless deployments do not support WebSockets — the API
> remains fully functional via REST, but real-time push is disabled.

---

## Error Responses

All endpoints return this shape on failure:
```json
{ "success": false, "message": "Description of error" }
```

| Status Code | Meaning |
|-------------|---------|
| 400 | Bad request — missing or invalid fields |
| 404 | Resource not found |
| 500 | Internal server error |