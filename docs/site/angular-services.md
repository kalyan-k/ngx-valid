# Angular Services

## ValidationProviderService

Use `ValidationProviderService` to register and execute policies.

```ts
this.validation.register('Profile', new ProfilePolicy());
this.validation.registerFormGroupPolicy('profileGroup', 'Profile');
this.validation.registerPolicyGroup('profileFlow', {
  policies: ['Profile'],
  formGroups: ['profileGroup']
});
```

## Dynamic policies

```ts
this.validation.replacePolicy('GeneratedSection', createGeneratedPolicy(fields));
this.validation.registerFormGroupPolicy('generatedSection', 'GeneratedSection');
```

Call `replacePolicy()` when generated fields change.

## Cleanup

```ts
ngOnDestroy(): void {
  this.validation.unregisterFormGroupPolicy('profileGroup');
  this.validation.unregisterPolicyGroup('profileFlow');
  this.validation.unregisterPolicy('Profile');
}
```

## Refresh

The service notifies display components when validation metadata changes. Use this instead of manually forcing components to recalculate error state.
