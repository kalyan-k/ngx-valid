import { type ValidationPolicy, type Validator, type ValidatorHelper } from '@validation-rules/angular';

export class StateProfilePolicy implements ValidationPolicy {
  addValidations(v: ValidatorHelper): Validator[] {
    return [
      v.validateFor('fullName').isRequired('Full name is required'),
      v.validateFor('email').isRequired('Email is required').isEmail('Enter a valid email address'),
      v.validateFor('role').isRequired('Choose an account role')
    ];
  }
}

export class ReactiveAccountPolicy implements ValidationPolicy {
  addValidations(v: ValidatorHelper): Validator[] {
    return [
      v.validateFor('displayName').isRequired('Display name is required'),
      v.validateFor('workEmail').isRequired('Work email is required').isEmail('Enter a valid work email'),
      v.validateFor('seatCount').isNumber('Seat count must be numeric').range('Choose between 1 and 500 seats', 1, 500, 'number')
    ];
  }
}
