# Angular Examples

## Template-driven registration

```html
<input
  name="email"
  [(ngModel)]="model.email"
  policyValidator
  [validateModel]="'form.email'"
  [actualModel]="model"
  [withPolicy]="'Registration'"
/>
```

## Dynamic generated section

```ts
generate(fields: FieldDefinition[]): void {
  this.validation.replacePolicy('Generated', createGeneratedPolicy(fields));
  this.validation.registerFormGroupPolicy('generated', 'Generated');
}
```

## Custom component

Wrap your design-system input with `ControlValueAccessor`, then apply `policyValidator` where the value is bound.

## Live demos

[Angular Demo](http://127.0.0.1:4202/) compares Bootstrap, Material, and Tailwind-compatible display. [Angular + NgRx Demo](http://127.0.0.1:4203/) shows store-first and Reactive Forms workflows.
