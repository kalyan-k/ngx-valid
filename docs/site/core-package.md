# Core Package

`@validation-rules/core` is the framework-neutral engine. Its runtime sources do not import Angular and can be exercised as ordinary TypeScript.

## Responsibilities

- `ValidationPolicy` and `ValidationModel` contracts
- `Validator`, `ValidatorHelper`, and built-in `ValidationHelper` rules
- validation result and required-state shapes
- form-group and policy-group status types
- touched-field and show-all-errors metadata
- reset and failure-shape utilities

## Creating validators

`ValidatorHelper.validateFor(path)` starts a fluent rule definition. The path may refer to a top-level field or a nested model property.

```ts
const validators = [
  helper.validateFor('profile.email')
    .isRequired('Email is required')
    .isEmail('Enter a valid email address'),
  helper.validateFor('profile.age')
    .isNumber('Age must be numeric')
    .range('Age must be between 18 and 120', 18, 120, 'number')
];
```

## Model state

Validation results are stored on the evaluated model so the application can persist, select, render, or synchronize them using its normal state architecture.

```ts
interface AccountModel extends ValidationModel {
  name: string;
  email: string;
}
```

The engine does not require a component, template, FormGroup, or browser DOM. Framework adapters decide how model state connects to a user interface.

## Dependency boundary

Core may depend on small runtime utilities, but it must never depend on `@angular/*` or an adapter package. The repository architecture verifier enforces that direction.
