import { AfterViewInit, ChangeDetectorRef, Directive, DoCheck, ElementRef, Input, IterableChangeRecord, IterableDiffers, OnDestroy, OnInit, Renderer2 } from '@angular/core';
import { ValidationProviderService } from '../services/validation-provider.service';
import { take } from 'rxjs';
import * as _ from 'underscore';

@Directive({
	selector: '[libValidatorDirective]'
})
export class ValidatorDirective implements OnInit, AfterViewInit, DoCheck, OnDestroy {
	@Input()
	validateModel: any = {};

	@Input()
	actualModel: any;

	@Input()
	withPolicy!: string;

	@Input()
	validateOnEvent!: string;

	@Input()
	groupName!: string;

	policy: any = {};
	parentNodeName = '';
	depthOfParentNode!: number;
	isInput = false;
	isCheckbox = false;
	isRadioButton = false;
	modelInfo!: { entityPath: string | undefined; propertyPath: string; };
	differRequiredResult: any;
	differValidationResult: any;

	constructor(
		private validationService: ValidationProviderService,
		private differs: IterableDiffers,
		private elementRef: ElementRef,
		private renderer2: Renderer2,
		private changeDetectorRef: ChangeDetectorRef) {

	}

	ngOnInit(): void {
		this.modelInfo = this.parseDottedPath(this.validateModel);

		this.policy = this.validationService.getPolicy(this.withPolicy);

		if (!!this.groupName) {
			if (!this.validationService.formGroup.hasOwnProperty(this.groupName)) {
				this.validationService.formGroup[this.groupName] = [];
			}

			this.validationService.formGroup[this.groupName].push(this.modelInfo.propertyPath);
			if (!this.actualModel[this.groupName]) {
				this.actualModel[this.groupName] = {};
			}
		} else {
			this.validationService.formGroup = {};
		}
	}

	ngDoCheck(): void {

		this.runcheck();
	}
	runcheck(): void {
		// for validation
		if (!this.differValidationResult) {
			// create with empty array if validation results does not exist
			this.differValidationResult = this.differs.find(this.actualModel.validationResults || []).create();
			return;
		} else {
			const validationResultsChanged = this.differValidationResult.diff(this.actualModel.validationResults);


			if (!!validationResultsChanged) {
				// old code commented out, keeping for reference
				// const filteredValidationResults = _.where(this.actualModel.validationResults, { 'propertyName': this.modelInfo.propertyPath });
				// if (!!filteredValidationResults && !_.isEmpty(filteredValidationResults)) {
				//   this.addValidationsToUi();
				//   this.checkAndSetFormGroupsValid();
				// } 
				// this is added for the scenario where the red mark was not getting cleared after providing value
				// from background. NOw it should clear the red mark.
				validationResultsChanged.forEachOperation((changeRecord: IterableChangeRecord<any>) => {
					if (changeRecord.item.propertyName === this.modelInfo.propertyPath) {
						this.addValidationsToUi();
						this.checkAndSetFormGroupsValid();
					}
				});

			}
		}
		// for req
		if (!this.differRequiredResult) {
			if (!!this.actualModel.requiredResults) {
				// do not create differ before requiredResult is availble
				this.differRequiredResult = this.differs.find(this.actualModel.requiredResults).create();
			}
			return;
		} else {
			const requiredResultsChanged = this.differRequiredResult.diff(this.actualModel.requiredResults);
			if (!!requiredResultsChanged) {
				requiredResultsChanged.forEachAddedItem((changeRecord: IterableChangeRecord<any>) => {
					if (changeRecord.item.propertyName === this.modelInfo.propertyPath) {
						this.addAsteriskToUi(changeRecord.item);
						this.checkAndSetFormGroupsValid();
					}
				});
			}
		}
	}

	checkAndSetFormGroupsValid(): any {
		this.policy.checkFormValid(this.actualModel, this.validationService.formGroup);
		this.changeDetectorRef.detectChanges();
	}

	ngAfterViewInit() {
		this.checkElement();
		// Default event 'click' for mat-checkbox and mat-radio-group elements
		// And defualt 'blur' for other elements like input, mat-select
		const event = !!this.validateOnEvent ? this.validateOnEvent : (this.isRadioButton || this.isCheckbox) ? 'click' : 'blur';

		this.renderer2.listen(this.elementRef.nativeElement, event, () => {
			// Delay the execution of validate by 200ms as the ngModel value needs to be updated.
			// This is workaround for mat-checkbox and mat-radio-group elements
			const delay = (this.isRadioButton || this.isCheckbox) ? 200 : 0;
			this.validateModelWithPolicy(delay);
		});

	}

	ngOnDestroy(): void {

	}

	checkElement() {
		const node = this.elementRef.nativeElement;

		this.depthOfParentNode = 5;

		const elementClass = _.reduce(node.classList, function (memo, value, index, list) {
			if (memo === "") {
				value = value.toUpperCase();
				if (value === 'MAT-CHECKBOX-INPUT' || value === 'MAT-CHECKBOX') {
					return 'MAT-CHECKBOX';
				}
				else if (value === 'MAT-RADIO-INPUT' || value === 'MAT-RADIO-GROUP' || value === 'RADIO-GROUP') {
					return 'MAT-RADIO-GROUP';
				}
				else if (value === 'MAT-INPUT-ELEMENT' || value === 'MAT-SELECT') {
					return 'MAT-FORM-FIELD';
				}
				else {
					return "";
				}
			}
			else {
				return memo;
			}
		}, "");

		switch (elementClass.toUpperCase()) {
			case 'MAT-CHECKBOX':
				this.parentNodeName = 'MAT-CHECKBOX';
				this.depthOfParentNode = 3;
				this.isCheckbox = true;
				break;
			case 'MAT-RADIO-GROUP':
				this.parentNodeName = 'MAT-RADIO-GROUP';
				this.depthOfParentNode = 3;
				this.isRadioButton = true;
				break;
			case 'MAT-FORM-FIELD':
			case 'MAT-SELECT':
				this.parentNodeName = 'MAT-FORM-FIELD';
				this.depthOfParentNode = 4;
				this.isInput = true;
				break;
			default:
				this.parentNodeName = 'MAT-FORM-FIELD';
				this.depthOfParentNode = 5;
				this.isInput = true;
				break;
		}

		if (this.isCheckbox || this.isRadioButton) {
			this.renderer2.addClass(node, 'mat-form-field');
			const errorElement = node.querySelector('.ui-validation-transitionMessages');

			if (errorElement === null) {
				const validationTransitionElement = document.createElement('div');

				validationTransitionElement.className = 'ui-validation-transitionMessages';
				node.appendChild(validationTransitionElement);
			}
		}
	}

	parseDottedPath = function (path: string) {
		const paths = path.split('.');
		return {
			'entityPath': paths.shift(),
			'propertyPath': paths.join('.')
		};
	};

	addValidationsToUi = () => {
		let node = this.elementRef.nativeElement;
		const maxDept = 5;  // Using this as mat elements depth of Parent doesn't exceed 5
		let loopCount = 0;

		while (loopCount < maxDept) {
			if (node.nodeName.toUpperCase() === this.parentNodeName) {
				break;
			} else {
				node = node.parentNode;
			}
			loopCount++;
		}

		if (this.isInput) {
			const errorHolder = node.querySelector('.ng-trigger-transitionMessages');
			this.addMatErrorsToHtml(errorHolder, node, 'mat-form-field-invalid');
		}

		if (this.isRadioButton || this.isCheckbox) {
			const errorElement = node.querySelector('.ui-validation-transitionMessages');
			const cssErrorClass = this.isCheckbox ? 'mat-checkbox-invalid' : 'mat-radio-invalid';

			this.addMatErrorsToHtml(errorElement, node, cssErrorClass);
		}

	};

	addAsteriskToUi = (filteredResult: any) => {
		let node = this.elementRef.nativeElement;
		const maxDept = 5;  // Using this as mat elements depth of Parent doesn't exceed 5
		let loopCount = 0;

		while (loopCount < maxDept) {
			if (node.nodeName.toUpperCase() === this.parentNodeName) {
				break;
			} else {
				node = node.parentNode;
			}
			loopCount++;
		}

		// we are now passing the object instead of filtering again
		// const filteredResults = _.where(this.actualModel.requiredResults, { 'propertyName': this.modelInfo.propertyPath });
		// console.debug('filteredResults >> ' + this.modelInfo.propertyPath);console.debug(filteredResults);
		if (this.isInput) {
			const labelElement = node.querySelector('.mat-form-field-label');

			if (!!labelElement) {
				const spanRequiredElements = labelElement.querySelectorAll(".mat-placeholder-required");

				this.addAsteriskSpanElement(spanRequiredElements, labelElement, filteredResult);
			}
		}

		if (this.isCheckbox) {
			const checkboxSpanElement = node.querySelector('.mat-checkbox-label');

			if (!!checkboxSpanElement) {
				const spanRequiredElements = checkboxSpanElement.querySelectorAll(".mat-placeholder-required");

				this.addAsteriskSpanElement(spanRequiredElements, checkboxSpanElement, filteredResult);
			}
		}

		if (this.isRadioButton) {
			const radioSpanElements = node.querySelectorAll('.mat-radio-label-content');

			if (!!radioSpanElements && radioSpanElements.length > 0) {

				radioSpanElements.forEach((radioSpanElem: { querySelectorAll: (arg0: string) => any; }) => {
					const spanRequiredElements = radioSpanElem.querySelectorAll(".mat-placeholder-required");

					this.addAsteriskSpanElement(spanRequiredElements, radioSpanElem, filteredResult);
				});

			}
		}

	};

	addAsteriskSpanElement = (spanRequiredElements: any, inputTypeSpanElement: any, filteredResult: any) => {
		if (!!spanRequiredElements && spanRequiredElements.length > 0) {
			spanRequiredElements.forEach((requiredNode: any) => {
				this.renderer2.removeChild(inputTypeSpanElement, requiredNode);
			});
		}
		if (!!filteredResult && filteredResult.hasRequiredError) {
			const starSpanElement = document.createElement('span');
			const text = document.createTextNode(" *");
			starSpanElement.appendChild(text);
			this.renderer2.addClass(starSpanElement, "mat-placeholder-required");
			this.renderer2.addClass(starSpanElement, "mat-form-field-required-marker");
			inputTypeSpanElement.appendChild(starSpanElement);
			this.renderer2.addClass(inputTypeSpanElement, "label-required");
		}
		else if (!!inputTypeSpanElement.classList && inputTypeSpanElement.classList.value.indexOf("label-required") > -1) {
			this.renderer2.removeClass(inputTypeSpanElement, "label-required");
		}
	};

	addMatErrorsToHtml = (errorElement: any, node: any, cssErrorClass: string) => {
		if (!!errorElement) {
			const errorExistingNodes = errorElement.querySelectorAll('mat-error');
			this.renderer2.removeClass(node, cssErrorClass);
			if (!!errorExistingNodes && errorExistingNodes.length > 0) {
				errorExistingNodes.forEach((errorNode: any) => {
					this.renderer2.removeChild(errorElement, errorNode);
				});
			}
			const filteredResults = _.where(this.actualModel.validationResults, { 'propertyName': this.modelInfo.propertyPath });
			if (filteredResults && !_.isEmpty(filteredResults)) {
				filteredResults.forEach(validationError => {
					const eleError = document.createElement('mat-error');
					const text = document.createTextNode(validationError.error.message);
					eleError.appendChild(text);
					eleError.className = 'mat-error';
					const refNode = errorElement.querySelector('div');
					this.renderer2.insertBefore(errorElement, eleError, refNode);
					this.renderer2.addClass(node, cssErrorClass);
				});
			}
		}
	};

	private validateModelWithPolicy(delayByMs: number = 0) {
		this.policy = this.validationService.getPolicy(this.withPolicy);

		window.setTimeout(() => {
			this.policy.validate(this.actualModel, this.modelInfo.propertyPath).pipe(take(1))
				.subscribe(() => {
					this.addValidationsToUi();
				});
		}, delayByMs);

		this.policy.checkModelRequired(this.actualModel, this.modelInfo.propertyPath).pipe(take(1))
			.subscribe(() => {
				// this.addAsteriskToUi(); not req since we are watching on reqResult
			});

	}
}
