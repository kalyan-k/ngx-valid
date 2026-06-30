import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DEMO_FRAMEWORKS, DEMO_TABS, DemoFramework, DemoTab } from '../../demo/demo-framework.model';

@Component({
  selector: 'app-framework-demo',
  standalone: false,
  templateUrl: './framework-demo.component.html',
  styleUrls: ['./framework-demo.component.sass']
})
export class FrameworkDemoComponent implements OnInit {
  framework: DemoFramework = 'bootstrap';
  activeTab: DemoTab = 'sample';

  readonly tabs = DEMO_TABS;

  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.framework = this.route.snapshot.data['framework'] as DemoFramework;
  }

  get frameworkMeta() {
    return DEMO_FRAMEWORKS.find((item) => item.id === this.framework);
  }

  setTab(tab: DemoTab): void {
    this.activeTab = tab;
  }
}
