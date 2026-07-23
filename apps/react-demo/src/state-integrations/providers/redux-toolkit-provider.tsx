import { useMemo, useState, type PropsWithChildren } from 'react';
import { configureStore, createSelector, createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { Provider, useDispatch, useSelector } from 'react-redux';
import type { ValidationTarget } from '@validation-rules/react';
import { cloneModel, countPopulatedValues, DemoStateContext, type StateProviderProps } from '../types';

interface DemoSliceState { serializedModel: string; revision: number; }
interface DemoRootState { validationDemo: DemoSliceState; }

function createDemoStore(initialModel: ValidationTarget) {
  const slice = createSlice({
    name: 'validationDemo',
    initialState: { serializedModel: JSON.stringify(cloneModel(initialModel)), revision: 0 } satisfies DemoSliceState,
    reducers: {
      modelReplaced(state, action: PayloadAction<ValidationTarget>) {
        state.serializedModel = JSON.stringify(action.payload);
        state.revision += 1;
      },
      modelReset(state, action: PayloadAction<ValidationTarget>) {
        state.serializedModel = JSON.stringify(cloneModel(action.payload));
        state.revision += 1;
      }
    }
  });
  const store = configureStore({ reducer: { validationDemo: slice.reducer } });
  return { store, actions: slice.actions };
}

const selectDemoState = (state: DemoRootState) => state.validationDemo;
const selectModel = createSelector(
  [selectDemoState],
  (state) => JSON.parse(state.serializedModel) as ValidationTarget
);
const selectRevision = createSelector([selectDemoState], (state) => state.revision);
const selectPopulatedValues = createSelector([selectModel], countPopulatedValues);

export function ReduxToolkitProvider({ initialModel, children }: StateProviderProps) {
  const [bundle] = useState(() => createDemoStore(initialModel));
  return <Provider store={bundle.store}><ReduxBridge actions={bundle.actions}>{children}</ReduxBridge></Provider>;
}

function ReduxBridge({ actions, children }: PropsWithChildren<{ actions: ReturnType<typeof createDemoStore>['actions'] }>) {
  const dispatch = useDispatch();
  const model = useSelector(selectModel);
  const revision = useSelector(selectRevision);
  const populatedValues = useSelector(selectPopulatedValues);
  const value = useMemo(() => ({
    model,
    revision,
    populatedValues,
    setModel: (nextModel: ValidationTarget) => dispatch(actions.modelReplaced(nextModel)),
    reset: (nextModel: ValidationTarget) => dispatch(actions.modelReset(nextModel))
  }), [actions, dispatch, model, populatedValues, revision]);
  return <DemoStateContext.Provider value={value}>{children}</DemoStateContext.Provider>;
}
