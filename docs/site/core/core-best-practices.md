# Core Best Practices

## Keep policies small

Prefer one policy per form section or domain concept. A checkout flow might use `CustomerPolicy`, `ShippingPolicy`, `BillingPolicy`, and `PaymentPolicy`.

## Use stable paths

Paths are the contract between policy and UI.

```ts
helper.validateFor('addresses.0.city').isRequired('City is required');
```

For dynamic arrays, regenerate the policy when the array shape changes.

## Pair required and format rules

```ts
helper.validateFor('email')
  .isRequired('Email is required')
  .isEmail('Enter a valid email address');
```

Without `isRequired`, an empty email is valid because the format rule is optional.

## Avoid UI work in Core

Do not put focus management, CSS class decisions, DOM queries, or framework state updates in Core policies.

## Test policy boundaries

Test empty required fields, invalid optional fields when populated, conditional dependencies, dynamic fields after add/remove, and a fully valid model.
