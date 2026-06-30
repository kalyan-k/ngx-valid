import { APP_INITIALIZER, NgModule } from '@angular/core';
import { ValidationProviderService } from 'core';
import { SampleFormValidationPolicy } from './components/sample-form/sample-form.validation.policy';
import {
  BillingAddressValidationPolicy,
  PersonalInfoValidationPolicy,
  ShippingAddressValidationPolicy
} from './components/complex-form/complex-form.validation.policy';

export function registerValidationPolicies(validationProvider: ValidationProviderService): () => void {
  return () => {
    validationProvider.register('SampleForm', new SampleFormValidationPolicy());
    validationProvider.register('PersonalInfo', new PersonalInfoValidationPolicy());
    validationProvider.register('ShippingAddress', new ShippingAddressValidationPolicy());
    validationProvider.register('BillingAddress', new BillingAddressValidationPolicy());
  };
}

export const validationProviders = [
  {
    provide: APP_INITIALIZER,
    useFactory: registerValidationPolicies,
    deps: [ValidationProviderService],
    multi: true
  }
];
