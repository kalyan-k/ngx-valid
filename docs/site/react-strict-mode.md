# Strict Mode

React Strict Mode intentionally replays effect setup and cleanup in development. The adapter balances policy/group lifecycle operations under that behavior.

## Registration ownership

Every `registerPolicy` call receives a private owner token and returns an idempotent cleanup function. A named policy remains available while at least one owner is mounted. Cleanup removes only its own token.

This handles:

- Strict Mode effect setup, cleanup, and setup replay.
- Multiple mounted forms using the same shared policy.
- Unmounting one form without unregistering another form's policy.
- Cleanup functions called more than once.

## Provider engine stability

An internally created engine is stored in a ref and is stable across renders and Strict Mode effect replay. An injected engine is never destroyed by provider cleanup.

## Dynamic policies

When a memoized policy array changes, React first releases the old registrations and then acquires the new ones. Keep the array stable for static policies to avoid unnecessary lifecycle work.

## Subscriptions

Model subscriptions return a cleanup that removes only the current listener. `useSyncExternalStore` supplies the same revision getter for client and server snapshots.

## Testing Strict Mode

Wrap a harness in `<StrictMode>` and assert that validation works once, errors are not duplicated, and the final unmount removes the policy. The package test suite includes this lifecycle case.
