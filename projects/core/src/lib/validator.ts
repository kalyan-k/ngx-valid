import { ValidationHelper } from "./validator-helper";

type ValidatorsToRun = {
    errorMessage: string,
    isValid: (v: string, m?: any) => any,
    isOptional: boolean,
    isNullOrEmpty: (value: any) => boolean,
    checkIsRequired: boolean
};

export class Validator {
    public propertyName: string | undefined;
    // public dependency: string;
    private validationRules: ValidationHelper;
    public validatorsToRun: ValidatorsToRun[] = [];

    constructor() {
        this.validationRules = new ValidationHelper();
    }

    createDecoratedValidator = (msg: string, validatorFunction: (v: any, m?: any) => any, isOptional: boolean, isRequired = false) => {
        this.validatorsToRun.push({
            'errorMessage': msg,
            'isValid': validatorFunction,
            'isOptional': isOptional,
            'isNullOrEmpty': this.validationRules.isNullOrEmpty,
            'checkIsRequired': isRequired
        });
    }

    createError = (msg: string) => {
        return { 'message': msg }; // do not use Error Class as this create stacktrace as well and it is a costly operation
    }

    isChecked = (msg: string) => {
        const isValid = (value: boolean) => {
            if (!this.validationRules.isChecked(value)) {
                return this.createError(msg);
            }

            return true;
        };

        this.createDecoratedValidator.call(this, msg, isValid, false, true);
        return this;
    }

    isRequired = (msg: string) => {
        const isValid = (value: any) => {
            if (this.validationRules.isNullOrEmpty(value)) {
                return this.createError(msg);
            }

            return true;
        };

        this.createDecoratedValidator.call(this, msg, isValid, false, true);
        return this;
    }

    isNumber = (msg: string) => {
        const isValid = (value: number) => {
            if (!this.validationRules.isNumber(value)) {
                return this.createError(msg);
            }

            return true;
        };

        this.createDecoratedValidator.call(this, msg, isValid, true);
        return this;
    }

    isAboveMin = (msg: string, min: number) => {
        const isValid = (value: number) => {
            if (!this.validationRules.isAboveMin(min, value)) {
                return this.createError(msg);
            }

            return true;
        };

        this.createDecoratedValidator.call(this, msg, isValid, true);
        return this;
    }

    isBelowMax = (msg: string, max: number) => {
        const isValid = (value: number) => {
            if (!this.validationRules.isBelowMax(max, value)) {
                return this.createError(msg);
            }

            return true;
        };

        this.createDecoratedValidator.call(this, msg, isValid, true);
        return this;
    }

    regEx = (msg: string, pattern: string) => {
        const isValid = (value: string) => {
            if (!this.validationRules.regEx(pattern, value)) {
                return this.createError(msg);
            }

            return true;
        };

        this.createDecoratedValidator.call(this, msg, isValid, true);
        return this;
    }

    regExLiteral = (msg: string, pattern: RegExp) => {
        const isValid = (value: string) => {
            if (!this.validationRules.regExLiteral(pattern, value)) {
                return this.createError(msg);
            }

            return true;
        };

        this.createDecoratedValidator.call(this, msg, isValid, true);
        return this;
    }

    userDefined = (msg: string, cb: (m: any, v: any, ms: string) => any) => {
        const isValid = (value: any, model: any) => {
            return cb.call(this, model, value, msg);
        };

        this.createDecoratedValidator.call(this, msg, isValid, true);
        return this;
    }

    isEmail = (msg: string) => {
        const isValid = (value: string) => {
            if (!this.validationRules.isEmail(value)) {
                return this.createError(msg);
            }

            return true;
        };

        this.createDecoratedValidator.call(this, msg, isValid, true);
        return this;
    }

    isDate = (msg: string) => {
        const isValid = (value: any) => {
            if (!this.validationRules.isDate(value)) {
                return this.createError(msg);
            }

            return true;
        };

        this.createDecoratedValidator.call(this, msg, isValid, true);
        return this;
    }

    isZipCode = (msg: string) => {
        const isValid = (value: string) => {
            if (!this.validationRules.isZipCode(value)) {
                return this.createError(msg);
            }

            return true;
        };

        this.createDecoratedValidator.call(this, msg, isValid, true);
        return this;
    }

    range = (msg: string, min: any, max: any, type: string) => {
        let isValid: (value: any) => true | { message: string; };

        switch (type.toLowerCase()) {
            case 'date':
                isValid = (value: any) => {
                    if (!this.validationRules.dateRange(min, max, value)) {
                        return this.createError(msg);
                    }

                    return true;
                };
                break;
            case 'number':
                isValid = (value: any) => {
                    if (!this.validationRules.numberRange(min, max, value)) {
                        return this.createError(msg);
                    }

                    return true;
                };
                break;
            default:
                isValid = (value: any) => {
                    return true;
                }
                (function (value) {
                    console.log("range(): Incorrect type configured.");
                })();
        }

        this.createDecoratedValidator.call(this, msg, isValid, true);
        return this;
    }

    isPhone = (msg: string) => {
        const isValid = (value: string) => {
            if (!this.validationRules.isPhone(value)) {
                return this.createError(msg);
            }

            return true;
        };

        this.createDecoratedValidator.call(this, msg, isValid, true);
        return this;
    }

    isVin = (msg: string) => {
        const isValid = (value: string) => {
            if (!this.validationRules.isVin(value)) {
                return this.createError(msg);
            }

            return true;
        };

        this.createDecoratedValidator.call(this, msg, isValid, true);
        return this;
    }

    isSSN = (msg: string) => {
        const isValid = (value: string) => {
            if (!this.validationRules.isSSN(value)) {
                return this.createError(msg);
            }

            return true;
        };

        this.createDecoratedValidator.call(this, msg, isValid, true);
        return this;
    }

}