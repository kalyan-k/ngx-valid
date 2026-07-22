import * as DemoActions from './demo.actions';
import { demoReducer } from './demo.reducer';
import {
  createInitialReactiveAccount,
  createInitialStateProfile,
  initialDemoState,
  initialReactiveAccount,
  initialStateProfile,
  validationLifecycle
} from './demo-state';
import {
  selectPureLifecycle,
  selectPureProfile,
  selectReactiveAccount,
  selectReactiveLifecycle,
  selectReactiveSavedAt
} from './demo.selectors';

describe('NgRx demo store', () => {
  it('moves pure state through editing, validating, invalid, valid, and reset', () => {
    const editing = demoReducer(initialDemoState, DemoActions.pureFieldChanged({ field: 'firstName', value: 'Ada' }));
    expect(editing.pureProfile.firstName).toBe('Ada');
    expect(editing.pureLifecycle).toBe('editing');

    const validating = demoReducer(editing, DemoActions.pureValidationStarted());
    expect(validating.pureLifecycle).toBe('validating');

    const invalidProfile = {
      ...validating.pureProfile,
      validationResults: [{ propertyName: 'email', error: { message: 'Email required' } }]
    };
    const invalid = demoReducer(validating, DemoActions.pureValidated({ profile: invalidProfile }));
    expect(invalid.pureLifecycle).toBe('invalid');

    const valid = demoReducer(invalid, DemoActions.pureValidated({ profile: { ...invalidProfile, validationResults: [] } }));
    expect(valid.pureLifecycle).toBe('valid');

    const reset = demoReducer(valid, DemoActions.pureReset());
    expect(reset.pureProfile).toEqual(initialStateProfile);
    expect(reset.pureProfile).not.toBe(initialStateProfile);
  });

  it('updates nested addresses, dynamic collections, phones, and policy selection immutably', () => {
    const primary = demoReducer(initialDemoState, DemoActions.purePrimaryAddressChanged({ field: 'city', value: 'Boston' }));
    expect(primary.pureProfile.primaryAddress.city).toBe('Boston');
    expect(primary.pureProfile.primaryAddress).not.toBe(initialDemoState.pureProfile.primaryAddress);

    const addressAdded = demoReducer(primary, DemoActions.pureAddressAdded());
    expect(addressAdded.pureProfile.addresses.length).toBe(2);
    const addressEdited = demoReducer(addressAdded, DemoActions.pureAdditionalAddressChanged({ index: 1, field: 'street', value: '1 Main St' }));
    expect(addressEdited.pureProfile.addresses[1].street).toBe('1 Main St');
    const addressRemoved = demoReducer(addressEdited, DemoActions.pureAddressRemoved({ index: 0 }));
    expect(addressRemoved.pureProfile.addresses).toEqual([jasmine.objectContaining({ street: '1 Main St' })]);

    const phoneAdded = demoReducer(addressRemoved, DemoActions.purePhoneAdded());
    const phoneEdited = demoReducer(phoneAdded, DemoActions.purePhoneChanged({ index: 1, field: 'value', value: '555-0100' }));
    expect(phoneEdited.pureProfile.phoneNumbers[1].value).toBe('555-0100');
    const phoneRemoved = demoReducer(phoneEdited, DemoActions.purePhoneRemoved({ index: 0 }));
    expect(phoneRemoved.pureProfile.phoneNumbers.length).toBe(1);

    const enterprise = demoReducer(phoneRemoved, DemoActions.purePolicyChanged({ policy: 'StateProfileEnterprise' }));
    expect(enterprise.pureProfile.selectedPolicy).toBe('StateProfileEnterprise');
    expect(enterprise.pureProfile.validationResults).toEqual([]);
  });

  it('moves reactive-form state through draft, validation, and reset', () => {
    const account = { ...createInitialReactiveAccount(), displayName: 'Ada', workEmail: 'ada@example.com', seatCount: 4 };
    const editing = demoReducer(initialDemoState, DemoActions.reactiveDraftChanged({ account }));
    expect(editing.reactiveAccount).toBe(account);
    expect(editing.reactiveLifecycle).toBe('editing');

    const validating = demoReducer(editing, DemoActions.reactiveValidationStarted());
    expect(validating.reactiveLifecycle).toBe('validating');
    const valid = demoReducer(validating, DemoActions.reactiveValidated({ account }));
    expect(valid.reactiveLifecycle).toBe('valid');

    const saved = demoReducer(valid, DemoActions.reactiveSaved({ savedAt: '2026-07-20T12:00:00.000Z' }));
    expect(saved.reactiveSavedAt).toBe('2026-07-20T12:00:00.000Z');

    const reset = demoReducer(saved, DemoActions.reactiveReset());
    expect(reset.reactiveAccount).toEqual(initialReactiveAccount);
    expect(reset.reactiveAccount).not.toBe(initialReactiveAccount);
    expect(reset.reactiveSavedAt).toBeUndefined();
  });

  it('creates independent initial models for safe resets', () => {
    const firstProfile = createInitialStateProfile();
    const secondProfile = createInitialStateProfile();
    firstProfile.addresses[0].city = 'Changed';
    expect(secondProfile.addresses[0].city).toBe('');

    const firstAccount = createInitialReactiveAccount();
    const secondAccount = createInitialReactiveAccount();
    firstAccount.contacts[0].name = 'Changed';
    expect(secondAccount.contacts[0].name).toBe('');
  });

  it('projects every public selector and handles missing validation results', () => {
    expect(validationLifecycle(undefined)).toBe('valid');
    expect(selectPureProfile.projector(initialDemoState)).toBe(initialDemoState.pureProfile);
    expect(selectPureLifecycle.projector(initialDemoState)).toBe('editing');
    expect(selectReactiveAccount.projector(initialDemoState)).toBe(initialDemoState.reactiveAccount);
    expect(selectReactiveLifecycle.projector(initialDemoState)).toBe('editing');
    expect(selectReactiveSavedAt.projector(initialDemoState)).toBeUndefined();
  });
});
