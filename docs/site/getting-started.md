# Installation & Quick Start

Install the framework-neutral engine, Angular adapter, and the peer dependency used by the current validator implementation.

```bash
npm install @validation-rules/core @validation-rules/angular underscore
```

Angular framework packages are peer dependencies of `@validation-rules/angular`.

## Define a policy

A policy returns validators for model paths. Keep messages close to the rule so a policy remains easy to inspect and test.

```ts
import { ValidationPolicy, Validator, ValidatorHelper } from '@validation-rules/angular';

export class AccountPolicy implements ValidationPolicy {
  addValidations(v: ValidatorHelper): Validator[] {
    return [
      v.validateFor('name').isRequired('Name is required'),
      v.validateFor('email')
        .isRequired('Email is required')
        .isEmail('Enter a valid email address')
    ];
  }
}
```

## Configure Angular

Import `ValidationModule` once and choose a display setup appropriate for the application.

```ts
@NgModule({
  imports: [ValidationModule.forRoot({ preset: 'bootstrap' })]
})
export class AppModule {}
```

## Register and execute

```ts
validation.register('Account', new AccountPolicy());

validation.validateAll(model, 'Account', {
  showAllErrors: true,
  evaluateGroups: true
}).subscribe(() => saveWhenValid(model));
```

`model.validationResults` contains the current failures. Use `clearValidationState()` when the workflow ends or the model is replaced.

## Add the optional stylesheet

```json
{
  "styles": [
    "node_modules/@validation-rules/angular/styles/policy-validation.css"
  ]
}
```

The package export is stable. Existing `policy-validation-*` selectors remain compatibility APIs.
