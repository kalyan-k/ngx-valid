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

## NgRx link

The Angular + NgRx demo shows a complete Reactive Forms synchronization workflow with dynamic collections and store state.

[Open Angular + NgRx Reactive Forms](http://127.0.0.1:4203/reactive-forms)
