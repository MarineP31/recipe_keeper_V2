## API endpoint standards and conventions

- **RESTful**: Resource-based URLs with appropriate HTTP methods (GET, POST, PUT, PATCH, DELETE)
- **Naming**: Consistent lowercase, hyphenated or underscored
- **Versioning**: URL path or headers for breaking changes
- **Plural Nouns**: Use for resource endpoints (e.g., `/users`, `/products`)
- **Nested Resources**: Limit depth to 2-3 levels max
- **Query Parameters**: Use for filtering, sorting, pagination, search
- **HTTP Status Codes**: Return appropriate codes (200, 201, 400, 404, 500) with structured error bodies

## Authentication & Authorization

- **Authentication**: JWT or OAuth with HTTPS; verify tokens on every request
- **Authorization**: Role-based access control (RBAC) enforced in app and database layers

## File & Media Handling

- **Blurhash Generation**: Generate blurhash for all uploaded images and videos to enable frontend lazy loading and placeholder display
- **Storage**: Return URLs and metadata (size, dimensions, format, blurhash) in API responses

## Security

- **SQL Injection**: Use parameterized queries
- **File Uploads**: Validate type, size, and scan for malware
- **Secrets**: Never expose in client code; use environment variables only
- **CORS**: Explicitly configure and validate
- **HTTPS**: Enforce for all network requests in production
- **Certificate Pinning**: Pin expected certificates to prevent MITM attacks
- **Rate Limiting**: Per-user and per-IP limits with headers
- **CSRF Protection**: Anti-CSRF tokens for mutations
- **CSP Headers**: Define allowed content sources
- **Auditing**: Log all sensitive operations
