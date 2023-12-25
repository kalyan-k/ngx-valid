import { Injectable } from '@angular/core';
import { Validator } from '../validator';
import { ValidationHelper } from '../validator-helper';
import { ValidationPolicy } from '../interface/validation-policy.interface';
import { Policy } from '../policy';
import * as _ from 'underscore';

@Injectable({
	providedIn: 'root'
})
export class ValidationProviderService {
	fileSuffix = '.Policy';
	policies: { [key: string]: Validator[] } = {};
	validatorHelper: ValidationHelper;
	formGroup: { [key: string]: Array<string> } = {};

	constructor() {
		this.validatorHelper = new ValidationHelper();
	}

	register = (name: string, validationPolicy: ValidationPolicy) => {
		const registeredName = name.toLowerCase() + this.fileSuffix;

		if (_.contains(Object.keys(this.policies), registeredName)) {
			console.log(`Policy with the name '${name}' already registred. Hence skipping the regiser part.`);
			return;
		}
		const validators = validationPolicy.addValidations(this.validatorHelper);

		this.policies[registeredName] = validators;
	}

	getPolicy = (name: string) => {
		const registeredName = name.toLowerCase() + this.fileSuffix;
		const policyRegistered = _.contains(Object.keys(this.policies), registeredName);

		if (!policyRegistered) {
			throw new Error(`Policy named '${name}' has not been registered`);
		}

		const policy = new Policy();
		policy.setPolicyVariables(name, this.policies[registeredName]);

		return {
			validate: policy.validate,
			checkModelRequired: policy.checkModelRequired,
			checkFormValid: policy.checkFormGroupValid
		};
	}

}
