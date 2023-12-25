
import { Observable, Subject, forkJoin as observableForkJoin, of as observableOf } from 'rxjs';
import { map, take } from 'rxjs/operators';
import * as _ from 'underscore';
import { $parse } from './parser/expression-parser';
import { Validator } from './validator';

export class Policy {
    // tslint:disable:no-unused-variable
    private name: string | undefined;
    private validators: Validator[] = [];

    constructor() { }

    private handleAsyncCall = (model: any, validator: any, error: any) => {
        const propertyName = this.validators[validator].propertyName;

        // Check for duplicate error messages since the policy validate method can be called multiple times
        // before async validation resolves.
        if (error && !this.isDuplicate(model, propertyName, error.message) && !!model.validationResults) {
            model.validationResults.push({
                'propertyName': propertyName,
                'error': error
            });
        }
    }

    private handleAsyncCallForRequiredCheck = (model: any, validator: any, checkIsRequired: any, errorMsg: any) => {
        const propertyName = this.validators[validator].propertyName;

        if (model.requiredResults) {
            const reqResultIdx = _.findIndex(model.requiredResults, { 'propertyName': propertyName });

            if (reqResultIdx > -1) {

                if (model.requiredResults[reqResultIdx].hasRequiredError !== !!errorMsg) {
                    model.requiredResults[reqResultIdx] = {
                        'propertyName': propertyName,
                        'isRequired': checkIsRequired,
                        'hasRequiredError': !!errorMsg
                    };
                }

            } else {
                model.requiredResults.push({
                    'propertyName': propertyName,
                    'isRequired': checkIsRequired,
                    'hasRequiredError': !!errorMsg
                });
            }
        }
    }

    private isDuplicate = (model: any, propertyName: any, errorMsg: any) => {
        let returnValue = false;

        if (model.validationResults) {
            const filteredArray = _.where(model.validationResults, { 'propertyName': propertyName });

            _.forEach(filteredArray, function (value) {
                if (value.error && value.error.message === errorMsg) {
                    returnValue = true;
                }
            });
        }

        return returnValue;
    }


    private parseValue = (model: any, property: any) => {
        const propertyArray = property.split('.');
        let returnValue = model;

        for (let i = 0; i < propertyArray.length; i++) {
            returnValue = returnValue[propertyArray[i]];
            if (!returnValue) { break; }
        }

        return returnValue;
    }

    private canRunValidation = (model: any, value: any, validator: any, validationRule: any) => {
        if (validator.dependency) {
            if (_.isFunction(validator.dependency)) {
                return validator.dependency.call(this, model);
            } else {
                const getter = $parse(validator.dependency);
                const result = getter(model);

                return result;
            }
        }

        // Don't run validation if the rule is optional and doesn't have a value.
        if (validator.validatorsToRun[validationRule].isOptional && validator.validatorsToRun[validationRule].isNullOrEmpty(value)) {
            return false;
        }

        return true;
    }

    private runValidation = (model: any, validator: any, validationRule: any) => {
        // Check for dependency
        if (this.canRunValidation.call(this, model, this.parseValue(model, this.validators[validator].propertyName),
            this.validators[validator], validationRule)) {
            return this.validators[validator].validatorsToRun[validationRule]
                .isValid.call(model, this.parseValue(model, this.validators[validator].propertyName), model);
        }

        return;
    }

    public validate = (model: any, propertyName: string) => {
        const self = this;
        const results: Array<Observable<any>> = [];

        if (propertyName) {
            model.validationResults = model.validationResults || [];

            // Only remove the passed in property's errors that is under validation
            let index = model.validationResults.length;
            while (index--) {
                if (model.validationResults[index].propertyName === propertyName) {
                    model.validationResults.splice(index, 1);
                }
            }

        } else {
            // Remove all errors if validating the whole object
            model.validationResults = [];
        }

        for (let validator = 0; validator < this.validators.length; validator++) {
            for (let validationRule = 0; validationRule < this.validators[validator].validatorsToRun.length; validationRule++) {
                // If there is a propertyName specified then only validate that property
                if (propertyName) {
                    if (this.validators[validator].propertyName === propertyName) {
                        const callBackFn = this.runValidation.call(self, model, validator, validationRule);
                        const observableFn = (callBackFn instanceof Subject) ? callBackFn : observableOf(callBackFn);

                        results.push(observableFn.pipe(map(_.bind(this.handleAsyncCall, self, model, validator))));
                    }
                } else {
                    const callBackFn = this.runValidation.call(self, model, validator, validationRule);
                    const observableFn = (callBackFn instanceof Subject) ? callBackFn : observableOf(callBackFn);

                    results.push(observableFn.pipe(map(_.bind(this.handleAsyncCall, self, model, validator))));
                }
            }
        }

        const observable = observableForkJoin(results).pipe(
            map(
                function () {
                    // Delete the validationResults property off of the model if it has no errors
                    if (model.validationResults && model.validationResults.length <= 0) {
                        delete model.validationResults;
                    }
                    return model.validationResults;
                },
                function () {
                    // Delete the validationResults property off of the model since validation couldn't finish.
                    delete model.validationResults;
                }
            ));

        observable.subscribe();

        return observable;
    }

    public checkModelRequired = (model: any, propertyName?: any) => {
        const self = this;

        model.requiredResults = model.requiredResults || [];

        outer_loop:
        for (let validator = 0; validator < this.validators.length; validator++) {
            if (this.validators[validator]) {
                inner_loop:
                for (let validationRule = 0; validationRule < this.validators[validator].validatorsToRun.length; validationRule++) {
                    const checkIsRequired = this.validators[validator].validatorsToRun[validationRule].checkIsRequired;
                    if (checkIsRequired) {
                        // If there is a propertyName specified then only validate that property
                        if (propertyName) {
                            if (this.validators[validator].propertyName === propertyName) {
                                this.handleAsyncCallForRequiredCheck.call(self, model, validator, checkIsRequired, this.runValidation.call(self, model, validator, validationRule));
                                break outer_loop; // donot want to run any other validator for same property and other validators too
                            }
                        } else {
                            this.handleAsyncCallForRequiredCheck.call(self, model, validator, checkIsRequired, this.runValidation.call(self, model, validator, validationRule));
                            break inner_loop; // donot want to run any other validator for same property
                        }
                    }
                }
            }
        }

        // console.warn(model.requiredResults);
        // Delete the requiredResults property off of the model if it has no errors
        if (model.requiredResults && model.requiredResults.length <= 0) {
            delete model.requiredResults;
        }
        return observableOf(model.requiredResults).pipe(take(1));
    }

    // model: The is the model passed in (the actualModel parameter passed to the validator directive).
    // formGroupList: This is the list of all the formGroup Names.
    public checkFormGroupValid = (model: any, formGroupList: any) => {
        // FormGroup holds array of properties grouped by form (sent from UI).
        // Data Type is - { [key: string]: Array<string> } 
        Object.keys(formGroupList).forEach((groupName) => {
            // Here Key is the Group Name.
            // Here this.validationService.formGroup[key] is the array of properties which fall under the "key".
            if (!!groupName) {
                const hasValidationError = _.some(formGroupList[groupName], function (element) {
                    // Here element is nothing but the property of the field.
                    const foundRequiredFields = _.where(model.requiredResults, { 'propertyName': element });
                    const foundValidationErrorFields = _.where(model.validationResults, { 'propertyName': element });
                    let hasAnyRequiredFieldErrors = false;

                    if (foundRequiredFields && !_.isEmpty(foundRequiredFields)) {
                        hasAnyRequiredFieldErrors = _.some(foundRequiredFields, function (element2) {
                            return !!element2.hasRequiredError;
                        });
                    }

                    return hasAnyRequiredFieldErrors || (!!foundValidationErrorFields && !_.isEmpty(foundValidationErrorFields));

                    // if (foundValidationError && !_.isEmpty(foundValidationError)) {
                    //   this.actualModel.formGroup[key]
                    // }
                });

                model[groupName] = { isValid: !hasValidationError, isInValid: hasValidationError };
            }
        });
    }

    public setPolicyVariables = (name: string, validators: Validator[]) => {
        this.name = name.toLowerCase();
        this.validators = validators;
    }
}
