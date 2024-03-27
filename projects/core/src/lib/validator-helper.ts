import { Validator } from "./validator";

export class ValidatorHelper {

  constructor() { }

  validateFor = (propName: string, dependency?: any): Validator => {
    const validator = new Validator();

    validator.propertyName = propName;
    validator.dependency = dependency;

    return validator;
  }
}
