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

## Template-driven controls

Attach `policyValidator` to a native control and identify the model path, model instance, policy, and optional validation group. The directive registers the control, evaluates field rules during interaction, and delegates error rendering to the configured display strategy.

```html
<input
  [(ngModel)]="model.email"
  policyValidator
  [validateModel]="'form.email'"
  [actualModel]="model"
  [withPolicy]="'Account'"
  groupName="accountForm"
/>
```

## Display strategies

- `BootstrapValidationDisplayStrategy` uses Bootstrap invalid-state and feedback conventions.
- `MaterialValidationDisplayStrategy` integrates errors with Angular Material form fields.
- `TailwindValidationDisplayStrategy` and `GenericValidationDisplayStrategy` apply configurable utility or application classes.
- `DefaultValidationDisplayStrategy` can select an appropriate treatment from the rendered control context.

Configure explicit invalid, error, container, and required-marker classes through `ValidationModule.forRoot()` when the application owns its own visual system.

## Status and summary components

The adapter includes form-group and policy-group status and summary components. They read validation state from the model, respond to validation refresh notifications, and support OnPush application trees without moving validation behavior into presentation code.

## Using the Angular demo

The Angular demo keeps validation policies constant while switching among Bootstrap, Angular Material, and Tailwind-compatible display strategies. Each framework view contains Sample, Complex, and Performance scenarios so markup and error presentation can be compared without changing the underlying rules.

[Open the Angular demo](http://127.0.0.1:4202/) and choose a framework from its Demos navigation group.

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
