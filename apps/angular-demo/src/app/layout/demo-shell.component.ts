import { Component } from '@angular/core';
import { DEMO_FRAMEWORKS } from '../demo/demo-framework.model';
import { ANGULAR_STATE_PAGES, ANGULAR_STATE_STRATEGIES } from '../state-management/angular-state-demo.model';

@Component({
  selector: 'app-demo-shell',
  standalone: false,
  templateUrl: './demo-shell.component.html',
  styleUrls: ['./demo-shell.component.sass']
})
export class DemoShellComponent {
  readonly frameworks = DEMO_FRAMEWORKS;
  readonly stateStrategies = ANGULAR_STATE_STRATEGIES;
  readonly statePages = ANGULAR_STATE_PAGES;
  readonly docsUrl = 'http://127.0.0.1:4201/docs/angular';
  isFrameworksExpanded = true;
  isStateExpanded = true;
  currentYear = new Date().getFullYear();
}
