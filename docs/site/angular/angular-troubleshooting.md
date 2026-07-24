# Angular Troubleshooting

## No error appears

Check `validateModel`, `actualModel`, and `withPolicy`. The path and registered policy must match.

## Required marker is missing

Confirm the display strategy is configured and the policy includes `isRequired`.

## Material errors render outside the field

Use the Material display strategy and wrap controls in the expected Material form-field structure.

## Dynamic errors stay after removing a row

Clear validation state for removed prefixes and replace the generated policy.

## Reactive Forms errors are overwritten

Merge policy errors with existing errors. Remove only the `policyValidation` key when clearing policy state.
