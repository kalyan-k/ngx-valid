import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { SampleFormComponent } from './components/sample-form/sample-form.component';
import { ComplexFormComponent } from './components/complex-form/complex-form.component';
import { ValidationModule } from 'core';

@NgModule({
  declarations: [
    AppComponent,
    SampleFormComponent,
    ComplexFormComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    ValidationModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
