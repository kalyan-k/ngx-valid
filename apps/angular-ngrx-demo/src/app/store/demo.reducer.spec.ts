import * as DemoActions from './demo.actions';
import { demoReducer } from './demo.reducer';
import {
  initialDemoState,
  initialReactiveAccount,
  initialStateProfile,
  validationLifecycle
} from './demo-state';
import {
  selectPureLifecycle,
  selectPureProfile,
  selectReactiveAccount,
  selectReactiveLifecycle
} from './demo.selectors';

describe('NgRx demo store', () => {
  it('moves pure state through editing, validating, invalid, valid, and reset', () => {
    const editing = demoReducer(initialDemoState, DemoActions.pureFieldChanged({ field: 'fullName', value: 'Ada' }));
    expect(editing.pureProfile.fullName).toBe('Ada');
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

  it('moves reactive-form state through draft, validation, and reset', () => {
    const account = { displayName: 'Ada', workEmail: 'ada@example.com', seatCount: 4 };
    const editing = demoReducer(initialDemoState, DemoActions.reactiveDraftChanged({ account }));
    expect(editing.reactiveAccount).toBe(account);
    expect(editing.reactiveLifecycle).toBe('editing');

    const validating = demoReducer(editing, DemoActions.reactiveValidationStarted());
    expect(validating.reactiveLifecycle).toBe('validating');
    const valid = demoReducer(validating, DemoActions.reactiveValidated({ account }));
    expect(valid.reactiveLifecycle).toBe('valid');

    const reset = demoReducer(valid, DemoActions.reactiveReset());
    expect(reset.reactiveAccount).toEqual(initialReactiveAccount);
    expect(reset.reactiveAccount).not.toBe(initialReactiveAccount);
  });

  it('projects every public selector and handles missing validation results', () => {
    expect(validationLifecycle(undefined)).toBe('valid');
    expect(selectPureProfile.projector(initialDemoState)).toBe(initialDemoState.pureProfile);
    expect(selectPureLifecycle.projector(initialDemoState)).toBe('editing');
    expect(selectReactiveAccount.projector(initialDemoState)).toBe(initialDemoState.reactiveAccount);
    expect(selectReactiveLifecycle.projector(initialDemoState)).toBe('editing');
  });
});
