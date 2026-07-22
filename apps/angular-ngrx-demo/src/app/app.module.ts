import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { ReactiveFormsModule } from '@angular/forms';
import { StoreModule } from '@ngrx/store';
import { ValidationModule } from '@validation-rules/angular';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ReactiveFormsDemoComponent } from './pages/reactive-forms-demo/reactive-forms-demo.component';
import { StateDemoComponent } from './pages/state-demo/state-demo.component';
import { HomeComponent } from './pages/home/home.component';
import { demoFeatureKey, demoReducer } from './store/demo.reducer';
import { demoValidationProviders } from './validation/validation.providers';

@NgModule({
  declarations: [AppComponent, HomeComponent, StateDemoComponent, ReactiveFormsDemoComponent],
  imports: [
    BrowserModule,
    ReactiveFormsModule,
    AppRoutingModule,
    StoreModule.forRoot({ [demoFeatureKey]: demoReducer }),
    ValidationModule.forRoot({
      invalidClass: 'field-invalid',
      errorClass: 'field-error',
      errorContainerClass: 'field-error-container'
    })
  ],
  providers: [...demoValidationProviders],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  bootstrap: [AppComponent]
})
export class AppModule {}
