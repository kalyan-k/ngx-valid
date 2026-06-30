import { Renderer2 } from '@angular/core';
import { ControlType, RequiredResult, ValidationResult } from './validation-result.interface';

export interface ValidationDisplayContext {
  hostElement: HTMLElement;
  controlType: ControlType;
  propertyPath: string;
}

export interface ValidationDisplayStrategy {
  detectControlType(element: HTMLElement): ControlType;
  ensureErrorContainer(context: ValidationDisplayContext, renderer: Renderer2): HTMLElement | null;
  getErrorContainer(context: ValidationDisplayContext): HTMLElement | null;
  renderErrors(
    context: ValidationDisplayContext,
    errors: ValidationResult[],
    renderer: Renderer2
  ): void;
  clearErrors(context: ValidationDisplayContext, renderer: Renderer2): void;
  renderRequiredIndicator(
    context: ValidationDisplayContext,
    requiredResult: RequiredResult,
    renderer: Renderer2
  ): void;
}

export interface ValidationDisplayConfig {
  /** CSS class applied to the host control when invalid */
  invalidClass?: string;
  /** CSS class applied to each error message element */
  errorClass?: string;
  /** HTML tag used for error messages (default: div) */
  errorElementTag?: string;
  /** Text/HTML marker appended to required field labels */
  requiredMarker?: string;
  /** CSS class applied to the required marker element */
  requiredMarkerClass?: string;
  /** Override the default display strategy entirely */
  strategy?: ValidationDisplayStrategy;
  /** Use Material-specific DOM integration when true; otherwise framework-agnostic */
  framework?: 'material' | 'auto';
  /** CSS class for the error message container wrapper */
  errorContainerClass?: string;
}
