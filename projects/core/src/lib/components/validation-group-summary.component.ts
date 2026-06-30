import { Component, Input } from '@angular/core';
import { FormGroupStatus } from '../interfaces/validation-result.interface';

@Component({
  selector: 'ngx-validation-group-summary',
  standalone: false,
  template: `
    <div
      *ngIf="status?.isEvaluated && status?.errors?.length"
      class="ngx-valid-group-summary"
      role="alert"
    >
      <strong class="ngx-valid-group-summary-title">{{ title }}</strong>
      <ul class="ngx-valid-group-summary-list">
        <li *ngFor="let err of status?.errors">{{ err.error.message }}</li>
      </ul>
    </div>
  `
})
export class ValidationGroupSummaryComponent {
  @Input() model: any;
  @Input() groupName!: string;
  @Input() title = 'Errors in this section:';

  get status(): FormGroupStatus | undefined {
    return this.model?.[this.groupName];
  }
}
