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

The Demo Portal exposes the unified report dashboard at `/reports/index.html` after reports have been generated.

## Node application tests

The portal and documentation use Node's test runner for application registry and Markdown rendering behavior. They compile as strict TypeScript before tests execute.

## CI behavior

CI verifies dependency boundaries, runs tests and coverage, validates report navigation, and builds all packages and applications. No package is published by the test workflow.
