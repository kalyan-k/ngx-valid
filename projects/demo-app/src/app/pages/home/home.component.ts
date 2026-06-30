import { Component } from '@angular/core';
import { DEMO_FRAMEWORKS, DEMO_TABS } from '../../demo/demo-framework.model';

@Component({
  selector: 'app-home',
  standalone: false,
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.sass']
})
export class HomeComponent {
  readonly frameworks = DEMO_FRAMEWORKS;
  readonly demos = DEMO_TABS;

  readonly quickStart = [
  {
    step: 1,
    title: 'Register policies',
    detail: 'Map validation policies and form groups in an APP_INITIALIZER (see validation.providers.ts).'
  },
  {
    step: 2,
    title: 'Import ValidationModule',
    detail: 'Add ValidationModule.forRoot() and choose a display strategy for your UI framework.'
  },
  {
    step: 3,
    title: 'Annotate controls',
    detail: 'Add ngxValidator with validateModel, actualModel, withPolicy, and optional groupName.'
  },
  {
    step: 4,
    title: 'Evaluate on submit',
    detail: 'Call validationProvider.validateAll() or evaluatePolicies() to update badges and summaries.'
  }
];
}
