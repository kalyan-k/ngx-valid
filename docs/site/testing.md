# Testing, Coverage & Reports

The repository tests the core engine, Angular adapter, Angular demos, portal, and documentation application while keeping coverage results isolated by Angular target.

## Common commands

```bash
npm test
npm run test:coverage
npm run test:reports
npm run test:ci
```

## Coverage gates

Every Karma target enforces at least 90% statements, branches, functions, and lines. A strong result in one project cannot hide a weak result in another.

## Persistent reports

Each Angular target writes:

- browsable test execution HTML,
- JSON summaries,
- JUnit XML,
- Istanbul HTML coverage,
- LCOV and coverage-summary JSON.

The Demo Portal exposes the unified report dashboard at `/reports/index.html` after reports have been generated. Its left navigation tree separates collapsible Packages and Demo Applications groups, both expanded by default. Summary, Tests, and Coverage tabs update one right-hand workspace with Summary selected initially, so report exploration stays in a single browser tab.

The dashboard, test execution pages, and coverage wrappers share product navigation and a collapsible metadata summary with application name, version, report type, and generation time. The summary starts expanded, collapses automatically after about ten seconds, and remembers a manual preference for the current browser session. Coverage views embed untouched Istanbul pages, preserving folder navigation, source views, highlighting, and generated metrics.

## Node application tests

The portal and documentation use Node's test runner for application registry and Markdown rendering behavior. They compile as strict TypeScript before tests execute.

## CI behavior

CI verifies dependency boundaries, runs tests and coverage, validates report navigation, and builds all packages and applications. No package is published by the test workflow.
