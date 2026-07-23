# Angular Reactive Forms

## Coordination pattern

Reactive Forms can own interaction state while Validation Rules owns policy execution.

```ts
form = this.fb.group({
  displayName: [''],
  workEmail: ['']
});
```

Synchronize form values into the policy model, run validation, then map policy errors back to controls.

```ts
validate(): void {
  const model = this.form.getRawValue();
  this.validation.validateAll(model, 'Account').subscribe((snapshot) => {
    this.clearPolicyErrors(this.form);
    for (const error of snapshot.errors) {
      this.form.get(error.propertyName)?.setErrors({ policyValidation: error.error.message });
    }
  });
}
```

## Live demo

The unified Angular demo shows Reactive Forms with the same Overview, Simple Form, Complex Form, and Performance Form structure used by every Angular state strategy.

[Open Reactive Forms state demo](http://127.0.0.1:4202/state/reactive-forms)
