# NgRx with @validation-rules/angular

NgRx is a Redux-inspired Angular state library built around actions, reducers, selectors, and immutable snapshots.

## Enterprise use cases

- Multi-step workflows shared across routes or feature modules.
- Auditable state transitions where every form change and validation result should be traceable.
- Large Angular applications that already use selectors, reducers, and effects.

## Why choose it

Choose NgRx when explicit events and reducer tests are more important than minimizing boilerplate. Validation Rules fits this model because policies validate a plain draft model, then the validated model and result metadata can be committed through an action.

## Integration pattern

The unified Angular demo stores the form snapshot through NgRx actions and reducers while `@validation-rules/angular` evaluates the same model paths used by every other Angular state demo.

## Demo pages

- [Overview](http://127.0.0.1:4202/state/ngrx)
- [Simple Form](http://127.0.0.1:4202/state/ngrx/simple)
- [Complex Form](http://127.0.0.1:4202/state/ngrx/complex)
- [Performance Form](http://127.0.0.1:4202/state/ngrx/performance)
