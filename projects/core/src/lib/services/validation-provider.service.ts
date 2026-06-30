import { Injectable } from '@angular/core';
import { Observable, Subject, from } from 'rxjs';
import { concatMap, filter, last, switchMap, tap } from 'rxjs/operators';
import { Validator } from '../validator';
import { ValidationPolicy } from '../interface/validation-policy.interface';
import { Policy } from '../policy';
import * as _ from 'underscore';
import { ValidatorHelper } from '../validator-helper';
import { PolicyGroupConfig } from '../interfaces/validation-result.interface';
import { getValidationMeta, resetValidationMeta } from '../utils/validation-meta.util';

@Injectable({
	providedIn: 'root'
})
export class ValidationProviderService {
	fileSuffix = '.Policy';
	policies: { [key: string]: Validator[] } = {};
	policyGroups: { [key: string]: PolicyGroupConfig } = {};
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

	/** Registers a named group of policies and form-group keys for page-level validation status. */
	registerPolicyGroup = (groupKey: string, config: PolicyGroupConfig) => {
		this.policyGroups[groupKey] = config;
	}

	private createPolicyFacade = (policy: Policy) => ({
		validate: policy.validate.bind(policy),
		checkModelRequired: policy.checkModelRequired.bind(policy),
		checkFormValid: policy.checkFormGroupValid.bind(policy),
		initializeRequiredFields: policy.initializeRequiredFields.bind(policy),
		updateConditionalRequiredFields: policy.updateConditionalRequiredFields.bind(policy)
	});

	getPolicy = (name: string) => {
		const registeredName = name.toLowerCase() + this.fileSuffix;
		const policyRegistered = _.contains(Object.keys(this.policies), registeredName);

		if (!policyRegistered) {
			throw new Error(`Policy named '${name}' has not been registered`);
		}

		const policy = new Policy();
		policy.setPolicyVariables(name, this.policies[registeredName]);

		return this.createPolicyFacade(policy);
	}

	notifyValidationRefresh(model: any): void {
		this.validationRefreshSource.next(model);
	}

	onValidationRefresh(model: any): Observable<any> {
		return this.validationRefreshSource.asObservable().pipe(
			filter((refreshedModel) => refreshedModel === model)
		);
	}

	validateAll(
		model: any,
		policyName: string,
		options?: { showAllErrors?: boolean; evaluateGroups?: boolean; markEvaluated?: boolean }
	): Observable<any> {
		const policy = this.getPolicy(policyName);
		const showAllErrors = options?.showAllErrors ?? false;
		const evaluateGroups = options?.evaluateGroups ?? false;
		const markEvaluated = options?.markEvaluated ?? evaluateGroups;

		if (showAllErrors) {
			getValidationMeta(model).showAllErrors = true;
		}

		return policy.validate(model).pipe(
			switchMap(() => policy.checkModelRequired(model)),
			tap(() => {
				policy.updateConditionalRequiredFields(model);
				if (evaluateGroups) {
					policy.checkFormValid(model, this.formGroup, markEvaluated);
				}
				this.notifyValidationRefresh(model);
			})
		);
	}

	/** Validates multiple policies, evaluates form groups and optional policy-group status. */
	evaluatePolicies(
		model: any,
		policyNames: string[],
		policyGroupKey?: string
	): Observable<any> {
		getValidationMeta(model).showAllErrors = true;

		return from(policyNames).pipe(
			concatMap((name) => this.validateAll(model, name, { evaluateGroups: true, markEvaluated: true })),
			last(),
			tap(() => {
				if (policyGroupKey) {
					this.updatePolicyGroupStatus(model, policyGroupKey);
				}
				this.notifyValidationRefresh(model);
			})
		);
	}

	updatePolicyGroupStatus(model: any, groupKey: string): void {
		const config = this.policyGroups[groupKey];
		if (!config) {
			return;
		}

		const propertyPaths = config.formGroups.flatMap((formGroup) => this.formGroup[formGroup] || []);
		const errors = (model.validationResults || []).filter(
			(result: { propertyName: string }) => propertyPaths.includes(result.propertyName)
		);

		model[groupKey] = {
			isValid: errors.length === 0,
			isInValid: errors.length > 0,
			isEvaluated: true,
			errors
		};
	}

	resetFormGroups(): void {
		this.formGroup = {};
	}

	clearValidationState(model: any, policyNames: string[]): void {
		delete model.validationResults;
		delete model.requiredResults;
		resetValidationMeta(model);

		Object.keys(this.formGroup).forEach((groupName) => {
			delete model[groupName];
		});

		Object.keys(this.policyGroups).forEach((groupKey) => {
			delete model[groupKey];
		});

		policyNames.forEach((policyName) => {
			this.getPolicy(policyName).updateConditionalRequiredFields(model);
		});

		this.notifyValidationRefresh(model);
	}
}
