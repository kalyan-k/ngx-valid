import { createContext, useContext, useMemo, useRef, type PropsWithChildren } from 'react';
import { ValidationEngine } from '../engine/validation-engine';
import type { ValidationRulesConfiguration } from '../types';

export interface ValidationRulesContextValue {
  engine: ValidationEngine;
  configuration: Readonly<Required<ValidationRulesConfiguration>>;
}

export interface ValidationRulesProviderProps extends PropsWithChildren {
  engine?: ValidationEngine;
  configuration?: ValidationRulesConfiguration;
}

const ValidationRulesContext = createContext<ValidationRulesContextValue | null>(null);

export function ValidationRulesProvider({
  children,
  engine,
  configuration
}: ValidationRulesProviderProps) {
  const ownedEngine = useRef<ValidationEngine | null>(null);
  ownedEngine.current ??= new ValidationEngine();
  const selectedEngine = engine ?? ownedEngine.current;
  const validateOnBlur = configuration?.validateOnBlur ?? true;
  const validateOnChange = configuration?.validateOnChange ?? false;
  const value = useMemo<ValidationRulesContextValue>(() => ({
    engine: selectedEngine,
    configuration: { validateOnBlur, validateOnChange }
  }), [selectedEngine, validateOnBlur, validateOnChange]);

  return <ValidationRulesContext.Provider value={value}>{children}</ValidationRulesContext.Provider>;
}

export function useValidationRulesContext(): ValidationRulesContextValue {
  const value = useContext(ValidationRulesContext);
  if (!value) {
    throw new Error('useValidationRulesContext must be used within a ValidationRulesProvider');
  }
  return value;
}
