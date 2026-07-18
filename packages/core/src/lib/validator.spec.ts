import { ValidationHelper } from './validation-helper';
import { Validator } from './validator';
import { ValidatorHelper } from './validator-helper';

describe('Validator and ValidatorHelper', () => {
  function outcome(validator: Validator, index: number, value: any, model: any = {}): any {
    return validator.validatorsToRun[index].isValid(value, model);
  }

  it('creates validators with property paths and dependencies', () => {
    const dependency = (model: any) => model.enabled;
    const validator = new ValidatorHelper().validateFor('profile.email', dependency);

    expect(validator.propertyName).toBe('profile.email');
    expect(validator.dependency).toBe(dependency as any);
  });

  it('decorates required and checked rules with required metadata', () => {
    const validator = new Validator().isRequired('required').isChecked('checked');

    expect(outcome(validator, 0, '')).toEqual({ message: 'required' });
    expect(outcome(validator, 0, 'value')).toBeTrue();
    expect(outcome(validator, 1, false)).toEqual({ message: 'checked' });
    expect(outcome(validator, 1, true)).toBeTrue();
    expect(validator.validatorsToRun.every((rule) => rule.checkIsRequired)).toBeTrue();
    expect(validator.validatorsToRun.every((rule) => !rule.isOptional)).toBeTrue();
  });

  it('supports number and inclusive minimum/maximum rules', () => {
    const validator = new Validator()
      .isNumber('number')
      .isAboveMin('minimum', 2)
      .isBelowMax('maximum', 4);

    expect(outcome(validator, 0, 'bad')).toEqual({ message: 'number' });
    expect(outcome(validator, 0, 3)).toBeTrue();
    expect(outcome(validator, 1, 1)).toEqual({ message: 'minimum' });
    expect(outcome(validator, 1, 2)).toBeTrue();
    expect(outcome(validator, 2, 5)).toEqual({ message: 'maximum' });
    expect(outcome(validator, 2, 4)).toBeTrue();
  });

  it('supports string, literal regular expression, email, and date rules', () => {
    const validator = new Validator()
      .regEx('pattern', '^ok$')
      .regExLiteral('literal', /^yes$/)
      .isEmail('email')
      .isDate('date');

    expect(outcome(validator, 0, 'no')).toEqual({ message: 'pattern' });
    expect(outcome(validator, 0, 'ok')).toBeTrue();
    expect(outcome(validator, 1, 'no')).toEqual({ message: 'literal' });
    expect(outcome(validator, 1, 'yes')).toBeTrue();
    expect(outcome(validator, 2, 'bad')).toEqual({ message: 'email' });
    expect(outcome(validator, 2, 'person@example.com')).toBeTrue();
    expect(outcome(validator, 3, 'bad')).toEqual({ message: 'date' });
    expect(outcome(validator, 3, '2025-01-01')).toBeTrue();
  });

  it('supports ZIP, phone, VIN, and SSN rules', () => {
    const validator = new Validator()
      .isZipCode('zip')
      .isPhone('phone')
      .isVin('vin')
      .isSSN('ssn');

    expect(outcome(validator, 0, 'bad')).toEqual({ message: 'zip' });
    expect(outcome(validator, 0, '12345')).toBeTrue();
    expect(outcome(validator, 1, 'bad')).toEqual({ message: 'phone' });
    expect(outcome(validator, 1, '212-555-1212')).toBeTrue();
    expect(outcome(validator, 2, 'bad')).toEqual({ message: 'vin' });
    expect(outcome(validator, 2, '1HGCM82633A004352')).toBeTrue();
    expect(outcome(validator, 3, 'bad')).toEqual({ message: 'ssn' });
    expect(outcome(validator, 3, '123-45-6789')).toBeTrue();
  });

  it('supports date and number ranges and safely accepts an unknown range type', () => {
    const consoleSpy = spyOn(console, 'log');
    const validator = new Validator()
      .range('number range', 1, 3, 'number')
      .range('date range', '2025-01-01', '2025-12-31', 'date')
      .range('unknown', 1, 3, 'text');

    expect(outcome(validator, 0, 4)).toEqual({ message: 'number range' });
    expect(outcome(validator, 0, 2)).toBeTrue();
    expect(outcome(validator, 1, '2026-01-01')).toEqual({ message: 'date range' });
    expect(outcome(validator, 1, '2025-06-01')).toBeTrue();
    expect(outcome(validator, 2, 'anything')).toBeTrue();
    expect(consoleSpy).toHaveBeenCalledWith('range(): Incorrect type configured.');
  });

  it('passes model, value, and message to user-defined rules', () => {
    const callback = jasmine.createSpy('callback').and.returnValue({ message: 'custom' });
    const model = { expected: 3 };
    const validator = new Validator().userDefined('custom', callback);

    expect(outcome(validator, 0, 2, model)).toEqual({ message: 'custom' });
    expect(callback).toHaveBeenCalledWith(model, 2, 'custom');
    expect(validator.createError('problem')).toEqual({ message: 'problem' });
    expect(validator.validatorsToRun[0].isOptional).toBeTrue();
    expect(validator.validatorsToRun[0].isNullOrEmpty).toBeInstanceOf(Function);
  });

  it('uses the same empty-value semantics as ValidationHelper', () => {
    const rule = new Validator().isEmail('email').validatorsToRun[0];
    expect(rule.isNullOrEmpty('')).toBeTrue();
    expect(rule.isNullOrEmpty(false)).toBeFalse();
    expect(new ValidationHelper().isNullOrEmpty(false)).toBeFalse();
  });
});
