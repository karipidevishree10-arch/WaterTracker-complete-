# Low-Level Design (LLD)
## Project: WaterTracker

### 1. Purpose
This document details the internal design of WaterTracker's backend modules, database schemas, and API contracts, building on the architecture defined in the HLD.

### 2. Database Schema

#### 2.1 `users`
| Field | Type | Description |
|---|---|---|
| _id | ObjectId | Unique user ID |
| name | String | User's display name |
| email | String | Unique login identifier |
| passwordHash | String | Hashed password (bcrypt) |
| dailyGoalMl | Number | User's current daily hydration goal (in ml) |
| unitPreference | String (enum) | ml / oz |
| createdAt | Date | Account creation timestamp |

#### 2.2 `intake_logs`
| Field | Type | Description |
|---|---|---|
| _id | ObjectId | Unique log entry ID |
| userId | ObjectId (ref: users) | Owner of this entry |
| amountMl | Number | Amount of water logged (in ml) |
| loggedAt | Date | Timestamp of the intake entry |

### 3. API Design

#### 3.1 `POST /api/auth/register`
- **Body:** `{ name, email, password }`
- **Logic:**
  1. Validate input fields.
  2. Hash password with bcrypt.
  3. Create new document in `users` with a default `dailyGoalMl`.
  4. Return success response (and/or auto-login token).
- **Response:** `201 Created`

#### 3.2 `POST /api/auth/login`
- **Body:** `{ email, password }`
- **Logic:**
  1. Look up user by email.
  2. Compare password against `passwordHash` using bcrypt.
  3. On success, issue a signed JWT containing `{ userId }`.
- **Response:** `200 OK`, `{ token }`

#### 3.3 `POST /api/intake`
- **Auth:** Required
- **Body:** `{ amountMl }`
- **Logic:**
  1. Verify JWT, extract `userId`.
  2. Validate `amountMl` is a positive number.
  3. Insert new document into `intake_logs` with `loggedAt: now`.
- **Response:** `201 Created`, created log entry.

#### 3.4 `GET /api/intake/today`
- **Auth:** Required
- **Logic:**
  1. Verify JWT, extract `userId`.
  2. Query `intake_logs` for entries where `loggedAt` falls within the current day for this user.
  3. Sum `amountMl` across those entries.
  4. Fetch the user's `dailyGoalMl`.
- **Response:** `200 OK`, `{ totalMl, goalMl, percentComplete }`

#### 3.5 `GET /api/intake/history?range=7d`
- **Auth:** Required
- **Logic:**
  1. Verify JWT, extract `userId`.
  2. Query `intake_logs` for the requested date range.
  3. Group entries by day and sum `amountMl` per day.
- **Response:** `200 OK`, array of `{ date, totalMl }`

#### 3.6 `PUT /api/user/goal`
- **Auth:** Required
- **Body:** `{ dailyGoalMl }`
- **Logic:**
  1. Verify JWT, extract `userId`.
  2. Update `dailyGoalMl` on the `users` document.
- **Response:** `200 OK`, updated user profile.

### 4. Authentication Flow
1. User registers or logs in via the auth endpoints.
2. On success, backend issues a JWT signed with a server secret, containing the `userId`.
3. Frontend stores the token (e.g., in memory or secure storage) and attaches it as `Authorization: Bearer <token>` on every subsequent request.
4. Express middleware verifies the token's signature and expiry on protected routes, attaching `req.user` for downstream handlers.
5. All data-access logic scopes queries to `req.user.userId`, ensuring users can only see their own data.

### 5. Error Handling
- **400** — invalid/missing input (e.g., negative intake amount, missing fields).
- **401** — missing or invalid JWT.
- **404** — user or resource not found.
- **500** — unhandled server/database errors, logged server-side for debugging.

### 6. Module Interaction Diagram (Textual)
```
Frontend --(POST /api/auth/register|login)--> Auth Controller --> users collection
Frontend --(POST /api/intake)--> Intake Controller --> intake_logs collection
Frontend --(GET /api/intake/today)--> Intake Controller --> aggregate intake_logs + users.dailyGoalMl
Frontend --(GET /api/intake/history)--> Intake Controller --> aggregate intake_logs grouped by day
Frontend --(PUT /api/user/goal)--> User Controller --> users collection
```

### 7. Non-Functional Design Notes
- Recommended index on `intake_logs.userId` and `intake_logs.loggedAt` for fast per-user, per-date-range queries.
- JWT secret must be stored in an environment variable, never hard-coded or committed to source control.
- Input validation should happen both on the frontend (UX) and backend (security/integrity).
