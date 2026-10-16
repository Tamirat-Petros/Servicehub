# API conventions

- Version routes under `/api/v1`.
- Return JSON and use HTTP status codes that match the outcome.
- Errors use `{ "error": { "code": "...", "message": "...", "details": ... } }`; omit `details` when absent.
- Validate request inputs at the route boundary with Zod schemas.
- Keep controllers thin, use services for operations, and repositories for persistence queries.
- Authenticated routes use `Authorization: Bearer <accessToken>`.
- Business-scoped routes use a verified membership. Send `X-Business-Id` when an account belongs to more than one business.
- Schedule weekdays use `0` for Sunday through `6` for Saturday. `startMinute` and `endMinute` are minutes after midnight in the business time zone.
- Service and staff deletes are soft deletes; existing records and appointment history are kept.
- A review can be submitted once for an appointment booked by the signed-in account after a manager marks it complete.
- Notifications are private to their recipient account. Audit logs are private to business owners and administrators.
