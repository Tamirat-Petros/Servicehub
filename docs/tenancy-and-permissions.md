# Tenancy and permissions

Use one shared PostgreSQL database. Every tenant-owned table must carry a non-null `businessId` foreign key when its Prisma model is added. Tenant-scoped repository methods must require a business ID and include it in every read, update, and delete filter; never rely on client-supplied ownership alone.

Tenant context must be derived from an authenticated, authorized membership and attached to the request. Reject missing or inaccessible tenant context before tenant features run. Apply RBAC after identity and tenant context are established. The middleware files are pass-through stubs in this scaffold, so enforcement is not active yet.
