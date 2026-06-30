import { ModuleWithProviders, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ValidatorDirective } from './directives/validator.directive';
import { ValidationDisplayConfig } from './interfaces/validation-display.interface';
import { VALIDATION_DISPLAY_CONFIG } from './tokens/validation-display.token';

@NgModule({
  declarations: [
    ValidatorDirective
  ],
  imports: [
    CommonModule
  ],
  exports: [
    ValidatorDirective
  ]
})
export class ValidationModule {
  static forRoot(config?: ValidationDisplayConfig): ModuleWithProviders<ValidationModule> {
    return {
      ngModule: ValidationModule,
      providers: config ? [{ provide: VALIDATION_DISPLAY_CONFIG, useValue: config }] : []
    };
  }
}
