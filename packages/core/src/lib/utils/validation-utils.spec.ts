import {
  clearTouchedFieldsForPrefix,
  getValidationMeta,
  markFieldTouched,
  POLICY_VALIDATION_META,
  resetValidationMeta,
  shouldShowFieldErrors
} from './validation-meta.util';
import { isValidationFailure } from './validation-result.util';

describe('validation result utilities', () => {
  it('recognizes only message-shaped validation failures', () => {
    expect(isValidationFailure({ message: 'bad' })).toBeTrue();
    expect(isValidationFailure({ message: 123 })).toBeFalse();
    expect(isValidationFailure(true)).toBeFalse();
    expect(isValidationFailure(null)).toBeFalse();
  });
});

describe('validation metadata utilities', () => {
  it('creates metadata lazily and tracks field visibility', () => {
    const model: any = {};
    const first = getValidationMeta(model);

    expect(first).toEqual({ touchedFields: {}, showAllErrors: false });
    expect(getValidationMeta(model)).toBe(first);
    expect(shouldShowFieldErrors(model, 'name')).toBeFalse();

    markFieldTouched(model, 'name');
    expect(shouldShowFieldErrors(model, 'name')).toBeTrue();
    expect(shouldShowFieldErrors(model, 'other')).toBeFalse();

    first.showAllErrors = true;
    expect(shouldShowFieldErrors(model, 'other')).toBeTrue();
  });

  it('clears touched paths by prefix and safely handles missing metadata', () => {
    const model: any = {};
    clearTouchedFieldsForPrefix(model, 'sections.one.');

    markFieldTouched(model, 'sections.one.a');
    markFieldTouched(model, 'sections.two.a');
    clearTouchedFieldsForPrefix(model, 'sections.one.');

    expect(getValidationMeta(model).touchedFields).toEqual({ 'sections.two.a': true });
  });

  it('resets metadata completely', () => {
    const model: any = {};
    markFieldTouched(model, 'name');

    resetValidationMeta(model);

    expect(model[POLICY_VALIDATION_META]).toBeUndefined();
  });
});
