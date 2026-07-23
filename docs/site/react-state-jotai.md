# React with Jotai

## Overview

The Jotai demo models form state as atoms and uses a derived atom for live populated-value state. The validation layer consumes ordinary model values.

[Open Live Demo](http://127.0.0.1:4204/state/jotai)

## Installation

```bash
npm install @validation-rules/react jotai
```

## Package imports

```tsx
import { atom, Provider, useAtom, useAtomValue } from 'jotai';
import { useValidationRules, useValidationField, ValidationSummary } from '@validation-rules/react';
```

## Provider setup

Use a route-scoped Jotai provider when the form should not share atoms globally.

```tsx
<Provider>
  <ProfileForm />
</Provider>
```

## Policy registration

Read the model atom and register policies through `useValidationRules`.

```tsx
const model = useAtomValue(profileAtom);
const validation = useValidationRules({ model, policies, policyNames: ['profile'], groups });
```

## Policy unregistration

Policies unregister with the hook. Reset route atoms when leaving the page if the draft should not persist.

## Validation lifecycle

Update primitive atoms or a model atom, then run field, group, or submit validation from the bridge.

## Validation Groups

Use derived atoms for group counts and status readouts.

```tsx
const errorCountAtom = atom((get) => get(profileAtom).validationResults?.length ?? 0);
```

## Validation Summary

```tsx
<ValidationSummary errors={validation.errors} />
```

## Custom Inputs

Custom controls can write through atom setters while reading validation metadata from `useValidationField`.

## Performance Considerations

Split large models into atoms only when it improves rendering. For policy validation, still provide a complete model snapshot.

## Troubleshooting

If validation sees stale data, make sure the model passed to the hook is reconstructed after atom updates and not mutated in place.

## Complete code example

```tsx
const profileAtom = atom({ firstName: '', email: '' });
const setFieldAtom = atom(null, (get, set, { path, value }) => {
  set(profileAtom, { ...get(profileAtom), [path]: value });
});

function ProfileForm() {
  const model = useAtomValue(profileAtom);
  const [, setField] = useAtom(setFieldAtom);
  const form = useExternalValidationBridge({
    model,
    setFieldValue: (path, value) => setField({ path, value }),
    policies,
    policyNames: ['profile']
  });

  return <ProfileFields form={form} />;
}
```

## Architecture

Primitive atoms hold the form model and revision. A derived atom reads the model and calculates display-only state. A scoped Jotai Provider prevents form drafts from leaking between routes.

```text
Controls → model atom → derived atoms → validation hooks → core policies
```

## Why use this state management library

Choose Jotai when state is naturally atomic, derived dependencies are important, or components need focused subscriptions composed from small units.

## How Validation Rules integrates

Atom writes publish immutable model transitions. The validation hooks register policies and evaluate the current atom value without putting the engine or policies into atoms.

## Best Practices

- Scope atom stores for independent form instances.
- Derive display state instead of synchronizing duplicate atoms.
- Keep policy objects stable.
- Use write atoms for domain-specific transitions in larger forms.

## Common Mistakes

- Creating atom definitions during every consumer render.
- Splitting tightly coupled form data into too many atoms.
- Storing validation engine instances in atoms.
- Duplicating derivable error counts.

## Code Example

```tsx
const modelAtom = atom(initialModel);
const populatedAtom = atom((get) => countPopulatedValues(get(modelAtom)));

const [model, setModel] = useAtom(modelAtom);
const populated = useAtomValue(populatedAtom);
```

[Open Live Demo](http://127.0.0.1:4204/state/jotai)
