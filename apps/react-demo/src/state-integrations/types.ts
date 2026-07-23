import { createContext, useContext, type ComponentType, type PropsWithChildren } from 'react';
import type { ValidationTarget } from '@validation-rules/react';

export const strategyIds = [
  'local-state',
  'redux-toolkit',
  'zustand',
  'jotai',
  'recoil',
  'mobx',
  'context'
] as const;

export type StrategyId = typeof strategyIds[number];
export type StateDemoPage = 'home' | 'simple' | 'complex' | 'performance';

export interface StateProviderProps extends PropsWithChildren {
  initialModel: ValidationTarget;
}

export interface DemoStateValue<TModel extends ValidationTarget = ValidationTarget> {
  model: TModel;
  revision: number;
  populatedValues: number;
  setModel(nextModel: TModel): void;
  reset(nextModel: TModel): void;
}

export interface StrategyDefinition {
  id: StrategyId;
  label: string;
  shortDescription: string;
  architecture: string;
  primitives: readonly string[];
  Provider: ComponentType<StateProviderProps>;
}

export const DemoStateContext = createContext<DemoStateValue | null>(null);

export function useDemoState<TModel extends ValidationTarget>(): DemoStateValue<TModel> {
  const value = useContext(DemoStateContext);
  if (!value) throw new Error('State-managed demo pages must be rendered inside a strategy provider.');
  return value as DemoStateValue<TModel>;
}

export function countPopulatedValues(value: unknown): number {
  if (Array.isArray(value)) return value.reduce<number>((total, item) => total + countPopulatedValues(item), 0);
  if (value && typeof value === 'object') {
    return Object.values(value as Record<string, unknown>)
      .reduce<number>((total, item) => total + countPopulatedValues(item), 0);
  }
  return value === true || (typeof value === 'string' && value.trim().length > 0) || typeof value === 'number' ? 1 : 0;
}

export function cloneModel<TModel extends ValidationTarget>(model: TModel): TModel {
  return typeof structuredClone === 'function'
    ? structuredClone(model)
    : JSON.parse(JSON.stringify(model)) as TModel;
}
