import { Renderer2 } from '@angular/core';
import {
  ValidationDisplayContext,
  ValidationDisplayStrategy
} from '../interfaces/validation-display.interface';
import { ControlType, RequiredResult, ValidationResult } from '../interfaces/validation-result.interface';

const ERROR_CONTAINER_CLASS = 'ngx-valid-error-container';
const ERROR_MESSAGE_CLASS = 'ngx-valid-error';
const REQUIRED_MARKER_CLASS = 'ngx-valid-required-marker';

export class BootstrapValidationDisplayStrategy implements ValidationDisplayStrategy {
  constructor(
    private readonly invalidClass = 'is-invalid',
    private readonly errorClass = ERROR_MESSAGE_CLASS,
    private readonly errorElementTag = 'div',
    private readonly requiredMarker = ' *',
    private readonly requiredMarkerClass = REQUIRED_MARKER_CLASS
  ) {}

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
    const existing = this.getErrorContainer(context);
    if (existing) {
      return existing;
    }

    const container = renderer.createElement('div');
    renderer.addClass(container, ERROR_CONTAINER_CLASS);
    const parent = context.hostElement.parentElement;
    if (!parent) {
      return null;
    }
    renderer.insertBefore(parent, container, context.hostElement.nextSibling);
    return container;
  }

  getErrorContainer(context: ValidationDisplayContext): HTMLElement | null {
    const parent = context.hostElement.parentElement;
    if (!parent) {
      return null;
    }
    return parent.querySelector(`.${ERROR_CONTAINER_CLASS}`) as HTMLElement | null;
  }

  renderErrors(
    context: ValidationDisplayContext,
    errors: ValidationResult[],
    renderer: Renderer2
  ): void {
    const container = this.ensureErrorContainer(context, renderer);
    if (!container) {
      return;
    }

    this.clearErrors(context, renderer);

    errors.forEach((validationError) => {
      const errorElement = renderer.createElement(this.errorElementTag);
      renderer.addClass(errorElement, this.errorClass);
      const text = renderer.createText(validationError.error.message);
      renderer.appendChild(errorElement, text);
      renderer.appendChild(container, errorElement);
    });

    renderer.addClass(context.hostElement, this.invalidClass);
  }

  clearErrors(context: ValidationDisplayContext, renderer: Renderer2): void {
    const container = this.getErrorContainer(context);
    if (container) {
      renderer.setProperty(container, 'innerHTML', '');
    }
    renderer.removeClass(context.hostElement, this.invalidClass);
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

    const existingMarkers = label.querySelectorAll(`.${this.requiredMarkerClass}`);
    existingMarkers.forEach((marker) => renderer.removeChild(label, marker));

    if (requiredResult.hasRequiredError) {
      const marker = renderer.createElement('span');
      renderer.addClass(marker, this.requiredMarkerClass);
      renderer.appendChild(marker, renderer.createText(this.requiredMarker));
      renderer.appendChild(label, marker);
    }
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

    const formGroup = host.closest('.form-group, .form-check');
    if (formGroup) {
      return formGroup.querySelector('label') as HTMLElement | null;
    }

    return null;
  }
}
