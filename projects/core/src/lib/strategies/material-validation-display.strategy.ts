import { Renderer2 } from '@angular/core';
import {
  ValidationDisplayContext,
  ValidationDisplayStrategy
} from '../interfaces/validation-display.interface';
import { ControlType, RequiredResult, ValidationResult } from '../interfaces/validation-result.interface';

const CHECKBOX_ERROR_CLASS = 'ngx-valid-mat-checkbox-errors';
const RADIO_ERROR_CLASS = 'ngx-valid-mat-radio-errors';

/**
 * Display strategy for Angular Material (MDC-based, v15+).
 * Injects mat-error elements into the form-field subscript area and
 * applies Material invalid / required-marker classes.
 */
export class MaterialValidationDisplayStrategy implements ValidationDisplayStrategy {
  detectControlType(element: HTMLElement): ControlType {
    const tag = element.tagName.toUpperCase();

    if (tag === 'MAT-SELECT') {
      return 'select';
    }
    if (tag === 'MAT-CHECKBOX') {
      return 'checkbox';
    }
    if (tag === 'MAT-RADIO-GROUP') {
      return 'radio';
    }
    if (tag === 'MAT-RADIO-BUTTON') {
      return 'radio';
    }
    if (tag === 'FIELDSET') {
      return 'radio-group';
    }
    if (element.closest('mat-select')) {
      return 'select';
    }
    if (element.closest('mat-checkbox')) {
      return 'checkbox';
    }
    if (element.closest('mat-radio-group')) {
      return 'radio';
    }

    const type = (element.getAttribute('type') || '').toLowerCase();
    if (tag === 'TEXTAREA') {
      return 'textarea';
    }
    if (tag === 'SELECT') {
      return 'select';
    }
    if (type === 'checkbox') {
      return 'checkbox';
    }
    if (type === 'radio') {
      return 'radio';
    }
    return 'input';
  }

  ensureErrorContainer(context: ValidationDisplayContext, renderer: Renderer2): HTMLElement | null {
    const parent = this.findParentFormField(context);
    if (!parent) {
      return null;
    }

    if (context.controlType === 'checkbox') {
      return this.ensureCheckboxErrorContainer(parent, renderer);
    }

    if (context.controlType === 'radio' && parent.tagName.toUpperCase() === 'MAT-RADIO-GROUP') {
      return this.ensureRadioGroupErrorContainer(parent, renderer);
    }

    return this.ensureFormFieldErrorWrapper(parent, renderer);
  }

  getErrorContainer(context: ValidationDisplayContext): HTMLElement | null {
    const parent = this.findParentFormField(context);
    if (!parent) {
      return null;
    }

    if (context.controlType === 'checkbox') {
      return parent.querySelector(`.${CHECKBOX_ERROR_CLASS}`);
    }

    if (context.controlType === 'radio' && parent.tagName.toUpperCase() === 'MAT-RADIO-GROUP') {
      return parent.querySelector(`.${RADIO_ERROR_CLASS}`);
    }

    return (
      parent.querySelector('.mat-mdc-form-field-error-wrapper')
      ?? parent.querySelector('.ng-trigger-transitionMessages')
      ?? parent.querySelector('.ui-validation-transitionMessages')
    );
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
      renderer.addClass(errorElement, 'mat-mdc-form-field-error');
      renderer.addClass(errorElement, 'mat-error');
      renderer.setAttribute(errorElement, 'role', 'alert');
      renderer.appendChild(errorElement, renderer.createText(validationError.error.message));
      renderer.appendChild(container, errorElement);
    });

    this.applyInvalidState(parent, context.controlType, renderer);
  }

  clearErrors(context: ValidationDisplayContext, renderer: Renderer2): void {
    const container = this.getErrorContainer(context);
    const parent = this.findParentFormField(context);
    if (!container || !parent) {
      return;
    }

    container.querySelectorAll('mat-error').forEach((node) => renderer.removeChild(container, node));
    this.clearInvalidState(parent, context.controlType, renderer);
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
      labelElement.querySelectorAll('.mat-placeholder-required, [data-ngx-valid-required]').forEach((marker) => {
        renderer.removeChild(labelElement, marker);
      });

      if (requiredResult.isRequired) {
        const marker = renderer.createElement('span');
        renderer.addClass(marker, 'mat-placeholder-required');
        renderer.addClass(marker, 'mat-form-field-required-marker');
        renderer.addClass(marker, 'mat-mdc-form-field-required-marker');
        renderer.setAttribute(marker, 'data-ngx-valid-required', 'true');
        renderer.setAttribute(marker, 'aria-hidden', 'true');
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

    for (let i = 0; i < 8 && node; i++) {
      const tag = node.tagName.toUpperCase();
      if (targetNames.includes(tag) || node.classList.contains('mat-mdc-form-field')) {
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
        return ['MAT-RADIO-GROUP', 'MAT-RADIO-BUTTON'];
      default:
        return ['MAT-FORM-FIELD'];
    }
  }

  private ensureFormFieldErrorWrapper(parent: HTMLElement, renderer: Renderer2): HTMLElement {
    const existing = parent.querySelector('.mat-mdc-form-field-error-wrapper') as HTMLElement | null;
    if (existing) {
      return existing;
    }

    const legacy = parent.querySelector('.ng-trigger-transitionMessages, .ui-validation-transitionMessages') as HTMLElement | null;
    if (legacy) {
      return legacy;
    }

    let subscript = parent.querySelector('.mat-mdc-form-field-subscript-wrapper') as HTMLElement | null;
    if (!subscript) {
      subscript = renderer.createElement('div');
      renderer.addClass(subscript, 'mat-mdc-form-field-subscript-wrapper');
      renderer.addClass(subscript, 'mat-mdc-form-field-bottom-align');
      renderer.setStyle(subscript, 'display', 'block');
      renderer.appendChild(parent, subscript);
    }

    const wrapper = renderer.createElement('div');
    renderer.addClass(wrapper, 'mat-mdc-form-field-error-wrapper');
    renderer.appendChild(subscript, wrapper);
    return wrapper;
  }

  private ensureCheckboxErrorContainer(parent: HTMLElement, renderer: Renderer2): HTMLElement {
    let container = parent.querySelector(`.${CHECKBOX_ERROR_CLASS}`) as HTMLElement | null;
    if (!container) {
      container = renderer.createElement('div') as HTMLElement;
      renderer.addClass(container, CHECKBOX_ERROR_CLASS);
      renderer.addClass(container, 'mat-mdc-form-field-error-wrapper');
      renderer.appendChild(parent.parentElement ?? parent, container);
    }
    return container;
  }

  private ensureRadioGroupErrorContainer(parent: HTMLElement, renderer: Renderer2): HTMLElement {
    let container = parent.querySelector(`.${RADIO_ERROR_CLASS}`) as HTMLElement | null;
    if (!container) {
      container = renderer.createElement('div') as HTMLElement;
      renderer.addClass(container, RADIO_ERROR_CLASS);
      renderer.addClass(container, 'mat-mdc-form-field-error-wrapper');
      renderer.appendChild(parent, container);
    }
    return container;
  }

  private applyInvalidState(parent: HTMLElement, controlType: ControlType, renderer: Renderer2): void {
    this.getInvalidClasses(controlType).forEach((cls) => renderer.addClass(parent, cls));
    renderer.setAttribute(parent, 'aria-invalid', 'true');
  }

  private clearInvalidState(parent: HTMLElement, controlType: ControlType, renderer: Renderer2): void {
    this.getInvalidClasses(controlType).forEach((cls) => renderer.removeClass(parent, cls));
    renderer.removeAttribute(parent, 'aria-invalid');
  }

  private getInvalidClasses(controlType: ControlType): string[] {
    switch (controlType) {
      case 'checkbox':
        return ['mat-checkbox-invalid', 'mat-mdc-checkbox-invalid'];
      case 'radio':
        return ['mat-radio-invalid', 'mat-mdc-radio-invalid'];
      default:
        return ['mat-form-field-invalid', 'mat-mdc-form-field-invalid'];
    }
  }

  private getLabelElements(context: ValidationDisplayContext, parent: HTMLElement): HTMLElement[] {
    if (context.controlType === 'input' || context.controlType === 'select' || context.controlType === 'textarea') {
      const matLabel = parent.querySelector('mat-label');
      if (matLabel) {
        return [matLabel as HTMLElement];
      }
      const mdcLabel = parent.querySelector('.mat-mdc-floating-label, .mdc-floating-label, .mat-form-field-label');
      return mdcLabel ? [mdcLabel as HTMLElement] : [];
    }

    if (context.controlType === 'checkbox') {
      const label = parent.querySelector('.mdc-label, .mat-mdc-checkbox-label, .mat-checkbox-label');
      return label ? [label as HTMLElement] : [];
    }

    if (context.controlType === 'radio') {
      const groupLabel = parent.querySelector('.mat-group-label, legend, mat-label');
      if (groupLabel) {
        return [groupLabel as HTMLElement];
      }
    }

    return [];
  }
}
