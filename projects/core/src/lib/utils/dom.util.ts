import { Renderer2 } from '@angular/core';

export function addClasses(renderer: Renderer2, element: Element, classNames: string): void {
  classNames.split(/\s+/).filter(Boolean).forEach((className) => {
    renderer.addClass(element, className);
  });
}

export function removeClasses(renderer: Renderer2, element: Element, classNames: string): void {
  classNames.split(/\s+/).filter(Boolean).forEach((className) => {
    renderer.removeClass(element, className);
  });
}

export function isValidationFailure(result: unknown): result is { message: string } {
  return !!result && typeof result === 'object' && 'message' in (result as { message?: string })
    && typeof (result as { message?: string }).message === 'string';
}
