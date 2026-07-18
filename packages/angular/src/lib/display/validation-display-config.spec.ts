import { Provider } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ValidationModule } from '../validation.module';
import {
  BOOTSTRAP_DISPLAY_CLASSES,
  GENERIC_DISPLAY_CLASSES,
  TAILWIND_DISPLAY_CLASSES
} from './validation-display.constants';
import {
  BOOTSTRAP_REQUIRED_INDICATOR,
  classesFromLegacyConfig,
  getResolvedClassMap,
  mergeDisplayClasses,
  resolvePreset,
  resolveRequiredIndicator,
  resolveValidationDisplayConfig
} from './validation-display.config-resolver';
import { createValidationDisplayStrategy } from './validation-display.factory';
import {
  defineValidationDisplayClasses,
  ValidationDisplayPresetId,
  ValidationDisplayStrategy
} from '../interfaces/validation-display.interface';
import {
  provideAutoValidationDisplay,
  provideBootstrapValidationDisplay,
  provideCustomValidationDisplay,
  provideGenericValidationDisplay,
  provideMaterialValidationDisplay,
  provideTailwindValidationDisplay,
  provideValidationDisplay
} from '../providers/validation-display.providers';
import { BootstrapValidationDisplayStrategy } from '../strategies/bootstrap-validation-display.strategy';
import { DefaultValidationDisplayStrategy } from '../strategies/default-validation-display.strategy';
import { GenericValidationDisplayStrategy } from '../strategies/generic-validation-display.strategy';
import { MaterialValidationDisplayStrategy } from '../strategies/material-validation-display.strategy';
import { TailwindValidationDisplayStrategy } from '../strategies/tailwind-validation-display.strategy';
import { VALIDATION_DISPLAY_CONFIG } from '../tokens/validation-display.token';
import { VALIDATION_DISPLAY_STRATEGY } from '../tokens/validation-display-strategy.token';

describe('validation display configuration', () => {
  it('defines immutable complete class maps', () => {
    const classes = defineValidationDisplayClasses({
      invalid: 'a', error: 'b', errorContainer: 'c', requiredMarker: 'd', baseInvalid: 'e', radioGroupInvalid: 'f'
    });
    expect(Object.isFrozen(classes)).toBeTrue();
    expect(classes.invalid).toBe('a');
  });

  it('merges non-empty overrides and returns a copy without overrides', () => {
    expect(mergeDisplayClasses(GENERIC_DISPLAY_CLASSES)).toEqual(GENERIC_DISPLAY_CLASSES);
    expect(mergeDisplayClasses(GENERIC_DISPLAY_CLASSES, {
      invalid: 'custom',
      error: '',
      errorContainer: null as any,
      requiredMarker: undefined
    })).toEqual({ ...GENERIC_DISPLAY_CLASSES, invalid: 'custom' });
  });

  it('maps legacy class fields and lets typed classes take precedence', () => {
    const resolved = classesFromLegacyConfig({
      invalidClass: 'legacy-invalid',
      errorClass: 'legacy-error',
      errorContainerClass: 'legacy-container',
      requiredMarkerClass: 'legacy-required',
      classes: { invalid: 'typed-invalid' }
    }, GENERIC_DISPLAY_CLASSES);

    expect(resolved).toEqual({
      ...GENERIC_DISPLAY_CLASSES,
      invalid: 'typed-invalid',
      error: 'legacy-error',
      errorContainer: 'legacy-container',
      requiredMarker: 'legacy-required'
    });
  });

  it('resolves required-indicator modern, legacy, fallback, and tooltip fields', () => {
    expect(resolveRequiredIndicator({
      requiredMarker: ' !',
      requiredMarkerClass: 'legacy',
      requiredIndicator: { mode: 'tooltip', tooltipText: 'Needed' }
    }, BOOTSTRAP_REQUIRED_INDICATOR)).toEqual({
      mode: 'tooltip',
      marker: ' !',
      markerClass: 'legacy',
      tooltipText: 'Needed'
    });

    expect(resolveRequiredIndicator({}, BOOTSTRAP_REQUIRED_INDICATOR)).toEqual({
      mode: 'inline-suffix',
      marker: ' *',
      markerClass: BOOTSTRAP_DISPLAY_CLASSES.requiredMarker,
      tooltipText: undefined
    });
  });

  it('resolves explicit and legacy presets', () => {
    expect(resolvePreset({ preset: 'generic', framework: 'material' })).toBe('generic');
    expect(resolvePreset({ framework: 'material' })).toBe('material');
    expect(resolvePreset({ invalidClass: 'is-invalid' })).toBe('bootstrap');
    expect(resolvePreset({ errorClass: 'my-bootstrap-error' })).toBe('bootstrap');
    expect(resolvePreset({ errorClass: 'tw-error' })).toBe('tailwind');
    expect(resolvePreset({ invalidClass: 'tw-invalid' })).toBe('tailwind');
    expect(resolvePreset({ framework: 'auto' })).toBe('auto');
    expect(resolvePreset({})).toBe('auto');
  });

  it('normalizes full configuration while preserving custom strategies', () => {
    const strategy = jasmine.createSpyObj<ValidationDisplayStrategy>('strategy', [
      'detectControlType', 'ensureErrorContainer', 'getErrorContainer', 'renderErrors', 'clearErrors', 'renderRequiredIndicator'
    ]);
    const custom = resolveValidationDisplayConfig({ preset: 'tailwind', strategy });
    expect(custom.strategy).toBe(strategy);
    expect(custom.preset).toBe('tailwind');
    expect(custom.classes).toBeUndefined();

    const resolved = resolveValidationDisplayConfig({ preset: 'bootstrap', errorElementTag: 'p' });
    expect(resolved.classes).toEqual(BOOTSTRAP_DISPLAY_CLASSES);
    expect(resolved.invalidClass).toBe('is-invalid');
    expect(resolved.errorElementTag).toBe('p');
    expect(resolveValidationDisplayConfig({ preset: 'tailwind' }).classes).toEqual(TAILWIND_DISPLAY_CLASSES);
    expect(getResolvedClassMap({ preset: 'generic' })).toEqual(GENERIC_DISPLAY_CLASSES);
  });

  it('creates the configured built-in or custom strategy', () => {
    const custom = jasmine.createSpyObj<ValidationDisplayStrategy>('custom', [
      'detectControlType', 'ensureErrorContainer', 'getErrorContainer', 'renderErrors', 'clearErrors', 'renderRequiredIndicator'
    ]);

    expect(createValidationDisplayStrategy({ strategy: custom })).toBe(custom);
    expect(createValidationDisplayStrategy({ preset: 'bootstrap' })).toBeInstanceOf(BootstrapValidationDisplayStrategy);
    expect(createValidationDisplayStrategy({ preset: 'material' })).toBeInstanceOf(MaterialValidationDisplayStrategy);
    expect(createValidationDisplayStrategy({ preset: 'tailwind' })).toBeInstanceOf(TailwindValidationDisplayStrategy);
    expect(createValidationDisplayStrategy({ preset: 'generic' })).toBeInstanceOf(GenericValidationDisplayStrategy);
    expect(createValidationDisplayStrategy(null)).toBeInstanceOf(DefaultValidationDisplayStrategy);
  });
});

describe('validation display providers and module', () => {
  function configure(providers: Provider[]): void {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({ providers });
  }

  it('provides resolved configuration and a factory-created strategy', () => {
    configure(provideValidationDisplay({ preset: 'bootstrap' }));
    expect(TestBed.inject(VALIDATION_DISPLAY_CONFIG).preset).toBe('bootstrap');
    expect(TestBed.inject(VALIDATION_DISPLAY_STRATEGY)).toBeInstanceOf(BootstrapValidationDisplayStrategy);
  });

  it('provides the default display configuration when no options are supplied', () => {
    configure(provideValidationDisplay());

    expect(TestBed.inject(VALIDATION_DISPLAY_CONFIG).preset).toBe('auto');
    expect(TestBed.inject(VALIDATION_DISPLAY_STRATEGY)).toBeInstanceOf(DefaultValidationDisplayStrategy);
  });

  it('provides every preset helper', () => {
    const cases: Array<[Provider[], any, ValidationDisplayPresetId]> = [
      [provideBootstrapValidationDisplay(), BootstrapValidationDisplayStrategy, 'bootstrap'],
      [provideMaterialValidationDisplay(), MaterialValidationDisplayStrategy, 'material'],
      [provideTailwindValidationDisplay(), TailwindValidationDisplayStrategy, 'tailwind'],
      [provideGenericValidationDisplay(), GenericValidationDisplayStrategy, 'generic'],
      [provideAutoValidationDisplay(), DefaultValidationDisplayStrategy, 'auto']
    ];

    cases.forEach(([providers, type, preset]) => {
      configure(providers);
      expect(TestBed.inject(VALIDATION_DISPLAY_CONFIG).preset).toBe(preset);
      expect(TestBed.inject(VALIDATION_DISPLAY_STRATEGY)).toBeInstanceOf(type);
    });
  });

  it('provides custom strategy instances and classes', () => {
    const instance = jasmine.createSpyObj<ValidationDisplayStrategy>('custom', [
      'detectControlType', 'ensureErrorContainer', 'getErrorContainer', 'renderErrors', 'clearErrors', 'renderRequiredIndicator'
    ]);
    configure(provideCustomValidationDisplay(instance, { preset: 'generic' }));
    expect(TestBed.inject(VALIDATION_DISPLAY_STRATEGY)).toBe(instance);

    configure(provideCustomValidationDisplay(GenericValidationDisplayStrategy));
    expect(TestBed.inject(VALIDATION_DISPLAY_STRATEGY)).toBeInstanceOf(GenericValidationDisplayStrategy);
  });

  it('configures ValidationModule.forRoot with display providers', () => {
    const result = ValidationModule.forRoot({ preset: 'tailwind' });
    expect(result.ngModule).toBe(ValidationModule);
    expect(result.providers?.length).toBe(2);
  });
});
