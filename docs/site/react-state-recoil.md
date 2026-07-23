# React with Recoil

## Overview

The Recoil demo is provided for teams maintaining existing Recoil applications. It demonstrates atoms, selectors, and the same Validation Rules lifecycle as every other React example.

The upstream Recoil repository is archived. Prefer an actively maintained option for new applications, and treat this page as integration and migration support.

[Open Live Demo](http://127.0.0.1:4204/state/recoil)

## Installation

```bash
npm install @validation-rules/react recoil
```

## Package imports

```tsx
import { atom, selector, RecoilRoot, useRecoilState, useRecoilValue } from 'recoil';
import { useValidationRules, useValidationField, ValidationSummary } from '@validation-rules/react';
```

## Provider setup

Wrap the route with `RecoilRoot` and initialize the model atom.

```tsx
<RecoilRoot initializeState={({ set }) => set(profileAtom, initialModel)}>
  <ProfileForm />
</RecoilRoot>
```

## Policy registration

Read the atom value and register policies with the React adapter.

```tsx
const model = useRecoilValue(profileAtom);
const form = useValidationRules({ model, policies, policyNames: ['profile'], groups });
```

## Policy unregistration

The hook unregisters policies on unmount. Reset atoms when leaving long-lived Recoil roots.

## Validation lifecycle

Field updates write to atoms. Validation helpers evaluate the current atom snapshot and publish metadata through the bridge.

## Validation Groups

Use selectors for group status summaries when existing Recoil screens already use derived state.

## Validation Summary

```tsx
<ValidationSummary errors={form.errors} />
```

## Custom Inputs

Custom inputs should write through `useRecoilState` or a setter hook and use validation metadata for ARIA and message rendering.

## Performance Considerations

Keep the form route boundary small. Recoil is best demonstrated here for existing codebases; new projects should weigh maintenance status before choosing it.

## Troubleshooting

If React compatibility issues appear, isolate Recoil usage behind the route provider and keep validation policies independent of Recoil APIs.

## Complete code example

```tsx
const profileAtom = atom({ key: 'profile', default: { firstName: '', email: '' } });
const populatedCount = selector({
  key: 'profilePopulatedCount',
  get: ({ get }) => Object.values(get(profileAtom)).filter(Boolean).length
});

function ProfileForm() {
  const [model, setModel] = useRecoilState(profileAtom);
  const form = useExternalValidationBridge({
    model,
    setFieldValue: (path, value) => setModel((current) => ({ ...current, [path]: value })),
    policies,
    policyNames: ['profile']
  });

  return <ProfileFields form={form} populated={useRecoilValue(populatedCount)} />;
}
```

## Architecture

A `RecoilRoot` initializes a model atom and revision atom. A selector derives populated-value state. Because Recoil 0.7 checks a React 18 internal dispatcher name, the React 19 demo includes a narrow app-only compatibility alias; no adapter or engine API is changed.

```text
Controls → Recoil atoms → selector → validation hooks → core policies
```

## Why use this state management library

Choose this integration when an existing Recoil application needs Validation Rules. For greenfield work, account for the project's archived status before adopting it.

## How Validation Rules integrates

Atom setters own model transitions. Recoil selectors provide derived UI state, while validation policies stay outside the state graph.

## Best Practices

- Keep `RecoilRoot` ownership explicit.
- Use selectors for derived values rather than duplicated atoms.
- Isolate the React 19 compatibility layer to the application.
- Plan a migration path for long-lived products.

## Common Mistakes

- Ignoring Recoil's archived maintenance status.
- Freezing values that the current validation engine annotates during evaluation.
- Creating atom keys dynamically without stable uniqueness.
- Storing engine instances inside atoms.

## Code Example

```tsx
const modelState = atom({
  key: 'validationRulesDemoModel',
  default: initialModel,
  dangerouslyAllowMutability: true
});
const populatedState = selector({
  key: 'validationRulesDemoPopulated',
  get: ({ get }) => countPopulatedValues(get(modelState))
});
```

[Open Live Demo](http://127.0.0.1:4204/state/recoil)
