import { APP_INITIALIZER } from '@angular/core';
import { ValidationProviderService } from '@validation-rules/angular';
import { EnterpriseStateProfilePolicy, ReactiveAccountPolicy, StateProfilePolicy } from './demo-validation.policy';

export function registerDemoPolicies(validation: ValidationProviderService): () => void {
  return () => {
    validation.register('StateProfile', new StateProfilePolicy());
    validation.register('StateProfileEnterprise', new EnterpriseStateProfilePolicy());
    validation.register('ReactiveAccount', new ReactiveAccountPolicy());
  };
}

export const demoValidationProviders = [{
  provide: APP_INITIALIZER,
  useFactory: registerDemoPolicies,
  deps: [ValidationProviderService],
  multi: true
}];
