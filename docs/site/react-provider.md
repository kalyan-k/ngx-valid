# Provider

`ValidationRulesProvider` exposes the nearest `ValidationEngine` and default field-validation behavior.

## Signature

```tsx
<ValidationRulesProvider
  engine={optionalEngine}
  configuration={{
    validateOnBlur: true,
    validateOnChange: false
  }}
>
  {children}
</ValidationRulesProvider>
```

## Engine ownership

Without an `engine` prop, the provider creates one stable engine for its lifetime. Pass an engine when application code needs to register policies before rendering, share an engine with non-React code, or inspect validation programmatically.

```tsx
const engine = new ValidationEngine();

root.render(
  <ValidationRulesProvider engine={engine}>
    <App />
  </ValidationRulesProvider>
);
```

Provider unmount does not destroy an injected engine. Hook effects release their own policy and group registrations.

## Nested providers

Nested providers are supported. Hooks always use the nearest provider, which makes independent embedded workflows and multiple validation contexts predictable. A nested provider has a separate engine unless it receives the parent engine explicitly.

## Configuration

- `validateOnBlur` defaults to `true`.
- `validateOnChange` defaults to `false`.
- Field options override either value for one control.

## Missing provider

`useValidationRulesContext`, `useValidationRules`, `useValidationForm`, and `useValidationField` require a provider. Context access outside it throws a clear error rather than silently creating a global engine.

## Strict Mode and cleanup

Policies are registered in effects through owner tokens. Repeated setup/cleanup in development Strict Mode stays balanced. Multiple forms may acquire the same named policy; it remains registered until the final owner releases it.

## SSR considerations

The provider is import-safe in Node and does not perform DOM work. Effects register policies after hydration. Do not start validation during server render; validate in an event, an effect, or a server-side domain layer using core rules directly.
