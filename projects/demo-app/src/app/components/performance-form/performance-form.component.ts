import { ChangeDetectorRef, Component, NgZone, OnDestroy } from '@angular/core';
import { take } from 'rxjs/operators';
import { ValidationProviderService } from 'core';
import {
  PerformanceFieldDef,
  PerformanceFormModel,
  PerformanceMetrics,
  PerformanceSectionMeta
} from '../../models/performance-form.model';
import { PerformanceFormBuilderService } from './performance-form-builder.service';

@Component({
  selector: 'app-performance-form',
  templateUrl: './performance-form.component.html',
  styleUrls: ['./performance-form.component.sass'],
  providers: [PerformanceFormBuilderService]
})
export class PerformanceFormComponent implements OnDestroy {
  model = new PerformanceFormModel();
  sectionMetas: PerformanceSectionMeta[] = [];
  metrics: PerformanceMetrics | null = null;
  submitMessage = '';
  isGenerated = false;
  isGenerating = false;

  readonly configPolicyName = 'PerformanceConfig';
  readonly configGroupName = 'perfConfig';
  readonly policyGroupName = 'performance';

  private sectionPolicyNames: string[] = [];

  constructor(
    private validationProvider: ValidationProviderService,
    private builder: PerformanceFormBuilderService,
    private ngZone: NgZone,
    private changeDetectorRef: ChangeDetectorRef
  ) {}

  ngOnDestroy(): void {
    this.builder.teardown();
  }

  get totalControlEstimate(): number {
    const sections = Number(this.model.config.sectionCount) || 0;
    const controls = Number(this.model.config.controlsPerSection) || 0;
    return sections * controls;
  }

  get isLargeForm(): boolean {
    return this.totalControlEstimate > 500;
  }

  onGenerate(): void {
    this.submitMessage = '';
    this.isGenerating = true;

    this.validationProvider.validateAll(this.model, this.configPolicyName, {
      showAllErrors: true,
      evaluateGroups: true
    }).subscribe(() => {
      const configErrors = (this.model.validationResults || []).filter((result) =>
        result.propertyName.startsWith('config.')
      );

      if (configErrors.length > 0) {
        this.isGenerating = false;
        this.submitMessage = 'Fix configuration errors before generating the performance form.';
        return;
      }

      const renderStart = performance.now();
      const buildResult = this.builder.build(this.model);
      this.sectionMetas = buildResult.sectionMetas;
      this.sectionPolicyNames = buildResult.policyNames;
      this.metrics = buildResult.metrics;
      this.isGenerated = true;

      this.validationProvider.clearValidationState(this.model, this.sectionPolicyNames);

      this.changeDetectorRef.detectChanges();

      this.ngZone.onStable.pipe(take(1)).subscribe(() => {
        if (this.metrics) {
          this.metrics = {
            ...this.metrics,
            renderMs: performance.now() - renderStart
          };
        }
        this.isGenerating = false;
        this.changeDetectorRef.markForCheck();
      });
    });
  }

  onValidateAll(): void {
    if (!this.isGenerated || !this.sectionPolicyNames.length) {
      return;
    }

    const start = performance.now();
    this.validationProvider.evaluatePolicies(
      this.model,
      this.sectionPolicyNames,
      this.policyGroupName
    ).subscribe(() => {
      if (this.metrics) {
        this.metrics = {
          ...this.metrics,
          lastValidateAllMs: performance.now() - start
        };
      }
      this.submitMessage = this.model.validationResults?.length
        ? `Validate all completed with ${this.model.validationResults.length} error(s).`
        : 'Validate all completed — no errors.';
    });
  }

  onSubmit(): void {
    if (!this.isGenerated || !this.sectionPolicyNames.length) {
      this.submitMessage = 'Generate the form first using the configuration above.';
      return;
    }

    const start = performance.now();
    this.validationProvider.evaluatePolicies(
      this.model,
      this.sectionPolicyNames,
      this.policyGroupName
    ).subscribe(() => {
      const duration = performance.now() - start;
      if (this.metrics) {
        this.metrics = {
          ...this.metrics,
          lastSubmitMs: duration
        };
      }

      const hasErrors = !!this.model.validationResults?.length;
      this.submitMessage = hasErrors
        ? `Submit validation finished in ${duration.toFixed(1)} ms with ${this.model.validationResults?.length} error(s).`
        : `All ${this.metrics?.totalControls ?? 0} controls passed validation in ${duration.toFixed(1)} ms.`;
    });
  }

  onClear(): void {
    this.builder.teardown();
    this.sectionMetas = [];
    this.sectionPolicyNames = [];
    this.metrics = null;
    this.isGenerated = false;
    this.submitMessage = '';

    this.model = new PerformanceFormModel();
    this.validationProvider.resetFormGroups();
    this.validationProvider.clearValidationState(this.model, [this.configPolicyName]);
  }

  trackSection(_index: number, section: PerformanceSectionMeta): string {
    return section.id;
  }

  trackField(_index: number, field: PerformanceFieldDef): string {
    return field.propertyPath;
  }
}
