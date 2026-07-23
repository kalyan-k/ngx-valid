# Validation Groups

Groups select policies and optional property paths for section-level validation and status.

## Define groups

```ts
const groups = [{
  name: 'addressGroup',
  policies: ['addresses'],
  formGroups: ['addresses'],
  fields: [
    'addresses.0.street',
    'addresses.0.city',
    'addresses.0.postalCode'
  ]
}];
```

`formGroups` preserves the shared core `PolicyGroupConfig` contract. React uses `fields` as the precise property selection when supplied.

## Validate a group

```ts
const snapshot = await form.validateGroup('addressGroup');
const status = form.model.addressGroup;
```

The engine writes core-compatible status to the model:

```ts
{
  isValid: boolean;
  isInValid: boolean;
  isEvaluated: true;
  errors: ValidationResult[];
}
```

## Dynamic group fields

Rebuild group definitions with `useMemo` when array indices are added or removed. Keep group names stable and update the `fields` list to match the current model.

## Switching groups

Call `validateGroup` with the currently selected group. Low-level callers can pass `{ group: name }` to `validate`. An unknown group rejects with an error instead of silently validating the wrong selection.

The [Complex form](http://127.0.0.1:4204/state/local-state/complex) exposes personal, address, and contact group actions. The [Performance form](http://127.0.0.1:4204/state/local-state/performance) generates sections and groups from the current configuration.
