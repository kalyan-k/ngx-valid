import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ValidatorDirective } from './directives/validator.directive';



@NgModule({
  declarations: [
    ValidatorDirective
  ],
  imports: [
    CommonModule
  ]
})
export class ValidationModule { }
