import { CompleteValidationDisplayClassMap } from '../interfaces/validation-display.interface';

/** DOM attributes used by ngx-valid display strategies (stable contract for custom implementations). */
export const NGX_VALID_DOM = {
  error: 'data-ngx-valid-error',
  errorContainer: 'data-ngx-valid-error-container',
  required: 'data-ngx-valid-required',
  field: 'data-ngx-valid-field',
  bootstrapErrorsFor: 'data-ngx-valid-bootstrap-errors-for',
  tailwindErrorsFor: 'data-ngx-valid-tailwind-errors-for',
  materialErrorsFor: 'data-ngx-valid-mat-errors-for'
} as const;

export const GENERIC_DISPLAY_CLASSES = {
  invalid: 'ngx-valid-invalid',
  error: 'ngx-valid-error',
  errorContainer: 'ngx-valid-error-container',
  requiredMarker: 'ngx-valid-required-marker',
  baseInvalid: 'ngx-valid-invalid',
  radioGroupInvalid: 'ngx-valid-radio-group-invalid'
} as const satisfies CompleteValidationDisplayClassMap;

export const BOOTSTRAP_DISPLAY_CLASSES = {
  invalid: 'is-invalid',
  error: 'ngx-valid-bootstrap-field-error',
  errorContainer: 'ngx-valid-bootstrap-error-container',
  requiredMarker: 'ngx-valid-required-marker text-danger',
  baseInvalid: 'is-invalid',
  radioGroupInvalid: 'ngx-valid-radio-group-invalid'
} as const satisfies CompleteValidationDisplayClassMap;

export const TAILWIND_DISPLAY_CLASSES = {
  invalid: 'tw-input-invalid',
  error: 'tw-field-error',
  errorContainer: 'tw-error-container',
  requiredMarker: 'tw-required-marker',
  baseInvalid: 'tw-input-invalid',
  radioGroupInvalid: 'tw-choice-invalid'
} as const satisfies CompleteValidationDisplayClassMap;

export const MATERIAL_DISPLAY_CLASSES = {
  invalid: 'ngx-valid-mat-invalid',
  error: 'mat-error ngx-valid-mat-field-error',
  errorContainer: 'mat-mdc-form-field-error-wrapper',
  requiredMarker: 'ngx-valid-mat-required-marker',
  baseInvalid: 'ngx-valid-mat-invalid',
  radioGroupInvalid: 'ngx-valid-mat-radio-group-invalid',
  checkboxErrorContainer: 'ngx-valid-mat-checkbox-errors',
  radioErrorContainer: 'ngx-valid-mat-radio-errors'
} as const;

export const DEFAULT_REQUIRED_MARKER = ' *';

export const DEFAULT_ERROR_ELEMENT_TAG = 'div';
