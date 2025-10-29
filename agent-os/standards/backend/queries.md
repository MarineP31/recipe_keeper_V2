## Database query best practices

- **SQL Injection**: Use parameterized queries or Prisma prepared statements; never interpolate user input
- **N+1 Prevention**: Use eager loading or joins to fetch related data
- **Select Specific**: Request only needed columns (avoid `SELECT *`)
- **Index**: Index columns in WHERE, JOIN, ORDER BY clauses
- **Timeouts**: Implement to prevent runaway queries
- **Bulk Operations**: Use Prisma's `createMany` and `updateMany` for batch operations
- **Cursor Pagination**: Use for large datasets over offset methods
- **Transactions**: Wrap related operations to maintain consistency
- **Caching**: Cache expensive queries in Redis with short TTLs (1–5m), invalidate on writes
- **Monitoring**: Analyze slow queries with `EXPLAIN ANALYZE` and `pg_stat_statements`
