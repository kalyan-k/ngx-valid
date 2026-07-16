# ngx-valid

Policy-based validation library for Angular applications. Define validation rules as TypeScript objects and attach them to HTML form controls with one directive.

## Features

- Policy-based validation rules grouped per form or component
- Nested model paths such as `address.city` and `personal.email`
- Conditional validation through dependency expressions
- Multiple forms per page with independent policy tracking
- Pluggable error display for Bootstrap, Angular Material, Tailwind, generic HTML, or custom strategies
- Summary components for form groups and policy groups
- Built-in validators for required fields, email, phone, ZIP, SSN, VIN, regex, ranges, dates, and custom rules

## Installation

```bash
npm install ngx-valid underscore
```

Angular packages such as `@angular/core`, `@angular/common`, and `@angular/forms` are peer dependencies and should already be present in your Angular app.

If you want the default styles, add the packaged CSS to your app:

```json
{
  "styles": [
    "node_modules/ngx-valid/styles/ngx-valid.css"
  ]
}
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

export function registerPolicies(validationProvider: ValidationProviderService): () => void {
  return () => {
    validationProvider.register('UserForm', new UserFormPolicy());
  };
}
```

### 2. Import the module with a display preset

```typescript
import { NgModule } from '@angular/core';
import { ValidationModule } from 'ngx-valid';

@NgModule({
  imports: [
    ValidationModule.forRoot({ preset: 'bootstrap' })
  ]
})
export class AppModule {}
```

Built-in provider helpers are also available:

```typescript
import {
  provideAutoValidationDisplay,
  provideBootstrapValidationDisplay,
  provideGenericValidationDisplay,
  provideMaterialValidationDisplay,
  provideTailwindValidationDisplay
} from 'ngx-valid';
```

### 3. Attach the directive to form controls

```html
<input
  [(ngModel)]="model.email"
  ngxValidator
  [validateModel]="'user.email'"
  [actualModel]="model"
  [withPolicy]="'UserForm'"
  groupName="userForm"
/>
```

## Customizing Display

```typescript
ValidationModule.forRoot({
  preset: 'bootstrap',
  classes: { error: 'my-app-field-error' },
  requiredIndicator: { mode: 'tooltip', tooltipText: 'Required field' }
});
```

Required indicator modes are `inline-suffix`, `tooltip`, `label-class`, and `none`.

For full DOM control, extend `AbstractValidationDisplayStrategy` and register it with `provideCustomValidationDisplay(MyStrategy)`.

## Demo Application

The repository includes a private Angular demo app:

```bash
npm install
npm start
```

Demo routes include `/demos/bootstrap`, `/demos/material`, and `/demos/tailwind`.

## License

MIT - see [LICENSE](LICENSE).
