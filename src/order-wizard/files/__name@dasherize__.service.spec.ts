import { TestBed, inject } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { <%= classify(name) %>Service } from './<%= dasherize(name) %>.service';

describe('<%= classify(name) %>Service', () => {

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
      ],
      providers: [
        <%= classify(name) %>Service,
      ]
    });
  });

  it('should be created', inject([<%= classify(name) %>Service], (service: <%= classify(name) %>Service) => {
    expect(service).toBeTruthy();
  }));

});
