# Angular Directives

## policyValidator

`policyValidator` attaches policy validation to a control.

```html
<input
  name="email"
  [(ngModel)]="model.email"
  policyValidator
  [validateModel]="'form.email'"
  [actualModel]="model"
  [withPolicy]="'Account'"
  groupName="accountForm"
/>
```

## Required inputs

- `validateModel`: model path used by the policy.
- `actualModel`: object that receives validation metadata.
- `withPolicy`: registered policy name.

## Optional inputs

Use `groupName` when the control belongs to a validation group. Use display-strategy configuration for CSS classes instead of hard-coding error markup in every component.

## Dynamic controls

When adding or removing dynamic controls, update both the rendered controls and the generated policy metadata.
