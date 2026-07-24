# Angular FAQ

## Does the Angular package require template-driven forms?

No. `policyValidator` is template-driven, but services can validate plain models and can be coordinated with Reactive Forms or NgRx.

## Can I use Angular Material?

Yes. Use the Material display strategy so errors and invalid state match Material form-field expectations.

## Can policies be shared with React?

Yes, when policies import only Core contracts.

## How do I validate generated controls?

Generate both the rendered controls and the policy from the same field metadata. Use `replacePolicy()` when metadata changes.

## Should I call validate on every keypress?

Use field-level validation for focused feedback and policy/group validation for submit, section validation, and save workflows.
