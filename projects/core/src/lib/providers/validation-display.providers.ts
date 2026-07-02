import { Provider, Type } from '@angular/core';
import {
  ValidationDisplayConfig,
  ValidationDisplaySetupOptions,
  ValidationDisplayStrategy
} from '../interfaces/validation-display.interface';
import { VALIDATION_DISPLAY_CONFIG } from '../tokens/validation-display.token';
import { VALIDATION_DISPLAY_STRATEGY } from '../tokens/validation-display-strategy.token';
import { createValidationDisplayStrategy } from '../display/validation-display.factory';
import { resolveValidationDisplayConfig } from '../display/validation-display.config-resolver';

/**
 * Standard DI setup for validation display. Use at app root, route, or component level.
 */
export function provideValidationDisplay(options: ValidationDisplaySetupOptions = {}): Provider[] {
  const resolved = resolveValidationDisplayConfig(options);

  return [
    { provide: VALIDATION_DISPLAY_CONFIG, useValue: resolved },
    {
      provide: VALIDATION_DISPLAY_STRATEGY,
      useFactory: createValidationDisplayStrategy,
      deps: [VALIDATION_DISPLAY_CONFIG]
    }
  ];
}

/** Built-in Bootstrap example preset (customizable via `classes` / `requiredIndicator`). */
export function provideBootstrapValidationDisplay(
  overrides: ValidationDisplaySetupOptions = {}
): Provider[] {
  return provideValidationDisplay({ preset: 'bootstrap', ...overrides });
}

/** Built-in Angular Material example preset. */
export function provideMaterialValidationDisplay(
  overrides: ValidationDisplaySetupOptions = {}
): Provider[] {
  return provideValidationDisplay({ preset: 'material', ...overrides });
}

/** Built-in Tailwind CSS example preset. */
export function provideTailwindValidationDisplay(
  overrides: ValidationDisplaySetupOptions = {}
): Provider[] {
  return provideValidationDisplay({ preset: 'tailwind', ...overrides });
}

/** Framework-agnostic preset with configurable CSS classes. */
export function provideGenericValidationDisplay(
  overrides: ValidationDisplaySetupOptions = {}
): Provider[] {
  return provideValidationDisplay({ preset: 'generic', ...overrides });
}

/** Auto-detect Material vs generic (legacy default behavior). */
export function provideAutoValidationDisplay(
  overrides: ValidationDisplaySetupOptions = {}
): Provider[] {
  return provideValidationDisplay({ preset: 'auto', ...overrides });
}

/**
 * Register a fully custom strategy class or instance. The strategy type must implement
 * every method on {@link ValidationDisplayStrategy} (extend {@link AbstractValidationDisplayStrategy}
 * for compile-time enforcement).
 */
export function provideCustomValidationDisplay(
  strategy: ValidationDisplayStrategy | Type<ValidationDisplayStrategy>,
  config: ValidationDisplayConfig = {}
): Provider[] {
  const resolved = resolveValidationDisplayConfig(config);
  const strategyProvider =
    typeof strategy === 'function'
      ? { provide: VALIDATION_DISPLAY_STRATEGY, useClass: strategy }
      : { provide: VALIDATION_DISPLAY_STRATEGY, useValue: strategy };

  return [
    { provide: VALIDATION_DISPLAY_CONFIG, useValue: resolved },
    strategyProvider
  ];
}
