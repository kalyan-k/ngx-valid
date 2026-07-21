# Architecture

The platform separates publishable validation packages from private documentation and demo applications.

## Dependency direction

```text
Angular demos → @validation-rules/angular → @validation-rules/core
```

Core cannot import Angular. The Angular adapter consumes core through its public entry point. Demo applications consume the adapter package rather than source files.

## Application platform

```text
Demo Portal
├── Documentation
├── Angular Demo
└── Angular + NgRx Demo
```

The framework-neutral Demo Portal owns a registry of independent applications. Each entry supplies a start script, URL, health URL, description, and documentation link. Startup and status UI are generated from this registry.

## Why applications stay independent

Applications communicate through URLs, not shared runtime state. One demo can fail or restart without changing another. Framework dependencies remain inside their owning demo.

## Build order

1. Build `@validation-rules/core`.
2. Build `@validation-rules/angular`.
3. Build Node portal and documentation applications.
4. Build Angular demo applications.

## Adding a future demo

Implement a complete application under `apps/`, add its Angular or Node build target, add a root start script, and register it in the portal. Add architecture verification and independent tests before displaying it as available.

Do not scaffold placeholder adapters. The portal may describe future directions as roadmap items, but packages and demo directories should correspond to real implementations.
