# Monorepo migration report

## Repository structure

```text
policy-validation/
|-- apps/angular-demo/          # private Angular application
|-- packages/angular/           # @policy-validation/angular adapter
|-- packages/core/              # @policy-validation/core engine
|-- docs/                        # architecture, testing, and migration records
|-- tools/architecture/          # dependency-boundary verification
|-- tools/testing/               # persistent report pipeline
|-- angular.json
|-- package.json                 # private npm-workspaces root
`-- tsconfig.json
```

`packages/angular/src/lib` contains components, directives, display configuration, parser, providers, services, strategies, styles, tokens, and DOM utilities. `packages/core/src/lib` contains validators, contracts, and model-state utilities. `apps/angular-demo/src/app` contains the unchanged demo routes, pages, forms, layout, models, and integration specifications.

There is no `shared` package because the current code has no additional ownership boundary that justifies one. No future-framework source or placeholder package was added.

## Files moved

### Demo application

Every file below moved from `projects/demo-app/<relative path>` to `apps/angular-demo/<relative path>`:

```text
.eslintrc.json
tsconfig.app.json
tsconfig.spec.json
src/favicon.ico
src/index.html
src/main.ts
src/styles.sass
src/assets/.gitkeep
src/app/app-routing.module.ts
src/app/app.component.html
src/app/app.component.sass
src/app/app.component.ts
src/app/app.integration.spec.ts
src/app/app.module.ts
src/app/application-behavior.spec.ts
src/app/validation.providers.ts
src/app/components/complex-form/complex-form-material.component.html
src/app/components/complex-form/complex-form-material.component.sass
src/app/components/complex-form/complex-form-material.component.ts
src/app/components/complex-form/complex-form-tailwind.component.html
src/app/components/complex-form/complex-form-tailwind.component.sass
src/app/components/complex-form/complex-form-tailwind.component.ts
src/app/components/complex-form/complex-form.component.html
src/app/components/complex-form/complex-form.component.sass
src/app/components/complex-form/complex-form.component.ts
src/app/components/complex-form/complex-form.validation.policy.ts
src/app/components/performance-form/performance-components.spec.ts
src/app/components/performance-form/performance-form-builder.service.spec.ts
src/app/components/performance-form/performance-form-builder.service.ts
src/app/components/performance-form/performance-form-error-summary.component.html
src/app/components/performance-form/performance-form-error-summary.component.sass
src/app/components/performance-form/performance-form-error-summary.component.ts
src/app/components/performance-form/performance-form-section.component.html
src/app/components/performance-form/performance-form-section.component.sass
src/app/components/performance-form/performance-form-section.component.ts
src/app/components/performance-form/performance-form.component.html
src/app/components/performance-form/performance-form.component.sass
src/app/components/performance-form/performance-form.component.ts
src/app/components/performance-form/performance-form.validation.policy.ts
src/app/components/sample-form/sample-form-material.component.html
src/app/components/sample-form/sample-form-material.component.sass
src/app/components/sample-form/sample-form-material.component.ts
src/app/components/sample-form/sample-form-tailwind.component.html
src/app/components/sample-form/sample-form-tailwind.component.sass
src/app/components/sample-form/sample-form-tailwind.component.ts
src/app/components/sample-form/sample-form.component.html
src/app/components/sample-form/sample-form.component.sass
src/app/components/sample-form/sample-form.component.ts
src/app/components/sample-form/sample-form.validation.policy.ts
src/app/demo/demo-framework.model.ts
src/app/demo/demo-framework.providers.ts
src/app/layout/demo-shell.component.html
src/app/layout/demo-shell.component.sass
src/app/layout/demo-shell.component.ts
src/app/models/complex-form.model.ts
src/app/models/performance-form.model.ts
src/app/models/sample-form.model.ts
src/app/pages/docs/docs-sections.ts
src/app/pages/docs/docs.component.html
src/app/pages/docs/docs.component.sass
src/app/pages/docs/docs.component.ts
src/app/pages/framework-demo/framework-demo.component.html
src/app/pages/framework-demo/framework-demo.component.sass
src/app/pages/framework-demo/framework-demo.component.ts
src/app/pages/home/home.component.html
src/app/pages/home/home.component.sass
src/app/pages/home/home.component.ts
```

### Angular adapter

Every file below moved from `projects/core/<relative path>` to `packages/angular/<relative path>`:

```text
.eslintrc.json
LICENSE
README.md
ng-package.json
package.json
tsconfig.lib.json
tsconfig.lib.prod.json
tsconfig.spec.json
src/public-api.ts
src/lib/policy.spec.ts
src/lib/policy.ts
src/lib/validation.module.ts
src/lib/components/validation-components.spec.ts
src/lib/components/validation-group-status.component.ts
src/lib/components/validation-group-summary.component.ts
src/lib/components/validation-policy-group-status.component.ts
src/lib/components/validation-policy-group-summary.component.ts
src/lib/components/validation-summary.component.ts
src/lib/directives/validator.directive.spec.ts
src/lib/directives/validator.directive.ts
src/lib/display/abstract-validation-display.strategy.ts
src/lib/display/validation-display-config.spec.ts
src/lib/display/validation-display.config-resolver.ts
src/lib/display/validation-display.constants.ts
src/lib/display/validation-display.factory.ts
src/lib/display/examples/prime-ng-display.example.ts
src/lib/interfaces/validation-display.interface.ts
src/lib/parser/expression-parser.spec.ts
src/lib/parser/expression-parser.ts
src/lib/providers/validation-display.providers.ts
src/lib/services/validation-provider.service.spec.ts
src/lib/services/validation-provider.service.ts
src/lib/strategies/bootstrap-validation-display.strategy.ts
src/lib/strategies/default-validation-display.strategy.ts
src/lib/strategies/generic-validation-display.strategy.ts
src/lib/strategies/material-validation-display.strategy.ts
src/lib/strategies/tailwind-validation-display.strategy.ts
src/lib/strategies/validation-display-strategies.spec.ts
src/lib/styles/policy-validation.css
src/lib/tokens/validation-display-strategy.token.ts
src/lib/tokens/validation-display.token.ts
src/lib/utils/dom.util.ts
src/lib/utils/validation-utils.spec.ts
```

### Core extraction

| Previous path | New path |
| --- | --- |
| `projects/core/src/lib/validation-helper.ts` | `packages/core/src/lib/validation-helper.ts` |
| `projects/core/src/lib/validation-helper.spec.ts` | `packages/core/src/lib/validation-helper.spec.ts` |
| `projects/core/src/lib/validator.ts` | `packages/core/src/lib/validator.ts` |
| `projects/core/src/lib/validator.spec.ts` | `packages/core/src/lib/validator.spec.ts` |
| `projects/core/src/lib/validator-helper.ts` | `packages/core/src/lib/validator-helper.ts` |
| `projects/core/src/lib/interface/validation-policy.interface.ts` | `packages/core/src/lib/interfaces/validation-policy.interface.ts` |
| `projects/core/src/lib/interface/validation-model.interface.ts` | `packages/core/src/lib/interfaces/validation-model.interface.ts` |
| `projects/core/src/lib/interfaces/validation-result.interface.ts` | `packages/core/src/lib/interfaces/validation-result.interface.ts` |
| `projects/core/src/lib/utils/validation-meta.util.ts` | `packages/core/src/lib/utils/validation-meta.util.ts` |

The former `projects/core/src/lib/utils/validation-utils.spec.ts` was split by ownership into `packages/core/src/lib/utils/validation-utils.spec.ts` and `packages/angular/src/lib/utils/validation-utils.spec.ts`. `isValidationFailure` moved from the former Angular DOM utility into `packages/core/src/lib/utils/validation-result.util.ts`.

The Karma entry `karma.demo-app.conf.cjs` moved to `karma.angular-demo.conf.cjs` and now targets `angular-demo`.

## Files modified

Existing workspace/tooling files:

```text
.eslintrc.json
.github/workflows/test.yml
.gitignore
README.md
angular.json
docs/testing.md
karma.shared.conf.cjs
package-lock.json
package.json
tools/testing/generate-report-index.mjs
tools/testing/persistent-test-results-reporter.cjs
tools/testing/report-paths.mjs
tools/testing/run-all-reports.mjs
tools/testing/run-project-report.mjs
tsconfig.json
```

Moved Angular files modified for the core dependency, tests, or lint configuration:

```text
packages/angular/.eslintrc.json
packages/angular/README.md
packages/angular/package.json
packages/angular/tsconfig.lib.json
packages/angular/tsconfig.spec.json
packages/angular/src/public-api.ts
packages/angular/src/lib/policy.spec.ts
packages/angular/src/lib/policy.ts
packages/angular/src/lib/components/validation-components.spec.ts
packages/angular/src/lib/components/validation-group-status.component.ts
packages/angular/src/lib/components/validation-group-summary.component.ts
packages/angular/src/lib/components/validation-policy-group-status.component.ts
packages/angular/src/lib/components/validation-policy-group-summary.component.ts
packages/angular/src/lib/components/validation-summary.component.ts
packages/angular/src/lib/directives/validator.directive.spec.ts
packages/angular/src/lib/directives/validator.directive.ts
packages/angular/src/lib/display/abstract-validation-display.strategy.ts
packages/angular/src/lib/display/examples/prime-ng-display.example.ts
packages/angular/src/lib/interfaces/validation-display.interface.ts
packages/angular/src/lib/services/validation-provider.service.spec.ts
packages/angular/src/lib/services/validation-provider.service.ts
packages/angular/src/lib/strategies/bootstrap-validation-display.strategy.ts
packages/angular/src/lib/strategies/default-validation-display.strategy.ts
packages/angular/src/lib/strategies/generic-validation-display.strategy.ts
packages/angular/src/lib/strategies/material-validation-display.strategy.ts
packages/angular/src/lib/strategies/tailwind-validation-display.strategy.ts
packages/angular/src/lib/strategies/validation-display-strategies.spec.ts
packages/angular/src/lib/utils/dom.util.ts
packages/angular/src/lib/utils/validation-utils.spec.ts
```

Moved core/demo files modified during the migration:

```text
packages/core/src/lib/interfaces/validation-model.interface.ts
packages/core/src/lib/validation-helper.ts
packages/core/src/lib/validator.ts
packages/core/src/lib/utils/validation-utils.spec.ts
apps/angular-demo/.eslintrc.json
apps/angular-demo/tsconfig.app.json
apps/angular-demo/tsconfig.spec.json
apps/angular-demo/src/app/components/performance-form/performance-form.component.html
```

New files:

```text
apps/angular-demo/package.json
docs/architecture.md
docs/migration-report.md
karma.angular.conf.cjs
packages/core/.eslintrc.json
packages/core/LICENSE
packages/core/README.md
packages/core/ng-package.json
packages/core/package.json
packages/core/src/public-api.ts
packages/core/src/lib/utils/validation-result.util.ts
packages/core/tsconfig.lib.json
packages/core/tsconfig.lib.prod.json
packages/core/tsconfig.spec.json
tools/architecture/verify-dependencies.mjs
```

## Dependency graph

```text
apps/angular-demo
        |
        v
@policy-validation/angular
        |
        v
@policy-validation/core
```

The root uses npm workspaces for `packages/*` and `apps/*`. Angular declares core as a peer dependency. The private demo declares Angular as its workspace dependency and imports no core package directly. The architecture verifier checks this graph locally and in CI.

## Core and Angular summary

Core now owns `ValidationPolicy`, `ValidationModel`, validation result/group contracts, `Validator`, `ValidatorHelper`, `ValidationHelper`, validation metadata/touched-state utilities, and validation failure-shape detection. Its runtime sources and package manifest import no Angular packages.

`Policy`, expression parsing, `ValidationProviderService`, directives, components, display configuration, strategies, DOM helpers, providers, tokens, styles, and `ValidationModule` intentionally remain in Angular. The policy executor uses `@angular/compiler`; replacing that parser would be a behavior-sensitive engine rewrite and was not attempted. The Angular entry point re-exports its historically public neutral symbols from core.

## Workspace changes

- Added npm workspaces and dependency-ordered build, test, coverage, watch, and report scripts.
- Added Angular CLI projects `core`, `angular`, and `angular-demo` with distinct roots, TypeScript outputs, build artifacts, test targets, and lint scopes.
- Expanded reporting from two targets to three, including separate HTML, JSON, LCOV, and JUnit roots and a three-card dashboard.
- Kept 90% global thresholds for statements, branches, functions, and lines on every target.
- Added a GPU-disabled local Chrome launcher while retaining the no-sandbox CI launcher.
- Repaired lint discovery for the new paths and retained a legacy-compatible rules baseline without converting NgModule artifacts or changing public types.
- Added a dependency-boundary guard to CI before reports and builds.

## Validation

| Check | Result |
| --- | --- |
| `npm install` | Passed; workspace links created and audit found 0 vulnerabilities |
| `npm run architecture:verify` | Passed |
| `npm run build` | Passed for core and Angular packages |
| `ng build angular-demo --configuration production` | Passed; existing 1.5 MB warning remains below the 2 MB error budget |
| `npm test` | Passed: core 16, Angular 91, demo 65 tests |
| `npm run test:coverage` | Passed all independent 90% gates |
| `npm run test:ci` | Passed full clean report pipeline |
| Report verification | Passed HTML, JSON, LCOV, JUnit, mappings, and local links |
| `ng lint` | Passed all three projects |
| `git diff --check` | Passed |

| Project | Statements | Branches | Functions | Lines |
| --- | ---: | ---: | ---: | ---: |
| Core | 99.49% | 98.43% | 100% | 99.49% |
| Angular | 97.14% | 90.32% | 99.63% | 97.09% |
| Angular demo | 98.86% | 92.70% | 100% | 98.83% |

## Risks and future review points

- Angular's expression parser still anchors policy execution to the adapter; a future parser port is required before moving that executor into core.
- Core still uses Underscore as a peer to preserve existing validator behavior.
- Package versions are aligned manually; release and publish automation is deliberately outside this milestone.
- The demo production bundle is 1.75 MB and emits the existing warning, although the build succeeds below its error budget.

No packages were published, and no tags or releases were created. This migration stops here for human review.
