# InternArea — code-level fixes

This pass keeps the existing React, Express, MongoDB/Mongoose, Firebase and Redux architecture. It does not add Render/Vercel deployment files or change the UI design.

## Fixed in this version

### Frontend and authentication
- Replaced the old Firebase namespaced auth listener with the modular `onAuthStateChanged(auth, callback)` API and added its unsubscribe cleanup.
- Kept Redux user state consistent (`state.user.user`) and made the initial user value explicit.
- Added working Firebase email/password registration, email/password login, Google sign-in, and password-reset handlers.
- Added a shared Axios client. It attaches the current Firebase ID token to signed-in user requests and the admin bearer token to admin requests.
- Added a server-checked admin route guard and an admin logout action.
- Added a toast container so registration/login feedback is visible.
- Replaced the detail-page effects that ran after every render with ID-dependent effects and loading/error states.
- Fixed cover-letter validation to check the actual text, not the DOM element.
- User application history now loads from the authenticated `/api/application/mine` endpoint rather than downloading every applicant's records and filtering in the browser.

### Backend and data integrity
- Added Firebase ID-token verification (signature, issuer, audience, expiry and subject) using Google's Secure Token signing certificates.
- Removed the hard-coded `admin/admin` credentials. Admin credentials and the HMAC token secret are read from environment variables.
- Added signed, expiring admin tokens and server-side admin middleware.
- Protected job/internship creation, admin application listing, and application status changes.
- Applications are created from the verified Firebase identity and the selected database listing. The backend no longer trusts the submitted user/company/category fields.
- Added duplicate-application prevention and ownership checks when a user reads an application.
- Fixed job form/API/model field mismatches (`Experience`, `aboutJob`, `CTC`, openings).
- Added internship duration and openings persistence, and normalized perks into arrays.
- Added ObjectId validation, correct 404 handling, and consistent API error responses.
- MongoDB connection failures now stop server startup instead of being logged and ignored. Database seeding can be disabled with `SEED_DATABASE=false`.

### Project hygiene
- Changed backend start/dev scripts to `node` and `nodemon` respectively; removed the Windows-only frontend start command.
- Added `.env.example` templates and ignore rules for local environment files and secrets.
- Added backend authentication tests.

## Local configuration required for these code paths

Create `server/.env` from `server/.env.example`, then set:
- `DATABASEURL`
- `FIREBASE_PROJECT_ID` (currently `internarea-b947e`)
- `ADMIN_USERNAME`
- `ADMIN_PASSWORD`
- `ADMIN_TOKEN_SECRET` (at least 32 characters)

For the frontend, copy `client/.env.example` to `client/.env` if you want to set `REACT_APP_API_URL`; otherwise the CRA development proxy uses `http://localhost:8000`.

Firebase Email/Password sign-in must be enabled in the Firebase Authentication console if you want to use that registration/login option.

## Verification performed

- Frontend: `npm run build` — **passed**.
- Backend: `npm test` — **6 tests passed**.
- Backend JavaScript: `node --check` on all backend JavaScript files — **passed**.
- Backend modules: required the Express routes and database modules — **passed**.

A live MongoDB connection, live Firebase sign-in/token exchange, and complete browser-driven user journey were not run in this environment. Those still need a local integration test with your Firebase project and MongoDB database. Deployment configuration is intentionally deferred as requested.
