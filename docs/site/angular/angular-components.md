# Angular Components

## Summary components

Use summary components to render model-level errors after submit or validate-all actions.

```html
<policy-validation-summary [model]="model"></policy-validation-summary>
```

## Group status

Group status components show whether a section is pending, valid, or invalid.

```html
<policy-validation-policy-group-status
  [model]="model"
  groupName="checkout"
></policy-validation-policy-group-status>
```

## Error display

Field errors are usually rendered by the configured display strategy. Use components when you need a separate summary or section-level badge.

## Accessibility

Keep labels connected to controls, show summaries after submit, and move focus to the summary only when it helps users recover from blocked submission.
