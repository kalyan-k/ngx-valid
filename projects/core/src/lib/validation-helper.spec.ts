import { ValidationHelper } from './validation-helper';

describe('ValidationHelper', () => {
  let helper: ValidationHelper;

  beforeEach(() => {
    helper = new ValidationHelper();
  });

  it('classifies nullish and empty values without rejecting zero or false', () => {
    expect(helper.isNullOrEmpty(null)).toBeTrue();
    expect(helper.isNullOrEmpty(undefined)).toBeTrue();
    expect(helper.isNullOrEmpty('')).toBeTrue();
    expect(helper.isNullOrEmpty([])).toBeTrue();
    expect(helper.isNullOrEmpty(0)).toBeFalse();
    expect(helper.isNullOrEmpty(false)).toBeFalse();
    expect(helper.isNullOrEmpty(['value'])).toBeFalse();
  });

  it('validates checked, number, and inclusive numeric boundaries', () => {
    expect(helper.isChecked(true)).toBeTrue();
    expect(helper.isChecked(false)).toBeFalse();
    expect(helper.isNumber(12)).toBeTrue();
    expect(helper.isNumber(Number.POSITIVE_INFINITY)).toBeFalse();
    expect(helper.isAboveMin(5, 5)).toBeTrue();
    expect(helper.isAboveMin(5, 4)).toBeFalse();
    expect(helper.isAboveMin(Number.NaN, 6)).toBeFalse();
    expect(helper.isBelowMax(5, 5)).toBeTrue();
    expect(helper.isBelowMax(5, 6)).toBeFalse();
    expect(helper.isBelowMax(Number.NaN, 4)).toBeFalse();
    expect(helper.numberRange(1, 3, 1)).toBeTrue();
    expect(helper.numberRange(1, 3, 4)).toBeFalse();
    expect(helper.numberRange('bad', 3, 2)).toBeFalse();
  });

  it('validates regular expressions and common formatted values', () => {
    expect(helper.regEx('^a+$', 'aaa')).toBeTrue();
    expect(helper.regExLiteral(/^b+$/, 'aaa')).toBeFalse();
    expect(helper.isEmail('user@example.com')).toBeTrue();
    expect(helper.isEmail('not-an-email')).toBeFalse();
    expect(helper.isZipCode('12345-6789')).toBeTrue();
    expect(helper.isZipCode('00000')).toBeFalse();
    expect(helper.isPhone('(212) 555-1212')).toBeTrue();
    expect(helper.isPhone('111')).toBeFalse();
    expect(helper.isVin('1HGCM82633A004352')).toBeTrue();
    expect(helper.isVin('too-short')).toBeFalse();
    expect(helper.isSSN('123-45-6789')).toBeTrue();
    expect(helper.isSSN('000-00-0000')).toBeFalse();
  });

  it('validates real dates and inclusive date ranges', () => {
    expect(helper.isDate('2025-06-15')).toBeTrue();
    expect(helper.isDate(null)).toBeFalse();
    expect(helper.isDate('not-a-date')).toBeFalse();
    expect(helper.dateRange('2025-01-01', '2025-12-31', '2025-01-01')).toBeTrue();
    expect(helper.dateRange('2025-01-01', '2025-12-31', '2026-01-01')).toBeFalse();
    expect(helper.dateRange('bad', '2025-12-31', '2025-01-01')).toBeFalse();
    const min = Date.parse('2025-01-01');
    const max = Date.parse('2025-12-31');
    expect(helper.dateRange(min, max, min)).toBeTrue();
  });
});
