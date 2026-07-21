import { NgModule } from '@angular/core';
import { RouterModule, type Routes } from '@angular/router';
import { ReactiveFormsDemoComponent } from './pages/reactive-forms-demo/reactive-forms-demo.component';
import { StateDemoComponent } from './pages/state-demo/state-demo.component';

const routes: Routes = [
  { path: '', redirectTo: 'state', pathMatch: 'full' },
  { path: 'state', component: StateDemoComponent },
  { path: 'reactive-forms', component: ReactiveFormsDemoComponent },
  { path: '**', redirectTo: 'state' }
];

@NgModule({ imports: [RouterModule.forRoot(routes)], exports: [RouterModule] })
export class AppRoutingModule {}
