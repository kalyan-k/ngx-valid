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
  showSummary = false;

  private readonly policyName = 'SampleForm';

  constructor(private validationProvider: ValidationProviderService) {}

  onSubmit(): void {
    this.validationProvider.validateAll(this.model, this.policyName).subscribe(() => {
      const hasErrors = !!this.model.validationResults?.length;
      this.showSummary = hasErrors;
      this.submitMessage = hasErrors
        ? 'Please fix validation errors before submitting.'
        : 'Form submitted successfully!';
    });
  }

  onClear(): void {
    Object.assign(this.model, new SampleForm());
    this.validationProvider.resetFormGroups();
    this.validationProvider.clearValidationState(this.model, [this.policyName]);
    this.showSummary = false;
    this.submitMessage = '';
  }
}
