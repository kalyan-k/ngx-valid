# NGXS with @validation-rules/angular

NGXS is a class-oriented Angular state library that groups defaults, action handlers, selectors, and state context updates around a feature state.

## Enterprise use cases

- Domain-driven Angular features where teams prefer classes and decorators.
- Workflows that need store semantics with less reducer ceremony.
- Feature modules that colocate state defaults, handlers, and selectors.

## Why choose it

Choose NGXS when action classes and decorated state handlers match your team’s architecture style. Validation Rules stays independent: it validates the model, and NGXS patches the validated snapshot back into feature state.

## Integration pattern

The unified Angular demo commits form snapshots through NGXS action handlers while `@validation-rules/angular` owns validation policies, form groups, summaries, and result metadata.

## Demo pages

- [Overview](http://127.0.0.1:4202/state/ngxs)
- [Simple Form](http://127.0.0.1:4202/state/ngxs/simple)
- [Complex Form](http://127.0.0.1:4202/state/ngxs/complex)
- [Performance Form](http://127.0.0.1:4202/state/ngxs/performance)
