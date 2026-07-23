# React with Redux Toolkit

## Overview

The Redux Toolkit demo proves that validation policies can remain framework-neutral while a Redux slice owns form transitions and memoized selectors expose the active model and derived state.

[Open Live Demo](http://127.0.0.1:4204/state/redux-toolkit)

## Installation

```bash
npm install @validation-rules/react @reduxjs/toolkit react-redux
```

## Package imports

```tsx
import { configureStore, createSlice } from '@reduxjs/toolkit';
import { Provider, useDispatch, useSelector } from 'react-redux';
import { useValidationRules, useValidationField, ValidationSummary } from '@validation-rules/react';
```

## Provider setup

Create a scoped store for the form route and render it under both Redux and Validation Rules providers.

```tsx
<Provider store={store}>
  <ValidationRulesProvider>
    <ProfileForm />
  </ValidationRulesProvider>
</Provider>
```

## Policy registration

Read the Redux model with a selector and pass it to `useValidationRules`.

```tsx
const model = useSelector(selectProfileDraft);
const validation = useValidationRules({ model, policies, policyNames: ['profile'], groups });
```

## Policy unregistration

The React hook unregisters policies on unmount. Redux cleanup should reset the draft slice when leaving the route if the draft should not persist.

## Validation lifecycle

Dispatch field updates, then call `validation.validateField(path)` for focused validation or `validation.validate({ showAllErrors: true })` for submit.

## Validation Groups

Store group status on the validated model or derive section badges from `validation.errors` and the group field list.

## Validation Summary

```tsx
<ValidationSummary errors={validation.errors} />
```

## Custom Inputs

Use `useValidationField` for metadata and dispatch the Redux action from `onChange`.

```tsx
const field = useValidationField(formBridge, 'email', { validateOnChange: true });
dispatch(profileSlice.actions.fieldChanged({ path: 'email', value }));
```

## Performance Considerations

Keep selectors focused, store serializable form values, and avoid placing mutable validation metadata in long-lived global state unless the route owns cleanup.

## Troubleshooting

If Redux Toolkit freezes state, clone or serialize the form model before validation metadata is written. Keep policies stable so registration does not churn on every dispatch.

## Complete code example

```tsx
const slice = createSlice({
  name: 'profile',
  initialState: { firstName: '', email: '' },
  reducers: {
    fieldChanged(state, action) {
      state[action.payload.path] = action.payload.value;
    },
    reset: () => ({ firstName: '', email: '' })
  }
});

function ProfileForm() {
  const dispatch = useDispatch();
  const model = useSelector((state) => state.profile);
  const form = useReduxValidationBridge({
    model,
    setFieldValue: (path, value) => dispatch(slice.actions.fieldChanged({ path, value })),
    policies: [{ name: 'profile', policy: profilePolicy }],
    policyNames: ['profile']
  });

  return (
    <form onSubmit={form.handleSubmit(async () => save(model))}>
      <ValidationSummary errors={form.errors} />
      <ConnectedInput form={form} path="email" label="Email" />
      <button type="submit">Save</button>
    </form>
  );
}
```

## Architecture

`configureStore` hosts a dedicated slice. Slice actions replace or reset the serializable model, and selectors read the model, revision, and populated-value count. The React adapter receives the selected model through the shared demo bridge.

```text
Controls → slice actions → Redux store → selectors → validation hooks → core
```

## Why use this state management library

Choose Redux Toolkit when form state participates in a larger application workflow, explicit events matter, Redux DevTools are valuable, or several distant features consume the same draft.

## How Validation Rules integrates

Validation remains outside reducers. Reducers store form transitions; hooks run policies against the selected model and dispatch the next immutable model after field changes.

## Best Practices

- Keep reducers pure and state serializable.
- Use memoized selectors for model decoding and derived data.
- Scope transient forms unless global persistence is intentional.
- Dispatch semantic reset and replace actions.

## Common Mistakes

- Running validation side effects inside reducers.
- Selecting the entire application state for every input.
- Storing non-serializable engine instances in Redux.
- Confusing server entities with editable drafts.

## Code Example

```tsx
const slice = createSlice({
  name: 'validationDemo',
  initialState,
  reducers: {
    modelReplaced(state, action) { state.serializedModel = JSON.stringify(action.payload); },
    modelReset(state, action) { state.serializedModel = JSON.stringify(action.payload); }
  }
});

const model = useSelector(selectModel);
dispatch(slice.actions.modelReplaced(nextModel));
```

[Open Live Demo](http://127.0.0.1:4204/state/redux-toolkit)
