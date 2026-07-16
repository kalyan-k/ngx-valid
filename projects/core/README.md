# Policy Validation for Angular

`@policy-validation/angular` provides policy-based validation for Angular template-driven forms. Policies keep validation rules reusable, testable, and independent from component view logic.

## Installation

```bash
npm install @policy-validation/angular underscore
```

Angular framework packages such as `@angular/core`, `@angular/common`, and `@angular/forms` are peer dependencies.

Add the optional stylesheet when you want the default classes:

```json
{
  "styles": [
    "node_modules/@policy-validation/angular/styles/policy-validation.css"
  ]
}
```

## Features

- Policy classes for reusable form validation rules
- Nested model path validation
- Conditional validation rules
- Form group and policy group status tracking
- Error summaries for fields, groups, and pages
- Bootstrap, Angular Material, Tailwind-friendly generic, and custom display strategies
- Dynamic policy replacement and cleanup APIs

## Quick Start

```typescript
import { NgModule } from '@angular/core';
import { ValidationModule } from '@policy-validation/angular';

@NgModule({
  imports: [
    ValidationModule.forRoot({ preset: 'bootstrap' })
  ]
})
export class AppModule {}
```

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

## Registering Policies

```typescript
validationProvider.register('UserForm', new UserFormPolicy());
validationProvider.registerFormGroupPolicy('userForm', 'UserForm');
```

## Unregistering Policies

```typescript
validationProvider.unregisterPolicy('UserForm');
validationProvider.unregisterFormGroupPolicy('userForm');
validationProvider.unregisterPolicyGroup('checkout');
```

## Groups

```html
<policy-validation-group-status [model]="model" groupName="userForm"></policy-validation-group-status>
<policy-validation-group-summary [model]="model" groupName="userForm"></policy-validation-group-summary>
```

```typescript
validationProvider.registerPolicyGroup('checkout', {
  policies: ['PersonalInfo', 'ShippingAddress', 'BillingAddress'],
  formGroups: ['personalInfo', 'shippingInfo', 'billingInfo']
});
```

## Dynamic Policies

Use `replacePolicy(name, policy)` for generated forms, and clear stale state when a dynamic form changes.

```typescript
validationProvider.replacePolicy(policyName, generatedPolicy);
validationProvider.clearValidationState(model, [policyName]);
```

## Validation Lifecycle

1. Register policies and optional group mappings.
2. Attach `policyValidator` to controls.
3. Field validation runs on interaction.
4. Display strategies render invalid state and errors.
5. Submit flows call `validateAll()` or `evaluatePolicies()`.
6. Summary and status components refresh from model validation state.

## API

Common exports:

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

## Demo

The source repository includes a private Angular demo application.

```bash
npm install
npm start
```

## License

MIT - see [LICENSE](LICENSE).
