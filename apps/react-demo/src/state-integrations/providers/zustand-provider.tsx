import { useMemo, useState } from 'react';
import { createStore } from 'zustand/vanilla';
import { useStore } from 'zustand';
import type { ValidationTarget } from '@validation-rules/react';
import { cloneModel, countPopulatedValues, DemoStateContext, type StateProviderProps } from '../types';

interface ZustandDemoState {
  model: ValidationTarget;
  revision: number;
  replaceModel(nextModel: ValidationTarget): void;
  resetModel(nextModel: ValidationTarget): void;
}

function createDemoStore(initialModel: ValidationTarget) {
  return createStore<ZustandDemoState>((set) => ({
    model: cloneModel(initialModel),
    revision: 0,
    replaceModel: (model) => set((state) => ({ model, revision: state.revision + 1 })),
    resetModel: (model) => set((state) => ({ model: cloneModel(model), revision: state.revision + 1 }))
  }));
}

export function ZustandProvider({ initialModel, children }: StateProviderProps) {
  const [store] = useState(() => createDemoStore(initialModel));
  const model = useStore(store, (state) => state.model);
  const revision = useStore(store, (state) => state.revision);
  const replaceModel = useStore(store, (state) => state.replaceModel);
  const resetModel = useStore(store, (state) => state.resetModel);
  const value = useMemo(() => ({
    model,
    revision,
    populatedValues: countPopulatedValues(model),
    setModel: replaceModel,
    reset: resetModel
  }), [model, replaceModel, resetModel, revision]);
  return <DemoStateContext.Provider value={value}>{children}</DemoStateContext.Provider>;
}
