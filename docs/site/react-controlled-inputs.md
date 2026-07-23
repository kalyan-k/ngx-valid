# Controlled Inputs

`useValidationForm` prioritizes controlled inputs. Each update creates the next model while preserving validation state, then optionally validates that new model.

## Text, email, password, date, time, range, and select

Use `field.inputProps` for controls whose state is represented by `value`.

```tsx
const date = useValidationField(form, 'dateOfBirth');
<input type="date" {...date.inputProps} />

const country = useValidationField(form, 'country');
<select {...country.inputProps}>...</select>
```

The same props work with `textarea`. For a multi-select, call `form.setFieldValue` with the selected string array from a custom change handler.

## Number inputs

Browser number controls emit strings. Parse intentionally:

```ts
const age = useValidationField(form, 'age', {
  parse: (value) => value === '' ? '' : Number(value)
});
```

## Checkbox and radio controls

Use `checkboxProps` for one boolean. For a radio group, set the common property explicitly from each option and consume `field.invalid`, `field.messageId`, and `field.visibleErrors` at group level.

## File controls

Browsers do not permit a controlled file value. Read `event.currentTarget.files` and call `form.setFieldValue(path, files)` without spreading `inputProps.value`. Keep the generated ID, name, blur, and ARIA state.

## Uncontrolled controls

Uncontrolled controls are not wrapped by the adapter. They can still call `setFieldValue` or direct engine methods, but controlled state is recommended because conditional rules and nested models always receive the current value.
