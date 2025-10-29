## Database migration best practices

- **Reversible**: Always implement rollback/down methods
- **Small Changes**: One logical change per migration
- **Separate Concerns**: Keep schema changes separate from data migrations
- **Clear Names**: Descriptive names indicating what migration does
- **Version Control**: Commit all migrations; never modify applied migrations
- **Zero-Downtime**: Consider deployment order and backwards compatibility
- **Index Management**: Use concurrent options to avoid locks on large tables
- **Test First**: Test on staging before production
- **RLS**: Enable Row Level Security and define CRUD policies after creating tables
