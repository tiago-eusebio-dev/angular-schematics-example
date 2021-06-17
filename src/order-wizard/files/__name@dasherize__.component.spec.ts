import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { MatCardModule, MatStepperModule,MatFormFieldModule, MatInputModule, MatDatepickerModule, MatNativeDateModule } from '@angular/material';

import { classify(name) %>Component } from './<%= dasherize(name) %>.component';

describe('classify(name) %>Component', () => {
  let component: classify(name) %>Component;
  let fixture: ComponentFixture<classify(name) %>Component>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        NoopAnimationsModule,
        ReactiveFormsModule,
        MatCardModule,
        MatDatepickerModule,
        MatFormFieldModule,
        MatInputModule,
        MatNativeDateModule,
        MatStepperModule,
      ],
      declarations: [
        classify(name) %>Component,
      ]
    })
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(classify(name) %>Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
