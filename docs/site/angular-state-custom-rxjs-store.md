# Custom RxJS Store with @validation-rules/angular

A custom RxJS store uses a `BehaviorSubject` and small update functions to manage feature state without adopting a store framework.

## Enterprise use cases

- Small feature stores where framework dependencies should stay minimal.
- Libraries, embedded widgets, or migration bridges.
- Teams standardizing a simple internal store abstraction.

## Why choose it

Choose a custom RxJS store when transparency and minimal dependencies matter. Validation Rules keeps policies separate from stream plumbing, so the store only commits form and validation snapshots.

## Integration pattern

The unified Angular demo commits state through a BehaviorSubject-backed store while reusing the same `@validation-rules/angular` policies, groups, summaries, and performance generator.

## Demo pages

- [Overview](http://127.0.0.1:4202/state/custom-rxjs-store)
- [Simple Form](http://127.0.0.1:4202/state/custom-rxjs-store/simple)
- [Complex Form](http://127.0.0.1:4202/state/custom-rxjs-store/complex)
- [Performance Form](http://127.0.0.1:4202/state/custom-rxjs-store/performance)
