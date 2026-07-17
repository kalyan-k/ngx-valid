# Testing and reports

This workspace tests the publishable `core` Angular library and private `demo-app` separately. Each project has its own test results, coverage reports, JUnit file, and independently enforced 90% coverage gate.

## Framework and reporting tools

Tests use Jasmine 5.4, Angular TestBed, Karma 6.4, and headless Chrome. This preserves the existing Angular CLI-integrated runner used for component templates, dependency injection, directives, DOM rendering, routing, and browser events.

Two different HTML reports are generated:

- The persistent test-execution report is produced by the repository-owned `persistent-test-results` Karma reporter in `tools/testing/persistent-test-results-reporter.cjs`. It records suites, individual cases, passed/failed/skipped status, duration, timestamps, repository-relative spec-file names, browser information, and failure logs/stack traces. It also writes JUnit XML.
- The code-coverage report is the standard Istanbul HTML report produced by `karma-coverage`. It provides folder and file navigation, statement/branch/function/line metrics, and highlighted covered, uncovered, and partially covered source lines.

The existing interactive `kjhtml` browser page and console progress remain enabled for local use. Unlike `kjhtml`, the persistent report remains available after Karma exits and works when opened directly from the file system.

Karma 6 expects older `glob` and `minimatch` APIs. `tools/karma-glob-compat.cjs` adapts the two `glob` properties Karma reads, while a scoped npm override gives Karma patched `minimatch` 3.1.4. This compatibility is limited to the test runner.

Both Angular test targets and the demo Webpack build enable `preserveSymlinks` so TypeScript compilation and Webpack module paths remain identical when a contributor opens the workspace through a junction or symbolic link. Regular checkouts use the same configuration without a behavior change.

## Install and commands

```bash
npm ci

npm run test:reports:core     # clean and generate core test, coverage, and JUnit reports
npm run test:reports:demo     # clean and generate demo-app reports
npm run test:reports          # clean all reports, run both projects, generate dashboard
npm run reports:open          # open reports/index.html with the platform browser
npm run reports:clean         # delete only the generated reports directory
npm run reports:index         # rebuild the dashboard from current report summaries
npm run reports:verify        # validate report structure, source mappings, and local links
```

Existing test commands remain available:

```bash
npm test
npm run test:core
npm run test:demo
npm run test:coverage
npm run test:coverage:core
npm run test:coverage:demo
npm run test:ci              # full report pipeline using ChromeHeadlessCI
npm run test:watch:core
npm run test:watch:demo
```

For interactive debugging, run the relevant watch command and use the browser URL printed by Karma. Keep focused or disabled Jasmine helpers such as `fdescribe`, `fit`, `xdescribe`, and `xit` out of committed code.

## Report locations

| Report | Path |
| --- | --- |
| Unified dashboard | `reports/index.html` |
| Core test execution | `reports/core/tests/index.html` |
| Core test summary | `reports/core/tests/summary.json` |
| Core coverage | `reports/core/coverage/index.html` |
| Core LCOV / JSON | `reports/core/coverage/lcov.info`, `reports/core/coverage/coverage-summary.json` |
| Core JUnit | `reports/core/junit/test-results.xml` |
| Demo test execution | `reports/demo-app/tests/index.html` |
| Demo test summary | `reports/demo-app/tests/summary.json` |
| Demo coverage | `reports/demo-app/coverage/index.html` |
| Demo LCOV / JSON | `reports/demo-app/coverage/lcov.info`, `reports/demo-app/coverage/coverage-summary.json` |
| Demo JUnit | `reports/demo-app/junit/test-results.xml` |

`reports/` and the legacy `coverage/` directory are generated and ignored by Git. The clean scripts resolve paths relative to the repository, validate the workspace identity, and remove only the expected report directory.

## Failure behavior

Project report commands return Karma's non-zero status for test or coverage failures and separately fail when required report files are missing. The all-project runner always attempts both projects, creates the dashboard from whatever results are available, and finally returns non-zero if either project or report validation failed. This preserves the available HTML and JUnit failure details without converting failures into successful execution.

Karma supplies failure messages and mapped stack traces through each failed Jasmine result. Passing tests do not expose their source location through Karma's result API, so the persistent reporter maps them to spec files by suite and test descriptions. Dynamically generated descriptions that cannot be mapped are displayed as “Not exposed by the runner.” A compilation failure that occurs before Karma starts cannot produce per-test results, although the command still fails.

## Coverage gates

`karma.shared.conf.cjs` enforces these global minimums separately for both projects:

| Metric | Core minimum | Demo minimum |
| --- | ---: | ---: |
| Statements | 90% | 90% |
| Branches | 90% | 90% |
| Functions | 90% | 90% |
| Lines | 90% | 90% |

A below-threshold metric returns a non-zero process exit code locally and in CI. HTML generation does not weaken threshold enforcement, and the console continues to print the exact failing metric.

## Coverage scope and exclusions

All executable TypeScript reached by each project's tests is instrumented. Exclusions are intentionally narrow:

- Core `projects/core/src/public-api.ts`: package barrel with exports only.
- Core `projects/core/src/lib/interface/**/*.ts`: type-only legacy interface declarations.
- Core `projects/core/src/lib/interfaces/validation-result.interface.ts`: type-only declaration.
- Demo `projects/demo-app/src/main.ts`: Angular platform bootstrap only; application bootstrap behavior is covered through `AppModule` integration tests.

Do not exclude executable production code merely to raise a percentage. Add behavior-focused tests, or refactor genuinely unreachable/dead code after review.

## Test inventory

### Core library

| Production surface | Primary specifications |
| --- | --- |
| Built-in validators and fluent validator construction | `validator.spec.ts`, `validation-helper.spec.ts` |
| Policy execution, dependencies, nested paths, async rules, required and group state | `policy.spec.ts` |
| Angular expression parsing and generated evaluators | `parser/expression-parser.spec.ts` |
| Policy registration, replacement, refresh, cleanup, policy/form groups | `services/validation-provider.service.spec.ts` |
| Directive binding, lifecycle, events, UI refresh, and teardown | `directives/validator.directive.spec.ts` |
| Display configuration, factories, providers, module setup | `display/validation-display-config.spec.ts` |
| Bootstrap, Material, Tailwind, generic, default, and Prime-style DOM behavior | `strategies/validation-display-strategies.spec.ts` |
| Validation summary and group status/summary components | `components/validation-components.spec.ts` |
| DOM and validation metadata helpers | `utils/validation-utils.spec.ts` |

### Demo application

| Production surface | Primary specifications |
| --- | --- |
| Models, policies, registrations, routes, and page/component actions | `application-behavior.spec.ts` |
| Real AppModule routing, rendered forms, clicks, clear, and submit flows | `app.integration.spec.ts` |
| Performance-form configuration and deterministic dynamic form creation | `components/performance-form/performance-form-builder.service.spec.ts` |
| Performance form, section, field, and error-summary rendering and state transitions | `components/performance-form/performance-components.spec.ts` |

Tests are colocated with the production code and named `*.spec.ts`. Pure rules and helpers use direct unit tests. Angular components, directives, services, providers, and routing use TestBed at the smallest useful boundary. Browser DOM APIs are used for visible behavior; external collaborators, clocks, and nondeterministic data are mocked or controlled at their boundary.

## Contributor expectations

Every behavior change should include a regression test in the owning project. Prefer assertions on public behavior, emitted values, model state, and rendered DOM over private implementation details. Cover success, failure, boundary, null/empty, conditional, and asynchronous paths that are meaningful for the change.

Before opening a pull request, run:

```bash
npm ci
npm run test:reports
npm run build:all
```

## CI integration

GitHub Actions installs with `npm ci`, runs `npm run test:reports`, and builds the library and demo after successful tests. GitHub sets `CI=true`, so the report runner selects `ChromeHeadlessCI` automatically. On every run—including failures—`actions/upload-artifact@v4` uploads:

- `policy-validation-test-reports`: the complete `reports/` tree, with `reports/index.html` as its landing page.
- `policy-validation-junit-results`: both `reports/**/junit/test-results.xml` files for CI test tooling.

The runner automatically selects `ChromeHeadlessCI` when the `CI=true` environment variable is present. No package publishing occurs in this workflow.

## Troubleshooting

- Dashboard missing: run `npm run test:reports`; `reports:open` intentionally fails when `reports/index.html` does not exist.
- One project marked incomplete: inspect the console error and the dashboard's missing-output list, then rerun that project's report command.
- Coverage gate failure: open the affected `reports/<project>/coverage/index.html` and navigate to uncovered files and lines; do not add broad exclusions.
- Browser launch failure in containers: use `npm run test:ci`, which selects the no-sandbox `ChromeHeadlessCI` launcher.
- Stale-looking output: use `npm run reports:clean` followed by `npm run test:reports`.
- Interactive test debugging: use the watch command, not the static report command.
