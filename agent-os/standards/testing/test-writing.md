## Test coverage best practices

- **Test Behavior**: Focus on what code does, not how
- **Clear Names**: Descriptive names explaining what's tested and expected outcome
- **Independent**: Each test runs independently without shared state
- **AAA Pattern**: Arrange, Act, Assert
- **One Concept**: Test one behavior per test
- **User Workflows**: Validate from user's perspective

## Implementation

- **Testing Library APIs**: Use `render` or `renderHook`
- **Fast Execution**: Keep unit tests in milliseconds
- **Code Quality**: Apply same standards to test code

## Coverage

- **Minimum Threshold**: 80% baseline, but prioritize meaningful tests
- **Critical Paths**: 90%+ on business logic, auth, payments
- **Quality Over Quantity**: Focus on behavior and edge cases
- **Track Trends**: Monitor to catch regressions
- **Exclude**: Don't count generated code, test files, config

## Queries & Interactions

- **Query Priority**: `getByRole` → `getByLabelText` → `getByText` → `getByTestId` (last resort)
- **User Events**: Use `userEvent` over `fireEvent`
- **Visibility**: Use `toBeVisible()` for displayed UI

## Mocking

- **Edge Cases**: Include boundary conditions, empty inputs, null values, errors
- **External Dependencies**: Mock databases, APIs, file systems for unit tests
- **Avoid Internal Mocking**: Don't mock sub-components in integration tests
