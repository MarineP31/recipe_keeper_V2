## Validation best practices

- **Server-Side**: Always validate on server; never trust client-side alone
- **Client-Side for UX**: Immediate feedback, but duplicate server-side
- **Fail Early**: Validate and reject invalid data before processing
- **Specific Messages**: Clear, field-specific error messages
- **Allowlists**: Define what is allowed over blocking what's not
- **Type & Format**: Check data types, formats, ranges, required fields
- **Sanitize**: Prevent injection attacks (SQL, XSS, command injection)
- **Business Rules**: Validate at appropriate application layer
- **Consistency**: Apply across all entry points (forms, APIs, jobs)
