# Core Architecture

## Flow

```text
ValidationPolicy
  -> ValidatorHelper
  -> Validator rule chains
  -> ValidationResult and RequiredResult metadata
  -> Adapter-specific UI
```

## Policies

Policies describe model paths and rule chains. They should not know about Angular templates, React components, browser focus, or store updates.

```ts
class BillingPolicy implements ValidationPolicy {
  addValidations(helper: ValidatorHelper): Validator[] {
    return [
      helper.validateFor('billing.city', '!billing.sameAsShipping')
        .isRequired('Billing city is required')
    ];
  }
}
```

## Validators

`ValidatorHelper.validateFor(path)` creates a `Validator`. The validator stores the target path, optional dependency, and ordered rules.

## Metadata

Core writes standardized metadata:

- `validationResults`
- `requiredResults`
- touched-field metadata
- show-all-errors metadata
- group status fields registered by adapters

## Dependency expressions

```ts
helper.validateFor('secondaryEmail', 'hasSecondaryEmail').isRequired('Required');
helper.validateFor('billing.city', '!billing.sameAsShipping').isRequired('Required');
```

Keep expressions small. For complex domain conditions, prefer a function dependency where the adapter supports it.
