# Performance

The adapter favors model-specific subscriptions, stable callbacks, focused property validation, and per-field async tokens. Application component structure still determines how many controls render after a controlled model update.

## Keep definitions stable

Declare static policy arrays outside components or memoize them. Recreate dynamic policy and group arrays only when their shape changes.

```ts
const policies = useMemo(
  () => [{ name: 'rows', policy: createRowsPolicy(rows.length) }],
  [rows.length]
);
```

## Validate the smallest useful scope

- Validate one property on blur or selected changes.
- Validate one group for wizard/section progression.
- Validate all on submit or an explicit action.

Avoid validate-all on every keystroke in large forms unless measured product requirements justify it.

## Component rendering

`useValidationRules` subscribes through `useSyncExternalStore` to one model revision. `useValidationField` derives focused state from its form. For very large forms, split sections into memoized components, keep props stable, and consider an external normalized state owner with the low-level hook.

## Async validation

Older results for a property are ignored after a newer run begins. This prevents stale UI but does not cancel application network requests. Use `AbortController` inside custom async rules when cancellation saves meaningful work.

## Measure, do not claim

Use the browser Performance API around real actions and React Profiler for render analysis. The [Performance form](http://127.0.0.1:4204/state/local-state/performance) displays its current validate-all time, page render count, run count, generated section count, generated control count, and error count. These values describe that browser/session; they are not universal benchmarks.
