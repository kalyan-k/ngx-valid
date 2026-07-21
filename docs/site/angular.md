# Angular Package

`@validation-rules/angular` adapts the core engine to Angular application lifecycles while preserving model-first validation.

## Responsibilities

- policy registration and execution through `ValidationProviderService`
- the `policyValidator` directive for template-driven controls
- required-state and touched-state updates
- form-group and policy-group status components
- Bootstrap, Material, Tailwind, generic, and custom display strategies
- refresh notifications for application-owned rendering

## Registration

```ts
validation.register('Account', new AccountPolicy());
validation.registerFormGroupPolicy('accountForm', 'Account');
validation.registerPolicyGroup('onboarding', {
  policies: ['Account'],
  formGroups: ['accountForm']
});
```

Use `replacePolicy()` for generated forms whose rule set changes at runtime.

## Unregistration and cleanup

Long-lived applications should clean up dynamic registrations when a feature is unloaded.

```ts
validation.unregisterFormGroupPolicy('accountForm');
validation.unregisterPolicyGroup('onboarding');
validation.unregisterPolicy('Account');
validation.clearValidationState(model, ['Account']);
```

## Execution lifecycle

`validateAll()` evaluates one policy. `evaluatePolicies()` evaluates several policies in order and can update an aggregate policy group. Both return observables so asynchronous validators participate in the same lifecycle.

The adapter does not require Angular Forms. The NgRx state demo calls `validateAll()` against a cloned store model without creating a `FormGroup`.
