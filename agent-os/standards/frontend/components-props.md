## React components best practices

- **Use React 19**: Leverage React 19 with Strict Mode enabled for improved performance and latest features
- **Modern Features**: Use Suspense, `use()`, `useOptimistic()`, and `useTransition()`
- **Functional Components**: Always use functional components with the `function` keyword
- **Specific Imports**: Import only what you need: `import { useState } from 'react'` (never `import * as React`)
- **Client/Server Directives**: Use `'use client'` for client-side interactivity, `'use server'` for server-only components

## Props & Types

- **Strong Typing**: Strongly type component props; use `PropsWithChildren<T>` for children-only props
- **Props Handling**: Use spread (`...props`) and rest operators for efficient props management
