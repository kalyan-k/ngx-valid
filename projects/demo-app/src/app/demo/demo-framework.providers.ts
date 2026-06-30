import { Provider } from '@angular/core';
import {
  BootstrapValidationDisplayStrategy,
  GenericValidationDisplayStrategy,
  MaterialValidationDisplayStrategy,
  VALIDATION_DISPLAY_CONFIG,
  VALIDATION_DISPLAY_STRATEGY
} from 'core';
import { DemoFramework } from './demo-framework.model';

export function provideDemoFrameworkDisplay(framework: DemoFramework): Provider[] {
  switch (framework) {
    case 'material':
      return [
        { provide: VALIDATION_DISPLAY_CONFIG, useValue: { framework: 'material' as const } },
        { provide: VALIDATION_DISPLAY_STRATEGY, useClass: MaterialValidationDisplayStrategy }
      ];
    case 'tailwind':
      return [
        {
          provide: VALIDATION_DISPLAY_CONFIG,
          useValue: {
            invalidClass: 'tw-input-invalid',
            errorClass: 'tw-field-error',
            errorContainerClass: 'tw-error-container',
            requiredMarkerClass: 'tw-required-marker',
            requiredMarker: ' *'
          }
        },
        {
          provide: VALIDATION_DISPLAY_STRATEGY,
          useFactory: (config: object) => new GenericValidationDisplayStrategy(config),
          deps: [VALIDATION_DISPLAY_CONFIG]
        }
      ];
    default:
      return [
        {
          provide: VALIDATION_DISPLAY_CONFIG,
          useValue: {
            invalidClass: 'is-invalid',
            errorClass: 'invalid-feedback d-block',
            errorContainerClass: 'ngx-valid-error-container',
            requiredMarkerClass: 'ngx-valid-required-marker text-danger'
          }
        },
        {
          provide: VALIDATION_DISPLAY_STRATEGY,
          useFactory: () => new BootstrapValidationDisplayStrategy(
            'is-invalid',
            'invalid-feedback d-block ngx-valid-error',
            'div',
            ' *',
            'ngx-valid-required-marker text-danger'
          )
        }
      ];
  }
}
