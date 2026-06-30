import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SampleFormComponent } from './components/sample-form/sample-form.component';
import { ComplexFormComponent } from './components/complex-form/complex-form.component';
import { PerformanceFormComponent } from './components/performance-form/performance-form.component';

const routes: Routes = [
  { path: '', redirectTo: 'sample-form', pathMatch: 'full' },
  { path: 'sample-form', component: SampleFormComponent },
  { path: 'complex-form', component: ComplexFormComponent },
  { path: 'performance-form', component: PerformanceFormComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
