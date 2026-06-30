# ngx-valid

Policy-based validation library for Angular applications. Define validation rules as JavaScript objects and attach them to any HTML form control with a single directive.

## Features

- **Policy-based rules** — group validations per form/component using a fluent API
- **Nested model paths** — validate `address.city`, `personal.email`, etc.
- **Conditional validation** — rules that run only when a dependency expression is truthy
- **Multiple forms per page** — independent policies and form-group validity tracking
- **Pluggable error UI** — Bootstrap, Angular Material, or fully custom display strategies
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

### 2. Import the module

```typescript
import { ValidationModule } from 'ngx-valid';

@NgModule({
  imports: [
    ValidationModule.forRoot({
      framework: 'bootstrap',           // 'bootstrap' | 'material' | 'auto'
      invalidClass: 'is-invalid',
      errorClass: 'invalid-feedback d-block'
    })
  ]
})
export class AppModule {}
```

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

### 4. Validate on submit

```typescript
const policy = this.validationProvider.getPolicy('UserForm');
policy.validate(this.model).subscribe(() => {
  policy.checkModelRequired(this.model).subscribe(() => {
    policy.checkFormValid(this.model, this.validationProvider.formGroup);
  });
});
```

## Directive Inputs

| Input | Description |
|-------|-------------|
| `ngxValidator` | Activates validation on the element |
| `validateModel` | Dotted path to the property (prefix is ignored: `'form.email'` → `'email'`) |
| `actualModel` | The model object holding field values and validation results |
| `withPolicy` | Registered policy name |
| `groupName` | Optional form section name for group-level validity |
| `validateOnEvent` | Event to trigger validation (default: `blur`, or `click` for checkbox/radio) |

## Built-in Validators

| Method | Description |
|--------|-------------|
| `isRequired(msg)` | Value must not be empty |
| `isChecked(msg)` | Checkbox must be checked |
| `isNumber(msg)` | Must be a finite number |
| `isEmail(msg)` | Email format |
| `isDate(msg)` | Valid date |
| `isPhone(msg)` | US phone format |
| `isZipCode(msg)` | US ZIP code |
| `isSSN(msg)` | US Social Security Number |
| `isVin(msg)` | Vehicle VIN |
| `isAboveMin(msg, min)` | Number >= min |
| `isBelowMax(msg, max)` | Number <= max |
| `range(msg, min, max, type)` | Date or number range |
| `regEx(msg, pattern)` | Regex pattern (string) |
| `regExLiteral(msg, pattern)` | Regex pattern (RegExp) |
| `userDefined(msg, fn)` | Custom callback `(model, value, msg) => true \| { message }` |

## Conditional Validation

```typescript
v.validateFor('address.city', 'address.line1.length > 0').isRequired('City is required')
v.validateFor('billing.zip', '!billing.sameAsShipping').isRequired('ZIP required')
```

Dependencies can be expression strings (evaluated against the model) or callback functions.

## Custom Error Display

Implement `ValidationDisplayStrategy` for full control over error rendering:

```typescript
import { ValidationDisplayStrategy, VALIDATION_DISPLAY_CONFIG } from 'ngx-valid';

@NgModule({
  imports: [
    ValidationModule.forRoot({ strategy: myCustomStrategy })
  ]
})
```

Or extend `BootstrapValidationDisplayStrategy` / `MaterialValidationDisplayStrategy`.

## Demo Application

This workspace includes a demo app with two examples:

- **Sample Form** — all HTML control types with a single policy
- **Complex Form** — three forms on one page with nested models and conditional rules

```bash
npm run build-core
npm start
```

## Publishing

```bash
npm run build-core
cd dist/core
npm publish
```

## License

MIT
