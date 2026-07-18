# Policy Validation Core

`@policy-validation/core` contains the framework-independent contracts, fluent validators, built-in validation rules, result models, and validation-state utilities used by Policy Validation.

The package has no Angular imports. Framework adapters depend on this package; this package never depends on an adapter.

## Installation

```bash
npm install @policy-validation/core underscore
```

## Public API

- `ValidationPolicy`, `ValidationModel`
- `Validator`, `ValidatorHelper`, `ValidationHelper`
- validation result, required result, form-group, and policy-group contracts
- validation metadata, touched-state, reset, and failure-shape utilities

The current Angular expression-based policy executor remains in `@policy-validation/angular` because it relies on Angular's expression parser. Extracting that executor requires a future behavior-preserving parser abstraction and is intentionally outside this migration.

## License

MIT - see [LICENSE](LICENSE).
