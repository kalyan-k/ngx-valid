import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  OnChanges,
  OnDestroy,
  SimpleChanges
} from '@angular/core';
import { Subscription } from 'rxjs';
import { FormGroupStatus } from '@policy-validation/core';
import { ValidationProviderService } from '../services/validation-provider.service';

@Component({
  selector: 'policy-validation-group-status',
  standalone: false,
  template: `
    <span
      *ngIf="status?.isEvaluated; else pendingBadge"
      class="policy-validation-group-badge badge"
      [class.bg-success]="status?.isValid"
      [class.bg-danger]="status?.isInValid"
      [attr.title]="evaluatedTooltip"
    >
      {{ status?.isValid ? 'Valid' : 'Invalid' }}
    </span>
    <ng-template #pendingBadge>
      <span
        class="policy-validation-group-badge badge bg-secondary"
        [attr.title]="pendingTooltip"
      >
        {{ pendingLabel }}
      </span>
    </ng-template>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ValidationGroupStatusComponent implements OnChanges, OnDestroy {
  @Input() model: any;
  @Input() groupName!: string;
  @Input() pendingLabel = 'Not validated';
  @Input() pendingTooltip = 'This section has not been validated yet. Submit the form to evaluate.';
  @Input() evaluatedTooltip = 'Validation status for this form group after the last submit.';

  private refreshSubscription?: Subscription;

  constructor(
    private changeDetectorRef: ChangeDetectorRef,
    private validationProvider: ValidationProviderService
  ) {}

  get status(): FormGroupStatus | undefined {
    return this.model?.[this.groupName];
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['model']) {
      this.bindValidationRefresh();
    }
  }

  ngOnDestroy(): void {
    this.refreshSubscription?.unsubscribe();
  }

  private bindValidationRefresh(): void {
    this.refreshSubscription?.unsubscribe();

    if (!this.model) {
      return;
    }

    this.refreshSubscription = this.validationProvider.onValidationRefresh(this.model)
      .subscribe(() => this.changeDetectorRef.markForCheck());
  }
}
