import { render, type RenderOptions } from '@testing-library/react';
import type { ReactElement } from 'react';
import {
  ValidationRulesProvider,
  type ValidationRulesProviderProps
} from '../context/validation-rules-context';

export interface RenderWithValidationOptions extends Omit<RenderOptions, 'wrapper'> {
  providerProps?: Omit<ValidationRulesProviderProps, 'children'>;
}

export function renderWithValidation(
  ui: ReactElement,
  { providerProps, ...options }: RenderWithValidationOptions = {}
) {
  return render(ui, {
    wrapper: ({ children }) => (
      <ValidationRulesProvider {...providerProps}>{children}</ValidationRulesProvider>
    ),
    ...options
  });
}
