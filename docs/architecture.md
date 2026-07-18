# Architecture

## Goals

The workspace separates reusable validation behavior from Angular integration while preserving the existing Angular API and runtime behavior. The structure is intentionally small: one engine package, one framework adapter, and one real demo application.

```text
policy-validation/
|-- packages/
|   |-- core/                 # @policy-validation/core
|   `-- angular/              # @policy-validation/angular
|-- apps/
|   `-- angular-demo/         # private Angular application
|-- tools/
|   |-- architecture/         # dependency-boundary verification
|   `-- testing/              # persistent report pipeline
|-- angular.json
|-- package.json              # private npm-workspaces root
`-- tsconfig.json
```

No `shared` package exists because there is no third ownership boundary to justify one. React and Vue adapters and demos are not scaffolded until they have a real implementation.

## Dependency graph

```text
@policy-validation/angular-demo (private app)
                 |
                 | dependency
                 v
    @policy-validation/angular
                 |
                 | peer dependency
                 v
      @policy-validation/core
```

The demo imports only `@policy-validation/angular`. The Angular adapter imports `@policy-validation/core`. Core imports neither Angular nor an adapter. npm workspaces link the three local packages during repository development; TypeScript path mappings support tests and local compilation.

Run `npm run architecture:verify` to validate this direction. CI runs the same command before tests. The verifier rejects Angular dependencies in core, reverse adapter imports, direct demo-to-core imports, missing workspace relationships, and out-of-scope React/Vue placeholders.

## Core engine boundary

`packages/core` owns behavior that does not require a framework runtime:

- `ValidationPolicy` and `ValidationModel` contracts
- validation result, required-state, form-group, and policy-group types
- `Validator`, `ValidatorHelper`, and built-in `ValidationHelper` rules
- validation metadata, touched-field, reset, and failure-shape utilities

The package compiles as a publishable Angular Package Format library through ng-packagr, but its runtime sources and package manifest have no Angular dependency. Reusing the existing packager avoids introducing another build system solely for this extraction.

## Angular adapter boundary

`packages/angular` owns all Angular-specific behavior:

- `ValidationModule` and providers
- `ValidationProviderService`
- `ValidatorDirective`
- summary and status components
- DOM rendering utilities and display strategies
- Angular expression parsing and `Policy` execution

The adapter consumes engine types and helpers through the `@policy-validation/core` public entry point. Its public entry point re-exports the framework-neutral symbols that the original Angular package exposed, preserving consumer imports from `@policy-validation/angular`.

## Why policy execution remains in Angular

The existing `Policy` implementation creates expressions through `@angular/compiler`. Moving that implementation to core would give core an Angular dependency, while replacing the parser would be a behavioral rewrite with compatibility risk. This migration therefore keeps the parser and executor in the adapter.

A future extraction should first define a small expression-evaluator port in core, provide an Angular-backed implementation in the adapter, and run the existing policy specifications against both the old and proposed evaluators. Until that work is justified, the present boundary is the safest honest separation.

## Demo boundary

`apps/angular-demo` is a private application. It consumes the Angular package name rather than reaching into package source paths, which makes its builds and integration tests representative of real consumers. It keeps its existing routing, forms, display presets, and runtime behavior.

## Build order

Package builds follow dependency order:

1. `@policy-validation/core` to `dist/policy-validation-core`
2. `@policy-validation/angular` to `dist/policy-validation`
3. `angular-demo` to `dist/angular-demo`

The root scripts encode this order. Individual project targets remain available for focused development, but an Angular adapter package build requires a current core build artifact.

## Testing ownership

Specifications moved with their owning production code:

- Core validator and metadata tests live under `packages/core`.
- Angular services, policy execution, directive, component, parser, display, and DOM tests live under `packages/angular`.
- Application and integration tests live under `apps/angular-demo`.

Each target generates separate test, coverage, and JUnit reports and enforces the same 90% global thresholds. This prevents high coverage in one layer from hiding gaps in another.

## Extension policy

Add a new framework adapter only when there is concrete framework integration to implement. It should depend on `@policy-validation/core`, own its lifecycle/rendering bindings, and receive an application that exercises its public package entry point. If two or more adapters later share non-engine build or test infrastructure, evaluate a `shared` package then; do not add one preemptively.

## Known risks and follow-up opportunities

- The policy executor is not yet framework-independent because of the Angular expression parser.
- The packages share a root toolchain and version today; independent release automation is outside this migration.
- `underscore` remains a core peer dependency to preserve current validator semantics. Replacing it should be a separately tested change.
- The Angular adapter uses a core peer dependency, so published releases must keep compatible versions aligned. This repository does not automate publishing.
