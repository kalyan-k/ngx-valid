# Elf with @validation-rules/angular

Elf is a small reactive store toolkit that uses composable stores and immutable update reducers.

## Enterprise use cases

- Feature-local stores that should stay lightweight.
- Angular screens that already compose RxJS streams.
- Teams that want predictable immutable updates without a large framework surface.

## Why choose it

Choose Elf when you want store discipline with minimal ceremony. Validation Rules policies remain framework-neutral, while Elf commits the validated snapshot through store reducers.

## Integration pattern

The unified Angular demo uses an Elf store for state snapshots and the same `@validation-rules/angular` policy registration, validation groups, summaries, and performance generator as every other implementation.

## Demo pages

- [Overview](http://127.0.0.1:4202/state/elf)
- [Simple Form](http://127.0.0.1:4202/state/elf/simple)
- [Complex Form](http://127.0.0.1:4202/state/elf/complex)
- [Performance Form](http://127.0.0.1:4202/state/elf/performance)
