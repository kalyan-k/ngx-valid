import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DemoShellComponent } from './layout/demo-shell.component';
import { HomeComponent } from './pages/home/home.component';
import { FrameworkDemoComponent } from './pages/framework-demo/framework-demo.component';
import { provideDemoFrameworkDisplay } from './demo/demo-framework.providers';
import { AngularStateDemoComponent } from './state-management/angular-state-demo.component';

const routes: Routes = [
  {
    path: '',
    component: DemoShellComponent,
    children: [
      { path: '', component: HomeComponent },
      {
        path: 'demos/bootstrap',
        component: FrameworkDemoComponent,
        data: { framework: 'bootstrap' },
        providers: provideDemoFrameworkDisplay('bootstrap')
      },
      {
        path: 'demos/material',
        component: FrameworkDemoComponent,
        data: { framework: 'material' },
        providers: provideDemoFrameworkDisplay('material')
      },
      {
        path: 'demos/tailwind',
        component: FrameworkDemoComponent,
        data: { framework: 'tailwind' },
        providers: provideDemoFrameworkDisplay('tailwind')
      },
      {
        path: 'state/:strategy',
        component: AngularStateDemoComponent,
        data: { page: 'overview' }
      },
      {
        path: 'state/:strategy/simple',
        component: AngularStateDemoComponent,
        data: { page: 'simple' }
      },
      {
        path: 'state/:strategy/complex',
        component: AngularStateDemoComponent,
        data: { page: 'complex' }
      },
      {
        path: 'state/:strategy/performance',
        component: AngularStateDemoComponent,
        data: { page: 'performance' }
      },
      { path: 'demos', redirectTo: 'demos/bootstrap', pathMatch: 'full' },
      { path: 'state', redirectTo: 'state/template-driven', pathMatch: 'full' },
      { path: 'reactive-forms', redirectTo: 'state/reactive-forms', pathMatch: 'full' },
      { path: 'sample-form', redirectTo: 'demos/bootstrap', pathMatch: 'full' },
      { path: 'complex-form', redirectTo: 'demos/bootstrap', pathMatch: 'full' },
      { path: 'performance-form', redirectTo: 'demos/bootstrap', pathMatch: 'full' }
    ]
  },
  { path: '**', redirectTo: '' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
