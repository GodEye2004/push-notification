Local testing for Admin Panel

This README explains how to run the admin panel locally using lightweight mock API routes included in `src/app/api/*`.

What was added
- Mock API routes:
  - GET `/api/status` -> returns `{ status, online_devices, online_count, history }`
  - GET `/api/apps` -> returns an array of registered apps
  - DELETE `/api/notifications/:id` -> removes a history item (mock)
  - POST `/api/auth/logout` -> mock logout

How to run
1. In a terminal, go to `packages/admin-panel`.
2. Run `npm run dev`.
3. Open `http://localhost:3000` (or the port Next reports) and navigate to the dashboard.

Notes
- These mocks are for front-end testing only. They live under `src/app/api` and use an in-memory store (`src/lib/mockStore.ts`).
- When you're ready to use the real backend, remove or disable these routes and configure `NEXT_PUBLIC_API_URL` to point to your server.
