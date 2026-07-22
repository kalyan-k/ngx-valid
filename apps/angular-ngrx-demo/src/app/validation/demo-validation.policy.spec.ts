import { firstValueFrom } from 'rxjs';
import { ValidationProviderService } from '@validation-rules/angular';
import { createInitialReactiveAccount, createInitialStateProfile } from '../store/demo-state';
import { EnterpriseStateProfilePolicy, ReactiveAccountPolicy, StateProfilePolicy } from './demo-validation.policy';
import { demoValidationProviders, registerDemoPolicies } from './validation.providers';

describe('NgRx demo validation policies', () => {
  let validation: ValidationProviderService;

  beforeEach(() => {
    validation = new ValidationProviderService();
    registerDemoPolicies(validation)();
  });

  it('registers all policies through the application initializer', () => {
    expect(validation.hasPolicy('StateProfile')).toBeTrue();
    expect(validation.hasPolicy('StateProfileEnterprise')).toBeTrue();
    expect(validation.hasPolicy('ReactiveAccount')).toBeTrue();
    expect(demoValidationProviders[0].multi).toBeTrue();
  });

  it('validates pure NgRx profile data without an Angular form', async () => {
    const profile: any = { ...createInitialStateProfile(), email: 'not-an-email' };
    await firstValueFrom(validation.validateAll(profile, 'StateProfile', { showAllErrors: true }));
    expect(profile.validationResults.map((result: any) => result.propertyName)).toContain('firstName');
    expect(profile.validationResults.map((result: any) => result.propertyName)).toContain('primaryAddress.street');
    expect(profile.validationResults.map((result: any) => result.propertyName)).toContain('addresses.0.city');
    expect(profile.validationResults.map((result: any) => result.propertyName)).toContain('phoneNumbers.0.value');

    const validProfile: any = {
      ...createInitialStateProfile(),
      firstName: 'Ada', lastName: 'Lovelace', email: 'ada@example.com', phone: '555-0100', role: 'admin',
      primaryAddress: { label: 'Primary', street: '1 Main', city: 'Boston', country: 'US', region: 'MA', postalCode: '02110' },
      addresses: [{ label: 'Office', street: '2 State', city: 'Boston', country: 'US', region: 'MA', postalCode: '02109' }],
      phoneNumbers: [{ type: 'mobile', value: '555-0100' }]
    };
    await firstValueFrom(validation.validateAll(validProfile, 'StateProfile', { showAllErrors: true }));
    expect(validProfile.validationResults ?? []).toEqual([]);

    validation.replacePolicy('StateProfileEnterprise', new EnterpriseStateProfilePolicy(1, 1));
    await firstValueFrom(validation.validateAll(validProfile, 'StateProfileEnterprise', { showAllErrors: true }));
    expect(validProfile.validationResults ?? []).toEqual([]);
  });

  it('validates Reactive Forms account data including numeric ranges', async () => {
    const account: any = { ...createInitialReactiveAccount(), workEmail: 'bad', seatCount: 501 };
    await firstValueFrom(validation.validateAll(account, 'ReactiveAccount', { showAllErrors: true }));
    expect(account.validationResults.map((result: any) => result.propertyName)).toContain('displayName');
    expect(account.validationResults.map((result: any) => result.propertyName)).toContain('company.legalName');
    expect(account.validationResults.map((result: any) => result.propertyName)).toContain('contacts.0.email');
    expect(account.validationResults.map((result: any) => result.propertyName)).toContain('departments.0.budget');

    const validAccount: any = {
      ...createInitialReactiveAccount(),
      displayName: 'Team', workEmail: 'team@example.com', seatCount: 20,
      company: { legalName: 'Example Inc', country: 'US', region: 'MA' },
      contacts: [{ name: 'Ada', email: 'ada@example.com' }],
      departments: [{ name: 'Engineering', budget: 100000 }]
    };
    await firstValueFrom(validation.validateAll(validAccount, 'ReactiveAccount', { showAllErrors: true }));
    expect(validAccount.validationResults ?? []).toEqual([]);
  });

  it('exposes policy classes as reusable policy objects', () => {
    expect(new StateProfilePolicy().addValidations(validation.validatorHelper).length).toBe(13);
    expect(new EnterpriseStateProfilePolicy().addValidations(validation.validatorHelper).length).toBe(18);
    expect(new ReactiveAccountPolicy().addValidations(validation.validatorHelper).length).toBe(10);
    expect(new StateProfilePolicy(2, 2).addValidations(validation.validatorHelper).length).toBe(18);
    expect(new ReactiveAccountPolicy(2, 3).addValidations(validation.validatorHelper).length).toBe(16);
  });
});
