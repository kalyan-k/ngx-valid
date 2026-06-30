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
    const host = context.hostElement;
    const containerId = this.containerId(context);
    const parent = host.parentElement;
    if (!parent) {
      return null;
    }

    return parent.querySelector(`[${ERROR_CONTAINER_ATTR}="${containerId}"]`) as HTMLElement | null;
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

    addClasses(renderer, context.hostElement, `${this.invalidClass} ${BASE_INVALID_CLASS}`);
    renderer.setAttribute(context.hostElement, 'aria-invalid', 'true');
  }

  clearErrors(context: ValidationDisplayContext, renderer: Renderer2): void {
    const container = this.getErrorContainer(context);
    if (container?.parentElement) {
      renderer.removeChild(container.parentElement, container);
    }

    removeClasses(renderer, context.hostElement, `${this.invalidClass} ${BASE_INVALID_CLASS}`);
    renderer.removeAttribute(context.hostElement, 'aria-invalid');
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

  private createErrorContainer(context: ValidationDisplayContext, renderer: Renderer2): HTMLElement | null {
    const parent = context.hostElement.parentElement;
    if (!parent) {
      return null;
    }

    const container = renderer.createElement('div');
    addClasses(renderer, container, this.errorContainerClass);
    renderer.setAttribute(container, ERROR_CONTAINER_ATTR, this.containerId(context));
    renderer.insertBefore(parent, container, context.hostElement.nextSibling);
    return container;
  }

  private containerId(context: ValidationDisplayContext): string {
    const hostId = context.hostElement.getAttribute('id');
    return hostId ?? context.propertyPath;
  }

  private findLabel(context: ValidationDisplayContext): HTMLElement | null {
    const host = context.hostElement;
    const id = host.getAttribute('id');
    if (id) {
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
      const label = fieldWrapper.querySelector('label, legend');
      return label as HTMLElement | null;
    }

    return null;
  }
}
