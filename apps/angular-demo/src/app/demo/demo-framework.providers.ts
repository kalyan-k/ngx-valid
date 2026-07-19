import { Provider } from '@angular/core';
import {
  provideBootstrapValidationDisplay,
  provideMaterialValidationDisplay,
  provideTailwindValidationDisplay
} from '@validation-rules/angular';
import { DemoFramework } from './demo-framework.model';

export function provideDemoFrameworkDisplay(framework: DemoFramework): Provider[] {
  switch (framework) {
    case 'material':
      return provideMaterialValidationDisplay();
    case 'tailwind':
      return provideTailwindValidationDisplay();
    default:
      return provideBootstrapValidationDisplay();
  }
}
