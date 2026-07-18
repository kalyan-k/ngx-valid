import { Component, Input } from '@angular/core';
import { FormGroupStatus } from '@policy-validation/core';

@Component({
  selector: 'policy-validation-policy-group-summary',
  standalone: false,
  template: `
    <div
      *ngIf="status?.isEvaluated && status?.errors?.length"
      class="policy-validation-policy-group-summary"
      role="alert"
    >
      <strong class="policy-validation-summary-title">{{ title }}</strong>
      <ul class="policy-validation-summary-list">
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
