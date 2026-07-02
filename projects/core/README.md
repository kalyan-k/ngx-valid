# ngx-valid

Policy-based validation library for Angular applications. Define validation rules as JavaScript objects and attach them to any HTML form control with a single directive.

## Architecture

**Standard (framework-agnostic):** policies, rules, registration, validation events (blur/click), model-level `validationResults`, required metadata, form-group status, and summary components behave the same for every consumer.

**Customizable (presentation layer):** error rendering, invalid CSS classes, required-field indicators, and DOM placement are configured via typed presets or a custom `ValidationDisplayStrategy`.

## Features

- **Policy-based rules** — group validations per form/component using a fluent API
- **Nested model paths** — validate `address.city`, `personal.email`, etc.
- **Conditional validation** — rules that run only when a dependency expression is truthy
- **Multiple forms per page** — independent policies and form-group validity tracking
- **Pluggable error UI** — Bootstrap, Angular Material, Tailwind, or fully custom display strategies
- **Compile-time class maps** — `defineValidationDisplayClasses()` enforces every CSS key
- **Abstract strategy base** — extend `AbstractValidationDisplayStrategy` to get errors for missing hooks
- **Built-in validators** — required, email, phone, ZIP, SSN, VIN, regex, range, dates, and custom rules

## Installation

```bash
npm install ngx-valid underscore
npm install @angular/forms @angular/compiler  # peer dependencies
```

## Quick Start

### 1. Register a validation policy

```typescript
import { ValidationPolicy, Validator, ValidatorHelper, ValidationProviderService } from 'ngx-valid';

export class UserFormPolicy implements ValidationPolicy {
  addValidations(v: ValidatorHelper): Validator[] {
    return [
      v.validateFor('email').isRequired('Email is required').isEmail('Invalid email'),
      v.validateFor('age').isRequired('Age is required').isNumber('Must be a number')
    ];
  }
}

// In AppModule or APP_INITIALIZER:
validationProvider.register('UserForm', new UserFormPolicy());
```

### 2. Import the module with a display preset

```typescript
import { ValidationModule } from 'ngx-valid';

@NgModule({
  imports: [
    ValidationModule.forRoot({ preset: 'bootstrap' })
  ]
})
export class AppModule {}
```

Built-in example presets: `provideBootstrapValidationDisplay()`, `provideMaterialValidationDisplay()`, `provideTailwindValidationDisplay()`, `provideGenericValidationDisplay()`, `provideAutoValidationDisplay()`.

Presets can be scoped to routes or components.

### 3. Attach the directive to form controls

```html
<input
  [(ngModel)]="model.email"
  ngxValidator
  [validateModel]="'form.email'"
  [actualModel]="model"
  [withPolicy]="'UserForm'"
  groupName="userForm"
/>
```

## Customizing a Built-in Preset

```typescript
ValidationModule.forRoot({
  preset: 'bootstrap',
  classes: { error: 'my-app-field-error' },
  requiredIndicator: { mode: 'tooltip', tooltipText: 'Required field' }
});
```

Required indicator modes: `inline-suffix`, `tooltip`, `label-class`, `none`.

## Custom UI Framework

Define a complete class map (TypeScript enforces every key):

```typescript
import { defineValidationDisplayClasses, provideValidationDisplay } from 'ngx-valid';

export const MY_UI_CLASSES = defineValidationDisplayClasses({
  invalid: 'my-invalid',
  error: 'my-error',
  errorContainer: 'my-error-container',
  requiredMarker: 'my-required',
  baseInvalid: 'ngx-valid-invalid',
  radioGroupInvalid: 'my-radio-invalid'
});

providers: [provideValidationDisplay({ preset: 'generic', classes: MY_UI_CLASSES })]
```

For full DOM control, extend `AbstractValidationDisplayStrategy` and register with `provideCustomValidationDisplay(MyStrategy)`.

See `lib/display/examples/prime-ng-display.example.ts` in the source for a reference.

## Demo Application

```bash
npm run build-core
npm start
```

Routes: `/demos/bootstrap`, `/demos/material`, `/demos/tailwind`

## License

MIT — see [LICENSE](LICENSE) in this package (or the repository root).
