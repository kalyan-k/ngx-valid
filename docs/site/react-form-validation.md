# Form Validation

`useValidationForm` coordinates a controlled model, selected policies, errors, submit, reset, touch, and dirty state.

## Validate all

```ts
const snapshot = await form.validate({ showAllErrors: true });

if (snapshot.isValid) {
  await save(form.model);
}
```

The snapshot includes `revision`, `errors`, `requiredResults`, and `isValid`. Form validity means the selected policies produced no errors.

## Submit handling

```tsx
<form
  noValidate
  onSubmit={form.handleSubmit(
    async (model) => save(model),
    async (_model, snapshot) => focusSummary(snapshot)
  )}
>
```

The handler prevents native submit, enables show-all error metadata, validates selected policies, and calls exactly one callback.

## Validation summary

```tsx
<ValidationSummary errors={form.errors} />
```

The summary renders an alert and links each error to the generated field ID. Pass `linkErrors={false}` for controls whose IDs do not follow the field helper convention.

## Reset and clear

- `form.reset()` restores the cloned initial model, validation metadata, and dirty state.
- `form.reset(nextModel)` establishes a supplied reset value for the current reset action.
- `form.clear()` removes all validation state from the current model.
- `form.clear(['email'])` clears selected fields and their touch metadata.

## External state

Use `useValidationRules` instead when Redux, Zustand, a reducer, or another owner controls the model. It exposes the same validation operations without creating React model state.
