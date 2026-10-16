# ServiceHub backend

ServiceHub backend for Project 1. Authentication and business membership are implemented; the remaining feature modules and integrations are placeholders.

## Setup

Requires Node.js 22 or newer and PostgreSQL. Run `npm install`, set `DATABASE_URL` and a unique `JWT_ACCESS_SECRET` in `.env`, then apply the committed migrations with `npm run prisma:deploy`. Start the API using `npm run dev`. Use `npm run prisma:migrate -- --name <migration-name>` when creating future development migrations. Redis is configured but is not connected until background jobs are implemented.

## Implemented API

- `GET /api/v1/health` — service health.
- `POST /api/v1/auth/register` — create a user, a business, and an owner membership in one database transaction.
- `POST /api/v1/auth/login` — verify credentials and return a short-lived bearer access token.
- `GET /api/v1/auth/me` — return the authenticated user and business memberships.
- `GET /api/v1/businesses/current` — return the active business membership. Send `X-Business-Id` when the user belongs to more than one business.

Registration expects `email`, `password` (at least 12 characters), `firstName`, `lastName`, and `businessName`. Login expects `email` and `password`.

Registration, login, and authenticated requests that access business data require the database migration to be applied. Passwords are stored as scrypt hashes. Access tokens expire after 15 minutes by default. This first slice does not yet implement refresh tokens, password reset, email verification, or session revocation.

## Commands

- `npm run dev` — start with Node watch mode
- `npm start` — start the server
- `npm test` — run the health check test
- `npm run lint` — lint JavaScript
- `npm run prisma:generate` — generate the Prisma client
- `npm run prisma:migrate` — run local migrations
- `npm run seed` — run the seed placeholder

## Next steps

1. Implement authentication and identity.
2. Enforce tenant context and repository-level `businessId` filtering.
3. Build services and staff.
4. Add schedules.
5. Implement appointments.

See `docs/` for architecture, API conventions, and tenancy guidance.
