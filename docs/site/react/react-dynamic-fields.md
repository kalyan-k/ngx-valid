# Dynamic Fields

Dynamic arrays and conditional sections work through nested property paths and policy/group definitions that match the current model shape.

## Array paths

```ts
addresses.0.street
addresses.0.city
addresses.1.street
```

`setFieldValue` clones each object/array along the updated path. Numeric segments address array entries.

## Generate an array policy

```ts
function createAddressPolicy(count: number): ValidationPolicy {
  return {
    addValidations(helper) {
      return Array.from({ length: count }, (_, index) => [
        helper.validateFor(`addresses.${index}.street`)
          .isRequired(`Address ${index + 1}: street is required.`),
        helper.validateFor(`addresses.${index}.city`)
          .isRequired(`Address ${index + 1}: city is required.`)
      ]).flat();
    }
  };
}
```

Memoize the registration using the array length. When removing items, clear obsolete prefix errors or validate the regenerated policy so shifted indices receive current results.

## Conditional fields

Conditional rendering does not itself activate/deactivate validation. Add a dependency to the field's validator:

```ts
helper.validateFor('secondaryEmail', (model) => model.hasSecondary)
  .isRequired('Secondary email is required.');
```

When the dependency becomes false, the next relevant validation removes that path's previous error. A reset clears all validation state immediately.

## Stable React keys

For editable/reorderable collections, store a stable item ID for React keys. Validation paths still use the current array index unless the model is normalized by ID.

Explore add/remove/populate behavior in the [Complex form](http://127.0.0.1:4204/state/local-state/complex).
