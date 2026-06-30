import { Component, Input } from '@angular/core';
import { FormGroupStatus } from '../interfaces/validation-result.interface';

@Component({
  selector: 'ngx-validation-policy-group-status',
  template: `
    <div class="ngx-valid-policy-group-status d-flex align-items-center gap-2">
      <span class="fw-semibold">{{ label }}</span>
      <span
        *ngIf="status?.isEvaluated; else pendingBadge"
        class="badge"
        [class.bg-success]="status?.isValid"
        [class.bg-danger]="status?.isInValid"
        [attr.title]="evaluatedTooltip"
      >
        {{ status?.isValid ? 'All sections valid' : 'Has errors' }}
      </span>
      <ng-template #pendingBadge>
        <span class="badge bg-secondary" [attr.title]="pendingTooltip">{{ pendingLabel }}</span>
      </ng-template>
    </div>
  `
})
export class ValidationPolicyGroupStatusComponent {
  @Input() model: any;
  @Input() policyGroupName!: string;
  @Input() label = 'Page validation';
  @Input() pendingLabel = 'Not validated';
  @Input() pendingTooltip = 'Submit the form to validate all policy groups on this page.';
  @Input() evaluatedTooltip = 'Combined validation status across all registered policies in this group.';

  get status(): FormGroupStatus | undefined {
    return this.model?.[this.policyGroupName];
  }
}
