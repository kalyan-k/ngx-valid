import { createAction, props } from '@ngrx/store';
import type { ReactiveAccount, StateProfile, StateProfileField } from './demo-state';

export const pureFieldChanged = createAction('[Pure State] Field Changed', props<{ field: StateProfileField; value: string }>());
export const pureValidationStarted = createAction('[Pure State] Validation Started');
export const pureValidated = createAction('[Pure State] Validated', props<{ profile: StateProfile }>());
export const pureReset = createAction('[Pure State] Reset');

export const reactiveDraftChanged = createAction('[Reactive Form] Draft Changed', props<{ account: ReactiveAccount }>());
export const reactiveValidationStarted = createAction('[Reactive Form] Validation Started');
export const reactiveValidated = createAction('[Reactive Form] Validated', props<{ account: ReactiveAccount }>());
export const reactiveReset = createAction('[Reactive Form] Reset');
