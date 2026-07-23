# Angular ngModel Integration

## Template-driven forms

The Angular adapter was designed around template-driven forms and works naturally with `[(ngModel)]`.

```html
<form #form="ngForm" (ngSubmit)="submit()">
  <input
    name="firstName"
    [(ngModel)]="model.firstName"
    policyValidator
    [validateModel]="'form.firstName'"
    [actualModel]="model"
    [withPolicy]="'Registration'"
    groupName="registration"
  />
  <button type="submit">Create account</button>
</form>
```

## Submit lifecycle

```ts
submit(): void {
  this.validation.validateAll(this.model, 'Registration').subscribe((snapshot) => {
    this.submitted = true;
    if (snapshot.isValid) this.save();
  });
}
```

## Best practices

Keep the model object stable during validation, use explicit `name` attributes, and align `validateModel` paths with policy paths.
