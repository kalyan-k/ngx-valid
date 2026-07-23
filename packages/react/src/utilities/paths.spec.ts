import { describe, expect, it } from 'vitest';
import { fieldId, getPropertyValue, setPropertyValue } from './paths';

describe('property path utilities', () => {
  it('reads nested values and stops safely at missing primitives', () => {
    expect(getPropertyValue({ profile: { name: 'Avery' } }, 'profile.name')).toBe('Avery');
    expect(getPropertyValue({ profile: null }, 'profile.name')).toBeUndefined();
    expect(getPropertyValue({ profile: 'text' }, 'profile.name')).toBeUndefined();
    expect(getPropertyValue({ profile: { name: 'Avery' } }, '')).toEqual({ profile: { name: 'Avery' } });
  });

  it('clones nested objects and arrays while creating missing containers', () => {
    const original = { addresses: [{ city: 'Old' }], untouched: { stable: true } };
    const updated = setPropertyValue(original, 'addresses.0.city', 'New');
    expect(updated).toEqual({ addresses: [{ city: 'New' }], untouched: { stable: true } });
    expect(updated).not.toBe(original);
    expect(updated.addresses).not.toBe(original.addresses);
    expect(updated.untouched).toBe(original.untouched);

    expect(setPropertyValue({}, 'rows.0.value', 'created')).toEqual({ rows: [{ value: 'created' }] });
    expect(setPropertyValue({}, 'profile.contact.email', 'a@example.com')).toEqual({ profile: { contact: { email: 'a@example.com' } } });
  });

  it('handles empty paths, root arrays, and stable field IDs', () => {
    const model = { name: 'Avery' };
    expect(setPropertyValue(model, '', 'ignored')).toBe(model);
    expect(setPropertyValue(([{ value: 1 }] as unknown) as Record<string, unknown>, '0.value', 2)).toEqual([{ value: 2 }]);
    expect(fieldId('addresses.0.postal code')).toBe('validation-field-addresses-0-postal-code');
  });
});
