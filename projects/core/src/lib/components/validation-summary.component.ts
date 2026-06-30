import { Component, Input } from '@angular/core';
import { ValidationResult } from '../interfaces/validation-result.interface';

@Component({
  selector: 'ngx-validation-summary',
  template: `
    <div *ngIf="errors.length" class="ngx-valid-summary" role="alert" [attr.aria-live]="'polite'">
      <strong class="ngx-valid-summary-title">{{ title }}</strong>
      <ul class="ngx-valid-summary-list">
        <li *ngFor="let err of errors">{{ err.error.message }}</li>
      </ul>
    </div>
  `
})
export class ValidationSummaryComponent {
  @Input() model: any;
  @Input() title = 'Please correct the following errors:';

  get errors(): ValidationResult[] {
    return this.model?.validationResults ?? [];
  }
}
