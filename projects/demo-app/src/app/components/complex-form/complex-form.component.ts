import { Component } from '@angular/core';
import { ValidationProviderService } from 'core';
import { from } from 'rxjs';
import { concatMap, last } from 'rxjs/operators';
import { AddressInfo, BillingInfo, ComplexFormModel, PersonalInfo } from '../../models/complex-form.model';

@Component({
  selector: 'app-complex-form',
  templateUrl: './complex-form.component.html',
  styleUrls: ['./complex-form.component.sass']
})
export class ComplexFormComponent {
  model = new ComplexFormModel();
  submitMessage = '';
  showSummary = false;

  readonly policies = ['PersonalInfo', 'ShippingAddress', 'BillingAddress'];

  constructor(private validationProvider: ValidationProviderService) {}

  onSubmit(): void {
    from(this.policies).pipe(
      concatMap((name) => this.validationProvider.validateAll(this.model, name)),
      last()
    ).subscribe(() => {
      const hasErrors = !!this.model.validationResults?.length;
      this.showSummary = hasErrors;
      this.submitMessage = hasErrors
        ? 'Please fix validation errors in all sections before submitting.'
        : 'All forms submitted successfully!';
    });
  }

  onClear(): void {
    Object.assign(this.model.personal, new PersonalInfo());
    Object.assign(this.model.shipping, new AddressInfo());
    Object.assign(this.model.billing, new BillingInfo());
    delete this.model.personalInfo;
    delete this.model.shippingInfo;
    delete this.model.billingInfo;

    this.validationProvider.resetFormGroups();
    this.validationProvider.clearValidationState(this.model, this.policies);
    this.showSummary = false;
    this.submitMessage = '';
  }
}
