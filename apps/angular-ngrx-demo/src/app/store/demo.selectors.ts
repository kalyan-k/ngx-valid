import { createFeatureSelector, createSelector } from '@ngrx/store';
import { demoFeatureKey } from './demo.reducer';
import type { DemoFeatureState } from './demo-state';

export const selectDemoFeature = createFeatureSelector<DemoFeatureState>(demoFeatureKey);
export const selectPureProfile = createSelector(selectDemoFeature, ({ pureProfile }) => pureProfile);
export const selectPureLifecycle = createSelector(selectDemoFeature, ({ pureLifecycle }) => pureLifecycle);
export const selectReactiveAccount = createSelector(selectDemoFeature, ({ reactiveAccount }) => reactiveAccount);
export const selectReactiveLifecycle = createSelector(selectDemoFeature, ({ reactiveLifecycle }) => reactiveLifecycle);
