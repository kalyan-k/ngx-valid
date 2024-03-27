import { ValidationHelper, ValidationPolicy, Validator, ValidatorHelper } from "core";


export class SampleFormValidationPolicy implements ValidationPolicy {
    addValidations(validatorHelper: ValidatorHelper): Validator[] {
        const personValidations = [
            validatorHelper.validateFor('firstName').isRequired('First Name is required'),
            validatorHelper.validateFor('lastName').isRequired('Last Name is required'),
            validatorHelper.validateFor('age').isRequired('Age is required').isNumber('Age should be number'),
            validatorHelper.validateFor('gender').isRequired('Gender is required'),
            validatorHelper.validateFor('email').isRequired('Email is required').isEmail('Enter valid email'),
            validatorHelper.validateFor('address.line1').isRequired('Street address is required'),
            // validatorHelper.validateFor('address.line2').isRequired('Street address2 is required'),
            validatorHelper.validateFor('address.city', 'address.line1.length > 0').isRequired('City name is required'),
            validatorHelper.validateFor('address.state', 'address.line1.length > 0').isRequired('State name is required'),
            validatorHelper.validateFor('address.zip', 'address.line1.length > 0').isRequired('Zip is required').isNumber('Zip must be a number')
        ];

        return personValidations;
    }
}