import { useCallback, useEffect, useRef, useSyncExternalStore } from 'react';
import { useValidationRulesContext } from '../context/validation-rules-context';
import type {
  UseValidationRulesOptions,
  ValidateOptions,
  ValidationSnapshot,
  ValidationTarget
} from '../types';

export interface UseValidationRulesResult<TModel extends ValidationTarget> extends ValidationSnapshot {
  model: TModel;
  validate(options?: ValidateOptions): Promise<ValidationSnapshot>;
  validateField(propertyPath: string): Promise<ValidationSnapshot>;
  validateGroup(groupName: string): Promise<ValidationSnapshot>;
  getFieldErrors(propertyPath: string): ValidationSnapshot['errors'];
  clear(propertyPaths?: string[]): void;
  touch(propertyPath: string): void;
}

export function useValidationRules<TModel extends ValidationTarget>(
  options: UseValidationRulesOptions<TModel>
): UseValidationRulesResult<TModel> {
  const { engine } = useValidationRulesContext();
  const optionsRef = useRef(options);
  optionsRef.current = options;
  const policyNamesSignature = (options.policyNames ?? []).join('\u0000');

  useEffect(() => {
    const cleanups = (optionsRef.current.policies ?? [])
      .map(({ name, policy }) => engine.registerPolicy(name, policy));
    return () => cleanups.reverse().forEach((cleanup) => cleanup());
  }, [engine, options.policies]);

  useEffect(() => {
    const cleanups = (optionsRef.current.groups ?? []).map((group) => engine.registerGroup(group));
    return () => cleanups.reverse().forEach((cleanup) => cleanup());
  }, [engine, options.groups]);

  const subscribe = useCallback((listener: () => void) => engine.subscribe(options.model, listener), [engine, options.model]);
  const getRevision = useCallback(() => engine.getRevision(options.model), [engine, options.model]);
  useSyncExternalStore(subscribe, getRevision, getRevision);

  const validate = useCallback(
    (validateOptions?: ValidateOptions) => engine.validate(
      optionsRef.current.model,
      optionsRef.current.policyNames,
      validateOptions
    ),
    [engine, policyNamesSignature]
  );
  const validateField = useCallback(
    (propertyPath: string) => engine.validateField(
      optionsRef.current.model,
      propertyPath,
      optionsRef.current.policyNames
    ),
    [engine, policyNamesSignature]
  );
  const validateGroup = useCallback(
    (groupName: string) => engine.validateGroup(optionsRef.current.model, groupName),
    [engine]
  );
  const getFieldErrors = useCallback(
    (propertyPath: string) => engine.getErrors(options.model, propertyPath),
    [engine, options.model]
  );
  const clear = useCallback(
    (propertyPaths?: string[]) => engine.clear(optionsRef.current.model, propertyPaths),
    [engine]
  );
  const touch = useCallback(
    (propertyPath: string) => engine.touch(optionsRef.current.model, propertyPath),
    [engine]
  );

  return {
    model: options.model,
    ...engine.getSnapshot(options.model),
    validate,
    validateField,
    validateGroup,
    getFieldErrors,
    clear,
    touch
  };
}
