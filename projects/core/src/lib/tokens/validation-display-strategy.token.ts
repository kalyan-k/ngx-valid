import { InjectionToken } from '@angular/core';
import { ValidationDisplayStrategy } from '../interfaces/validation-display.interface';

export const VALIDATION_DISPLAY_STRATEGY = new InjectionToken<ValidationDisplayStrategy>(
  'VALIDATION_DISPLAY_STRATEGY'
);
