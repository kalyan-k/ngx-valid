import type { FormGroupStatus, ValidationModel, ValidationResult } from '@validation-rules/angular';

export type ValidationLifecycle = 'editing' | 'validating' | 'valid' | 'invalid';
export type StateProfileField = 'firstName' | 'lastName' | 'email' | 'phone' | 'role';
export type StatePolicyName = 'StateProfile' | 'StateProfileEnterprise';

export interface ContactAddress {
  label: string;
  street: string;
  city: string;
  country: string;
  region: string;
  postalCode: string;
}

export interface PhoneNumber {
  type: string;
  value: string;
}

export interface StateProfile extends ValidationModel {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: string;
  primaryAddress: ContactAddress;
  addresses: ContactAddress[];
  phoneNumbers: PhoneNumber[];
  selectedPolicy: StatePolicyName;
  identityGroup?: FormGroupStatus;
  addressGroup?: FormGroupStatus;
  contactGroup?: FormGroupStatus;
  validationResults?: ValidationResult[];
}

export interface CompanyProfile {
  legalName: string;
  country: string;
  region: string;
}

export interface EnterpriseContact {
  name: string;
  email: string;
}

export interface DepartmentBudget {
  name: string;
  budget: number;
}

export interface ReactiveAccount extends ValidationModel {
  displayName: string;
  workEmail: string;
  seatCount: number;
  company: CompanyProfile;
  contacts: EnterpriseContact[];
  departments: DepartmentBudget[];
  organizationGroup?: FormGroupStatus;
  contactsGroup?: FormGroupStatus;
  departmentsGroup?: FormGroupStatus;
  validationResults?: ValidationResult[];
}

export interface DemoFeatureState {
  pureProfile: StateProfile;
  pureLifecycle: ValidationLifecycle;
  reactiveAccount: ReactiveAccount;
  reactiveLifecycle: ValidationLifecycle;
  reactiveSavedAt?: string;
}

export function emptyAddress(label = 'Additional address'): ContactAddress {
  return { label, street: '', city: '', country: '', region: '', postalCode: '' };
}

export function createInitialStateProfile(): StateProfile {
  return {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    role: '',
    primaryAddress: emptyAddress('Primary address'),
    addresses: [emptyAddress()],
    phoneNumbers: [{ type: 'mobile', value: '' }],
    selectedPolicy: 'StateProfile'
  };
}

export function createInitialReactiveAccount(): ReactiveAccount {
  return {
    displayName: '',
    workEmail: '',
    seatCount: 1,
    company: { legalName: '', country: '', region: '' },
    contacts: [{ name: '', email: '' }],
    departments: [{ name: '', budget: 0 }]
  };
}

export const initialStateProfile = createInitialStateProfile();
export const initialReactiveAccount = createInitialReactiveAccount();

export const initialDemoState: DemoFeatureState = {
  pureProfile: initialStateProfile,
  pureLifecycle: 'editing',
  reactiveAccount: initialReactiveAccount,
  reactiveLifecycle: 'editing',
  reactiveSavedAt: undefined
};

export function validationLifecycle(results: ValidationResult[] | undefined): ValidationLifecycle {
  return results && results.length > 0 ? 'invalid' : 'valid';
}
