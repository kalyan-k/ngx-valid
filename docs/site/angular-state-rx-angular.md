# RxAngular State with @validation-rules/angular

RxAngular State provides component-scoped reactive state with RxJS-friendly updates and lifecycle cleanup.

## Enterprise use cases

- Performance-sensitive Angular screens with local state.
- Components that need observable state slices without a global store.
- Teams optimizing rendering and subscription ownership in complex views.

## Why choose it

Choose RxAngular State when form state should be scoped to the component tree. Validation Rules evaluates the model, and RxAngular State publishes the validated snapshot as local reactive state.

## Integration pattern

The unified Angular demo provides RxAngular State at the demo component boundary and stores the same simple, complex, and performance state shape used by the other strategies.

## Demo pages

- [Overview](http://127.0.0.1:4202/state/rx-angular-state)
- [Simple Form](http://127.0.0.1:4202/state/rx-angular-state/simple)
- [Complex Form](http://127.0.0.1:4202/state/rx-angular-state/complex)
- [Performance Form](http://127.0.0.1:4202/state/rx-angular-state/performance)
