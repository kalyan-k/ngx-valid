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
  OnDestroy,
  OnInit,
  Optional,
  Renderer2
} from '@angular/core';
import { take } from 'rxjs';
import * as _ from 'underscore';
import { ValidationDisplayContext } from '../interfaces/validation-display.interface';
import { RequiredResult } from '../interfaces/validation-result.interface';
import { ValidationProviderService } from '../services/validation-provider.service';
import { DefaultValidationDisplayStrategy } from '../strategies/default-validation-display.strategy';
import { ValidationDisplayStrategy } from '../interfaces/validation-display.interface';
import { VALIDATION_DISPLAY_CONFIG } from '../tokens/validation-display.token';
import { ValidationDisplayConfig } from '../interfaces/validation-display.interface';

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
  private unlisten?: () => void;

  constructor(
    private validationService: ValidationProviderService,
    private differs: IterableDiffers,
    private elementRef: ElementRef,
    private renderer2: Renderer2,
    private changeDetectorRef: ChangeDetectorRef,
    @Optional() @Inject(VALIDATION_DISPLAY_CONFIG) displayConfig: ValidationDisplayConfig | null
  ) {
    this.displayStrategy = displayConfig?.strategy
      ?? new DefaultValidationDisplayStrategy(displayConfig ?? { framework: 'auto' });
  }

  private readonly displayStrategy: ValidationDisplayStrategy;

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
      if (!this.validationService.formGroup.hasOwnProperty(this.groupName)) {
        this.validationService.formGroup[this.groupName] = [];
      }

      this.validationService.formGroup[this.groupName].push(this.modelInfo.propertyPath);
      if (!this.actualModel[this.groupName]) {
        this.actualModel[this.groupName] = {};
      }
    }
  }

  ngDoCheck(): void {
    this.runcheck();
  }

  runcheck(): void {
    if (!this.differValidationResult) {
      this.differValidationResult = this.differs.find(this.actualModel.validationResults || []).create();
      return;
    }

    const validationResultsChanged = this.differValidationResult.diff(this.actualModel.validationResults);
    if (validationResultsChanged) {
      validationResultsChanged.forEachOperation((changeRecord: IterableChangeRecord<any>) => {
        if (changeRecord.item.propertyName === this.modelInfo.propertyPath) {
          this.addValidationsToUi();
          this.checkAndSetFormGroupsValid();
        }
      });
    }

    if (!this.differRequiredResult) {
      if (this.actualModel.requiredResults) {
        this.differRequiredResult = this.differs.find(this.actualModel.requiredResults).create();
      }
      return;
    }

    const requiredResultsChanged = this.differRequiredResult.diff(this.actualModel.requiredResults);
    if (requiredResultsChanged) {
      requiredResultsChanged.forEachAddedItem((changeRecord: IterableChangeRecord<any>) => {
        if (changeRecord.item.propertyName === this.modelInfo.propertyPath) {
          this.addAsteriskToUi(changeRecord.item);
          this.checkAndSetFormGroupsValid();
        }
      });
    }
  }

  checkAndSetFormGroupsValid(): void {
    this.policy.checkFormValid(this.actualModel, this.validationService.formGroup);
    this.changeDetectorRef.detectChanges();
  }

  ngAfterViewInit(): void {
    const event = this.validateOnEvent
      ?? ((this.controlType === 'radio' || this.controlType === 'checkbox') ? 'click' : 'blur');

    this.unlisten = this.renderer2.listen(this.elementRef.nativeElement, event, () => {
      const delay = (this.controlType === 'radio' || this.controlType === 'checkbox') ? 200 : 0;
      this.validateModelWithPolicy(delay);
    });
  }

  ngOnDestroy(): void {
    if (this.unlisten) {
      this.unlisten();
    }
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

  addValidationsToUi(): void {
    const filteredResults = _.where(this.actualModel.validationResults, {
      propertyName: this.modelInfo.propertyPath
    });

    if (filteredResults && !_.isEmpty(filteredResults)) {
      this.displayStrategy.renderErrors(this.displayContext, filteredResults, this.renderer2);
    } else {
      this.displayStrategy.clearErrors(this.displayContext, this.renderer2);
    }
  }

  addAsteriskToUi(filteredResult: RequiredResult): void {
    this.displayStrategy.renderRequiredIndicator(this.displayContext, filteredResult, this.renderer2);
  }

  private validateModelWithPolicy(delayByMs = 0): void {
    this.policy = this.validationService.getPolicy(this.withPolicy);

    window.setTimeout(() => {
      this.policy.validate(this.actualModel, this.modelInfo.propertyPath).pipe(take(1))
        .subscribe(() => {
          this.addValidationsToUi();
        });
    }, delayByMs);

    this.policy.checkModelRequired(this.actualModel, this.modelInfo.propertyPath).pipe(take(1))
      .subscribe();
  }
}
