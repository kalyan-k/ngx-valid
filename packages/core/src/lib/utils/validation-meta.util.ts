import { ValidationResult } from '../interfaces/validation-result.interface';

export const POLICY_VALIDATION_META = '_policyValidationMeta';

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
  if (!model[POLICY_VALIDATION_META]) {
    model[POLICY_VALIDATION_META] = {
      touchedFields: {},
      showAllErrors: false
    };
  }
  return model[POLICY_VALIDATION_META];
}

export function markFieldTouched(model: any, propertyPath: string): void {
  getValidationMeta(model).touchedFields[propertyPath] = true;
}

export function shouldShowFieldErrors(model: any, propertyPath: string): boolean {
  const meta = getValidationMeta(model);
  return meta.showAllErrors || !!meta.touchedFields[propertyPath];
}

export function clearTouchedFieldsForPrefix(model: any, prefix: string): void {
  const meta = model[POLICY_VALIDATION_META] as ValidationMeta | undefined;
  if (!meta?.touchedFields) {
    return;
  }

  for (const key of Object.keys(meta.touchedFields)) {
    if (key.startsWith(prefix)) {
      delete meta.touchedFields[key];
    }
  }
}

export function resetValidationMeta(model: any): void {
  delete model[POLICY_VALIDATION_META];
}
