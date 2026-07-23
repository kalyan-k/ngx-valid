# Field Validation

`useValidationField(form, path)` focuses form state and behavior on one model property.

## Field state

The hook returns:

- `errors`: every current error for the property.
- `visibleErrors`: errors visible after touch or submit.
- `touched`: whether blur/programmatic touch occurred.
- `dirty`: whether `setFieldValue` changed the field.
- `invalid`: whether visible errors exist.
- `validate()` and `clear()` for programmatic field actions.

Touch and show-all state use the core validation metadata model. Dirty state belongs to `useValidationForm` because it describes a React interaction rather than a validation rule.

## Native input props

```tsx
const name = useValidationField(form, 'name');

<label htmlFor={name.id}>Name</label>
<input {...name.inputProps} />
<ValidationMessage
  id={name.messageId}
  errors={name.visibleErrors}
/>
```

`inputProps` supplies `id`, `name`, controlled `value`, `onChange`, `onBlur`, `aria-invalid`, and conditional `aria-describedby`.

## Checkboxes

```tsx
const terms = useValidationField(form, 'terms');

<input type="checkbox" {...terms.checkboxProps} />
<label htmlFor={terms.id}>Accept terms</label>
```

Use `checkboxProps` because checkboxes are controlled through `checked`, not `value`.

## Change and blur behavior

Provider defaults validate on blur and not on change. Override one field:

```tsx
useValidationField(form, 'email', {
  validateOnChange: true,
  validateOnBlur: true
});
```

Use `parse` for numbers or custom values:

```tsx
useValidationField(form, 'age', {
  parse: (value) => Number(value)
});
```

Try the complete behavior in the [Simple form](http://127.0.0.1:4204/state/local-state/simple).
