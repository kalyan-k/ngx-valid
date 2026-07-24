# React Best Practices

## Keep policies stable

Define policy objects outside render or memoize them. Stable policy arrays prevent unnecessary registration churn.

```tsx
const policies = [{ name: 'profile', policy: profilePolicy }];

function ProfilePage() {
  const form = useValidationForm({ initialModel, policies, policyNames: ['profile'] });
}
```

## Keep model ownership explicit

Use Local State for route-owned forms. Use Redux Toolkit, Zustand, Jotai, Recoil, MobX, or Context only when the form model genuinely needs that state layer.

## Register and unregister automatically

`useValidationRules` and `useValidationForm` register policies and groups in effects and clean them up when the component unmounts. Avoid manual registration unless you are writing an adapter-level utility.

## Use field hooks for custom inputs

```tsx
function DesignSystemInput({ form, path, label }) {
  const field = useValidationField(form, path);
  return (
    <TextInput
      id={field.id}
      label={label}
      value={String(field.value ?? '')}
      error={field.visibleErrors[0]?.error.message}
      onValueChange={(value) => void form.setFieldValue(path, value, true)}
      onBlur={() => form.touchField(path)}
    />
  );
}
```

## Validate at the right level

Use field validation for focused feedback, group validation for sections, and full-form validation for submit. Large generated forms should prefer group actions during editing and validate-all during submit or benchmark scenarios.

## Reset model and validation together

```tsx
form.reset(createInitialModel());
```

This clears validation metadata and restores values in one step.
