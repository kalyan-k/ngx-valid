import { Component } from '@angular/core';
import { ValidationProviderService } from 'core';
import { SampleForm } from '../../models/sample-form.model';

@Component({
  selector: 'app-sample-form',
  templateUrl: './sample-form.component.html',
  styleUrls: ['./sample-form.component.sass']
})
export class SampleFormComponent {
  model = new SampleForm();
  submitMessage = '';

  constructor(private validationProvider: ValidationProviderService) {}

  onSubmit(): void {
    const policy = this.validationProvider.getPolicy('SampleForm');
    policy.validate(this.model).subscribe(() => {
      policy.checkModelRequired(this.model).subscribe(() => {
        policy.checkFormValid(this.model, this.validationProvider.formGroup);
        const hasErrors = !!this.model.validationResults?.length;
        this.submitMessage = hasErrors
          ? 'Please fix validation errors before submitting.'
          : 'Form submitted successfully!';
      });
    });
  }
}
