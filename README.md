# Policy Validation

Policy Validation is an Angular library for defining form validation rules as reusable policies instead of scattering validation logic across components and templates.

The npm package is `@policy-validation/angular`.

## Why Policy Validation Exists

Angular forms often start simple and then grow into repeated validators, ad hoc error messages, conditional required logic, and page-level validation state. Policy Validation centralizes those concerns:

- Components stay focused on UI and user flow.
- Validation rules live in policy classes.
- Error display can adapt to Bootstrap, Angular Material, Tailwind, or custom markup.
- Form groups and policy groups make section/page status easy to track.

## Features

- Policy-based validators for template-driven Angular forms
- Fluent rule helpers for required fields, email, phone, ZIP, SSN, VIN, regex, ranges, dates, and custom logic
- Nested model paths such as `personal.email` and `shipping.address.line1`
- Conditional validations based on dependency expressions
- Form-group and policy-group status tracking
- Summary components for all errors, one group, or a policy group
- Pluggable display strategies for Bootstrap, Angular Material, Tailwind-friendly generic markup, and custom UI systems
- Dynamic policy replacement for generated or changing forms

## Installation

```bash
npm install @policy-validation/angular underscore
```

Add the optional stylesheet if you want the built-in default classes:

```json
{
  "styles": [
    "node_modules/@policy-validation/angular/styles/policy-validation.css"
  ]
}
```

## Quick Start

```typescript
import { ValidationModule } from '@policy-validation/angular';

@NgModule({
  imports: [
    ValidationModule.forRoot({ preset: 'bootstrap' })
  ]
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

## Basic Example

```typescript
import { ValidationPolicy, Validator, ValidatorHelper } from '@policy-validation/angular';

export class UserFormPolicy implements ValidationPolicy {
  addValidations(v: ValidatorHelper): Validator[] {
    return [
      v.validateFor('email').isRequired('Email is required').isEmail('Invalid email'),
      v.validateFor('age').isRequired('Age is required').isNumber('Age must be a number')
    ];
  }
}
```

## Advanced Example

```typescript
export class CheckoutPolicy implements ValidationPolicy {
  addValidations(v: ValidatorHelper): Validator[] {
    return [
      v.validateFor('shipping.address.line1').isRequired('Address is required'),
      v.validateFor('shipping.zip').isRequired('ZIP is required').isZip('Invalid ZIP'),
      v.validateFor('billing.cardNumber', 'billing.sameAsShipping === false')
        .isRequired('Card number is required')
        .isRegex(/^[0-9]{16}$/, 'Card number must be 16 digits')
    ];
  }
}
```

## Registering Policies

Register policies during application startup, commonly in an `APP_INITIALIZER`.

```typescript
validationProvider.register('UserForm', new UserFormPolicy());
validationProvider.registerFormGroupPolicy('userForm', 'UserForm');
```

## Unregistering Policies

Dynamic screens can remove policies and group mappings when generated controls are discarded.

```typescript
validationProvider.unregisterPolicy('UserForm');
validationProvider.unregisterFormGroupPolicy('userForm');
validationProvider.unregisterPolicyGroup('checkout');
```

## Groups

Use `groupName` on `policyValidator` to tie controls to a section, then render status and summary components:

```html
<policy-validation-group-status [model]="model" groupName="userForm"></policy-validation-group-status>
<policy-validation-group-summary [model]="model" groupName="userForm"></policy-validation-group-summary>
```

Policy groups aggregate multiple policies or sections for page-level validation:

```typescript
validationProvider.registerPolicyGroup('checkout', {
  policies: ['PersonalInfo', 'ShippingAddress', 'BillingAddress'],
  formGroups: ['personalInfo', 'shippingInfo', 'billingInfo']
});
```

## Dynamic Policies

Use `replacePolicy(name, policy)` when a form is generated at runtime or its fields change.

```typescript
validationProvider.replacePolicy(section.policyName, sectionPolicy);
validationProvider.clearValidationState(model, activePolicyNames);
```

## Validation Lifecycle

1. A policy registers validators under a policy name.
2. `policyValidator` binds a control to `validateModel`, `actualModel`, `withPolicy`, and optional `groupName`.
3. Field validation runs on user interaction and writes validation state to the model.
4. Display strategies render errors, required indicators, and invalid classes.
5. `validateAll()` or `evaluatePolicies()` runs full validation on submit.
6. Group and policy-group components update from the model and refresh events.

## API Documentation

Primary exports include:

- `ValidationModule`
- `ValidationPolicy`
- `Validator`
- `ValidatorHelper`
- `ValidationProviderService`
- `ValidatorDirective`
- `ValidationSummaryComponent`
- `ValidationGroupStatusComponent`
- `ValidationGroupSummaryComponent`
- `ValidationPolicyGroupStatusComponent`
- `ValidationPolicyGroupSummaryComponent`
- `provideBootstrapValidationDisplay()`
- `provideMaterialValidationDisplay()`
- `provideTailwindValidationDisplay()`
- `provideGenericValidationDisplay()`
- `provideCustomValidationDisplay()`

See [projects/core/README.md](projects/core/README.md) for package-focused usage notes.

## Demo

This repository keeps the Angular demo app beside the library so it exercises the same public package API used by consumers.

```bash
npm install
npm start
```

Build commands:

```bash
npm run build:lib
npm run build:demo
npm run build:all
```

## Repository Layout

```text
policy-validation/
|-- projects/
|   |-- core/       # Angular library source
|   `-- demo-app/   # Private demo application
|-- angular.json
|-- package.json    # Private workspace package
`-- dist/policy-validation/ # Generated publish artifact
```

## Publishing

Do not publish from the repository root. The root package is private. Publish only the generated library artifact after updating the version in `projects/core/package.json`.

```bash
npm run pack:lib
npm run publish:lib
```

## Contributing

Issues and pull requests are welcome at `https://github.com/kalyan-k/policy-validation`.

Before opening a pull request, run:

```bash
npm run build:lib
npm run build:demo
npm test
```

## License

MIT - see [LICENSE](LICENSE).
