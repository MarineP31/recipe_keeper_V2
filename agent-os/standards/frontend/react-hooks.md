## Hooks

- **Custom Hooks**: Extract reusable logic into custom hooks
- **Rules of Hooks**: Only call hooks at the top level, not in loops or conditions
- **useEffect**: Provide correct dependency arrays and implement cleanup functions
- **Complex State**: Use useReducer for complex state logic
- **No Manual Memoization**: DO NOT use `useMemo` or `useCallback`; rely on React Compiler for optimization
