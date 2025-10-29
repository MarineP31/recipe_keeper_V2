## Database model best practices

- **Naming**: Singular for models, plural `snake_case` for tables
- **Timestamps**: Include `created_at` and `updated_at` as `TIMESTAMPTZ` on all tables
- **Primary Keys**: UUID v4 with `DEFAULT gen_random_uuid()`
- **Public IDs**: Add unique `public_id` (VARCHAR) for entities in public URLs (e.g., nanoid, slugs)
- **Appropriate Types**: Match data types to purpose and size requirements
- **Constraints**: Use NOT NULL, UNIQUE, foreign keys, CHECK to enforce rules
- **Relationships**: Define clearly with appropriate cascade behaviors
- **Multi-Layer Validation**: Validate at both model and database levels
- **Indexing**: Index foreign keys, frequently queried fields, partial unique indexes for soft-deletes, GIN for full-text
- **Normalization**: Target 3NF, balance with query performance, avoid derived values, use junction tables for many-to-many
- **Soft Deletes**: Add nullable `deleted_at TIMESTAMPTZ` for data retention
- **RLS**: Enable Row Level Security for user/tenant data isolation
