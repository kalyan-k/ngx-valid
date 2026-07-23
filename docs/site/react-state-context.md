# React with Context API

## Overview

The Context API demo uses only React's built-in provider, consumer hook, and reducer to share a form model across a subtree.

[Open Live Demo](http://127.0.0.1:4204/state/context)

## Installation

```bash
npm install @validation-rules/react @validation-rules/core
```

## Package imports

```tsx
import { createContext, useContext, useReducer } from 'react';
import { useValidationRules, useValidationField, ValidationSummary } from '@validation-rules/react';
```

## Provider setup

Create a dedicated form context instead of placing every form in a global application context.

```tsx
const ProfileContext = createContext(null);

function ProfileProvider({ children }) {
  const [model, dispatch] = useReducer(profileReducer, initialModel);
  return <ProfileContext.Provider value={{ model, dispatch }}>{children}</ProfileContext.Provider>;
}
```

## Policy registration

Read the context model and pass it to validation hooks.

```tsx
const { model, dispatch } = useContext(ProfileContext);
const form = useValidationRules({ model, policies, policyNames: ['profile'], groups });
```

## Policy unregistration

Policies unregister when the route unmounts. Reset context state when users cancel or leave a draft.

## Validation lifecycle

Dispatch model updates, then validate fields, groups, or the full form through the bridge.

## Validation Groups

Reducers work well when group state and form state should be reset through one action.

## Validation Summary

```tsx
<ValidationSummary errors={form.errors} />
```

## Custom Inputs

Custom inputs can dispatch field changes and read validation metadata from `useValidationField`.

## Performance Considerations

Split contexts or memoize provider values for large forms. Context updates all consumers that read the provider value.

## Troubleshooting

If unrelated components rerender, move the form context closer to the route or split model/actions into separate contexts.

## Complete code example

```tsx
function profileReducer(model, action) {
  switch (action.type) {
    case 'field':
      return { ...model, [action.path]: action.value };
    case 'reset':
      return { firstName: '', email: '' };
    default:
      return model;
  }
}

function ProfileForm() {
  const { model, dispatch } = useProfileContext();
  const form = useExternalValidationBridge({
    model,
    setFieldValue: (path, value) => dispatch({ type: 'field', path, value }),
    policies,
    policyNames: ['profile']
  });

  return <ProfileFields form={form} onReset={() => dispatch({ type: 'reset' })} />;
}
```

## Architecture

A dedicated Context Provider owns a reducer. A consumer bridge maps reducer state and dispatch into the same contract consumed by the shared validation pages.

```text
Controls → reducer dispatch → Context Provider → consumers → validation hooks
```

## Why use this state management library

Choose Context when a form must be shared through a bounded component subtree and adding a state library would not provide enough value.

## How Validation Rules integrates

The provider owns model updates; validation hooks consume the current context model. Neither the context nor reducer depends on the validation engine.

## Best Practices

- Keep the provider close to its consumers.
- Memoize provider values and callbacks.
- Use a reducer for explicit complex transitions.
- Split contexts when consumers need unrelated update frequencies.

## Common Mistakes

- Using one application-wide context for every form.
- Recreating provider values unnecessarily.
- Treating Context itself as a complete state-management architecture.
- Dispatching validation side effects from the reducer.

## Code Example

```tsx
const FormContext = createContext(null);
const [state, dispatch] = useReducer(reducer, { model: initialModel, revision: 0 });

<FormContext.Provider value={{ state, dispatch }}>
  <Form />
</FormContext.Provider>
```

[Open Live Demo](http://127.0.0.1:4204/state/context)
