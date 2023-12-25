import { Validator } from "../validator";
import { ValidationHelper } from "../validator-helper";

export interface ValidationPolicy {
    addValidations(validatorHelper: ValidationHelper): Validator[];
}
