# High-Level Design (HLD)
## Project: WaterTracker

### 1. Overview
WaterTracker follows a standard **three-tier architecture**: a frontend client, a backend REST API, and a database for persistent storage.

```
[ Frontend (React) ]  <-->  [ Backend (Node.js / Express API) ]  <-->  [ Database (MongoDB) ]
```

### 2. System Components

#### 2.1 Frontend
- Provides the UI for sign up/login, the daily intake logging screen, progress visualization (e.g., progress bar/ring), and history view.
- Sends authenticated API requests to the backend for all data operations (login, log intake, fetch history, update goal).
- Manages local UI state (current day's total, form inputs) and syncs with backend data.

#### 2.2 Backend (API Layer)
- Exposes REST endpoints for authentication, intake logging, goal management, and history retrieval.
- Validates and authenticates every request using a token (JWT) before processing.
- Contains the business logic for calculating daily totals and progress percentages.

#### 2.3 Database
- Stores two main types of data: **Users** (account info, hashed password, current goal) and **Intake Logs** (amount, timestamp, linked user).
- Structured so that daily/weekly totals can be efficiently queried per user.

#### 2.4 Auth Layer
- Handles registration and login.
- Issues a signed token on successful login; the frontend attaches this token to subsequent requests.
- Backend middleware verifies the token on protected routes before allowing access.

### 3. Key Modules
1. **Auth Module** — registration, login, logout, token verification.
2. **Intake Logging Module** — add/edit/delete a water intake entry.
3. **Goal Management Module** — set/update the user's daily hydration goal.
4. **History & Analytics Module** — aggregate and return intake data by day/week for charts and history views.
5. **User Profile Module** — manage account details and preferences (e.g., unit of measurement).

### 4. High-Level Data Flow
1. User registers/logs in → backend validates credentials → token issued → stored on the client.
2. User taps "add water" on the frontend → request sent to backend with amount + token.
3. Backend verifies token → creates a new intake log entry tied to the user and current timestamp.
4. Frontend requests today's total → backend aggregates all of today's entries for that user and returns the sum plus the user's goal.
5. Frontend renders progress (total vs. goal) and updates in real time as new entries are added.
6. User opens history view → backend returns grouped historical totals (e.g., per day for the last 7/30 days).

### 5. Security Architecture
- All traffic served over HTTPS.
- Passwords hashed (e.g., bcrypt) before being stored — never stored in plaintext.
- Token-based session management; protected routes reject requests without a valid token.
- Each user can only access their own intake and profile data (enforced at the API layer by matching the authenticated user ID).

### 6. Deployment View
- Frontend: built as a static app and served via a web host/CDN.
- Backend: Node.js/Express service exposing REST APIs, deployable as a standalone service or container.
- Database: managed database instance (e.g., MongoDB Atlas) accessible only to the backend.

### 7. Assumptions & Constraints
- Users access WaterTracker via a web browser (desktop or mobile browser) — no native app in the current phase.
- An internet connection is required to log intake and sync data (no offline mode in the current phase).
