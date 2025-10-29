## Error handling best practices

- **Fail Fast**: Validate input early; fail with clear messages
- **Specific Types**: Use specific exception/error types for targeted handling
- **Centralized**: Handle at boundaries (controllers, API layers), not scattered try-catch
- **Clean Up**: Always clean resources in finally blocks
- **Type-Safe**: Throw `Error` instances with meaningful messages; no empty catches
- **User-Friendly**: Clear, actionable messages without technical details
- **Preserve State**: Keep form data and page state on error
- **Recovery**: Provide next steps (retry, back, help) and suggest corrections
- **i18n**: Localize messages; keep concise
- **Graceful Degradation**: Show fallback UI when dependencies fail
- **Retry**: Exponential backoff for transient failures
- **Offline**: Queue or no-op non-critical actions (mobile)
- **Domain Errors**: Wrap low-level errors; never leak internals to clients
- **Monitoring**: Capture exceptions with safe context; redact sensitive data
