import { Component } from '@angular/core';
import { ValidationProviderService } from 'core';
import { ComplexFormModel } from '../../models/complex-form.model';

@Component({
  selector: 'app-complex-form',
  templateUrl: './complex-form.component.html',
  styleUrls: ['./complex-form.component.sass']
})
export class ComplexFormComponent {
  model = new ComplexFormModel();
  submitMessage = '';

  constructor(private validationProvider: ValidationProviderService) {}

  onSubmit(): void {
    const policies = [
      this.validationProvider.getPolicy('PersonalInfo'),
      this.validationProvider.getPolicy('ShippingAddress'),
      this.validationProvider.getPolicy('BillingAddress')
    ];

    let completed = 0;
    policies.forEach((policy) => {
      policy.validate(this.model).subscribe(() => {
        policy.checkModelRequired(this.model).subscribe(() => {
          completed++;
          if (completed === policies.length) {
            this.validationProvider.getPolicy('PersonalInfo').checkFormValid(
              this.model,
              this.validationProvider.formGroup
            );
            const hasErrors = !!this.model.validationResults?.length;
            this.submitMessage = hasErrors
              ? 'Please fix validation errors in all sections before submitting.'
              : 'All forms submitted successfully!';
          }
        });
      });
    });
  }
}
