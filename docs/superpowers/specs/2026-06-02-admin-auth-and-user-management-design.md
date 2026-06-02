# Admin Auth + User Management — Design

**Date:** 2026-06-02
**Author:** Senior dev pass (finishing khurja's incomplete work)
**Repos:** `cleartax frontend` (Next.js 16, App Router), `cleartax backend` (Express + Mongoose + JWT)

## Goal

1. `/admin/login` page authenticates against the backend (JWT, bcrypt, MongoDB).
2. Admin routes (`/admin/*`) are inaccessible without a valid admin session.
3. A Users management page lets an admin **add more admin users** (email + password).
4. Everything verified end-to-end in a real browser before calling it done.

## Existing state (already built, working)

- Login page UI `app/(admin-public)/admin/login/page.tsx`.
- Client service `app/lib/api/services/adminAuth.service.ts` → BFF route.
- BFF `app/api/admin/auth/login/route.ts`: calls backend `/auth/login`, enforces `role === 'admin'`,
  sets `admin_token` (httpOnly, read by proxy guard) + `admin_token_access` (read by axios).
- Logout route + `adminAuth.context.tsx` + `AdminHeader` logout button.
- `proxy.ts` route guard — correctly wired for Next 16 (`middleware.ts` was renamed to `proxy.ts`;
  named `proxy` export + `config.matcher`). Decodes JWT exp for a UX-level page guard.
- Backend `/auth/login` returns `{ success, data: { user, accessToken, refreshToken } }`.
- Backend `seedAdmin.ts` seeds `admin@gmail.com / admin123` with `role: admin`.
- Most backend write routes already require `authenticate, authorize('admin')`.

## Gaps to close

1. **Seed admin user** into MongoDB (likely never run) + verify login works.
2. **Backend create-user endpoint**: `POST /users` (admin-only) + re-enable
   `router.use(authenticate, authorize('admin'))` on `user.routes.ts`.
3. **Frontend Users page**: replace the "coming soon" stub with a real table + "Add Admin" modal.

Explicitly **out of scope**: the other `AUTH TEMPORARILY DISABLED` routes
(compliance/callback/calculator). Leaving them untouched to avoid breaking working pages.

## Changes

### Backend
- `user.service.ts`: `createUser(data)` — hash password (bcrypt, 10 rounds), guard duplicate
  email/phone, create with given role, return without password.
- `user.controller.ts`: `createUser` handler (201 + created user).
- `user.validations.ts`: `createUserSchema` — `fullName` (2–100), `email`, `phone` Indian `/^[6-9]\d{9}$/`,
  `password` min 6 (consistent with `loginSchema`), `role` enum `admin|user` default `admin`.
- `user.routes.ts`: re-enable `router.use(authenticate, authorize('admin'))`; add `router.post('/', validate(createUserSchema), createUser)`.

### Frontend
- `app/lib/api/services/user.service.ts`: `getUsers()`, `createUser(payload)` via shared axios
  (admin JWT auto-attached from `admin_token_access` cookie).
- `app/(admin)/admin/users/page.tsx`: client page — fetch + render users table
  (name, email, phone, role badge, status), "Add Admin" button.
- `app/components/admin/AddUserModal.tsx`: form (fullName, email, phone, password, role),
  react-hook-form + zod, calls `createUser`, refreshes list, toast feedback.

## Data flow

Login: page → `adminLogin` → BFF `/api/admin/auth/login` → backend `/auth/login`
→ BFF sets cookies → `proxy.ts` lets `/admin/*` through while cookie valid.

Add admin: Users page → `createUser` → axios attaches `Bearer admin_token_access`
→ backend `POST /users` (`authorize('admin')`) → Mongo. New user can log in immediately.

## Verification

1. Backend up + `seedAdmin` run.
2. Playwright: `/admin/home` while logged-out → redirected to `/admin/login`.
3. Login with admin@gmail.com / admin123 → lands on `/admin/home`.
4. Wrong password → inline error, no redirect.
5. Users page → add a new admin → appears in list.
6. Log the new admin out/in → works.
7. Logout → `/admin/*` blocked again.

## Deployment note

Set `BACKEND_API_URL` (server) and `NEXT_PUBLIC_API_URL` (client) on the frontend host to the
deployed backend URL. Set the backend's `FRONTEND_URL` for CORS. Rotate `JWT_SECRET` /
`JWT_REFRESH_SECRET` for production and change the seeded admin password after first login.
