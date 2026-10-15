# Architecture

ServiceHub is a JavaScript ES module API built with Express. Features live in `src/modules`; each feature owns routes, controller, service, repository, and validation. Shared runtime configuration, middleware, persistence, jobs, realtime, and libraries live alongside those modules.

The HTTP pipeline is request logging, Helmet, CORS, body parsing, API rate limiting, versioned routes, not-found handling, then centralized error handling. BullMQ and Socket.IO integrations are placeholders at this stage.
