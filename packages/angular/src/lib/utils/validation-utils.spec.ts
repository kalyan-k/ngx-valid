import { Renderer2, RendererFactory2 } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { addClasses, findAllElementsByAttribute, findElementByAttribute, removeClasses } from './dom.util';

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
