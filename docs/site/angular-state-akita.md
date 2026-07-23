# Akita with @validation-rules/angular

Akita models state as stores and queries. Stores own updates; queries expose read models for components and services.

## Enterprise use cases

- CRUD-heavy Angular domains with clear read/write boundaries.
- Feature stores where query selectors are useful but full Redux ceremony is not needed.
- Incremental migrations from service state into structured stores.

## Why choose it

Choose Akita when Store + Query separation keeps feature state readable. Validation Rules integrates by validating the plain model and writing validation results back to the store snapshot.

## Integration pattern

The unified Angular demo updates an Akita store for the selected strategy and keeps `@validation-rules/angular` policies identical to every other state implementation.

## Demo pages

- [Overview](http://127.0.0.1:4202/state/akita)
- [Simple Form](http://127.0.0.1:4202/state/akita/simple)
- [Complex Form](http://127.0.0.1:4202/state/akita/complex)
- [Performance Form](http://127.0.0.1:4202/state/akita/performance)
