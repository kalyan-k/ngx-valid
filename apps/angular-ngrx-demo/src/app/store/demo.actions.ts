import { createAction, props } from '@ngrx/store';
import type { ContactAddress, PhoneNumber, ReactiveAccount, StatePolicyName, StateProfile, StateProfileField } from './demo-state';

export const pureFieldChanged = createAction('[Pure State] Field Changed', props<{ field: StateProfileField; value: string }>());
export const purePrimaryAddressChanged = createAction('[Pure State] Primary Address Changed', props<{ field: keyof ContactAddress; value: string }>());
export const pureAdditionalAddressChanged = createAction('[Pure State] Additional Address Changed', props<{ index: number; field: keyof ContactAddress; value: string }>());
export const pureAddressAdded = createAction('[Pure State] Address Added');
export const pureAddressRemoved = createAction('[Pure State] Address Removed', props<{ index: number }>());
export const purePhoneChanged = createAction('[Pure State] Phone Changed', props<{ index: number; field: keyof PhoneNumber; value: string }>());
export const purePhoneAdded = createAction('[Pure State] Phone Added');
export const purePhoneRemoved = createAction('[Pure State] Phone Removed', props<{ index: number }>());
export const purePolicyChanged = createAction('[Pure State] Policy Changed', props<{ policy: StatePolicyName }>());
export const pureValidationStarted = createAction('[Pure State] Validation Started');
export const pureValidated = createAction('[Pure State] Validated', props<{ profile: StateProfile }>());
export const pureReset = createAction('[Pure State] Reset');

export const reactiveDraftChanged = createAction('[Reactive Form] Draft Changed', props<{ account: ReactiveAccount }>());
export const reactiveValidationStarted = createAction('[Reactive Form] Validation Started');
export const reactiveValidated = createAction('[Reactive Form] Validated', props<{ account: ReactiveAccount }>());
export const reactiveSaved = createAction('[Reactive Form] Saved', props<{ savedAt: string }>());
export const reactiveReset = createAction('[Reactive Form] Reset');
