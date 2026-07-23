# Angular Signals with @validation-rules/angular

Angular Signals are fine-grained reactive primitives for synchronous state reads, updates, and computed values.

## Enterprise use cases

- Modern Angular screens with signal-first local state.
- Shared services exposing fine-grained state slices.
- Forms that benefit from synchronous snapshots and computed validation summaries.

## Why choose it

Choose Signals when local or shared state should be simple, synchronous, and fine-grained. Validation Rules validates the object represented by the signal snapshot and writes result metadata back into that snapshot.

## Integration pattern

The unified Angular demo keeps the same policies and page layout while the Signals route commits model changes through Angular signal state.

## Demo pages

- [Overview](http://127.0.0.1:4202/state/signals)
- [Simple Form](http://127.0.0.1:4202/state/signals/simple)
- [Complex Form](http://127.0.0.1:4202/state/signals/complex)
- [Performance Form](http://127.0.0.1:4202/state/signals/performance)
