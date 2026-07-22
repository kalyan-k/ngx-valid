import { createReducer, on } from '@ngrx/store';
import * as DemoActions from './demo.actions';
import { createInitialReactiveAccount, createInitialStateProfile, emptyAddress, initialDemoState, validationLifecycle } from './demo-state';

export const demoFeatureKey = 'validationDemo';

export const demoReducer = createReducer(
  initialDemoState,
  on(DemoActions.pureFieldChanged, (state, { field, value }) => ({
    ...state,
    pureLifecycle: 'editing' as const,
    pureProfile: { ...state.pureProfile, [field]: value }
  })),
  on(DemoActions.purePrimaryAddressChanged, (state, { field, value }) => ({
    ...state,
    pureLifecycle: 'editing' as const,
    pureProfile: { ...state.pureProfile, primaryAddress: { ...state.pureProfile.primaryAddress, [field]: value } }
  })),
  on(DemoActions.pureAdditionalAddressChanged, (state, { index, field, value }) => ({
    ...state,
    pureLifecycle: 'editing' as const,
    pureProfile: {
      ...state.pureProfile,
      addresses: state.pureProfile.addresses.map((address, currentIndex) => currentIndex === index ? { ...address, [field]: value } : address)
    }
  })),
  on(DemoActions.pureAddressAdded, (state) => ({
    ...state,
    pureLifecycle: 'editing' as const,
    pureProfile: { ...state.pureProfile, addresses: [...state.pureProfile.addresses, emptyAddress(`Address ${state.pureProfile.addresses.length + 2}`)] }
  })),
  on(DemoActions.pureAddressRemoved, (state, { index }) => ({
    ...state,
    pureLifecycle: 'editing' as const,
    pureProfile: { ...state.pureProfile, addresses: state.pureProfile.addresses.filter((_, currentIndex) => currentIndex !== index) }
  })),
  on(DemoActions.purePhoneChanged, (state, { index, field, value }) => ({
    ...state,
    pureLifecycle: 'editing' as const,
    pureProfile: {
      ...state.pureProfile,
      phoneNumbers: state.pureProfile.phoneNumbers.map((phone, currentIndex) => currentIndex === index ? { ...phone, [field]: value } : phone)
    }
  })),
  on(DemoActions.purePhoneAdded, (state) => ({
    ...state,
    pureLifecycle: 'editing' as const,
    pureProfile: { ...state.pureProfile, phoneNumbers: [...state.pureProfile.phoneNumbers, { type: 'mobile', value: '' }] }
  })),
  on(DemoActions.purePhoneRemoved, (state, { index }) => ({
    ...state,
    pureLifecycle: 'editing' as const,
    pureProfile: { ...state.pureProfile, phoneNumbers: state.pureProfile.phoneNumbers.filter((_, currentIndex) => currentIndex !== index) }
  })),
  on(DemoActions.purePolicyChanged, (state, { policy }) => ({
    ...state,
    pureLifecycle: 'editing' as const,
    pureProfile: { ...state.pureProfile, selectedPolicy: policy, validationResults: [] }
  })),
  on(DemoActions.pureValidationStarted, (state) => ({ ...state, pureLifecycle: 'validating' as const })),
  on(DemoActions.pureValidated, (state, { profile }) => ({ ...state, pureProfile: profile, pureLifecycle: validationLifecycle(profile.validationResults) })),
  on(DemoActions.pureReset, (state) => ({ ...state, pureProfile: createInitialStateProfile(), pureLifecycle: 'editing' as const })),
  on(DemoActions.reactiveDraftChanged, (state, { account }) => ({ ...state, reactiveAccount: account, reactiveLifecycle: 'editing' as const })),
  on(DemoActions.reactiveValidationStarted, (state) => ({ ...state, reactiveLifecycle: 'validating' as const })),
  on(DemoActions.reactiveValidated, (state, { account }) => ({ ...state, reactiveAccount: account, reactiveLifecycle: validationLifecycle(account.validationResults) })),
  on(DemoActions.reactiveSaved, (state, { savedAt }) => ({ ...state, reactiveSavedAt: savedAt })),
  on(DemoActions.reactiveReset, (state) => ({ ...state, reactiveAccount: createInitialReactiveAccount(), reactiveLifecycle: 'editing' as const, reactiveSavedAt: undefined }))
);
