import { Renderer2 } from '@angular/core';
import {
  ValidationDisplayConfig,
  ValidationDisplayContext,
  ValidationDisplayStrategy
} from '../interfaces/validation-display.interface';
import { ControlType, RequiredResult, ValidationResult } from '../interfaces/validation-result.interface';
import { BootstrapValidationDisplayStrategy } from './bootstrap-validation-display.strategy';
import { MaterialValidationDisplayStrategy } from './material-validation-display.strategy';

export class DefaultValidationDisplayStrategy implements ValidationDisplayStrategy {
  private readonly bootstrapStrategy: BootstrapValidationDisplayStrategy;
  private readonly materialStrategy: MaterialValidationDisplayStrategy;
  private readonly framework: 'bootstrap' | 'material' | 'auto';

  constructor(config: ValidationDisplayConfig = {}) {
    this.framework = config.framework ?? 'auto';
    this.bootstrapStrategy = new BootstrapValidationDisplayStrategy(
      config.invalidClass,
      config.errorClass,
      config.errorElementTag,
      config.requiredMarker,
      config.requiredMarkerClass
    );
    this.materialStrategy = new MaterialValidationDisplayStrategy();
  }

  detectControlType(element: HTMLElement): ControlType {
    return this.resolveStrategy(element).detectControlType(element);
  }

  ensureErrorContainer(context: ValidationDisplayContext, renderer: Renderer2): HTMLElement | null {
    return this.resolveStrategy(context.hostElement).ensureErrorContainer(context, renderer);
  }

  getErrorContainer(context: ValidationDisplayContext): HTMLElement | null {
    return this.resolveStrategy(context.hostElement).getErrorContainer(context);
  }

  renderErrors(
    context: ValidationDisplayContext,
    errors: ValidationResult[],
    renderer: Renderer2
  ): void {
    this.resolveStrategy(context.hostElement).renderErrors(context, errors, renderer);
  }

  clearErrors(context: ValidationDisplayContext, renderer: Renderer2): void {
    this.resolveStrategy(context.hostElement).clearErrors(context, renderer);
  }

  renderRequiredIndicator(
    context: ValidationDisplayContext,
    requiredResult: RequiredResult,
    renderer: Renderer2
  ): void {
    this.resolveStrategy(context.hostElement).renderRequiredIndicator(context, requiredResult, renderer);
  }

  private resolveStrategy(element: HTMLElement): ValidationDisplayStrategy {
    if (this.framework === 'bootstrap') {
      return this.bootstrapStrategy;
    }
    if (this.framework === 'material') {
      return this.materialStrategy;
    }

    if (this.isMaterialElement(element)) {
      return this.materialStrategy;
    }

    return this.bootstrapStrategy;
  }

  private isMaterialElement(element: HTMLElement): boolean {
    let node: HTMLElement | null = element;
    for (let i = 0; i < 6 && node; i++) {
      const nodeName = node.nodeName.toUpperCase();
      if (
        nodeName.startsWith('MAT-') ||
        node.classList.contains('mat-form-field') ||
        node.classList.contains('mat-checkbox') ||
        node.classList.contains('mat-radio-group')
      ) {
        return true;
      }
      node = node.parentElement;
    }
    return false;
  }
}
