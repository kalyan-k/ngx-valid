import { type ValidationPolicy, type Validator, type ValidatorHelper } from '@validation-rules/angular';

export class StateProfilePolicy implements ValidationPolicy {
  constructor(private readonly addressCount = 1, private readonly phoneCount = 1) {}

  addValidations(v: ValidatorHelper): Validator[] {
    return [
      v.validateFor('firstName').isRequired('First name is required'),
      v.validateFor('lastName').isRequired('Last name is required'),
      v.validateFor('email').isRequired('Email is required').isEmail('Enter a valid email address'),
      v.validateFor('phone').isRequired('Primary phone is required'),
      v.validateFor('role').isRequired('Choose an account role'),
      v.validateFor('primaryAddress.street').isRequired('Street is required'),
      v.validateFor('primaryAddress.city').isRequired('City is required'),
      v.validateFor('primaryAddress.country').isRequired('Country is required'),
      ...Array.from({ length: this.addressCount }, (_, index) => [
        v.validateFor(`addresses.${index}.label`).isRequired('Address label is required'),
        v.validateFor(`addresses.${index}.street`).isRequired('Street is required'),
        v.validateFor(`addresses.${index}.city`).isRequired('City is required'),
        v.validateFor(`addresses.${index}.country`).isRequired('Country is required')
      ]).flat(),
      ...Array.from({ length: this.phoneCount }, (_, index) =>
        v.validateFor(`phoneNumbers.${index}.value`).isRequired('Phone number is required')
      )
    ];
  }
}

export class EnterpriseStateProfilePolicy implements ValidationPolicy {
  constructor(private readonly addressCount = 1, private readonly phoneCount = 1) {}

  addValidations(v: ValidatorHelper): Validator[] {
    return [
      ...new StateProfilePolicy(this.addressCount, this.phoneCount).addValidations(v),
      v.validateFor('primaryAddress.region').isRequired('State or region is required'),
      v.validateFor('primaryAddress.postalCode').isRequired('Postal code is required'),
      ...Array.from({ length: this.addressCount }, (_, index) => [
        v.validateFor(`addresses.${index}.region`).isRequired('State or region is required'),
        v.validateFor(`addresses.${index}.postalCode`).isRequired('Postal code is required')
      ]).flat(),
      ...Array.from({ length: this.phoneCount }, (_, index) =>
        v.validateFor(`phoneNumbers.${index}.type`).isRequired('Phone type is required')
      )
    ];
  }
}

export class ReactiveAccountPolicy implements ValidationPolicy {
  constructor(private readonly contactCount = 1, private readonly departmentCount = 1) {}

  addValidations(v: ValidatorHelper): Validator[] {
    return [
      v.validateFor('displayName').isRequired('Display name is required'),
      v.validateFor('workEmail').isRequired('Work email is required').isEmail('Enter a valid work email'),
      v.validateFor('seatCount').isNumber('Seat count must be numeric').range('Choose between 1 and 500 seats', 1, 500, 'number'),
      v.validateFor('company.legalName').isRequired('Legal company name is required'),
      v.validateFor('company.country').isRequired('Company country is required'),
      v.validateFor('company.region').isRequired('Company region is required'),
      ...Array.from({ length: this.contactCount }, (_, index) => [
        v.validateFor(`contacts.${index}.name`).isRequired('Contact name is required'),
        v.validateFor(`contacts.${index}.email`).isRequired('Contact email is required').isEmail('Enter a valid contact email')
      ]).flat(),
      ...Array.from({ length: this.departmentCount }, (_, index) => [
        v.validateFor(`departments.${index}.name`).isRequired('Department name is required'),
        v.validateFor(`departments.${index}.budget`).isNumber('Budget must be numeric').range('Budget must be between 1 and 10,000,000', 1, 10000000, 'number')
      ]).flat()
    ];
  }
}
