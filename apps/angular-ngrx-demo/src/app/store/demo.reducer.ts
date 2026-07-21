import { createReducer, on } from '@ngrx/store';
import * as DemoActions from './demo.actions';
import { initialDemoState, initialReactiveAccount, initialStateProfile, validationLifecycle } from './demo-state';

export const demoFeatureKey = 'validationDemo';

export const demoReducer = createReducer(
  initialDemoState,
  on(DemoActions.pureFieldChanged, (state, { field, value }) => ({
    ...state,
    pureLifecycle: 'editing' as const,
    pureProfile: { ...state.pureProfile, [field]: value }
  })),
  on(DemoActions.pureValidationStarted, (state) => ({ ...state, pureLifecycle: 'validating' as const })),
  on(DemoActions.pureValidated, (state, { profile }) => ({ ...state, pureProfile: profile, pureLifecycle: validationLifecycle(profile.validationResults) })),
  on(DemoActions.pureReset, (state) => ({ ...state, pureProfile: { ...initialStateProfile }, pureLifecycle: 'editing' as const })),
  on(DemoActions.reactiveDraftChanged, (state, { account }) => ({ ...state, reactiveAccount: account, reactiveLifecycle: 'editing' as const })),
  on(DemoActions.reactiveValidationStarted, (state) => ({ ...state, reactiveLifecycle: 'validating' as const })),
  on(DemoActions.reactiveValidated, (state, { account }) => ({ ...state, reactiveAccount: account, reactiveLifecycle: validationLifecycle(account.validationResults) })),
  on(DemoActions.reactiveReset, (state) => ({ ...state, reactiveAccount: { ...initialReactiveAccount }, reactiveLifecycle: 'editing' as const }))
);
