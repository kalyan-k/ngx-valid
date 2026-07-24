# Validation Policies

React policies use the same `ValidationPolicy`, `ValidatorHelper`, and `Validator` contracts as the core and Angular adapters.

## Create a policy

```ts
const profilePolicy: ValidationPolicy = {
  addValidations(helper) {
    return [
      helper.validateFor('profile.name')
        .isRequired('Name is required.'),
      helper.validateFor('profile.email')
        .isRequired('Email is required.')
        .isEmail('Enter a valid email.')
    ];
  }
};
```

## Register one or more policies

```ts
const policies = [
  { name: 'profile', policy: profilePolicy },
  { name: 'addresses', policy: addressPolicy }
];

useValidationForm({
  initialModel,
  policies,
  policyNames: ['profile', 'addresses']
});
```

Names are case-insensitive. Validation of an unknown selected name throws a clear error. Duplicate acquisitions are reference counted; the first registration supplies the active validator list until a dynamic replacement occurs.

## Dynamic policies

Create dynamic policies with `useMemo`, changing the policy array only when its generated shape changes.

```ts
const policies = useMemo(() => [{
  name: 'addresses',
  policy: createAddressPolicy(model.addresses.length)
}], [model.addresses.length]);
```

Effect cleanup unregisters the previous owner before registering the new validator set. For imperative code, use `engine.replacePolicy(name, policy)`.

## Conditional rules

Pass a dependency function as the second `validateFor` argument:

```ts
helper.validateFor('secondaryEmail', (model) => model.hasSecondary)
  .isRequired('Secondary email is required.');
```

Simple string paths, negated paths, and equality comparisons are also supported. Functions are recommended for complex conditions because they are explicit, typed, and testable.

See multiple live policies in the [Complex form](http://127.0.0.1:4204/state/local-state/complex).
