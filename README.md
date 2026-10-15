# ServiceHub backend

Minimal backend scaffold for Project 1. It includes a health check only; feature modules and integration folders are placeholders.

## Setup

Requires Node.js LTS. Run `npm install`, copy `.env.example` to `.env`, then use `npm run dev`. PostgreSQL and Redis URLs are validated at startup; this scaffold does not connect to either service.

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
