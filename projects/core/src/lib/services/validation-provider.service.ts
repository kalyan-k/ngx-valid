import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { filter, switchMap, tap } from 'rxjs/operators';
import { Validator } from '../validator';
import { ValidationPolicy } from '../interface/validation-policy.interface';
import { Policy } from '../policy';
import * as _ from 'underscore';
import { ValidatorHelper } from '../validator-helper';

@Injectable({
	providedIn: 'root'
})
export class ValidationProviderService {
	fileSuffix = '.Policy';
	policies: { [key: string]: Validator[] } = {};
	validatorHelper: ValidatorHelper;
	formGroup: { [key: string]: Array<string> } = {};
	private validationRefreshSource = new Subject<any>();

	constructor() {
		this.validatorHelper = new ValidatorHelper();
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
			validate: policy.validate.bind(policy),
			checkModelRequired: policy.checkModelRequired.bind(policy),
			checkFormValid: policy.checkFormGroupValid.bind(policy),
			initializeRequiredFields: policy.initializeRequiredFields.bind(policy)
		};
	}

	/** Notifies all ngxValidator directives bound to this model to refresh their UI. */
	notifyValidationRefresh(model: any): void {
		this.validationRefreshSource.next(model);
	}

	/** Observable stream for directives to listen for full-form validation refresh. */
	onValidationRefresh(model: any): Observable<any> {
		return this.validationRefreshSource.asObservable().pipe(
			filter((refreshedModel) => refreshedModel === model)
		);
	}

	/** Validates an entire model, refreshes required markers, updates form groups, and notifies UI. */
	validateAll(model: any, policyName: string): Observable<any> {
		const policy = this.getPolicy(policyName);
		return policy.validate(model).pipe(
			switchMap(() => policy.checkModelRequired(model)),
			tap(() => {
				policy.checkFormValid(model, this.formGroup);
				this.notifyValidationRefresh(model);
			})
		);
	}

	resetFormGroups(): void {
		this.formGroup = {};
	}

	/**
	 * Clears validation state on a model and re-applies required-field markers.
	 * Use when resetting a form to its initial state.
	 */
	clearValidationState(model: any, policyNames: string[]): void {
		delete model.validationResults;
		delete model.requiredResults;

		Object.keys(this.formGroup).forEach((groupName) => {
			delete model[groupName];
		});

		policyNames.forEach((policyName) => {
			this.getPolicy(policyName).initializeRequiredFields(model);
		});

		this.notifyValidationRefresh(model);
	}
}
