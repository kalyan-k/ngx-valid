# NgRx Integration

Validation Rules stores results on a model and does not require Angular Forms. That makes it compatible with state-first architectures when mutation is contained at the workflow boundary.

## Page 1: pure NgRx state

The live demo keeps editable values in NgRx. Inputs dispatch actions directly; there is no `FormGroup` and no `ngModel`. The simple scenario covers identity and contact fields. The complex scenario adds a nested primary address, a dynamic address collection, a dynamic phone collection, independent identity/address/contact validation groups, and switchable standard and enterprise policies.

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

Dynamic collection policies are replaced with validators for the current item count before each evaluation. This keeps the durable state immutable while allowing every generated address or phone path to participate in the same validation lifecycle.

## Page 2: NgRx + Reactive Forms

The enterprise example gives each layer one responsibility:

- `FormGroup` owns interaction state and control errors.
- NgRx owns the durable draft and lifecycle status.
- Validation Rules owns policy evaluation and validation results.

Form value changes dispatch draft actions. Store-driven loads patch the form with `emitEvent: false` to avoid feedback loops. After policy evaluation, failures are mapped to matching `FormControl` errors and the validated model is dispatched.

The page begins with a synchronized simple form, then demonstrates nested company data, dynamic contact and department `FormArray` collections, save/reset workflows, group status, and a 30-department performance scenario. Timing and field counts are displayed by the application; the underlying validation service and policies use the same public Angular adapter API as ordinary consumers.

## Lifecycle guidance

- Clone store state before invoking a mutating validation workflow.
- Keep synchronization one-directional within each event.
- Preserve non-policy form errors when applying validation results.
- Clear validation state when resetting or unloading the feature.
- Test reducers, policy execution, and form synchronization independently.
- Rebuild dynamic policies from the current collection shape before evaluating generated controls.
- Register independently named form groups when enterprise workflows need section-level status.
