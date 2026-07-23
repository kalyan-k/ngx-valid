# Multiple Forms

Multiple forms can share one provider while retaining independent models, errors, touch state, dirty state, and subscriptions.

## Shared provider

```tsx
<ValidationRulesProvider>
  <ShippingForm />
  <BillingForm />
</ValidationRulesProvider>
```

Each `useValidationForm` owns a different model object. The engine publishes model-specific revisions, so validation in one form does not update error state on the other.

Named policies are provider-scoped. Reusing the same policy name acquires another owner and keeps the registration alive until every mounted owner releases it. Prefer the same policy definition for a shared name.

## Independent providers

Use nested or sibling providers when forms must have separate policy namespaces, validation defaults, or injected engines.

```tsx
<ValidationRulesProvider configuration={{ validateOnChange: true }}>
  <SearchForm />
</ValidationRulesProvider>
<ValidationRulesProvider>
  <CheckoutForm />
</ValidationRulesProvider>
```

## Portals and dialogs

React context follows the component tree, including React portals. A form rendered into a dialog portal still sees the provider above the portal-producing component.

## Repeated form components

When mounting repeated instances, either reuse the exact shared policy/name or include a stable instance key in the policy name. Do not generate a new random name during every render.

## Clearing one form

Call that form's `reset` or `clear`. Engine state is keyed by model and does not require a global clear operation.
