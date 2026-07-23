# Core Troubleshooting

## A rule never runs

Check the property path. Paths are dot-separated and must match the model shape exactly.

```ts
helper.validateFor('profile.email');
```

If the model uses `contact.email`, `profile.email` will not produce the expected result.

## Empty optional values pass

This is expected. Format rules skip empty values unless paired with `isRequired`.

## Conditional rules do not activate

Inspect the dependency expression:

```ts
helper.validateFor('secondaryEmail', 'hasSecondaryEmail').isRequired('Required');
helper.validateFor('billing.city', '!billing.sameAsShipping').isRequired('Required');
```

Make sure the dependency path exists and has the expected value.

## Old errors stay visible

Clear validation metadata when removing dynamic fields:

```ts
model.validationResults = model.validationResults?.filter(
  (result) => !result.propertyName.startsWith('addresses.2.')
);
clearTouchedFieldsForPrefix(model, 'addresses.2.');
```
