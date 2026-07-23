# Core Hooks

The adapter exposes four public hooks. All require the nearest `ValidationRulesProvider`.

## useValidationRulesContext

```ts
function useValidationRulesContext(): {
  engine: ValidationEngine;
  configuration: {
    validateOnBlur: boolean;
    validateOnChange: boolean;
  };
}
```

Use this advanced hook for direct engine registration, integration adapters, or provider configuration. It throws outside a provider.

## useValidationRules

```ts
useValidationRules({
  model,
  policies,
  policyNames,
  groups
})
```

Returns `model`, `revision`, `errors`, `requiredResults`, `isValid`, `validate`, `validateField`, `validateGroup`, `getFieldErrors`, `clear`, and `touch`. It registers supplied policies and groups for the component lifecycle and subscribes only to the current model.

Use the low-level hook when model ownership lives in Redux, Zustand, a reducer, another context, or application-specific state.

## useValidationForm

```ts
useValidationForm({
  initialModel,
  policies,
  policyNames,
  groups
})
```

Adds an immutable controlled model, `dirtyFields`, `setFieldValue`, `setModel`, `touchField`, `reset`, and `handleSubmit`. `setFieldValue(path, value, true)` updates the model and validates the field. `handleSubmit(valid, invalid)` prevents native submit and validates the selected policies with all errors visible.

## useValidationField

```ts
useValidationField(form, propertyPath, {
  id,
  messageId,
  validateOnBlur,
  validateOnChange,
  parse
})
```

Returns field identity, value, all errors, visible errors, touched/dirty/invalid flags, `inputProps`, `checkboxProps`, `validate`, and `clear`. `parse` converts a control's raw value before updating the model.

## Lifecycle rules

- Policy and group arrays should be stable unless their definition changes.
- Dynamic arrays may create policies with `useMemo` keyed by array length.
- Model subscriptions change safely when an immutable model replaces the previous object.
- Callbacks read the latest options through refs, avoiding stale policy-name closures.

## Common mistakes

Do not call `useValidationField` conditionally. Render a conditional field component instead, or call the hook unconditionally and conditionally render its markup. Do not reuse a form object with a property path that is absent from every registered policy when validation is expected.
