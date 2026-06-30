import { Renderer2 } from '@angular/core';
import {
  ValidationDisplayConfig,
  ValidationDisplayContext,
  ValidationDisplayStrategy
} from '../interfaces/validation-display.interface';
import { ControlType, RequiredResult, ValidationResult } from '../interfaces/validation-result.interface';

const ERROR_ATTR = 'data-ngx-valid-error';
const ERROR_CONTAINER_ATTR = 'data-ngx-valid-error-container';

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
    this.invalidClass = config.invalidClass ?? 'ngx-valid-invalid';
    this.errorClass = config.errorClass ?? 'ngx-valid-error';
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
    const parent = host.parentElement;
    if (!parent) {
      return null;
    }

    const next = host.nextElementSibling;
    if (next?.hasAttribute(ERROR_CONTAINER_ATTR)) {
      return next as HTMLElement;
    }

    return null;
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
      renderer.addClass(errorElement, this.errorClass);
      renderer.setAttribute(errorElement, ERROR_ATTR, 'true');
      renderer.setAttribute(errorElement, 'role', 'alert');
      renderer.appendChild(errorElement, renderer.createText(validationError.error.message));
      renderer.appendChild(container, errorElement);
    });

    renderer.addClass(context.hostElement, this.invalidClass);
    renderer.setAttribute(context.hostElement, 'aria-invalid', 'true');
  }

  clearErrors(context: ValidationDisplayContext, renderer: Renderer2): void {
    const container = this.getErrorContainer(context);
    if (container) {
      renderer.removeChild(container.parentElement, container);
    }

    this.getOrphanedErrors(context).forEach((node) => {
      renderer.removeChild(node.parentElement, node);
    });

    renderer.removeClass(context.hostElement, this.invalidClass);
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

    const existingMarkers = label.querySelectorAll(`[data-ngx-valid-required="true"]`);
    existingMarkers.forEach((marker) => renderer.removeChild(label, marker));

    if (requiredResult.isRequired) {
      const marker = renderer.createElement('span');
      renderer.addClass(marker, this.requiredMarkerClass);
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
    renderer.addClass(container, this.errorContainerClass);
    renderer.setAttribute(container, ERROR_CONTAINER_ATTR, 'true');
    renderer.insertBefore(parent, container, context.hostElement.nextSibling);
    return container;
  }

  /** Legacy error nodes inserted without a container (backward compatibility). */
  private getOrphanedErrors(context: ValidationDisplayContext): HTMLElement[] {
    const host = context.hostElement;
    const parent = host.parentElement;
    if (!parent) {
      return [];
    }

    const orphans: HTMLElement[] = [];
    let sibling = host.nextElementSibling;
    while (sibling?.hasAttribute(ERROR_ATTR)) {
      orphans.push(sibling as HTMLElement);
      sibling = sibling.nextElementSibling;
    }
    return orphans;
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

    const fieldWrapper = host.closest('[data-ngx-valid-field], .form-group, .form-check, .field, .mb-3');
    if (fieldWrapper) {
      return fieldWrapper.querySelector('label, legend') as HTMLElement | null;
    }

    return null;
  }
}
