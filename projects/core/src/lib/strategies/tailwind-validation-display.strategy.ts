import { Renderer2 } from '@angular/core';
import {
  ValidationDisplayConfig,
  ValidationDisplayContext,
  ValidationDisplayStrategy
} from '../interfaces/validation-display.interface';
import { ControlType, RequiredResult, ValidationResult } from '../interfaces/validation-result.interface';
import { addClasses, removeClasses } from '../utils/dom.util';

const ERROR_CONTAINER_ATTR = 'data-ngx-valid-tailwind-errors-for';
const CHECKBOX_RADIO_INVALID_CLASS = 'tw-choice-invalid';

/**
 * Tailwind-specific display strategy for the demo app.
 * Keeps checkbox/radio error placement and invalid styling isolated from Bootstrap/Material.
 */
export class TailwindValidationDisplayStrategy implements ValidationDisplayStrategy {
  private readonly invalidClass: string;
  private readonly errorClass: string;
  private readonly errorElementTag: string;
  private readonly requiredMarker: string;
  private readonly requiredMarkerClass: string;
  private readonly errorContainerClass: string;

  constructor(config: ValidationDisplayConfig = {}) {
    this.invalidClass = config.invalidClass ?? 'tw-input-invalid';
    this.errorClass = config.errorClass ?? 'tw-field-error';
    this.errorElementTag = config.errorElementTag ?? 'div';
    this.requiredMarker = config.requiredMarker ?? ' *';
    this.requiredMarkerClass = config.requiredMarkerClass ?? 'tw-required-marker';
    this.errorContainerClass = config.errorContainerClass ?? 'tw-error-container';
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
    return this.findErrorContainer(this.getDisplayRoot(context), this.containerId(context));
  }

  renderErrors(
    context: ValidationDisplayContext,
    errors: ValidationResult[],
    renderer: Renderer2
  ): void {
    if (!errors.length) {
      this.clearErrors(context, renderer);
      return;
    }

    const root = this.getDisplayRoot(context);
    if (!root) {
      return;
    }

    const containerId = this.containerId(context);
    const existingContainers = this.findAllErrorContainers(root, containerId);
    const container = existingContainers[0] ?? this.createErrorContainer(context, renderer);
    if (!container) {
      return;
    }

    // Remove duplicate containers left from prior renders
    existingContainers.slice(1).forEach((duplicate) => {
      if (duplicate.parentElement) {
        renderer.removeChild(duplicate.parentElement, duplicate);
      }
    });

    const nextMessages = errors.map((entry) => entry.error.message).join('\u0000');
    const currentMessages = Array.from(container.querySelectorAll('[role="alert"]'))
      .map((node) => node.textContent ?? '')
      .join('\u0000');

    if (nextMessages === currentMessages) {
      this.applyInvalidState(context, renderer);
      return;
    }

    this.clearErrorMessages(container, renderer);

    errors.forEach((validationError) => {
      const errorElement = renderer.createElement(this.errorElementTag);
      addClasses(renderer, errorElement, this.errorClass);
      renderer.setAttribute(errorElement, 'role', 'alert');
      renderer.appendChild(errorElement, renderer.createText(validationError.error.message));
      renderer.appendChild(container, errorElement);
    });

    this.applyInvalidState(context, renderer);
  }

  clearErrors(context: ValidationDisplayContext, renderer: Renderer2): void {
    const root = this.getDisplayRoot(context);
    const containerId = this.containerId(context);

    if (root) {
      this.findAllErrorContainers(root, containerId).forEach((container) => {
        if (container.parentElement) {
          renderer.removeChild(container.parentElement, container);
        }
      });
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

    const existingMarker = label.querySelector('[data-ngx-valid-required="true"]');

    if (!requiredResult.isRequired) {
      if (existingMarker) {
        renderer.removeChild(label, existingMarker);
      }
      return;
    }

    if (existingMarker) {
      return;
    }

    const marker = renderer.createElement('span');
    addClasses(renderer, marker, this.requiredMarkerClass);
    renderer.setAttribute(marker, 'data-ngx-valid-required', 'true');
    renderer.setAttribute(marker, 'aria-hidden', 'true');
    renderer.appendChild(marker, renderer.createText(this.requiredMarker));
    renderer.appendChild(label, marker);
  }

  private createErrorContainer(context: ValidationDisplayContext, renderer: Renderer2): HTMLElement | null {
    const root = this.getDisplayRoot(context);
    if (!root) {
      return null;
    }

    const container = renderer.createElement('div');
    addClasses(renderer, container, this.errorContainerClass);
    renderer.setAttribute(container, ERROR_CONTAINER_ATTR, this.containerId(context));
    renderer.appendChild(root, container);
    return container;
  }

  private clearErrorMessages(container: HTMLElement, renderer: Renderer2): void {
    renderer.setProperty(container, 'innerHTML', '');
  }

  private applyInvalidState(context: ValidationDisplayContext, renderer: Renderer2): void {
    if (context.controlType === 'radio-group') {
      const fieldset = context.hostElement;
      addClasses(renderer, fieldset, CHECKBOX_RADIO_INVALID_CLASS);
      renderer.setAttribute(fieldset, 'aria-invalid', 'true');
      this.getRadioInputs(context).forEach((radio) => {
        addClasses(renderer, radio, this.invalidClass);
      });
      return;
    }

    if (context.controlType === 'checkbox') {
      addClasses(renderer, context.hostElement, this.invalidClass);
      const root = this.getDisplayRoot(context);
      if (root) {
        addClasses(renderer, root, CHECKBOX_RADIO_INVALID_CLASS);
      }
      renderer.setAttribute(context.hostElement, 'aria-invalid', 'true');
      return;
    }

    addClasses(renderer, context.hostElement, this.invalidClass);
    renderer.setAttribute(context.hostElement, 'aria-invalid', 'true');
  }

  private clearInvalidState(context: ValidationDisplayContext, renderer: Renderer2): void {
    if (context.controlType === 'radio-group') {
      const fieldset = context.hostElement;
      removeClasses(renderer, fieldset, CHECKBOX_RADIO_INVALID_CLASS);
      renderer.removeAttribute(fieldset, 'aria-invalid');
      this.getRadioInputs(context).forEach((radio) => {
        removeClasses(renderer, radio, this.invalidClass);
      });
      return;
    }

    if (context.controlType === 'checkbox') {
      removeClasses(renderer, context.hostElement, this.invalidClass);
      const root = this.getDisplayRoot(context);
      if (root) {
        removeClasses(renderer, root, CHECKBOX_RADIO_INVALID_CLASS);
      }
      renderer.removeAttribute(context.hostElement, 'aria-invalid');
      return;
    }

    removeClasses(renderer, context.hostElement, this.invalidClass);
    renderer.removeAttribute(context.hostElement, 'aria-invalid');
  }

  private getDisplayRoot(context: ValidationDisplayContext): HTMLElement | null {
    const host = context.hostElement;

    if (context.controlType === 'radio-group') {
      return host;
    }

    return host.closest('[data-ngx-valid-field], .tw-field') as HTMLElement | null
      ?? host.parentElement;
  }

  private containerId(context: ValidationDisplayContext): string {
    return context.propertyPath;
  }

  private findErrorContainer(root: HTMLElement | null, containerId: string): HTMLElement | null {
    if (!root) {
      return null;
    }

    const matches = this.findAllErrorContainers(root, containerId);
    return matches[0] ?? null;
  }

  private findAllErrorContainers(root: HTMLElement, containerId: string): HTMLElement[] {
    return Array.from(root.querySelectorAll(`[${ERROR_CONTAINER_ATTR}]`))
      .filter((node) => node.getAttribute(ERROR_CONTAINER_ATTR) === containerId) as HTMLElement[];
  }

  private getRadioInputs(context: ValidationDisplayContext): HTMLInputElement[] {
    if (context.hostElement.tagName.toUpperCase() === 'FIELDSET') {
      return Array.from(
        context.hostElement.querySelectorAll('input[type="radio"]')
      ) as HTMLInputElement[];
    }

    return [];
  }

  private findLabel(context: ValidationDisplayContext): HTMLElement | null {
    const host = context.hostElement;

    if (context.controlType === 'radio-group') {
      return host.querySelector('legend') as HTMLElement | null;
    }

    const id = host.getAttribute('id');
    if (id) {
      const labelByFor = host.ownerDocument.querySelector(`label[for="${id}"]`);
      if (labelByFor) {
        return labelByFor as HTMLElement;
      }
    }

    const fieldWrapper = host.closest('[data-ngx-valid-field], .tw-field') as HTMLElement | null;
    if (fieldWrapper) {
      const twLabel = fieldWrapper.querySelector('.tw-label, .tw-check-label');
      if (twLabel) {
        return twLabel as HTMLElement;
      }
    }

    return null;
  }
}
