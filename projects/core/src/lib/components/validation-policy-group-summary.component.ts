import { Component, Input } from '@angular/core';
import { FormGroupStatus } from '../interfaces/validation-result.interface';

@Component({
  selector: 'ngx-validation-policy-group-summary',
  template: `
    <div
      *ngIf="status?.isEvaluated && status?.errors?.length"
      class="ngx-valid-policy-group-summary"
      role="alert"
    >
      <strong class="ngx-valid-summary-title">{{ title }}</strong>
      <ul class="ngx-valid-summary-list">
        <li *ngFor="let err of status?.errors">{{ err.error.message }}</li>
      </ul>
    </div>
  `
})
export class ValidationPolicyGroupSummaryComponent {
  @Input() model: any;
  @Input() policyGroupName!: string;
  @Input() title = 'Please correct the following errors across all sections:';

  get status(): FormGroupStatus | undefined {
    return this.model?.[this.policyGroupName];
  }
}
