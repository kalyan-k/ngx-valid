import { $parse } from './expression-parser';

describe('$parse', () => {
  it('returns a no-op for non-string, empty, and malformed expressions', () => {
    expect(($parse as any)(null)({ value: 1 })).toBeUndefined();
    expect($parse('   ')({ value: 1 })).toBeUndefined();
    expect($parse('value +')({ value: 1 })).toBeUndefined();
  });

  it('reads nested properties safely and lets locals override context', () => {
    const getter = $parse('profile.name');
    expect(getter({ profile: { name: 'Ada' } })).toBe('Ada');
    expect(getter({ profile: null })).toBeNull();
    expect($parse('value')({ value: 'context' }, { value: 'local' })).toBe('local');
  });

  it('evaluates arrays, maps, and keyed reads', () => {
    expect($parse('[first, 2]')({ first: 1 })).toEqual([1, 2]);
    expect($parse('{one: first, two: 2}')({ first: 1 })).toEqual({ one: 1, two: 2 });
    expect($parse('items[index]')({ items: ['a', 'b'], index: 1 })).toBe('b');
  });

  it('evaluates unary, binary, short-circuit, and conditional expressions', () => {
    expect($parse('!enabled')({ enabled: false })).toBeTrue();
    expect($parse('left + right')({ left: 2, right: 3 })).toBe(5);
    expect($parse('missing + right')({ right: 3 })).toBe(3);
    expect($parse('missing - right')({ right: 3 })).toBe(-3);
    expect($parse('left > right')({ left: 3, right: 2 })).toBeTrue();
    expect($parse('enabled && profile.ready')({ enabled: false, profile: null })).toBeFalse();
    expect($parse('enabled && profile.ready')({ enabled: true, profile: { ready: true } })).toBeTrue();
    expect($parse('enabled || fallback')({ enabled: true, fallback: false })).toBeTrue();
    expect($parse('enabled || fallback')({ enabled: false, fallback: 'used' })).toBe('used');
    expect($parse('enabled ? yes : no')({ enabled: true, yes: 1, no: 2 })).toBe(1);
    expect($parse('enabled ? yes : no')({ enabled: false, yes: 1, no: 2 })).toBe(2);
  });

  it('calls methods and caches the compiled function', () => {
    const expression = 'profile.label(prefix)';
    const context = { profile: { label: (prefix: string) => `${prefix} name` }, prefix: 'Display' };
    const first = $parse(expression);

    expect(first(context)).toBe('Display name');
    expect($parse(expression)).toBe(first);
  });
});
