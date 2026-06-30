import { Renderer2 } from '@angular/core';
import {
  ValidationDisplayConfig,
  ValidationDisplayContext,
  ValidationDisplayStrategy
} from '../interfaces/validation-display.interface';
import { ControlType, RequiredResult, ValidationResult } from '../interfaces/validation-result.interface';
import { addClasses, removeClasses } from '../utils/dom.util';

const ERROR_ATTR = 'data-ngx-valid-error';
const ERROR_CONTAINER_ATTR = 'data-ngx-valid-error-container';
const BASE_INVALID_CLASS = 'ngx-valid-invalid';
const BASE_ERROR_CLASS = 'ngx-valid-error';
const RADIO_GROUP_INVALID_CLASS = 'ngx-valid-radio-group-invalid';

/**
 * Framework-agnostic display strategy. Uses configurable CSS classes so consumers
 * can map to Bootstrap, Tailwind, Material, or custom styles.
 */
export class GenericValidationDisplayStrategy implements ValidationDisplayStrategy {
  private readonly invalidClass: string;
  private readonly errorClass: string;
  private readonly errorElementTag: string;
  private readonly requiredMarker: string;
  private readonly requiredMarkerClass: string;
  private readonly errorContainerClass: string;

  constructor(config: ValidationDisplayConfig = {}) {
    this.invalidClass = config.invalidClass ?? BASE_INVALID_CLASS;
    this.errorClass = config.errorClass ?? BASE_ERROR_CLASS;
    this.errorElementTag = config.errorElementTag ?? 'div';
    this.requiredMarker = config.requiredMarker ?? ' *';
    this.requiredMarkerClass = config.requiredMarkerClass ?? 'ngx-valid-required-marker';
    this.errorContainerClass = config.errorContainerClass ?? 'ngx-valid-error-container';
  }

  detectControlType(element: HTMLElement): ControlType {
    const tag = element.tagName.toUpperCase();

    if (tag === 'FIELDSET') {
      return 'radio-group';
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
    return this.getErrorContainer(context) ?? this.createErrorContainer(context, renderer);
  }

  getErrorContainer(context: ValidationDisplayContext): HTMLElement | null {
    const root = this.getDisplayRoot(context);
    if (!root) {
      return null;
    }

    return root.querySelector(`[${ERROR_CONTAINER_ATTR}="${this.containerId(context)}"]`) as HTMLElement | null;
  }

  renderErrors(
    context: ValidationDisplayContext,
    errors: ValidationResult[],
    renderer: Renderer2
  ): void {
    this.clearErrors(context, renderer);

    if (!errors.length) {
      return;
    }

    const container = this.createErrorContainer(context, renderer);
    if (!container) {
      return;
    }

    errors.forEach((validationError) => {
      const errorElement = renderer.createElement(this.errorElementTag);
      addClasses(renderer, errorElement, `${this.errorClass} ${BASE_ERROR_CLASS}`);
      renderer.setAttribute(errorElement, ERROR_ATTR, 'true');
      renderer.setAttribute(errorElement, 'role', 'alert');
      renderer.appendChild(errorElement, renderer.createText(validationError.error.message));
      renderer.appendChild(container, errorElement);
    });

    this.applyInvalidState(context, renderer);
  }

  clearErrors(context: ValidationDisplayContext, renderer: Renderer2): void {
    const container = this.getErrorContainer(context);
    if (container?.parentElement) {
      renderer.removeChild(container.parentElement, container);
    }

    this.clearInvalidState(context, renderer);
  }

  renderRequiredIndicator(
    context: ValidationDisplayContext,
    requiredResult: RequiredResult,
    renderer: Renderer2
  ): void {
    const label = this.findLabel(context);
    if (!label) {
      return;
    }

    const existingMarkers = label.querySelectorAll('[data-ngx-valid-required="true"]');
    existingMarkers.forEach((marker) => renderer.removeChild(label, marker));

    if (requiredResult.isRequired) {
      const marker = renderer.createElement('span');
      addClasses(renderer, marker, this.requiredMarkerClass);
      renderer.setAttribute(marker, 'data-ngx-valid-required', 'true');
      renderer.setAttribute(marker, 'aria-hidden', 'true');
      renderer.appendChild(marker, renderer.createText(this.requiredMarker));
      renderer.appendChild(label, marker);
    }
  }

  private applyInvalidState(context: ValidationDisplayContext, renderer: Renderer2): void {
    if (context.controlType === 'radio' || context.controlType === 'radio-group') {
      this.getRadioInputs(context).forEach((radio) => {
        addClasses(renderer, radio, BASE_INVALID_CLASS);
        const formCheck = radio.closest('.form-check');
        if (formCheck) {
          addClasses(renderer, formCheck as Element, RADIO_GROUP_INVALID_CLASS);
        }
      });
      const fieldset = this.getFieldset(context);
      if (fieldset) {
        addClasses(renderer, fieldset, RADIO_GROUP_INVALID_CLASS);
        renderer.setAttribute(fieldset, 'aria-invalid', 'true');
      }
      return;
    }

    if (context.controlType === 'checkbox') {
      addClasses(renderer, context.hostElement, `${BASE_INVALID_CLASS}`);
      const formCheck = context.hostElement.closest('.form-check');
      if (formCheck) {
        addClasses(renderer, formCheck as Element, RADIO_GROUP_INVALID_CLASS);
      }
      renderer.setAttribute(context.hostElement, 'aria-invalid', 'true');
      return;
    }

    addClasses(renderer, context.hostElement, `${this.invalidClass} ${BASE_INVALID_CLASS}`);
    renderer.setAttribute(context.hostElement, 'aria-invalid', 'true');
  }

  private clearInvalidState(context: ValidationDisplayContext, renderer: Renderer2): void {
    if (context.controlType === 'radio' || context.controlType === 'radio-group') {
      this.getRadioInputs(context).forEach((radio) => {
        removeClasses(renderer, radio, BASE_INVALID_CLASS);
        removeClasses(renderer, radio, this.invalidClass);
        const formCheck = radio.closest('.form-check');
        if (formCheck) {
          removeClasses(renderer, formCheck as Element, RADIO_GROUP_INVALID_CLASS);
        }
      });
      const fieldset = this.getFieldset(context);
      if (fieldset) {
        removeClasses(renderer, fieldset, RADIO_GROUP_INVALID_CLASS);
        renderer.removeAttribute(fieldset, 'aria-invalid');
      }
      return;
    }

    if (context.controlType === 'checkbox') {
      removeClasses(renderer, context.hostElement, `${this.invalidClass} ${BASE_INVALID_CLASS}`);
      const formCheck = context.hostElement.closest('.form-check');
      if (formCheck) {
        removeClasses(renderer, formCheck as Element, RADIO_GROUP_INVALID_CLASS);
      }
      renderer.removeAttribute(context.hostElement, 'aria-invalid');
      return;
    }

    removeClasses(renderer, context.hostElement, `${this.invalidClass} ${BASE_INVALID_CLASS}`);
    renderer.removeAttribute(context.hostElement, 'aria-invalid');
  }

  private createErrorContainer(context: ValidationDisplayContext, renderer: Renderer2): HTMLElement | null {
    const root = this.getDisplayRoot(context);
    if (!root) {
      return null;
    }

    const container = renderer.createElement('div');
    addClasses(renderer, container, this.errorContainerClass);
    renderer.setAttribute(container, ERROR_CONTAINER_ATTR, this.containerId(context));

    if (context.controlType === 'radio' || context.controlType === 'radio-group') {
      renderer.appendChild(root, container);
      return container;
    }

    renderer.insertBefore(root, container, context.hostElement.nextSibling);
    return container;
  }

  private containerId(context: ValidationDisplayContext): string {
    if (context.controlType === 'radio' || context.controlType === 'radio-group') {
      return context.propertyPath;
    }

    const hostId = context.hostElement.getAttribute('id');
    return hostId ?? context.propertyPath;
  }

  private getDisplayRoot(context: ValidationDisplayContext): HTMLElement | null {
    if (context.controlType === 'radio' || context.controlType === 'radio-group') {
      return this.getFieldset(context) ?? context.hostElement.parentElement;
    }

    return context.hostElement.parentElement;
  }

  private getFieldset(context: ValidationDisplayContext): HTMLElement | null {
    if (context.hostElement.tagName.toUpperCase() === 'FIELDSET') {
      return context.hostElement;
    }

    return context.hostElement.closest('fieldset') as HTMLElement | null;
  }

  private getRadioInputs(context: ValidationDisplayContext): HTMLInputElement[] {
    const fieldset = this.getFieldset(context);
    if (fieldset) {
      return Array.from(fieldset.querySelectorAll('input[type="radio"]')) as HTMLInputElement[];
    }

    const name = context.hostElement.getAttribute('name');
    if (!name) {
      return [context.hostElement as HTMLInputElement];
    }

    return Array.from(
      context.hostElement.ownerDocument.querySelectorAll(`input[type="radio"][name="${name}"]`)
    ) as HTMLInputElement[];
  }

  private findLabel(context: ValidationDisplayContext): HTMLElement | null {
    const host = context.hostElement;

    if (context.controlType === 'radio' || context.controlType === 'radio-group') {
      const fieldset = this.getFieldset(context);
      if (fieldset) {
        const legend = fieldset.querySelector('legend');
        if (legend) {
          return legend as HTMLElement;
        }
      }
    }

    const id = host.getAttribute('id');
    if (id && context.controlType !== 'radio') {
      const labelByFor = host.ownerDocument.querySelector(`label[for="${id}"]`);
      if (labelByFor) {
        return labelByFor as HTMLElement;
      }
    }

    const parentLabel = host.closest('label');
    if (parentLabel) {
      return parentLabel as HTMLElement;
    }

    const fieldWrapper = host.closest('[data-ngx-valid-field], .form-group, .form-check, fieldset, .field, .mb-3');
    if (fieldWrapper) {
      const legend = fieldWrapper.querySelector('legend');
      if (legend) {
        return legend as HTMLElement;
      }
      const label = fieldWrapper.querySelector('label');
      return label as HTMLElement | null;
    }

    return null;
  }
}
