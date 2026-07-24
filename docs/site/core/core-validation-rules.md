# Core Validation Rules

## Built-in rules

Core includes `isRequired`, `isChecked`, `isNumber`, `isAboveMin`, `isBelowMax`, `range`, `regEx`, `regExLiteral`, `userDefined`, `isEmail`, `isDate`, `isZipCode`, `isPhone`, `isVin`, and `isSSN`.

## Optional behavior

Format rules are optional unless paired with `isRequired`.

```ts
helper.validateFor('email').isEmail('Invalid email');
helper.validateFor('requiredEmail')
  .isRequired('Email is required')
  .isEmail('Invalid email');
```

## Rule order

Put required checks before format checks so summaries read naturally.

```ts
helper.validateFor('quantity')
  .isRequired('Quantity is required')
  .isNumber('Quantity must be numeric')
  .range('Quantity must be between 1 and 10', 1, 10, 'number');
```

## Custom rules

```ts
helper.validateFor('code').userDefined('Code is unavailable', async (_model, value, message) => {
  const available = await checkCodeAvailability(String(value));
  return available ? true : { message };
});
```

Use explicit messages that tell the user how to recover.
