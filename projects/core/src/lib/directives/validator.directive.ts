import {
  AfterViewInit,
  ChangeDetectorRef,
  Directive,
  DoCheck,
  ElementRef,
  Inject,
  Input,
  IterableChangeRecord,
  IterableDiffers,
  NgZone,
  OnDestroy,
  OnInit,
  Optional,
  Renderer2
} from '@angular/core';
import { Subscription } from 'rxjs';
import { take } from 'rxjs/operators';
import * as _ from 'underscore';
import { ValidationDisplayConfig, ValidationDisplayContext, ValidationDisplayStrategy } from '../interfaces/validation-display.interface';
import { RequiredResult } from '../interfaces/validation-result.interface';
import { ValidationProviderService } from '../services/validation-provider.service';
import { DefaultValidationDisplayStrategy } from '../strategies/default-validation-display.strategy';
import { VALIDATION_DISPLAY_CONFIG } from '../tokens/validation-display.token';
import { VALIDATION_DISPLAY_STRATEGY } from '../tokens/validation-display-strategy.token';
import { markFieldTouched, shouldShowFieldErrors } from '../utils/validation-meta.util';

@Directive({
  selector: '[ngxValidator], [libValidatorDirective]'
})
export class ValidatorDirective implements OnInit, AfterViewInit, DoCheck, OnDestroy {
  @Input()
  validateModel = '';

  @Input()
  actualModel: any;

  @Input()
  withPolicy!: string;

  @Input()
  validateOnEvent!: string;

  @Input()
  groupName!: string;

  policy: any = {};
  modelInfo!: { entityPath: string | undefined; propertyPath: string };
  differRequiredResult: any;
  differValidationResult: any;
  controlType!: ReturnType<ValidationDisplayStrategy['detectControlType']>;
  private displayContext!: ValidationDisplayContext;
  private unlistenFns: Array<() => void> = [];
  private refreshSubscription?: Subscription;
  private readonly displayStrategy: ValidationDisplayStrategy;

  constructor(
    private validationService: ValidationProviderService,
    private differs: IterableDiffers,
    private elementRef: ElementRef,
    private renderer2: Renderer2,
    private changeDetectorRef: ChangeDetectorRef,
    private ngZone: NgZone,
    @Optional() @Inject(VALIDATION_DISPLAY_STRATEGY) displayStrategy: ValidationDisplayStrategy | null,
    @Optional() @Inject(VALIDATION_DISPLAY_CONFIG) displayConfig: ValidationDisplayConfig | null
  ) {
    this.displayStrategy = displayStrategy
      ?? new DefaultValidationDisplayStrategy(displayConfig ?? { framework: 'auto' });
  }

  ngOnInit(): void {
    this.modelInfo = this.parseDottedPath(this.validateModel);
    this.policy = this.validationService.getPolicy(this.withPolicy);
    this.controlType = this.displayStrategy.detectControlType(this.elementRef.nativeElement);
    this.displayContext = {
      hostElement: this.elementRef.nativeElement,
      controlType: this.controlType,
      propertyPath: this.modelInfo.propertyPath
    };

    if (this.groupName) {
      this.registerFormGroup();
    }

    this.refreshSubscription = this.validationService.onValidationRefresh(this.actualModel)
      .subscribe(() => {
        this.registerFormGroup();
        this.refreshUi();
      });
  }

  private registerFormGroup(): void {
    if (!this.groupName) {
      return;
    }

    if (!this.validationService.formGroup.hasOwnProperty(this.groupName)) {
      this.validationService.formGroup[this.groupName] = [];
    }

    if (!this.validationService.formGroup[this.groupName].includes(this.modelInfo.propertyPath)) {
      this.validationService.formGroup[this.groupName].push(this.modelInfo.propertyPath);
    }
  }

  ngDoCheck(): void {
    this.runcheck();
    this.policy.updateConditionalRequiredFields(this.actualModel, this.modelInfo.propertyPath);
    this.syncRequiredUi();
  }

  runcheck(): void {
    if (!this.differValidationResult) {
      this.differValidationResult = this.differs.find(this.actualModel.validationResults || []).create();
      return;
    }

    const validationResultsChanged = this.differValidationResult.diff(this.actualModel.validationResults);
    if (validationResultsChanged) {
      validationResultsChanged.forEachOperation((changeRecord: IterableChangeRecord<any>) => {
        if (changeRecord.item?.propertyName === this.modelInfo.propertyPath) {
          this.syncValidationUi();
        }
      });
    }

    if (!this.differRequiredResult) {
      if (this.actualModel.requiredResults) {
        this.differRequiredResult = this.differs.find(this.actualModel.requiredResults).create();
        this.syncRequiredUi();
      }
      return;
    }

    const requiredResultsChanged = this.differRequiredResult.diff(this.actualModel.requiredResults);
    if (requiredResultsChanged) {
      requiredResultsChanged.forEachOperation((changeRecord: IterableChangeRecord<any>) => {
        if (changeRecord.item?.propertyName === this.modelInfo.propertyPath) {
          this.syncRequiredUi();
        }
      });
    }
  }

  ngAfterViewInit(): void {
    this.initializeRequiredMarkers();
    this.bindValidationEvents();
  }

  ngOnDestroy(): void {
    this.unlistenFns.forEach((fn) => fn());
    this.refreshSubscription?.unsubscribe();
  }

  parseDottedPath(path: string): { entityPath: string | undefined; propertyPath: string } {
    const paths = path.split('.');

    if (paths.length === 1) {
      return {
        entityPath: undefined,
        propertyPath: paths[0]
      };
    }

    return {
      entityPath: paths.shift(),
      propertyPath: paths.join('.')
    };
  }

  private bindValidationEvents(): void {
    const handler = () => {
      const delay = this.isChoiceControl() ? 200 : 0;
      this.validateModelWithPolicy(delay);
    };

    if (this.controlType === 'radio-group') {
      const radios = this.elementRef.nativeElement.querySelectorAll('input[type="radio"]');
      radios.forEach((radio: HTMLElement) => {
        this.addListener(radio, 'change', handler);
        this.addListener(radio, 'blur', handler);
      });
      return;
    }

    const events = new Set<string>();
    if (this.validateOnEvent) {
      events.add(this.validateOnEvent);
    } else if (this.isChoiceControl()) {
      events.add('change');
    } else {
      events.add('blur');
    }

    if (this.isChoiceControl()) {
      events.add('blur');
    }

    events.forEach((eventName) => {
      this.addListener(this.elementRef.nativeElement, eventName, handler);
    });

    this.addListener(this.elementRef.nativeElement, 'input', () => {
      this.policy.updateConditionalRequiredFields(this.actualModel);
      this.syncRequiredUi();
    });
  }

  private addListener(target: HTMLElement, eventName: string, handler: () => void): void {
    this.unlistenFns.push(this.renderer2.listen(target, eventName, handler));
  }

  private isChoiceControl(): boolean {
    return this.controlType === 'radio' || this.controlType === 'checkbox' || this.controlType === 'radio-group';
  }

  private initializeRequiredMarkers(): void {
    this.ngZone.runOutsideAngular(() => {
      window.setTimeout(() => {
        this.ngZone.run(() => {
          this.policy.updateConditionalRequiredFields(this.actualModel);
          this.syncRequiredUi();
          this.changeDetectorRef.markForCheck();
        });
      });
    });
  }

  private refreshUi(): void {
    this.policy.updateConditionalRequiredFields(this.actualModel);
    this.syncValidationUi();
    this.syncRequiredUi();
  }

  private syncValidationUi(): void {
    if (!shouldShowFieldErrors(this.actualModel, this.modelInfo.propertyPath)) {
      this.displayStrategy.clearErrors(this.displayContext, this.renderer2);
      return;
    }

    const filteredResults = _.where(this.actualModel.validationResults || [], {
      propertyName: this.modelInfo.propertyPath
    });

    if (filteredResults.length > 0) {
      this.displayStrategy.renderErrors(this.displayContext, filteredResults, this.renderer2);
    } else {
      this.displayStrategy.clearErrors(this.displayContext, this.renderer2);
    }
  }

  private syncRequiredUi(): void {
    const requiredResult = _.findWhere(this.actualModel.requiredResults || [], {
      propertyName: this.modelInfo.propertyPath
    }) as RequiredResult | undefined;

    const indicator: RequiredResult = requiredResult ?? {
      propertyName: this.modelInfo.propertyPath,
      isRequired: false,
      hasRequiredError: false
    };

    this.displayStrategy.renderRequiredIndicator(this.displayContext, indicator, this.renderer2);
  }

  private validateModelWithPolicy(delayByMs = 0): void {
    this.policy = this.validationService.getPolicy(this.withPolicy);
    markFieldTouched(this.actualModel, this.modelInfo.propertyPath);

    window.setTimeout(() => {
      this.policy.validate(this.actualModel, this.modelInfo.propertyPath).pipe(take(1))
        .subscribe(() => {
          this.ngZone.run(() => {
            this.policy.updateConditionalRequiredFields(this.actualModel);
            this.syncValidationUi();
            this.syncRequiredUi();
            this.evaluateGroupBadge();
            this.changeDetectorRef.detectChanges();
          });
        });
    }, delayByMs);

    this.policy.checkModelRequired(this.actualModel, this.modelInfo.propertyPath).pipe(take(1))
      .subscribe(() => {
        this.ngZone.run(() => {
          this.policy.updateConditionalRequiredFields(this.actualModel);
          this.syncRequiredUi();
          this.evaluateGroupBadge();
          this.changeDetectorRef.detectChanges();
        });
      });
  }

  private evaluateGroupBadge(): void {
    if (this.groupName) {
      this.validationService.evaluateFormGroup(this.actualModel, this.groupName, this.withPolicy);
    }
  }
}
