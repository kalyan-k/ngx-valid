import { InjectionToken } from '@angular/core';
import { ValidationDisplayConfig } from '../interfaces/validation-display.interface';

export const VALIDATION_DISPLAY_CONFIG = new InjectionToken<ValidationDisplayConfig>(
  'VALIDATION_DISPLAY_CONFIG'
);
