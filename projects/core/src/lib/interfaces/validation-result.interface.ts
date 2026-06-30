export interface ValidationError {
  message: string;
}

export interface ValidationResult {
  propertyName: string;
  error: ValidationError;
}

export interface RequiredResult {
  propertyName: string;
  isRequired: boolean;
  hasRequiredError: boolean;
}

export interface FormGroupStatus {
  isValid: boolean;
  isInValid: boolean;
}

export type ControlType = 'input' | 'checkbox' | 'radio' | 'select' | 'textarea';
