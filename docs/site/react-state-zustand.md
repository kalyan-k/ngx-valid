# React with Zustand

## Overview

The Zustand demo uses a route-scoped external store and focused selectors. Validation behavior is identical to the local and Redux examples.

[Open Live Demo](http://127.0.0.1:4204/state/zustand)

## Installation

```bash
npm install @validation-rules/react zustand
```

## Package imports

```tsx
import { createStore } from 'zustand/vanilla';
import { useStore } from 'zustand';
import { useValidationRules, useValidationField, ValidationSummary } from '@validation-rules/react';
```

## Provider setup

Create a scoped vanilla store for the form route and expose it through React context.

```tsx
const store = createStore(() => ({ model: initialModel, revision: 0 }));
```

## Policy registration

Select the model from Zustand and pass it to the validation hook.

```tsx
const model = useStore(store, (state) => state.model);
const form = useValidationRules({ model, policies, policyNames: ['profile'], groups });
```

## Policy unregistration

Validation policies unregister when the hook unmounts. Dispose the route-scoped store by unmounting its provider.

## Validation lifecycle

Use store actions for value changes and call validation helpers for field, group, and submit workflows.

## Validation Groups

Zustand works well with derived selectors for group badges because selectors can subscribe to just the group status or error count.

## Validation Summary

```tsx
<ValidationSummary errors={form.errors} />
```

## Custom Inputs

Bridge `useValidationField` metadata with a store action:

```tsx
const field = useValidationField(formBridge, 'email');
store.getState().setField('email', nextValue);
```

## Performance Considerations

Use selectors instead of subscribing every component to the full model. Keep large generated forms route-scoped.

## Troubleshooting

If controls do not update, confirm the selector reads the same store instance as the provider and the action replaces the nested value immutably.

## Complete code example

```tsx
const profileStore = createStore((set) => ({
  model: { firstName: '', email: '' },
  setField: (path, value) => set((state) => ({ model: { ...state.model, [path]: value } })),
  reset: () => set({ model: { firstName: '', email: '' } })
}));

function ProfileForm() {
  const model = useStore(profileStore, (state) => state.model);
  const setField = useStore(profileStore, (state) => state.setField);
  const form = useExternalValidationBridge({ model, setField, policies, policyNames: ['profile'] });

  return <ProfileFields form={form} onReset={() => profileStore.getState().reset()} />;
}
```

## Architecture

A vanilla Zustand store exposes the model, a revision, and replace/reset actions. React's `useStore` hook subscribes to each selected value before the shared bridge passes the model to the validation hooks.

```text
Controls → Zustand actions → vanilla store → focused selectors → validation
```

## Why use this state management library

Choose Zustand for a small external store, concise actions, scoped or shared state, and selector-based rendering without Redux-style ceremony.

## How Validation Rules integrates

The store owns model transitions. Validation policies and groups are registered by React hooks and never imported by the Zustand store.

## Best Practices

- Create a scoped store per form when drafts must be isolated.
- Select only the state a component renders.
- Keep actions explicit and immutable.
- Reset model and validation state as one user operation.

## Common Mistakes

- Creating a store during every render.
- Subscribing every field to the whole store.
- Mutating nested data without returning a new model.
- Reusing singleton draft state between unrelated forms.

## Code Example

```tsx
const store = createStore((set) => ({
  model: initialModel,
  replaceModel: (model) => set((state) => ({ model, revision: state.revision + 1 })),
  resetModel: (model) => set((state) => ({ model, revision: state.revision + 1 }))
}));

const model = useStore(store, (state) => state.model);
```

[Open Live Demo](http://127.0.0.1:4204/state/zustand)
