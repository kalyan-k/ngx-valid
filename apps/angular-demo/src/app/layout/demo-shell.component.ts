import { Component } from '@angular/core';
import { DEMO_FRAMEWORKS } from '../demo/demo-framework.model';

interface NavItem {
  label: string;
  route: string;
  icon?: string;
  children?: { label: string; route: string }[];
}

@Component({
  selector: 'app-demo-shell',
  standalone: false,
  templateUrl: './demo-shell.component.html',
  styleUrls: ['./demo-shell.component.sass']
})
export class DemoShellComponent {
  readonly frameworks = DEMO_FRAMEWORKS;

  readonly navItems: NavItem[] = [
    { label: 'Home', route: '/' },
    {
      label: 'UI Framework Demos',
      route: '/demos',
      children: DEMO_FRAMEWORKS.map((framework) => ({
        label: framework.label,
        route: `/demos/${framework.id}`
      }))
    },
    { label: 'Library Docs', route: '/docs' }
  ];

  isFrameworksExpanded = true;
  currentYear = new Date().getFullYear();
}
