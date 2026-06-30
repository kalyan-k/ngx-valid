import { Component } from '@angular/core';
import { ValidationProviderService } from 'core';
import { from } from 'rxjs';
import { concatMap, last } from 'rxjs/operators';
import { ComplexFormModel } from '../../models/complex-form.model';

@Component({
  selector: 'app-complex-form',
  templateUrl: './complex-form.component.html',
  styleUrls: ['./complex-form.component.sass']
})
export class ComplexFormComponent {
  model = new ComplexFormModel();
  submitMessage = '';
  showSummary = false;

  private readonly policies = ['PersonalInfo', 'ShippingAddress', 'BillingAddress'];

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
}
