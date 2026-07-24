# Angular Validation Policies

## Policy shape

Angular policies use the same Core contract.

```ts
export class ProfilePolicy implements ValidationPolicy {
  addValidations(helper: ValidatorHelper): Validator[] {
    return [
      helper.validateFor('profile.firstName').isRequired('First name is required'),
      helper.validateFor('profile.email').isEmail('Enter a valid email')
    ];
  }
}
```

## Registration

```ts
this.validation.register('Profile', new ProfilePolicy());
```

## Replacement

Use replacement for generated forms.

```ts
this.validation.replacePolicy('PerformanceSection', createSectionPolicy(fields));
```

## Unregistration

```ts
this.validation.unregisterPolicy('Profile');
```

Clean up policies owned by lazy-loaded features.
