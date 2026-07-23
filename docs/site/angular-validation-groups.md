# Angular Validation Groups

## Form group policies

```ts
this.validation.registerFormGroupPolicy('personalGroup', 'Personal');
```

## Policy groups

```ts
this.validation.registerPolicyGroup('checkout', {
  policies: ['Personal', 'Shipping', 'Payment'],
  formGroups: ['personalGroup', 'shippingGroup', 'paymentGroup']
});
```

## Validate a section

```ts
this.validation.validateFormGroup(this.model, 'personalGroup').subscribe();
```

## Display a group

```html
<policy-validation-policy-group-summary
  [model]="model"
  groupName="checkout"
></policy-validation-policy-group-summary>
```

Use groups for tabs, panels, generated sections, and multi-step flows.
