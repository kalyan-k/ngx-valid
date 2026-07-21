import { firstValueFrom } from 'rxjs';
import { ValidationProviderService } from '@validation-rules/angular';
import { ReactiveAccountPolicy, StateProfilePolicy } from './demo-validation.policy';
import { demoValidationProviders, registerDemoPolicies } from './validation.providers';

describe('NgRx demo validation policies', () => {
  let validation: ValidationProviderService;

  beforeEach(() => {
    validation = new ValidationProviderService();
    registerDemoPolicies(validation)();
  });

  it('registers both policies through the application initializer', () => {
    expect(validation.hasPolicy('StateProfile')).toBeTrue();
    expect(validation.hasPolicy('ReactiveAccount')).toBeTrue();
    expect(demoValidationProviders[0].multi).toBeTrue();
  });

  it('validates pure NgRx profile data without an Angular form', async () => {
    const profile: any = { fullName: '', email: 'not-an-email', role: '' };
    await firstValueFrom(validation.validateAll(profile, 'StateProfile', { showAllErrors: true }));
    expect(profile.validationResults.map((result: any) => result.propertyName)).toEqual(['fullName', 'email', 'role']);

    const validProfile: any = { fullName: 'Ada Lovelace', email: 'ada@example.com', role: 'admin' };
    await firstValueFrom(validation.validateAll(validProfile, 'StateProfile', { showAllErrors: true }));
    expect(validProfile.validationResults ?? []).toEqual([]);
  });

  it('validates Reactive Forms account data including numeric ranges', async () => {
    const account: any = { displayName: '', workEmail: 'bad', seatCount: 501 };
    await firstValueFrom(validation.validateAll(account, 'ReactiveAccount', { showAllErrors: true }));
    expect(account.validationResults.map((result: any) => result.propertyName)).toEqual(['displayName', 'workEmail', 'seatCount']);

    const validAccount: any = { displayName: 'Team', workEmail: 'team@example.com', seatCount: 20 };
    await firstValueFrom(validation.validateAll(validAccount, 'ReactiveAccount', { showAllErrors: true }));
    expect(validAccount.validationResults ?? []).toEqual([]);
  });

  it('exposes policy classes as reusable policy objects', () => {
    expect(new StateProfilePolicy().addValidations(validation.validatorHelper).length).toBe(3);
    expect(new ReactiveAccountPolicy().addValidations(validation.validatorHelper).length).toBe(3);
  });
});
