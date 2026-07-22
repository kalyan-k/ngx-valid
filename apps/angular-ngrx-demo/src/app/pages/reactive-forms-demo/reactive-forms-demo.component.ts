import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, type AbstractControl } from '@angular/forms';
import { Store } from '@ngrx/store';
import { ValidationProviderService } from '@validation-rules/angular';
import { Subject } from 'rxjs';
import { map, takeUntil } from 'rxjs/operators';
import * as DemoActions from '../../store/demo.actions';
import { selectReactiveAccount, selectReactiveLifecycle, selectReactiveSavedAt } from '../../store/demo.selectors';
import { createInitialReactiveAccount, type ReactiveAccount } from '../../store/demo-state';
import { ReactiveAccountPolicy } from '../../validation/demo-validation.policy';

@Component({
  selector: 'app-reactive-forms-demo',
  standalone: false,
  templateUrl: './reactive-forms-demo.component.html',
  styleUrls: ['./reactive-forms-demo.component.sass']
})
export class ReactiveFormsDemoComponent implements OnInit, OnDestroy {
  readonly account$ = this.store.select(selectReactiveAccount);
  readonly lifecycle$ = this.store.select(selectReactiveLifecycle);
  readonly savedAt$ = this.store.select(selectReactiveSavedAt);
  readonly form = this.formBuilder.nonNullable.group({
    displayName: '',
    workEmail: '',
    seatCount: 1,
    company: this.formBuilder.nonNullable.group({ legalName: '', country: '', region: '' }),
    contacts: this.formBuilder.array([this.createContactGroup()]),
    departments: this.formBuilder.array([this.createDepartmentGroup()])
  });
  lastValidationMs = 0;
  private readonly destroy$ = new Subject<void>();

  constructor(
    private readonly formBuilder: FormBuilder,
    private readonly store: Store,
    private readonly validation: ValidationProviderService
  ) {}

  ngOnInit(): void {
    this.account$.pipe(takeUntil(this.destroy$)).subscribe((account) => {
      this.syncForm(account);
    });
    this.form.valueChanges.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.store.dispatch(DemoActions.reactiveDraftChanged({ account: this.form.getRawValue() }));
    });
  }

  validate(): void {
    this.runValidation(false);
  }

  save(): void {
    this.runValidation(true);
  }

  addContact(): void {
    this.form.controls.contacts.push(this.createContactGroup());
  }

  removeContact(index: number): void {
    this.form.controls.contacts.removeAt(index);
  }

  addDepartment(): void {
    this.form.controls.departments.push(this.createDepartmentGroup());
  }

  removeDepartment(index: number): void {
    this.form.controls.departments.removeAt(index);
  }

  loadPerformanceScenario(): void {
    this.form.controls.departments.clear({ emitEvent: false });
    for (let index = 0; index < 30; index += 1) {
      this.form.controls.departments.push(this.createDepartmentGroup(`Department ${index + 1}`, (index + 1) * 10000), { emitEvent: false });
    }
    this.form.updateValueAndValidity();
  }

  trackByIndex(index: number): number {
    return index;
  }

  private runValidation(save: boolean): void {
    const account: ReactiveAccount = { ...this.form.getRawValue() };
    this.store.dispatch(DemoActions.reactiveValidationStarted());
    this.configureValidation(account);
    const startedAt = performance.now();
    this.validation.validateAll(account, 'ReactiveAccount', {
      showAllErrors: true,
      evaluateGroups: true,
      markEvaluated: true
    }).pipe(
      map(() => account)
    ).subscribe((validatedAccount) => {
      this.lastValidationMs = performance.now() - startedAt;
      this.applyPolicyErrors(validatedAccount);
      this.store.dispatch(DemoActions.reactiveValidated({ account: validatedAccount }));
      if (save && (validatedAccount.validationResults ?? []).length === 0) {
        this.store.dispatch(DemoActions.reactiveSaved({ savedAt: new Date().toISOString() }));
      }
    });
  }

  reset(): void {
    this.syncForm(createInitialReactiveAccount());
    this.store.dispatch(DemoActions.reactiveReset());
    this.clearControlErrors(this.form);
    this.lastValidationMs = 0;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private applyPolicyErrors(account: ReactiveAccount): void {
    this.walkControls(this.form, (control) => this.removePolicyError(control));
    for (const result of account.validationResults ?? []) {
      const control = this.form.get(result.propertyName);
      if (control) {
        control.setErrors({ ...control.errors, policyValidation: result.error.message });
      }
    }
  }

  private removePolicyError(control: AbstractControl): void {
    if (!control.errors?.['policyValidation']) {
      return;
    }
    const remaining = { ...control.errors };
    delete remaining['policyValidation'];
    control.setErrors(Object.keys(remaining).length > 0 ? remaining : null);
  }

  private configureValidation(account: ReactiveAccount): void {
    this.validation.replacePolicy('ReactiveAccount', new ReactiveAccountPolicy(account.contacts.length, account.departments.length));
    const groups = {
      organizationGroup: ['displayName', 'workEmail', 'seatCount', 'company.legalName', 'company.country', 'company.region'],
      contactsGroup: account.contacts.flatMap((_, index) => [`contacts.${index}.name`, `contacts.${index}.email`]),
      departmentsGroup: account.departments.flatMap((_, index) => [`departments.${index}.name`, `departments.${index}.budget`])
    };
    for (const [groupName, paths] of Object.entries(groups)) {
      this.validation.registerFormGroupPolicy(groupName, 'ReactiveAccount');
      this.validation.formGroup[groupName] = paths;
    }
  }

  private syncForm(account: ReactiveAccount): void {
    if (this.form.controls.contacts.length !== account.contacts.length) {
      this.form.controls.contacts.clear({ emitEvent: false });
      account.contacts.forEach(({ name, email }) => this.form.controls.contacts.push(this.createContactGroup(name, email), { emitEvent: false }));
    }
    if (this.form.controls.departments.length !== account.departments.length) {
      this.form.controls.departments.clear({ emitEvent: false });
      account.departments.forEach(({ name, budget }) => this.form.controls.departments.push(this.createDepartmentGroup(name, budget), { emitEvent: false }));
    }
    this.form.patchValue({
      displayName: account.displayName,
      workEmail: account.workEmail,
      seatCount: account.seatCount,
      company: account.company,
      contacts: account.contacts,
      departments: account.departments
    }, { emitEvent: false });
  }

  private createContactGroup(name = '', email = '') {
    return this.formBuilder.nonNullable.group({ name, email });
  }

  private createDepartmentGroup(name = '', budget = 0) {
    return this.formBuilder.nonNullable.group({ name, budget });
  }

  private walkControls(control: AbstractControl, visitor: (control: AbstractControl) => void): void {
    visitor(control);
    const children = (control as AbstractControl & { controls?: Record<string, AbstractControl> | AbstractControl[] }).controls;
    if (Array.isArray(children)) {
      children.forEach((child) => this.walkControls(child, visitor));
    } else if (children) {
      Object.values(children).forEach((child) => this.walkControls(child, visitor));
    }
  }

  private clearControlErrors(control: AbstractControl): void {
    this.walkControls(control, (current) => current.setErrors(null));
  }
}
