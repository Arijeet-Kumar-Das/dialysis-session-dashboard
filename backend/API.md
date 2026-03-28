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

---

## Sessions

### `GET /api/sessions/today`
Returns all sessions scheduled for today with anomalies populated.

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
| nurseNotes | string | ❌ | Free-text notes |

**Example**
```json
{
  "patientId": "64abc...",
  "scheduledDate": "2026-03-28T09:00:00.000Z",
  "preWeight": 75,
  "systolicBP": 185,
  "durationMinutes": 90,
  "machineId": "M-101",
  "status": "in_progress"
}
```

**Response** `201 Created`
```json
{ "success": true, "data": { ...session with anomalies } }
```

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