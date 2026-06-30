import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DemoShellComponent } from './layout/demo-shell.component';
import { HomeComponent } from './pages/home/home.component';
import { DocsComponent } from './pages/docs/docs.component';
import { FrameworkDemoComponent } from './pages/framework-demo/framework-demo.component';
import { provideDemoFrameworkDisplay } from './demo/demo-framework.providers';

const routes: Routes = [
  {
    path: '',
    component: DemoShellComponent,
    children: [
      { path: '', component: HomeComponent },
      { path: 'docs', component: DocsComponent },
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
      { path: 'demos', redirectTo: 'demos/bootstrap', pathMatch: 'full' },
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
