# Validation Rules

Validation Rules is an extendable monorepo for policy-driven model and form validation. It separates a framework-independent rules engine from framework adapters, so validation behavior can stay reusable and testable while each UI integration owns its lifecycle and rendering concerns.

The repository ships a core engine and production Angular adapter inside a multi-application developer platform. A framework-neutral portal launches the documentation site, the original ngModel demo, and an Angular + NgRx integration lab from one command.

## Key features

- Fluent, reusable validation rules organized into named policies
- Framework-independent validators, contracts, results, and model-state utilities
- Angular template-driven forms integration through a directive and provider service
- Nested model paths, conditional rules, asynchronous rules, and dependent fields
- Form-group and multi-policy-group validation status
- Field, group, policy-group, and page-level error summaries
- Bootstrap, Angular Material, Tailwind-friendly, generic, automatic, and custom display strategies
- One-command demo platform with application health monitoring and automatic browser launch
- Independent tests, coverage gates, and browsable reports for every Angular workspace project
- Enforced dependency direction from Angular demos to adapter to core

## Why Validation Rules?

Validation logic often becomes scattered across templates, components, event handlers, and backend-shaped models. Validation Rules gives that behavior an explicit home. A policy describes what a model requires; an adapter connects that policy to a framework; display strategies decide how errors appear.

This separation makes rules easier to reuse, test, review, and evolve without tying the engine to a particular UI framework. Existing Angular behavior remains intact while the monorepo provides a clean boundary for future adapters when real implementations are ready.

## Architecture

```text
apps/demo (launcher) ----URLs----> apps/docs
         |                         apps/angular-demo
         |                         apps/angular-ngrx-demo
         |
         +---- application registry and health status

Angular demos --> @validation-rules/angular --> @validation-rules/core
```

Dependencies flow in one direction. The private demo consumes only the Angular package. The Angular adapter consumes the core public entry point. Core has no Angular dependency. `npm run architecture:verify` enforces these boundaries and rejects speculative React or Vue placeholders.

See [Architecture](docs/architecture.md) for ownership decisions and extension guidance.

## Repository structure

```text
validation-rules/
|-- apps/
|   |-- demo/                  # framework-neutral portal, launcher, and health dashboard
|   |-- docs/                  # Markdown-backed documentation website
|   |-- angular-demo/          # original ngModel demo
|   `-- angular-ngrx-demo/     # pure NgRx and Reactive Forms integration patterns
|-- packages/
|   |-- angular/               # @validation-rules/angular and Angular CLI workspace
|   `-- core/                  # @validation-rules/core and core Karma config
|-- docs/
|   |-- site/                  # documentation website source pages
|   |-- architecture.md
|   |-- rebranding-report.md
|   `-- testing.md
|-- tools/
|   |-- architecture/          # dependency-boundary verification
|   `-- testing/               # shared Karma config and persistent reports
|-- package.json               # private npm-workspaces root
`-- tsconfig.json
```

## Installation

Angular consumers install the core engine, Angular adapter, and Underscore peer dependency together:

```bash
npm install @validation-rules/core @validation-rules/angular underscore
```

Angular framework packages are peer dependencies of `@validation-rules/angular`.

To use the optional default stylesheet, add its stable package entry point to the Angular workspace configuration:

```json
{
  "styles": [
    "node_modules/@validation-rules/angular/styles/policy-validation.css"
  ]
}
```

The `policy-validation.css` filename and `policy-validation-*` DOM/CSS hooks are retained as compatibility APIs. Package names and repository identity changed; existing selectors and styling integrations did not.

## Quick start

Define a policy:

```typescript
import {
  ValidationPolicy,
  Validator,
  ValidatorHelper
} from '@validation-rules/angular';

export class UserFormPolicy implements ValidationPolicy {
  addValidations(v: ValidatorHelper): Validator[] {
    return [
      v.validateFor('email')
        .isRequired('Email is required')
        .isEmail('Enter a valid email address')
    ];
  }
}
```

Configure the Angular module and register the policy:

```typescript
import { NgModule } from '@angular/core';
import {
  ValidationModule,
  ValidationProviderService
} from '@validation-rules/angular';

@NgModule({
  imports: [ValidationModule.forRoot({ preset: 'bootstrap' })]
})
export class AppModule {
  constructor(validation: ValidationProviderService) {
    validation.register('UserForm', new UserFormPolicy());
    validation.registerFormGroupPolicy('userForm', 'UserForm');
  }
}
```

Attach the existing directive API to a template-driven control:

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

## Advanced example

Use multiple policies and form groups for a multi-step workflow:

```typescript
validation.register('PersonalInfo', personalInfoPolicy);
validation.register('ShippingAddress', shippingPolicy);
validation.register('BillingAddress', billingPolicy);

validation.registerPolicyGroup('checkout', {
  policies: ['PersonalInfo', 'ShippingAddress', 'BillingAddress'],
  formGroups: ['personalInfo', 'shippingInfo', 'billingInfo']
});

validation.evaluatePolicies(order, ['PersonalInfo', 'ShippingAddress', 'BillingAddress'])
  .subscribe(() => {
    if ((order.validationResults ?? []).length === 0) {
      submitOrder(order);
    }
  });
```

The Angular adapter also supports generated forms through `replacePolicy()`, explicit state cleanup, and custom display strategies.

## Policies

A policy implements `ValidationPolicy` and returns validators for one model concern. Policies are registered under stable names, can be replaced for dynamic forms, and can be evaluated individually or as a set. The existing Angular expression-based `Policy` executor stays in the adapter because it depends on `@angular/compiler`.

## Rules

`ValidatorHelper` creates fluent validators for model paths. `ValidationHelper` supplies built-in checks such as required values, email shape, numbers, ranges, and conditional rules. Core exports the rule engine directly; Angular re-exports its historically public neutral symbols for consumer compatibility.

## Groups

Form groups aggregate field status for one portion of a view. Policy groups aggregate policies and form groups across larger workflows such as checkout or onboarding. Angular status and summary components render these states using the unchanged `policy-validation-*` selectors.

## Package overview

| Workspace | Package | Responsibility |
| --- | --- | --- |
| `packages/core` | `@validation-rules/core` | Framework-neutral contracts, rules, validators, results, and model-state utilities |
| `packages/angular` | `@validation-rules/angular` | Angular policy execution, forms integration, directives, services, components, and display strategies |
| `apps/angular-demo` | private | Browser demo and integration coverage using the Angular public API |
| `apps/angular-ngrx-demo` | private | Store-first and Reactive Forms + NgRx integration examples |
| `apps/docs` | private | Search-ready Markdown documentation server and site shell |
| `apps/demo` | private | Application launcher, status API, report gateway, and product dashboard |

Build artifacts are written beneath `dist/`, with publishable packages kept separate from private applications.

## Demo and documentation platform

Start the complete local experience with one command:

```bash
npm run demo
```

The command builds the packages and Node applications, starts the portal at `http://127.0.0.1:4200`, starts documentation at port `4201`, the original Angular demo at `4202`, and the Angular + NgRx demo at `4203`, then opens the portal in the default browser. The portal polls every registered application and shows startup, healthy, or failed state without coupling their runtimes.

The application registry in `apps/demo/src/applications.ts` is the single place to add a future demo. Each application remains independently runnable and communicates through stable local URLs.

## Roadmap

- Continue strengthening the framework-neutral engine and adapter contract
- Evaluate a parser abstraction that could move expression execution out of Angular without changing behavior
- Improve package release coordination and consumer migration tooling after package names are approved
- Add React, Vue, playground, or performance applications by registering complete implementations with the portal

No non-Angular framework package or placeholder exists in this repository.

## Development

Requirements are Node.js 22, npm, and a locally available Chrome or Chromium browser for Karma.

```bash
npm install
npm run architecture:verify
npm test
npm run build:all
```

| Command | Purpose |
| --- | --- |
| `npm start` / `npm run demo` | Launch the portal, docs, Angular demo, and Angular + NgRx demo |
| `npm run serve:demo` | Build packages and serve only the original Angular demo |
| `npm run serve:docs` | Build and serve only the documentation site |
| `npm run build` | Build core and the Angular adapter in dependency order |
| `npm run build:all` | Build packages, both Node applications, and both Angular demos |
| `npm run build:demo` / `npm run build:ngrx-demo` | Build one Angular demo and its package dependencies |
| `npm test` | Run Node application tests and every Angular/Karma suite |
| `npm run test:coverage` | Run all tests and independent Angular 90% coverage gates |
| `npm run test:reports` | Generate and verify browsable reports for every project |
| `npm run reports:open` | Open the generated report dashboard |
| `npm run lint:all` | Lint every configured project |

See [Testing and reports](docs/testing.md) for report locations, coverage scope, CI behavior, and troubleshooting.

## Contributing

Keep changes within the established dependency direction and preserve public behavior unless a breaking release is explicitly planned. Before opening a pull request, run:

```bash
npm ci
npm run architecture:verify
npm run test:reports
npm run build:all
npm run lint:all
```

Add behavior-focused tests with production changes, do not exclude executable code to raise coverage, and do not scaffold future-framework packages without an implementation. The root and demo packages are private. CI validates the repository but does not publish packages.

## License

MIT - see [LICENSE](LICENSE).
