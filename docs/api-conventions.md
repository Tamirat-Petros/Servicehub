# API conventions

- Version routes under `/api/v1`.
- Return JSON and use HTTP status codes that match the outcome.
- Errors use `{ "error": { "code": "...", "message": "...", "details": ... } }`; omit `details` when absent.
- Validate request inputs at the route boundary with Zod schemas.
- Keep controllers thin, use services for operations, and repositories for persistence queries.
- Authenticated routes use `Authorization: Bearer <accessToken>`.
- Business-scoped routes use a verified membership. Send `X-Business-Id` when an account belongs to more than one business.
