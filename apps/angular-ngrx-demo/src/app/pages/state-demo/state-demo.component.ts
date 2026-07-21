import { Component } from '@angular/core';
import { Store } from '@ngrx/store';
import { ValidationProviderService, type ValidationResult } from '@validation-rules/angular';
import { map, switchMap, take } from 'rxjs/operators';
import * as DemoActions from '../../store/demo.actions';
import { selectPureLifecycle, selectPureProfile } from '../../store/demo.selectors';
import type { StateProfile, StateProfileField } from '../../store/demo-state';

@Component({
  selector: 'app-state-demo',
  standalone: false,
  templateUrl: './state-demo.component.html',
  styleUrls: ['./state-demo.component.sass']
})
export class StateDemoComponent {
  readonly profile$ = this.store.select(selectPureProfile);
  readonly lifecycle$ = this.store.select(selectPureLifecycle);

  constructor(private readonly store: Store, private readonly validation: ValidationProviderService) {}

  update(field: StateProfileField, event: Event): void {
    const value = (event.target as HTMLInputElement | HTMLSelectElement).value;
    this.store.dispatch(DemoActions.pureFieldChanged({ field, value }));
  }

  validate(): void {
    this.store.dispatch(DemoActions.pureValidationStarted());
    this.profile$.pipe(
      take(1),
      map((profile) => structuredClone(profile)),
      switchMap((profile) => this.validation.validateAll(profile, 'StateProfile', { showAllErrors: true }).pipe(map(() => profile)))
    ).subscribe((profile) => this.store.dispatch(DemoActions.pureValidated({ profile })));
  }

  reset(): void {
    this.store.dispatch(DemoActions.pureReset());
  }

  errorFor(profile: StateProfile, field: StateProfileField): string | undefined {
    return profile.validationResults?.find((result: ValidationResult) => result.propertyName === field)?.error.message;
  }
}
