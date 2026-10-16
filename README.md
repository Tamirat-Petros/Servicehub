# ServiceHub backend

ServiceHub backend for Project 1. Account, business, service, staff, schedule, and appointment flows are implemented. Reviews and the remaining platform modules are still placeholders.

## Setup

Requires Node.js 22 or newer and PostgreSQL. Run `npm install`, set `DATABASE_URL` and a unique `JWT_ACCESS_SECRET` in `.env`, then apply the committed migrations with `npm run prisma:deploy`. Start the API using `npm run dev`. Use `npm run prisma:migrate -- --name <migration-name>` when creating future development migrations. Redis is configured but is not connected until background jobs are implemented.

## Implemented API

- `GET /api/v1/health` — service health.
- `POST /api/v1/auth/register` — create a user, a business, and an owner membership in one database transaction.
- `POST /api/v1/auth/login` — verify credentials and return a short-lived bearer access token.
- `GET /api/v1/auth/me` — return the authenticated user and business memberships.
- `GET /api/v1/users/me` — alias for the authenticated profile.
- `GET /api/v1/users/memberships`, `POST /api/v1/users/memberships`, `DELETE /api/v1/users/memberships/:membershipId` — list and manage business memberships (the invited account must already exist; owners/admins only).
- `GET /api/v1/businesses/current` — return the active business membership. Send `X-Business-Id` when the user belongs to more than one business.
- `GET /api/v1/services` — list the selected business's services.
- `POST /api/v1/services`, `PATCH /api/v1/services/:serviceId`, `DELETE /api/v1/services/:serviceId` — manage services (owner/admin).
- `GET /api/v1/staff` — list staff; `POST`, `PATCH /:staffId`, `PUT /:staffId/services`, and `DELETE /:staffId` manage staff (owner/admin).
- `GET /api/v1/schedules?staffId=...` — read weekly availability. `PUT /api/v1/schedules/:staffId` replaces a staff member's schedule (owner/admin).
- `GET /api/v1/public/businesses/:businessSlug/services` — public service catalog.
- `GET /api/v1/public/businesses/:businessSlug/availability?serviceId=...&date=YYYY-MM-DD` — available staff booking times for that business-local date.
- `POST /api/v1/public/businesses/:businessSlug/appointments` — book a service for a customer. A bearer token is optional; guest name and email are required.
- `GET /api/v1/appointments` — tenant appointments (owner/admin/staff), with optional `from`, `to`, `staffId`, `cursor`, and `limit` filters.
- `PATCH /api/v1/appointments/:appointmentId/status` — cancel or complete an appointment (owner/admin).

Registration expects `email`, `password` (at least 12 characters), `firstName`, `lastName`, and `businessName`. Login expects `email` and `password`.

Registration, login, service management, scheduling, and booking require the database migrations to be applied. Passwords are stored as scrypt hashes. Access tokens expire after 15 minutes by default. Refresh tokens, password reset, email verification, and session revocation are not implemented yet.

## Commands

- `npm run dev` — start with Node watch mode
- `npm start` — start the server
- `npm test` — run the health check test
- `npm run lint` — lint JavaScript
- `npm run prisma:generate` — generate the Prisma client
- `npm run prisma:migrate` — run local migrations
- `npm run seed` — run the seed placeholder

## Next steps

1. Add user invitations and account recovery.
2. Add reviews, notifications, dashboard, audit logs, and platform administration.

See `docs/` for architecture, API conventions, and tenancy guidance.
