import { FormBuilder } from '@angular/forms';
import { Store } from '@ngrx/store';
import { ValidationProviderService } from '@validation-rules/angular';
import { BehaviorSubject, of } from 'rxjs';
import { AppComponent } from './app.component';
import { ReactiveFormsDemoComponent } from './pages/reactive-forms-demo/reactive-forms-demo.component';
import { StateDemoComponent } from './pages/state-demo/state-demo.component';
import { HomeComponent } from './pages/home/home.component';
import { createInitialReactiveAccount, createInitialStateProfile, type ReactiveAccount, type StateProfile } from './store/demo-state';

describe('Angular + NgRx demo application', () => {
  it('publishes stable cross-application navigation links', () => {
    const component = new AppComponent();
    expect(component.links.portal).toContain('4200');
    expect(component.links.docs).toContain('4201');
    expect(component.links.angular).toContain('4202');
    expect(component.currentYear).toBe(new Date().getFullYear());
    expect(component.isExamplesExpanded).toBeTrue();
    expect(new HomeComponent().examples.map(({ route }) => route)).toEqual(['/state', '/reactive-forms']);
  });

  it('edits, validates, displays errors, and resets pure NgRx state', () => {
    const profile$ = new BehaviorSubject<StateProfile>(createInitialStateProfile());
    const lifecycle$ = new BehaviorSubject('editing');
    const store = jasmine.createSpyObj<Store>('Store', ['select', 'dispatch']);
    store.select.and.returnValues(profile$ as any, lifecycle$ as any);
    const validation = jasmine.createSpyObj<ValidationProviderService>('ValidationProviderService', ['validateAll', 'replacePolicy', 'registerFormGroupPolicy']);
    validation.formGroup = {};
    validation.validateAll.and.callFake((profile: any) => {
      profile.validationResults = [{ propertyName: 'email', error: { message: 'Email required' } }];
      return of(profile);
    });
    const component = new StateDemoComponent(store, validation);

    const event = { target: { value: 'Ada' } } as unknown as Event;
    component.update('firstName', event);
    component.updatePrimaryAddress('city', event);
    component.updateAddress(0, 'street', event);
    component.addAddress();
    component.removeAddress(0);
    component.updatePhone(0, 'value', event);
    component.addPhone();
    component.removePhone(0);
    component.switchPolicy({ target: { value: 'StateProfileEnterprise' } } as unknown as Event);
    expect(store.dispatch).toHaveBeenCalledWith(jasmine.objectContaining({ policy: 'StateProfileEnterprise' }));

    component.validate();
    expect(validation.validateAll).toHaveBeenCalledWith(jasmine.any(Object), 'StateProfile', {
      showAllErrors: true, evaluateGroups: true, markEvaluated: true
    });
    expect(validation.replacePolicy).toHaveBeenCalled();
    expect(validation.registerFormGroupPolicy).toHaveBeenCalledTimes(3);
    const validatedAction = store.dispatch.calls.mostRecent().args[0] as any;
    expect(validatedAction.profile).not.toBe(profile$.value);
    expect(component.errorFor(validatedAction.profile, 'email')).toBe('Email required');
    expect(component.errorFor(validatedAction.profile, 'role')).toBeUndefined();
    const group = { isValid: false, isInValid: true, isEvaluated: true, errors: [] } as any;
    expect(component.groupStatus({ ...validatedAction.profile, identityGroup: group }, 'identityGroup')).toBe(group);
    expect(component.trackByIndex(4)).toBe(4);

    profile$.next({ ...createInitialStateProfile(), selectedPolicy: 'StateProfileEnterprise' });
    component.validate();
    expect(validation.validateAll).toHaveBeenCalledWith(jasmine.any(Object), 'StateProfileEnterprise', jasmine.any(Object));

    component.reset();
    expect((store.dispatch.calls.mostRecent().args[0] as any).type).toContain('Reset');
  });

  it('synchronizes Reactive Forms with NgRx and maps policy errors to controls', () => {
    const account$ = new BehaviorSubject<ReactiveAccount>(createInitialReactiveAccount());
    const lifecycle$ = new BehaviorSubject('editing');
    const savedAt$ = new BehaviorSubject<string | undefined>(undefined);
    const store = jasmine.createSpyObj<Store>('Store', ['select', 'dispatch']);
    store.select.and.returnValues(account$ as any, lifecycle$ as any, savedAt$ as any);
    const validation = jasmine.createSpyObj<ValidationProviderService>('ValidationProviderService', ['validateAll', 'replacePolicy', 'registerFormGroupPolicy']);
    validation.formGroup = {};
    let hasErrors = true;
    validation.validateAll.and.callFake((account: any) => {
      account.validationResults = hasErrors
        ? [{ propertyName: 'contacts.0.email', error: { message: 'Contact email required' } }]
        : [];
      return of(account);
    });
    const component = new ReactiveFormsDemoComponent(new FormBuilder(), store, validation);
    component.ngOnInit();

    const expandedAccount: ReactiveAccount = {
      ...createInitialReactiveAccount(),
      displayName: 'Ada', workEmail: 'ada@example.com', seatCount: 3,
      company: { legalName: 'Example Inc', country: 'US', region: 'MA' },
      contacts: [{ name: 'Ada', email: 'ada@example.com' }, { name: 'Grace', email: 'grace@example.com' }],
      departments: [{ name: 'Engineering', budget: 1000 }, { name: 'Operations', budget: 2000 }]
    };
    account$.next(expandedAccount);
    expect(component.form.getRawValue()).toEqual(expandedAccount);

    component.form.controls.displayName.setValue('Grace');
    expect(store.dispatch).toHaveBeenCalledWith(jasmine.objectContaining({ account: jasmine.objectContaining({ displayName: 'Grace' }) }));

    component.addContact();
    component.removeContact(2);
    component.addDepartment();
    component.removeDepartment(2);
    expect(component.trackByIndex(3)).toBe(3);

    component.form.controls.contacts.at(0).controls.email.setErrors({ server: true, policyValidation: 'Old error' });
    component.validate();
    expect(component.form.controls.contacts.at(0).controls.email.errors).toEqual({ server: true, policyValidation: 'Contact email required' });
    expect(component.form.controls.displayName.errors).toBeNull();
    expect(validation.replacePolicy).toHaveBeenCalled();
    expect(validation.registerFormGroupPolicy).toHaveBeenCalledWith('departmentsGroup', 'ReactiveAccount');

    (component as any).applyPolicyErrors(createInitialReactiveAccount());
    component.form.controls.displayName.setErrors({ policyValidation: 'Only policy error' });
    (component as any).removePolicyError(component.form.controls.displayName);
    expect(component.form.controls.displayName.errors).toBeNull();

    component.loadPerformanceScenario();
    expect(component.form.controls.departments.length).toBe(30);
    hasErrors = false;
    component.save();
    expect(store.dispatch).toHaveBeenCalledWith(jasmine.objectContaining({ type: '[Reactive Form] Saved' }));
    expect(component.lastValidationMs).toBeGreaterThanOrEqual(0);

    component.reset();
    expect(component.form.getRawValue()).toEqual(createInitialReactiveAccount());
    expect(component.form.controls.contacts.at(0).controls.email.errors).toBeNull();
    expect(component.lastValidationMs).toBe(0);

    component.ngOnDestroy();
    account$.next({ ...createInitialReactiveAccount(), displayName: 'Ignored' });
    expect(component.form.controls.displayName.value).toBe('');
  });
});
