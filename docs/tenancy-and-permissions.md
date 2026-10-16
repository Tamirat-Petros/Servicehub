# Tenancy and permissions

Use one shared PostgreSQL database. Every tenant-owned table must carry a non-null `businessId` foreign key when its Prisma model is added. Tenant-scoped repository methods must require a business ID and include it in every read, update, and delete filter; never rely on client-supplied ownership alone.

Tenant context is derived from an authenticated user and an active business membership, then attached to the request. The business current route rejects missing or inaccessible tenant context. Apply RBAC after identity and tenant context are established. Tenant-scoped repositories must include the attached business ID in every query; never accept a business ID from an unverified request body.
