# Architecture

## Goals

Validation Rules separates reusable validation behavior from Angular integration while preserving the established Angular API and runtime behavior. The workspace is intentionally small: one framework-neutral engine, one implemented framework adapter, and one real consumer application.

```text
validation-rules/
|-- packages/
|   |-- core/                 # @validation-rules/core
|   `-- angular/              # @validation-rules/angular and Angular CLI workspace
|-- apps/
|   `-- angular-demo/         # private Angular consumer and its Karma config
|-- tools/
|   |-- architecture/         # dependency-boundary verification
|   `-- testing/              # shared Karma config and persistent report pipeline
|-- package.json              # private npm-workspaces root
`-- tsconfig.json
```

There is no `shared` package because the current code has no additional ownership boundary that justifies one. Future-framework adapters and demos are not scaffolded until they have complete implementations.

## Dependency graph

```text
@validation-rules/angular-demo (private app)
                  |
                  | dependency
                  v
     @validation-rules/angular
                  |
                  | peer dependency
                  v
       @validation-rules/core
```

The demo imports only `@validation-rules/angular`. The Angular adapter imports `@validation-rules/core`. Core imports neither Angular nor an adapter. npm workspaces link the local packages during repository development; TypeScript path mappings support tests and local compilation.

Run `npm run architecture:verify` to validate this direction. CI runs the same command before tests. The verifier rejects Angular dependencies in core, reverse adapter imports, direct demo-to-core imports, missing workspace relationships, and out-of-scope React or Vue placeholders.

## Core engine boundary

`packages/core` owns behavior that does not require a framework runtime:

- `ValidationPolicy` and `ValidationModel` contracts
- validation result, required-state, form-group, and policy-group types
- `Validator`, `ValidatorHelper`, and built-in `ValidationHelper` rules
- validation metadata, touched-field, reset, and failure-shape utilities

The package compiles as a publishable Angular Package Format library through ng-packagr, but its runtime sources and manifest have no Angular dependency. Reusing the workspace packager avoids introducing a second build system solely for the neutral package.

## Angular adapter boundary

`packages/angular` owns framework-specific behavior:

- `ValidationModule` and providers
- `ValidationProviderService`
- `ValidatorDirective`
- summary and status components
- DOM rendering utilities and display strategies
- Angular expression parsing and `Policy` execution

The adapter consumes engine types and helpers through the `@validation-rules/core` public entry point. Its own entry point re-exports neutral symbols that existing Angular consumers historically imported from the adapter.

## Compatibility boundary

The repository, npm scope, imports, package metadata, report titles, and build destinations use the Validation Rules identity. Existing runtime and public API contracts remain unchanged:

- Angular selectors such as `policy-validation-group-status`
- the `policyValidator` directive selector and inputs
- DOM attributes and `policy-validation-*` CSS classes
- the `styles/policy-validation.css` package export
- public policy-domain types such as `ValidationPolicy`, `Policy`, and `POLICY_VALIDATION_DOM`

Those names are compatibility hooks or domain concepts, not workspace branding. Renaming them would require a separately planned breaking release and consumer migration.

## Why policy execution remains in Angular

The existing `Policy` implementation creates expressions through `@angular/compiler`. Moving that implementation to core would give core an Angular dependency, while replacing the parser would be a behavioral rewrite with compatibility risk.

A future extraction should first define a small expression-evaluator port in core, provide an Angular-backed implementation in the adapter, and run the existing policy specifications against both evaluators. Until that work is justified, the current boundary is the safest behavior-preserving design.

## Demo boundary

`apps/angular-demo` is a private application. It consumes the Angular package name instead of package source paths, making its builds and integration tests representative of real consumers. Its routes, forms, display presets, and interaction behavior remain unchanged.

## Build order

Package builds follow dependency order:

1. `@validation-rules/core` to `dist/validation-rules-core`
2. `@validation-rules/angular` to `dist/validation-rules-angular`
3. `angular-demo` to `dist/angular-demo`

The root scripts encode this order and delegate Angular CLI commands to the workspace configuration owned by `packages/angular`. Individual project targets remain available for focused development, but the Angular package build requires a current core artifact.

## Testing ownership

Specifications live beside the code whose behavior they protect:

- Core validator and metadata tests live under `packages/core`.
- Angular services, policy execution, directive, component, parser, display, and DOM tests live under `packages/angular`.
- Application and integration tests live under `apps/angular-demo`.

Each target generates separate HTML, JSON, LCOV, and JUnit reports and independently enforces 90% global thresholds. High coverage in one layer cannot hide gaps in another.

## Adding an adapter

Add a framework adapter only when there is concrete integration to implement. A complete adapter should:

1. Depend on `@validation-rules/core` without introducing a reverse dependency.
2. Own its framework lifecycle, form bindings, and rendering behavior.
3. Export a deliberate public entry point and document its compatibility contract.
4. Include a private application that consumes the package name rather than source paths.
5. Carry independent lint, build, test, coverage, and report targets.
6. Extend the architecture guard and CI pipeline.

If two or more adapters later share non-engine infrastructure, evaluate a shared package at that time; do not add one preemptively.

## Known risks and opportunities

- The Angular expression parser still anchors policy execution to the adapter.
- `underscore` remains a core peer dependency to preserve validator semantics.
- Package versions and compatibility are aligned manually; publishing and release automation are outside this repository milestone.
- Compatibility identifiers retain their historic names and require clear documentation for new consumers.
