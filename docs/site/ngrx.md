# NgRx Integration

Validation Rules stores results on a model and does not require Angular Forms. That makes it compatible with state-first architectures when mutation is contained at the workflow boundary.

## Page 1: pure NgRx state

The live demo keeps editable values in NgRx. Inputs dispatch actions directly; there is no `FormGroup` and no `ngModel`.

At validation time the component:

1. selects the current state,
2. creates a mutable snapshot,
3. executes `ValidationProviderService.validateAll()`,
4. dispatches the validated snapshot back to the reducer.

This preserves reducer immutability while showing that validation itself is independent from Angular Forms.

```ts
const snapshot = structuredClone(profile);
validation.validateAll(snapshot, 'StateProfile').subscribe(() => {
  store.dispatch(profileValidated({ profile: snapshot }));
});
```

## Page 2: NgRx + Reactive Forms

The enterprise example gives each layer one responsibility:

- `FormGroup` owns interaction state and control errors.
- NgRx owns the durable draft and lifecycle status.
- Validation Rules owns policy evaluation and validation results.

Form value changes dispatch draft actions. Store-driven loads patch the form with `emitEvent: false` to avoid feedback loops. After policy evaluation, failures are mapped to matching `FormControl` errors and the validated model is dispatched.

## Lifecycle guidance

- Clone store state before invoking a mutating validation workflow.
- Keep synchronization one-directional within each event.
- Preserve non-policy form errors when applying validation results.
- Clear validation state when resetting or unloading the feature.
- Test reducers, policy execution, and form synchronization independently.
