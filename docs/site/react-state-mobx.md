# React with MobX

## Overview

The MobX demo uses observable state, computed data, actions, and an observer bridge. Validation policies remain ordinary core policies.

[Open Live Demo](http://127.0.0.1:4204/state/mobx)

## Installation

```bash
npm install @validation-rules/react mobx mobx-react-lite
```

## Package imports

```tsx
import { makeAutoObservable } from 'mobx';
import { observer } from 'mobx-react-lite';
import { useValidationRules, useValidationField, ValidationSummary } from '@validation-rules/react';
```

## Provider setup

Create a route-scoped MobX store and provide it through context.

```tsx
class ProfileStore {
  model = initialModel;
  constructor() {
    makeAutoObservable(this, {}, { autoBind: true });
  }
}
```

## Policy registration

Observer components read the observable model and pass the current snapshot to validation hooks.

```tsx
const form = useValidationRules({ model: store.model, policies, policyNames: ['profile'], groups });
```

## Policy unregistration

The hook unregisters policies on unmount. Dispose route-scoped stores by unmounting their provider.

## Validation lifecycle

MobX actions update values. Validation helpers evaluate the current model and summaries render in observer components.

## Validation Groups

Computed values are useful for group badges and populated-value counts.

## Validation Summary

```tsx
<ValidationSummary errors={form.errors} />
```

## Custom Inputs

Custom inputs can call store actions in `onChange` and use `useValidationField` for invalid state and messages.

## Performance Considerations

Use actions for updates and computed values for readouts. Avoid mutating frozen or serialized state from another library.

## Troubleshooting

If observer components do not refresh, confirm the component is wrapped in `observer` and the model field is observable.

## Complete code example

```tsx
class ProfileStore {
  model = { firstName: '', email: '' };

  constructor() {
    makeAutoObservable(this, {}, { autoBind: true });
  }

  setField(path, value) {
    this.model = { ...this.model, [path]: value };
  }
}

const ProfileForm = observer(({ store }) => {
  const form = useExternalValidationBridge({
    model: store.model,
    setFieldValue: store.setField,
    policies,
    policyNames: ['profile']
  });

  return <ProfileFields form={form} />;
});
```

## Architecture

A route-scoped class is made observable with `makeAutoObservable`. Bound actions replace or reset the model, a computed getter derives populated values, and an `observer` component connects the store to React.

```text
Controls → MobX actions → observable store → observer → validation hooks
```

## Why use this state management library

Choose MobX when an application favors observable domain models, computed values, and action-oriented object design.

## How Validation Rules integrates

MobX owns reactive model transitions. The bridge exposes the current plain model to validation hooks; policy registration stays in the React lifecycle.

## Best Practices

- Use actions for meaningful model transitions.
- Keep the form model reference observable when updates are immutable.
- Wrap the narrowest rendering bridge with `observer`.
- Scope draft stores to their intended lifetime.

## Common Mistakes

- Mixing multiple MobX runtime instances.
- Deep-observing data that is always replaced as a unit.
- Forgetting `observer` around consumers.
- Putting policy registration inside store constructors.

## Code Example

```tsx
class FormStore {
  model = initialModel;
  revision = 0;
  constructor() { makeAutoObservable(this, { model: observable.ref }); }
  replaceModel(model) { this.model = model; this.revision += 1; }
  get populatedValues() { return countPopulatedValues(this.model); }
}
```

[Open Live Demo](http://127.0.0.1:4204/state/mobx)
