import { TestBed } from '@angular/core/testing';

import { KeyRegistryService } from './key-registry.service';

describe('KeyRegistryService', () => {
  let service: KeyRegistryService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(KeyRegistryService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
