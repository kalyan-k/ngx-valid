import { Validator } from "../validator";
import { ValidatorHelper } from "../validator-helper";

export interface ValidationPolicy {
    addValidations(validatorHelper: ValidatorHelper): Validator[];
}
