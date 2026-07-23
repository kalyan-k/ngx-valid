# React Local State

## Overview

Local state is the baseline integration. The form model stays in the route subtree, while `@validation-rules/react` handles policy lifecycle, field state, messages, summaries, groups, and submission.

[Open Live Demo](http://127.0.0.1:4204/state/local-state)

## Installation

Local State needs only React and the adapter:

```bash
npm install @validation-rules/react @validation-rules/core
```

## Package imports

```tsx
import { useMemo, useReducer, useState } from 'react';
import { ValidationRulesProvider, useValidationForm, useValidationField, ValidationSummary } from '@validation-rules/react';
```

## Provider setup

Wrap the application or route with `ValidationRulesProvider`, then let the form own its model through `useState`.

```tsx
<ValidationRulesProvider>
  <ProfileForm />
</ValidationRulesProvider>
```

## Policy registration

`useValidationForm` registers policies while the component is mounted.

```tsx
const policies = useMemo(() => [{ name: 'profile', policy: profilePolicy }], []);
const form = useValidationForm({ initialModel, policies, policyNames: ['profile'] });
```

## Policy unregistration

No manual cleanup is required for stable policies. The hook unregisters them when the form unmounts. For generated policies, memoize the generated policy and let the dependency change drive replacement.

## Validation lifecycle

Use `useValidationField` for blur/change behavior, `form.validateField(path)` for targeted checks, `form.validateGroup(name)` for sections, and `form.handleSubmit()` for submit.

## Validation Groups

```tsx
const groups = [{ name: 'contactGroup', policies: ['profile'], formGroups: ['contact'], fields: ['email', 'phone'] }];
```

## Validation Summary

```tsx
<ValidationSummary errors={form.errors} />
```

## Custom Inputs

```tsx
function EmailInput({ form }) {
  const field = useValidationField(form, 'email', { validateOnChange: true });
  return <input type="email" {...field.inputProps} />;
}
```

## Performance Considerations

Keep policy arrays stable, update only the changed field path, and avoid lifting form state higher than the route needs.

## Troubleshooting

If a field never validates, compare the policy path with the local model shape. If errors remain after reset, call `form.reset(nextModel)` instead of only calling `setModel`.

## Complete code example

```tsx
const initialModel = { firstName: '', email: '' };
const profilePolicy = {
  addValidations(helper) {
    return [
      helper.validateFor('firstName').isRequired('First name is required'),
      helper.validateFor('email').isRequired('Email is required').isEmail('Invalid email')
    ];
  }
};

function ProfileForm() {
  const policies = useMemo(() => [{ name: 'profile', policy: profilePolicy }], []);
  const form = useValidationForm({ initialModel, policies, policyNames: ['profile'] });
  const firstName = useValidationField(form, 'firstName');
  const email = useValidationField(form, 'email', { validateOnChange: true });

  return (
    <form onSubmit={form.handleSubmit(async () => save(form.model))}>
      <ValidationSummary errors={form.errors} />
      <input aria-label="First name" {...firstName.inputProps} />
      <input aria-label="Email" type="email" {...email.inputProps} />
      <button type="submit">Save</button>
    </form>
  );
}
```

## Architecture

The demo uses `useState` for the model and `useReducer` for an explicit revision counter. A thin bridge presents the same model contract used by every state-management example.

```text
Form controls → useState model → React validation hooks → core policies
                    ↘ useReducer revision
```

## Why use this state management library

Choose local state for forms whose data is owned by one component tree, does not need cross-route persistence, and benefits from the smallest dependency surface.

## How Validation Rules integrates

Pass the current model to the validation hooks and publish each immutable field update back to local state. Policy and group definitions remain stable and independent of state ownership.

## Best Practices

- Keep policies outside render or memoize dynamic policies.
- Use immutable model updates for nested paths.
- Keep server data and temporary form edits separate when cancel is required.
- Reset validation state and the model together.

## Common Mistakes

- Lifting state higher than its consumers need.
- Recreating policy arrays on every render.
- Mutating nested values without a state transition.
- Treating local state as a cross-page cache.

## Code Example

```tsx
const [model, setModel] = useState(initialModel);
const [revision, changed] = useReducer((value) => value + 1, 0);

function replaceModel(nextModel) {
  setModel(nextModel);
  changed();
}
```

[Open Live Demo](http://127.0.0.1:4204/state/local-state)
