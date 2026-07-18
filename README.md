# Policy Validation

Policy Validation is a policy-based validation toolkit organized as an extendable monorepo. The reusable validation engine is framework-independent, the Angular package adapts it to Angular forms and rendering, and the demo consumes the same Angular public API as an application.

## Packages and application

| Workspace | Package | Responsibility |
| --- | --- | --- |
| `packages/core` | `@policy-validation/core` | Framework-neutral contracts, validators, rules, and validation-state utilities |
| `packages/angular` | `@policy-validation/angular` | Angular forms integration, policy execution, directives, services, components, and display strategies |
| `apps/angular-demo` | private | Browser demo and integration coverage for the Angular adapter |

The dependency direction is deliberately one-way:

```text
apps/angular-demo
        |
        v
packages/angular
        |
        v
packages/core
```

`@policy-validation/angular` re-exports the framework-neutral symbols that were historically part of its public API, so existing Angular imports remain valid. `@policy-validation/core` has no Angular dependency.

## Installation

Angular consumers install the engine, adapter, and Underscore peer dependency together:

```bash
npm install @policy-validation/core @policy-validation/angular underscore
```

Angular framework packages are peer dependencies of `@policy-validation/angular`.

To use the optional default stylesheet, add:

```json
{
  "styles": [
    "node_modules/@policy-validation/angular/styles/policy-validation.css"
  ]
}
```

## Angular quick start

```typescript
import { NgModule } from '@angular/core';
import {
  ValidationModule,
  ValidationPolicy,
  Validator,
  ValidatorHelper
} from '@policy-validation/angular';

export class UserFormPolicy implements ValidationPolicy {
  addValidations(v: ValidatorHelper): Validator[] {
    return [
      v.validateFor('email')
        .isRequired('Email is required')
        .isEmail('Enter a valid email address')
    ];
  }
}

@NgModule({
  imports: [ValidationModule.forRoot({ preset: 'bootstrap' })]
})
export class AppModule {}
```

```html
<input
  [(ngModel)]="model.email"
  policyValidator
  [validateModel]="'user.email'"
  [actualModel]="model"
  [withPolicy]="'UserForm'"
  groupName="userForm"
/>
```

Register the policy with `ValidationProviderService`:

```typescript
validationProvider.register('UserForm', new UserFormPolicy());
validationProvider.registerFormGroupPolicy('userForm', 'UserForm');
```

## Repository setup

Requirements are Node.js 22, npm, and a locally available Chrome/Chromium browser for Karma.

```bash
npm install
npm run architecture:verify
npm test
npm run build:all
```

Common commands:

| Command | Purpose |
| --- | --- |
| `npm start` | Build both packages and serve `angular-demo` |
| `npm run build:core` | Build the framework-independent package |
| `npm run build:angular` | Build core, then the Angular adapter |
| `npm run build:demo` | Build both packages, then the demo |
| `npm run build:all` | Build the complete monorepo |
| `npm test` | Run all three test suites |
| `npm run test:coverage` | Run all suites with independent 90% coverage gates |
| `npm run test:reports` | Generate browsable test and coverage reports for all projects |
| `npm run reports:open` | Open the generated report dashboard |
| `npm run lint:all` | Lint every configured project |

Build outputs are generated under `dist/`:

```text
dist/
|-- policy-validation-core/  # @policy-validation/core
|-- policy-validation/       # @policy-validation/angular
`-- angular-demo/            # demo browser bundle
```

## Testing and reports

Core, Angular, and demo tests run independently. Each project enforces at least 90% statements, branches, functions, and lines coverage. `npm run test:reports` generates `reports/index.html`, persistent HTML test results, Istanbul source coverage, JSON/LCOV summaries, and JUnit XML.

See [Testing and reports](docs/testing.md) for the command matrix, report paths, coverage scope, CI behavior, and troubleshooting.

## Architecture

The repository contains only the abstractions justified by the current Angular implementation. It does not include React, Vue, placeholder adapters, or a speculative shared package.

The Angular expression-based `Policy` executor remains in the Angular adapter because it uses `@angular/compiler`. Moving it into core without changing behavior requires a future parser abstraction. See [Architecture](docs/architecture.md) for package boundaries, extraction decisions, dependency enforcement, and extension guidance.

## Public API compatibility

Existing consumers can continue importing these framework-neutral symbols from `@policy-validation/angular`:

- `ValidationPolicy`, `ValidationModel`
- `Validator`, `ValidatorHelper`, `ValidationHelper`
- validation result and group-state contracts
- `clearTouchedFieldsForPrefix`

New framework-neutral integrations may import the broader engine utilities directly from `@policy-validation/core`.

## Contributing

Before opening a pull request, run:

```bash
npm ci
npm run architecture:verify
npm run test:reports
npm run build:all
npm run lint:all
```

The root package and demo are private. The CI workflow validates boundaries, tests, coverage, report generation, and builds; it does not publish packages.

## License

MIT - see [LICENSE](LICENSE).
