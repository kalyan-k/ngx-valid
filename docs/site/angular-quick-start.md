# Angular Quick Start

## Policy

```ts
export class AccountPolicy implements ValidationPolicy {
  addValidations(helper: ValidatorHelper): Validator[] {
    return [
      helper.validateFor('email')
        .isRequired('Email is required')
        .isEmail('Enter a valid email address')
    ];
  }
}
```

## Register

```ts
constructor(private validation: ValidationProviderService) {
  this.validation.register('Account', new AccountPolicy());
  this.validation.registerFormGroupPolicy('accountForm', 'Account');
}
```

## Template

```html
<form #accountForm="ngForm">
  <label for="email">Email</label>
  <input
    id="email"
    name="email"
    [(ngModel)]="model.email"
    policyValidator
    [validateModel]="'form.email'"
    [actualModel]="model"
    [withPolicy]="'Account'"
    groupName="accountForm"
  />
  <policy-validation-summary [model]="model"></policy-validation-summary>
</form>
```

## Submit

```ts
submit(): void {
  this.validation.validateAll(this.model, 'Account').subscribe((result) => {
    if (result.isValid) this.save(this.model);
  });
}
```
