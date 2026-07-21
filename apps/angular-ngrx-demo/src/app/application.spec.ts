import { FormBuilder } from '@angular/forms';
import { Store } from '@ngrx/store';
import { ValidationProviderService } from '@validation-rules/angular';
import { BehaviorSubject, of } from 'rxjs';
import { AppComponent } from './app.component';
import { ReactiveFormsDemoComponent } from './pages/reactive-forms-demo/reactive-forms-demo.component';
import { StateDemoComponent } from './pages/state-demo/state-demo.component';
import type { ReactiveAccount, StateProfile } from './store/demo-state';

describe('Angular + NgRx demo application', () => {
  it('publishes stable cross-application navigation links', () => {
    const component = new AppComponent();
    expect(component.links.portal).toContain('4200');
    expect(component.links.docs).toContain('4201');
    expect(component.links.angular).toContain('4202');
    expect(component.currentYear).toBe(new Date().getFullYear());
  });

  it('edits, validates, displays errors, and resets pure NgRx state', () => {
    const profile$ = new BehaviorSubject<StateProfile>({ fullName: '', email: '', role: '' });
    const lifecycle$ = new BehaviorSubject('editing');
    const store = jasmine.createSpyObj<Store>('Store', ['select', 'dispatch']);
    store.select.and.returnValues(profile$ as any, lifecycle$ as any);
    const validation = jasmine.createSpyObj<ValidationProviderService>('ValidationProviderService', ['validateAll']);
    validation.validateAll.and.callFake((profile: any) => {
      profile.validationResults = [{ propertyName: 'email', error: { message: 'Email required' } }];
      return of(profile);
    });
    const component = new StateDemoComponent(store, validation);

    component.update('fullName', { target: { value: 'Ada' } } as unknown as Event);
    expect(store.dispatch).toHaveBeenCalledWith(jasmine.objectContaining({ field: 'fullName', value: 'Ada' }));

    component.validate();
    expect(validation.validateAll).toHaveBeenCalledWith(jasmine.any(Object), 'StateProfile', { showAllErrors: true });
    const validatedAction = store.dispatch.calls.mostRecent().args[0] as any;
    expect(validatedAction.profile).not.toBe(profile$.value);
    expect(component.errorFor(validatedAction.profile, 'email')).toBe('Email required');
    expect(component.errorFor(validatedAction.profile, 'role')).toBeUndefined();

    component.reset();
    expect((store.dispatch.calls.mostRecent().args[0] as any).type).toContain('Reset');
  });

  it('synchronizes Reactive Forms with NgRx and maps policy errors to controls', () => {
    const account$ = new BehaviorSubject<ReactiveAccount>({ displayName: '', workEmail: '', seatCount: 1 });
    const lifecycle$ = new BehaviorSubject('editing');
    const store = jasmine.createSpyObj<Store>('Store', ['select', 'dispatch']);
    store.select.and.returnValues(account$ as any, lifecycle$ as any);
    const validation = jasmine.createSpyObj<ValidationProviderService>('ValidationProviderService', ['validateAll']);
    validation.validateAll.and.callFake((account: any) => {
      account.validationResults = [{ propertyName: 'workEmail', error: { message: 'Work email required' } }];
      return of(account);
    });
    const component = new ReactiveFormsDemoComponent(new FormBuilder(), store, validation);
    component.ngOnInit();

    account$.next({ displayName: 'Ada', workEmail: 'ada@example.com', seatCount: 3 });
    expect(component.form.getRawValue()).toEqual({ displayName: 'Ada', workEmail: 'ada@example.com', seatCount: 3 });

    component.form.controls.displayName.setValue('Grace');
    expect(store.dispatch).toHaveBeenCalledWith(jasmine.objectContaining({ account: jasmine.objectContaining({ displayName: 'Grace' }) }));

    component.form.controls.workEmail.setErrors({ server: true, policyValidation: 'Old error' });
    component.validate();
    expect(component.form.controls.workEmail.errors).toEqual({ server: true, policyValidation: 'Work email required' });
    expect(component.form.controls.displayName.errors).toBeNull();

    (component as any).applyPolicyErrors({ displayName: 'No errors', workEmail: 'ok@example.com', seatCount: 2 });
    component.form.controls.displayName.setErrors({ policyValidation: 'Only policy error' });
    (component as any).removePolicyError(component.form.controls.displayName);
    expect(component.form.controls.displayName.errors).toBeNull();

    component.reset();
    expect(component.form.getRawValue()).toEqual({ displayName: '', workEmail: '', seatCount: 1 });
    expect(component.form.controls.workEmail.errors).toBeNull();

    component.ngOnDestroy();
    account$.next({ displayName: 'Ignored', workEmail: 'ignored@example.com', seatCount: 5 });
    expect(component.form.controls.displayName.value).toBe('');
  });
});
