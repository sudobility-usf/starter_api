# Improvement Plans for @sudobility/starter_api

## Priority 1 - High Impact

### 1. Add Input Validation with Schema Validation Library
- Route handlers in `histories.ts` perform manual validation (e.g., `if (!datetime || value === undefined)`) which is error-prone and inconsistent
- The POST handler checks `typeof value !== "number" || value <= 0` but the PUT handler does the same check only when `body.value !== undefined` -- no validation exists for `datetime` format in either route
- Invalid `datetime` strings like `"not-a-date"` are silently passed to `new Date()` which produces `Invalid Date` objects and can corrupt the database
- Consider using Zod or Hono's built-in validator middleware to enforce request schemas at the route level, leveraging the types already defined in starter_types

### 2. Add Error Handling Middleware for Unhandled Exceptions
- Route handlers in `histories.ts`, `users.ts`, and `historiesTotal.ts` have no try-catch blocks around database operations
- If a database query fails (connection error, constraint violation, etc.), the error propagates as an unhandled exception and results in a 500 with a stack trace
- The `ensureUserExists` function in the auth middleware uses a fire-and-forget pattern (`ensureUserExists().catch(console.error)`) which means user creation failures are silently logged but not surfaced
- Add a global Hono error handler middleware that catches unhandled exceptions and returns a properly formatted `errorResponse`

### 3. Add JSDoc Documentation to Route Handlers and Middleware
- None of the route handler functions have JSDoc comments documenting expected parameters, request body shape, response format, or error conditions
- The `firebaseAuthMiddleware` function lacks documentation about what context variables it sets (`firebaseUser`, `userId`, `userEmail`, `siteAdmin`)
- The `initDatabase` function lacks documentation about what tables it creates and its idempotent behavior
- The `ensureUserExists` fire-and-forget pattern is undocumented and could surprise future maintainers

## Priority 2 - Medium Impact

### 3. Eliminate Duplicated Response Mapping Logic
- The history-to-JSON mapping logic (converting `datetime` to ISO string, `value` to Number, null-safe `created_at`/`updated_at`) is duplicated across all four route handlers in `histories.ts` (GET list, POST create, PUT update, DELETE)
- The same pattern appears in `users.ts` for the user object
- Extract these into reusable mapper functions (e.g., `serializeHistory(h)`, `serializeUser(u)`) to reduce duplication and ensure consistent serialization

### 4. Add Pagination to the GET Histories Endpoint
- The GET `/api/v1/users/:userId/histories` endpoint returns all histories for a user with no pagination
- As users accumulate history entries, this query will become increasingly slow and memory-intensive
- The `histories.ts` GET handler performs a full table scan with `eq(histories.user_id, userId)` with no LIMIT or ORDER BY clause
- Add query parameters for `limit`, `offset`, and `orderBy` (defaulting to `datetime DESC`) to support pagination

## Priority 3 - Nice to Have

### 5. Add Rate Limiting to Public Endpoints
- The `/api/v1/histories/total` endpoint is public (no auth required) and performs a database aggregation (`SUM`) on every request
- Without rate limiting, this endpoint is vulnerable to abuse that could degrade database performance
- The `/health` endpoint is also unauthenticated and could similarly be abused
- Consider adding Hono rate limiting middleware, at minimum for public endpoints

### 6. Add Request Logging with Structured Output
- The current logging uses Hono's built-in `logger()` middleware which outputs simple request/response logs
- `console.error` is used directly for error logging (e.g., in `ensureUserExists`, `initDatabase`) with no structured format
- Consider adding a structured logging approach with correlation IDs, request timing, and user identification for better observability in production
