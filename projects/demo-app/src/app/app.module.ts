import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { DemoShellComponent } from './layout/demo-shell.component';
import { HomeComponent } from './pages/home/home.component';
import { DocsComponent } from './pages/docs/docs.component';
import { FrameworkDemoComponent } from './pages/framework-demo/framework-demo.component';
import { SampleFormComponent } from './components/sample-form/sample-form.component';
import { SampleFormMaterialComponent } from './components/sample-form/sample-form-material.component';
import { SampleFormTailwindComponent } from './components/sample-form/sample-form-tailwind.component';
import { ComplexFormComponent } from './components/complex-form/complex-form.component';
import { ComplexFormMaterialComponent } from './components/complex-form/complex-form-material.component';
import { ComplexFormTailwindComponent } from './components/complex-form/complex-form-tailwind.component';
import { PerformanceFormComponent } from './components/performance-form/performance-form.component';
import { PerformanceFormSectionComponent } from './components/performance-form/performance-form-section.component';
import { PerformanceFormErrorSummaryComponent } from './components/performance-form/performance-form-error-summary.component';
import { ValidationModule } from 'ngx-valid';
import { validationProviders } from './validation.providers';

@NgModule({
  declarations: [
    AppComponent,
    DemoShellComponent,
    HomeComponent,
    DocsComponent,
    FrameworkDemoComponent,
    SampleFormComponent,
    SampleFormMaterialComponent,
    SampleFormTailwindComponent,
    ComplexFormComponent,
    ComplexFormMaterialComponent,
    ComplexFormTailwindComponent,
    PerformanceFormComponent,
    PerformanceFormSectionComponent,
    PerformanceFormErrorSummaryComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    AppRoutingModule,
    MatButtonModule,
    MatCardModule,
    MatCheckboxModule,
    MatFormFieldModule,
    MatInputModule,
    MatRadioModule,
    MatSelectModule,
    ValidationModule.forRoot({
      invalidClass: 'is-invalid',
      errorClass: 'invalid-feedback d-block',
      errorContainerClass: 'ngx-valid-error-container',
      requiredMarkerClass: 'ngx-valid-required-marker text-danger'
    })
  ],
  providers: [...validationProviders],
  bootstrap: [AppComponent]
})
export class AppModule { }
