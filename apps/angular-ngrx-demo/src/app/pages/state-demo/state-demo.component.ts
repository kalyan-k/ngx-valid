import { Component } from '@angular/core';
import { Store } from '@ngrx/store';
import { ValidationProviderService, type FormGroupStatus, type ValidationResult } from '@validation-rules/angular';
import { map, switchMap, take } from 'rxjs/operators';
import * as DemoActions from '../../store/demo.actions';
import { selectPureLifecycle, selectPureProfile } from '../../store/demo.selectors';
import type { ContactAddress, PhoneNumber, StatePolicyName, StateProfile, StateProfileField } from '../../store/demo-state';
import { EnterpriseStateProfilePolicy, StateProfilePolicy } from '../../validation/demo-validation.policy';

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
    this.store.dispatch(DemoActions.pureFieldChanged({ field, value: this.eventValue(event) }));
  }

  updatePrimaryAddress(field: keyof ContactAddress, event: Event): void {
    this.store.dispatch(DemoActions.purePrimaryAddressChanged({ field, value: this.eventValue(event) }));
  }

  updateAddress(index: number, field: keyof ContactAddress, event: Event): void {
    this.store.dispatch(DemoActions.pureAdditionalAddressChanged({ index, field, value: this.eventValue(event) }));
  }

  addAddress(): void {
    this.store.dispatch(DemoActions.pureAddressAdded());
  }

  removeAddress(index: number): void {
    this.store.dispatch(DemoActions.pureAddressRemoved({ index }));
  }

  updatePhone(index: number, field: keyof PhoneNumber, event: Event): void {
    this.store.dispatch(DemoActions.purePhoneChanged({ index, field, value: this.eventValue(event) }));
  }

  addPhone(): void {
    this.store.dispatch(DemoActions.purePhoneAdded());
  }

  removePhone(index: number): void {
    this.store.dispatch(DemoActions.purePhoneRemoved({ index }));
  }

  switchPolicy(event: Event): void {
    this.store.dispatch(DemoActions.purePolicyChanged({ policy: this.eventValue(event) as StatePolicyName }));
  }

  validate(): void {
    this.store.dispatch(DemoActions.pureValidationStarted());
    this.profile$.pipe(
      take(1),
      map((profile) => structuredClone(profile)),
      switchMap((profile) => {
        this.configureValidation(profile);
        return this.validation.validateAll(profile, profile.selectedPolicy, {
          showAllErrors: true,
          evaluateGroups: true,
          markEvaluated: true
        }).pipe(map(() => profile));
      })
    ).subscribe((profile) => this.store.dispatch(DemoActions.pureValidated({ profile })));
  }

  reset(): void {
    this.store.dispatch(DemoActions.pureReset());
  }

  errorFor(profile: StateProfile, field: string): string | undefined {
    return profile.validationResults?.find((result: ValidationResult) => result.propertyName === field)?.error.message;
  }

  groupStatus(profile: StateProfile, groupName: 'identityGroup' | 'addressGroup' | 'contactGroup'): FormGroupStatus | undefined {
    return profile[groupName];
  }

  trackByIndex(index: number): number {
    return index;
  }

  private configureValidation(profile: StateProfile): void {
    const policy = profile.selectedPolicy === 'StateProfileEnterprise'
      ? new EnterpriseStateProfilePolicy(profile.addresses.length, profile.phoneNumbers.length)
      : new StateProfilePolicy(profile.addresses.length, profile.phoneNumbers.length);
    this.validation.replacePolicy(profile.selectedPolicy, policy);
    const groups = {
      identityGroup: ['firstName', 'lastName', 'email', 'phone', 'role'],
      addressGroup: [
        'primaryAddress.street', 'primaryAddress.city', 'primaryAddress.country',
        ...profile.addresses.flatMap((_, index) => [`addresses.${index}.label`, `addresses.${index}.street`, `addresses.${index}.city`, `addresses.${index}.country`])
      ],
      contactGroup: profile.phoneNumbers.map((_, index) => `phoneNumbers.${index}.value`)
    };
    for (const [groupName, paths] of Object.entries(groups)) {
      this.validation.registerFormGroupPolicy(groupName, profile.selectedPolicy);
      this.validation.formGroup[groupName] = paths;
    }
  }

  private eventValue(event: Event): string {
    return (event.target as HTMLInputElement | HTMLSelectElement).value;
  }
}
