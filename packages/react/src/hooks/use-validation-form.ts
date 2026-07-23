import { useCallback, useMemo, useRef, useState, type FormEvent } from 'react';
import { useValidationRulesContext } from '../context/validation-rules-context';
import type {
  UseValidationFormOptions,
  ValidationSnapshot,
  ValidationSubmitHandler,
  ValidationTarget
} from '../types';
import { setPropertyValue } from '../utilities/paths';
import { useValidationRules, type UseValidationRulesResult } from './use-validation-rules';

export interface UseValidationFormResult<TModel extends ValidationTarget>
  extends UseValidationRulesResult<TModel> {
  dirtyFields: ReadonlySet<string>;
  setFieldValue(propertyPath: string, value: unknown, validate?: boolean): Promise<ValidationSnapshot | undefined>;
  setModel(model: TModel): void;
  touchField(propertyPath: string): void;
  reset(nextModel?: TModel): void;
  handleSubmit(
    onValid: ValidationSubmitHandler<TModel>,
    onInvalid?: ValidationSubmitHandler<TModel>
  ): (event: FormEvent<HTMLFormElement>) => Promise<void>;
}

export function useValidationForm<TModel extends ValidationTarget>(
  options: UseValidationFormOptions<TModel>
): UseValidationFormResult<TModel> {
  const { engine } = useValidationRulesContext();
  const initialModel = useRef<TModel | null>(null);
  initialModel.current ??= cloneModel(typeof options.initialModel === 'function' ? options.initialModel() : options.initialModel);
  const [model, updateModel] = useState<TModel>(() => cloneModel(initialModel.current as TModel));
  const [dirtyFields, setDirtyFields] = useState<ReadonlySet<string>>(() => new Set());
  const optionsRef = useRef(options);
  optionsRef.current = options;
  const validation = useValidationRules({ ...options, model });

  const setFieldValue = useCallback(async (propertyPath: string, value: unknown, validate = false) => {
    const nextModel = setPropertyValue(model, propertyPath, value) as TModel;
    updateModel(nextModel);
    setDirtyFields((current) => new Set(current).add(propertyPath));
    if (validate) return engine.validateField(nextModel, propertyPath, optionsRef.current.policyNames);
    return undefined;
  }, [engine, model]);

  const setModel = useCallback((nextModel: TModel) => {
    updateModel(nextModel);
    engine.notify(nextModel);
  }, [engine]);

  const touchField = useCallback((propertyPath: string) => engine.touch(model, propertyPath), [engine, model]);

  const reset = useCallback((nextModel?: TModel) => {
    engine.clear(model);
    updateModel(cloneModel(nextModel ?? initialModel.current as TModel));
    setDirtyFields(new Set());
  }, [engine, model]);

  const handleSubmit = useCallback((
    onValid: ValidationSubmitHandler<TModel>,
    onInvalid?: ValidationSubmitHandler<TModel>
  ) => async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const snapshot = await engine.validate(model, optionsRef.current.policyNames, { showAllErrors: true });
    if (snapshot.isValid) await onValid(model, snapshot);
    else await onInvalid?.(model, snapshot);
  }, [engine, model]);

  return useMemo(() => ({
    ...validation,
    dirtyFields,
    setFieldValue,
    setModel,
    touchField,
    reset,
    handleSubmit
  }), [validation, dirtyFields, setFieldValue, setModel, touchField, reset, handleSubmit]);
}

function cloneModel<TModel extends ValidationTarget>(model: TModel): TModel {
  if (typeof structuredClone === 'function') return structuredClone(model);
  return JSON.parse(JSON.stringify(model)) as TModel;
}
