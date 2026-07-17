import { Renderer2, RendererFactory2 } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { addClasses, findAllElementsByAttribute, findElementByAttribute, isValidationFailure, removeClasses } from './dom.util';
import {
  clearTouchedFieldsForPrefix,
  getValidationMeta,
  markFieldTouched,
  POLICY_VALIDATION_META,
  resetValidationMeta,
  shouldShowFieldErrors
} from './validation-meta.util';

describe('validation DOM utilities', () => {
  let renderer: Renderer2;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    renderer = TestBed.inject(RendererFactory2).createRenderer(null, null);
  });

  it('adds and removes whitespace-delimited class lists', () => {
    const element = document.createElement('div');
    addClasses(renderer, element, 'one  two');
    addClasses(renderer, element, null);
    expect(Array.from(element.classList)).toEqual(['one', 'two']);

    removeClasses(renderer, element, 'one  two');
    removeClasses(renderer, element, undefined);
    expect(element.className).toBe('');
  });

  it('recognizes only message-shaped validation failures', () => {
    expect(isValidationFailure({ message: 'bad' })).toBeTrue();
    expect(isValidationFailure({ message: 123 })).toBeFalse();
    expect(isValidationFailure(true)).toBeFalse();
    expect(isValidationFailure(null)).toBeFalse();
  });

  it('finds exact attribute values without selector interpolation', () => {
    const root = document.createElement('div');
    root.setAttribute('data-key', 'root');
    root.innerHTML = '<span data-key="wanted"></span><span data-key="other"></span>';

    expect(findElementByAttribute(root, 'data-key', 'wanted')).toBe(root.children[0] as HTMLElement);
    expect(findElementByAttribute(root, 'data-key', 'missing')).toBeNull();
    expect(findAllElementsByAttribute(root, 'data-key', 'root')).toEqual([root]);

    document.body.appendChild(root);
    expect(findAllElementsByAttribute(document, 'data-key', 'wanted')).toEqual([root.children[0] as HTMLElement]);
    root.remove();
  });
});

describe('validation metadata utilities', () => {
  it('creates metadata lazily and tracks field visibility', () => {
    const model: any = {};
    const first = getValidationMeta(model);

    expect(first).toEqual({ touchedFields: {}, showAllErrors: false });
    expect(getValidationMeta(model)).toBe(first);
    expect(shouldShowFieldErrors(model, 'name')).toBeFalse();

    markFieldTouched(model, 'name');
    expect(shouldShowFieldErrors(model, 'name')).toBeTrue();
    expect(shouldShowFieldErrors(model, 'other')).toBeFalse();

    first.showAllErrors = true;
    expect(shouldShowFieldErrors(model, 'other')).toBeTrue();
  });

  it('clears touched paths by prefix and safely handles missing metadata', () => {
    const model: any = {};
    clearTouchedFieldsForPrefix(model, 'sections.one.');

    markFieldTouched(model, 'sections.one.a');
    markFieldTouched(model, 'sections.two.a');
    clearTouchedFieldsForPrefix(model, 'sections.one.');

    expect(getValidationMeta(model).touchedFields).toEqual({ 'sections.two.a': true });
  });

  it('resets metadata completely', () => {
    const model: any = {};
    markFieldTouched(model, 'name');

    resetValidationMeta(model);

    expect(model[POLICY_VALIDATION_META]).toBeUndefined();
  });
});
