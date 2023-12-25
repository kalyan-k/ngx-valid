import { TestBed } from '@angular/core/testing';

import { ValidationProviderService } from './validation-provider.service';

describe('ValidationProviderService', () => {
  let service: ValidationProviderService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ValidationProviderService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
