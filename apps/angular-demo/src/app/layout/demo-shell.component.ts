import { Component } from '@angular/core';
import { DEMO_FRAMEWORKS } from '../demo/demo-framework.model';

@Component({
  selector: 'app-demo-shell',
  standalone: false,
  templateUrl: './demo-shell.component.html',
  styleUrls: ['./demo-shell.component.sass']
})
export class DemoShellComponent {
  readonly frameworks = DEMO_FRAMEWORKS;
  readonly docsUrl = 'http://127.0.0.1:4201/docs/angular';
  isFrameworksExpanded = true;
  currentYear = new Date().getFullYear();
}
