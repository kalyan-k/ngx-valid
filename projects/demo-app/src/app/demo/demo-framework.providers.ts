import { Provider } from '@angular/core';
import {
  BootstrapValidationDisplayStrategy,
  MaterialValidationDisplayStrategy,
  TailwindValidationDisplayStrategy,
  VALIDATION_DISPLAY_CONFIG,
  VALIDATION_DISPLAY_STRATEGY,
  ValidationDisplayConfig,
  ValidationDisplayStrategy
} from 'core';
import { DemoFramework } from './demo-framework.model';

export function getDemoFrameworkConfig(framework: DemoFramework): ValidationDisplayConfig {
  switch (framework) {
    case 'material':
      return { framework: 'material' };
    case 'tailwind':
      return {
        invalidClass: 'tw-input-invalid',
        errorClass: 'tw-field-error',
        errorContainerClass: 'tw-error-container',
        requiredMarkerClass: 'tw-required-marker',
        requiredMarker: ' *'
      };
    default:
      return {
        invalidClass: 'is-invalid',
        errorClass: 'ngx-valid-bootstrap-field-error',
        errorContainerClass: 'ngx-valid-bootstrap-error-container',
        requiredMarkerClass: 'ngx-valid-required-marker text-danger'
      };
  }
}

export function createDemoFrameworkStrategy(framework: DemoFramework): ValidationDisplayStrategy {
  switch (framework) {
    case 'material':
      return new MaterialValidationDisplayStrategy();
    case 'tailwind':
      return new TailwindValidationDisplayStrategy(getDemoFrameworkConfig('tailwind'));
    default:
      return new BootstrapValidationDisplayStrategy(
        'is-invalid',
        'ngx-valid-bootstrap-field-error',
        'div',
        ' *',
        'ngx-valid-required-marker text-danger'
      );
  }
}

export function provideDemoFrameworkDisplay(framework: DemoFramework): Provider[] {
  return [
    { provide: VALIDATION_DISPLAY_CONFIG, useValue: getDemoFrameworkConfig(framework) },
    { provide: VALIDATION_DISPLAY_STRATEGY, useFactory: () => createDemoFrameworkStrategy(framework) }
  ];
}
