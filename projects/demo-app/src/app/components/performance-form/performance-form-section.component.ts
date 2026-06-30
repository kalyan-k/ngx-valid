import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  NgZone,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges
} from '@angular/core';
import { ValidationProviderService } from 'core';
import { PerformanceFieldDef, PerformanceFormModel, PerformanceSectionMeta } from '../../models/performance-form.model';
import { PerformanceFormBuilderService } from './performance-form-builder.service';

const FIELD_BATCH_SIZE = 15;

@Component({
  selector: 'app-performance-form-section',
  templateUrl: './performance-form-section.component.html',
  styleUrls: ['./performance-form-section.component.sass'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PerformanceFormSectionComponent implements OnInit, OnChanges, OnDestroy {
  @Input() section!: PerformanceSectionMeta;
  @Input() model!: PerformanceFormModel;
  @Input() renderGeneration = 0;
  @Input() collapsed = false;
  @Input() actionsDisabled = false;
  @Input() policyGroupName = 'performance';

  @Output() collapsedChange = new EventEmitter<void>();

  @Output() sectionValidated = new EventEmitter<{
    title: string;
    errorCount: number;
    durationMs: number;
  }>();

  @Output() sectionProgress = new EventEmitter<{
    sectionId: string;
    visibleCount: number;
    total: number;
  }>();

  @Output() sectionRendered = new EventEmitter<string>();

  visibleFields: PerformanceFieldDef[] = [];
  private activeGeneration = 0;
  private cancelled = false;
  private batchHandle = 0;

  constructor(
    private changeDetectorRef: ChangeDetectorRef,
    private ngZone: NgZone,
    private builder: PerformanceFormBuilderService,
    private validationProvider: ValidationProviderService
  ) {}

  get sectionComplete(): boolean {
    return this.visibleFields.length >= this.section.fields.length;
  }

  get canUseSectionActions(): boolean {
    return this.sectionComplete && !this.actionsDisabled;
  }

  ngOnInit(): void {
    this.activeGeneration = this.renderGeneration;
    this.scheduleNextBatch();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['renderGeneration'] && !changes['renderGeneration'].firstChange) {
      this.cancel();
    }
  }

  ngOnDestroy(): void {
    this.cancel();
  }

  trackField(_index: number, field: PerformanceFieldDef): string {
    return field.propertyPath;
  }

  toggleCollapsed(): void {
    this.collapsedChange.emit();
  }

  onFillSection(): void {
    if (!this.canUseSectionActions) {
      return;
    }

    this.builder.fillSection(this.model, this.section);
    this.changeDetectorRef.markForCheck();
  }

  onValidateSection(): void {
    if (!this.canUseSectionActions) {
      return;
    }

    const start = performance.now();
    this.validationProvider.validateAll(this.model, this.section.policyName, {
      showAllErrors: true,
      evaluateGroups: true
    }).subscribe({
      next: () => {
        this.validationProvider.updatePolicyGroupStatus(this.model, this.policyGroupName);
        const duration = performance.now() - start;
        const errorCount = (this.model.validationResults || []).filter((result) =>
          result.propertyName.startsWith(`sections.${this.section.id}.`)
        ).length;
        this.sectionValidated.emit({
          title: this.section.title,
          errorCount,
          durationMs: duration
        });
        this.changeDetectorRef.markForCheck();
      }
    });
  }

  private cancel(): void {
    this.cancelled = true;
    if (this.batchHandle) {
      cancelAnimationFrame(this.batchHandle);
      this.batchHandle = 0;
    }
  }

  private scheduleNextBatch(): void {
    if (this.cancelled || this.activeGeneration !== this.renderGeneration) {
      return;
    }

    this.batchHandle = requestAnimationFrame(() => {
      this.batchHandle = 0;
      this.ngZone.run(() => this.appendBatch());
    });
  }

  private appendBatch(): void {
    if (this.cancelled || this.activeGeneration !== this.renderGeneration) {
      return;
    }

    const total = this.section.fields.length;
    const nextCount = Math.min(this.visibleFields.length + FIELD_BATCH_SIZE, total);

    if (nextCount === this.visibleFields.length) {
      this.sectionRendered.emit(this.section.id);
      return;
    }

    this.visibleFields = this.section.fields.slice(0, nextCount);
    this.sectionProgress.emit({
      sectionId: this.section.id,
      visibleCount: nextCount,
      total
    });
    this.changeDetectorRef.markForCheck();

    if (nextCount >= total) {
      this.sectionRendered.emit(this.section.id);
      return;
    }

    this.scheduleNextBatch();
  }
}
