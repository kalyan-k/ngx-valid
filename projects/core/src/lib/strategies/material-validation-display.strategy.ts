import { Renderer2 } from '@angular/core';
import {
  ValidationDisplayContext,
  ValidationDisplayStrategy
} from '../interfaces/validation-display.interface';
import { ControlType, RequiredResult, ValidationResult } from '../interfaces/validation-result.interface';

export class MaterialValidationDisplayStrategy implements ValidationDisplayStrategy {
  detectControlType(element: HTMLElement): ControlType {
    const classList = Array.from(element.classList).map((c) => c.toUpperCase());

    if (classList.some((c) => c === 'MAT-CHECKBOX-INPUT' || c === 'MAT-CHECKBOX')) {
      return 'checkbox';
    }
    if (classList.some((c) => c === 'MAT-RADIO-INPUT' || c === 'MAT-RADIO-GROUP' || c === 'RADIO-GROUP')) {
      return 'radio';
    }
    if (classList.some((c) => c === 'MAT-SELECT')) {
      return 'select';
    }
    return 'input';
  }

  ensureErrorContainer(context: ValidationDisplayContext, renderer: Renderer2): HTMLElement | null {
    const parent = this.findParentFormField(context);
    if (!parent) {
      return null;
    }

    if (context.controlType === 'checkbox' || context.controlType === 'radio') {
      let errorElement = parent.querySelector('.ui-validation-transitionMessages') as HTMLElement | null;
      if (!errorElement) {
        errorElement = renderer.createElement('div');
        renderer.addClass(errorElement, 'ui-validation-transitionMessages');
        renderer.appendChild(parent, errorElement);
      }
      return errorElement;
    }

    return parent.querySelector('.ng-trigger-transitionMessages') as HTMLElement | null;
  }

  getErrorContainer(context: ValidationDisplayContext): HTMLElement | null {
    const parent = this.findParentFormField(context);
    if (!parent) {
      return null;
    }

    if (context.controlType === 'checkbox' || context.controlType === 'radio') {
      return parent.querySelector('.ui-validation-transitionMessages') as HTMLElement | null;
    }

    return parent.querySelector('.ng-trigger-transitionMessages') as HTMLElement | null;
  }

  renderErrors(
    context: ValidationDisplayContext,
    errors: ValidationResult[],
    renderer: Renderer2
  ): void {
    const container = this.getErrorContainer(context) ?? this.ensureErrorContainer(context, renderer);
    const parent = this.findParentFormField(context);
    if (!container || !parent) {
      return;
    }

    this.clearErrors(context, renderer);

    errors.forEach((validationError) => {
      const errorElement = renderer.createElement('mat-error');
      renderer.addClass(errorElement, 'mat-error');
      renderer.appendChild(errorElement, renderer.createText(validationError.error.message));
      const refNode = container.querySelector('div');
      if (refNode) {
        renderer.insertBefore(container, errorElement, refNode);
      } else {
        renderer.appendChild(container, errorElement);
      }
    });

    renderer.addClass(parent, this.getInvalidClass(context.controlType));
  }

  clearErrors(context: ValidationDisplayContext, renderer: Renderer2): void {
    const container = this.getErrorContainer(context);
    const parent = this.findParentFormField(context);
    if (!container || !parent) {
      return;
    }

    const existingErrors = container.querySelectorAll('mat-error');
    existingErrors.forEach((node) => renderer.removeChild(container, node));
    renderer.removeClass(parent, this.getInvalidClass(context.controlType));
  }

  renderRequiredIndicator(
    context: ValidationDisplayContext,
    requiredResult: RequiredResult,
    renderer: Renderer2
  ): void {
    const parent = this.findParentFormField(context);
    if (!parent) {
      return;
    }

    const labelElements = this.getLabelElements(context, parent);
    labelElements.forEach((labelElement) => {
      const existingMarkers = labelElement.querySelectorAll('.mat-placeholder-required, [data-ngx-valid-required]');
      existingMarkers.forEach((marker) => renderer.removeChild(labelElement, marker));

      if (requiredResult.isRequired) {
        const marker = renderer.createElement('span');
        renderer.addClass(marker, 'mat-placeholder-required');
        renderer.addClass(marker, 'mat-form-field-required-marker');
        renderer.setAttribute(marker, 'data-ngx-valid-required', 'true');
        renderer.appendChild(marker, renderer.createText(' *'));
        renderer.appendChild(labelElement, marker);
        renderer.addClass(labelElement, 'label-required');
      } else if (labelElement.classList.contains('label-required')) {
        renderer.removeClass(labelElement, 'label-required');
      }
    });
  }

  private findParentFormField(context: ValidationDisplayContext): HTMLElement | null {
    let node: HTMLElement | null = context.hostElement;
    const targetNames = this.getParentNodeNames(context.controlType);

    for (let i = 0; i < 6 && node; i++) {
      if (targetNames.includes(node.nodeName.toUpperCase())) {
        return node;
      }
      node = node.parentElement;
    }

    return context.hostElement.parentElement;
  }

  private getParentNodeNames(controlType: ControlType): string[] {
    switch (controlType) {
      case 'checkbox':
        return ['MAT-CHECKBOX'];
      case 'radio':
        return ['MAT-RADIO-GROUP'];
      default:
        return ['MAT-FORM-FIELD'];
    }
  }

  private getInvalidClass(controlType: ControlType): string {
    switch (controlType) {
      case 'checkbox':
        return 'mat-checkbox-invalid';
      case 'radio':
        return 'mat-radio-invalid';
      default:
        return 'mat-form-field-invalid';
    }
  }

  private getLabelElements(context: ValidationDisplayContext, parent: HTMLElement): HTMLElement[] {
    if (context.controlType === 'input' || context.controlType === 'select' || context.controlType === 'textarea') {
      const label = parent.querySelector('.mat-form-field-label');
      return label ? [label as HTMLElement] : [];
    }
    if (context.controlType === 'checkbox') {
      const label = parent.querySelector('.mat-checkbox-label');
      return label ? [label as HTMLElement] : [];
    }
    return Array.from(parent.querySelectorAll('.mat-radio-label-content')) as HTMLElement[];
  }
}
