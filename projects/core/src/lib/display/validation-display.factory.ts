import { ValidationDisplayConfig, ValidationDisplayStrategy } from '../interfaces/validation-display.interface';
import { BootstrapValidationDisplayStrategy } from '../strategies/bootstrap-validation-display.strategy';
import { DefaultValidationDisplayStrategy } from '../strategies/default-validation-display.strategy';
import { GenericValidationDisplayStrategy } from '../strategies/generic-validation-display.strategy';
import { MaterialValidationDisplayStrategy } from '../strategies/material-validation-display.strategy';
import { TailwindValidationDisplayStrategy } from '../strategies/tailwind-validation-display.strategy';
import { resolvePreset, resolveValidationDisplayConfig } from './validation-display.config-resolver';

export function createValidationDisplayStrategy(
  config: ValidationDisplayConfig | null
): ValidationDisplayStrategy {
  const resolved = resolveValidationDisplayConfig(config ?? {});

  if (resolved.strategy) {
    return resolved.strategy;
  }

  const preset = resolvePreset(resolved);

  switch (preset) {
    case 'bootstrap':
      return new BootstrapValidationDisplayStrategy(resolved);
    case 'material':
      return new MaterialValidationDisplayStrategy(resolved);
    case 'tailwind':
      return new TailwindValidationDisplayStrategy(resolved);
    case 'generic':
      return new GenericValidationDisplayStrategy(resolved);
    case 'auto':
    default:
      return new DefaultValidationDisplayStrategy(resolved);
  }
}
