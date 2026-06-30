import { Component, Input } from '@angular/core';
import { ValidationResult } from '../interfaces/validation-result.interface';
import { getValidationMeta } from '../utils/validation-meta.util';

@Component({
  selector: 'ngx-validation-summary',
  standalone: false,
  template: `
    <div *ngIf="visible" class="ngx-valid-summary" role="alert" [attr.aria-live]="'polite'">
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
  @Input() showWhen = true;

  get errors(): ValidationResult[] {
    return this.model?.validationResults ?? [];
  }

  get visible(): boolean {
    return this.showWhen
      && !!getValidationMeta(this.model).showAllErrors
      && this.errors.length > 0;
  }
}
