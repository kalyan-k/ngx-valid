import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { SampleFormComponent } from './components/sample-form/sample-form.component';
import { ComplexFormComponent } from './components/complex-form/complex-form.component';
import { ValidationModule } from 'core';
import { validationProviders } from './validation.providers';

@NgModule({
  declarations: [
    AppComponent,
    SampleFormComponent,
    ComplexFormComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    AppRoutingModule,
    ValidationModule.forRoot({
      framework: 'bootstrap',
      invalidClass: 'is-invalid',
      errorClass: 'invalid-feedback d-block',
      requiredMarkerClass: 'text-danger'
    })
  ],
  providers: [...validationProviders],
  bootstrap: [AppComponent]
})
export class AppModule { }
