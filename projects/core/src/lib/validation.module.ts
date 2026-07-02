import { ModuleWithProviders, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ValidationGroupStatusComponent } from './components/validation-group-status.component';
import { ValidationGroupSummaryComponent } from './components/validation-group-summary.component';
import { ValidationPolicyGroupStatusComponent } from './components/validation-policy-group-status.component';
import { ValidationPolicyGroupSummaryComponent } from './components/validation-policy-group-summary.component';
import { ValidationSummaryComponent } from './components/validation-summary.component';
import { ValidatorDirective } from './directives/validator.directive';
import { ValidationDisplaySetupOptions } from './interfaces/validation-display.interface';
import { provideValidationDisplay } from './providers/validation-display.providers';

@NgModule({
  declarations: [
    ValidatorDirective,
    ValidationSummaryComponent,
    ValidationGroupStatusComponent,
    ValidationGroupSummaryComponent,
    ValidationPolicyGroupStatusComponent,
    ValidationPolicyGroupSummaryComponent
  ],
  imports: [
    CommonModule
  ],
  exports: [
    ValidatorDirective,
    ValidationSummaryComponent,
    ValidationGroupStatusComponent,
    ValidationGroupSummaryComponent,
    ValidationPolicyGroupStatusComponent,
    ValidationPolicyGroupSummaryComponent
  ]
})
export class ValidationModule {
  static forRoot(config?: ValidationDisplaySetupOptions): ModuleWithProviders<ValidationModule> {
    return {
      ngModule: ValidationModule,
      providers: provideValidationDisplay(config)
    };
  }
}
