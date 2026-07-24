# Angular Architecture

## Layers

```text
Angular component
  -> policyValidator directive
  -> ValidationProviderService
  -> Core ValidationPolicy
  -> display strategy and summary components
```

## ValidationProviderService

The service owns policy registration, form-group registration, policy-group registration, validation execution, refresh notifications, and cleanup.

## Directives

`policyValidator` bridges template controls to model paths. It does not own the domain model; Angular component state or store state remains the source of truth.

## Components

Summary and status components read model metadata and service notifications. They make grouped validation visible without duplicating validation logic.

## Display strategies

Display strategies translate validation state into CSS classes and error containers for Bootstrap, Material, Tailwind-compatible markup, generic controls, or application-specific UI.
