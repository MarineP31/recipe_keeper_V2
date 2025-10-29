## Maestro end-to-end testing guidelines

### Test Structure & Style

- **User journeys**: focus each flow on a single feature or scenario
- **testID selectors first**: always use `testID` attributes on React Native components; avoid text-based selectors
- **Reusable flows**: extract common sequences (login, navigation) into shared flows; compose with `runFlow`
- **Isolated flows**: `launchApp: clearState: true` to start clean; no cross-flow state dependencies
- **Platform handling**: use `when: platform:` for iOS/Android differences; test both platforms

### Assertions & Interactions

- **No unnecessary waits**: trust Maestro's auto-wait; use `waitForAnimationToEnd` when needed
- **Stable selectors**: prefer `testID` over text that changes with translations; avoid `point(x, y)` coordinates
- **Assertions to prefer**: `assertVisible`, `assertNotVisible` with timeout parameters for network-dependent content
- **Flexible matching**: use regex patterns in assertions; add meaningful assertion messages
- **Parametrize tests**: use `${VARIABLE_NAME}` for flexible test data; define in `env` section or CLI

### Configuration & Environment

- **Project structure**: `.maestro/` directory with subdirectories (`common/`, `features/`, `smoke/`); use `config.yaml`
- **Tagging strategy**: tag by purpose (`smoke`, `regression`) and context (`pr`, `nightly`); use `includeTags`/`excludeTags`
- **Development tools**: `maestro studio` for debugging; `maestro record` for capturing executions
- **CI integration**: use `mobile-dev-inc/action-maestro-cloud` for GitHub Actions; EAS workflows in `.eas/workflows/`
- **Build configuration**: dedicated EAS profile for E2E; APK for Android, simulator for iOS; test against development builds
