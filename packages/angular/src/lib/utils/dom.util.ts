import { Renderer2 } from '@angular/core';

export function addClasses(renderer: Renderer2, element: Element, classNames?: string | null): void {
  if (!classNames) {
    return;
  }

  classNames.split(/\s+/).filter(Boolean).forEach((className) => {
    renderer.addClass(element, className);
  });
}

export function removeClasses(renderer: Renderer2, element: Element, classNames?: string | null): void {
  if (!classNames) {
    return;
  }

  classNames.split(/\s+/).filter(Boolean).forEach((className) => {
    renderer.removeClass(element, className);
  });
}

/**
 * Finds elements with an exact attribute value without interpolating dynamic
 * content into CSS selector strings (avoids selector injection / escaping issues).
 */
export function findElementByAttribute(
  root: ParentNode,
  attributeName: string,
  attributeValue: string
): HTMLElement | null {
  const matches = findAllElementsByAttribute(root, attributeName, attributeValue);
  return matches[0] ?? null;
}

export function findAllElementsByAttribute(
  root: ParentNode,
  attributeName: string,
  attributeValue: string
): HTMLElement[] {
  const candidates: Element[] = root instanceof Element
    ? [root, ...Array.from(root.querySelectorAll(`[${attributeName}]`))]
    : Array.from(root.querySelectorAll(`[${attributeName}]`));

  return candidates.filter(
    (node) => node.getAttribute(attributeName) === attributeValue
  ) as HTMLElement[];
}
