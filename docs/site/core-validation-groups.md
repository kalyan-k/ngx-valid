# Core Validation Groups

## Purpose

Groups let applications validate and summarize a logical section instead of the entire model.

```ts
const personalGroup = {
  name: 'personalGroup',
  policies: ['personal'],
  formGroups: ['personal'],
  fields: ['personal.firstName', 'personal.lastName', 'personal.email']
};
```

## Use cases

- Multi-section checkout flows.
- Tabbed forms.
- Generated performance sections.
- Save-as-draft workflows.
- Section-level summaries.

## Group status

Adapters usually write status back to the model:

```ts
type GroupStatus = {
  isValid: boolean;
  isInValid: boolean;
  isEvaluated?: boolean;
  errors?: Array<{ propertyName: string; error: { message: string } }>;
};
```

## Best practices

Keep names stable, keep fields aligned with generated policies, and clear group status when removing dynamic fields.
