import type { ValidationModel, ValidationResult } from '@validation-rules/angular';

export type ValidationLifecycle = 'editing' | 'validating' | 'valid' | 'invalid';
export type StateProfileField = 'fullName' | 'email' | 'role';

export interface StateProfile extends ValidationModel {
  fullName: string;
  email: string;
  role: string;
  validationResults?: ValidationResult[];
}

export interface ReactiveAccount extends ValidationModel {
  displayName: string;
  workEmail: string;
  seatCount: number;
  validationResults?: ValidationResult[];
}

export interface DemoFeatureState {
  pureProfile: StateProfile;
  pureLifecycle: ValidationLifecycle;
  reactiveAccount: ReactiveAccount;
  reactiveLifecycle: ValidationLifecycle;
}

export const initialStateProfile: StateProfile = { fullName: '', email: '', role: '' };
export const initialReactiveAccount: ReactiveAccount = { displayName: '', workEmail: '', seatCount: 1 };

export const initialDemoState: DemoFeatureState = {
  pureProfile: initialStateProfile,
  pureLifecycle: 'editing',
  reactiveAccount: initialReactiveAccount,
  reactiveLifecycle: 'editing'
};

export function validationLifecycle(results: ValidationResult[] | undefined): ValidationLifecycle {
  return results && results.length > 0 ? 'invalid' : 'valid';
}
