import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import {
  MatButtonModule, MatCardModule, MatDatepickerModule, MatFormFieldModule,
  MatInputModule, MatNativeDateModule, MatSelectModule, MatStepperModule
} from '@angular/material';

import { <%= classify(name) %>Component } from './<%= dasherize(name) %>.component';
import { <%= classify(name) %>Service } from './<%= dasherize(name) %>.service';


@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatCardModule,
    MatDatepickerModule,
    MatFormFieldModule,
    MatInputModule,
    MatNativeDateModule,
    MatSelectModule,
    MatStepperModule,
  ],
  declarations: [<%= classify(name) %>Component],
  providers: [<%= classify(name) %>Service]
})
export class <%= classify(name) %>Module { }
