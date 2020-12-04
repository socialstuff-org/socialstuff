import { TestBed } from '@angular/core/testing';

import { CryptoStorageService } from './crypto-storage.service';

describe('CryptoStorageService', () => {
  let service: CryptoStorageService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CryptoStorageService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
