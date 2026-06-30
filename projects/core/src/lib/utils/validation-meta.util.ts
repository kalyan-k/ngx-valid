import { ValidationResult } from '../interfaces/validation-result.interface';

export const NGX_VALID_META = '_ngxValidMeta';

export interface ValidationMeta {
  touchedFields: Record<string, boolean>;
  showAllErrors: boolean;
}

export interface ExtendedFormGroupStatus {
  isValid: boolean;
  isInValid: boolean;
  isEvaluated: boolean;
  errors: ValidationResult[];
}

export interface PolicyGroupStatus extends ExtendedFormGroupStatus {
  policyGroupName: string;
}

export function getValidationMeta(model: any): ValidationMeta {
  if (!model[NGX_VALID_META]) {
    model[NGX_VALID_META] = {
      touchedFields: {},
      showAllErrors: false
    };
  }
  return model[NGX_VALID_META];
}

export function markFieldTouched(model: any, propertyPath: string): void {
  getValidationMeta(model).touchedFields[propertyPath] = true;
}

export function shouldShowFieldErrors(model: any, propertyPath: string): boolean {
  const meta = getValidationMeta(model);
  return meta.showAllErrors || !!meta.touchedFields[propertyPath];
}

export function resetValidationMeta(model: any): void {
  delete model[NGX_VALID_META];
}
