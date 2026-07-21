# Public API Reference

The supported API is exposed from package public entry points. Do not import implementation files under `src/lib`.

## Core contracts

- `ValidationPolicy` — supplies a list of validators.
- `ValidationModel` — model shape with optional validation and required results.
- `Validator` — fluent rule definition for one property path.
- `ValidatorHelper` — creates validators with `validateFor()`.
- `ValidationResult` and `ValidationError` — structured failure state.
- `FormGroupStatus` and `PolicyGroupConfig` — aggregate workflow state.

## ValidationProviderService

- `register(name, policy)` registers a policy once.
- `replacePolicy(name, policy)` replaces or creates a dynamic policy.
- `unregisterPolicy(name)` removes a policy.
- `registerFormGroupPolicy(group, policy)` maps a section to a policy.
- `unregisterFormGroupPolicy(group)` removes that mapping.
- `registerPolicyGroup(key, config)` creates a multi-policy aggregate.
- `unregisterPolicyGroup(key)` removes the aggregate.
- `validateAll(model, policy, options)` evaluates one policy.
- `evaluatePolicies(model, names, group?)` evaluates policies in sequence.
- `evaluateFormGroup(model, group, policy?)` refreshes one group.
- `clearValidationState(model, policyNames)` removes validation metadata and group state.
- `onValidationRefresh(model)` observes refresh notifications for one model.

## Angular UI surface

The adapter exports `ValidationModule`, `ValidatorDirective`, display configuration tokens and providers, display strategies, and the status/summary components.

## Compatibility

Directive selectors, component selectors, `policy-validation-*` DOM hooks, the stylesheet export, and policy-domain type names remain compatibility contracts. Renaming them requires a planned breaking release.
