import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SampleFormComponent } from './components/sample-form/sample-form.component';
import { ComplexFormComponent } from './components/complex-form/complex-form.component';

const routes: Routes = [
  { path: 'sample-form', component: SampleFormComponent },
  { path: 'complex-form', component: ComplexFormComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
