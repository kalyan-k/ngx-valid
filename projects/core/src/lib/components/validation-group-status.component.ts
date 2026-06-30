import { Component, Input } from '@angular/core';
import { FormGroupStatus } from '../interfaces/validation-result.interface';

@Component({
  selector: 'ngx-validation-group-status',
  template: `
    <span
      *ngIf="status?.isEvaluated; else pendingBadge"
      class="ngx-valid-group-badge badge"
      [class.bg-success]="status?.isValid"
      [class.bg-danger]="status?.isInValid"
      [attr.title]="evaluatedTooltip"
    >
      {{ status?.isValid ? 'Valid' : 'Invalid' }}
    </span>
    <ng-template #pendingBadge>
      <span
        class="ngx-valid-group-badge badge bg-secondary"
        [attr.title]="pendingTooltip"
      >
        {{ pendingLabel }}
      </span>
    </ng-template>
  `
})
export class ValidationGroupStatusComponent {
  @Input() model: any;
  @Input() groupName!: string;
  @Input() pendingLabel = 'Not validated';
  @Input() pendingTooltip = 'This section has not been validated yet. Submit the form to evaluate.';
  @Input() evaluatedTooltip = 'Validation status for this form group after the last submit.';

  get status(): FormGroupStatus | undefined {
    return this.model?.[this.groupName];
  }
}
