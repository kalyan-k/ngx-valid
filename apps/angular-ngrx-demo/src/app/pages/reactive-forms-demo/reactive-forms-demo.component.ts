import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, type AbstractControl } from '@angular/forms';
import { Store } from '@ngrx/store';
import { ValidationProviderService } from '@validation-rules/angular';
import { Subject } from 'rxjs';
import { map, takeUntil } from 'rxjs/operators';
import * as DemoActions from '../../store/demo.actions';
import { selectReactiveAccount, selectReactiveLifecycle } from '../../store/demo.selectors';
import type { ReactiveAccount } from '../../store/demo-state';

@Component({
  selector: 'app-reactive-forms-demo',
  standalone: false,
  templateUrl: './reactive-forms-demo.component.html',
  styleUrls: ['./reactive-forms-demo.component.sass']
})
export class ReactiveFormsDemoComponent implements OnInit, OnDestroy {
  readonly account$ = this.store.select(selectReactiveAccount);
  readonly lifecycle$ = this.store.select(selectReactiveLifecycle);
  readonly form = this.formBuilder.nonNullable.group({ displayName: '', workEmail: '', seatCount: 1 });
  private readonly destroy$ = new Subject<void>();

  constructor(
    private readonly formBuilder: FormBuilder,
    private readonly store: Store,
    private readonly validation: ValidationProviderService
  ) {}

  ngOnInit(): void {
    this.account$.pipe(takeUntil(this.destroy$)).subscribe((account) => {
      const current = this.form.getRawValue();
      if (current.displayName !== account.displayName || current.workEmail !== account.workEmail || current.seatCount !== account.seatCount) {
        this.form.patchValue(account, { emitEvent: false });
      }
    });
    this.form.valueChanges.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.store.dispatch(DemoActions.reactiveDraftChanged({ account: this.form.getRawValue() }));
    });
  }

  validate(): void {
    const account: ReactiveAccount = { ...this.form.getRawValue() };
    this.store.dispatch(DemoActions.reactiveValidationStarted());
    this.validation.validateAll(account, 'ReactiveAccount', { showAllErrors: true }).pipe(
      map(() => account)
    ).subscribe((validatedAccount) => {
      this.applyPolicyErrors(validatedAccount);
      this.store.dispatch(DemoActions.reactiveValidated({ account: validatedAccount }));
    });
  }

  reset(): void {
    this.form.reset({ displayName: '', workEmail: '', seatCount: 1 }, { emitEvent: false });
    this.store.dispatch(DemoActions.reactiveReset());
    Object.values(this.form.controls).forEach((control) => control.setErrors(null));
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private applyPolicyErrors(account: ReactiveAccount): void {
    Object.values(this.form.controls).forEach((control) => this.removePolicyError(control));
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
}
