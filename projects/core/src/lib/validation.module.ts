import { ModuleWithProviders, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ValidationSummaryComponent } from './components/validation-summary.component';
import { ValidatorDirective } from './directives/validator.directive';
import { ValidationDisplayConfig, ValidationDisplayStrategy } from './interfaces/validation-display.interface';
import { DefaultValidationDisplayStrategy } from './strategies/default-validation-display.strategy';
import { VALIDATION_DISPLAY_CONFIG } from './tokens/validation-display.token';
import { VALIDATION_DISPLAY_STRATEGY } from './tokens/validation-display-strategy.token';

export function createValidationDisplayStrategy(config: ValidationDisplayConfig | null): ValidationDisplayStrategy {
  if (config?.strategy) {
    return config.strategy;
  }
  return new DefaultValidationDisplayStrategy(config ?? { framework: 'auto' });
}

@NgModule({
  declarations: [
    ValidatorDirective,
    ValidationSummaryComponent
  ],
  imports: [
    CommonModule
  ],
  exports: [
    ValidatorDirective,
    ValidationSummaryComponent
  ]
})
export class ValidationModule {
  static forRoot(config?: ValidationDisplayConfig): ModuleWithProviders<ValidationModule> {
    return {
      ngModule: ValidationModule,
      providers: [
        { provide: VALIDATION_DISPLAY_CONFIG, useValue: config ?? {} },
        {
          provide: VALIDATION_DISPLAY_STRATEGY,
          useFactory: createValidationDisplayStrategy,
          deps: [VALIDATION_DISPLAY_CONFIG]
        }
      ]
    };
  }
}
