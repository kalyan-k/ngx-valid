# Core Validation Policies

## Purpose

A validation policy is the reusable unit of validation. It groups related rules and gives adapters a stable object to register, replace, and unregister.

```ts
export class ContactPolicy implements ValidationPolicy {
  addValidations(helper: ValidatorHelper): Validator[] {
    return [
      helper.validateFor('name').isRequired('Name is required'),
      helper.validateFor('email').isEmail('Enter a valid email address'),
      helper.validateFor('phone').isPhone('Enter a valid phone number')
    ];
  }
}
```

## Naming

Use names that describe domain boundaries: `ContactPolicy`, `BillingAddressPolicy`, `CheckoutPaymentPolicy`, or `EnterpriseAccountPolicy`.

Adapters register policies with stable string keys:

```ts
validationProvider.register('Contact', new ContactPolicy());
```

## Dynamic policies

```ts
export function createSectionPolicy(fields: Array<{ path: string; label: string }>): ValidationPolicy {
  return {
    addValidations(helper) {
      return fields.map((field) =>
        helper.validateFor(field.path).isRequired(`${field.label} is required`)
      );
    }
  };
}
```

Regenerate dynamic policies when the rendered field list changes.

## Testing

Policy tests should cover empty required fields, optional populated fields, conditional paths, dynamic paths, and one fully valid model.
