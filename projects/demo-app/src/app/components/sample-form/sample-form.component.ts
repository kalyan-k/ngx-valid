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

  constructor(private validationProvider: ValidationProviderService) {}

  onSubmit(): void {
    this.validationProvider.validateAll(this.model, 'SampleForm').subscribe(() => {
      const hasErrors = !!this.model.validationResults?.length;
      this.showSummary = hasErrors;
      this.submitMessage = hasErrors
        ? 'Please fix validation errors before submitting.'
        : 'Form submitted successfully!';
    });
  }
}
