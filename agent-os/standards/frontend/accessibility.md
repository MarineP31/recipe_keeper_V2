## UI accessibility best practices

- **WCAG 2.1 AA**: Apply across web and mobile with semantic elements and platform-native APIs
- **Contrast**: 4.5:1 for text, 3:1 for large text/UI
- **Semantic HTML**: Use nav, main, button, etc.
- **ARIA**: Use when semantic HTML insufficient
- **Headings**: Use h1-h6 in proper order (web)
- **Keyboard**: All interactive elements accessible with visible focus indicators
- **Focus Management**: Handle for modals, dynamic content, and SPAs
- **Color**: Don't rely solely on color to convey information
- **Alt Text**: Descriptive for images; `alt=""` for decorative (web), `accessible={false}` (React Native)
- **Roles**: Use native roles; don't duplicate implicit ones
- **State**: Use `aria-*` (web) or `accessibilityState` (React Native)
- **Labels**: Link with `htmlFor`/`id` (web) or `accessibilityLabel` (React Native)
- **Required Fields**: Mark in text, not color; provide format hints
- **Validation**: Use `role="alert"` or live regions (web); `AccessibilityInfo.announceForAccessibility` (React Native)
- **Autofill**: Proper `type`, `inputMode`, `autoComplete`, `keyboardType`
- **Enter Key**: Use `enterKeyHint` on inputs with submit actions
- **Live Regions**: `aria-live` (web) or `AccessibilityInfo` (React Native)
- **Motion**: Respect reduced motion; provide controls; avoid flashing >3/second
