# What is Validation Rules?

Validation Rules is a policy-driven validation platform for applications that need reusable rules, explicit lifecycle control, and consistent validation state. It separates **what makes a model valid** from the framework code that renders fields and messages.

## Why it exists

Validation logic often spreads across templates, components, event handlers, reducers, and API adapters. That makes the same rule difficult to reuse and even harder to test. Validation Rules gives rules a named policy, gives execution a deliberate lifecycle, and gives frameworks a narrow adapter boundary.

## Philosophy

- Model validation is a domain concern, not a component concern.
- Framework integration should consume a framework-neutral engine.
- A validation result should be inspectable state, not hidden UI behavior.
- Registration and cleanup should be explicit for long-lived applications.
- Public APIs and compatibility hooks should change only through planned releases.

## The platform

The repository contains two publishable packages and several private applications:

- `@validation-rules/core` owns contracts, rules, validators, metadata, and result shapes.
- `@validation-rules/angular` owns Angular policy execution, forms integration, directives, components, and display strategies.
- The Demo Portal launches documentation and every complete demo application.
- The Angular demo covers ngModel and multiple UI strategies.
- The Angular + NgRx demo covers state-only and Reactive Forms workflows.

## Where to go next

Start with [Installation & Quick Start](/docs/getting-started), then read [Policies & Rules](/docs/policies-and-rules). Use the live demos whenever you want to see a concept in a running application.
